const debug = require("debug")("ybbe:parry");
const Action = require("../Action");
const YbbeError = require("../../../utils/YbbeError");

class Parry extends Action {
  constructor(action) {
    super();
    this.from = action.from;
    this.user = action.user;
  }

  validate() {
    this.validateFrom();
    return true;
  }
  async apply() {
    this.from.statuses.is_parrying = true;
    this.from.quickAction = "Parry";
    await this.from.save();
  }
  async log() {
    const wit = await this.from.wit;
    const msg = `${this.from.name} is parrying (applying ${wit} wit)`;
    debug(msg);
    return msg;
  }
}
module.exports = Parry;
