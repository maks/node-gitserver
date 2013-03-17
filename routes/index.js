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
  
  var prefix = (packet.length+4).toString(16);  
  var line = pad(prefix, 4)+packet+"0000"; 
  res.write(line);
  console.log(line);

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

/**
 * num - number to pad
 * pad - number of places to pad to
 * chr - character to use for padding, default to '0'
 */
function pad(num, pad, chr) {
    var pad_char = typeof chr !== 'undefined' ? chr : '0';
    var pad = new Array(1 + pad).join(pad_char);
    return (pad + num).slice(-pad.length);
}