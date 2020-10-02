module.exports = (req, res, next) => {
  if (!req.secure) {
    return res.redirect(307, "https://" + req.get("host") + req.url);
  }
  next();
};
