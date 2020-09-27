const bcrypt = require("bcrypt");
const debug = require("debug")("ybbe:users router");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const validate = require("../middleware/validate");
const YbbeError = require("../utils/YbbeError");
const _ = require("lodash");

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
      next(
        new YbbeError(
          "A user with the given email is already registered.",
          400,
          {
            email: ["A user with the given email is already registered."],
          }
        )
      );
    } else {
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
      throw new YbbeError("Not Found", 404, {
        email: ["No user is registered with this email"],
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

module.exports = router;
