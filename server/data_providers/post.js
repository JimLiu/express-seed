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
  db.getObjectsByIds(queryStr, ids, callback);
};

Post.saveTags = function(id, tagIds, callback) {
  db.saveObjectTags(id, tagIds, 'tags', 'tag_id', 'posts_tags', 'post_id', callback);
};

Post.getTagIds = function(ids, callback) {
  var queryStr = "SELECT post_id, tag_id FROM posts_tags WHERE post_id in (?)";
  db.executeQuery(queryStr, [ids], callback);
};

Post.getAllPosts = function(pageIndex, pageSize, callback) {
  var countQueryStr = "SELECT COUNT(id) AS count FROM posts";
  var idsQueryStr = "SELECT id FROM posts ORDER BY id DESC LIMIT ?, ?";
  db.getCountAndIds(countQueryStr, idsQueryStr, [], pageIndex, pageSize, callback);
};

Post.getTopPosts = function(count, callback) {
  var queryStr = "SELECT id FROM posts ORDER BY id DESC LIMIT 0, ?";
  db.getIds(queryStr, [count], callback);
};

module.exports = Post;
