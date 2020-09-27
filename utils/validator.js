const Validator = require("validatorjs");

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
