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
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  race: {
    type: String,
    enum: [
      "Elezen",
      "Hyur",
      "Lalafell",
      "Miqo'te",
      "Roegadyn",
      "Au Ra",
      "Hrothgar",
      "Viera",
    ],
    required: true,
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
  try {
    const t = await Trait.findOne({ _id: this.trait });
    const mh = await Weapon.findOne({ _id: this.main_hand });
    const oh = await Weapon.findOne({ _id: this.off_hand });
    return this.physical * 100 + t.smashing + mh.smashing + oh.smashing;
  } catch (e) {
    throw e;
  }
});

schema.virtual("dodging").get(async function () {
  try {
    const a = await Armor.findOne({ _id: this.armor });
    const t = await Trait.findOne({ _id: this.trait });
    const mh = await Weapon.findOne({ _id: this.main_hand });
    const oh = await Weapon.findOne({ _id: this.off_hand });
    return (
      this.physical * 100 + t.dodging + mh.dodging + oh.dodging + a.dodging
    );
  } catch (e) {
    throw e;
  }
});

schema.virtual("entropy").get(async function () {
  try {
    const t = await Trait.findOne({ _id: this.trait });
    const mh = await Weapon.findOne({ _id: this.main_hand });
    const oh = await Weapon.findOne({ _id: this.off_hand });
    return this.magical * 100 + t.entropy + mh.entropy + oh.entropy;
  } catch (e) {
    throw e;
  }
});

schema.virtual("harmony").get(async function () {
  try {
    const t = await Trait.findOne({ _id: this.trait });
    const mh = await Weapon.findOne({ _id: this.main_hand });
    const oh = await Weapon.findOne({ _id: this.off_hand });
    return this.magical * 100 + t.harmony + mh.harmony + oh.harmony;
  } catch (e) {
    throw e;
  }
});

schema.virtual("moxie").get(async function () {
  try {
    const t = await Trait.findOne({ _id: this.trait });
    const mh = await Weapon.findOne({ _id: this.main_hand });
    const oh = await Weapon.findOne({ _id: this.off_hand });
    return this.leadership * 100 + t.moxie + mh.moxie + oh.moxie;
  } catch (e) {
    throw e;
  }
});

schema.virtual("wit").get(async function () {
  try {
    const t = await Trait.findOne({ _id: this.trait });
    return this.leadership * 100 + t.wit;
  } catch (e) {
    throw e;
  }
});

schema.virtual("max_hp").get(async function () {
  try {
    const a = await Armor.findOne({ _id: this.armor });
    const t = await Trait.findOne({ _id: this.trait });
    const mh = await Weapon.findOne({ _id: this.main_hand });
    const oh = await Weapon.findOne({ _id: this.off_hand });
    return 40 + mh.hp + oh.hp + t.hp + a.hp;
  } catch (e) {
    throw e;
  }
});

schema.methods.resetRound = async function () {
  try {
    this.quickAction = null;
    this.action = null;
    this.statuses = {};
    return await this.save();
  } catch (e) {
    throw e;
  }
};
schema.methods.resetFight = async function () {
  try {
    this.quickAction = null;
    this.action = null;
    this.statuses = {};
    this.current_hp = await this.max_hp;
    return await this.save();
  } catch (e) {
    throw e;
  }
};
schema.methods.computeDodge = async function (roll) {
  try {
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
  } catch (e) {
    throw e;
  }
};
schema.methods.computeInspiration = async function (action) {
  try {
    let inspiration = 0;
    if (this.statuses.is_inspired) {
      for (const inspired of this.statuses.inspired) {
        const inspiredToHeal = inspired.to === "Heal" && action.name === "Heal";
        const inspiredToAttack =
          inspired.to === "Attack" &&
          (action.name === "Attack" || action.name === "Precise Attack");
        if (inspiredToHeal || inspiredToAttack) {
          const inspirer = await Toon.findOne({
            _id: inspired.by,
          });
          inspiration += await inspirer.moxie;
        }
      }
    }
    return inspiration;
  } catch (e) {
    throw e;
  }
};
schema.methods.computeTotal = async function (action) {
  try {
    // base stat
    const stat = await this.findStat(action);
    // inspire action
    const inspiration = await this.computeInspiration(action);
    // harry
    let harrying = 0;
    if (action.name === "Precise Attack") {
      if (this.statuses.is_harrying) {
        if (this.statuses.harrying_with === "Smashing")
          harrying = await this.smashing;
        else harrying = await this.entropy;
      }
    }

    action.bonusedRoll =
      (action.roll ? action.roll : 0) + stat + inspiration + harrying;
    let trunc = Math.floor(action.bonusedRoll / 100);

    // crit
    if (action.roll && action.roll >= 900) trunc *= 2;

    return trunc;
  } catch (e) {
    throw e;
  }
};
schema.methods.findStat = async function (action) {
  try {
    if (action.name === "Heal") return await this.harmony;
    if (action.name === "Precise Attack") return await this.wit;
    if (action.with === "Smashing") return await this.smashing;
    return await this.entropy;
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
schema.methods.takeDamage = async function (dmg) {
  try {
    this.current_hp = this.current_hp - dmg;
    return await this.save();
  } catch (e) {
    throw e;
  }
};

const Toon = mongoose.model("Toon", schema);

module.exports = Toon;
