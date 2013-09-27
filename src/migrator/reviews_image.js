"use strict";

var md = require("html-md");
var grunt = require("grunt");
var _ = require("grunt").util._;
var path = require("path");
var systems = require("../systems.js");

module.exports = {
  query: function(db){
    return db("en_veda_tests as tests")
      //.debug()
      .join("en_supports as systems", "systems.C_SUPPORT", "=", "tests.C_SUPPORT")
      .select("C_TEST", "titre", "systems.nom AS system_name")
      .orderBy("C_TEST", "ASC");
  },
  builder: function(game, next){
    // fixing PHP htmlentities
    game.titre = md(game.titre);
    game.system_name = md(game.system_name);

    var system_slug = systems.map(_.str.slugify(game.system_name));
    var game_slug = _.str.slugify(game.titre);
    var basepath = _.template("games/<%= system %>/<%= game %>", {
      system: system_slug,
      game: game_slug
    });

    var images = grunt.file.expand("tmp/tests-images/"+game.C_TEST+".*");

    if (!images.length){
      grunt.log.ok("Image #"+ game.C_TEST +" skipped: "+ game.titre);
      return next();
    }

    var extname = path.extname(images[0]);
    var filename = basepath + "/images/main" + extname;

    if (extname === "."){
      throw new Error("Extensionless image for "+ images[0]);
    }

    grunt.file.copy(images[0], filename);
    grunt.log.ok("Image #"+ game.C_TEST +" saved: " + game.titre);

    next();
  }
};
