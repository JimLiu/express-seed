
/**
 * Module dependencies.
 */

var express     = require('express'),
    crypto      = require('crypto'),
    uuid        = require('node-uuid'),
    Polyglot    = require('node-polyglot'),
    semver      = require('semver'),
    http        = require('http'),
    path        = require('path'),
    hbs         = require('express-hbs'),
    helpers     = require('./helpers'),
    packageInfo = require('../package.json'),
    config      = require('../config'),
    logger      = require('./logger'),
    middleware  = require('./middleware');

var app = express();

// create a hash for cache busting assets
var assetHash = (crypto.createHash('md5').update(packageInfo.version + Date.now()).digest('hex')).substring(0, 10);

// Set up Polygot instance on the require module
Polyglot.instance = new Polyglot();


// ##Configuration
app.set('version hash', assetHash);

// return the correct mime type for woff filess
express.static.mime.define({'application/font-woff': ['woff']});


// all environments
app.set('port', process.env.PORT || 1982);

app.set('view engine', 'hbs');

// Load helpers
helpers.loadCoreHelpers(assetHash);

// ## Middleware
middleware(app);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
