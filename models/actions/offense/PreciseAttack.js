const debug = require("debug")("ybbe:precise-attack");

const Offense = require("./Offense");

class Attack extends Offense {
  constructor(action) {
    super();
    this.from = action.from;
    this.user = action.user;
    this.to = action.to;
    this.targets = [];
  }
  async validate() {
    try {
      this.validateFrom();
      await this.validateToEnemies();
      return true;
    } catch (e) {
      throw e;
    }
  }
  async computeDamage() {
    const stat = await this.from.wit;
    const inspiration = await this.computeInspiration("Precise Attack");
    let harrying = 0;
    if (this.from.statuses.is_harrying) {
      if (this.from.statuses.harrying_with === "Smashing")
        harrying = await this.from.smashing;
      else harrying = await this.from.entropy;
    }
    const bonused = stat + inspiration + harrying;
    return Math.floor(bonused / 100);
  }

  async apply() {
    // compute damage
    const totalDmg = await this.computeDamage();
    this.damages = this.spreadDamage(totalDmg);

    // apply damage
    await this.hurtTargets();

    // register action done
    this.from.action = "Precise Attack";
    await this.from.save();
  }

  async log() {
    const msg = `${this.from.name} precisely attacks [${this.targets
      .map((t) => t.name)
      .toString()}], damaging them for [${this.damages.toString()}]`;
    debug(msg);
    return msg;
  }
}

module.exports = Attack;
