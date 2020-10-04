const debug = require("debug")("ybbe:attack");

const Offense = require("./Offense");
const YbbeError = require("../../../utils/YbbeError");

class Attack extends Offense {
  constructor(action) {
    super();
    this.from = action.from;
    this.user = action.user;
    this.to = action.to;
    this.targets = [];
    this.roll = action.roll;
    this.with = action.with;
  }
  async validate() {
    try {
      this.validateFrom();
      await this.validateToEnemies();
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
    } catch (e) {
      throw e;
    }
  }

  async findStat() {
    let stat;
    if (this.with === "Smashing") stat = await this.from.smashing;
    else stat = await this.from.entropy;
    return stat;
  }

  async computeDamage() {
    const stat = await this.findStat();
    const inspiration = await this.computeInspiration("Attack");
    this.bonusedRoll = this.roll + stat + inspiration;
    let dmg = Math.floor(this.bonusedRoll / 100);
    if (this.roll >= 900) dmg *= 2;
    return dmg;
  }

  async apply() {
    // compute damage
    const totalDmg = await this.computeDamage();
    this.damages = this.spreadDamage(totalDmg);

    // apply damage
    await this.hurtTargets();

    // register action done
    this.from.action = "Attack";
    await this.from.save();
  }

  async log() {
    const msg = `${this.from.name} attacks [${this.targets
      .map((t) => t.name)
      .toString()}], damaging them for [${this.damages.toString()}]`;
    debug(msg);
    return msg;
  }
}

module.exports = Attack;
