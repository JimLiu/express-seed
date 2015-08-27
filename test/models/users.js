var models = require('../../server/models'),
    moment = require('moment'),
    should = require('should');


describe('models/user', function() {
    describe('#create()', function() {
        it('should create a user without error', function(done) {
            var newUser = {
                email: "email-" + moment().unix() + "@gmail.com",
                password: moment().unix() + 'password',
                screenName: "screen_name-" + moment().unix()
            };

            models.users.create(newUser.email, newUser.password, newUser.screenName, function(err, user) {
                should.not.exist(err);
                should.exist(user);
                user.id.should.not.below(1);
                done();
            });
        });
    });

});