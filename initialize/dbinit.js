var request = require('request');
var xml2js = require('xml2js');

var config = require('../config');

var xml2jsparser = new xml2js.Parser();
// require('request').debug = true

var restapi = {
  "rest-api": 
  {
    "name": "rampup-appserver",
	"group": "Default",
    "database": "rampup-db",
	"modules-database": "rampup-modules",
    "port": "7002"
  }
};

var action = process.argv[2];

if (action == "delete") {
    request({
        method: "DELETE",
        url: 'http://' + config.mlrest.host + ':8002/v1/rest-apis/' + config.mlrest.appservername + '?include=content&include=modules',
        auth: {
            'user': config.ml.adminuser,
            'pass': config.ml.adminpass,
            'sendImmediately': false
        }
    }, function(err,httpResponse,body){ 
        //console.log(err);
        console.log(httpResponse)
        console.log(body)
    })
} else {
    request({
        method: "POST",
        url:'http://' + config.mlrest.host + ':8002/v1/rest-apis',
        auth: {
            'user': config.ml.adminuser,
            'pass': config.ml.adminpass,
            'sendImmediately': false
        },
        body: restapi,
        json: true,
        headers: { 
            'Accept': 'application/json',
            'Content-type': 'application/json'
        }
    }, function(err,httpResponse,body){ 
        if (!err && httpResponse.statusCode == 201) {
            console.log("Rest app server created successfully.");
        } else {
            console.log(err);
            //console.log(httpResponse);
            if (typeof body !== "undefined") {
                xml2jsparser.parseString(body, function (err, result) {
                    console.log(err)
                    console.log(result)
                });
            }
        }
    })
}
