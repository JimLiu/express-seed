var models = require('../../server/models'),
  support = require('../support'),
  moment = require('moment'),
  should = require('should');


describe('models/post', function() {
  describe('#create()', function(){
    it('should create a post without error', function(done) {
      support.createTestUser(function(err, result){
        should.not.exist(err);
        should.exist(result);
        should.exist(result.user);

        post = {
          author_id: result.user.id,
          title: 'test title - ' + moment().unix(),
          body: 'test body \r\n' + moment().unix(),
          slug: 'test-post-' + moment().unix(),
          status: 0,
        };

        models.Post.create(post, result.user, function(err, newPost){
          should.not.exist(err);
          should.exist(newPost);
          should.exist(newPost.author);
          done();
        });

      });
    });
  });

});