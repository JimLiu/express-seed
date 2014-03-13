var moment        = require('moment'),
    db            = require('./db'),
    logger        = require('../logger'),
    errors        = require('../errorHandling'),
    User          = {};


User.validate = function(email, password, callback) {
  var queryStr = "SELECT id FROM users where email = ? and password = ?";
  db.getId(queryStr, [email, password], function(err, id) {
    if (err) {
      callback(err);
    } else {
      callback(null, id);
    }
  });
};

User.create = function(user, getUser, callback) {
  var result = {
    status: 'success',
    user: null
  };
  var queryStr = "SELECT COUNT(id) AS count FROM users where email = ?";
  db.exists(queryStr, [user.email], function(err, exists) {
    if (err) {
      callback(err);
    } else {
      if (exists) {
        result.status = 'duplication';
        callback(null, result);
      } else {
        queryStr = "INSERT INTO users (email, password, screen_name, created) VALUES (?, ?, ?, ?)";
        var params = [user.email, user.password, user.screen_name, moment().unix()];
        db.insertQuery(queryStr, params, getUser, function(err, user) {
          result.user = user;
          callback(null, result);
        });
      }
    }
  });
};

User.update = function(userId, fields, callback) {
  db.updateFields('users', 'id', userId, fields, callback);
};

User.getUsers = function(ids, callback) {
  var queryStr = "SELECT * FROM users WHERE id IN (@ids)";
  db.getObjectsByIds(queryStr, ids, function(err, users) {
    if (err) {
      callback(err);
    } else {
      callback(null, users);
    }
  });
};



User.saveToken = function(token, callback) {
  var queryStr = "REPLACE INTO user_tokens (user_id, token, created, expires) VALUES (?, ?, ?, ?)";
  db.executeQuery(queryStr, [token.userId, token.token, moment().unix(), moment(token.expires).unix()], callback);
};

User.findByToken = function(token, callback) {
  var queryStr = "SELECT user_id FROM user_tokens WHERE token = ?";
  db.getId(queryStr, [token.token], callback);
};


module.exports = User;