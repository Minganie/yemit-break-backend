const config = require("config");
const debug = require("debug")("ybbe:db");
const mongoose = require("mongoose");

const dbConfig = config.get("dbConfig");
const connString = `mongodb+srv://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/${dbConfig.name}?ssl=true`;

module.exports = () => {
  mongoose
    .connect(connString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      debug("Successfully connected to Mongo");
    })
    .catch((e) => {
      debug("Failed to connect to Mongo");
      throw e;
    });
};
