const clientErrors = require("../middleware/clientErrors");
const fourohfour = require("../middleware/fourohfour");
const jsonErrors = require("../middleware/jsonErrors");

module.exports = (app) => {
  app.use(fourohfour);
  app.use(clientErrors);
  app.use(jsonErrors);
};
