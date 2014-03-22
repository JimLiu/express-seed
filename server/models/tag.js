var moment        = require('moment'),
    base          = require('./base'),
    User          = require('./user'),
    dp            = require('../data_providers'),
    logger        = require('../logger'),
    errors        = require('../errorHandling'),
    Tag           = {};

Tag.saveTags = function(tagNames, callback) {
  dp.Tag.saveTags(tagNames, callback);
};

Tag.getTagIds = function(tagNames, callback) {
  dp.Tag.getTagIds(tagNames, callback);
};

Tag.getTags = function(ids, callback) {
  dp.Tag.getTags(ids, callback);
};


module.exports = Tag;