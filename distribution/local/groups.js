const {group} = require('yargs');
const id = require('../util/id');
const distribution = global.distribution;

const groups = {};

groups.get = function (groupName, callback) {
  if (!groups.hasOwnProperty(groupName)) {
    const err = new Error('Group not found');
    return callback(err);
  }
  return callback(null, groups[groupName]); // return the group of nodes
};

groups.del = function (groupName, callback) {
  if (!groups.hasOwnProperty(groupName)) {
    const err = new Error('Group not found');
    return callback(err);
  }
  const groupData = groups[groupName];
  delete groups[groupName];
  return callback(null, groupData);
};

groups.put = function (groupName, groupData, callback) {
  distribution[groupName] = {};
  distribution[groupName].comm = require('../all/comm')({gid: groupName});
  distribution[groupName].gossip = require('../all/gossip')({
    gid: groupName,
  });
  distribution[groupName].groups = require('../all/groups')({
    gid: groupName,
  });
  distribution[groupName].routes = require('../all/routes')({
    gid: groupName,
  });
  distribution[groupName].status = require('../all/status')({
    gid: groupName,
  });

  groups[groupName] = groupData;

  return callback(null, groups[groupName]);
};

groups.add = function (groupName, node, callback) {
  if (!groups.hasOwnProperty(groupName)) {
    const err = new Error('Group not found');
    return callback(err);
  }
  const groupData = {...groups[groupName]};
  const newNodeId = id.getSID(node);
  groupData[newNodeId] = node;
  groups[groupName] = groupData;
  return callback(null, groups[groupName]);
};

groups.rem = function (groupName, nodeId, callback) {
  if (!groups.hasOwnProperty(groupName)) {
    const err = new Error('Group not found');
    return callback(err);
  }
  const removed = groups[groupName][nodeId];
  delete groups[groupName][nodeId];
  return callback(null, removed);
};

module.exports = groups;
