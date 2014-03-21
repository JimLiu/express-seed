var moment        = require('moment'),
    db            = require('./db'),
    logger        = require('../logger'),
    errors        = require('../errorHandling'),
    Tag           = {};

Tag.saveTags = function(tags, callback) {
	db.saveTags('tags', 'tag', tags, callback);
};


module.exports = Tag;