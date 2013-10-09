"use strict";

var path = require("path");
var md = require("html-md");
var db = require("../database");
var systems = require("../systems.js");

module.exports = function(grunt){
  var async = grunt.util.async;
  var sprintf = grunt.util._.str.sprintf;

  var clean = grunt.util._.compose(grunt.util._.str.slugify, md);
  var clean_system = grunt.util._.compose(systems.map, clean);

  grunt.registerTask("htaccess", function(){
    var task = grunt.task.current;
    var options = task.options({});

    async.parallel([
      //reviews
      function (done){
        db("en_veda_tests AS t")
          .select("C_TEST", "titre", "s.nom AS system_name")
          .join("en_supports AS s", "s.C_SUPPORT", "=", "t.C_SUPPORT")
          .orderBy("C_TEST")
          .then(function(results){
            async.forEach(results, function(row, done){
              var output = sprintf('RewriteRule ^veda/test/%s.htm http://wip.emunova.net/%s/games/%s/ [R=301,L]',
                row.C_TEST,
                clean_system(row.system_name),
                clean(row.titre)
              );

              console.log(output);
              done();
            }, done);
          });
      }
    ], this.async());
  });
};