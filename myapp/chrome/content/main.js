function args()
{ 
	this._args = window.arguments[0].QueryInterface(Components.interfaces.nsICommandLine);
	this.getArg = function(arg)
	{
		var arg = this._args.handleFlagWithParam(arg,false);	
		return (arg != -1)?arg:null;
	}	
}

function getHostname(str) {
	var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
	return str.match(re)[1].toString();
}

var progressListener = { 
	stateIsRequest:false,
	QueryInterface : function(aIID) {
		if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
			aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
			aIID.equals(Components.interfaces.nsISupports))
				return this;
		throw Components.results.NS_NOINTERFACE;
	},
	onStateChange : function(aProgress,aRequest,aFlag,aStatus) 
	{ 	
		
		return 0;
	},

	onLocationChange : function(aProgress,aRequest,aLocation) {
		return 0;
	},
	onProgressChange : function(a,b,c,d,e,f){},
	onStatusChange : function(a,b,c,d){ 
		page_loading++;
	},
	onSecurityChange : function(a,b,c){page_loading++},
	onLinkIconAvailable : function(a){} 
};

function printWithCanvas() {
  var canvas = document.createElementNS("http://www.w3.org/1999/xhtml",
                                        "canvas");

  var canvasWidth = content.scrollMaxX + content.innerWidth;
  var canvasHeight = content.scrollMaxY + content.innerHeight;

  /*
     Remove offset from scrollbar width.

     17px on WindowsXP, but this may depends on client theme or something.
     I guess the real width would be 16, plus extra 1px border for drop-
     -shadow.
     XXX FIX ME!
   */
  if (content.scrollMaxX)
    canvasHeight -= 17;

  if (content.scrollMaxY)
    canvasWidth -= 17;

  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;


  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  ctx.scale(1, 1);
  ctx.drawWindow(content, 0, 0, canvasWidth, canvasHeight,
                 "rgb(128,128,128)");
  ctx.restore();
//  document.documentElement.appendChild(canvas);
  savePNG(canvas, outputFilePath());
}


function pageLoading()
{
	middle_time = new Date();middle_time=middle_time.getTime();
	if(page_loaded == page_loading || middle_time-start_time>wait_time)
	{
		page_completed_loading = true;
		clearTimeout(check_if_page_completed_loading);
		printWithCanvas();
	}
	else
	{	
		page_loaded = page_loading;
		check_if_page_completed_loading = setTimeout("pageLoading()",wait_time_recall);
	}	
}

var middle_time = {};
var end_time = {};
var wait_time_recall = 2500;
var check_if_page_completed_loading = setTimeout("pageLoading()",wait_time_recall);
var page_loading = 0;	
var page_loaded = 0;	
var page_completed_loading = false;	
var gg_args = new args();
var tmp_rel_path = "D:\\web thingies\\wamp\\www\\xulrunner-app-grab-preview\\myapp\\tmp";
var wait_time = 60000;

function app()
{ 
	this.g_args = gg_args;
	this._url = this.g_args.getArg("url");
	this._width = this.g_args.getArg("width");
	this._height = this.g_args.getArg("height");
	this._name = this.g_args.getArg("name");
}

app.prototype = 
{
	_url: null,
	getUrl: function(){ return this._url;},
	setUrl: function(val){ this._url = val;},
	getWidth: function(){ return this._width;},
	setWidth: function(val){ this._width = val;},
	getHeight: function(){ return this._height;},
	setHeight: function(val){ this._height = val;},	
	getName: function(){ return this._name;}	
}

var this_app = new app();
var start_date = new Date();
var start_time = start_date.getTime();

function snapThat()
{
	getBrowser().loadURI(this_app.getUrl());
	window.resizeTo(this_app.getWidth(),this_app.getHeight());
	//setTimeout(printWithCanvas,wait_time);
	getBrowser().addProgressListener(progressListener)
}

function outputFilePath() {
	
	var fileLeaf = this_app.getName();
	if(!fileLeaf)
	{
		fileLeaf = this_app.getUrl()+"_"+start_date.getTime()+".png";
		while (/[\\\/\:\?\*\"\<\>\|]/.test(fileLeaf))
		fileLeaf = fileLeaf.replace(/[\\\/\:\?\*\"\<\>\|]/g, "_");
	}
	
	var path = tmp_rel_path+"\\"+fileLeaf;  
	return path;
}


function delayedShutdown() {
  window.close();
}
	
var gPrintProgressListener = {
  onStateChange : function (aWebProgress,
                            aRequest,
                            aStateFlags,
                            aStatus) {
    delayedShutdown();
  },

  onProgressChange : function (aWebProgress,
                               aRequest,
                               aCurSelfProgress,
                               aMaxSelfProgress,
                               aCurTotalProgress,
                               aMaxTotalProgress){},
  onLocationChange : function (aWebProgress,
                               aRequest,
                               aLocation){},

  onStatusChange : function (aWebProgress,
                             aRequest,
                             aStatus,
                             aMessage){},
  onSecurityChange : function (aWebProgress,
                               aRequest,
                               aState){},

  /* nsISupports */
  QueryInterface : function progress_qi(aIID) {
    if (!aIID.equals(Components.interfaces.nsISupports) &&
        !aIID.equals(Components.interfaces.nsIWebProgressListener))
      throw Components.results.NS_ERROR_NO_INTERFACE;

    return this;
  }
};

function savePNG(aCanvas, aPath) {
  var file = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
  file.initWithPath(aPath);

  var io = Components.classes["@mozilla.org/network/io-service;1"]
                     .getService(Components.interfaces.nsIIOService);
  var source = io.newURI(aCanvas.toDataURL("image/png", ""), null, null);
  var target = io.newFileURI(file);
    
  // prepare to save the canvas data
  var persist =
    Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
              .createInstance(Components.interfaces.nsIWebBrowserPersist);
  
  persist.persistFlags = 
    Components.interfaces.nsIWebBrowserPersist
              .PERSIST_FLAGS_REPLACE_EXISTING_FILES |
    Components.interfaces.nsIWebBrowserPersist
              .PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
			
  persist.progressListener = gPrintProgressListener;
  persist.saveURI(source, null, null, null, null, file);
  end_time = new Date();end_time=end_time.getTime();
  //alert(end_time-start_time);
}

function getBrowser() {
  return document.getElementById("content");
}



/* logging */
function writeToLog(data) {
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
	file.initWithPath("D:\\web thingies\\wamp\\www\\xulrunner-app-grab-preview\\myapp\\log\\log.txt");
	
	if ( file.exists() == false ) {
		  alert("File does not exist");
	}
	
	foStream.init(file, 0x02 | 0x10, 00666, 0);
	foStream.write(data,data.length);
	foStream.close();

}