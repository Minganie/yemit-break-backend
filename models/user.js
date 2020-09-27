const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const _ = require("lodash");

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  permissions: {
    type: [String],
    enum: ["Player", "DM"],
    default: ["Player"],
    required: true,
  },
});
schema.methods.getJwt = function () {
  const jwtConfig = config.get("jwtConfig");
  return jwt.sign(
    _.pick(this, ["_id", "email", "permissions"]),
    jwtConfig.secret
  );
};

const User = mongoose.model("User", schema);

module.exports = User;
