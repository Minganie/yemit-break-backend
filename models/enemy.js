const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
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
    action: {
      type: String,
    },
  },
  { autoCreate: true }
);

schema.methods.takeDamage = async function (dmg) {
  try {
    this.current_hp = this.current_hp - dmg;
    return await this.save();
  } catch (e) {
    throw e;
  }
};
schema.methods.resetRound = async function () {
  try {
    this.action = null;
    return await this.save();
  } catch (e) {
    throw e;
  }
};
schema.methods.takeAction = async function (action) {
  try {
    this.action = action;
    return await this.save();
  } catch (e) {
    throw e;
  }
};

const Enemy = mongoose.model("Enemy", schema);

module.exports = Enemy;
