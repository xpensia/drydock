
var fs = require('fs');
var http = require('http');
var path = require('path');

var mkdirp = require('mkdirp');

var api = require('./lib/api');


// save ssh key
var sshDir = path.join(process.env.HOME, '.ssh');
mkdirp.sync(sshDir);
var keyPath = path.join(sshDir, 'id_rsa');
fs.writeFileSync(keyPath, new Buffer(process.env.SSH_KEY, 'base64'));

// api
var srv = http.createServer(function (req, res) {
    if(req.headers['x-drydock-key'] != process.env.API_KEY) {
        res.writeHead(403);
        res.end();
    }
    else if(req.url == '/update') {
        api.updateRepo(req, res);
    }
    else {
        res.writeHead(404);
        res.end();
    }
}).listen(process.env.PORT, function() {
    console.log('Application running on port %d', srv.address().port);
});
