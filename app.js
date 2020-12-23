const debug = require("debug")("ybbe:app");
const express = require("express");

const app = express();
// dispatch the unhandled promises to winston...
process.on("unhandledRejection", (e) => {
  throw e;
});

require("./startup/db")();
require("./startup/middleware")(app);
require("./startup/routes")(app);
require("./startup/errors")(app);

module.exports = app;
