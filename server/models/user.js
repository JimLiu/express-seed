var moment        = require('moment'),
    base          = require('./base'),
    data          = require('../data'),
    logger        = require('../logger'),
    User          = {};


User.create = function(email, password, screenName, callback) {
  var user = {
    email: email,
    password: password,
    screen_name: screenName,
  };

  data.user.create(user, User.get, callback);
};

User.getUsers = function(ids, callback) {
  data.user.getUsers(ids, function(err, users) {
    if (err) {
      callback(err);
    } else {
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        user.is_banned = user.banned_until > moment().unix();
      }
      callback(null, users);
    }
  });
};

User.get = function(id, callback) {
  base.getObject(id, User.getUsers, callback);
};

User.validate = function(email, password, callback) {
  data.user.validate(email, password, function(err, id) {
    if (err) {
      callback(err);
    } else {
      User.get(id, callback);
    }
  });
};


User.findByToken = function(token, callback) {
  data.user.findByToken(token, function(err, userId) {
    if (err) {
      callback(err);
    } else {
      User.get(userId, callback);
    }
  });
};

User.saveToken = function(token, callback) {
  data.user.saveToken(token, callback);
};


module.exports = User;