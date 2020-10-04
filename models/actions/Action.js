const mongoose = require("mongoose");
const Enemy = require("../../models/enemy");
const Toon = require("../../models/toon");
const YbbeError = require("../../utils/YbbeError");

class Action {
  constructor() {}
  validateFrom() {
    if (!this.from)
      throw new YbbeError("Toon who is acting must be specified", 400, {
        from: "Toon who is acting must be specified",
      });
    if (this.user._id !== this.from.user._id.toString())
      throw new YbbeError("Toon who is acting must be yours", 400, {
        user: this.user._id,
      });
  }
  validateToPlayer() {
    if (!this.to)
      throw new YbbeError("Toon who is acted on must be specified", 400, {
        to: "Toon who is acted on must be specified",
      });
  }
  async validateToEnemies() {
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
}

module.exports = Action;
