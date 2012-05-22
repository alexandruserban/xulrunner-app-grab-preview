const COMPONENT_CONTRACTID = "@forums.mozillazine.org/development/cmdlnprint;1";
const COMPONENT_CID = Components.ID("{80edd604-4028-4c89-a1c1-6e1f25bfa5a2}");
const COMPONENT_PRETTY_NAME = "Print Command Handler";
const COMPONENT_CATEGORY_ENTRY = "m-printjob";
const err_log = function(err){Components.utils.reportError(err);};
err_log("asdasadasdasdasdasdasd");
function openWindow(aParent, aURL, aTarget, aFeatures, aArgs) {
  var args = Components.classes["@mozilla.org/supports-array;1"]
                       .createInstance(Components.interfaces.nsICollection);

  while (aArgs && aArgs.length > 0) {
    var arg = aArgs.shift();

    var argstring =
      Components.classes["@mozilla.org/supports-string;1"]
                .createInstance(Components.interfaces.nsISupportsString);

    argstring.data = arg? arg : "";

    args.AppendElement(argstring);
  }

  return Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                   .getService(Components.interfaces.nsIWindowWatcher)
                   .openWindow(aParent, aURL, aTarget, aFeatures, args);

}

function resolveURIInternal(aCmdLine, aArgument) {
  var uri = aCmdLine.resolveURI(aArgument);

  if (!(uri instanceof Components.interfaces.nsIFileURL))
    return uri;

  try {
    if (uri.file.exists())
      return uri;
  }
  catch (e) {
    Components.utils.reportError(e);
  }

  // We have interpreted the argument as a relative file URI, but the file
  // doesn't exist. Try URI fixup heuristics: see bug 290782.

  try {
    var urifixup = Components.classes["@mozilla.org/docshell/urifixup;1"]
                             .getService(Components.interfaces.nsIURIFixup);

    uri = urifixup.createFixupURI(aArgument, 0);
  }
  catch (e) {
    Components.utils.reportError(e);
  }

  return uri;
}

function resolvePathInternal(aCmdLine, aArgument) {
  var file = null;

  if (aArgument)
    file = aCmdLine.resolveFile(aArgument);

  return (file)? file.path : null;
}

function resolveModeInternal(aArgument) {
  var mode = -1;

  if (aArgument) {
    aArgument = aArgument.toString().toLowerCase();
    switch (aArgument) {
    case "1":
    case "pdf":
      mode = 1;
      break;
    case "2":
    case "png":
      mode = 2;
      break;
    case "3":
    case "ps":
    case "postscript":
      mode = 3;
      break;
    case "0":
    case "printer":
      mode = 0;
      break;
    default:
      mode = -1;
    }
  }
  return mode;
}

var gComponent = {

  /* nsICommandLineHandler */
  handle : function comp_hadle(aCmdLine) {
  
    var param = aCmdLine.handleFlagWithParam("print", false);
    if (!param)
      return;

    var uri = resolveURIInternal(aCmdLine, param);

    if (uri) {
      aCmdLine.preventDefault = true;

      param = aCmdLine.handleFlagWithParam("printmode", false);
      var mode = resolveModeInternal(param);

      param = aCmdLine.handleFlagWithParam("printfile", false);
      var path = resolvePathInternal(aCmdLine, param);

      param = aCmdLine.handleFlagWithParam("printdelay", false);
      var delay = 0;
      if (param && !isNaN(param))
        delay = parseInt(param).toString();

      param = aCmdLine.handleFlagWithParam("printprinter", false);
      var printer = param;
      
      openWindow(null, "chrome://cmdlnprint/content/mininav.xul", "_blank",
                 "chrome,dialog=no,all",
                [uri.spec, mode.toString(), path, delay, printer]);
    }
  },

  /* I wonder this helpInfo can be of any help...? */
  helpInfo :
    "  -print <URL>            Start printing job.\n" +
    "  -printmode <mode>       0:printer, 1: PDF, 2: PNG, 3: PS.\n" +
    "  -printfile <path>       a hint when printing into PDF/PNG file.\n" +
    "  -printdelay <sec>       duration to start printing job.",
  /* nsISupports */
  QueryInterface : function comp_qi(aIID) {
    if (!aIID.equals(Components.interfaces.nsISupports) &&
        !aIID.equals(Components.interfaces.nsICommandLineHandler) &&
        !aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NO_INTERFACE;

    return this;
  },

  /* nsIFactory */
  createInstance: function comp_ci(aOuter, aIID) {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;

    return this.QueryInterface(aIID);
  },

  lockFactory : function comp_lf(aLock) {}
};

var gModule = {
  /* nsISupports */
  QueryInterface: function mod_QI(aIID) {
    if (aIID.equals(Components.interfaces.nsIModule) ||
        aIID.equals(Components.interfaces.nsISupports))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  /* nsIModule */
  getClassObject: function mod_getco(compMgr, cid, iid) {
    if (cid.equals(COMPONENT_CID))
      return gComponent.QueryInterface(iid);

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  registerSelf: function mod_reg(aCompMgr, aFileSpec, aLocation, aType) {
    aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar)
            .registerFactoryLocation(COMPONENT_CID, COMPONENT_PRETTY_NAME,
                                     COMPONENT_CONTRACTID,
                                     aFileSpec, aLocation, aType );

    Components.classes["@mozilla.org/categorymanager;1"]
              .getService(Components.interfaces.nsICategoryManager)
              .addCategoryEntry("command-line-handler",
                                COMPONENT_CATEGORY_ENTRY,
                                COMPONENT_CONTRACTID, true, true);
  },

  unregisterSelf : function mod_unreg(aCompMgr, aLocation, aType) {
    aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar)
            .unregisterFactoryLocation(COMPONENT_CID, aLocation);

    Components.classes["@mozilla.org/categorymanager;1"]
              .getService(Components.interfaces.nsICategoryManager)
              .deleteCategoryEntry("command-line-handler",
                                   COMPONENT_CATEGORY_ENTRY, true);
  },

  canUnload: function(compMgr) {
    return true;
  }
};

// NSGetModule: Return the nsIModule object.
function NSGetModule(compMgr, fileSpec) {
  return gModule;
}
