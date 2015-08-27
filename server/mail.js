var _ = require('lodash'),
    nodemailer = require('nodemailer'),
    config = require('./config'),
    logger = require('./logger');


function Mailer(opts) {
    opts = opts || {};
    this.transport = opts.transport || null;

    this.state = {};
    if (config.mail && config.mail.transport) {
        this.transport = nodemailer.createTransport(config.mail.transport, _.clone(config.mail.options) || {});
    } else {
        this.transport = nodemailer.createTransport('direct');
        this.state.usingDirect = true;
    }
}


Mailer.prototype.fromAddress = function() {
    var from = config.mail && config.mail.fromaddress,
        domain;

    if (!from) {
        // Extract the domain name from url set in config.js
        domain = config.url.match(new RegExp('^https?://([^/:?#]+)(?:[/:?#]|$)', 'i'));
        domain = domain && domain[1];

        from = 'noreply@' + domain;
    }

    return from;
};

Mailer.prototype.send = function(message, callback) {
    var self = this,
        to,
        sendMail;

    message = message || {};
    to = message.to || false;

    if (!this.transport) {
        return callback(new Error('Email Error: No e-mail transport configured.'));
    }

    if (!(message && message.subject && message.html && message.to)) {
        return callback(new Error('Email Error: Incomplete message data.'));
    }

    message = _.extend(message, {
        to: to,
        generateTextFromHTML: true
    });

    if (!message.from) {
        message.from = self.fromAddress();
    }

    logger.info("[Mailer.send] Begin to send message(" + message.id + ") to " + message.to);
    this.transport.sendMail(message, function(err, response) {

        logger.info("[Mailer.send] Message(" + message.id + ") has been sent.");
        logger.info("[Mailer.send]", err, response);
        if (err) {
            return callback(err);
        }

        if (self.transport.transportType !== 'DIRECT') {
            return callback(null, response);
        }

        response.statusHandler.once("failed", function(data) {
            var reason = 'Email Error: Failed sending email';
            if (data.error.errno === "ENOTFOUND") {
                reason += ': there is no mail server at this address: ' + data.domain;
            }
            reason += '.';
            return callback(new Error(reason));
        });

        response.statusHandler.once("requeue", function(data) {
            return callback(new Error("Email Error: message was not sent, requeued. Probably will not be sent. :( \nMore info: " + data.error.message));
        });

        response.statusHandler.once("sent", function() {
            return callback(null, "Message was accepted by the mail server. Make sure to check inbox and spam folders. :)");
        });
    });

};

module.exports = new Mailer();