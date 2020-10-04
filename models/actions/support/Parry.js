const debug = require("debug")("ybbe:parry");
const YbbeError = require("../../../utils/YbbeError");

class Parry {
  constructor(action) {
    this.from = action.from;
    this.user = action.user;
  }

  validate() {
    if (!this.from)
      throw new YbbeError("Toon who is parrying must be specified", 400, {
        from: "Toon who is parrying must be specified",
      });
    if (this.user._id !== this.from.user._id.toString())
      throw new YbbeError("Toon who is parrying must be yours", 400, {
        user: this.user._id,
      });
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
