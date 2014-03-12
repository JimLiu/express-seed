var uuid = require('node-uuid'),
    moment = require('moment'),
    models = require('../models'),
    logger = require('../logger');

var redirectTo = function(req, res, defaultUrl) {
  defaultUrl = defaultUrl || '/';
  var redirectUrl = defaultUrl;
  if (req.session.redirectUrl) {
    if (req.session.redirectUrl.indexOf('/error/') == -1) { // Don't redirct to an error page
      redirectUrl = req.session.redirectUrl;
    }
    req.session.redirectUrl = null;
  }
  res.redirect(redirectUrl);
};

var getExpiresDate = function() {
  return moment().add('days', 30).toDate();
};

var saveToken = function(res, token) {
  var currentDate = getExpiresDate();
  res.cookie('apptoken', JSON.stringify(token), {
    signed: true,
    expires: currentDate,
    httpOnly: true
  });
};

var getToken = function(req) {
  if (req.signedCookies.apptoken) {
    var token = JSON.parse(req.signedCookies.apptoken);
    return token;
  }
  return null;
};

var clearToken = function(res) {
  res.clearCookie('apptoken', {});
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
      models.User.findByToken(token, function(err, user) {
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


exports.init = function(app, passport) {

  app.get("/signin", function(req, res) {
    // store the return url
    req.session.redirectUrl = req.query.returnUrl || "/";

    res.render('signin', {
      title: 'Sign in',
      errors: null,
      email: req.query.email || '',
      user: null,
      signup: req.query.signup
    });
  });

  app.post('/signin', function(req, res, next) {

    // first validate the login
    req.assert('email', 'You must enter an email address.').notEmpty();
    req.assert('password', 'You must enter a password.').notEmpty();
    req.assert('password', 'Password must be at least 4 characters').len(4);

    var errors = req.validationErrors(true); // get mapped errors
    var email = req.param('email');
    var password = req.param('password');
    var viewParams = {
      title: 'Sign in',
      errors: {},
      email: email,
      user: null,
      signup: req.query.signup
    };
    // if we got errors
    if (errors) {
      viewParams.errors = errors;
      return res.render('signin', viewParams);
    }

    passport.authenticate('local', function(err, user, info) {
      if (err || !user) {
        viewParams.errors = {};
        if (err == 'Invalid email/password' || !user) {
          viewParams.errors.password = {
            param: 'password',
            msg: 'Invalid email/password',
            value: ''
          };
        } else {
          viewParams.errors.general = 'Unknown error.';
        }
        return res.render('signin', viewParams);
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }

        if (req.param('rememberMe')) {
          var newToken = {
            userId: user.id,
            token: uuid.v4(),
            expires: getExpiresDate()
          };
          models.User.saveToken(newToken, function(err, results) {
            if (err) {
              logger.error("saveSigninToken error after login: ");
              logger.error(err);
            } else {
              saveToken(res, newToken);
            }
            return redirectTo(req, res);
          });
        } 
        else {
          redirectTo(req, res);
        }
      });
    })(req, res, next);

  });

  app.get('/signout', function(req, res) {
    // store the return url
    req.session.redirectUrl = req.query.returnUrl || "/";
    clearToken(res);
    req.logout();
    return redirectTo(req, res);
  });
};




