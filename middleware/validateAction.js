const debug = require("debug")("ybbe:validate-action");
const mongoose = require("mongoose");

const Enemy = require("../models/enemy");
const Toon = require("../models/toon");
const YbbeError = require("../utils/YbbeError");

const toonHasNotSupported = (toon) => {
  if (toon.quickAction !== null) {
    throw new YbbeError(
      toon.name + " has already taken a quick action this round",
      400,
      { from: toon.name + " has already taken a quick action this round" }
    );
  }
};

const toonHasNotActed = (toon) => {
  if (toon.action !== null) {
    throw new YbbeError(
      toon.name + " has already taken an action this round",
      400,
      { from: toon.name + " has already taken an action this round" }
    );
  }
};

const itsPresent = (bodyParam, name) => {
  if (!bodyParam)
    throw new YbbeError(name + " must be specified", 400, {
      param: name + " must be specified",
    });
};
const itsAMongooseId = (bodyParam, name) => {
  if (!mongoose.isValidObjectId(bodyParam))
    throw new YbbeError(name + " must be a valid mongoose id", 400, {
      param: name + " must be a valid mongoose id",
    });
};
const itExistsInMongo = (model, name) => {
  if (!model)
    throw new YbbeError("Can't find that " + name, 404, {
      param: "Can't find that " + name,
    });
};

const itsAToon = async (param, name) => {
  try {
    itsPresent(param, name);
    itsAMongooseId(param, name);
    const toon = await Toon.findOne({ _id: param });
    itExistsInMongo(toon, name);
    return toon;
  } catch (e) {
    throw e;
  }
};

const itsAnEnemy = async (param, name) => {
  try {
    itsPresent(param, name);
    itsAMongooseId(param, name);
    const enemy = await Enemy.findOne({ _id: param });
    itExistsInMongo(enemy);
    return enemy;
  } catch (e) {
    throw e;
  }
};

const fromIsAToon = async (req) => {
  try {
    req.body.from = await itsAToon(req.body.from, "Acting toon");
  } catch (e) {
    throw e;
  }
};
const fromIsYourToon = (req) => {
  if (req.body.from.user._id.toString() !== req.user._id) {
    throw new YbbeError("Acting toon must be yours", 400, {
      from: "Acting toon must be yours",
    });
  }
};
const toIsAToon = async (req) => {
  try {
    req.body.to = await itsAToon(req.body.to, "Target toon");
  } catch (e) {
    throw e;
  }
};
const toAreToons = async (req) => {
  try {
    const toons = [];
    for (const toonId of req.body.to) {
      const toon = await itsAToon(toonId, "Target toon");
      toons.push(toon);
    }
    req.body.to = toons;
  } catch (e) {
    throw e;
  }
};
const toIsAnEnemy = async (req) => {
  try {
    req.body.to = await itsAnEnemy(req.body.to, "Target enemy");
  } catch (e) {
    throw e;
  }
};
const toAreEnemies = async (req) => {
  try {
    const enemies = [];
    for (const enemyId of req.body.to) {
      const enemy = await itsAnEnemy(enemyId, "Target enemy");
      enemies.push(enemy);
    }
    req.body.to = enemies;
  } catch (e) {
    throw e;
  }
};
const rollIsValid = (req) => {
  return 0 <= req.body.roll && req.body.roll <= 1000;
};

const isNotHarrying = (req) => {
  if (req.body.from.statuses.is_harrying)
    throw new YbbeError(
      "If you're harrying, you can only do a precise attack this round",
      400,
      {
        from: "If you're harrying, you can only do a precise attack this round",
      }
    );
};

const toonIsntStatused = (toon, status, name) => {
  if (toon.statuses[status]) {
    throw new YbbeError("Target toon must not already be " + name, 400, {
      to: "Target toon must not already be " + name,
    });
  }
};

const cover = async (req, res, next) => {
  try {
    await fromIsAToon(req);
    fromIsYourToon(req);
    toonHasNotSupported(req.body.from);

    await toIsAToon(req);
    toonIsntStatused(req.body.to, "is_covered", "covered");
    toonIsntStatused(req.body.from, "is_covered", "covered");

    next();
  } catch (e) {
    next(e);
  }
};

const harry = async (req, res, next) => {
  try {
    await fromIsAToon(req);
    fromIsYourToon(req);
    toonHasNotSupported(req.body.from);

    const stats = ["Smashing", "Entropy"];
    if (!stats.includes(req.body.with))
      throw new YbbeError(
        "Stat you are harrying with must be among: " + stats.toString(),
        400,
        {
          with: "Stat you are harrying with must be among: " + stats.toString(),
        }
      );

    next();
  } catch (e) {
    next(e);
  }
};

const inspire = async (req, res, next) => {
  try {
    await fromIsAToon(req);
    fromIsYourToon(req);
    toonHasNotSupported(req.body.from);

    await toIsAToon(req);

    const actions = ["Attack", "Heal", "Precise Attack"];
    if (!actions.includes(req.body.action))
      throw new YbbeError(
        "Inspired action must be among: " + actions.toString(),
        400,
        { action: "Inspired action must be among: " + actions.toString() }
      );
    next();
  } catch (e) {
    next(e);
  }
};

const guard = async (req, res, next) => {
  try {
    await fromIsAToon(req);
    fromIsYourToon(req);
    toonHasNotSupported(req.body.from);

    await toIsAToon(req);
    next();
  } catch (e) {
    next(e);
  }
};

const parry = async (req, res, next) => {
  try {
    await fromIsAToon(req);
    fromIsYourToon(req);
    toonHasNotSupported(req.body.from);
    next();
  } catch (e) {
    next(e);
  }
};

const attack = async (req, res, next) => {
  try {
    await fromIsAToon(req);
    fromIsYourToon(req);
    toonHasNotActed(req.body.from);

    await toAreEnemies(req);
    rollIsValid(req);

    isNotHarrying(req);

    const stats = ["Entropy", "Smashing"];
    if (!stats.includes(req.body.with))
      throw new YbbeError(
        "The stat you attack with must be among: " + stats.toString(),
        400,
        {
          with: "The stat you attack with must be among: " + stats.toString(),
        }
      );
    next();
  } catch (e) {
    next(e);
  }
};

const heal = async (req, res, next) => {
  try {
    await fromIsAToon(req);
    fromIsYourToon(req);
    toonHasNotActed(req.body.from);

    await toAreToons(req);

    rollIsValid(req);

    isNotHarrying(req);

    next();
  } catch (e) {
    next(e);
  }
};

const precise = async (req, res, next) => {
  try {
    await fromIsAToon(req);
    fromIsYourToon(req);
    toonHasNotActed(req.body.from);

    await toAreEnemies(req);

    next();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  cover,
  harry,
  inspire,
  guard,
  parry,
  attack,
  heal,
  precise,
};
