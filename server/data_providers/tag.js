var moment        = require('moment'),
    db            = require('./db'),
    logger        = require('../logger'),
    errors        = require('../errorHandling'),
    Tag           = {};

Tag.saveTagsAndGetIds = function(tagNames, callback) {
  db.saveTagsAndGetIds(tagNames, 'tags', 'tag', callback);
};

Tag.getTags = function(ids, callback) {
  var queryStr = "SELECT * FROM tags WHERE id IN (?)";
  db.getObjectsByIds(queryStr, ids, callback);
};


module.exports = Tag;