const debug = require("debug")("ybbe:armors");
const express = require("express");
const router = express.Router();

const { Armor } = require("../models/armor");

router.get("/", async (req, res, next) => {
  try {
    const armors = await Armor.find({}).sort("physical");
    res.send(armors);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
