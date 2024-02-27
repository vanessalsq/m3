const distribution = global.distribution;
const local = require('../local/local');

let status = (config) => {
  let context = {};

  context.gid = config.gid || 'all'; // contains a property named gid
  return {
    get: (key, callback) => {
      const remote = {service: 'status', method: 'get'};
      distribution[context.gid].comm.send([key, callback], remote, (e, res) => {
        // local.status.get(key, callback); ??????????
        if (e) {
          return callback(e, null);
        } else {
          if (key == 'heapTotal' || key == 'heapUsed') {
            let sum;
            res.forEach((ele) => {
              sum += ele;
            });
            return callback(null, sum);
          }
          return callback(null, res);
        }
      });
    },
    spawn: (nodeToSpawn, callback) => {
      local.status.spawn(nodeToSpawn, (e, v) => {
        if (e) {
          return callback(e, null);
        } else {
          console.log(v, 'is succesffully spawned');
          const remote = {service: 'groups', method: 'add', node: v};
          distribution[context.gid].comm.send(
            [context.gid, nodeToSpawn],
            remote,
            (e, res) => {
              if (e) {
                return callback(e, null);
              } else {
                callback(null, res);
              }
            },
          );
        }
      });
    },
    stop: (callback) => {
      const remote = {service: 'status', method: 'stop'};
      distribution[context.gid].comm.send(callback, remote, (e, res) => {
        if (e) {
          return callback(e, null);
        } else {
          return callback(null, res);
        }
      });
    },
  };
};

module.exports = status;
