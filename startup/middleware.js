const debug = require("debug")("ybbe:startup:middleware");
const express = require("express");
const logger = require("morgan");
const SSE = require("express-sse");
const requireHttps = require("../middleware/requireHttps");

module.exports = (app) => {
  if (process.env.NODE_ENV !== "production") {
    debug("In dev, using cors");
    app.use(require("cors")());
  }
  app.use(require("helmet")());
  app.use(require("compression")());
  app.locals.sse = new SSE(["kintoe"]);
  // middleware
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(requireHttps);
  app.use(express.static("public"));
};
