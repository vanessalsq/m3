const local = require('../local/local');
const distribution = global.distribution;

let groups = (config) => {
  let context = {};

  context.gid = config.gid || 'all'; // contains a property named gid

  return {
    get: (groupName, callback) => {
      const remote = {service: 'groups', method: 'get', nodes: [groupName]};

      distribution[context.gid].comm.send(
        [groupName, callback],
        remote,
        (e, res) => {
          if (e) {
            return callback(e, null);
          }
          return callback(null, res);
        },
      );
    },

    put: (groupName, groupData, callback) => {
      const remote = {
        service: 'groups',
        method: 'put',
      };

      distribution[context.gid] = {};
      distribution[context.gid].comm = require('./comm')({gid: context.gid});
      distribution[context.gid].gossip = require('./gossip')({
        gid: context.gid,
      });
      distribution[context.gid].groups = require('./groups')({
        gid: context.gid,
      });
      distribution[context.gid].routes = require('./routes')({
        gid: context.gid,
      });
      distribution[context.gid].status = require('./status')({
        gid: context.gid,
      });

      distribution[context.gid].comm.send(
        [groupName, groupData, callback],
        remote,
        (e, res) => {
          if (e) {
            return callback(e, null);
          }
          return callback(null, res);
        },
      );
    },

    add: (groupName, node, callback) => {
      const remote = {
        service: 'groups',
        method: 'add',
      };

      local.groups.add(context.gid, node, callback);

      distribution[context.gid].comm.send(
        [groupName, node, callback],
        remote,
        (e, res) => {
          if (e) {
            return callback(e, null);
          }
          return callback(null, res);
        },
      );
    },

    rem: (groupName, node, callback) => {
      const remote = {
        service: 'groups',
        method: 'rem',
      };

      distribution[context.gid].comm.send(
        [groupName, node, callback],
        remote,
        (e, res) => {
          if (e) {
            return callback(e, null);
          }
          return callback(null, res);
        },
      );
    },

    del: (groupName, callback) => {
      const remote = {service: 'groups', method: 'del'};

      distribution[context.gid].comm.send(
        [groupName, callback],
        remote,
        (e, res) => {
          if (e) {
            return callback(e, null);
          }
          return callback(null, res);
        },
      );
    },
  };
};

module.exports = groups;
