"use strict";

var path = require("path");
var db = require("../database");
var systems = require("../systems.js");
var fs = require("fs");
var when = require("when");
var sanitize = require('validator').sanitize;

module.exports = function(grunt){
  var sprintf = grunt.util._.str.sprintf;
  var slugify = grunt.util._.str.slugify;
  var async = grunt.util.async;

  var clean = grunt.util._.compose(slugify, function(d){ return sanitize(d).entityDecode(); });
  var clean_system = grunt.util._.compose(systems.map, clean);

  grunt.registerTask("htaccess", function(){
    var task = grunt.task.current;
    var options = task.options({});
    var stream = fs.createWriteStream("tmp/.htaccess");
    var taskDone = this.async();

    stream.write("RewriteEngine On\n");

    var pReviews = when.promise(function(resolve, reject, notify){
      db("en_veda_tests AS t")
        .select("C_TEST", "titre", "s.nom AS system_name")
        .join("en_supports AS s", "s.C_SUPPORT", "=", "t.C_SUPPORT")
        .orderBy("C_TEST")
        .then(function(results){
          stream.write("\n");
          stream.write("#Reviews\n");

          async.forEach(results, function(row, done){
            var output = sprintf("RewriteRule ^veda/test/%s.htm http://wip.emunova.net/%s/games/%s/ [R=301,L]\n",
              row.C_TEST,
              clean_system(row.system_name),
              clean(row.titre)
            );

            process.stdout.write(output);
            stream.write(output, 'utf-8', done);
          }, resolve);
        });
    });

    var pSystems = when.promise(function(resolve, reject, notify){
      db("en_supports AS s")
        .select("s.C_SUPPORT", "s.nom AS system_name")
        .orderBy("C_SUPPORT")
        .then(function(results){
          stream.write("\n");
          stream.write("#Systems\n");

          async.forEach(results, function(row, done){
            var output = sprintf(
              [
                "RewriteRule ^emulation/%1$s.htm http://wip.emunova.net/%2$s/ [R=301,L]",
                "RewriteRule ^emulation/fiche/%1$s.htm http://wip.emunova.net/%2$s/history.html [R=301,L]",
                "RewriteRule ^veda/support/%1$s.htm http://wip.emunova.net/%2$s/games/ [R=301,L]",
                "RewriteRule ^galeries/%1$s.htm http://wip.emunova.net/%2$s/images/ [R=301,L]"
              ].join("\n") + "\n",
              row.C_SUPPORT,
              clean_system(row.system_name)
            );

            process.stdout.write(output);
            stream.write(output, 'utf-8', done);
          }, resolve);
        });
    });

    var pVarious = when.promise(function(resolve, reject, notify){
      stream.write("\n");
      stream.write("#Various\n");

      var output = [
        "RewriteRule ^infos/$ http://wip.emunova.net/about/ [R=301,L]",
        "RewriteRule ^infos/contact/ http://wip.emunova.net/infos/team.html [R=301,L]",
        "RewriteRule ^veda/ http://wip.emunova.net/about/migration.html [R=410,L]",
        "RewriteRule ^veda2/ http://wip.emunova.net/about/migration.html [R=410,L]",
        "RewriteRule ^galeries/ http://wip.emunova.net/about/migration.html [R=410,L]",
        "RewriteRule ^liens/ http://wip.emunova.net/about/migration.html [R=410,L]",
        "RewriteRule ^infos/ http://wip.emunova.net/about/migration.html [R=410,L]"
      ].join("\n") + "\n";

      process.stdout.write(output);
      stream.write(output, 'utf-8', resolve);
    });

    when.all([pReviews, pSystems, pVarious]).then(function(){
      stream.write("\n\nRewriteRule ^.*$ http://wip.emunova.net/404.html [R=404,L]", function(){
        stream.end();
        taskDone();
      });
    });
  });
};