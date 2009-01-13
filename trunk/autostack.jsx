/////////////////// 
/// Name: Auto stacking files 
/// Description: This script enable auto stacking files by name 
/// Author: Tyzhnenko Dmitry 
/// E-mail: t.dmitry@gmail.com 
/// Version: 0.32 
/////////////////// 

/* 
@@@START_XML@@@ 
<?xml version="1.0" encoding="UTF-8"?> 
<ScriptInfo xmlns:dc="http://purl.org/dc/elements/1.1/" xml:lang="en_US"> 
     <dc:title>Auto stacking files</dc:title> 
     <dc:description>This script enable auto stacing files by name function</dc:description> 
</ScriptInfo> 
@@@END_XML@@@ 
*/

function AutomaticStackingFiles() 
{ 
	/** 
	The context in which this snippet can run; Bridge must be running. 
	@type String 
	*/ 
	this.requiredContext = "\tAdobe Bridge CS3 must be running.\n\tExecute against Bridge CS3 as the Target.\n"; 
	$.level = 1; // Debugging level 

	this.version = "0.32"; 
	this.author = "Tyzhenenko Dmitry"; 

	/** 
	The unique identifier for the new menu item command 
	@type String 
	*/ 
	//this.menuID = "AutoStackFiles"; 
	this.menuCommandID = "GoAutoStackingFiles"; 

} 

function RunAutoStacking() 
{ 
	var doc = app.document; 
	var thumb = doc.thumbnail; 
	var vthumb = doc.visibleThumbnails; 
	var currSort = doc.sorts; 



	function StackPhoto() 
	{ 
		doc.chooseMenuItem('submenu/Stack'); 
		doc.chooseMenuItem('StackGroup'); 
	} 

	function CollapseStacks() 
	{ 
		doc.chooseMenuItem('submenu/Stack'); 
		doc.chooseMenuItem('CollapseAllStacks'); 
	} 

	function getFileExt( t) 
	{ 
		var dot = t.name.lastIndexOf ('.'); 
		return t.name.substr(dot,t.name.length); 
	} 

	function getFileName( t) 
	{ 
		var dot = t.name.lastIndexOf ('.'); 
		return t.name.substr(0, dot); 
	} 

	CollapseStacks(); 

	var SortObj = {}; 
	SortObj.name = "name"; 
	SortObj.type = "string"; 
	SortObj.reverse = false; 
	var SortsArray = []; 
	SortsArray.push(SortObj); 
	doc.sorts = SortsArray; 

	for (var len = 0; len < vthumb.length; len++ ) 
	{ 
		doc.deselectAll(); 
		doc.select(vthumb[len]); 
		doc.reveal(vthumb[len]); 
		for ( var k = len+1; k < vthumb.length; k++ ) 
		{ 
			//alert(k); 
			if ( getFileName( vthumb[len] ) == getFileName( vthumb[k]) ) 
				doc.select(vthumb[k]); 
			else 
			{ 
				if (doc.selectionLength > 1) 
					StackPhoto(); 
				break; 
			} 
			if (k == vthumb.length-1) 
			{ 
				if (doc.selectionLength > 1) 
				StackPhoto(); 
			} 

		//if (doc.selectionLength > 1) 
		// StackPhoto(); 
		} 
		//delete vthumb; 
		//var 
		//vthumb = @doc.visibleThumbnails; 
	} 

	doc.sorts = currSort; 
	doc.reveal(doc.visibleThumbnails[0]); 

	delete currSort; 
	delete vthumb; 
	delete thumb; 
	delete doc; 

} 

AutomaticStackingFiles.prototype.run = function() 
{ 
	var retval = true; 
	if(!this.canRun()) { 
		retval = false; 
		return retval; 
	} 
	//app.document.chooseMenuItem('submenu/Stack'); 
	var AutoStackCommand = new MenuElement("command", "Auto stacking", "at the beginning of submenu/Stack", ); 
	AutoStackCommand.onSelect = function(m) 
	{ 
		//alert('start'); 
		RunAutoStacking(); 
		//alert('stop'); 
	} 
} 

AutomaticStackingFiles.prototype.canRun = function() 
{ 
	// Must run in Bridge 
	if(BridgeTalk.appName == "bridge") 
	{ 
		// Stop the menu element from being added again if the snippet has already run 
		if(MenuElement.find(this.menuCommandID)) 
		{ 
			$.writeln("ERROR:: Menu element from AutoStackFiles already exists!\nRestart Bridge to run this snippet again."); 
			return false; 
		} 
	return true; 
	} 
	// Fail if these preconditions are not met. 
	// Bridge must be running, 
	// The menu must not already exist. 
	$.writeln("ERROR:: Cannot run AutomaticStackingFiles"); 
	$.writeln(this.requiredContext); 
	return false; 
} 

if(typeof(AutomaticStackingFiles_unitTest) == "undefined") { 
    new AutomaticStackingFiles().run(); 
}
