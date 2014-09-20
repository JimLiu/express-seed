var controllers       = require('../controllers');


module.exports = function(app) {
  app.get('/', controllers.index);
  app.all('/signout', controllers.user.signout);
  app.get('/signin', controllers.user.signin);
  app.post('/signin', controllers.user.authenticate);
  app.get('/signup', controllers.user.signup);
  app.post('/signup', controllers.user.register);
};
