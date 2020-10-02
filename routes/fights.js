const debug = require("debug")("ybbe:toons");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const _ = require("lodash");

const auth = require("../middleware/auth");
const Enemy = require("../models/enemy");
const Fight = require("../models/fight");
const validate = require("../middleware/validate");
const YbbeError = require("../utils/YbbeError");

router.get("/", async (req, res, next) => {
  try {
    const fights = await Fight.find({}).sort("name");
    res.send(fights);
  } catch (e) {
    next(e);
  }
});

const createFight = async (bodyFight, session) => {
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

  const f = { ..._.pick(bodyFight, ["name", "toons"]), enemies: enemyIds };
  return new Fight(f).save({ session });
};

router.post("/", [auth.isDm, validate.fight], async (req, res, next) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const fight = await createFight(req.body, session);
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

module.exports = router;
