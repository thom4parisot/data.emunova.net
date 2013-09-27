"use strict";

var md = require("html-md");
var grunt = require("grunt");
var async = require("grunt").util.async;
var _ = require("grunt").util._;
var systems = require("../systems.js");

module.exports = {
  query: function(db){
    return db("en_veda_notes as ratings")
      //.debug()
      .join("en_veda_tests as games", "games.C_TEST", "=", "ratings.C_TEST")
      .join("ibf_members as users", "users.member_id", "=", "ratings.C_USER", "left")
      .join("en_supports as systems", "systems.C_SUPPORT", "=", "games.C_SUPPORT")
      .select("ratings.*", "games.C_SUPPORT", "games.date_publication", "games.titre", "users.name AS member_name", "systems.nom AS system_name")
      .where("ratings.is_master", "IS", null)
      .orderBy("C_NOTE", "ASC");
  },
  builder: function(rating, next){
    // fixing PHP htmlentities
    rating.titre = md(rating.titre);
    rating.system_name = md(rating.system_name);
    rating.member_name = md(rating.member_name || "Anonyme "+rating.C_NOTE);

    var system_slug = systems.map(_.str.slugify(rating.system_name));
    var game_slug = _.str.slugify(rating.titre);
    var basepath = _.template("games/<%= system %>/<%= game %>", {system: system_slug, game: game_slug});
    var filename = basepath + "/ratings/"+ _.slugify(rating.member_name) +".md";

    if (grunt.file.exists(filename)){
      grunt.log.ok("Note #"+ rating.C_NOTE +" skipped: "+ rating.titre);
      return next();
    }

    var data = [
      "---",
      "user: " + rating.member_name,
      "rating: "  + (rating.note / 2),
      "published: " + new Date((rating.date_ajout || rating.date_publication+rating.C_NOTE) * 1000).toISOString(),
      "legacy_url: http://www.emunova.net/veda/test/"+ rating.C_TEST +".htm#comment-"+rating.C_NOTE,
      "---",
      md(rating.commentaire)
    ];

    grunt.file.write(filename, data.join("\n"));
    grunt.log.ok("Note #"+ rating.C_NOTE +" saved: " + rating.titre);

    next();
  }
};
