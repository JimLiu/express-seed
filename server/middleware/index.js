var express   = require('express'),
  _           = require('lodash'),
  S           = require('string'),
  url         = require('url'),
  fs          = require('fs'),
  path        = require('path'),
  hbs         = require('express-hbs'),
  validator   = require('express-validator'),
  passport    = require('passport'),
  routes      = require('../routes'),
  auth        = require('./auth'),
  config      = require('../config'),
  helpers     = require('../helpers'),
  errors      = require('../errorHandling');

function appLocals(req, res, next) {
  // Make sure we have a locals value.
  res.locals = res.locals || {};
  res.locals.hello = "world";
  res.locals.currentUser = req.user;
  _.extend(res.locals,  {
                
                message: "notifications"
            });
  next();
}

module.exports = function(app) {

  require('./passport')(passport);

  // Logging configuration
  if (app.get('env') !== 'development') {
    app.use(express.logger());
  } else {
    app.use(express.logger('dev'));
  }

  // Favicon
  app.use(express.favicon());

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(validator());

  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  var secret = config.session && config.session.secret ? config.session.secret : "1234567890QWERTY";
  app.use(express.session({
    secret: secret
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(auth.autoLogin);

  // local data
  app.use(appLocals);
  
  var siteHbs = hbs.create();
  helpers.registerSiteHelpers(siteHbs);

  // Initialise the views
  app.engine('hbs', siteHbs.express3({
    partialsDir: __dirname + '/../views/partials'
  }));
  app.set('views', path.join(__dirname, '/../views'));

  // Static assets
  app.use(express.static(path.join(__dirname, '/../../client/assets')));
  app.use('/shared', express.static(path.join(__dirname, '/../../shared')));
  app.use('/vendors', express.static(path.join(__dirname, '/../../bower_components')));
  app.use('/js', express.static(path.join(__dirname, '/../../built/scripts')));

  // ### Routing
  app.use(app.router);

  routes(app);

  auth.init(app, passport);

  // ### Error handling
  // 404 Handler
  app.use(errors.error404);

  // 500 Handler
  app.use(errors.error500);

};