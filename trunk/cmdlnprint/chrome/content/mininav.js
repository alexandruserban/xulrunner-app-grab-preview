var gLocked = false;
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

// See http://developer.mozilla.org/en/docs/Code_snippets:Canvas

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

function startup() {
  getBrowser().addEventListener("pageshow", onPrintPageShow, false);
  
  var uri = (window.arguments)? window.arguments[0] : "";

  if (uri){
    try {
      getBrowser().loadURI(uri);
    }
    catch (e) {
      /* print error page, if possible */
      window.setTimeout(onPrintPageShow, 100);
    }
  }
  else
    delayedShutdown();

  /* Force killing process, if printing flow stoped for some reason,
     e.g. a network error prevents pageshow events from firing. */
  window.setTimeout(window.close, 3*60*1000);
}

function dateString() {
  var d = new Date();
  var tz = d.getTimezoneOffset() * -1;

  function ensureFormat(aDec) {
    return (aDec < 10)? "0" + aDec : aDec.toString();
  }

  var tzISO = "";
  if (tz < 0) {
    tz *= -1;
    tzISO += "-";
  }
  else
    tzISO += "+";

  tzISO += ensureFormat(tz/60) + ensureFormat(tz%60);
  
  return d.getFullYear().toString() +
         ensureFormat(d.getMonth() + 1) +
         ensureFormat(d.getDate()) + "-" +
         ensureFormat(d.getHours())+
         ensureFormat(d.getMinutes()) +
         ensureFormat(d.getSeconds()) + tzISO;
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

function printmode() {
  var mode = (window.arguments && window.arguments[1])?
               parseInt(window.arguments[1]) : 0;

  if (mode < 0) {
    var prefs = Components.classes["@mozilla.org/preferences;1"]
                          .getService(Components.interfaces.nsIPrefBranch);
    try {
      mode = prefs.getIntPref("extensions.cmdlnprint.mode");
    }
    catch (e) {
      mode = 0;
    }
  }

  return mode;
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

function onPrintPageShow() {

  if (window.arguments && window.arguments[3]) {
    var delay = parseInt(window.arguments[3]);
    if (delay < 0)
      delay = 0;
    if (delay > 120)
      delay = 120;
    setTimeout(delayedPrintPageShow, delay * 1000);
  }
  else
    delayedPrintPageShow();
}

function delayedPrintPageShow() {
  if (gLocked)
    return;
  else
    gLocked = true;

  var mode = printmode();

  if (mode == 2) {
    /*
       Note: What we really should do is listen to "EndDocumentLoad" event, 
       as well as ROC's sample.
       http://weblogs.mozillazine.org/roc/archives/2005/05/rendering_web_p.html
       According to browser.js, EndDocumentLoad is in the same flow as
       nsIWebProgressListener::onStateChange.
     */
    setTimeout(printWithCanvas, 100);
    return;
  }

  /* printing API */
  var webBrowserPrint =
    content.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
           .getInterface(Components.interfaces.nsIWebBrowserPrint);

  var printSettingsService =
    Components.classes["@mozilla.org/gfx/printsettings-service;1"]
              .getService(Components.interfaces.nsIPrintSettingsService);

  /* sigh, layout needs printPreview for currentPrintSettings.  */
  // var settings = webBrowserPrint.currentPrintSettings;
  var settings = printSettingsService.newPrintSettings;

  var printerName = printSettingsService.defaultPrinterName;

  if (window.arguments && window.arguments[4] &&
      window.arguments[4] != printerName) {
    if (mode == 0) {
      /* Check whether the printer name specified by an argument is valid. */
      var list =
        Components.classes["@mozilla.org/gfx/printerenumerator;1"]
                  .getService(Components.interfaces.nsIPrinterEnumerator)
                  .printerNameList;
      while (list.hasMore()) {
        if (window.arguments[4] == list.getNext()) {
          printerName = window.arguments[4];
          break;
        }
      }
    }
    else
      printerName = window.arguments[4];
  }

  switch (mode) {
  case 0:
    printSettingsService.initPrintSettingsFromPrinter
      (printerName, settings);

    printSettingsService.initPrintSettingsFromPrefs
      (settings, true, Components.interfaces.nsIPrintSettings.kInitSaveAll);
    break;
  case 1:
  case 3:
    /*
       There's no way to set *global* settings in Firefox 3.0.
       I'm not too sure why, but UI is gone. This is not rendering bug,
       but browser (or toolkit) bug.
       So copy from default printer settings.
     */
    settings.printerName = printerName;

    /* We have no interest on those other than prefs. */
    printSettingsService.initPrintSettingsFromPrefs
      (settings, true, Components.interfaces.nsIPrintSettings.kInitSaveAll);

    settings.printerName = null;

    /* settings for PDF. */
    settings.printToFile = true;
    settings.toFileName = outputFilePath(mode);

    settings.outputFormat = (mode == 1)?
      Components.interfaces.nsIPrintSettings.kOutputFormatPDF:
      Components.interfaces.nsIPrintSettings.kOutputFormatPS;
    break;
  default:
    /* Unkown mode. Can it go on? */
    return;
  }
  settings.printSilent = true;
  webBrowserPrint.print(settings, gPrintProgressListener);
}

function delayedShutdown() {
  //window.setTimeout(window.close, 100);
}

function getBrowser() {
  return document.getElementById("content");
}