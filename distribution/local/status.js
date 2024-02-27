const id = require('../util/id');
const {spawn} = require('child_process');
const wire = require('../util/wire');
const path = require('path');
const util = require('../util/util');

const status = {};

global.moreStatus = {
  sid: id.getSID(global.nodeConfig),
  nid: id.getNID(global.nodeConfig),
  counts: 0,
};

status.get = function (configuration, callback) {
  callback = callback || function () {};

  if (configuration in global.nodeConfig) {
    callback(null, global.nodeConfig[configuration]);
  } else if (configuration in moreStatus) {
    callback(null, moreStatus[configuration]);
  } else if (configuration === 'heapTotal') {
    callback(null, process.memoryUsage().heapTotal);
  } else if (configuration === 'heapUsed') {
    callback(null, process.memoryUsage().heapUsed);
  } else {
    callback(new Error('Status key not found'));
  }
};

status.spawn = function (conf, callback) {
  // Create RPC from callback
  conf.onStart = conf.onStart || function () {};
  conf.onStart = new Function(
    `
      let old = ${conf.onStart.toString()};
      let rpc = ${wire.createRPC(wire.toAsync(callback)).toString()};

      old();
      rpc(null, global.nodeConfig, ()=>{});
  `,
  );

  spawn(
    'node',
    [
      path.join(__dirname, '../../distribution.js'),
      '--config',
      util.serialize(conf),
    ],
    {
      detached: true,
    },
  );
};

status.stop = function (callback) {
  callback = callback || function () {};
  callback(null, global.nodeConfig);
  global.server.close();

  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

module.exports = status;
