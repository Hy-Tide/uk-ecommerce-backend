const morgan = require('morgan');
const logger = require('../config/logger');

const stream = {
    write: (message) => logger.info(message.substring(0, message.lastIndexOf('\n')))
};

const requestLogger = morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
    { stream }
);

module.exports = requestLogger;
