const winston = require("winston");
const config = require("config");
const logsConfig = config.get("logsConfig");

const ybbeLogger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: logsConfig.error, level: "error" }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: logsConfig.critical,
      level: "error",
    }),
  ],
});

module.exports = ybbeLogger;
