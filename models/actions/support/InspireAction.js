const debug = require("debug")("ybbe:inspire-action");
const Action = require("../Action");
const YbbeError = require("../../../utils/YbbeError");

class InspireAction extends Action {
  constructor(action) {
    super();
    this.from = action.from;
    this.to = action.to;
    this.action = action.action;
    this.user = action.user;
  }

  validate() {
    this.validateFrom();
    this.validateToPlayer();
    const actions = ["Attack", "Heal", "Precise Attack"];
    if (!actions.includes(this.action))
      throw new YbbeError(
        "Inspired action must be among " + actions.toString(),
        400,
        { action: "Inspired action must be among " + actions.toString() }
      );
    return true;
  }
  async apply() {
    this.from.statuses.is_inspiring = true;
    this.from.statuses.inspiring = this.to._id;
    this.from.statuses.inspiring_to = this.action;
    this.from.quickAction = "Inspire Action";
    await this.from.save();

    this.to.statuses.is_inspired = true;
    this.to.statuses.inspired_by = this.from._id;
    this.to.statuses.inspired_to = this.action;
    await this.to.save();
  }
  async log() {
    const moxie = await this.from.moxie;
    const msg = `${this.from.name} is inspiring ${this.to.name} to ${this.action} (applying ${moxie} moxie)`;
    debug(msg);
    return msg;
  }
}
module.exports = InspireAction;
