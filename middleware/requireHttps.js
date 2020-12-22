module.exports = (req, res, next) => {
  console.log(req.url);
  if (!req.url.startsWith("/.well-known/acme-challenge") && !req.secure) {
    return res.redirect(307, "https://" + req.get("host") + req.url);
  }
  next();
};
