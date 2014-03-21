var moment        = require('moment'),
    db            = require('./db'),
    logger        = require('../logger'),
    errors        = require('../errorHandling'),
    Post          = {};



Post.create = function(post, getPost, callback) {
  var queryStr = "INSERT INTO posts (author_id, title, body, slug, created, status) VALUES (?, ?, ?, ?, ?, ?)";
  var params = [post.author_id, post.title, post.body, post.slug, moment().unix(), post.status];
  db.insertQuery(queryStr, params, getPost, callback);
};

Post.update = function(id, fields, callback) {
  db.updateFields('posts', 'id', id, fields, callback);
};

Post.getPosts = function(ids, callback) {
  var queryStr = "SELECT * FROM posts WHERE id IN (?)";
  db.getObjectsByIds(queryStr, ids, function(err, posts) {
    if (err) {
      callback(err);
    } else {
      callback(null, posts);
    }
  });
};

module.exports = Post;
