var LocalStrategy = require('passport-local').Strategy,
    models = require('../models'),
    logger = require('../logger');


module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        models.users.get(id, function(err, user) {
            done(null, user);
        });
    });

    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            models.users.validate(email, password, function(err, result) {
                if (err) {
                    done(null, null);
                } else {
                    done(null, result);
                }
            });
        }));
};