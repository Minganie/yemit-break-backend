const debug = require("debug")("ybbe:toons");
const express = require("express");
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

router.post("/", [auth.isDm, validate.fight], async (req, res, next) => {
  try {
    const enemyIds = [];
    const enemyPromises = [];
    for (const bodyEnemy of req.body.enemies) {
      const amended = _.pick(bodyEnemy, ["name", "dc", "ab", "hp"]);
      amended.current_hp = amended.hp;
      const enemy = new Enemy(amended);
      enemyIds.push(enemy._id);
      enemyPromises.push(enemy.save());
    }
    await Promise.all(enemyPromises);

    const f = _.pick(req.body, ["name", "toons"]);
    f.enemies = enemyIds;

    const fight = await new Fight(f).save();
    res.status(201).send(fight);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
