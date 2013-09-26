"use strict";

var map = {
  "cd-i": "cdi",
  "commodore-64": "c64",
  "super-nintendo": "super-nes",
  "videopac": "odyssey-2",
  "mame": "arcade",
  "mega-drive": "megadrive",
  "game-watch": "game-and-watch",
  "windows-phone-7": "windows-phone",
  "nintendo-ds": "ds"
};

module.exports = {
  map: function(id){
    return id in map ? map[id] : id;
  }
};