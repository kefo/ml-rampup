var request = require('request');
var xml2js = require('xml2js');
var config = require('../config');

var options = {
    "options": {
        "constraint": [
            {
                "name": "doccategory",
                "range": {
                    "type": "xs:string",
                    "element": {
                        "name": "doccategory",
                        "ns": "http://data.cityofchicago.org/rows/"
                    },
                    "facet-option" : [ "frequency-order" ],
                    "collation" : "http://marklogic.com/collation/",
                    "facet": true
                }
            },
            {
                "name": "clientindustry",
                "range": {
                    "type": "xs:string",
                    "element": {
                        "name": "client_industry",
                        "ns": "http://data.cityofchicago.org/rows/"
                    },
                    "facet-option" : [ "frequency-order" ],
                    "collation" : "http://marklogic.com/collation/",
                    "facet": true
                }
            },
            {
                "name": "lobbyfirm",
                "range": {
                    "type": "xs:string",
                    "element": {
                        "name": "employer_name",
                        "ns": "http://data.cityofchicago.org/rows/"
                    },
                    "facet-option" : [ "frequency-order" ],
                    "collation" : "http://marklogic.com/collation/",
                    "facet": true
                }
            },
            {
                "name": "lobbieddept",
                "range": {
                    "type": "xs:string",
                    "element": {
                        "name": "lobbied_department_name",
                        "ns": "http://data.cityofchicago.org/rows/"
                    },
                    "facet-option" : [ "frequency-order" ],
                    "collation" : "http://marklogic.com/collation/",
                    "facet": true
                }
            }
        ],
        "return-facets": true
    }
};

request({
        method: "PUT",
        url:'http://' + config.mlrest.host + ':' + config.mlrest.port + '/v1/config/query/default',
        auth: {
            'user': config.ml.adminuser,
            'pass': config.ml.adminpass,
            'sendImmediately': false
        },
        body: options,
        json: true,
        headers: { 
            'Accept': 'application/json',
            'Content-type': 'application/json'
        }
    }, function(err,httpResponse,body){ 
        if (!err && httpResponse.statusCode == 201) {
            console.log("Query options created.");
        } else if (!err && httpResponse.statusCode == 204) {
            console.log("Query options updated.");
        }else {
            console.log(err);
            //console.log(httpResponse);
            if (typeof body !== "undefined") {
                console.log(err);
                console.log(body);
            }
        }
    })