const debug = require("debug")("ybbe:armor-model");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  hp: {
    type: Number,
    required: true,
  },
  dodging: {
    type: Number,
    required: true,
  },
  physique: {
    type: Number,
    required: true,
  },
});

const Armor = mongoose.model("Armor", schema);

module.exports = Armor;
