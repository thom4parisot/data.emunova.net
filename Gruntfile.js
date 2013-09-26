"use strict";

module.exports = function(grunt){
  grunt.initConfig({
    migrate: {
      options: {
        db: {
          host: "localhost",
          user: "root",
          database: "novanet"
        }
      },
      reviews: {
        query: require("./src/migrator/reviews").query,
        dest: "games/",
        builder: require("./src/migrator/reviews").builder
      },
      ratings: {
        query: require("./src/migrator/ratings").query,
        dest: "games/",
        builder: require("./src/migrator/ratings").builder
      }
    }
  });

  grunt.loadTasks("src/grunt");

  grunt.registerTask("default", []);
};