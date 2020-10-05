const debug = require("debug")("ybbe:fights/offense");
const express = require("express");
const router = express.Router({ mergeParams: true });

const Toon = require("../../models/toon");
const validate = require("../../middleware/validateAction");
const auth = require("../../middleware/auth");

const computeInspiration = async (action) => {
  try {
    let inspiration = 0;
    if (action.from.statuses.is_inspired) {
      for (const inspired of action.from.statuses.inspired) {
        if (inspired.to === action.name) {
          const inspirer = await Toon.findOne({
            _id: inspired.by,
          });
          inspiration += await inspirer.moxie;
        }
      }
    }
    return inspiration;
  } catch (e) {
    throw e;
  }
};
const findStat = async (action) => {
  try {
    if (action.name === "Heal") return await action.from.harmony;
    if (action.name === "Precise Attack") return await action.from.wit;
    if (action.with === "Smashing") return await action.from.smashing;
    return await action.from.entropy;
  } catch (e) {
    throw e;
  }
};
const computeTotal = async (action) => {
  try {
    // base stat
    const stat = await findStat(action);
    // inspire action
    const inspiration = await computeInspiration(action);
    // harry
    let harrying = 0;
    if (action.name === "Precise Attack") {
      if (action.from.statuses.is_harrying) {
        if (action.from.statuses.harrying_with === "Smashing")
          harrying = await action.from.smashing;
        else harrying = await action.from.entropy;
      }
    }

    action.bonusedRoll =
      (action.roll ? action.roll : 0) + stat + inspiration + harrying;
    let trunc = Math.floor(action.bonusedRoll / 100);

    // crit
    if (action.roll && action.roll >= 900) trunc *= 2;

    return trunc;
  } catch (e) {
    throw e;
  }
};
const zipper = (total, targets) => {
  const result = {};
  const rest = total % targets.length;
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    let num = Math.floor(total / targets.length);
    if (i < rest) num += 1;
    result[target.name] = {
      target: target,
      value: num,
    };
  }
  return result;
};

const applyDamage = async (action, zip) => {
  try {
    for (const [name, a] of Object.entries(zip)) {
      if (action.bonusedRoll > a.target.dc) {
        a.name = "Hit";
        a.target.current_hp = a.target.current_hp - a.value;
        await a.target.save();
      } else {
        a.name = "Miss";
      }
    }
  } catch (e) {
    throw e;
  }
};

router.post(
  "/attack",
  [auth.isPlayer, validate.attack],
  async (req, res, next) => {
    try {
      // compute damage
      const totalDmg = await computeTotal(req.body);
      const zip = zipper(totalDmg, req.body.to);

      // apply damage
      await applyDamage(req.body, zip);

      // register action done
      const from = req.body.from;
      from.action = "Attack";
      await from.save();

      // log
      const msg = `${from.name} attacks [${zip
        .map((t) => t.target.name)
        .toString()}], damaging them for [${zip
        .map((t) => (t.name === "Miss" ? "Miss" : t.value))
        .toString()}]`;
      debug(msg);

      // respond
      res.send({ msg, attack: zip });
    } catch (e) {
      next(e);
    }
  }
);

router.post("/heal", [auth.isPlayer, validate.heal], async (req, res, next) => {
  try {
    // compute heal
    const totalHeal = await computeTotal(req.body);
    const zip = zipper(totalHeal, req.body.to);

    // apply heal
    const { from } = req.body;
    for (const [name, a] of Object.entries(zip)) {
      a.target.current_hp = a.target.current_hp + a.value;
      await a.target.save();
    }

    // register action done
    from.action = "Heal";
    await from.save();

    // log
    const tars = Object.keys(zip)
      .map((k, i) => {
        return k;
      })
      .toString();
    const vals = Object.keys(zip)
      .map((k, i) => zip[k].value)
      .toString();
    const msg = `${from.name} heals [${tars}] for [${vals}]`;
    debug(msg);

    // respond
    res.send({ msg, heal: zip });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/precise",
  [auth.isPlayer, validate.precise],
  async (req, res, next) => {
    try {
      // compute damage
      const totalDmg = await computeTotal(req.body);
      const zip = zipper(totalDmg, req.body.to);

      // apply damage
      await applyDamage(req.body, zip);

      // register action done
      const { from } = req.body;
      from.action = "Precise Attack";
      await from.save();

      // log
      const tars = Object.keys(zip)
        .map((k, i) => {
          return k;
        })
        .toString();
      const vals = Object.keys(zip)
        .map((k, i) => (zip[k].name == "Miss" ? "Miss" : zip[k].value))
        .toString();
      const msg = `${from.name} precisely attacks [${tars}] for [${vals}]`;
      debug(msg);

      // respond
      res.send({ msg, attack: zip });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
