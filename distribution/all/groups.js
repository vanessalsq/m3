const distribution = require('../../distribution');
const local = require('../local/local');

let groups = (config) => {
  let context = {};
  context.gid = config.gid || 'all';

  global.distribution[context.gid] = {};
  global.distribution[context.gid].comm = require('./comm')({gid: context.gid});
  global.distribution[context.gid].gossip = require('./gossip')({
    gid: context.gid,
  });
  global.distribution[context.gid].routes = require('./routes')({
    gid: context.gid,
  });
  global.distribution[context.gid].status = require('./status')({
    gid: context.gid,
  });

  console.log('distribution status', distribution[context.gid].status);

  const groups = {
    put: (groupName, groupData, callback) => {
      const remote = {
        service: 'groups',
        method: 'put',
      };
      console.log('groups put', groupName);

      local.groups.put(groupName, groupData, (e, v) => {
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

    get: (groupName, callback) => {
      const remote = {service: 'groups', method: 'get'};

      distribution[context.gid].comm.send([groupName], remote, callback);
    },

    add: (groupName, node, callback) => {
      const remote = {
        service: 'groups',
        method: 'add',
      };
      local.groups.add(groupName, node, (e, v) => {
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
      local.groups.rem(groupName, node, (e, v) => {
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

    del: (groupName, callback) => {
      const remote = {service: 'groups', method: 'del'};
      distribution[context.gid].comm.send([groupName], remote, callback);
    },
  };

  global.distribution[context.gid].groups = groups;
  return groups;
};

module.exports = groups;
