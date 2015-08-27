var string    = require('string'),
  hbs         = require('express-hbs'),
  moment      = require('moment'),
  path        = require('path'),
  polyglot    = require('node-polyglot').instance,
  _           = require('lodash'),

  config = require('../config'),

  assetTemplate = _.template('<%= source %>?v=<%= version %>'),
  scriptTemplate = _.template('<script type="text/javascript" src="<%= source %>?v=<%= version %>"></script>'),
  isProduction = process.env.NODE_ENV === 'production',

  coreHelpers = {},
  registerHelpers,

  scriptFiles = {
    production: [
      '/js/vendor.min.js',
      '/js/app.min.js'
    ],
    development: [
      '/js/vendor.js',
      '/js/app.js'
    ]
  };

coreHelpers.date = function(context, options) {
  if (!options && context.hasOwnProperty('hash')) {
    options = context;
    context = undefined;

    // set to published_at by default, if it's available
    // otherwise, this will print the current date
    if (this.published_at) {
      context = this.published_at;
    }
  }

  // ensure that context is undefined, not null, as that can cause errors
  context = context === null ? undefined : context;

  var f = options.hash.format || 'MMM Do, YYYY',
    timeago = options.hash.timeago,
    date;


  if (timeago) {
    date = moment(context).fromNow();
  } else {
    date = moment(context).format(f);
  }
  return date;
};

//
// ### URI Encoding helper
//
// *Usage example:*
// `{{encode uri}}`
//
// Returns URI encoded string
//
coreHelpers.encode = function(context, str) {
  var uri = context || str;
  return new hbs.handlebars.SafeString(encodeURIComponent(uri));
};



// ### Asset helper
//
// *Usage example:*
// `{{asset "css/screen.css"}}`
// `{{asset "css/screen.css" ghost="true"}}`
// Returns the path to the specified asset. The ghost
// flag outputs the asset path for the Ghost admin
coreHelpers.asset = function(context, options) {
  var output = '/';

  // Get rid of any leading slash on the context
  context = context.replace(/^\//, '');
  output += context;

  if (!context.match(/^favicon\.ico$/)) {
    output = assetTemplate({
      source: output,
      version: coreHelpers.assetHash
    });
  }
  return new hbs.handlebars.SafeString(output);
};

coreHelpers.forumScriptTags = function() {
  var scriptList = isProduction ? scriptFiles.production : scriptFiles.development;

  scriptList = _.map(scriptList, function(fileName) {
    return scriptTemplate({
      source: fileName,
      version: coreHelpers.assetHash
    });
  });

  return scriptList.join('');
};


registerHelpers = function(assetHash) {
  // Store hash for assets
  coreHelpers.assetHash = assetHash;
};

var registerSiteHelpers = function(sitehbs) {
  // Register helpers
  sitehbs.registerHelper('asset', coreHelpers.asset);

  sitehbs.registerHelper('date', coreHelpers.date);

  sitehbs.registerHelper('encode', coreHelpers.encode);

  sitehbs.registerHelper('forumScriptTags', coreHelpers.forumScriptTags);

};

module.exports = coreHelpers;
module.exports.loadCoreHelpers = registerHelpers;
module.exports.registerSiteHelpers = registerSiteHelpers;
module.exports.scriptFiles = scriptFiles;

