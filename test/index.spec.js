'use strict';
/* jslint node: true, expr:true */
/* global describe, it, before, after  */

var TEST_SOCKET_PATH = __dirname + '/test.socket';

var fs = require('fs');
var net = require('net');
var stream = require('stream');
var streamBuffers = require("stream-buffers");

var expect = require('chai').expect;

describe ('s-cockpit-pipe', function () {
  process.env.LOG_LEVEL = 'off';
  
  var sCockpitPipe = require(__dirname + '/../index.js');
  var socketListener;

  before (function (done) {
    socketListener = net.createServer();
    socketListener.listen(TEST_SOCKET_PATH, done);
  });

  after (function (done) {
    fs.unlink(TEST_SOCKET_PATH, done);
  });

  it ('should send log chunks from stdin to s-cockpit socket', function (done) {
    var fakeStdInBuffer = new streamBuffers.ReadableStreamBuffer();
    var fakeStdIn = new stream.Readable().wrap(fakeStdInBuffer);

    socketListener.on('connection', function (connection) {
      connection.on('readable', function () {
        var chunk = connection.read();
        var chunkString = chunk.toString();
        var chunkObject = JSON.parse(chunkString);

        expect(chunkObject).to.be.eql({ cs: 'Hallo Welt' });
        done();
      });
    });

    sCockpitPipe(fakeStdIn, { socketPath: TEST_SOCKET_PATH });

    fakeStdInBuffer.put('Hallo Welt', 'utf8');
  });

  it ('should emit an error callback when something odd happes', function (done) {
    var fakeStdInBuffer = new streamBuffers.ReadableStreamBuffer();
    var fakeStdIn = new stream.Readable().wrap(fakeStdInBuffer);

    sCockpitPipe(fakeStdIn, { socketPath: __dirname + 'invalid/path/log.socket' }, function (error) {
      expect(error).to.be.ok;
      done();
    });

  });

});
