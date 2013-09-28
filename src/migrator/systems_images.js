"use strict";

var md = require("html-md");
var grunt = require("grunt");
var async = require("grunt").util.async;
var path = require("path");
var _ = require("grunt").util._;
var systems = require("../systems.js");

module.exports = {
  query: function(db){
    return db("en_galeries as img")
      //.debug()
      .join("en_supports as systems", "systems.C_SUPPORT", "=", "img.C_SUPPORT")
      .select("img.*", "systems.nom AS system_name")
      .orderBy("C_PHOTO", "ASC");
  },
  builder: function(photo, next){
    // fixing PHP htmlentities
    photo.titre = md(photo.titre);
    photo.system_name = md(photo.system_name);

    var system_slug = systems.map(_.str.slugify(photo.system_name));
    var slug = _.str.slugify(photo.titre);
    var basepath = _.template("systems/<%= system %>/images/<%= slug %>", {system: system_slug, slug: slug});

    async.parallel([
      //saving image
      function(done){
        var candidates = grunt.file.expand("tmp/galeries/"+photo.C_PHOTO+".*");

        grunt.file.copy(candidates[0], basepath + path.extname(candidates[0]));
        done();
      },
      //saving metadata
      function(done){
        var data = [
          "---",
          'title: ' + (~photo.titre.indexOf(':') ? '"'+photo.titre+'"' : photo.titre),
          "published: " + new Date(photo.date_ajout * 1000).toISOString(),
          (photo.source_copyright ? [
            "copyright:",
            "  owner: " + photo.source_copyright,
            "  url: " + (photo.source_www || "")
          ].join("\n") : ""),
          "legacy_url: http://www.emunova.net/galeries/"+ photo.C_SUPPORT +".htm#media-"+ photo.C_PHOTO,
          "---",
          md(photo.commentaire)
        ].filter(function(line){ return line.length ? line : null; });

        grunt.file.write(basepath + ".md", data.join("\n"));
        done();
      }
    ], function(){
      grunt.log.ok("Photo #"+ photo.C_PHOTO +" saved: " + basepath + slug);
    });

    next();
  }
};
