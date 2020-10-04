const debug = require("debug")("ybbe:armor-model");
const mongoose = require("mongoose");

const armorSchema = new mongoose.Schema({
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
  physical: {
    type: Number,
    required: true,
  },
});

const Armor = mongoose.model("Armor", armorSchema);

module.exports = { Armor, armorSchema };
