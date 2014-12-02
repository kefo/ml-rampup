var fs = require('fs');
var request = require('request');
var xmldoc = require('xmldoc');
var config = require('../config');

var sources = [
        {
            file: "data/chicago-registered-lobbyists.xml",
            dir: "lobbyists"
        },
        {
            file: "data/chicago-lobbyists-gifts.xml",
            dir: "gifts"
        }
    ];

var base_mets = '<mets:mets PROFILE="metadataRecord" OBJID="%DBURI%" \
    xsi:schemaLocation="http://www.loc.gov/METS/ http://www.loc.gov/standards/mets/mets.xsd" \
    xmlns:xlink="http://www.w3.org/1999/xlink" \
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" \
    xmlns:sem="http://marklogic.com/semantics" \
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \
    xmlns:mets="http://www.loc.gov/METS/">\
    <mets:dmdSec ID="main">\
        <mets:mdWrap MDTYPE="OTHER">\
            <mets:xmlData>\
                %MAINXML%\
            </mets:xmlData>\
        </mets:mdWrap>\
    </mets:dmdSec>\
    <mets:dmdSec ID="semrdf">\
        <mets:mdWrap MDTYPE="OTHER">\
            <mets:xmlData>\
                <sem:triples xmlns:sem="http://marklogic.com/semantics"> \
                    %SEMRDF% \
                </sem:triples> \
            </mets:xmlData>\
        </mets:mdWrap>\
    </mets:dmdSec>\
    <mets:structMap>\
        <mets:div TYPE="dataRecord" DMDID="main semrdf"/>\
    </mets:structMap>\
  </mets:mets>';

sources.forEach( function(s) {
    fs.readFile(s.file, { encoding: "utf-8" }, function (err, data) {
        if (err) throw err;
        var xmlnode = new xmldoc.XmlDocument(data);;
        var rows = xmlnode.descendantWithPath("row");
        rows.eachChild(function(r) {
            var mets = base_mets;
            var dburi = '/docs/' + s.dir + '/' + r.attr._uuid + '.xml';
            mets = mets.replace('%DBURI%', dburi);
        
            var mainxml = r.toString();
            mainxml = mainxml.replace('<row ', '<row xmlns="http://data.cityofchicago.org/rows/" ');
            mainxml = mainxml.replace('</row>', '<doccategory>' + s.dir + '</doccategory></row>');

            request(
                { 
                    method: 'PUT',
                    uri: 'http://' + config.mlrest.host + ':' + config.mlrest.port + '/v1/documents?uri=' + dburi + '&transform=load',
                    auth: {
                        'user': config.ml.adminuser,
                        'pass': config.ml.adminpass,
                        'sendImmediately': false
                    },
                    //json: true,
                    body: mainxml
                }, function (error, response, body) {
                    if (error) {
                        return console.error('upload failed:', error);
                    }
                    console.log('Upload successful!  ' + dburi);
                }
            );
            
        });
    });
});
