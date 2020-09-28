const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  smashing: {
    type: Number,
    required: true,
  },
  dodging: {
    type: Number,
    required: true,
  },
  entropy: {
    type: Number,
    required: true,
  },
  harmony: {
    type: Number,
    required: true,
  },
  moxie: {
    type: Number,
    required: true,
  },
  wit: {
    type: Number,
    required: true,
  },
});

const Aptitude = mongoose.model("Aptitude", schema);

module.exports = Aptitude;
