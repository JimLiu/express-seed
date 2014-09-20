var models = require('../../server/models'),
  moment = require('moment'),
  should = require('should');


describe('models/user', function() {
  describe('#create()', function(){
    it('should create a user without error', function(done) {
      var newUser = {
        email: "email-" + moment().unix() + "@gmail.com",
        password: moment().unix(),
        screenName: "screen_name-" + moment().unix()
      };

      models.user.create(newUser.email, newUser.password, newUser.screenName, function(err, result) {
        should.not.exist(err);
        should.exist(result);
        result.status.should.equal('success');
        should.exist(result.user);
        result.user.id.should.not.below(1);
        done();
      });
    });
  });

});