const debug = require("debug")("ybbe:toon-model");
const mongoose = require("mongoose");

const { Armor, armorSchema } = require("../models/armor");
const { Trait, traitSchema } = require("../models/trait");
const User = require("../models/user");
const { Weapon, weaponSchema } = require("../models/weapon");

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
    autopopulate: true,
  },
  armor: {
    type: mongoose.ObjectId,
    required: true,
    ref: "Armor",
    autopopulate: true,
  },
  main_hand: {
    type: mongoose.ObjectId,
    required: true,
    ref: "Weapon",
    autopopulate: true,
  },
  off_hand: {
    type: mongoose.ObjectId,
    required: true,
    ref: "Weapon",
    autopopulate: true,
  },
  user: {
    type: mongoose.ObjectId,
    required: true,
    ref: "User",
  },
  current_hp: {
    type: Number,
    required: true,
    default: 40,
  },
  quickAction: String,
  action: String,
  statuses: {
    type: Object,
    required: true,
    default: {},
  },
});

schema.plugin(require("mongoose-autopopulate"));

schema.virtual("smashing").get(async function () {
  const t = await Trait.findOne({ _id: this.trait });
  const mh = await Weapon.findOne({ _id: this.main_hand });
  const oh = await Weapon.findOne({ _id: this.off_hand });
  return this.physical * 100 + t.smashing + mh.smashing + oh.smashing;
});

schema.virtual("dodging").get(async function () {
  const a = await Armor.findOne({ _id: this.armor });
  const t = await Trait.findOne({ _id: this.trait });
  const mh = await Weapon.findOne({ _id: this.main_hand });
  const oh = await Weapon.findOne({ _id: this.off_hand });
  return this.physical * 100 + t.dodging + mh.dodging + oh.dodging + a.dodging;
});

schema.virtual("entropy").get(async function () {
  const t = await Trait.findOne({ _id: this.trait });
  const mh = await Weapon.findOne({ _id: this.main_hand });
  const oh = await Weapon.findOne({ _id: this.off_hand });
  return this.magical * 100 + t.entropy + mh.entropy + oh.entropy;
});

schema.virtual("harmony").get(async function () {
  const t = await Trait.findOne({ _id: this.trait });
  const mh = await Weapon.findOne({ _id: this.main_hand });
  const oh = await Weapon.findOne({ _id: this.off_hand });
  return this.magical * 100 + t.harmony + mh.harmony + oh.harmony;
});

schema.virtual("moxie").get(async function () {
  const t = await Trait.findOne({ _id: this.trait });
  const mh = await Weapon.findOne({ _id: this.main_hand });
  const oh = await Weapon.findOne({ _id: this.off_hand });
  return this.leadership * 100 + t.moxie + mh.moxie + oh.moxie;
});

schema.virtual("wit").get(async function () {
  const t = await Trait.findOne({ _id: this.trait });
  return this.leadership * 100 + t.wit;
});

schema.virtual("max_hp").get(async function () {
  const a = await Armor.findOne({ _id: this.armor });
  const t = await Trait.findOne({ _id: this.trait });
  const mh = await Weapon.findOne({ _id: this.main_hand });
  const oh = await Weapon.findOne({ _id: this.off_hand });
  return 40 + mh.hp + oh.hp + t.hp + a.hp;
});

schema.methods.resetRound = async function () {
  this.quickAction = null;
  this.action = null;
  this.statuses = {};
  return await this.save();
};
schema.methods.resetFight = async function () {
  this.quickAction = null;
  this.action = null;
  this.statuses = {};
  this.current_hp = await this.max_hp;
  return await this.save();
};
schema.methods.computeDodge = async function (roll) {
  const dodge = await this.dodging;

  let guarded = 0;
  if (this.statuses.is_guarded) {
    for (const _id of this.statuses.guarded_by) {
      const guarder = await Toon.findOne({ _id });
      guarded += await guarder.moxie;
    }
  }

  let parrying = 0;
  if (this.statuses.is_parrying) {
    parrying += await this.wit;
  }

  let dodged = Math.floor((roll + dodge + guarded + parrying) / 100);
  if (roll >= 900) dodged *= 2;
  return dodged;
};
schema.methods.takeDamage = async function (dmg) {
  this.current_hp = this.current_hp - dmg;
  return await this.save();
};

const Toon = mongoose.model("Toon", schema);

module.exports = Toon;
