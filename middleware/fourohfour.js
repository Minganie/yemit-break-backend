const YbbeError = require("../utils/YbbeError");

module.exports = (req, res, next) => {
  const e = new YbbeError("Not Found", 404, "Not Found");
  next(e);
};
