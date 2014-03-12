var user          = require('./user');


exports.index = function(req, res) {
  res.render('index', {
    title: "My App"
  });
};

exports.user = user;