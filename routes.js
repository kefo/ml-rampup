var config = require('./config');

var DocSearch = require('./models/docsearch');
var Doc = require('./models/document');

var ResourceSearch = require('./models/resourcesearch');
var Resource = require('./models/resource');

module.exports = function (app) {
    
    app.get('/', function (req, res) {
        res.render('index', { user : req.user, error : req.query.error });
    });
    
    app.get(/^\/docs\/(lobbyists|gifts)\/([0-9A-Z\-]+).(html|xml|json)$/, function (req, res, next) {
        console.log("Match");
        var serialization = req.params[2];
        Doc.describe('/docs/' + req.params[0] + '/' + req.params[1] + '.xml', function(err, lobbyist) {
            if (lobbyist.status === 404) {
                res.status(404).send('Not found.');
            } else {
                if (serialization === "xml") {
                    res.type('application/xml');
                    res.send(lobbyist.dbxml);
                } else if (serialization === "json") { 
                    res.type('application/json');
                    res.send(lobbyist.ljson);
                } else {
                    res.render('lobbyist', lobbyist);
                }
            }
        });
    });
    
    app.get("/docs/search/", function(req, res) {
        
        console.log(req.query);
        var format = req.query.format;
        var serialization = req.query.serialization;
        var pagenumber = parseInt(req.query.page);

        if (format === undefined || format !== "raw") {
            format = "normal";
        }
        if (serialization === undefined || serialization !== "json") {
            serialization = "html";
        }
    
        DocSearch.search(req.query.q, format, serialization, pagenumber, function(err, details) {
            if (format === "raw") {
                res.send(details.raw);
            } else if (details.hits.length > 0) {
                if (serialization === "json") {
                    res.send(details);    
                } else {
                    console.log(details);
                    res.render('docsearch', { results: details });
                }
            } else {
                console.log("No results found.");
                details.hits = [];
                res.render('docsearch', { msg: "No results found. Please try again.", results: details });
            }
        });
    });
    
    
    app.get(/^\/resources\/([0-9A-Za-z\-\/]+).(html|xml|json)$/, function (req, res, next) {
        console.log("Match");
        var serialization = req.params[1];
        Resource.describe('http://' + config.app.host + ':' + config.app.port + '/resources/' + req.params[0], 1, function(err, resource) {
            if (resource.status === 404) {
                res.status(404).send('Not found.');
            } else {
                if (serialization === "xml") {
                    res.type('application/xml');
                    res.send(resource.dbxml);
                } else if (serialization === "json") { 
                    res.type('application/json');
                    res.send(resource.ljson);
                } else {
                    res.render('resource', resource);
                }
            }
        });
    });

    app.get("/search/", function(req, res) {
        
        console.log(req.query);
        var format = req.query.format;
        var serialization = req.query.serialization;
        var pagenumber = parseInt(req.query.page);

        if (format === undefined || format !== "raw") {
            format = "normal";
        }
        if (serialization === undefined || serialization !== "json") {
            serialization = "html";
        }
    
        ResourceSearch.search(req.query.q, format, serialization, pagenumber, function(err, details) {
            if (format === "raw") {
                res.send(details.raw);
            } else if (details.hits.length > 0) {
                if (serialization === "json") {
                    res.send(details);    
                } else {
                    //console.log(details);
                    res.render('docsearch', { results: details });
                }
            } else {
                console.log("No results found.");
                details.hits = [];
                res.render('docsearch', { msg: "No results found. Please try again.", results: details });
            }
        });
    })

    app.get("/about.html", function(req, res) {
        res.render('about');
    });
    app.get("/gettingstarted.html", function(req, res) {
        res.render('gettingstarted');
    });
};
