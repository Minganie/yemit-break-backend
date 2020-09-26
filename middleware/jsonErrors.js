const debug = require("debug")("ybbe:error");
const ybbeLogger = require("../utils/ybbe-logger");

module.exports = (err, req, res, next) => {
  debug("In the final error handler");

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  ybbeLogger.error(err);

  // render the error page
  res.status(err.status || 500).send(res.locals.error);
};
