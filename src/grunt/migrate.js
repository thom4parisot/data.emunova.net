"use strict";

var path = require("path");
var db = require("../database");

module.exports = function(grunt){
  var async = grunt.util.async;

  grunt.registerMultiTask("migrate", function(){
    var task = grunt.task.current;
    var options = task.options({});
    var done = this.async();

    task.data.query(db).then(function(results){
      async.forEach(results, task.data.builder, done);
    }, function(err){
      console.log("An error happened" + err);
      done();
    });

  });
};