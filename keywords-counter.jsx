/////////////////// 
/// Name: Keyword counter
/// Description: This script show tatal keywords in file 
/// Author: Tyzhnenko Dmitry 
/// E-mail: t.dmitry@gmail.com 
/// Version: 0.4
/////////////////// 
/*
	Changelog
	0.4
	 - add show filename
	 - add save metadata
	 - add todo sections
	0.3:
	 - add Title view
	 - add Descrition view
	 - rewrite code with refs
	0.2:
	 - move from navbars to KeywordPalette
	 - create new Tab Panel -- KeywordPallete
	 - start changelog
	0.1:
	 - initial version
*/
/*
	TODO:
	sync metadata with few files
*/

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

function KeywordCounter() 
{ 
	/** 
	The context in which this snippet can run; Bridge must be running. 
	@type String 
	*/ 
	this.requiredContext = "\tAdobe Bridge CS4 must be running.\n\tExecute against Bridge CS4 as the Target.\n"; 
	//$.level = 5; // Debugging level 

	this.version = "0.1"; 
	this.author = "Tyzhenenko Dmitry"; 

	$.debug = 5;
} 
	
KeywordCounter.prototype.run = function() 
{ 
	var retval = true; 
	if(!this.canRun()) { 
		retval = false; 
		return retval; 
	} 

	if( xmpLib == undefined ) 
	{
		if( Folder.fs == "Windows" )
		{
			var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.dll";
		} 
		else 
		{
			var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.framework";
		}
	
		var libfile = new File( pathToLib );
		var xmpLib = new ExternalObject("lib:" + pathToLib );
	}

    this.paletteRefs = new Array();
	this.fieldTotalRefs = new Array();
	this.editKeywordsRefs = new Array();
	this.editTitleRefs = new Array();
	this.editDescrRefs = new Array();
	this.fieldFilenameRefs = new Array();
	var wrapper = this;
	
	function changeTotal( str)
	{
		field = wrapper.fieldTotalRefs[0];
		field.text = "Total : " + str;
	}
	
	function changeKeywords( str)
	{
		keywords = wrapper.editKeywordsRefs[0];
		keywords.text = str ;
	}

	function changeTitle( str)
	{
		title = wrapper.editTitleRefs[0];
		title.text = str;
	}

	function changeDescription( str)
	{
		descr = wrapper.editDescrRefs[0];
		descr.text = str;
	}

	function changeFilename( str)
	{
		filename = wrapper.fieldFilenameRefs[0];
		filename.text = "File : "  + str;
	}

	function addTitlePanel( bar) {
		bar.TitlePanel = bar.add( "panel", [3, 3 , 280, 50], 'Title');
		bar.TitlePanel.editTitleField = bar.TitlePanel.add( "edittext", [5, 8, 270, 28],"");
		wrapper.editTitleRefs.push(bar.TitlePanel.editTitleField);
	}

	function addDescrPanel( bar) {
		bar.DescrPanel = bar.add( "panel", [3, 55, 280, 180], 'Description');
		bar.DescrPanel.editDescrField = bar.DescrPanel.add( "edittext", [5, 8, 270, 100],"",  {multiline:true});
		wrapper.editDescrRefs.push(bar.DescrPanel.editDescrField);
	}

	function addKeywordsPanel( bar) {
		bar.KeywordsPanel = bar.add( "panel", [ 3, 190, 280, 400], 'Keywords');
		bar.KeywordsPanel.editKeywordsField = bar.KeywordsPanel.add( "edittext", [5, 8, 270, 170],"",  {multiline:true});
		wrapper.editKeywordsRefs.push(bar.KeywordsPanel.editKeywordsField);
		bar.KeywordsPanel.textTotalField = bar.KeywordsPanel.add( "statictext", [5, 178, 100, 195],"Total : n/a file");
		wrapper.fieldTotalRefs.push(bar.KeywordsPanel.textTotalField);
	}

	function addSyncPanel( bar) {
		bar.SyncPanel = bar.add( "panel", [ 3, 410, 280, 480], '');
		bar.SyncPanel.textFilenameField = bar.SyncPanel.add( "statictext", [5, 5, 270, 25], "File : n/a");
		wrapper.fieldFilenameRefs.push(bar.SyncPanel.textFilenameField);
		bar.SyncPanel.btnSave = bar.SyncPanel.add('button', [3, 30, 85, 55], 'Save');
		wrapper.fieldFilenameRefs.push(bar.SyncPanel.btnSave );
		bar.SyncPanel.btnSave.enabled=false;

		bar.SyncPanel.btnSave.onClick = function()
		{
			if ( app.document.selections.length == 1 )
			{
					alert("yes");
					app.synchronousMode = true;
					md = app.document.selections[0].metadata;
					app.synchronousMode = false;
					var xmp = new XMPMeta(md.serialize());
					editTitle = wrapper.editTitleRefs[0];
					new_title =editTitle.text;
					editDescr = wrapper.editDescrRefs[0];
					new_descr = editDescr.text;
					editKeywords =  wrapper.editKeywordsRefs[0];
					new_keywords = editKeywords.text.split(",");
					for (var k in new_keywords)
					{
							new_keywords[k] = new_keywords[k].trim();
					}
					new_keywords = new_keywords.sort();
					xmp.setLocalizedText(XMPConst.NS_DC,"title","","x-default", new_title);
					xmp.setLocalizedText(XMPConst.NS_DC,"description","","x-default", new_descr);
					xmp.deleteProperty(XMPConst.NS_DC,"subject");
					for (var k in new_keywords )
					{
						xmp.appendArrayItem(XMPConst.NS_DC, "subject", new_keywords[k], 0, XMPConst.ARRAY_IS_ORDERED);
					}
					var updatedPacket = xmp.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
					app.synchronousMode = true;
					app.document.selections[0].metadata = new Metadata(updatedPacket);
					app.synchronousMode = false;
			} 
			else 
			{
				alert("Metadata save only for one file", "Error", errorIcon)
			}			
		}

	}


	onThumbSelection = function( evt ) { 	
			if ( evt.type == "selectionsChanged" ) {
				if (  app.document.selections.length > 0 && app.document.selections[0].type == "file") 
				{
					app.document.selections.length == 1 ? wrapper.fieldFilenameRefs[1].enabled = true : wrapper.fieldFilenameRefs[1].enabled = false;
					md = app.document.selections[0].synchronousMetadata;
					md.namespace =  "http://purl.org/dc/elements/1.1/";
					changeTotal( md.subject.length);
					changeKeywords( md.subject.join(", "));
					changeTitle( md.title[0] ? md.title[0] : "");
					changeDescription( md.description[0] ? md.description[0] : "");
					changeFilename(app.document.selections[0].name);
				}
				else 
				{
					changeTotal( "n/a file");
					changeKeywords( "");
					changeTitle( "");
					changeDescription("" );
					changeFilename( "n/a");
				}
			}
			return { handled: false }; 
	}

	function addKeywordPalette(doc)
	{
		// Create the TabbedPalette object, of type "script"
		var keywordPalette = new TabbedPalette( doc, "Stock Palette", "KeyUIPalette", "script" );
		wrapper.paletteRefs.push(keywordPalette);	
		// Create a ScriptUI panel to be displayed as the tab contents.
		addTitlePanel(keywordPalette.content);
		addDescrPanel(keywordPalette.content);
		addKeywordsPanel(keywordPalette.content);
		addSyncPanel(keywordPalette.content);
	}

	onDocCreate = function( evt ) { 
		if( evt.object.constructor.name == "Document" ){
			if( evt.type == "create" ) {
				// Action to take on document creation
				//addNavBar( evt.object ); 
				app.eventHandlers.push( { handler: onThumbSelection} );
				addKeywordPalette(app.document);
			}
		}
	}	
	
	// Add the palette to all open Bridge browser windows
	for(var i = 0;i < app.documents.length;i++)
	{
		addKeywordPalette(app.documents[i]);
	}
    app.eventHandlers.push( { handler: onDocCreate } );
	
} 

KeywordCounter.prototype.canRun = function() 
{ 
	// Must run in Bridge 
	if(BridgeTalk.appName == "bridge") 
	{ 
		return true; 
	}  
	// Fail if these preconditions are not met. 
	// Bridge must be running, 
	// The menu must not already exist. 
	$.writeln("ERROR:: Cannot run Keyword counter"); 
	$.writeln(this.requiredContext); 
	return false; 
} 


if(typeof(KeywordCounter_unitTest) == "undefined") { 
    new KeywordCounter().run(); 
}
