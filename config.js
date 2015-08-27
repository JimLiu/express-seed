var path = require('path'),
    config;

config = {
    url: 'http://localhost:3000',
    mysql: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '',
        database: 'express-seed',
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
                pass: '' // mailgun password
            }
        }
    }
};

// Export config
module.exports = config;