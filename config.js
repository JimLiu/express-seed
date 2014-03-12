var path = require('path'),
    config;

config = {
  database: {
    client: 'mysql',
    connection: {
      host: "localhost",
      port: "8889",
      user: "root",
      password: "root",
      database: "test",
      multipleStatements: true
    }
  },
  session: {
    secret: "1234567890QWERTY"
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
};

// Export config
module.exports = config;