const debug = require("debug")("ybbe:cover");
const Action = require("../Action");
const YbbeError = require("../../../utils/YbbeError");

class Cover extends Action {
  constructor(action) {
    super();
    this.from = action.from;
    this.to = action.to;
    this.user = action.user;
  }
  async validate() {
    this.validateFrom();
    this.validateToPlayer();
    return true;
  }
  async apply() {
    this.from.statuses.is_covering = true;
    this.from.statuses.covering = this.to._id;
    this.from.quickAction = "Cover";
    await this.from.save();

    this.to.statuses.is_covered = true;
    this.to.statuses.covered_by = this.from._id;
    await this.to.save();
  }
  async log() {
    const wit = await this.from.wit;
    const msg = `${this.from.name} is covering ${this.to.name} (applying ${wit} wit)`;
    debug(msg);
    return msg;
  }
}

module.exports = Cover;
