'use strict';
/* jslint node: true */

var winston = require('winston');
var net = require('net');

var log = initLog();

function sCockpitPipe (readable, options, callback) {
  log.info('Connecting ...');
  log.debug('socketPath=%s', options.socketPath);

  var cockpitAgent = net.createConnection({ path: options.socketPath }, function () {

    log.info('Connected');

    readable.on('readable', function () {
      log.debug('Chunk ready');

      var chunk = readable.read();

      if(!chunk) {
        return;
      }

      var chunkString = chunk.toString();
      var chunkObj = { cs: chunkString };
      var serializedChunkObj = JSON.stringify(chunkObj);

      cockpitAgent.write(serializedChunkObj + '\r\n');

      log.silly(serializedChunkObj);
      log.debug('Chunk sent to agent');
    });

  });

  cockpitAgent.on('error', function (error) {
    log.error('error %s', error);
    callback(error);
  });
}

/* istanbul ignore next */
function initLog() {
  return new winston.Logger({
      transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL || 'info', colorize: true }),
      ]
    });
}

module.exports = sCockpitPipe;
