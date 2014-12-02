RampUp Project - Lobbying Chicago

  `npm install`  

Then, set up the database and install a few things.  Finally, load some data.

  `cp config-default.js config.js`  

Modify the relevant values.  Note, regardless of what ports you choose in the config
file, it will install to port 7002 using these instructions.
  
  `cd initialize`  
  `node packaage-import.js` - Create database, appserver.  
  `node loadxq.js` - Load the xquery modules, probably unnecessary for setup.  
  `node query.js` - Load default query config, probably unnecessary for setup.  
  `node load.js` - Load some data, crucial for results.  
  
  `cd ..`  
  `node app.js`  






