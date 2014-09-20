var path = require('path'),
    config;

config = {
  mysql: {
    host: "localhost",
    port: "8889",
    user: "root",
    password: "root",
    database: "express-seed",
    multipleStatements: true
  },
  cookie: {
    secret: '3095cd1975c64b9f8ee24b5346a4e593'
  },
  session: {
    secret: '1234567890QWERTY'
  },
  mail: {
    transport: 'SMTP',
    options: {
      service: 'Mailgun',
      auth: {
        user: '', // mailgun username
        pass: ''  // mailgun password
      }
    }
  },
  i18n: {
    locales: ['cn', 'en'],
    defaultLocale: 'cn',
    cookie: 'locale',
    directory: "locales"
  }
};

// Export config
module.exports = config;