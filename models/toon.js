const debug = require("debug")("ybbe:toon-model");
const mongoose = require("mongoose");

const Armor = require("../models/armor");
const Trait = require("../models/trait");
const Weapon = require("../models/weapon");
const User = require("../models/user");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  physical: {
    type: Number,
    min: 0,
    max: 4,
  },
  magical: {
    type: Number,
    min: 0,
    max: 4,
  },
  leadership: {
    type: Number,
    min: 0,
    max: 4,
  },
  trait: {
    type: mongoose.ObjectId,
    required: true,
    ref: "Trait",
  },
  armor: {
    type: mongoose.ObjectId,
    required: true,
    ref: "Armor",
  },
  main_hand: {
    type: mongoose.ObjectId,
    required: true,
    ref: "Weapon",
  },
  off_hand: {
    type: mongoose.ObjectId,
    required: true,
    ref: "Weapon",
  },
  user: {
    type: mongoose.ObjectId,
    required: true,
    ref: "User",
  },
});

const Toon = mongoose.model("Toon", schema);

module.exports = Toon;
