
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var exec = require('child_process').exec;

var mkdirp = require('mkdirp');

exports.updateRepo = function(req, res) {
    if(!req.headers['x-repo-url']) {
        res.writeHead(400);
        res.end(JSON.stringify({error:'missing header "X-Repo-Url"'}));
        return;
    }

    var url = req.headers['x-repo-url'];
    var repos = path.join(process.env.STORAGE_PATH, 'repos');

    mkdirp(repos, function (err) {
        if(err) {
            console.error("Can't create storage directory", err);
            console.error(err.stack);
            res.writeHead(500);
            res.end(JSON.stringify({error:'internal error'}));
            return;
        }
        var h = crypto.createHash('md5').update(url).digest('hex');
        var repo = path.join(repos, h);
        fs.exists(repo, function (exists) {
            if(exists) {
                exec('git --git-dir='+repo+' fetch origin', function (err, stdout, stderr) {
                    if(err) {
                        console.error("Can't clone repository %s", url);
                        console.error(stderr);
                        res.writeHead(500);
                        res.end(JSON.stringify({error:'error updating repository'}));
                        return;
                    }
                    res.writeHead(200);
                    res.end(JSON.stringify({success:'successfully updated repository'}));
                });
            }
            else {
                exec('git clone --bare '+url+' '+repo, function (err, stdout, stderr) {
                    if(err) {
                        console.error("Can't clone repository %s", url);
                        console.error(stderr);
                        res.writeHead(500);
                        res.end(JSON.stringify({error:'error cloning repository'}));
                        return;
                    }
                    res.writeHead(200);
                    res.end(JSON.stringify({success:'successfully cloned repository'}));
                });
            }
        });
    });
};
