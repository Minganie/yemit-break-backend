const debug = require("debug")("ybbe:cover");
const YbbeError = require("../../../utils/YbbeError");

class Cover {
  constructor(action) {
    this.from = action.from;
    this.to = action.to;
    this.user = action.user;
  }
  validate() {
    if (!this.from)
      throw new YbbeError("Toon who is covering must be specified", 400, {
        from: "Toon who is covering must be specified",
      });
    if (!this.to)
      throw new YbbeError("Toon who is covered must be specified", 400, {
        to: "Toon who is covered must be specified",
      });
    if (this.user._id !== this.from.user._id.toString())
      throw new YbbeError("Toon who is covering must be yours", 400, {
        user: this.user._id,
      });
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
