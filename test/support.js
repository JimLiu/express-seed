var models          = require('../server/models'),
  moment            = require('moment'),
  Support           = {};


Support.createTestUser = function(callback) {
  var newUser = {
    email: "test-email-" + moment().unix() + "@gmail.com",
    password: moment().unix(),
    screenName: "test-screen_name-" + moment().unix()
  };

  models.User.create(newUser.email, newUser.password, newUser.screenName, callback);
};


module.exports = Support;