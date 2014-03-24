var models = require('../../server/models'),
  moment = require('moment'),
  should = require('should');


describe('models/tag', function() {
  describe('#saveTags()', function(){
    it('should save tags without error', function(done) {
      var tags = ['a', 'b', 'c', moment().format("YYYY-MM-DD HH:mm:ss"),
                    moment().format("YY-MM-DD HH:mm:ss")];

      models.Tag.saveTagsAndGetIds(tags, function(err, tagIds) {
        should.not.exist(err);
        should.exist(tagIds);
        tagIds.length.should.equal(5);
        done();
      });
    });
  });

});
