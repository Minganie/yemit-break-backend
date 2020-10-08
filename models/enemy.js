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
  this.current_hp = this.current_hp - dmg;
  return await this.save();
};
schema.methods.resetRound = async function () {
  this.action = null;
  return await this.save();
};

const Enemy = mongoose.model("Enemy", schema);

module.exports = Enemy;
