const debug = require("debug")("ybbe:offense-class");
const mongoose = require("mongoose");

const Enemy = require("../../../models/enemy");
const Toon = require("../../../models/toon");
const YbbeError = require("../../../utils/YbbeError");

class Offense {
  constructor() {}
  validateFrom() {
    if (!this.from)
      throw new YbbeError("Toon who is attacking must be specified", 400, {
        from: "Toon who is attacking must be specified",
      });
    if (this.user._id !== this.from.user._id.toString())
      throw new YbbeError("Toon who is attacking must be yours", 400, {
        user: this.user._id,
      });
  }
  async validateTargets() {
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
  }
  async computeInspiration(action) {
    let inspiration = 0;
    if (
      this.from.statuses.is_inspired &&
      this.from.statuses.inspired_to === action
    ) {
      const inspirer = await Toon.findOne({
        _id: this.from.statuses.inspired_by,
      });
      inspiration = await inspirer.moxie;
    }
    return inspiration;
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
  async hurtTargets() {
    for (let i = 0; i < this.targets.length; i++) {
      const target = this.targets[i];
      if (this.bonusedRoll) {
        if (this.bonusedRoll > target.dc)
          target.current_hp = target.current_hp - this.damages[i];
        else this.damages[i] = "miss";
      } else target.current_hp = target.current_hp - this.damages[i];
      await target.save();
    }
  }
}

module.exports = Offense;
