const debug = require("debug")("ybbe:harry");
const YbbeError = require("../../../utils/YbbeError");

class Harry {
  constructor(action) {
    this.from = action.from;
    this.with = action.with;
    this.user = action.user;
  }

  validate() {
    if (!this.from)
      throw new YbbeError("Toon who is harrying must be specified", 400, {
        from: "Toon who is harrying must be specified",
      });
    if (this.user._id !== this.from.user._id.toString())
      throw new YbbeError("Toon who is harrying must be yours", 400, {
        user: this.user._id,
      });
    const stats = ["Smashing", "Entropy"];
    if (!stats.includes(this.with))
      throw new YbbeError(
        "Stat you are harrying with must be in: " + stats.toString(),
        400,
        { with: "Stat you are harrying with must be in: " + stats.toString() }
      );
    return true;
  }
  async apply() {
    this.from.statuses.is_harrying = true;
    this.from.statuses.harrying_with = this.with;
    this.from.quickAction = "Harry";
    await this.from.save();
  }
  async log() {
    let stat = 0;
    if (this.with === "Smashing") stat = await this.from.smashing;
    else stat = await this.from.entropy;
    const msg = `${this.from.name} is harrying (applying ${stat} ${this.with})`;
    debug(msg);
    return msg;
  }
}
module.exports = Harry;
