var models = require('../../server/models'),
  support = require('../support'),
  moment = require('moment'),
  should = require('should');

var newPost = function(callback) {
  support.createTestUser(function(err, result) {
    if (err) {
      callback(err);
    } else {
      if (!result.user) {
        return callback(new Error(result.status));
      }
      post = {
        author_id: result.user.id,
        title: 'test title - ' + moment().unix(),
        body: 'test body \r\n' + moment().unix(),
        slug: 'test-post-' + moment().valueOf(),
        status: 0,
      };
      models.post.create(post, result.user, callback);
    }
  });
};

describe('models/post', function() {
  describe('#create()', function() {
    it('should create a post without error', function(done) {
      support.createTestUser(function(err, result) {
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

        models.post.create(post, result.user, function(err, newPost) {
          should.not.exist(err);
          should.exist(newPost);
          should.exist(newPost.author);
          done();
        });

      });
    });
  });

  describe('#getAllPosts()', function() {
    it('should get first page posts with 2 results', function(done) {
      models.post.getAllPosts(0, 2, function(err, result) {
        should.not.exist(err);
        should.exist(result);
        result.items.length.should.equal(2);
        console.log(result);
        done();
      });
    });
  });

  describe('#getTopPosts()', function() {
    it('should get top 2 posts with 2 results', function(done) {
      models.post.getTopPosts(2, function(err, result) {
        should.not.exist(err);
        should.exist(result);
        result.length.should.equal(2);
        console.log(result);
        done();
      });
    });
  });
});