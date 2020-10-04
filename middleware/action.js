const Cover = require("../models/actions/support/Cover");
const Harry = require("../models/actions/support/Harry");
const InspireAction = require("../models/actions/support/InspireAction");
const InspireGuard = require("../models/actions/support/InspireGuard");
const Parry = require("../models/actions/support/Parry");

const Attack = require("../models/actions/offense/Attack");
const PreciseAttack = require("../models/actions/offense/PreciseAttack");

const Toon = require("../models/toon");

const populate = async (req, res, next) => {
  const action = { ...req.body, user: req.user };
  action.from = (await Toon.findOne({ _id: req.body.from })) || null;
  switch (action.name) {
    case "Cover":
      action.to = (await Toon.findOne({ _id: req.body.to })) || null;
      req.action = new Cover(action);
      return next();
    case "Inspire Action":
      action.to = (await Toon.findOne({ _id: req.body.to })) || null;
      req.action = new InspireAction(action);
      return next();
    case "Inspire Guard":
      action.to = (await Toon.findOne({ _id: req.body.to })) || null;
      req.action = new InspireGuard(action);
      return next();
    case "Harry":
      req.action = new Harry(action);
      return next();
    case "Parry":
      req.action = new Parry(action);
      return next();
    case "Attack":
      req.action = new Attack(action);
      return next();
    case "Precise Attack":
      req.action = new PreciseAttack(action);
      return next();
    default:
      next(
        new Error(`Can't figure out what action you want for "${action.name}"`)
      );
  }
};
const validate = async (req, res, next) => {
  try {
    await req.action.validate();
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  populate,
  validate,
};
