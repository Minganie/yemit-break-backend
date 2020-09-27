const debug = require("debug")("ybbe:weapon-model");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  hp: {
    type: Number,
    min: 0,
    max: 4,
  },
  dodging: {
    type: Number,
    min: 0,
    max: 4,
  },
  physique: {
    type: Number,
    min: 0,
    max: 4,
  },
});

const Weapon = mongoose.model("Weapon", schema);

module.exports = Weapon;
