var _               = require('lodash'),
    moment          = require('moment'),
    gravatar        = require('gravatar'),
    Enums          = {};


Enums.roles = {
  user: 0,
  admin: 1,
  moderator: 2,
};

Enums.avatarTypes = {
  gravatar: 0,
  file: 1,
};

Enums.signUpStatus = {
  unknownFailure: 0,
  success: 1,
  screenNameHadBeenUsed: 2,
  emailHadBeenUsed: 4,
};

Enums.signInStatus = {
  unknownFailure: 0,
  success: 1,
  invalidPassword: 2,
  userNotExists: 4,
};


module.exports = Enums;