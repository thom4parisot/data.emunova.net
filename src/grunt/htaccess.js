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

    when.all([pReviews]).then(function(){
      stream.end();
      taskDone();
    });
  });
};