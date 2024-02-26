const id = require('../util/id');
const {fork} = require('child_process');
const serialization = require('../util/serialization');
const distribution = require('../../distribution');

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
      callback(null, process.memoryUsage().heapUsed);
    default:
      callback(new Error('Invalid key'));
  }
};

status.spawn = function (conf, callback) {
  // Create RPC from callback
  const rpc = distribution.util.wire.createRPC(callback); //onStart??? or callback

  const combined = {...conf, onStart: rpc};

  const serialized = JSON.stringify(combined);

  // launch child process
  const child = fork('distribution.js', [serialized]);

  child.on('message', (message) => {
    if (message == 'booted') {
      callback(null, nodeConfig);
    }
  });
};

status.stop = function (callback) {
  callback(null, 'stopping the server...');
  setTimeout(() => {
    // Stop the server
    console.log('stopping the server...');
    //server.close ?
  }, 1000);
};

module.exports = status;
