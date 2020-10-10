const debug = require("debug")("ybbe:events");

class Dispatcher {
  constructor(clients) {
    this.clients = clients;
  }
  send(name, event) {
    debug("Sending", name, "event:", event);
    this.clients.forEach((c) => {
      c.res.write(`event: ${name}\n`);
      c.res.write(`data: ${JSON.stringify(event)}\n\n`);
    });
  }
}

module.exports = Dispatcher;
