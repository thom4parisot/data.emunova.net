"use strict";

var Knex = require("knex");

module.exports = Knex.knex = Knex.initialize({
  client: "mysql",
  connection: {
    host: "localhost",
    user: "root",
    database: "c2novanet"
  }
});

