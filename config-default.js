var config = {}

config.app = {};
config.app.host = "localhost";
config.app.port = "7000";

config.ml = {};
config.mlrest = {};

config.ml.adminuser = 'adminuser';
config.ml.adminpass =  'adminpass';

// Info below must remain as-is if you install the package.
config.mlrest.appservername = "rampup-appserver";
config.mlrest.group = "Default";
config.mlrest.database = "rampup-db";
config.mlrest.modulesdatabase = "rampup-modules";
config.mlrest.host = "localhost";
config.mlrest.port = "7002";

module.exports = config;