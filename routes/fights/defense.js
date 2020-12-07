const debug = require("debug")("ybbe:fights/defense");
const express = require("express");
const router = express.Router({ mergeParams: true });

const { Attack } = require("../../models/attack");
const Enemy = require("../../models/enemy");
const Fight = require("../../models/fight");
const Toon = require("../../models/toon");

const auth = require("../../middleware/auth");
const validate = require("../../middleware/validateAction");
const YbbeError = require("../../utils/YbbeError");

const itsYourFight = async (req, res, next) => {
  try {
    const fight = await Fight.findOne({ _id: req.params.id });
    if (fight.user._id.toString() !== req.user._id)
      throw new YbbeError("It's not your fight", 403, {
        token: "It's not your fight",
      });
    req.fight = fight;
    next();
  } catch (e) {
    next(e);
  }
};

const insertAttacks = async (fightId, action) => {
  const attacks = [];
  for (const toon of action.to) {
    const attack = await new Attack({
      from: action.from,
      to: toon,
      roll: action.roll,
      bonus:
        action.name === "Tank Buster" ? action.tankBusterBonus : action.from.ab,
    }).save();
    attacks.push(attack);
    await Fight.updateOne({ _id: fightId }, { $push: { attacks: attack._id } });
  }
  return attacks;
};

router.post(
  "/mob-attack",
  [auth.isDm, itsYourFight, validate.mobAttack],
  async (req, res, next) => {
    try {
      const attacks = await insertAttacks(req.params.id, req.body);

      req.body.from = await req.body.from.takeAction("Mob Attack");

      const msg = `${req.body.from.name} attacked [${req.body.to
        .map((t) => t.name)
        .toString()}] for [${attacks
        .map((a) => a.roll + "+" + a.bonus)
        .toString()}]`;

      const fight = await Fight.findOne({ _id: req.params.id })
        .populate("enemies")
        .populate("attacks");
      req.app.locals.sse.send(
        {
          action: "Defense: mob attack",
          msg,
          fight,
        },
        "mob-acted"
      );
      debug(msg);

      res.send({ msg, attacks });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/mob-tank-buster",
  [auth.isDm, itsYourFight, validate.mobTankBuster],
  async (req, res, next) => {
    try {
      const attacks = await insertAttacks(req.params.id, req.body);
      req.body.from = await req.body.from.takeAction("Tank Buster");

      const msg = `${req.body.from.name} busted [${req.body.to
        .map((t) => t.name)
        .toString()}] for [${attacks
        .map((a) => a.roll + "+" + a.bonus)
        .toString()}]`;
      const fight = await Fight.findOne({ _id: req.params.id })
        .populate("enemies")
        .populate("attacks");
      req.app.locals.sse.send(
        {
          action: "Defense: mob tank buster",
          msg,
          fight,
        },
        "mob-acted"
      );
      debug(msg);

      res.send({ msg, attacks });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/resolve",
  [auth.isPlayer, validate.resolve],
  async (req, res, next) => {
    try {
      let { from: toon, to: attack } = req.body;
      let msg;

      const dodged = await toon.computeDodge(req.body.roll);
      const dmg = await attack.computeDamage();
      let enemy = await Enemy.findOne({ _id: attack.from });

      let modToonId = null;

      if (dodged > dmg) {
        const retaliation = dodged - dmg;
        enemy = await enemy.takeDamage(retaliation);
        msg = `${toon.name} dodged the attack and retaliated against ${enemy.name} for ${retaliation} dmg`;
      } else {
        let hurt = dmg - dodged;
        if (toon.statuses.is_covered) {
          msg = `${toon.name} dodged ${dodged} from ${enemy.name}'s attack but would still have been hit for ${hurt} dmg\n`;
          let coverer = await Toon.findOne({ _id: toon.statuses.covered_by });
          const wit = Math.floor((await coverer.wit) / 100);
          if (wit > hurt) {
            const retaliation = wit - hurt;
            enemy = await enemy.takeDamage(retaliation);
            msg += `; ${coverer.name} is so witty they retaliated against ${enemy.name} for ${retaliation} dmg`;
          } else {
            hurt = hurt - wit;
            coverer = await coverer.takeDamage(hurt);
            msg += `; ${coverer.name} takes the leftover ${hurt} dmg from ${enemy.name}`;
            modToonId = coverer._id;
          }
        } else {
          toon = await toon.takeDamage(hurt);
          modToonId = toon._id;
          msg = `${toon.name} dodged ${dodged} from ${enemy.name}'s attack and was hit for ${hurt} dmg`;
        }
      }
      await Attack.deleteOne({ _id: attack._id });
      await Fight.updateOne(
        { _id: req.params.id },
        { $pull: { attacks: attack._id } }
      );

      const fight = await Fight.findOne({ _id: req.params.id })
        .populate("enemies")
        .populate("attacks");
      const modToon = modToonId ? await Toon.findOne({ _id: modToonId }) : null;
      req.app.locals.sse.send(
        {
          action: "Defense: attack resolved",
          msg,
          fight,
          toons: modToon ? [modToon] : null,
        },
        "action-taken"
      );
      debug(msg);
      res.send({ msg });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
