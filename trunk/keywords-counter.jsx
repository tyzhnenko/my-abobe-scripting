/////////////////// 
/// Name: Keyword counter
/// Description: This script show tatal keywords in file 
/// Author: Tyzhnenko Dmitry 
/// E-mail: t.dmitry@gmail.com 
/// Version: 0.1
/////////////////// 


function KeywordCounter() 
{ 
/** 
    The context in which this snippet can run; Bridge must be running. 
@betype String 
*/ 
    this.requiredContext = "\tAdobe Bridge CS4 must be running.\n\tExecute against Bridge CS4 as the Target.\n"; 
//$.level = 5; // Debugging levelvel 

    this.version = "0.1"; 
    this.author = "Tyzhenenko Dmitry"; 
    

} 

onThumbSelection = function( evt ) { 
    if ( evt.type == "selectionsChanged" ) {
        topbar = app.document.topNavbar;
        if (  app.document.selections.length > 0 && app.document.selections[0].type == "file") 
        {
            md = app.document.selections[0].metadata;
            md.namespace =  "http://ns.adobe.com/photoshop/1.0/";
            topbar.textPanel.textField.text = "Total  keywords : " + md.Keywords.length;
        }
        else 
        {
            topbar.textPanel.textField.text = "no File selected";
        }
    }
    return { handled: false }; 
}
        
function addTopBarPanel(bar) {
    bar.textPanel = bar.add( "panel", [5, 5, 300, 30], undefined);
    bar.textPanel.textField = bar.textFieldtPanel.add( "statictext", [5, 2, 200, 22],"");
}
// Create the PathBar on the top navbar of the document

function addNavBar(doc) {
    topbar =  app.document.topNavbar;
    addTopBarPanel(topbar );
    topbar.visible = true;
    topbar.textPanel.textField.text =  "no File selected";
}

onDocCreate = function( evt ) { 
    if( evt.object.constructor.name =name= "Document" ){
        if( evt.type == "create" ) {
        // Action to take on document creation
            addNavBar( evt.object ); 
            app.eventHandlers.push( { handler: onThumbSelection} );
        }
    }
}
    
    KeywordCounter.prototype.run = function() 
{ 
var retval = true; 
if(!this.canRun()) { 
        retval = false; 
        return retval; 
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
