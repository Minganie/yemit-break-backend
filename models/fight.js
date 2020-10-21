const debug = require("debug")("ybbe:fight-model");
const mongoose = require("mongoose");

const Attack = require("./attack");
const Enemy = require("./enemy");
const Toon = require("./toon");

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
    enemies: [
      {
        type: mongoose.ObjectId,
        validate: {
          validator: function (value) {
            return value && value.length && value.length > 0;
          },
          message: "A fight must have at least one enemy.",
        },
        required: true,
        ref: "Enemy",
      },
    ],
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
    attacks: [
      {
        type: mongoose.ObjectId,
        required: true, // required but can be empty array
        default: [],
        ref: "Attack",
      },
    ],
    user: {
      type: mongoose.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { autoCreate: true }
);
schema.methods.advance = async function () {
  try {
    switch (this.phase) {
      case "Support":
        this.phase = "Action";
        break;
      case "Action":
        this.phase = "Defense";
        break;
      case "Defense":
        this.phase = "Support";
        this.round = this.round + 1;
        for (const _id of this.toons) {
          const toon = await Toon.findOne({ _id });
          await toon.resetRound();
        }
        for (const _id of this.enemies) {
          const enemy = await Enemy.findOne({ _id });
          await enemy.resetRound();
        }
        break;
      default:
        throw new Error(`Can't imagine what phase you're on "${this.phase}"`);
    }
    return await this.save();
  } catch (e) {
    throw e;
  }
};

const Fight = mongoose.model("Fight", schema);

module.exports = Fight;
