#!/usr/bin/env node

const process = require('process');

global.config = global.config || require('./distribution/local/config');

const distribution = {
  util: require('./distribution/util/util.js'),
  local: require('./distribution/local/local.js'),
  node: require('./distribution/local/node.js'),
  all: require('./distribution/all/all'),
};

global.distribution = distribution;
module.exports = distribution;

/* The following code is run when distribution.js is run directly */
if (require.main === module) {
  try {
    distribution.node.start(() => {
    /* Code that runs after your node has booted */
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
