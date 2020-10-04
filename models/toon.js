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
  quickAction: String,
  statuses: {
    is_covering: Boolean,
    covering: mongoose.ObjectId,
    is_covered: Boolean,
    covered_by: mongoose.ObjectId,

    is_inspiring: Boolean,
    inspiring: mongoose.ObjectId,
    inspiring_to: String,
    is_inspired: Boolean,
    inspired_by: mongoose.ObjectId,
    inspired_to: String,

    is_guarding: Boolean,
    guarding: mongoose.ObjectId,
    is_guarded: Boolean,
    guarded_by: mongoose.ObjectId,

    is_harrying: Boolean,
    harrying_with: String,
  },
});

schema.plugin(require("mongoose-autopopulate"));

schema.virtual("wit").get(async function () {
  const t = await Trait.findOne({ _id: this.trait });
  return this.leadership * 100 + t.wit;
});

schema.virtual("moxie").get(async function () {
  const t = await Trait.findOne({ _id: this.trait });
  const mh = await Weapon.findOne({ _id: this.main_hand });
  const oh = await Weapon.findOne({ _id: this.off_hand });
  return this.leadership * 100 + t.moxie + mh.moxie + oh.moxie;
});

schema.virtual("smashing").get(async function () {
  const t = await Trait.findOne({ _id: this.trait });
  const mh = await Weapon.findOne({ _id: this.main_hand });
  const oh = await Weapon.findOne({ _id: this.off_hand });
  return this.physical * 100 + t.smashing + mh.smashing + oh.smashing;
});

schema.virtual("entropy").get(async function () {
  const t = await Trait.findOne({ _id: this.trait });
  const mh = await Weapon.findOne({ _id: this.main_hand });
  const oh = await Weapon.findOne({ _id: this.off_hand });
  return this.magical * 100 + t.entropy + mh.entropy + oh.entropy;
});

schema.methods.resetRound = function () {
  this.quickAction = null;
  this.statuses = {};
};

const Toon = mongoose.model("Toon", schema);

module.exports = Toon;
