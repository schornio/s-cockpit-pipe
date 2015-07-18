'use strict';
/* jslint node: true */
/* global describe, it, before, after  */

var TEST_SOCKET_PATH = __dirname + '/test.socket';

var fs = require('fs');
var net = require('net');
var stream = require('stream');
var streamBuffers = require("stream-buffers");

var expect = require('chai').expect;

describe ('s-cockpit-pipe', function () {
  process.env.S_COCKPIT_SOCKET_PATH = TEST_SOCKET_PATH;

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

    socketListener.on('readable', function () {
      var chunk = socketListener.read();
      var chunkString = chunk.toString();
      var chunkObject = JSON.parse(chunkString);

      expect(chunkObject).to.be.eql({ cs: 'Hallo Welt' });
      done();
    });

    sCockpitPipe(fakeStdIn);

    fakeStdInBuffer.put('Hallo Welt', 'utf8');
  });

});
