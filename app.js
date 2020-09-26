const debug = require("debug")("ybbe:app");
const express = require("express");
const path = require("path");
const logger = require("morgan");

const clientErrors = require("./middleware/clientErrors");
const fourohfour = require("./middleware/fourohfour");
const jsonErrors = require("./middleware/jsonErrors");
const requireHttps = require("./middleware/requireHttps");

const usersRouter = require("./routes/users");

const app = express();
// dispatch the unhandled promises to winston...
process.on("unhandledRejection", (e) => {
  throw e;
});

// middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requireHttps);

// routes
app.use("/api/users", usersRouter);

// errors
app.use(fourohfour);
app.use(clientErrors);
app.use(jsonErrors);

module.exports = app;
