const debug = require("debug")("ybbe:app");
const express = require("express");
const path = require("path");
const logger = require("morgan");

const clientErrors = require("./middleware/clientErrors");
const fourohfour = require("./middleware/fourohfour");
const jsonErrors = require("./middleware/jsonErrors");
const requireHttps = require("./middleware/requireHttps");

const Dispatcher = require("./utils/dispatcher");
const fightsRouter = require("./routes/fights/fights");
const toonsRouter = require("./routes/toons");
const usersRouter = require("./routes/users");

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
app.locals.clients = [];
app.locals.dispatcher = new Dispatcher(app.locals.clients);

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

app.use("/api/events/", (req, res) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);

  // After client opens connection send all nests as string
  // const data = {data: `${JSON.stringify(nests)}\n\n`};
  // res.write(data);

  // Generate an id based on timestamp and save res
  // object of client connection on clients list
  // Later we'll iterate it and send updates to each client
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };
  req.app.locals.clients.push(newClient);
  // When client closes connection we update the clients list
  // avoiding the disconnected one
  req.on("close", () => {
    debug(`${clientId} Connection closed`);
    req.app.locals.clients = req.app.locals.clients.filter(
      (c) => c.id !== clientId
    );
  });
});

app.use("*", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "./public/") });
});

// errors
app.use(fourohfour);
app.use(clientErrors);
app.use(jsonErrors);

module.exports = app;
