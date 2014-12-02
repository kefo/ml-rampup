var config = require('../config');
var request = require('request');
var xml2js = require('xml2js');
var xmldoc = require('xmldoc');

var documentmodel = {};

documentmodel.describe = function(uri, cb) {
    console.log(uri);
    var documentinfo = {};
    request({ 
        method: 'GET',
        uri: 'http://' + config.mlrest.host + ':' + config.mlrest.port +'/v1/documents?uri=' + uri,
        auth: {
            'user': config.ml.adminuser,
            'pass': config.ml.adminpass,
            'sendImmediately': false
        },
        headers: {
            'Accept': 'application/xml'
        }
    }, function (error, response, body) {
        if (error) {
            console.error('request failed:', error);
            return cb(null, lobbyist);
        }
        var modifiedbody = body.replace(/(<[a-zA-Z]+):([a-zA-Z0-9\-]+)/g, "$1_$2");
        modifiedbody = modifiedbody.replace(/(<\/[a-zA-Z]+):([a-zA-Z0-9\-]+>)/g, "$1_$2");
        var json = new xmldoc.XmlDocument(modifiedbody);
        //console.log(json);
        
        var main = json.descendantWithPath("mets_dmdSec.mets_mdWrap.mets_xmlData.row");
        //console.log(main);
        
        if (main === undefined) {
            documentinfo = { 
                status: 404,
                dburi: uri,
                dbxml: body,
                luri: uri.replace('.xml', '')
            };
            cb(null, documentinfo);
        } else {
            var ljson = {};
            //console.log(main.children.length);
            main.eachChild(function(r, i) {
                ljson[r.name] = r.val;
                if ( (i+1) == main.children.length ) {
                    //console.log(ljson);
                    var lname = ljson.lobbyist_last_name + ", " + ljson.lobbyist_first_name;
                    if ( ljson.lobbyist_middle_initial !== undefined && ljson.lobbyist_middle_initial !== "" ) {
                        lname += " " + ljson.lobbyist_middle_initial;
                    }
                    var lfor = "";
                    var llobbied = "";
                    if (ljson.doccategory === "lobbyists") {
                        lfor = ljson.client_name;
                        llobbied = ljson.lobbied_department_name;
                    } else {
                        lfor = ljson.employer_name;
                        llobbied = ljson.recipient_agency_name;
                    }
                    documentinfo = { 
                        status: 200,
                        dburi: uri,
                        dbxml: body,
                        luri: uri.replace('.xml', ''),
                        searchpage: "/docs/search/",
                        lname: lname,
                        lfor: lfor,
                        llobbied: llobbied,
                        ljson: ljson 
                    };
                    cb(null, documentinfo);
                }
            });
        }
    });
    //console.log(lobbyist);
}

module.exports = documentmodel;