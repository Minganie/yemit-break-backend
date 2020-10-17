const debug = require("debug")("ybbe:traits");
const express = require("express");
const router = express.Router();

const { Trait } = require("../models/trait");

router.get("/", async (req, res, next) => {
  try {
    const traits = await Trait.find({}).sort("name");
    res.send(traits);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
