const debug = require("debug")("ybbe:attack");
const mongoose = require("mongoose");

const Enemy = require("../../../models/enemy");
const Toon = require("../../toon");
const YbbeError = require("../../../utils/YbbeError");

class Attack {
  constructor(action) {
    this.from = action.from;
    this.user = action.user;
    this.to = action.to;
    this.targets = [];
    this.roll = action.roll;
    this.with = action.with;
  }
  async validate() {
    if (!this.from)
      throw new YbbeError("Toon who is attacking must be specified", 400, {
        from: "Toon who is attacking must be specified",
      });
    if (this.user._id !== this.from.user._id.toString())
      throw new YbbeError("Toon who is attacking must be yours", 400, {
        user: this.user._id,
      });
    if (!this.to || (this.to && this.to.length < 1))
      throw new YbbeError("Targets must be specified", 400, {
        to: "Targets must be specified",
      });
    for (const targetId of this.to) {
      if (!mongoose.isValidObjectId(targetId))
        throw new YbbeError("Targets must have valid ids", 400, {
          to: "Targets must have valid ids",
        });
      const target = await Enemy.findOne({ _id: targetId });
      if (!target)
        throw new YbbeError("Targets must exist", 404, {
          to: "Targets must exist",
        });
      this.targets.push(target);
    }
    if (this.roll < 0 || this.roll > 1000)
      throw new YbbeError(`${this.roll} is not a valid roll`, 400, {
        roll: `${this.roll} is not a valid roll`,
      });
    const stats = ["Entropy", "Smashing"];
    if (!stats.includes(this.with))
      throw new YbbeError("You must attack with: " + stats.toString(), 400, {
        with: "You must attack with: " + stats.toString(),
      });
    return true;
  }
  async computeDamage() {
    let stat = 0;
    if (this.with === "Smashing") stat = await this.from.smashing;
    else stat = await this.from.entropy;

    let inspiration = 0;
    if (
      this.from.statuses.is_inspired &&
      this.from.statuses.inspired_to === "Attack"
    ) {
      const inspirer = Toon.findOne({ _id: this.from.statuses.inspired_by });
      inspiration = await inspirer.moxie;
    }
    const bonusedRoll = this.roll + stat + inspiration;
    let dmg = Math.floor(bonusedRoll / 100);
    if (this.roll >= 900) dmg *= 2;
    return dmg;
  }

  spreadDamage(totalDmg) {
    const n = this.targets.length;
    const div = Math.floor(totalDmg / n);
    const rest = totalDmg % n;
    const dmg = [];
    for (let i = 0; i < n; i++) {
      const d = i < rest ? div + 1 : div;
      dmg.push(d);
    }
    return dmg;
  }

  async apply() {
    const totalDmg = await this.computeDamage();
    this.damages = this.spreadDamage(totalDmg);

    // apply damage
    for (let i = 0; i < this.targets.length; i++) {
      const target = this.targets[i];
      target.current_hp = target.current_hp - this.damages[i];
      await target.save();
    }
    // register action done
    this.from.action = "Attack";
    await this.from.save();
  }
  async log() {
    const msg = `${this.from.name} attacked [${this.targets
      .map((t) => t.name)
      .toString()}], damaging them for [${this.damages.toString()}]`;
    debug(msg);
    return msg;
  }
}

module.exports = Attack;
