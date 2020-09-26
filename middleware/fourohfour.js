module.exports = (req, res, next) => {
  const e = new Error("Not Found");
  e.status = 404;
  next(e);
};
