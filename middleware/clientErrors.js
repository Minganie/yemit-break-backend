module.exports = (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = {};
  if (req.app.get("env") === "development") {
    res.locals.error.message = err.message || "";
    res.locals.error.status = err.status || 500;
    res.locals.error.details = err.details || {};
  }

  if (err.status && err.status >= 400 && err.status < 500) {
    res.status(err.status).send(res.locals.error);
  } else {
    next(err);
  }
};
