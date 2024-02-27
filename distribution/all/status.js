const distribution = global.distribution;
const local = require('../local/local');

let status = (config) => {
  let context = {};
  let sum;

  context.gid = config.gid; // contains a property named gid
  return {
    get: (key, callback) => {
      const remote = {service: 'status', method: 'get'};
      distribution[context.gid].comm.send([key], remote, (e, res) => {
        if (e) {
          return callback(e, null);
        } else {
          if (key == 'heapTotal' || key == 'heapUsed') {
            res.forEach((ele) => {
              sum += ele;
            });
            return callback(null, sum * 2);
          } else {
            return callback(null, res);
          }
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
      distribution[context.gid].comm.send([], remote, (e, res) => {
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
