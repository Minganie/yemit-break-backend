const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    toons: {
      type: [mongoose.ObjectId],
      validate: {
        validator: function (value) {
          return value && value.length && value.length > 0;
        },
        message: "A fight must have at least one toon.",
      },
      required: true,
    },
    enemies: {
      type: [mongoose.ObjectId],
      validate: {
        validator: function (value) {
          return value && value.length && value.length > 0;
        },
        message: "A fight must have at least one enemy.",
      },
      required: true,
    },
    round: {
      type: Number,
      required: true,
      default: 0,
    },
    phase: {
      type: String,
      enum: ["Support", "Action", "Defense"],
      default: "Support",
      required: true,
    },
    attacks: {
      type: [mongoose.ObjectId],
      required: true, // required but can be empty array
      default: [],
    },
  },
  { autoCreate: true }
);

const Fight = mongoose.model("Fight", schema);

module.exports = Fight;
