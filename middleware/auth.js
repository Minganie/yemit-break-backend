const config = require("config");
const debug = require("debug")("ybbe:auth");
const jwt = require("jsonwebtoken");

const YbbeError = require("../utils/YbbeError");

const tokenIsPresent = (req) => {
  const token = req.header("x-auth-token");
  if (!token)
    throw new YbbeError("You must be logged in to access this resource.", 401, {
      token: ["You must be logged in to access this resource."],
    });
};

const getUserFromToken = (token) => {
  const jwtConfig = config.get("jwtConfig");
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (e) {
    throw new YbbeError("Invalid token.", 401, {
      token: ["Invalid token provided; try logging out and logging back in."],
    });
  }
};

const loggedIn = (req, res, next) => {
  try {
    tokenIsPresent(req);
    req.user = getUserFromToken(req.header("x-auth-token"));
    next();
  } catch (e) {
    if (e instanceof YbbeError) next(e);
    else next(new YbbeError("Error while authenticating.", 500, e));
  }
};

const isPlayer = (req, res, next) => {
  try {
    tokenIsPresent(req);
    req.user = getUserFromToken(req.header("x-auth-token"));

    if (!req.user.permissions.includes("Player"))
      throw new YbbeError(
        "You must be logged in as a player to access this resource.",
        403,
        {
          token: ["You must be logged in as a player to access this resource."],
        }
      );

    next();
  } catch (e) {
    if (e instanceof YbbeError) next(e);
    else next(new YbbeError("Error while authenticating.", 500, e));
  }
};

const isDm = (req, res, next) => {
  try {
    tokenIsPresent(req);
    req.user = getUserFromToken(req.header("x-auth-token"));
    if (!req.user.permissions.includes("DM"))
      throw new YbbeError(
        "You must be logged in as a player to access this resource.",
        403,
        {
          token: ["You must be logged in as a player to access this resource."],
        }
      );

    next();
  } catch (e) {
    if (e instanceof YbbeError) next(e);
    else next(new YbbeError("Error while authenticating.", 500, e));
  }
};

module.exports = { loggedIn, isPlayer, isDm };
