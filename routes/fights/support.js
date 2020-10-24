const debug = require("debug")("ybbe:fights/support");
const express = require("express");
const router = express.Router({ mergeParams: true });

const validate = require("../../middleware/validateAction");
const auth = require("../../middleware/auth");

router.post(
  "/cover",
  [auth.isPlayer, validate.cover],
  async (req, res, next) => {
    try {
      let { from, to } = req.body;

      const fs = { ...from.statuses, is_covering: true, covering: to._id };
      from.set({
        quickAction: "Cover",
        statuses: fs,
      });
      from = await from.save();

      const ts = { ...to.statuses, is_covered: true, covered_by: from._id };
      to.set({
        statuses: ts,
      });
      to = await to.save();

      const wit = await from.wit;
      const msg = `${from.name} is covering ${to.name} (applying ${wit} wit)`;
      req.app.locals.sse.send(
        {
          action: "Support: cover",
          msg: msg,
          toons: [from, to],
        },
        "action-taken"
      );
      debug(msg);

      res.send({ msg, from: from.statuses, to: to.statuses });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/harry",
  [auth.isPlayer, validate.harry],
  async (req, res, next) => {
    try {
      let { from } = req.body;

      const fs = {
        ...from.statuses,
        is_harrying: true,
        harrying_with: req.body.with,
      };
      from.set({
        quickAction: "Harry",
        statuses: fs,
      });
      from = await from.save();

      let stat = 0;
      if (req.body.with === "Smashing") stat = await from.smashing;
      else stat = await from.entropy;

      const msg = `${from.name} is harrying (applying ${stat} ${req.body.with})`;
      req.app.locals.sse.send(
        {
          action: "Support: harry",
          msg: msg,
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

router.post(
  "/inspire",
  [auth.isPlayer, validate.inspire],
  async (req, res, next) => {
    try {
      let { from, to, action } = req.body;

      const fs = {
        ...from.statuses,
        is_inspiring: true,
        inspiring: to._id,
        inspiring_to: action,
      };
      from.set({
        quickAction: "Inspire Action",
        statuses: fs,
      });
      from = await from.save();

      const ts = {
        ...to.statuses,
        is_inspired: true,
        inspired: [
          ...(to.statuses.inspired || []),
          { by: from._id, to: action },
        ],
      };
      to.statuses = ts;
      to = await to.save();

      const moxie = await from.moxie;
      const msg = `${from.name} is inspiring ${to.name} to ${action} (applying ${moxie} moxie)`;
      req.app.locals.sse.send(
        {
          action: "Support: inspire",
          msg: msg,
          toons: [from, to],
        },
        "action-taken"
      );
      debug(msg);

      res.send({ msg, from: from.statuses, to: to.statuses });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/guard",
  [auth.isPlayer, validate.guard],
  async (req, res, next) => {
    try {
      let { from, to } = req.body;

      const fs = { ...from.statuses, is_guarding: true, guarding: to._id };
      from.set({
        quickAction: "Inspire Guard",
        statuses: fs,
      });
      from = await from.save();

      const ts = {
        ...to.statuses,
        is_guarded: true,
        guarded_by: [...(to.statuses.guarded_by || []), from._id],
      };
      to.statuses = ts;
      to = await to.save();

      const moxie = await from.moxie;
      const msg = `${from.name} is guarding ${to.name} (applying ${moxie} moxie)`;
      req.app.locals.sse.send(
        {
          action: "Support: guard",
          msg: msg,
          toons: [from, to],
        },
        "action-taken"
      );
      debug(msg);

      res.send({ msg, from: from.statuses, to: to.statuses });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/parry",
  [auth.isPlayer, validate.parry],
  async (req, res, next) => {
    try {
      let { from } = req.body;

      const fs = { ...from.statuses, is_parrying: true };
      from.set({
        quickAction: "Parry",
        statuses: fs,
      });
      from = await from.save();

      const wit = await from.wit;
      const msg = `${from.name} is parrying (applying ${wit} wit)`;
      req.app.locals.sse.send(
        {
          action: "Support: parry",
          msg: msg,
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

router.post(
  "/pass",
  [auth.isPlayer, validate.passSupport],
  async (req, res, next) => {
    try {
      let { from } = req.body;
      from.quickAction = "Pass";
      from = await from.save();
      const msg = `${from.name} passes for the support phase`;
      req.app.locals.sse.send(
        {
          action: "Support: pass",
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
