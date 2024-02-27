const local = require('../local/local');
const distribution = global.distribution;

let groups = (config) => {
  let context = {};

  context.gid = config.gid || 'all'; // contains a property named gid

  return {
    get: (groupName, callback) => {
      const remote = {service: 'groups', method: 'get'};

      distribution[context.gid].comm.send([groupName], remote, callback);
    },

    put: (groupName, groupData, callback) => {
      const remote = {
        service: 'groups',
        method: 'put',
      };
      local.groups.put(context.gid, groupData, (e, v) => {
        if (e) {
          return callback(e, null);
        } else {
          distribution[context.gid].comm.send(
            [groupName, groupData],
            remote,
            callback,
          );
        }
      });
    },

    add: (groupName, node, callback) => {
      const remote = {
        service: 'groups',
        method: 'add',
      };

      local.groups.add(context.gid, node, (e, v) => {
        if (e) {
          return callback(e, null);
        } else {
          distribution[context.gid].comm.send(
            [groupName, node],
            remote,
            callback,
          );
        }
      });
    },

    rem: (groupName, node, callback) => {
      const remote = {
        service: 'groups',
        method: 'rem',
      };

      distribution[context.gid].comm.send([groupName, node], remote, callback);
    },

    del: (groupName, callback) => {
      const remote = {service: 'groups', method: 'del'};

      distribution[context.gid].comm.send([groupName], remote, callback);
    },
  };
};

module.exports = groups;
