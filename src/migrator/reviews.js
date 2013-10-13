"use strict";

var md = require("html-md");
var grunt = require("grunt");
var async = grunt.util.async;
var _ = grunt.util._;
var systems = require("../systems.js");
var sanitize = require('validator').sanitize;
;
var clean = _.compose(_.str.slugify, function(d){ return sanitize(d).entityDecode(); });
var clean_system = _.compose(systems.map, clean);

module.exports = {
  query: function(db){
    return db("en_veda_tests as tests")
      //.debug()
      .join("en_veda_styles as styles", "styles.C_STYLE", "=", "tests.C_STYLE")
      .join("en_veda_notes as ratings", "ratings.C_TEST", "=", "tests.C_TEST")
      .join("en_editeurs as editeurs", "editeurs.C_EDITEUR", "=", "tests.C_EDITEUR", "left")
      .join("ibf_members as users", "users.member_id", "=", "tests.C_USER")
      .join("en_supports as systems", "systems.C_SUPPORT", "=", "tests.C_SUPPORT")
      .select("tests.*", "styles.style", "editeurs.nom AS editor", "users.name AS member_name", "systems.nom AS system_name", "ratings.note AS rating")
      .where("ratings.is_master", "=", 1)
      .orderBy("C_TEST", "ASC");
  },
  builder: function(game, next){
    var system_slug = clean_system(game.system_name);
    var game_slug = clean(game.titre);
    var basepath = _.template("games/<%= system %>/<%= game %>", {system: system_slug, game: game_slug});

   if (grunt.file.exists(basepath + "/index.json")){
     grunt.log.ok("Test #"+ game.C_TEST +" skipped: "+ game.titre);
     return next();
   }

    async.parallel([
      //saving json file
      function(done){
        var data = {
          title: sanitize(game.titre).entityDecode(),
          released: game.annee,
          editor: game.editor ? sanitize(game.editor).entityDecode() : "N/C",
          players: parseInt(game.maxplayer, 10),
          genres: [sanitize(game.style).entityDecode()]
        };

        grunt.file.write(basepath + "/index.json", JSON.stringify(data, null, 2));
        done();
      },
      //saving review
      function(done){
        var data = [
          "---",
          "user: " + sanitize(game.member_name || "anonyme").entityDecode(),
          "rating: "  + (game.rating / 2),
          "published: " + new Date(game.date_publication * 1000).toISOString(),
          "legacy_url: http://www.emunova.net/veda/test/"+ game.C_TEST +".htm",
          "---",
          md(game.test_texte || grunt.file.read("tmp/tests/"+ game.C_TEST +".htm", { encoding: "iso-8859-1" }))
        ];

        grunt.file.write(basepath + "/reviews/"+ clean(game.member_name || "anonyme") +".md", data.join("\n"));
        done();
      }
    ], function(){
      grunt.log.ok("Test #"+ game.C_TEST +" saved: " + game.titre);
    });

    next();
  }
};
