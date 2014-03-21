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


module.exports = Tag;