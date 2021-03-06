const bcrypt = require("bcrypt");
const debug = require("debug")("ybbe:users router");
const express = require("express");
const router = express.Router();
const _ = require("lodash");

const Toon = require("../models/toon");
const User = require("../models/user");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const YbbeError = require("../utils/YbbeError");

router.post("/", validate.registration, async (req, res, next) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(req.body.password, salt);
    let user = new User({
      email: req.body.email,
      password: hashed,
    });
    user = await user.save();
    const payload = _.pick(user, ["email", "permissions"]);
    payload.jwt = user.getJwt();
    res.status(201).send(payload);
  } catch (ex) {
    if (ex.code && ex.code === 11000) {
      debug("duplicate user");
      next(
        new YbbeError(
          "A user with the given email is already registered.",
          400,
          {
            email: "A user with the given email is already registered.",
          }
        )
      );
    } else {
      debug(ex);
      next(
        new YbbeError(
          "Internal Server Error",
          500,
          "Failure in user registration"
        )
      );
    }
  }
});

router.post("/login", validate.login, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      throw new YbbeError("No user is registered with this email", 404, {
        email: "No user is registered with this email",
      });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      throw new YbbeError("Invalid username and password combination", 400, {
        email: "Invalid username and password combination",
      });

    const payload = _.pick(user, ["email", "permissions"]);
    payload.jwt = user.getJwt();

    res.status(200).send(payload);
  } catch (ex) {
    if (ex instanceof YbbeError) next(ex);
    else next(new YbbeError("Failure in user login", 500, ex));
  }
});

router.post("/logout", validate.logout, (req, res, next) => {
  res.status(200).send({});
});

router.get("/me/toons", auth.isPlayer, async (req, res) => {
  try {
    const userId = req.user._id;
    const toons = await Toon.find({ user: userId });
    res.send(toons);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
