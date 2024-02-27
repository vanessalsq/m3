const distribution = global.distribution;

let routes = (config) => {
  let context = {};
  context.gid = config.gid;
  return {
    put: (service, name, callback) => {
      const remote = {service: 'routes', method: 'put'}; // put?? or get???
      distribution[context.gid].comm.send([service, name], remote, callback);
    },
  };
};

module.exports = routes;
