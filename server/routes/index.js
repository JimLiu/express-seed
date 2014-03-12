var controllers       = require('../controllers');


module.exports = function(app) {
  app.get('/', controllers.index);
  app.get('/signup', controllers.user.signup);
  app.post('/signup', controllers.user.register);
};
