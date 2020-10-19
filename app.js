const debug = require("debug")("ybbe:app");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const SSE = require("express-sse");

const clientErrors = require("./middleware/clientErrors");
const fourohfour = require("./middleware/fourohfour");
const jsonErrors = require("./middleware/jsonErrors");
const requireHttps = require("./middleware/requireHttps");

const fightsRouter = require("./routes/fights/fights");
const toonsRouter = require("./routes/toons");
const usersRouter = require("./routes/users");
const armorsRouter = require("./routes/armors");
const traitsRouter = require("./routes/traits");
const weaponsRouter = require("./routes/weapons");

const app = express();
// dispatch the unhandled promises to winston...
process.on("unhandledRejection", (e) => {
  throw e;
});

if (process.env.NODE_ENV !== "production") {
  debug("In dev, using cors");
  app.use(require("cors")());
}
require("./startup/db")();
app.locals.sse = new SSE(["kintoe"]);
// middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requireHttps);
app.use(express.static("public"));

// routes
app.use("/api/fights", fightsRouter);
app.use("/api/toons", toonsRouter);
app.use("/api/users", usersRouter);
app.use("/api/armors", armorsRouter);
app.use("/api/traits", traitsRouter);
app.use("/api/weapons", weaponsRouter);

app.use("/api/events/", app.locals.sse.init);

app.use("*", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "./public/") });
});

// errors
app.use(fourohfour);
app.use(clientErrors);
app.use(jsonErrors);

module.exports = app;
