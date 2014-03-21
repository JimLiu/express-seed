var moment        = require('moment'),
    base          = require('./base'),
    User          = require('./user'),
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
      Post.setUserForPosts(posts, callback);
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



module.exports = Post;