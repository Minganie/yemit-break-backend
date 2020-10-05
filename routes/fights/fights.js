const debug = require("debug")("ybbe:fights");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const _ = require("lodash");

const auth = require("../../middleware/auth");
const Enemy = require("../../models/enemy");
const Fight = require("../../models/fight");
const advance = require("./advance");
const support = require("./support");
const offense = require("./offense");
const validate = require("../../middleware/validate");
const YbbeError = require("../../utils/YbbeError");

router.get("/", async (req, res, next) => {
  try {
    const fights = await Fight.find({}).sort("name");
    res.send(fights);
  } catch (e) {
    next(e);
  }
});
router.get("/:id", validate.idParamIsValidMongoId, async (req, res, next) => {
  try {
    const fight = await Fight.findOne({ _id: req.params.id });
    if (!fight)
      return next(
        new YbbeError("Unable to find this fight.", 404, { id: req.params.id })
      );
    res.send(fight);
  } catch (e) {
    next(e);
  }
});

const createFight = async (bodyFight, user, session) => {
  const enemyIds = [];
  for (const bodyEnemy of bodyFight.enemies) {
    const amended = {
      ..._.pick(bodyEnemy, ["name", "dc", "ab", "hp"]),
      current_hp: bodyEnemy.hp,
    };
    const enemy = new Enemy(amended);
    enemyIds.push(enemy._id);
    await enemy.save({ session });
  }

  const f = {
    ..._.pick(bodyFight, ["name", "toons"]),
    enemies: enemyIds,
    user: user._id,
  };
  return new Fight(f).save({ session });
};

router.post("/", [auth.isDm, validate.fight], async (req, res, next) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const fight = await createFight(req.body, req.user, session);
      res.status(201).send(fight);
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  } catch (e) {
    next(e);
  }
});

router.use("/:id/next", advance);
router.use("/:id/support", support);
router.use("/:id/offense", offense);

if (process.env.NODE_ENV !== "production") {
  router.use("/:id/reset", async (req, res, next) => {
    try {
      const _id = req.params.id;
      const Fight = require("../../models/fight");
      const Toon = require("../../models/toon");
      const Enemy = require("../../models/enemy");

      let fight = await Fight.findOne({ _id });
      for (const _id of fight.toons) {
        await Toon.updateOne(
          { _id },
          { current_hp: 40, quickAction: null, action: null, statuses: {} }
        );
      }
      for (const _id of fight.enemies) {
        const enemy = await Enemy.findOne({ _id });
        enemy.current_hp = enemy.hp;
        enemy.action = null;
        await enemy.save();
      }
      fight.phase = "Support";
      fight.round = 0;
      fight = await fight.save();
      res.send(fight);
    } catch (e) {
      next(e);
    }
  });
}

module.exports = router;
