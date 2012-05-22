function crap()
{
	var oMyPriority = Components.classes['@mozillazine.org/myapp/priority;1'].createInstance(Components.interfaces.nsISupportsPriority);
	oMyPriority.adjustPriority(10);
}
