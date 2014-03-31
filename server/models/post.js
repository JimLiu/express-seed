var moment        = require('moment'),
    async         = require('async'),
    base          = require('./base'),
    User          = require('./user'),
    Tag           = require('./tag'),
    dp            = require('../data_providers'),
    logger        = require('../logger'),
    errors        = require('../errorHandling'),
    Post          = {};

Post.create = function(post, user, callback) {
  post.author_id = user.id;
  dp.Post.create(post, Post.get, callback);
};

Post.getPosts = function(ids, callback) {
  dp.Post.getPosts(ids, function(err, posts) {
    if (err) {
      callback(err);
    } else {
      async.parallel([
        function(callback) {
          Post.setUserForPosts(posts, callback);
        },
        function(callback) {
          Post.setTagsForPosts(posts, callback);
        }
      ], function(err, results) {
        if (err) {
          callback(err);
        } else {
          callback(null, posts);
        }
      });
    }
  });
};

Post.get = function(id, callback) {
  base.getObject(id, Post.getPosts, callback);
};

Post.getPostTags = function(ids, callback) {
  base.getObjectTagsMap(ids, dp.Post.getTagIds, Tag.getTags, callback);
};

Post.setTagsForPosts = function(posts, callback) {
  var getObjectIdFunc = function(post) {
    return post.id;
  };
  var setTagsForObject = function(post, tags) {
    post.tags = tags;
  };
  base.setTagsForObjects(posts, getObjectIdFunc, Post.getPostTags, setTagsForObject, callback);
};

Post.setUserForPosts = function(posts, callback) {
  var getPropertyIdFunc = function(post) {
    return post.author_id;
  };
  var getPropertyObjectIdFunc = function(user) {
    return user.id;
  };
  var setPropertyFunc = function(post, user) {
    post.author = user;
  };
  base.setPropertyForObjects(posts, User.getUsers, getPropertyIdFunc,
    getPropertyObjectIdFunc, setPropertyFunc, callback);
};

Post.saveTags = function(post, tagNames, callback) {
  base.saveObjectTags(post.id, tagNames, Tag.saveTagsAndGetIds, dp.Post.saveTags, callback);
};

Post.getAllPosts = function(pageIndex, pageSize, callback) {
  base.getPaginationObjects(pageIndex, pageSize, dp.Post.getAllPosts, Post.getPosts, callback);
};

Post.getTopPosts = function(count, callback) {
  base.getObjects(function(callback) {
    dp.Post.getTopPosts(count, callback);
  }, Post.getPosts, callback);
};

module.exports = Post;