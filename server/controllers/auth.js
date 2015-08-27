var _ = require('lodash'),
    passport = require('passport'),
    uuid = require('node-uuid'),
    moment = require('moment'),

    logger = require('../logger'),
    models = require('../models'),
    mailer = require('../mail'),
    config = require('../config'),


    Auth = {};


/**
 * Encode uuid as a short 22 byte slug
 * @param  {[type]} uuidStr [description]
 * @return {[type]}         [description]
 */
var uuid2slug = function (uuidStr) {
    var bytes = uuid.parse(uuidStr);
    var base64 = (new Buffer(bytes)).toString('base64');
    var slug = base64
        .replace(/\+/g, '-') // Replace + with - (see RFC 4648, sec. 5)
        .replace(/\//g, '_') // Replace / with _ (see RFC 4648, sec. 5)
        .replace(/=/g, ''); // Drop '==' padding
    return slug;
};

/**
 * Decode 22 byte slug to uuid
 * @param  {[type]} slug [description]
 * @return {[type]}      [description]
 */
var slug2uuid = function (slug) {
    var base64 = slug
        .replace(/-/g, '+')
        .replace(/_/g, '/') +
        '==';
    return uuid.unparse(new Buffer(base64, 'base64'));
};

/**
 * Redirect to a new url or home page
 * @param  {[type]} req        [description]
 * @param  {[type]} res        [description]
 * @param  {[type]} defaultUrl [description]
 * @return {[type]}            [description]
 */
var redirectTo = function(req, res, defaultUrl) {
    defaultUrl = defaultUrl || '/';
    var redirectUrl = req.session.redirectUrl || req.query.returnUrl || defaultUrl;

    if (redirectUrl.indexOf('/error/') === -1) { // Don't redirct to an error page
        res.redirect(redirectUrl);
    }
    return defaultUrl;
};


/**
 * Sign out
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
Auth.signout = function(req, res, next) {
    req.session.redirectUrl = req.query.returnUrl || '/';
    res.clearCookie('token', {});
    req.logout();
    redirectTo(req, res);
};

/**
 * Get a signin page
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
Auth.signin = function(req, res, next) {
    // store the return url
    req.session.redirectUrl = req.query.returnUrl || '/';

    res.render('auth/signin', {
        title: 'Sign in',
        errors: null,
        email: req.query.email || '',
        user: null,
        signup: req.query.signup
    });
};

/**
 * Post to sign in
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
Auth.doSignin = function(req, res, next) {
    // first validate the login
    req.assert('email', 'You must enter an email address.').notEmpty();
    req.assert('password', 'You must enter a password.').notEmpty();
    req.assert('password', 'Password must be at least 4 characters').len(4);

    var errors = req.validationErrors(true); // get mapped errors
    var email = req.body.email;
    var password = req.body.password;
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
        return res.render('auth/signin', viewParams);
    }

    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            viewParams.errors = {};
            if (err == 'Invalid password' || !user) {
                viewParams.errors.password = {
                    param: 'password',
                    msg: 'Invalid password',
                    value: ''
                };
            } else {
                viewParams.errors.general = 'Unknown error.';
            }
            return res.render('auth/signin', viewParams);
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }

            if (req.body.rememberMe) {
                var tokenData = models.users.generateToken(user.id, 3600 * 30, 'signin');
                models.users.saveToken(tokenData, function (err, results) {
                    if (err) {
                        logger.error('Failed to save token', err);
                    } else {
                        res.cookie('token', tokenData.token, {
                            signed: true,
                            expires: tokenData.expires
                        });
                    }
                    redirectTo(req, res);
                });
            } else {
                redirectTo(req, res);
            }
        });
    })(req, res, next);
};

/**
 * Get a sign up page
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
Auth.signup = function(req, res, next) {
    res.render('auth/signup', {
        title: 'Sign up',
        email: '',
        screenName: '',
        errors: null
    });
};

/**
 * Post to sign up a new account
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
Auth.doSignup = function(req, res) {

    req.assert('email', 'required').notEmpty();
    req.assert('email', 'valid email required').isEmail();
    req.assert('password', '6 to 20 characters required').len(6, 20);
    req.assert('screenName', 'required').notEmpty();

    var errors = req.validationErrors(true); // get errors
    var viewParams = {
        title: 'Sign up',
        email: req.body.email,
        screenName: req.body.screenName,
        errors: errors,
    };

    function renderPage() {
        res.render('auth/signup', viewParams);
    }

    // if we got errors
    if (errors) {
        return renderPage();
    }

    models.users.create(req.body.email, req.body.password, req.body.screenName, function(err, user) {
        if (err && !_.isString(err)) {
            logger.error(err);
            return res.redirect('/error/500');
        }
        if (err || !user) {
            viewParams.errors = {};
            if (err === 'email exists') {
                viewParams.errors.email = {
                    param: 'email',
                    msg: 'Email already exists',
                    value: ''
                };
            } else {
                viewParams.errors.general = 'Unknown error.';
            }
            return renderPage();
        }
        res.redirect('/signin?signup=success&email=' + encodeURIComponent(user.email));

    });
};


/**
 * Forget password, get a reset password mail by email
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
Auth.forgot = function (req, res) {
    var email = req.query && req.query.email ? req.query.email : '';
    var errors = null;
    if (req.query.expired == 1) {
        errors = {
            general: "The reset link you clicked has expired. Please request a new one."
        };
    }
    if (req.query.err) {
        errors = {
            general: req.query.err
        };
    }
    res.render('auth/forgot', {
        title: 'Forgot your password',
        errors: errors,
        email: email
    });
};

/**
 * Post to get a reset password mail by email
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
Auth.doForgot = function (req, res) {
    req.assert('email', 'You must enter an email address.').notEmpty().isEmail();

    var errors = req.validationErrors(true),
        email = req.body.email,
        viewParams = {
            title: 'Forgot your password',
            errors: null,
            email: email
        },
        renderPage = function () {
            res.render('auth/forgot', viewParams);
        };
    var systemErrorResponse = function (err) {
        res.render('auth/forgot', {
            title: 'Forgot your password',
            errors: {
                general: err
            },
            email: email
        });
    };

    if (errors) {
        viewParams.errors = errors;
        return renderPage();
    }

    models.users.getByEmail(email, function (err, user) {
        if (err) {
            viewParams.errors = {
                general: err
            };
            return renderPage();
        }
        if (user === null) { // User not exists with this email
            viewParams.errors = {
                email: {
                    param: "email",
                    msg: "We couldn't find your account with this email.",
                    value: email
                }
            };
            return renderPage();
        }

        // generate a 24 hours token
        models.users.generateAndSaveToken(user.id, 24, 'resetpass', function (err, tokenData) {
            if (err) {
                viewParams.errors = {
                    general: err
                };
                return renderPage();
            }
            var url = config.url + '/resetpass?token=' + uuid2slug(tokenData.token);
            res.render('mails/forgot_password', {
                    url: url
                },
                function (err, html) {
                    mailer.sendMail({ //send mail
                        email: email,
                        subject: "Reset your password",
                        body: html
                    }, function (err, response) {
                        res.render('auth/forgot-sent', {
                            title: 'Forgot your password',
                            email: email
                        });
                    });

                });
        });
    });
};


/**
 * Reset user's password
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
Auth.reset = function (req, res) {
    req.assert('token', 'The token is invalid.').notEmpty();

    var token = req.query.token,
        errors = req.validationErrors(true);

    if (errors) { // token is invalid
        return res.redirect('/forgot?expired=1');
    }

    token = slug2uuid(token);

    models.users.findByToken(token, 'resetpass', function (err, user) {
        if (err) { // system error
            logger.error("findByToken", err);
            return res.redirect('/forgot?err=' + encodeURIComponent('Failed to verify the token, please try again later!'));
        }
        if (!user) { // can't find the user by token
            return res.redirect('/forgot?expired=1');
        }
        res.render('auth/reset', {
            title: 'Reset My Password',
            errors: null,
            email: ''
        });
    });
};


Auth.doReset = function (req, res) {
    req.assert('token', 'The token is invalid.').notEmpty();

    var token = req.query.token,
        errors = req.validationErrors(true), // check token first
        renderPage = function (errors) {
            res.render('auth/reset', {
                title: 'Reset My Password',
                errors: errors
            });
        };

    if (errors) { // token is invalid
        return res.redirect('/forgot?expired=1');
    }

    token = slug2uuid(token);

    models.users.findByToken(token, 'resetpass', function (err, user) {
        if (err) { // system error
            logger.error("findByToken", err);
            return res.redirect('/forgot?err=' + encodeURIComponent('Failed to verify the token, please try again later!'));
        }
        if (!user) { // can't find the user by token or token maps to the wrong user
            return res.redirect('/forgot?expired=1');
        }

        req.assert('password', 'You must enter a password').notEmpty();
        req.assert('password', 'Password must be at least 4 characters').len(4);
        req.assert('password2', 'Passwords do not match').equals(req.body.password);

        errors = req.validationErrors(true); // check password
        if (errors) {
            return renderPage(errors);
        }

        models.users.updatePassword(user.id, req.body.password, function (err, data) {
            if (err) {
                logger.error("update password", err);
                return renderPage({
                    general: err
                });
            }
            models.users.removeUserTokens(user.id, null, function (err) {
                if (err) {
                    logger.error("failed to removeToken during updatePassword", err);
                }
            });
            res.render('auth/reset-success', {
                title: 'Reset My Password',
                email: user.email
            });
        });

    });
};

module.exports = Auth;
