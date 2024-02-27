// To Do
let gossip = (config) => {
  let context = {};
  context.gid = config.gid || 'all'; // contains a property named gid
  return {
    send: () => {
      /** uses context **/
    },
    at: () => {
      /**uses context**/
    },
    del: () => {
      /**uses context**/
    },
  };
};

module.exports = gossip;
