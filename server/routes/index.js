var _ = require('lodash'),
    express = require('express'),
    passport = require('passport'),
    router = express.Router(),
    uuid = require('node-uuid'),
    moment = require('moment'),

    logger = require('../logger'),
    base = require('./base'),
    controllers = require('../controllers');

router.get('/error/500', function(req, res, next) {
    res.render('error', {
        title: 'Error 500',
        message: 'Unknown Error',
        error: {
            status: 'An unknown error occured.',
            stack: ''
        }
    });
});

router.get('/', function(req, res, next) {
    res.render('index', {
        title: "My App"
    });
});

router.get('/signout', controllers.auth.signout);

router.get('/signin', controllers.auth.signin);


router.post('/signin', controllers.auth.doSignin);

router.get('/signup', controllers.auth.signup);

router.post('/signup', controllers.auth.doSignup);


router.autoLogin = function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        // check if the user is presenting a remember me cookie
        var token = req.signedCookies.token;
        if (token) {
            models.user.findByToken(token, function(err, user) {
                if (err) {
                    // no token matched, woops! clear all tokens
                    res.clearCookie('token', {});
                    return next();
                }
                if (user) {
                    // TODO: Generate a new sequence token
                    req.login(user, next);
                } else {
                    // no user matched, woops! clear all tokens
                    res.clearCookie('token', {});
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


module.exports = router;
