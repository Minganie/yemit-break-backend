const debug = require("debug")("ybbe:input-validation");
const validator = require("../utils/validator");
const YbbeError = require("../utils/YbbeError");

const registration = (req, res, next) => {
  const validationRule = {
    email: "email|required",
    password: "required|between:5,25|confirmed",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      next(new YbbeError(err.firstMessage, 400, err.all()));
    } else {
      next();
    }
  });
};

const login = (req, res, next) => {
  const validationRule = {
    email: "email|required",
    password: "required|between:5,25",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      next(new YbbeError(err.firstMessage, 400, err.all()));
    } else {
      next();
    }
  });
};

const logout = (req, res, next) => {
  if (req.header("x-auth-token")) {
    next();
  } else
    next(
      new YbbeError("No token provided", 400, {
        "x-auth-token": ["No token provided."],
      })
    );
};

const toon = (req, res, next) => {
  const validationRule = {
    name: "sane_string|required",
    physical: "integer|required|between:0,4",
    magical: "integer|required|between:0,4",
    leadership: "integer|required|between:0,4",
    main_hand: "alpha_num|required|size:24",
    off_hand: "alpha_num|required|size:24",
    trait: "alpha_num|required|size:24",
    armor: "alpha_num|required|size:24",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      next(new YbbeError(err.firstMessage, 400, err.all()));
    } else {
      next();
    }
  });
};

module.exports = {
  registration,
  login,
  logout,
  toon,
};
