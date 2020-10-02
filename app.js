const debug = require("debug")("ybbe:app");
const express = require("express");
const path = require("path");
const logger = require("morgan");

const clientErrors = require("./middleware/clientErrors");
const fourohfour = require("./middleware/fourohfour");
const jsonErrors = require("./middleware/jsonErrors");
const requireHttps = require("./middleware/requireHttps");

const fightsRouter = require("./routes/fights/fights");
const toonsRouter = require("./routes/toons");
const usersRouter = require("./routes/users");

const app = express();
// dispatch the unhandled promises to winston...
process.on("unhandledRejection", (e) => {
  throw e;
});
require("./startup/db")();

// middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requireHttps);

// routes
app.use("/api/fights", fightsRouter);
app.use("/api/toons", toonsRouter);
app.use("/api/users", usersRouter);

// errors
app.use(fourohfour);
app.use(clientErrors);
app.use(jsonErrors);

module.exports = app;
