
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var http = require('http');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var mkdirp = require('mkdirp');

exports.updateRepo = function(req, res) {
    if(!req.headers['x-repo-url']) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error:'missing header "X-Repo-Url"'}));
        return;
    }

    var url = req.headers['x-repo-url'];
    var repos = path.join(process.env.STORAGE_PATH, 'repos');

    mkdirp(repos, function (err) {
        if(err) {
            console.error("Can't create storage directory", err);
            console.error(err.stack);
            res.writeHead(500, {'Content-Type': 'application/json'});
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
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({error:'error updating repository'}));
                        return;
                    }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success:'successfully updated repository'}));
                });
            }
            else {
                exec('git clone --bare '+url+' '+repo, function (err, stdout, stderr) {
                    if(err) {
                        console.error("Can't clone repository %s", url);
                        console.error(stderr);
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({error:'error cloning repository'}));
                        return;
                    }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success:'successfully cloned repository'}));
                });
            }
        });
    });
};

exports.buildCommit = function(req, res) {
    if(!req.headers['x-repo-url']) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error:'missing header "X-Repo-Url"'}));
        return;
    }
    if(!req.headers['x-commit-hash']) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error:'missing header "X-Commit-Hash"'}));
        return;
    }
    if(!req.headers['x-docker-host']) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error:'missing header "X-Docker-Host"'}));
        return;
    }

    var url = req.headers['x-repo-url'];
    var h = crypto.createHash('md5').update(url).digest('hex');
    var repo = path.join(process.env.STORAGE_PATH, 'repos');
    var commit = req.headers['x-commit-hash'];

    fs.exists(repo, function (exists) {
        if(!exists) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error:'repository not available on this host'}));
            return;
        }
        var docker = req.headers['x-docker-host'].split(':');
        var aReq = http.request({
            method: 'post',
            hostname: docker[0],
            port: docker[1],
            path: '/build'+url.parse(req.url).search
        }, function (aRes) {
            aRes.pipe(res);
        });
        var git = spawn('git', ['--git-dir='+repo, 'archive', '--format', 'tar', commit]);
        git.stdout.pipe(aReq);
    });
};
