const debug = require("debug")("ybbe:attack-model");
const mongoose = require("mongoose");

const Enemy = require("./enemy");
const Toon = require("./toon");

const attackSchema = new mongoose.Schema({
  from: {
    type: mongoose.ObjectId,
    required: true,
  },
  to: {
    type: mongoose.ObjectId,
    required: true,
  },
  roll: {
    type: Number,
    min: 0,
    max: 1000,
    required: true,
  },
  bonus: {
    type: Number,
    min: 0,
    required: true,
  },
});

attackSchema.methods.computeDamage = async function () {
  try {
    const to = await Toon.findOne({ _id: this.to });

    let dmg = Math.floor((this.roll + this.bonus) / 100);
    if (this.roll >= 900 && !to.statuses.is_parrying) dmg *= 2;

    return dmg;
  } catch (e) {
    throw e;
  }
};

const Attack = mongoose.model("Attack", attackSchema);

module.exports = { Attack, attackSchema };
