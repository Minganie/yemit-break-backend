const debug = require("debug")("ybbe:fights/offense");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });

const action = require("../../middleware/action");
const auth = require("../../middleware/auth");
const validate = require("../../middleware/validate");

router.post(
  "/",
  [auth.isPlayer, action.populate, action.validate, validate.toonHasNotActed],
  async (req, res, next) => {
    try {
      await req.action.apply();
      const msg = await req.action.log();
      res.status(200).send({ msg });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
