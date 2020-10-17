const debug = require("debug")("ybbe:weapons");
const express = require("express");
const router = express.Router();

const { Weapon } = require("../models/weapon");

router.get("/", async (req, res, next) => {
  try {
    const weapons = await Weapon.find({}).sort("name");
    res.send(weapons);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
