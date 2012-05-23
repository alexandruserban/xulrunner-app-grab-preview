const Cc = Components.classes;  
const Ci = Components.interfaces;  
const err_log = function(err){Components.utils.reportError(err);};
  
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");  
Components.utils.import("resource://gre/modules/Services.jsm");  
  
// CHANGEME: to the chrome URI of your extension or application  
const CHROME_URI = "chrome://myapp/content/";  
  
/** 
 * Utility functions 
 */  
  
/** 
 * Opens a chrome window. 
 * @param aChromeURISpec a string specifying the URI of the window to open. 
 * @param aArgument an argument to pass to the window (may be null) 
 */  
function openWindow(aChromeURISpec, aArgument)  
{  
  Services.ww.openWindow(null, aChromeURISpec, "_blank",  
                "chrome,menubar,toolbar,status,resizable,dialog=no",  
                aArgument);  
}  
  
// Command Line Handler  
function CommandLineHandler() {  
};  
  
CommandLineHandler.prototype = {  
  classDescription: "myAppHandler",  
  // CHANGEME: generate a unique ID  
  classID: Components.ID('{2991c315-b871-42cd-b33f-bfee4fcbf682}'),  
  // CHANGEME: change the type in the contractID to be unique to your application  
  contractID: "@mozilla.org/commandlinehandler/general-startup;1?type=myapp",  
  _xpcom_categories: [{  
    category: "command-line-handler",  
    // CHANGEME:  
    // category names are sorted alphabetically. Typical command-line handlers use a  
    // category that begins with the letter "m".  
    entry: "m-myapp"  
  }],  
  
  QueryInterface: XPCOMUtils.generateQI([  
    Ci.nsICommandLineHandler  
  ]),  
  
  /* nsICommandLineHandler */  
  handle : function clh_handle(cmdLine)  
  {  
    try {  
      // CHANGEME: change "viewapp" to your command line flag that takes an argument  
      var uristr = cmdLine.handleFlagWithParam("viewapp", false);  
      if (uristr) {  
        // convert uristr to an nsIURI  
        var uri = cmdLine.resolveURI(uristr);  
        openWindow(CHROME_URI, uri);  
        cmdLine.preventDefault = true;  
      }  
    }  
    catch (e) {  
      Components.utils.reportError("incorrect parameter passed to -viewapp on the command line.");  
    }  
  
    // CHANGEME: change "myapp" to your command line flag (no argument)  
    if (cmdLine.handleFlag("myapp", false)) {  
      openWindow(CHROME_URI, null);  
      cmdLine.preventDefault = true;  
    }  
  },  
  
  // CHANGEME: change the help info as appropriate, but  
  // follow the guidelines in nsICommandLineHandler.idl  
  // specifically, flag descriptions should start at  
  // character 24, and lines should be wrapped at  
  // 72 characters with embedded newlines,  
  // and finally, the string should end with a newline  
  helpInfo : "  -myapp               Open My Application\n" +  
             "  -viewapp <uri>       View and edit the URI in My Application,\n" +  
             "                       wrapping this description\n"  
};  
  
var NSGetFactory = XPCOMUtils.generateNSGetFactory([CommandLineHandler]); 