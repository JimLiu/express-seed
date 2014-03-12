var logger        = require('../logger'),
    models        = require('../models'),
    errors        = require('../errorHandling'),
    User          = {};


exports.signup = function(req, res) {
  res.render('signup', {
    title: "Sign up",
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

  models.User.create(req.body.email, req.body.password, req.body.screenName, function(err, result) {
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