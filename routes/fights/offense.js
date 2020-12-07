const debug = require("debug")("ybbe:fights/offense");
const express = require("express");
const router = express.Router({ mergeParams: true });

const validate = require("../../middleware/validateAction");
const auth = require("../../middleware/auth");

const Fight = require("../../models/fight");
const Toon = require("../../models/toon");

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
    for (const [name, targetValue] of Object.entries(zip)) {
      if (action.bonusedRoll > targetValue.target.dc) {
        targetValue.name = "Hit";
        targetValue.target.current_hp =
          targetValue.target.current_hp - targetValue.value;
        await targetValue.target.save();
      } else {
        targetValue.name = "Miss";
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
      let { from } = req.body;

      // compute damage
      const totalDmg = await from.computeTotal(req.body);
      const zip = zipper(totalDmg, req.body.to);

      // apply damage
      await applyDamage(req.body, zip);

      // register action done
      from = await from.takeAction("Attack");

      // log
      const msg = `${from.name} attacks [${Object.keys(zip)
        .map((k) => k)
        .toString()}], damaging them for [${Object.keys(zip)
        .map((k) => (zip[k].name === "Miss" ? "Miss" : zip[k].value))
        .toString()}]`;
      const fight = await Fight.findOne({ _id: req.params.id })
        .populate("enemies")
        .populate("attacks");
      req.app.locals.sse.send(
        {
          action: "Offense: attack",
          msg: msg,
          toons: [from],
          fight: fight,
        },
        "action-taken"
      );
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
    let { from } = req.body;

    // compute heal
    const totalHeal = await from.computeTotal(req.body);
    const zip = zipper(totalHeal, req.body.to);

    // apply heal
    for (const [name, a] of Object.entries(zip)) {
      a.target.current_hp = a.target.current_hp + a.value;
      await a.target.save();
    }

    // register action done
    from = await from.takeAction("Heal");

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
    const targetIds = req.body.to.map((t) => {
      return t._id;
    });
    const tos = await Toon.find({ _id: { $in: targetIds } });
    req.app.locals.sse.send(
      {
        action: "Offense: heal",
        msg: msg,
        toons: [from, ...tos],
      },
      "action-taken"
    );
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
      let { from } = req.body;

      // compute damage
      const totalDmg = await from.computeTotal(req.body);
      const zip = zipper(totalDmg, req.body.to);

      // apply damage
      await applyDamage(req.body, zip);

      // register action done
      from = await from.takeAction("Precise Attack");

      // log
      const tars = Object.keys(zip)
        .map((k, i) => {
          return k;
        })
        .toString();
      const vals = Object.keys(zip)
        .map((k, i) => (zip[k].name === "Miss" ? "Miss" : zip[k].value))
        .toString();
      const msg = `${from.name} precisely attacks [${tars}] for [${vals}]`;
      const fight = await Fight.findOne()
        .populate("enemies")
        .populate("attacks");
      req.app.locals.sse.send(
        {
          action: "Offense: precise attack",
          msg: msg,
          toons: [from],
          fight: fight,
        },
        "action-taken"
      );
      debug(msg);

      // respond
      res.send({ msg, attack: zip });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/pass",
  [auth.isPlayer, validate.passAction],
  async (req, res, next) => {
    try {
      let { from } = req.body;
      from.action = "Pass";
      from = await from.save();
      const msg = `${from.name} passes for the action phase`;
      req.app.locals.sse.send(
        {
          action: "Action: pass",
          msg,
          toons: [from],
        },
        "action-taken"
      );
      debug(msg);
      res.send({ msg, from: from.statuses });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
