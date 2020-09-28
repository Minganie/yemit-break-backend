const csv = require("fast-csv");
const fs = require("fs");
const path = require("path");

require("../startup/db")();

const Armor = require("../models/armor");
const Aptitude = require("../models/aptitude");
const Trait = require("../models/trait");
const Weapon = require("../models/weapon");
/*
fs.createReadStream(path.resolve(__dirname, "armor.csv"))
  .pipe(csv.parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", async (row) => {
    new Armor(row).save();
  })
  .on("end", (rowcount) => console.log(`Parsed ${rowcount} rows for armors`));

fs.createReadStream(path.resolve(__dirname, "aptitude.csv"))
  .pipe(csv.parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", (row) => {
    new Aptitude(row).save();
  })
  .on("end", (rowcount) =>
    console.log(`Parsed ${rowcount} rows for aptitudes`)
  );

fs.createReadStream(path.resolve(__dirname, "trait.csv"))
  .pipe(csv.parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", (row) => {
    new Trait(row).save();
  })
  .on("end", (rowcount) => console.log(`Parsed ${rowcount} rows for traits`));
*/
fs.createReadStream(path.resolve(__dirname, "weapon.csv"))
  .pipe(csv.parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", (row) => {
    new Weapon(row).save();
  })
  .on("end", (rowcount) => console.log(`Parsed ${rowcount} rows for weapons`));
