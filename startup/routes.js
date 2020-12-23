const path = require("path");

const fightsRouter = require("../routes/fights/fights");
const toonsRouter = require("../routes/toons");
const usersRouter = require("../routes/users");
const armorsRouter = require("../routes/armors");
const traitsRouter = require("../routes/traits");
const weaponsRouter = require("../routes/weapons");

module.exports = (app) => {
  app.use("/api/fights", fightsRouter);
  app.use("/api/toons", toonsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/armors", armorsRouter);
  app.use("/api/traits", traitsRouter);
  app.use("/api/weapons", weaponsRouter);

  app.use("/api/events", app.locals.sse.init);

  app.use("*", (req, res) => {
    res.sendFile("index.html", { root: path.join(__dirname, "../public/") });
  });
};
