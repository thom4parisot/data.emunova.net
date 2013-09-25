"use strict";

var map = {
  "cd-i": "cdi",
  "commodore-64": "c64",
  "super-nintendo": "super-nes",
  "videopac": "odyssey-2",
  "game-amp-watch": "game-and-watch"
};

module.exports = {
  map: function(id){
    return id in map ? map[id] : id;
  }
};