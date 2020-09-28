const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ab: {
    type: Number,
    required: true,
    min: 0,
  },
  dc: {
    type: Number,
    required: true,
    min: 0,
  },
  hp: {
    type: Number,
    required: true,
    min: 0,
  },
  current_hp: {
    type: Number,
    required: true,
  },
});

const Enemy = mongoose.model("Enemy", schema);

module.exports = Enemy;
