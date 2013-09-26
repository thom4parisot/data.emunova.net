"use strict";

var md = require("html-md");
var grunt = require("grunt");
var async = require("grunt").util.async;
var _ = require("grunt").util._;
var systems = require("../../systems.js");

module.exports = {
  query: function(db){
    return db("en_veda_tests as tests")
      //.debug()
      .join("en_veda_styles as styles", "styles.C_STYLE", "=", "tests.C_STYLE")
      .join("en_veda_notes as ratings", "ratings.C_TEST", "=", "tests.C_TEST")
      .join("en_editeurs as editeurs", "editeurs.C_EDITEUR", "=", "tests.C_EDITEUR")
      .join("ibf_members as users", "users.member_id", "=", "tests.C_USER")
      .join("en_supports as systems", "systems.C_SUPPORT", "=", "tests.C_SUPPORT")
      .select("tests.*", "styles.style", "editeurs.nom AS editor", "users.name AS member_name", "systems.nom AS system_name", "ratings.note AS rating")
      .where("ratings.is_master", "=", 1)
      .orderBy("C_TEST", "ASC");
  },
  builder: function(game, next){
    // fixing PHP htmlentities
    game.titre = md(game.titre);
    game.system_name = md(game.system_name);
    game.member_name = md(game.member_name);

    var system_slug = systems.map(_.str.slugify(game.system_name));
    var game_slug = _.str.slugify(game.titre);
    var basepath = _.template("games/<%= system %>/<%= game %>", {system: system_slug, game: game_slug});

    async.parallel([
      //saving json file
      function(done){
        var data = {
          title: game.titre,
          released: game.annee,
          editor: md(game.editor),
          players: parseInt(game.maxplayer, 10),
          genres: [md(game.style)]
        };

        grunt.file.write(basepath + "/index.json", JSON.stringify(data, null, 2));
        done();
      },
      //saving review
      function(done){
        var data = [
          "---",
          "user: " + game.member_name,
          "rating: "  + (game.rating / 2),
          "published: " + new Date(game.date_publication * 1000).toISOString(),
          "legacy_url: http://www.emunova.net/veda/test/"+ game.C_TEST +".htm",
          "---",
          md(game.test_texte || grunt.file.read("tmp/tests/"+ game.C_TEST +".htm", { encoding: "iso-8859-1" }))
        ];

        grunt.file.write(basepath + "/reviews/"+ _.slugify(game.member_name) +".md", data.join("\n"));
        done();
      }
    ], function(){
      grunt.log.ok("Test saved: " + game.titre);
    });

    next();
  }
};