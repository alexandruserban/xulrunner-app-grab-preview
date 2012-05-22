pref("extensions.cmdlnprint.mode", 0);
pref("toolkit.defaultChromeURI", "chrome://myapp/content/main.xul");
pref("browser.cache.disk.enable", false);
/* reload xpcom comp */
pref("xpinstall.dialog.confirm", "chrome://mozapps/content/xpinstall/xpinstallConfirm.xul");
pref("xpinstall.dialog.progress.skin", "chrome://mozapps/content/extensions/extensions.xul?type=themes");
pref("xpinstall.dialog.progress.chrome", "chrome://mozapps/content/extensions/extensions.xul?type=extensions");
pref("xpinstall.dialog.progress.type.skin", "Extension:Manager-themes");
pref("xpinstall.dialog.progress.type.chrome", "Extension:Manager-extensions");
pref("extensions.update.enabled", true);
pref("extensions.update.interval", 86400);
pref("extensions.dss.enabled", false);
pref("extensions.dss.switchPending", false);
pref("extensions.ignoreMTimeChanges", false);
pref("extensions.logging.enabled", false);
pref("general.skins.selectedSkin", "classic/1.0");
// NB these point at AMO
pref("extensions.update.url", "chrome://mozapps/locale/extensions/extensions.properties");
pref("extensions.getMoreExtensionsURL", "chrome://mozapps/locale/extensions/extensions.properties");
pref("extensions.getMoreThemesURL", "chrome://mozapps/locale/extensions/extensions.properties");
//DEBUG
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);
/*
   When the mode is either PDF or PNG, and -printfile was not set,

   %EXT% is a file extension, either "pdf" or "png", which
   depends on the mode; -printmode param or "extensions.cmdlnprint.mode".

   %DATE% is "YYYYMMDD-hhmmss+TIMZONE"

   %HOST% is host of target URI. Note that the target may be redirected.
   so %HOST% is not always equals to the URI you specified with -print command.
 */
pref("extensions.cmdlnprint.basefilename",
     "%TITLE%@%HOST%_%DATE%.%EXT%");
