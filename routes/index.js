/*jshint node:true, es5:true */

"use strict";

var child_process = require('child_process'),
    spawn = child_process.spawn;

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*
 * GET Git Info Refs
 */

exports.getInfoRefs = function(req, res){
  console.log("doing getInfoRefs");
    
  res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/x-git-receive-pack-advertisement');

  var packet = "# service=git-receive-pack\n";
  var length = packet.length + 4;
  var hex = "0123456789abcdef";
  var prefix = hex.charAt (length >> 12) & 0xf;
  prefix = prefix + hex.charAt(length >> 8) & 0xf;
  prefix = prefix + hex.charAt(length >> 4) & 0xf;
  prefix = prefix + hex.charAt(length) & 0xf;
  res.write(prefix+packet+"0000");
  console.log(prefix+packet+"0000");

  var git = spawn('git-receive-pack', ['--stateless-rpc', '--advertise-refs', '/home/maks/tmp/gitserver-repos/gitserver']);
  //git.stdout.pipe(res);
  git.stdout.on('data', function(data) {
      console.log('stdout: ' + data);
      res.write(data);
  });
  git.stderr.on('data', function(data) {
    console.log("stderr: "+data);
  });
  git.on('exit', function() {
    console.log('git spawn exit');  
    res.end();
  });
};

exports.postReceivePack = function(req, res) {
  res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/x-git-receive-pack-result');

  var git = spawn('git-receive-pack', ['--stateless-rpc', '/home/maks/tmp/gitserver-repos/gitserver']);
  req.pipe(git.stdin);
  git.stdout.pipe(res);
  git.stderr.on('data', function(data) {
    console.log("stderr: "+data);
  });
  git.on('exit', function() {
    res.end();
  });
};
