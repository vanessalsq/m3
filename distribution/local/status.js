const id = require('../util/id');
const distribution = global.distribution;
const {spawn} = require('child_process');
const wire = require('../util/wire');
const path = require('path');
const util = require('../util/util');

let myState = {
  ID: '',
  NID: '',
  SID: '',
  msgCnt: 0,
  routeMappings: {},
};

global.myState = myState;

const node = global.nodeConfig;
// init route mappings, ids, message counts, etc here
const state = global.myState;
state.NID = id.getNID(node);
state.SID = id.getSID(node);

let status = {};

status.get = function (key, callback) {
  switch (key) {
    case 'nid':
      callback(null, state.NID);
      break;
    case 'sid':
      callback(null, state.SID);
      break;
    case 'ip':
      callback(null, node.ip);
      break;
    case 'port':
      callback(null, node.port);
      break;
    case 'counts':
      callback(null, state.msgCnt);
      break;
    case 'heapTotal':
      callback(null, process.memoryUsage().heapTotal);
    case 'heapUsed':
      if (process.memoryUsage().heapUsed) {
        callback(null, process.memoryUsage().heapUsed);
      } else {
        callback(new Error('No Heap Used'), null);
      }
    default:
      callback(new Error('Invalid key'));
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
