module.exports = (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  if (err.status && err.status >= 400 && err.status < 500) {
    res.status(err.status).send(res.locals.error);
  } else {
    next(err);
  }
};
