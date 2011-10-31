/*
.--------------------------------------------------------------------------.
|    Software: Keyword counter                                             |
|     Version: 0.72                                                        |
|        Site: http://code.google.com/p/my-abobe-scripting/                |
| Description: This script show tatal keywords in file and have            |
|                               many use for for microstocker fuctional.   |
| -------------------------------------------------------------------------|
|     Admin: Tyzhnenko Dmitry (project admininistrator)                    |
|    Author: Tyzhnenko Dmitry t.dmitry@gmail.com                           |
|   Founder: Tyzhnenko Dmitry (original founder)                           |
| Copyright (c) 2009-2011, Tyzhnenko Dmitry                                |
| -------------------------------------------------------------------------|
|   License: Distributed under the General Public License v3 (GPLv3)       |
|            http://www.gnu.org/licenses/gpl.html                          |
| This program is distributed in the hope that it will be useful - WITHOUT |
| ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or    |
| FITNESS FOR A PARTICULAR PURPOSE.                                        |
'--------------------------------------------------------------------------'
*/
/*
    Changelog
    0.72
     - fix sync with empty title and/or descr (fixes Issue #18)
    0.71
     - regexp in split for words count
     - remove duplicate spaces
     - trim title and descr
    0.7
     - change template `w:0/c:0` to `words: 0 | chars: 0` (fix issue #12)
     - add checkbox `add keywors` -- add functionality append exist keywords (fix issue #16)
     - add live counting words and chars (fix issue #13)
    0.66
     - count chars end words for title and descr (fix issue #9)
    0.65
     - change to dynamic layout
     - show count words in title and descr
    0.61
     - add checkbox for sort/unsort keywords
     - add unique keywords function
     - fix "for" statements for array
    0.6
     - add copy-paste
     - remember checkboxes
     - fix bug with empty metadata
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
    3. с цветами - не знаю как у Вас но у меня в бридже все черное а это окошко светло серое - было бы здорого сделать его одного цвета - как все плагины
    add checkbox to show copyed data
    add small thumb with master file
    save panel position

*/



function KeywordCounter()
{
    /**
    The context in which this snippet can run; Bridge must be running.
    @type String
    */
    this.requiredContext = "\tAdobe Bridge CS4 must be running.\n\tExecute against Bridge CS4 as the Target.\n";
    //$.level = 2; // Debugging level

    this.version = "0.72";
    this.author = "Tyzhenenko Dmitry";
}

KeywordCounter.prototype.run = function()
{
    var retval = true;
    if(!this.canRun()) {
        retval = false;
        return retval;
    }

    String.prototype.trim = function () {
        return this.replace(/^\s*/, "").replace(/\s*$/, "");
    }

    String.prototype.remdupspace = function () {
        return this.replace(/\s+/g, " ");
    }

    Array.prototype.unique = function () {
        // Thx for Martin
        // Get from http://www.martienus.com/code/javascript-remove-duplicates-from-array.html
        var r = new Array();
        o:for(var i = 0, n = this.length; i < n; i++)
        {
            for(var x = 0, y = r.length; x < y; x++)
            {
                if(r[x]==this[i])  { continue o; }
            }
            r[r.length] = this[i];
        }
        return r;
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
    this.panelTitle = new Array;
    this.panelDesc = new Array;
    this.panelKeywords = new Array;
    this.fieldTotalRefs = new Array();
    this.editKeywordsRefs = new Array();
    this.editTitleRefs = new Array();
    this.editDescrRefs = new Array();
    this.fieldFilenameRefs = new Array();
    this.masterThumb = new Array();
    this.chkSyncBox = new Array();
    this.clipboardMaster = new Array();
    this.chkSortBox = new Array();
    this.chkAddBox = new Array();
    this.flags = { clipEmpty:true };
    var wrapper = this;

    function changeTotal( str)
    {
        field = wrapper.panelKeywords[0];
        field.text = "Keywords (" + str + ")";
    }

    function changeTotalDescr( str)
    {
        field = wrapper.panelDesc[0];
        field.text = "Description (" + str + ")";
    }

    function changeTotalTitle( str)
    {
        field = wrapper.panelTitle[0];
        field.text = "Title (" + str + ")";
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

        var TitlePanel = bar.add( "panel", undefined, 'Title', );
        TitlePanel.margins=[2,7,2,5];
        TitlePanel.spacing=[2,7,2,5];
        wrapper.panelTitle.push(TitlePanel);
        TitlePanel.orientation= "row";
        TitlePanel.alignment = ["fill", "top"];

        var editTitleField = TitlePanel.add( "edittext", undefined,"");
        wrapper.editTitleRefs.push(editTitleField);
        editTitleField.alignment = ["fill", "top"];
        editTitleField.onChanging = function()
        {
            changeTotalTitle( wrapper.editTitleRefs[0].text.length>0 ? "words: "+ ((wrapper.editTitleRefs[0].text.trim().split(/\s+/)).length) +" | chars: "+wrapper.editTitleRefs[0].text.length : "words: 0 | chars: 0" );
        }

        var chkSyncTitle = TitlePanel.add( "checkbox", undefined,"");
        wrapper.chkSyncBox.push(chkSyncTitle);
        chkSyncTitle.alignment = ["right", "top"];
        chkSyncTitle.enabled = false;


    }

    function addDescrPanel( bar) {

        var DescrPanel = bar.add( "panel", undefined, 'Description');
        DescrPanel.margins=[2,7,2,5];
        DescrPanel.spacing=[2,7,2,5];
        wrapper.panelDesc.push(DescrPanel);
        DescrPanel.orientation= "row";
        DescrPanel.alignment = ["fill", "fill" ];
        DescrPanel.alignChildren = ["fill", "fill"];


        var editDescrField = DescrPanel.add( "edittext", undefined,"",  {multiline:true});
        wrapper.editDescrRefs.push(editDescrField);
        editDescrField.minimumSize = [100,60];
        editDescrField.maximumSize = [4000,70];
        editDescrField.alignment = ["fill", "fill"];
        editDescrField.onChanging = function()
        {
            changeTotalDescr( wrapper.editDescrRefs[0].text.length > 0 ? "words: "+ ((wrapper.editDescrRefs[0].text.trim().split(/\s+/)).length) +" | chars: "+wrapper.editDescrRefs[0].text.length : "words: 0 | chars: 0" );
        }

        var chkSyncDescr = DescrPanel.add( "checkbox", undefined,"");
        wrapper.chkSyncBox.push(chkSyncDescr);
        chkSyncDescr.alignment = ["right", "top"];
        chkSyncDescr.enabled = false;
    }

    function addKeywordsPanel( bar) {

        var KeywordsPanel = bar.add( "panel", undefined, 'Keywords');
        KeywordsPanel.margins=[2,7,2,5];
        KeywordsPanel.spacing=[2,7,2,5];
        wrapper.panelKeywords.push(KeywordsPanel);
        KeywordsPanel.orientation = "row";
        KeywordsPanel.alignment = ["fill", "fill"];
        KeywordsPanel.alignChildren = ["fill", "fill"];

        var editKeywordsField = KeywordsPanel.add( "edittext", undefined,"",  {multiline:true});
        wrapper.editKeywordsRefs.push(editKeywordsField);
        editKeywordsField.minimumSize = [150,80];
        editKeywordsField.maximumSize = [4000,250];
        editKeywordsField.alignment = ["fill", "fill"];
        editKeywordsField.onChanging = function()
        {
            changeTotal( wrapper.editKeywordsRefs[0].text.length> 0 ? wrapper.editKeywordsRefs[0].text.split(",").length  : "0" );
        }

        var chkSyncKeywords = KeywordsPanel.add( "checkbox", undefined,"");
        wrapper.chkSyncBox.push(chkSyncKeywords);
        chkSyncKeywords.alignment = ["right", "top"];
        chkSyncKeywords.enabled = false;
    }

    function saveMetadata( thumb, title, descr, keywords, params )
    {
        if (params.sort == null) params.sort = true;
        if (params.append == null) params.append = true;
        if ( title != null || descr != null || keywords != null)
        {

            app.synchronousMode = true;
            md = thumb.metadata;
            app.synchronousMode = false;
            var xmp = new XMPMeta(md.serialize());
            md.namespace =  "http://purl.org/dc/elements/1.1/";

            if (title != null)
            {
                title = title.trim();
                title = title.remdupspace();
                xmp.setLocalizedText(XMPConst.NS_DC,"title","","x-default", title);
            }
            if (descr != null) 
            {
                descr = descr.trim();
                descr = descr.remdupspace();
                xmp.setLocalizedText(XMPConst.NS_DC,"description","","x-default", descr);
            }
            if (keywords != null)
            {
                for (var k  =0 ; k < keywords.length; k++)
                {
                        keywords[k] = keywords[k].trim();
                }
                if (params.append)
                {
                    exist_keywords = md.subject ? md.subject : [];
                    exist_keywords = exist_keywords.concat(keywords);
                    keywords = exist_keywords;
                }
                if (params.sort) keywords = keywords.sort();
                keywords = keywords.unique();
                for (var k  =0 ; k < keywords.length; k++)
                {
                    keywords[k] = keywords[k].toLowerCase();
                    if (keywords[k] == "") keywords.splice(k,1)
                }

                xmp.deleteProperty(XMPConst.NS_DC,"subject");
                for (var k  =0 ; k < keywords.length; k++ )
                {
                    xmp.appendArrayItem(XMPConst.NS_DC, "subject", keywords[k], 0, XMPConst.ARRAY_IS_ORDERED);
                }
            }
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
        if (params.sort == null) params.sort = true;
        if (params.append == null) params.append = true;
        md = masterThumb.synchronousMetadata;
        md.namespace =  "http://purl.org/dc/elements/1.1/";
        master_title = master_descr = master_keywords = null;
        if (params.title == true) master_title = md.title[0] ? md.title[0] : "";
        if (params.descr == true) master_descr = md.description[0] ? md.description[0] : "";
        if (params.keywords == true) master_keywords = md.subject ? md.subject : [];
        for ( var k  =0 ; k < listThumbs.length; k++)
        {
                saveMetadata(listThumbs[k], master_title, master_descr, master_keywords, { sort:params.sort, append:params.append} );
        }
    }

    function copyClipboardMetadata( thumb)
    {
        wrapper.clipboardMaster.length = 0;

        wrapper.clipboardMaster.push( thumb)
        wrapper.flags.clipEmpty = false;
    }

    function pasteClipboardMetadata( thumbsList)
    {
        if (!wrapper.flags.clipEmpty)
            syncMetadata(wrapper.clipboardMaster[0], thumbsList,
                        { title:wrapper.chkSyncBox[0].value,
                            descr:wrapper.chkSyncBox[1].value,
                            keywords:wrapper.chkSyncBox[2].value,
                            sort:wrapper.chkSortBox[0].value,
                            append:wrapper.chkAddBox[0].value} );
        else
            alert("nothing in clip");
    }

    function reselectFiles()
    {
        t_thumb = app.document.selections[0];
        app.document.deselectAll();
        app.document.select(t_thumb);
    }

    function addSyncPanel( bar) {
        var SyncPanel = bar.add( "panel", undefined, '');
        SyncPanel.margins=[2,7,2,5];
        SyncPanel.spacing=[2,7,2,5];
        SyncPanel.maximumSize = [3000,100];
        SyncPanel.alignment = ["fill", "fill"];
        SyncPanel.alignChildren = ["fill", "fill"];
        SyncPanel.orientation = "column";
        var staticFile = SyncPanel.add( "statictext", undefined, 'File : n/a');
        wrapper.fieldFilenameRefs.push(staticFile);
        staticFile.minimumSize = [100, 15];
        staticFile.alignment = ["fill", "top"];

        var grpGlob = SyncPanel.add("group");
        grpGlob.orientation = "row";

        var grpGlob_Left = grpGlob.add("group");
        grpGlob_Left.orientation = "column";

        var grpBtn1 = grpGlob_Left.add("group");
        grpBtn1.orientation = "row";
        btnSave = grpBtn1.add("button", undefined, "Save");
        wrapper.fieldFilenameRefs.push(btnSave);
        btnSave.enabled=false;
        btnSync = grpBtn1.add("button", undefined, "Sync");
        wrapper.fieldFilenameRefs.push(btnSync);
        btnSync.enabled=false;

        var grpBtn2 = grpGlob_Left.add("group");
        grpBtn2.orientation = "row";
        btnCopy = grpBtn2.add("button", undefined, "Copy");
        wrapper.fieldFilenameRefs.push(btnCopy);
        btnCopy .enabled=false;
        btnPaste = grpBtn2.add("button", undefined, "Paste");
        wrapper.fieldFilenameRefs.push(btnPaste);
        btnPaste.enabled=false;

        var grpGlob_Right = grpGlob.add("group");
        grpGlob_Right.alignment = ["right", "top"];
        grpGlob_Right.orientation = "column";

        var chkSortKeywords = grpGlob_Right.add( "checkbox", undefined,"Sort keywords");
        wrapper.chkSortBox.push(chkSortKeywords);
        chkSortKeywords.alignment = ["right", "top"];
        chkSortKeywords.enabled = true;
        chkSortKeywords.value= true;

        var chkAddKeywords = grpGlob_Right.add( "checkbox", undefined,"Add keywords");
        wrapper.chkAddBox.push(chkAddKeywords);
        chkAddKeywords.alignment = ["right", "top"];
        chkAddKeywords.enabled = true;
        chkAddKeywords.value= false;


        btnSave.onClick = function()
        {
            if ( app.document.selections.length == 1 )
            {
                editTitle = wrapper.editTitleRefs[0];
                new_title =editTitle.text;
                editDescr = wrapper.editDescrRefs[0];
                new_descr = editDescr.text;
                editKeywords =  wrapper.editKeywordsRefs[0];
                new_keywords = editKeywords.text.split(",");
                for (var k  =0 ; k < new_keywords.length; k++)
                {
                        new_keywords[k] = new_keywords[k].trim();
                }
                saveMetadata(app.document.selections[0],
                                    new_title,
                                    new_descr,
                                    new_keywords,
                                    { sort:wrapper.chkSortBox[0].value,
                                    append:false } );
                reselectFiles();
            }
            else
            {
                alert("Metadata save only for one file", "Error", errorIcon)
            }
        }

        btnSync.onClick = function()
        {
            if (!wrapper.chkSyncBox[0].value && !wrapper.chkSyncBox[1].value && !wrapper.chkSyncBox[2].value)
                alert("Please select checkbox");
            else
            {
                syncMetadata(wrapper.masterThumb[0], app.document.selections,
                        { title:wrapper.chkSyncBox[0].value,
                            descr:wrapper.chkSyncBox[1].value,
                            keywords:wrapper.chkSyncBox[2].value,
                            sort:wrapper.chkSortBox[0].value,
                            append:wrapper.chkAddBox[0].value})
                reselectFiles();
            }
        }

        btnCopy.onClick = function()
        {
            if (!wrapper.chkSyncBox[0].value && !wrapper.chkSyncBox[1].value && !wrapper.chkSyncBox[2].value)
                alert("Please select checkbox");
            else
            {
                copyClipboardMetadata(app.document.selections[0]);
                wrapper.flags.clipEmpty = false;
            }
        }

        btnPaste.onClick = function()
        {
            if (!wrapper.chkSyncBox[0].value && !wrapper.chkSyncBox[1].value && !wrapper.chkSyncBox[2].value)
                alert("Please select checkbox");
            else
            {
                pasteClipboardMetadata( app.document.selections);
                reselectFiles();
            }

        }

    }

    onThumbSelection = function( evt ) {
            if ( evt.type == "selectionsChanged" ) {
                if (  app.document.selections.length > 0 && app.document.selections[0].type == "file")
                {
                    if (app.document.selections.length == 1)
                    {
                        wrapper.masterThumb.length = 0;
                        wrapper.masterThumb.push(app.document.selections[0]);
                        md = app.document.selections[0].synchronousMetadata;
                        md.namespace =  "http://purl.org/dc/elements/1.1/";
                        changeTotal( md.subject.length );
                        changeKeywords(  md.subject ? md.subject.join(", ") : "" );
                        changeTitle( md.title ? md.title[0] : "");
                        changeTotalTitle( md.title ? "words: "+(md.title[0].trim().split(/\s+/)).length +" | chars: "+ md.title[0].length : "words: 0 | chars: 0" );
                        changeDescription( md.description ? md.description[0] : "");
                        changeTotalDescr( md.description ? "words: "+(md.description[0].trim().split(/\s+/)).length +" | chars: "+md.description[0].length : "words: 0 | chars: 0" );
                        changeFilename(app.document.selections[0].name);
                    }
                    else
                    {
                        var flag = true;
                        for ( var i  =0 ; i < app.document.selections.length; i++ )
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
                            changeKeywords( md.subject ? md.subject.join(", ") : "");
                            changeTitle( md.title ? md.title[0] : "");
                            changeTotalTitle( md.title ? "words: "+(md.title[0].trim().split(/\s+/)).length +" | chars: "+ md.title[0].length : "words: 0 | chars: 0" );
                            changeDescription( md.description ? md.description[0] : "");
                            changeTotalDescr( md.description ? "words: "+(md.description[0].trim().split(/\s+/)).length +" | chars: "+md.description[0].length : "words: 0 | chars: 0" );
                            changeFilename(app.document.selections[0].name);
                        }
                    }

                    if ( app.document.selections.length == 1 )
                    {
                        wrapper.fieldFilenameRefs[1].enabled = true; // Save button
                        wrapper.fieldFilenameRefs[3].enabled = true; // Copy button
                        if (!wrapper.flags.clipEmpty) wrapper.fieldFilenameRefs[4].enabled = true; // Paste button
                        for (var i  =0 ; i < wrapper.chkSyncBox.length; i++)
                        {
                            wrapper.chkSyncBox[i].enabled = true;
                        }
                    }
                    else
                    {
                        wrapper.fieldFilenameRefs[1].enabled = false; // Save button
                        wrapper.fieldFilenameRefs[3].enabled = false; // Copy button
                        wrapper.fieldFilenameRefs[4].enabled = false; // Paste button
                    }

                    if ( app.document.selections.length > 1 )
                    {
                        wrapper.fieldFilenameRefs[2].enabled = true; // Sync button
                        if (!wrapper.flags.clipEmpty) wrapper.fieldFilenameRefs[4].enabled = true; // Paste button
                        for ( var i  =0 ; i < wrapper.chkSyncBox.length; i++)
                        {
                            wrapper.chkSyncBox[i].enabled = true;
                        }
                    }
                    else
                    {
                        wrapper.fieldFilenameRefs[2].enabled = false; // Sync button
                    }
                }
                else
                {
                    changeTotal( 0);
                    changeKeywords( "");
                    changeTitle( "");
                    changeTotalTitle( 0 );
                    changeDescription("" );
                    changeTotalDescr(  0 );
                    changeFilename( "n/a");
                    wrapper.masterThumb.length = 0;
                    wrapper.fieldFilenameRefs[1].enabled = false; // Save button
                    wrapper.fieldFilenameRefs[2].enabled = false; // Sync button
                    wrapper.fieldFilenameRefs[3].enabled = false; // Copy button
                    wrapper.fieldFilenameRefs[4].enabled = false; // Paste button
                    for ( var i  =0 ; i < wrapper.chkSyncBox.length; i++)
                    {
                        wrapper.chkSyncBox[i].enabled = false;
                    }
                }
            }
            return { handled: false };
    }

    function addKeywordPalette(doc)
    {

        // Create the TabbedPalette object, of type "script"
        var keywordPalette = new TabbedPalette( doc, "Stock Palette", "KeyUIPalette", "script" );
        wrapper.paletteRefs.push(keywordPalette);

        keywordPalette.content.onResize = function()
        {
            var b = this.bounds;
            wrapper.paletteRefs[1].bounds = b;
            wrapper.paletteRefs[1].layout.resize(true);
            wrapper.paletteRefs[1].layout.layout(true);
            this.layout.resize(true);
            wrapper.paletteRefs[0].content.layout.layout(true);

        }

        var pnl = keywordPalette.content.add("panel", undefined , "");
        keywordPalette.margins=5;
        keywordPalette.spacing=5;
        wrapper.paletteRefs.push(pnl);
        pnl.alignment = ["fill", "fill"];

        var mainBtnGp = pnl.add("group");
        mainBtnGp.orientation = "column";
        mainBtnGp.margins=5;
        mainBtnGp.spacing=5;
        mainBtnGp.alignment = ["fill", "fill"];
        mainBtnGp.alignChildren = ["fill", "fill"];

        // Create a ScriptUI panel to be displayed as the tab contents.
        addTitlePanel(mainBtnGp);
        addDescrPanel(mainBtnGp);
        addKeywordsPanel(mainBtnGp);
        addSyncPanel(mainBtnGp);

        keywordPalette.content.layout.layout(true);
        keywordPalette.content.layout.resize(true);

    }

    onDocCreate = function( evt ) {
        if( evt.object.constructor.name == "Document" ){
            if( evt.type == "create" ) {
                addKeywordPalette(app.document);
                app.eventHandlers.push( { handler: onThumbSelection} );
            }
        }
    }

    // Add the palette to all open Bridge browser windows
    if ($.level == 0 )
    {
        for(var i = 0;i < app.documents.length;i++)
        {
            addKeywordPalette(app.documents[i]);
        }
      app.eventHandlers.push( { handler: onDocCreate } );
    }
    else
    {
        addKeywordPalette(app.document);
        app.eventHandlers.push( { handler: onThumbSelection} );
    }
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

