// 重构Audio
;(function(root) {

  const Audio = function() {
    this.audio = null;
    this.currentSrc = null;
    this.srcs = [];
    this.controller = null;
    this.slider = null;
    this.volume = null;
  };

  Audio.prototype = {
    init: function() {
    },
    on: function() {
    },
    play: function() {
    },
    stop: function() {
    },
    prev: function() {
    },
    next: function() {
    },
    volume: function() {
    }
  };

  const Slider = function() {
  };

})(window);