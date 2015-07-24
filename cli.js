#!/usr/bin/env node

'use strict';
/* jslint node: true */

var SOCKET_PATH = process.env.S_COCKPIT_SOCKET_PATH || '/var/s-cockpit/log.socket';
var readable = process.stdin;

var sCockpitPipe = require(__dirname + '/index.js');
var options = {
  socketPath: SOCKET_PATH
};

sCockpitPipe(readable, options, function (error) {
  process.exit(1);
});
