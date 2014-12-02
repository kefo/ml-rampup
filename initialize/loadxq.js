var fs = require('fs');
var request = require('request');
var config = require('../config');

fs.readdir("../xq/modules/", function(err, files) {
    files.forEach(function (f) {
        fs.readFile("../xq/modules/" + f, { encoding: "utf-8" }, function (err, data) {
            request(
            { 
                method: 'PUT',
                uri: 'http://' + config.mlrest.host + ':' + config.mlrest.port + '/v1/ext/modules/' + f,
                auth: {
                    'user': config.ml.adminuser,
                    'pass': config.ml.adminpass,
                    'sendImmediately': false
                },
                headers: {
                    'Content-type': 'application/xquery'
                },
                body: data
            }, function (error, response, body) {
                if (error) {
                    return console.error('Module: ' + f + ' - PUT failed:', error);
                }
                console.log('Module: ' + f + ' - PUT successful!');
            }
            )    
        });
    });
});

fs.readdir("../xq/services/", function(err, files) {
    files.forEach(function (f) {
        fs.readFile("../xq/services/" + f, { encoding: "utf-8" }, function (err, data) {
            request(
            { 
                method: 'PUT',
                uri: 'http://' + config.mlrest.host + ':' + config.mlrest.port + '/v1/config/resources/' + f.replace('.xqy', ''),
                auth: {
                    'user': config.ml.adminuser,
                    'pass': config.ml.adminpass,
                    'sendImmediately': false
                },
                headers: {
                    'Content-type': 'application/xquery'
                },
                body: data
            }, function (error, response, body) {
                if (error) {
                    return console.error('Service: ' + f + ' - PUT failed:', error);
                }
                console.log('Service: ' + f + ' - PUT successful!');
            }
            )    
        });
    });
});

fs.readdir("../xq/transforms/", function(err, files) {
    files.forEach(function (f) {
        fs.readFile("../xq/transforms/" + f, { encoding: "utf-8" }, function (err, data) {
            request(
            { 
                method: 'PUT',
                uri: 'http://' + config.mlrest.host + ':' + config.mlrest.port + '/v1/config/transforms/' + f.replace('.xqy', ''),
                auth: {
                    'user': config.ml.adminuser,
                    'pass': config.ml.adminpass,
                    'sendImmediately': false
                },
                headers: {
                    'Content-type': 'application/xquery'
                },
                body: data
            }, function (error, response, body) {
                if (error) {
                    return console.error('Transform: ' + f + ' - PUT failed:', error);
                }
                console.log('Transform: ' + f + ' - PUT successful!');
            }
            )    
        });
    });
});