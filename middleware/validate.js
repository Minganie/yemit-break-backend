const debug = require("debug")("ybbe:input-validation");
const mongoose = require("mongoose");
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
    gender: "required|in:Male,Female",
    race:
      "required|in:Elezen,Hyur,Lalafell,Miqo'te,Roegadyn,Au Ra,Viera,Hrothgar",
    physical: "integer|required|between:0,4",
    magical: "integer|required|between:0,4",
    leadership: "integer|required|between:0,4",
    main_hand: "mongo_id|required",
    off_hand: "mongo_id|required",
    trait: "mongo_id|required",
    armor: "mongo_id|required",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      next(new YbbeError(err.firstMessage, 400, err.all()));
    } else {
      next();
    }
  });
};

const fight = (req, res, next) => {
  const validationRule = {
    name: "sane_string_par|required",
    toons: "array",
    enemies: "array",
    "enemies.*.name": "sane_string_par|required",
    "enemies.*.dc": "integer|required",
    "enemies.*.ab": "integer|required",
    "enemies.*.hp": "integer|required|min:0",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      next(new YbbeError(err.firstMessage, 400, err.all()));
    } else {
      const validMongoIds = (acc, cur) => acc && mongoose.isValidObjectId(cur);
      if (!req.body.toons.reduce(validMongoIds, true))
        return next(
          new YbbeError("Toons must be appropriate ids", 400, {
            toons: "Toons must be appropriate ids",
          })
        );
      next();
    }
  });
};

const idParamIsValidMongoId = (req, res, next) => {
  if (mongoose.isValidObjectId(req.params.id)) next();
  else next(new YbbeError("Invalid id", 400, { id: "Invalid id" }));
};

module.exports = {
  registration,
  login,
  logout,
  toon,
  fight,
  idParamIsValidMongoId,
};
