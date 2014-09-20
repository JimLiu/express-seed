var uuid = require('node-uuid'),
    moment = require('moment'),
    models = require('../models'),
    logger = require('../logger');

var getExpiresDate = function() {
  return moment().add(30, 'days').toDate();
};

var getToken = function(req) {
  if (req.signedCookies.forumjsToken) {
    var token = JSON.parse(req.signedCookies.forumjsToken);
    return token;
  }
  return null;
};

var clearToken = function(res) {
  res.clearCookie('forumjsToken', {});
};

exports.ensureApiLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.send(401, {"code" : 401, "message": "Authentication Required"});
  }
};

exports.ensureLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    var returnUrl = req.originalUrl || req.url;
    res.redirect("/signin?returnUrl=" + encodeURIComponent(returnUrl));
  }
};


exports.autoLogin = function(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    // check if the user is presenting a remember me cookie
    var token = getToken(req);
    if (token) {
      models.user.findByToken(token, function(err, user) {
        if (err) {
          // no token matched, woops! clear all tokens
          clearToken(res);
          return next();
        }
        if (user) {
          // TODO: Generate a new sequence token
          req.login(user, next);
        } else {
          // no user matched, woops! clear all tokens
          clearToken(res);
          return next();
        }
      });

    } else {
      // leave unlogged in, do nothing
      next();
    }
  } else {
    next();
  }
};



