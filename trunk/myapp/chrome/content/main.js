

function args()
{ 
	this._args = window.arguments[0].QueryInterface(Components.interfaces.nsICommandLine);
	this.getArg = function(arg)
	{
		var arg = this._args.handleFlagWithParam(arg,false);	
		return (arg != -1)?arg:null;
	}	
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
	
		// if(c == "2152398854" && d.indexOf())//transfering data
		// {
			// var da = new Date();
			// if(parseInt(da.getTime()-start_time) > wait_time)
			// {
				// printWithCanvas();
			// }
		// }
	},
	onSecurityChange : function(a,b,c){},
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
	
var gg_args = new args();
//const nsIWebProgressListener = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsIWebProgressListener);
var tmp_rel_path = "D:\\workspace\\wamp\\www\\xulrunner-app-grab-preview\\myapp\\tmp";
var wait_time = 10000*gg_args.getArg("time");//wait 10 seconds for the page to load

function app()
{ 
	this.g_args = gg_args;
	this._url = this.g_args.getArg("url");
	this._width = this.g_args.getArg("width");
	this._height = this.g_args.getArg("height");
}

app.prototype = 
{
	_url: null,
	getUrl: function(){ return this._url;},
	setUrl: function(val){ this._url = val;},
	getWidth: function(){ return this._width;},
	setWidth: function(val){ this._width = val;},
	getHeight: function(){ return this._height;},
	setHeight: function(val){ this._height = val;}	
}

var this_app = new app();
var start_date = new Date();
var start_time = start_date.getTime();

function snapThat()
{
	getBrowser().loadURI(this_app.getUrl());
	window.resizeTo(this_app.getWidth(),this_app.getHeight());
	setTimeout(printWithCanvas,wait_time);
	//getBrowser().addProgressListener(progressListener)
}

function outputFilePath() {
	
	var fileLeaf = this_app.getUrl()+"_"+start_date.getTime()+".png";
	while (/[\\\/\:\?\*\"\<\>\|]/.test(fileLeaf))
	fileLeaf = fileLeaf.replace(/[\\\/\:\?\*\"\<\>\|]/g, "_");
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
}

function getBrowser() {
  return document.getElementById("content");
}