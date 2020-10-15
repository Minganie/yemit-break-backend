const debug = require("debug")("ybbe:validator");
const mongoose = require("mongoose");
const Validator = require("validatorjs");

const common = require("../yemit-break-common/common.json");

Validator.register(
  "sane_string",
  (value, requirement, attribute) => {
    return new RegExp(common.regexes.toon).test(value);
  },
  "The :attribute must be three characters long, and may only contain letters, numbers, dash, underscore, space or apostrophe."
);

Validator.register(
  "password",
  (value, requirement, attribute) => {
    return new RegExp(common.regexes.password).test(value);
  },
  "The :attribute must be 5 to 25 characters long"
);

Validator.register(
  "sane_string_par",
  (value, requirement, attribute) => {
    return new RegExp(common.regexes.fight).test(value);
  },
  "The :attribute must be 3 to 200 characters long, and may only contain letters, numbers, dash, underscore, space, apostrophe or parentheses."
);

Validator.register(
  "mongo_id",
  (value, requirement, attribute) => {
    return mongoose.isValidObjectId(value);
  },
  "The :attribute must be a valid Mongo object id"
);

const validator = (body, rules, customMessages, callback) => {
  const validation = new Validator(body, rules, customMessages);
  validation.passes(() => callback(null, true));
  validation.fails(() => {
    validation.errors.firstMessage = validation.errors.all()[
      Object.keys(validation.errors.all())[0]
    ][0];
    callback(validation.errors, false);
  });
};

module.exports = validator;
