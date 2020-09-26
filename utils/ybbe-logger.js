const winston = require("winston");

const ybbeLogger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "critical.log", level: "error" }),
  ],
});

module.exports = ybbeLogger;
