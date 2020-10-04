const debug = require("debug")("ybbe:inspire-guard");
const Action = require("../Action");
const YbbeError = require("../../../utils/YbbeError");

class InspireGuard extends Action {
  constructor(action) {
    super();
    this.from = action.from;
    this.to = action.to;
    this.user = action.user;
  }

  validate() {
    this.validateFrom();
    this.validateToPlayer();
    return true;
  }
  async apply() {
    this.from.statuses.is_guarding = true;
    this.from.statuses.guarding = this.to._id;
    this.from.quickAction = "Inspire Guard";
    await this.from.save();

    this.to.statuses.is_guarded = true;
    this.to.statuses.guarded_by = this.from._id;
    await this.to.save();
  }
  async log() {
    const moxie = await this.from.moxie;
    const msg = `${this.from.name} is guarding ${this.to.name} (applying ${moxie} moxie)`;
    debug(msg);
    return msg;
  }
}
module.exports = InspireGuard;
