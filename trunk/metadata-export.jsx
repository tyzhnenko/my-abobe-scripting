///////////////////
/// Name: Export metadate to file
/// Description: This script save metadata to text file
/// Author: Tyzhnenko Dmitry
/// E-mail: t.dmitry@gmail.com
/// Version: 0.1
///////////////////
/*
    Copyright (C) 2010  Tyzhnenko Dmitry

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function MetadataExport()
{

    // Any class variables should be commented as such
    this.menuID = "batchExportMenu";

    /**
     The context in which this snippet can run.
     @type String
    */
    this.requiredContext = "\tNeed to be running in context of Bridge\n";
    // TODO define and initialize more instance variables here.
}

/**
 Functional part of this snippet.
 @return True if the snippet ran as expected, false otherwise
 @type boolean
*/
MetadataExport.prototype.run = function()
{
    if(!this.canRun())
    {
        return false;
    }

    function getMetadata( thumb){

        exp_metadata = {};
        md = thumb.synchronousMetadata;
        md.namespace =  "http://purl.org/dc/elements/1.1/";
        exp_metadata.filename = thumb.name;
        exp_metadata.keywords = md.subject ? md.subject.join(",") : "" ;
        exp_metadata.title = md.title ? md.title[0] : "";
        exp_metadata.descr = md.description ? md.description[0] : "";

        return exp_metadata;
    }

    function putToFile(file_name, data)
    {
        fp = new File(file_name);
        fp.open("a");
        fp.writeln(data.filename);
        fp.writeln(data.title);
        fp.writeln(data.descr);
        fp.writeln(data.keywords);
        fp.close();
    }

    var path_to = $.getenv("TEMP");
    var filename_export = "\\bridge_metadata_file_export.txt";

    var BatchExportMetadata = new MenuElement("command", "Export metadata to txt", "after BatchRename", this.menuID);

    BatchExportMetadata.onSelect = function(m)
    {
        alert("1");
        for ( var k  =0 ; k < app.document.selections.length; k++)
        {
                data = getMetadata( app.document.selections[k]);
                putToFile(path_to + filename_export, data)
        }
    }

    return true;
}

MetadataExport.prototype.canRun = function()
 {
    if(BridgeTalk.appName == "bridge")
    {
        return true;
    }
    $.writeln("ERROR:: Cannot run MetadataExport");
    $.writeln(this.requiredContext);
    return false;
}

/**
 "main program": construct an anonymous instance and run it
  as long as we are not unit-testing this snippet.
*/
if(typeof(MetadataExport_unitTest ) == "undefined") {
    new MetadataExport().run();
}

