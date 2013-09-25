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
      }
    },

    rename: {
      games: {
        files: {
          "games/cdi": "games/cd-i",
          "games/c64": "games/commodore-64",
          "games/super-nes": "games/super-nintendo",
          "games/odyssey-2": "games/videopac",
          "games/game-and-watch": "games/game-amp-watch"
        }
      }
    }
  });

  grunt.loadTasks("src/grunt");
  grunt.loadNpmTasks('grunt-rename');

  grunt.registerTask("default", []);
};