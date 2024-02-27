const local = require('../local/local');

let comm = (config) => {
  let context = {};
  context.gid = config.gid || 'all'; // contains a property named gid
  return {
    send: (message, remote, callback) => {
      local.groups.get(context.gid, (err, nodes) => {
        if (err) {
          return callback(err);
        }

        const responses = {};
        const errors = {};
        let completedCalls = 0;

        // Send a message to each node in the group
        Object.keys(nodes).forEach((nodeId) => {
          local.comm.send(
            message,
            {node: nodes[nodeId], ...remote},
            (err, response) => {
              if (err) {
                errors[nodeId] = err;
              } else {
                responses[nodeId] = response;
              }

              completedCalls++;
              if (completedCalls === Object.keys(nodes).length) {
                callback(errors, responses);
              }
            },
          );
        });
      });
    },
  };
};

module.exports = comm;
