"use strict";

module.exports = function(grunt){
  grunt.template.addDelimiters('migrate', '{%', '%}');

  grunt.initConfig({
    migrate: {
      options: {
        db: {
          host: "localhost",
          user: "root",
          database: "novanet"
        }
      },
      systems_images: {
        query: require("./src/migrator/systems_images").query,
        dest: "systems/{% system.id %}/images/",
        builder: require("./src/migrator/systems_images").builder
      },
      reviews: {
        query: require("./src/migrator/reviews").query,
        dest: "games/{% system.id %}/{% game.id %}/",
        builder: require("./src/migrator/reviews").builder
      },
      reviews_image: {
        query: require("./src/migrator/reviews_image").query,
        dest: "games/{% system.id %}/{% game.id %}/images/main.{% ext %}",
        builder: require("./src/migrator/reviews_image").builder
      },
      ratings: {
        query: require("./src/migrator/ratings").query,
        dest: "games/{% system.id %}/{% game.id %}/ratings/",
        builder: require("./src/migrator/ratings").builder
      }
    }
  });

  grunt.loadTasks("src/grunt");

  grunt.registerTask("default", []);
};