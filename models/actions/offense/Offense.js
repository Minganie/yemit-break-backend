const debug = require("debug")("ybbe:offense-class");
const mongoose = require("mongoose");

const Action = require("../Action");
const Enemy = require("../../../models/enemy");
const Toon = require("../../../models/toon");
const YbbeError = require("../../../utils/YbbeError");

class Offense extends Action {
  constructor() {
    super();
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
