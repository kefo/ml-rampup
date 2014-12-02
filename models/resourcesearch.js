var config = require('../config');
var request = require('request');
var _ = require('lodash');

var Resource = require('../models/resource');

var resourcesearchmodel = {};

resourcesearchmodel.search = function(q, format, serialization, page, cb) {
    console.log(q);
    
    var queryraw = "";  // as passed
    var queryqs = ""; // escaped and properly formatted query string
    var query = ""; // (unencoded) query for ML search

    var qparams = [];
    var simpleparams = [];
    if (q !== undefined) {
        queryraw = q;
        if (q.constructor === Array) {
            //queryqs = queryraw.join("&q=");
            queryraw = _.without(queryraw, "");
            query = queryraw.join(" AND ");
            for (var q in queryraw) {
                if (queryraw[q].trim() !== "") {
                    qparams.push({query: queryraw[q]});
                    simpleparams.push(encodeURIComponent(queryraw[q]));
                }
            }
        } else if ( queryraw.trim() !== "") {
            query = queryraw;
            queryqs = queryraw;
            qparams.push({query: query});
            simpleparams.push(encodeURIComponent(query));
        }
        queryqs = simpleparams.join("&rs:q=");
    }
    
    var details = {};
    details.queryqs = queryqs;
    details.queryraw = queryraw;
    details.query = query;
    details.qparams = qparams;
    
    for (q=0;q<simpleparams.length;q++) {
        var qparams_modified = _.without(simpleparams, simpleparams[q]);
        var newsearch = qparams_modified.join("&q=");
        qparams[q].newsearch = newsearch;
    }
    console.log(details);
    
    var pagenumber = parseInt(page);
    if (format === undefined || format !== "raw") {
        format = "normal";
    }
    if (serialization === undefined || serialization !== "json") {
        serialization = "html";
    }
    if (isNaN(pagenumber)) {
        pagenumber = 1;
    }
    var pagelength = 10;
    var startat = (pagenumber-1) * pagelength + 1;
    
    request({ 
        method: 'GET',
        uri: 'http://' + config.mlrest.host + ':' + config.mlrest.port +'/v1/resources/semsparql?rs:q=' + encodeURIComponent(query) + "&rs:start=" + startat,
        auth: {
            'user': config.ml.adminuser,
            'pass': config.ml.adminpass,
            'sendImmediately': false
        },
        headers: {
            'Accept': 'application/json'
        }
    }, function (error, response, body) {
        if (error) {
            console.error('request failed:', body);
            return console.error('request failed:', error);
        }
        //console.log(body);
        var rjson = JSON.parse(body);
        if (format === "raw") {
            details.raw = rjson;
            cb(null, details);
        } else {
            details.total = rjson.results.bindings.length;
            details.start = startat;
            details.pagelength = pagelength;
            details.numberofpages = Math.ceil(details.total / details.pagelength);
            details.pagenumber = Math.floor(details.start / details.pagelength) + 1;
            
            details.searchpage = "/search/";
            /*
            details.facets = rjson.facets;
            for (var i in details.facets) {
                details.facets[i].fname = i;
                if (i === "doccategory") {
                    details.facets[i].label = "Record Types";
                } else if (i === "clientindustry") {
                    details.facets[i].label = "Client Industry";
                } else if (i === "lobbyfirm") {
                    details.facets[i].label = "Lobbying Firm";
                } else if (i === "lobbieddept") {
                    details.facets[i].label = "Lobbied Dept.";
                } else {
                    details.facets[i].label = i;
                }
                for (var v in details.facets[i].facetValues) {
                    var fv = details.facets[i].facetValues[v];
                    var s = i + ":\"" + fv.value + "\"";
                    fv.selected = false;
                    fv.value = encodeURIComponent(fv.value)
                    if ( query.indexOf(s) > -1) {
                        fv.selected = true;
                    }
                    //console.log(fv);
                }
            }
            console.log(details.facets);
            */
            if ( rjson.results.bindings.length > 0 ) {
                details.hits = [];
                var pageto = pagelength + startat;
                if ( rjson.results.bindings.length < pageto ) {
                    pageto = rjson.results.bindings.length;
                }
                console.log(pageto);
                for (var i=(startat-1); i < pageto; i++) {
                    if (rjson.results.bindings[i] !== undefined) {
                        var b = rjson.results.bindings[i];
                        console.log("Describing:" + b.s.value);
                        Resource.describe(b.s.value, 0, function(err, resourceinfo) {
                            var s = JSON.parse(JSON.stringify(b));
                            if (err) {
                                console.error('error returning Resource:', err);
                            }
                            s.documentinfo = resourceinfo;
                            console.log("Returned: " + resourceinfo.luri);
                            //console.log(s);
                            details.hits.push(s);
                            //console.log(details.hits);
                            if ( pagelength === details.hits.length || pageto === details.hits.length) {
                                console.log(details.hits);
                                //var hits_sorted = _.sortBy(details.hits, 'index');
                                //details.hits = hits_sorted;
                                cb(null, details);
                            }
                        });
                    }
                }
                //cb(null, details);
            } else {
                console.log("No results found.");
                details.hits = [];
                cb(null, details);
            }
        }
    });
}

module.exports = resourcesearchmodel;