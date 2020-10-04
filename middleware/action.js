const Cover = require("../models/actions/support/Cover");
const Harry = require("../models/actions/support/Harry");
const InspireAction = require("../models/actions/support/InspireAction");
const InspireGuard = require("../models/actions/support/InspireGuard");
const Toon = require("../models/toon");

const populate = async (req, res, next) => {
  const action = { ...req.body, user: req.user };
  action.from = (await Toon.findOne({ _id: req.body.from })) || null;
  action.to = (await Toon.findOne({ _id: req.body.to })) || null;
  switch (action.name) {
    case "Cover":
      req.action = new Cover(action);
      return next();
    case "Inspire Action":
      req.action = new InspireAction(action);
      return next();
    case "Inspire Guard":
      req.action = new InspireGuard(action);
      return next();
    case "Harry":
      req.action = new Harry(action);
      return next();
    default:
      next(
        new Error(`Can't figure out what action you want for "${action.name}"`)
      );
  }
};
const validate = (req, res, next) => {
  try {
    req.action.validate();
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  populate,
  validate,
};
