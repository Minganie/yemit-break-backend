const debug = require("debug")("ybbe:toons");
const express = require("express");
const router = express.Router();
const _ = require("lodash");

const auth = require("../middleware/auth");
const Toon = require("../models/toon");
const validate = require("../middleware/validate");
const YbbeError = require("../utils/YbbeError");

router.post("/", [auth.isPlayer, validate.toon], async (req, res, next) => {
  try {
    const whitelisted = _.pick(req.body, [
      "name",
      "physical",
      "magical",
      "leadership",
      "main_hand",
      "off_hand",
      "trait",
      "armor",
    ]);
    whitelisted.user = req.user._id;
    let toon = new Toon(whitelisted);
    toon = await toon.save();
    toon = await Toon.findOne({ name: toon.name })
      .populate("main_hand")
      .populate("off_hand")
      .populate("trait")
      .populate("armor");
    res.status(201).send(toon);
  } catch (e) {
    if (e.code && e.code === 11000) {
      next(
        new YbbeError("A toon with this name already exists.", 400, {
          name: ["A toon with this name already exists."],
        })
      );
    } else next(e);
  }
});

router.put("/:id", [auth.isPlayer, validate.toon], async (req, res, next) => {
  try {
    const toon = await Toon.findOne({ _id: req.params.id });
    if (!toon)
      return next(
        new YbbeError("Can't find that toon.", 404, { id: req.params.id })
      );

    if (toon.user.toString() !== req.user._id)
      return next(
        new YbbeError("This isn't your toon.", 403, { id: req.params.id })
      );

    const whitelisted = _.pick(req.body, [
      "name",
      "physical",
      "magical",
      "leadership",
      "main_hand",
      "off_hand",
      "trait",
      "armor",
    ]);
    const updated = await Toon.findByIdAndUpdate(req.params.id, whitelisted, {
      new: true,
    })
      .populate("main_hand")
      .populate("off_hand")
      .populate("trait")
      .populate("armor");
    res.send(updated);
  } catch (e) {
    if (e.code && e.code === 11000) {
      next(
        new YbbeError("A toon with this name already exists.", 400, {
          name: ["A toon with this name already exists."],
        })
      );
    } else next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const toon = await Toon.findOne({ _id: req.params.id })
      .populate("main_hand")
      .populate("off_hand")
      .populate("trait")
      .populate("armor");
    if (!toon)
      return next(
        new YbbeError("Unable to find this toon.", 404, { id: req.params.id })
      );
    res.send(toon);
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const toons = await Toon.find({})
      .populate("main_hand")
      .populate("off_hand")
      .populate("trait")
      .populate("armor")
      .sort("name");
    res.send(toons);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
