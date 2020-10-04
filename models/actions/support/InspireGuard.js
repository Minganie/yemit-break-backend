const debug = require("debug")("ybbe:inspire-guard");
const YbbeError = require("../../../utils/YbbeError");

class InspireGuard {
  constructor(action) {
    this.from = action.from;
    this.to = action.to;
    this.user = action.user;
  }

  validate() {
    if (!this.from)
      throw new YbbeError("Toon who is guarding must be specified", 400, {
        from: "Toon who is guarding must be specified",
      });
    if (!this.to)
      throw new YbbeError("Toon who is guarded must be specified", 400, {
        to: "Toon who is guarded must be specified",
      });
    if (this.user._id !== this.from.user._id.toString())
      throw new YbbeError("Toon who is guarding must be yours", 400, {
        user: this.user._id,
      });
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
