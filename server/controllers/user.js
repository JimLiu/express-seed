var i18n          = require("i18n"),
    passport      = require('passport'),
    uuid          = require('node-uuid'),
    moment        = require('moment'),
    logger        = require('../logger'),
    models        = require('../models'),
    enums         = require('../data/enums.js'),
    Users         = {};


var saveToken = function(res, token) {
  var currentDate = getExpiresDate();
  res.cookie('forumjsToken', JSON.stringify(token), {
    signed: true,
    expires: currentDate,
    httpOnly: true
  });
};

var clearToken = function(res) {
  res.clearCookie('forumjsToken', {});
};

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
  return moment().add(30, 'days').toDate();
};

exports.signup = function(req, res) {
  res.render('signup', {
    title: res.__("Sign up"),
    email: '',
    screenName: '',
    errors: null
  });
};

exports.register = function(req, res) {

  req.assert('email', 'required').notEmpty();
  req.assert('email', 'valid email required').isEmail();
  req.assert('password', '6 to 20 characters required').len(6, 20);
  req.assert('screenName', 'required').notEmpty();

  var errors = req.validationErrors(true); // get errors
  var viewParams = {
    title: "Sign up",
    email: req.body.email,
    screenName: req.body.screenName,
    errors: errors,
  };

  function renderPage() {
    res.render('signup', viewParams);
  }

  // if we got errors
  if (errors) {
    return renderPage();
  }

  models.user.create(req.body.email, req.body.password, req.body.screenName, function(err, result) {
    logger.warn('errors1', err, result);
    if (err) {
      logger.error(err);
      return res.redirect('/error/500');
    }
    if (result.status == 'success') {
      logger.info("user created");
      logger.info(result.user);
      res.redirect('/signin?signup=success&email=' + encodeURIComponent(result.user.email));
    }
    else {
      viewParams.errors = {};
      if (result.status == 'duplication') {
        viewParams.errors.email = {
          param: 'email',
          msg: 'Duplicate email',
          value: ''
        };
      }
      renderPage();
    }
  });

};

exports.signin = function(req, res) {
  // store the return url
  req.session.redirectUrl = req.query.returnUrl || "/";

  res.render('signin', {
    title: res.__('Sign in'),
    errors: null,
    email: req.query.email || '',
    user: null,
    signup: req.query.signup
  });
};

exports.authenticate = function(req, res, next) {
  // first validate the login
  req.assert('email', 'You must enter an email address.').notEmpty();
  req.assert('password', 'You must enter a password.').notEmpty();
  req.assert('password', 'Password must be at least 4 characters').len(4);

  var errors = req.validationErrors(true); // get mapped errors
  var email = req.param('email');
  var password = req.param('password');
  var viewParams = {
    title: res.__('Sign in'),
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
      if (err == 'Invalid password' || !user) {
        viewParams.errors.password = {
          param: 'password',
          msg: res.__('Invalid password'),
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
        models.user.saveToken(newToken, function(err, results) {
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
};

exports.signout = function(req, res) {
  req.session.redirectUrl = req.query.returnUrl || "/";
  clearToken(res);
  req.logout();
  return redirectTo(req, res);
};

exports.forgotten = function(req, res) {
  /*jslint unparam:true*/
  res.render('forgotten', {
  });
};


exports.reset = function(req, res) {
  // Render the reset form
  res.render('reset', {
  });
};
