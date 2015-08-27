var _ = require('lodash'),
    path = require('path'),
    forumConfig = {};


function updateConfig(config) {
    var envConfig = {};
    try {
        envConfig = require(path.resolve(__dirname, '../../', 'config.' + process.env.NODE_ENV + '.js')) || {};
    } catch (ignore) { /*jslint sloppy: true */ }
    _.merge(config, envConfig);
    return config;
}

function init() {
    if (_.isEmpty(forumConfig)) {
        try {
            forumConfig = require(path.resolve(__dirname, '../../', 'config.js')) || {};
        } catch (ignore) { /*jslint sloppy: true */ }
        forumConfig = updateConfig(forumConfig);
    }
}

init();

module.exports = forumConfig;