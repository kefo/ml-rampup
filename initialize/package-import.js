var config = require('../config');

var exec = require('child_process').exec;
var cmd1 = 'curl -i -X POST --digest --user ' +  config.ml.adminuser + ':' + config.ml.adminpass;
cmd1 += ' --header "Content-Type:application/zip" -T ./rampup-package.zip ';
cmd1 += 'http://' + config.mlrest.host + ':8002/manage/v2/packages?pkgname=rampup';

exec(cmd1, function(err, stdout, stderr) {
	if (err) {
	    console.log("Error!: " + err);
	} else {
	    console.log("Package ready.")
	    var cmd2 = 'curl -i -X POST --header "Content-type:application/x-www-form-urlencoded" --data "" ';
	    cmd2 += '--digest --user ' +  config.ml.adminuser + ':' + config.ml.adminpass;
	    cmd2 += ' http://' + config.mlrest.host + ':8002/manage/v2/packages/rampup/install';

	   exec(cmd2, function(err2, stdout2, stderr2) {
	        if (err2) {
	            console.log("Error!: " + err2);
        	} else {
        	    console.log("Package installed.");
        	}
	    });   
	}
});
