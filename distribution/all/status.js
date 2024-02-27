const distribution = global.distribution;
const local = require('../local/local');

let status = (config) => {
  let context = {};

  context.gid = config.gid; // contains a property named gid
  return {
    get: (key, callback) => {
      const remote = {service: 'status', method: 'get'};

      if (key === 'heapTotal' || key === 'heapUsed' || key === 'count') {
        distribution[context.gid].comm.send([key], remote, (e, res) => {
          let sum = 0;
          Object.keys(res).forEach((key) => {
            sum += res[key];
            console.log(key, sum);
          });
          callback(e, sum);
        });
      } else {
        distribution[context.gid].comm.send([key], remote, (e, res) => {
          callback(e, res);
        });
      }
    },
    spawn: (nodeToSpawn, callback) => {
      local.status.spawn(nodeToSpawn, (e, v) => {
        if (e) {
          callback(e, null);
        } else {
          console.log(v, 'is succesffully spawned');
          const remote = {service: 'groups', method: 'add', node: v};
          distribution[context.gid].comm.send(
              [context.gid, nodeToSpawn],
              remote,
              (e, res) => {
                if (e) {
                  callback(e, null);
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
          callback(e, null);
        } else {
          callback(null, res);
        }
      });
    },
  };
};

module.exports = status;
