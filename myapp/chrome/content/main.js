function cmdArguments()
{
	
}


function config()
{
	this.cmd_args = window.arguments[0].QueryInterface(Components.interfaces.nsICommandLine);
	this.tmp_rel_path = "../www/xulrunner-app-grab-preview/myapp/tmp";
}



var conf = new config();

function app()
{
	this.url = "";	
}

var this_app = new app();

function snapThat()
{
	this_app.url = conf.cmd_args.handleFlagWithParam("args",false);
	this_app.
	//printWithCanvas();
}

function outputFilePath(aMode) {
  var path = (window.arguments && window.arguments[2])?
               window.arguments[2] : "";
  if (path)
    return path;

  var prefs = Components.classes["@mozilla.org/preferences;1"]
                        .getService(Components.interfaces.nsIPrefBranch);
  	
  var fileLeaf = "";
  try {
    fileLeaf = prefs.getComplexValue("extensions.cmdlnprint.basefilename",
                                      Components.interfaces.nsISupportsString)
                    .data;
    if (!fileLeaf)
      fileLeaf = "snapshot.%EXT%";
      
    var title = getBrowser().contentDocument.title;
    if (title.length > 32)
      title = title.substring(0, 32);

    fileLeaf = fileLeaf.replace("%HOST%", getBrowser().currentURI.host);
    fileLeaf = fileLeaf.replace("%TITLE%", title);
    fileLeaf = fileLeaf.replace("%DATE%", dateString());

    var ext = "dat";

    switch (aMode) {
    case 1:
      ext = "pdf";
      break;
    case 2:
      ext = "png";
      break;
    case 3:
      ext = "ps";
      break;
    }

    fileLeaf = fileLeaf.replace("%EXT%", ext);

    /* forbidden letters, as title can be contain any letters. */
    while (/[\\\/\:\?\*\"\<\>\|]/.test(fileLeaf))
      fileLeaf = fileLeaf.replace(/[\\\/\:\?\*\"\<\>\|]/g, "_");

  }
  catch(e) {
    fileLeaf = "foo";
  }

  var file = Components.classes["@mozilla.org/download-manager;1"]
                       .getService(Components.interfaces.nsIDownloadManager)
                       .userDownloadsDirectory;
  file.append(fileLeaf);
  return file.path;
}


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
  savePNG(canvas, outputFilePath(2));
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

function delayedShutdown() {
  window.setTimeout(window.close, 100);
}

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