const id = require('../util/id');

const groups = {};

groups.get = function (groupName, callback) {
  if (!groups[groupName]) {
    const err = new Error('Group not found');
    return callback(err);
  }
  return callback(null, groups[groupName]); // return the group of nodes
};

groups.del = function (groupName, callback) {
  if (!groups[groupName]) {
    const err = new Error('Group not found');
    return callback(err);
  }
  const groupData = groups[groupName];
  delete groups[groupName];
  return callback(null, groupData);
};

groups.put = function (groupName, groupData, callback) {
  groups[groupName] = groupData;
  return callback(null, groups[groupName]);
};

groups.add = function (groupName, node, callback) {
  if (!groups[groupName]) {
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
  if (!groups[groupName]) {
    const err = new Error('Group not found');
    return callback(err);
  }
  const removed = groups[groupName][nodeId];
  delete groups[groupName][nodeId];
  return callback(null, removed);
};

module.exports = groups;
