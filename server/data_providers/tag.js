var moment        = require('moment'),
    db            = require('./db'),
    logger        = require('../logger'),
    errors        = require('../errorHandling'),
    Tag           = {};

Tag.saveTags = function(tagNames, callback) {
  db.saveTags(tagNames, 'tags', 'tag', callback);
};

Tag.getTagIds = function(tagNames, callback) {
  var queryStr = "select id from tags where tag in (?)";
  db.getIds(queryStr, [tagNames], callback);
};

Tag.getTags = function(ids, callback) {
  var queryStr = "SELECT * FROM tags WHERE id IN (?)";
  db.getObjectsByIds(queryStr, ids, callback);
};


module.exports = Tag;