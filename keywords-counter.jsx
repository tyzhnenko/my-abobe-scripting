///////////////////
/// Name: Keyword counter
/// Description: This script show tatal keywords in file
/// Author: Tyzhnenko Dmitry
/// E-mail: t.dmitry@gmail.com
/// Version: 0.5
///////////////////
/*
    Changelog
    0.5
     - add sync metadata
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
    change to dynamic lyout
    save panel position
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
    this.masterThumb = new Array();
    this.chkSyncBox = new Array();
    var wrapper = this;

    function changeTotal( str)
    {
        //topbar = wrapper.paletteRefs[0].content;
        field = wrapper.fieldTotalRefs[0];
        field.text = "Total : " + str;
    }

    function changeKeywords( str)
    {
        //topbar = wrapper.paletteRefs[0].content;
        //topbar.editTitlePanel.editTitleField.text = str;
        keywords = wrapper.editKeywordsRefs[0];
        keywords.text = str ;
    }

    function changeTitle( str)
    {
        //topbar = wrapper.paletteRefs[0].content;
        //topbar.editTitlePanel.editTitleField.text = str;
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
        bar.TitlePanel = bar.add( "panel", [3, 3 , 300, 50], 'Title');
        bar.TitlePanel.editTitleField = bar.TitlePanel.add( "edittext", [5, 8, 270, 28],"");
        wrapper.editTitleRefs.push(bar.TitlePanel.editTitleField);
        bar.TitlePanel.chkSyncTitle = bar.TitlePanel.add( "checkbox", [275, 8, 295, 28],"");
        bar.TitlePanel.chkSyncTitle.enabled = false;
        wrapper.chkSyncBox.push(bar.TitlePanel.chkSyncTitle);
    }

    function addDescrPanel( bar) {
        bar.DescrPanel = bar.add( "panel", [3, 55, 300, 180], 'Description');
        bar.DescrPanel.editDescrField = bar.DescrPanel.add( "edittext", [5, 8, 270, 100],"",  {multiline:true});
        wrapper.editDescrRefs.push(bar.DescrPanel.editDescrField);
        bar.DescrPanel.chkSyncDescr = bar.DescrPanel.add( "checkbox", [275, 8, 295, 28],"");
        bar.DescrPanel.chkSyncDescr.enabled = false;
        wrapper.chkSyncBox.push(bar.DescrPanel.chkSyncDescr);
    }

    function addKeywordsPanel( bar) {
        bar.KeywordsPanel = bar.add( "panel", [ 3, 190, 300, 400], 'Keywords');
        bar.KeywordsPanel.editKeywordsField = bar.KeywordsPanel.add( "edittext", [5, 8, 270, 170],"",  {multiline:true});
        wrapper.editKeywordsRefs.push(bar.KeywordsPanel.editKeywordsField);
        bar.KeywordsPanel.textTotalField = bar.KeywordsPanel.add( "statictext", [5, 178, 100, 195],"Total : n/a file");
        wrapper.fieldTotalRefs.push(bar.KeywordsPanel.textTotalField);
        bar.KeywordsPanel.chkSyncKeywords = bar.KeywordsPanel.add( "checkbox", [275, 8, 295, 28],"");
        bar.KeywordsPanel.chkSyncKeywords.enabled = false;
        wrapper.chkSyncBox.push(bar.KeywordsPanel.chkSyncKeywords);
    }

    function saveMetadata( thumb, title, descr, keywords)
    {
        if ( title != null || descr != null || keywords != null)
        {
            app.synchronousMode = true;
            md = thumb.metadata;
            app.synchronousMode = false;
            var xmp = new XMPMeta(md.serialize());

            if (title != null) xmp.setLocalizedText(XMPConst.NS_DC,"title","","x-default", title);
            if (descr != null) xmp.setLocalizedText(XMPConst.NS_DC,"description","","x-default", descr);
            if (keywords != null)
            {
                for (var k in keywords)
                {
                    keywords[k] = keywords[k].trim();
                }
                keywords = keywords.sort();
                while  ( keywords[0] == "" )
                {
                    keywords.shift();
                }

                xmp.deleteProperty(XMPConst.NS_DC,"subject");
                for (var k in keywords )
                {
                    xmp.appendArrayItem(XMPConst.NS_DC, "subject", keywords[k], 0, XMPConst.ARRAY_IS_ORDERED);
                }
            }
            //$.writeln(xmp.dumpObject());
            var updatedPacket = xmp.serialize(XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
            app.synchronousMode = true;
            thumb.metadata = new Metadata(updatedPacket);
            app.synchronousMode = false;
        }
    }

    function syncMetadata( masterThumb, listThumbs, params  ){
        if (params.title == null) params.title = true;
        if (params.descr == null) params.descr = true;
        if (params.keywords == null) params.keywords = true;
        md = masterThumb.synchronousMetadata;
        md.namespace =  "http://purl.org/dc/elements/1.1/";
        master_title = master_descr = master_keywords = null;
        if (params.title == true) master_title = md.title[0] ? md.title[0] : "";
        if (params.descr == true) master_descr = md.description[0] ? md.description[0] : "";
        if (params.keywords == true) master_keywords = md.subject ? md.subject : [];
        for ( var k in listThumbs)
        {
                saveMetadata(listThumbs[k], master_title, master_descr, master_keywords);
        }
    }

    function addSyncPanel( bar) {
        bar.SyncPanel = bar.add( "panel", [ 3, 410, 280, 480], '');
        bar.SyncPanel.textFilenameField = bar.SyncPanel.add( "statictext", [5, 5, 270, 25], "File : n/a");
        wrapper.fieldFilenameRefs.push(bar.SyncPanel.textFilenameField);
        bar.SyncPanel.btnSave = bar.SyncPanel.add('button', [3, 30, 85, 55], 'Save');
        wrapper.fieldFilenameRefs.push(bar.SyncPanel.btnSave );
        bar.SyncPanel.btnSave.enabled=false;

        bar.SyncPanel.btnSync = bar.SyncPanel.add('button',  [90, 30, 172 , 55], 'Sync');
        wrapper.fieldFilenameRefs.push(bar.SyncPanel.btnSync );
        bar.SyncPanel.btnSync.enabled=false;

        bar.SyncPanel.btnSave.onClick = function()
        {
            if ( app.document.selections.length == 1 )
            {
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
                saveMetadata(app.document.selections[0], new_title, new_descr, new_keywords);
                t_thumb = app.document.selections[0];
                app.document.deselectAll();
                app.document.select(t_thumb);
            }
            else
            {
                alert("Metadata save only for one file", "Error", errorIcon)
            }
        }

        bar.SyncPanel.btnSync.onClick = function()
        {
            if (!wrapper.chkSyncBox[0].value && !wrapper.chkSyncBox[1].value && !wrapper.chkSyncBox[2].value)
                alert("Please select checkbox");
            else
            {
                var b = (Window.confirm("Really sync matadata?")) ? true : false;
                if ( b ) syncMetadata(wrapper.masterThumb[0], app.document.selections, { title:wrapper.chkSyncBox[0].value, descr:wrapper.chkSyncBox[1].value, 
keywords:wrapper.chkSyncBox[2].value})
            }
        }

    }

    onThumbSelection = function( evt ) {
            //$.writeln( evt.object.constructor.name + " call " +evt.type + " Event" );
            if ( evt.type == "selectionsChanged" ) {
                //$.writeln( "Thumbnail Selected: " + app.document.selections[0].name );
                if (  app.document.selections.length > 0 && app.document.selections[0].type == "file")
                {
                    if (app.document.selections.length == 1)
                    {
                        wrapper.masterThumb.push(app.document.selections[0]);
                        md = app.document.selections[0].synchronousMetadata;
                        md.namespace =  "http://purl.org/dc/elements/1.1/";
                        changeTotal( md.subject.length);
                        changeKeywords( md.subject.join(", "));
                        changeTitle( md.title[0] ? md.title[0] : "");
                        changeDescription( md.description[0] ? md.description[0] : "");
                        changeFilename(app.document.selections[0].name);
                        //$.writeln("Total :  " + md.Keywords.length + ", list:" + md.Keywords );
                    }
                    else
                    {
                        var flag = true;
                        for ( i in  app.document.selections)
                        {
                                if ( app.document.selections[i].name == wrapper.masterThumb[0].name ) { flag = false ; break;}
                        }

                        if (flag)
                        {
                            wrapper.masterThumb.length = 0;
                            wrapper.masterThumb.push(app.document.selections[0]);
                            md = app.document.selections[0].synchronousMetadata;
                            md.namespace =  "http://purl.org/dc/elements/1.1/";
                            changeTotal( md.subject.length);
                            changeKeywords( md.subject.join(", "));
                            changeTitle( md.title[0] ? md.title[0] : "");
                            changeDescription( md.description[0] ? md.description[0] : "");
                            changeFilename(app.document.selections[0].name);
                        }
                    }

                    if ( app.document.selections.length == 1 )
                    {
                        wrapper.fieldFilenameRefs[1].enabled = true;
                        for ( i in wrapper.chkSyncBox)
                        {
                            wrapper.chkSyncBox[i].enabled = false;
                            wrapper.chkSyncBox[i].value = false;
                        }
                    }
                    else
                    {
                        wrapper.fieldFilenameRefs[1].enabled = false;
                    }

                    if ( app.document.selections.length > 1 )
                    {
                        wrapper.fieldFilenameRefs[2].enabled = true;
                        for ( i in wrapper.chkSyncBox)
                        {
                            wrapper.chkSyncBox[i].enabled = true;
                        }
                    }
                    else
                    {
                        wrapper.fieldFilenameRefs[2].enabled = false;
                        for ( i in wrapper.chkSyncBox)
                        {
                            wrapper.chkSyncBox[i].enabled = false;
                            wrapper.chkSyncBox[i].value = false;
                        }
                    }
                }
                else
                {
                    changeTotal( "n/a file");
                    changeKeywords( "");
                    changeTitle( "");
                    changeDescription("" );
                    changeFilename( "n/a");
                    wrapper.masterThumb.length = 0;
                    wrapper.fieldFilenameRefs[2].enabled = false;
                    for ( i in wrapper.chkSyncBox)
                    {
                        wrapper.chkSyncBox[i].enabled = false;
                        wrapper.chkSyncBox[i].value = false;
                    }
                }
            }
            return { handled: false };
    }

    function addKeywordPalette(doc)
    {
/*
    res =
        "
        ";
*/
        // Create the TabbedPalette object, of type "script"
        var keywordPalette = new TabbedPalette( doc, "Stock Palette", "KeyUIPalette", "script" );
        wrapper.paletteRefs.push(keywordPalette);

        // Create a ScriptUI panel to be displayed as the tab contents.
        addTitlePanel(keywordPalette.content);
        addDescrPanel(keywordPalette.content);
        addKeywordsPanel(keywordPalette.content);
        addSyncPanel(keywordPalette.content);
        //var tbPanel = keywordPalette.content.add('panel', [25,15,255,130], 'The Panel');

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
