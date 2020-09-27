const debug = require("debug")("ybbe:validator");
const Validator = require("validatorjs");

const common = require("../yemit-break-common/common.json");

Validator.register(
  "sane_string",
  (value, requirement, attribute) => {
    return new RegExp(common.regexes.toon).test(value);
  },
  "The :attribute must be three characters long, and may only contain letters, numbers, dash, underscore, space or apostrophe."
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
