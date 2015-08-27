var moment = require('moment'),
    async = require('async'),
    base = require('./base'),
    Users = require('./users'),
    db = require('./db'),
    logger = require('../logger'),
    Posts = {};

/**
 * Create a new post
 * @param  {[type]}   post     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Posts.create = function(post, callback) {
    var queryStr = "INSERT INTO posts (author_id, title, body, slug, created, status) VALUES (?, ?, ?, ?, ?, ?)";
    var params = [post.author_id, post.title, post.body, post.slug, moment().unix(), post.status];
    db.insertQuery(queryStr, params, function(err, id) {
        if (err) {
            return callback(err);
        }
        Posts.get(id, callback);
    });
};

/**
 * Get posts by ids
 * @param  {[type]}   ids      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Posts.getPosts = function(ids, callback) {
    var queryStr = "SELECT * FROM posts WHERE id IN (?)";
    db.getObjectsByIds(queryStr, ids, function(err, posts) {
        if (err) {
            return callback(err);
        }
        // bind user property
        var getPropertyIdFunc = function(post) {
            return post.author_id;
        };
        var getPropertyObjectIdFunc = function(post) {
            return post.id;
        };
        var setPropertyFunc = function(post, user) {
            post.author = user;
        };
        // bind post with user by post.author_id
        base.setPropertyForObjects(posts, Users.getUsers, getPropertyIdFunc,
            getPropertyObjectIdFunc, setPropertyFunc, callback);
    });
};


/**
 * Get post by post id
 * @param  {[type]}   id       [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Posts.get = function(id, callback) {
    base.getObject(id, Posts.getPosts, callback);
};


/**
 * Get all posts with pagination
 * @param  {[type]}   pageIndex [description]
 * @param  {[type]}   pageSize  [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
Posts.getAllPosts = function(pageIndex, pageSize, callback) {
    var getPaginationData = function(pageIndex, pageSize, callback) {
    }
    var countQueryStr = "SELECT COUNT(id) AS count FROM posts";
    var idsQueryStr = "SELECT id FROM posts ORDER BY id DESC LIMIT ?, ?";
    db.getCountAndIds(countQueryStr, idsQueryStr, [], pageIndex, pageSize, function(err, pagination) {
        if (err) {
            return callback(err);
        }
        base.getPaginationObjects(pagination, Posts.getPosts, callback);
    });
};


module.exports = Posts;