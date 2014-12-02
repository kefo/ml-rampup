var config = require('../config');
var request = require('request');
var _ = require('lodash');

var resourcemodel = {};

resourcemodel.describe = function(uri, doinverse, cb) {
    console.log(uri);
    var resourceinfo = {};
    request({ 
        method: 'GET',
        uri: 'http://' + config.mlrest.host + ':' + config.mlrest.port +'/v1/resources/describe?rs:uri=' + uri,
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
            return cb(null, resourceinfo);
        }
        //console.log(body);
        body = JSON.parse(body);
        //console.log(body.results.bindings);
        
        if (body.results === undefined) {
            resourceinfo = { 
                status: 404,
                dburi: uri,
                dbxml: body,
                luri: uri.replace('.xml', '')
            };
            cb(null, resourceinfo);
        } else {
            var ljson = {};
            //console.log(main.children.length);
            var bindings = body.results.bindings;
            //bindings.eachChild(function(r, i) {
            for (var rnum in bindings) {
                var r = bindings[rnum];
                if (ljson[r.p.value] === undefined) {
                    ljson[r.p.value] = [];
                }
                var o = {};
                if (r.n) {
                    o.o = r.o.value;
                    o.otype = "label";
                    o.l = r.n.value;
                } else {
                    o.o = r.o.value;
                    o.otype = "uri";
                }
                ljson[r.p.value].push(o);
            }
            //console.log(ljson);
            //    if ( (i+1) == body.results.bindings.length ) {
                    //console.log(ljson);
                    var lname = "";
                    if (ljson["http://marklogic.com/chigovdata/vocab#description"]) {
                        lname = ljson["http://marklogic.com/chigovdata/vocab#description"][0].o;
                    } else { 
                        lname = ljson["http://xmlns.com/foaf/0.1/name"][0].o;
                    }
                    var lfor = "";
                    var lobbyist = "";
                    var llobbied = "";
                    var lobbiedby = "";
                    if ( 
                        _.some(ljson["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"], {"o": "http://marklogic.com/chigovdata/vocab#Company"}) ||
                        _.some(ljson["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"], {"o": "http://marklogic.com/chigovdata/vocab#Firm"})
                        ) {
                        if ( ljson["http://marklogic.com/chigovdata/vocab#lobbyist"] ) {
                            lobbyist = ljson["http://marklogic.com/chigovdata/vocab#lobbyist"][0].l;
                            if (ljson["http://marklogic.com/chigovdata/vocab#lobbyist"].length > 1) {
                                lobbyist += " and " + ljson["http://marklogic.com/chigovdata/vocab#lobbyist"].length + " others";
                            }
                        }
                    } else if ( 
                        _.some(ljson["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"], {"o": "http://marklogic.com/chigovdata/vocab#RecipientOrganization"}) ||
                        _.some(ljson["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"], {"o": "http://marklogic.com/chigovdata/vocab#Recipient"})
                        ) {
                        if ( ljson["http://marklogic.com/chigovdata/vocab#lobbiedBy"] ) {
                            lobbiedby = ljson["http://marklogic.com/chigovdata/vocab#lobbiedBy"][0].l;
                            if (ljson["http://marklogic.com/chigovdata/vocab#lobbiedBy"].length > 1) {
                                lobbiedby += " and " + ljson["http://marklogic.com/chigovdata/vocab#lobbiedBy"].length + " others";
                            }
                        }
                    }
                    if ( ljson["http://marklogic.com/chigovdata/vocab#lobbied"] ) {
                        lfor = ljson["http://marklogic.com/chigovdata/vocab#lobbied"][0].l;
                        if (ljson["http://marklogic.com/chigovdata/vocab#lobbied"].length > 1) {
                            lfor += " and " + ljson["http://marklogic.com/chigovdata/vocab#lobbied"].length + " others";
                        }
                    }
                    if (doinverse) {
                        request({ 
                            method: 'GET',
                            uri: 'http://' + config.mlrest.host + ':' + config.mlrest.port +'/v1/resources/describe?rs:inverse=true&rs:uri=' + uri,
                            auth: {
                                'user': config.ml.adminuser,
                                'pass': config.ml.adminpass,
                                'sendImmediately': false
                            },
                            headers: {
                                'Accept': 'application/xml'
                            }
                        }, function (error, response, inversebody) {
                            inversebody = JSON.parse(inversebody);
                            var inversebindings = inversebody.results.bindings;
                            //bindings.eachChild(function(r, i) {
                            for (var rnum in inversebindings) {
                                var r = inversebindings[rnum];
                                var p = r.p.value;
                                var pinverse = "";
                                
                                if (p === "http://marklogic.com/chigovdata/vocab#employedBy") {
                                    pinverse = "http://marklogic.com/chigovdata/vocab#employs";
                                
                                } else if (p === "http://marklogic.com/chigovdata/vocab#employs") {
                                    pinverse = "http://marklogic.com/chigovdata/vocab#employedBy";
                                
                                } else if (p === "http://marklogic.com/chigovdata/vocab#lobbiedBy") {
                                    pinverse = "http://marklogic.com/chigovdata/vocab#lobbied";
                                
                                } else if (p === "http://marklogic.com/chigovdata/vocab#lobbied") {
                                    pinverse = "http://marklogic.com/chigovdata/vocab#lobbiedBy";

                                } else if (p === "http://marklogic.com/chigovdata/vocab#givenTo") {
                                    pinverse = "http://marklogic.com/chigovdata/vocab#received";
                                
                                } else if (p === "http://marklogic.com/chigovdata/vocab#givenBy") {
                                    pinverse = "http://marklogic.com/chigovdata/vocab#gave";
                                }
                                
                                if (ljson[pinverse] === undefined) {
                                    ljson[pinverse] = [];
                                }
                                var o = {};
                                if (r.n) {
                                    o.o = r.s.value;
                                    o.otype = "label";
                                    o.l = r.n.value;
                                } else {
                                    o.o = r.s.value;
                                    o.otype = "uri";
                                }
                                ljson[pinverse].push(o);
                            }
                            
                            if (ljson["http://marklogic.com/chigovdata/vocab#lobbyist"]) {
                                ljson["http://marklogic.com/chigovdata/vocab#lobbyist"] = _.uniq(ljson["http://marklogic.com/chigovdata/vocab#lobbyist"], function(t) {
                                    return t.o
                                });
                            }
                            
                            if (ljson["http://marklogic.com/chigovdata/vocab#employs"]) {
                                ljson["http://marklogic.com/chigovdata/vocab#employs"] = _.uniq(ljson["http://marklogic.com/chigovdata/vocab#employs"], function(t) {
                                    return t.o
                                });
                            }
                    
                            if (ljson["http://marklogic.com/chigovdata/vocab#lobbiedBy"]) {
                                ljson["http://marklogic.com/chigovdata/vocab#lobbiedBy"] = _.uniq(ljson["http://marklogic.com/chigovdata/vocab#lobbiedBy"], function(t) {
                                    return t.o
                                });
                            }
                            
                            if (ljson["http://marklogic.com/chigovdata/vocab#lobbied"]) {
                                ljson["http://marklogic.com/chigovdata/vocab#lobbied"] = _.uniq(ljson["http://marklogic.com/chigovdata/vocab#lobbied"], function(t) {
                                    return t.o
                                });
                            }
                            resourceinfo = { 
                                status: 200,
                                dburi: uri,
                                //dbxml: body,
                                luri: uri,
                                lname: lname,
                                lfor: lfor,
                                lobbyist: lobbyist,
                                llobbied: llobbied,
                                lobbiedby: lobbiedby,
                                ljson: ljson
                            };
                            cb(null, resourceinfo);
                        });
                    } else {
                        resourceinfo = { 
                            status: 200,
                            dburi: uri,
                            //dbxml: body,
                            searchpage: "/search/",
                            luri: uri,
                            lname: lname,
                            lfor: lfor,
                            lobbyist: lobbyist,
                            llobbied: llobbied,
                            lobbiedby: lobbiedby,
                            ljson: ljson
                        };
                        cb(null, resourceinfo);
                    }
                //}
            //}
        }
    });
    //console.log(lobbyist);
}

module.exports = resourcemodel;