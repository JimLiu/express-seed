/**
 * logger settings
 */
var winston = require('winston'),
  fs = require('fs'),
  mkdirp = require('mkdirp');

var makeSureDirExists = function(path) {
  fs.exists(path, function(exists) {
    if (!exists) {
      mkdirp(path, function(err) {
        if (err)
          console.error(err);
      });
    }
  });
};

makeSureDirExists('logs/info');
makeSureDirExists('logs/error');


var infoLogger = new(winston.Logger)({
  transports: [
    new(winston.transports.Console)({
      timestamp: true,
      colorize: true,
      level: 'info'
    }),
    new(winston.transports.File)({
      timestamp: true,
      dirname: 'logs/info',
      filename: 'log.log',
      createLogFolder: true,
      maxFiles: 10,
      maxsize: 1048576,
      lebel: 'info'
    })
  ]
});

var errorLogger = new(winston.Logger)({
  transports: [
    new(winston.transports.Console)({
      timestamp: true,
      colorize: true,
      level: 'error'
    }),
    new(winston.transports.File)({
      timestamp: true,
      dirname: 'logs/error',
      filename: 'log.log',
      createLogFolder: true,
      maxFiles: 10,
      maxsize: 1048576,
      lebel: 'error'
    })
  ]
});

var statsLogger = new(winston.Logger)({
  transports: [
    new(winston.transports.File)({
      timestamp: true,
      dirname: 'logs/stats',
      filename: 'log.log',
      createLogFolder: true,
      maxFiles: 10,
      maxsize: 1048576,
      lebel: 'error'
    })
  ]
});


Object.defineProperty(Error.prototype, 'toJSON', {
  value: function() {
    var alt = {};

    Object.getOwnPropertyNames(this).forEach(function(key) {
      alt[key] = this[key];
    }, this);

    return alt;
  },
  configurable: true
});

var formatMsg = function(msg) {
  if (typeof(msg) == 'object' || typeof(msg) == 'array') {
    msg = JSON.stringify(msg);
  };
  msg = msg.replace(/\\n/ig, '\n');
  return msg;
}

module.exports = {
  info: infoLogger.info,
  infoObject: function(msg) {      
    infoLogger.info(formatMsg(msg));
  },
  warn: infoLogger.warn,
  warnObject: function(msg) {
    infoLogger.warn(formatMsg(msg));
  },
  error: errorLogger.error,
  errorObject: function(msg) {
    errorLogger.error(formatMsg(msg));
  },
  stats: statsLogger.info,
  statsObject: function(msg) {
    statsLogger.info(formatMsg(msg));
  },
  disableConsole: function() {
    infoLogger.remove(infoLogger.transports.console);
    errorLogger.remove(errorLogger.transports.console);
  }
};