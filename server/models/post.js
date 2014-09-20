var moment        = require('moment'),
    async         = require('async'),
    base          = require('./base'),
    User          = require('./user'),
    data          = require('../data'),
    logger        = require('../logger'),
    Post          = {};

Post.create = function(post, user, callback) {
  post.author_id = user.id;
  data.post.create(post, Post.get, callback);
};

Post.getPosts = function(ids, callback) {
  data.post.getPosts(ids, function(err, posts) {
    if (err) {
      callback(err);
    } else {
      async.parallel([
        function(callback) {
          Post.setUserForPosts(posts, callback);
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


Post.getAllPosts = function(pageIndex, pageSize, callback) {
  base.getPaginationObjects(pageIndex, pageSize, data.post.getAllPosts, Post.getPosts, callback);
};

Post.getTopPosts = function(count, callback) {
  base.getObjects(function(callback) {
    data.post.getTopPosts(count, callback);
  }, Post.getPosts, callback);
};

module.exports = Post;