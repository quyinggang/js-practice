;(function(root) {
  const doc = document;
  const addEventListener = root.addEventListener;
  const removeEventListener = root.removeEventListener;
  const tools = {
    createEle: function(className, tag) {
      tag = tag || 'div';
      const node = doc.createElement(tag);
      node.className = className;
      return node;
    },
    append: function(node, child) {
      if (!node) return;
      child = Array.isArray(child) ? child : (child ? [child] : []);
      child.forEach(item => {
        item && item.nodeType ? node.appendChild(item) : null;
      });
    },
    on: function(target, events) {
      if (!target || !events || !Object.keys(events)) return;
      Object.keys(events).forEach(function(ev) {
        target.addEventListener(ev, function(event) {
          events[ev].call(this, event);
        });
      });
    },
    formatTime: function(time) {
      let formatTime = null,
          secs = 0,
          mins = 0,
          hours = 0,
          displayHours,
          seperator = ':';

      secs = parseInt(time % 60);
      mins = parseInt((time / 60) % 60);
      hours = parseInt(((time / 60) / 60) % 60);
      displayHours = (parseInt(((time / 60) / 60) % 60) > 0) 
      secs = ("0" + secs).slice(-2);
      mins = ("0" + mins).slice(-2);
      return (displayHours ? hours + ':' : '') + mins + seperator + secs;
    }
  };

  /**
   * audio: audio element
   * srcs：歌曲列表
   * controller: 控制区域对象
   * volume: 声音对象
   * isPlaying: 播放状态
   * currentIndex: 当前src源的下标
   * meta: 视频元数据
   */
  const Audio = function() {
    this.audio = null;
    this.srcs = ['./file/unravel.mp3', './file/远走高飞.mp3'];
    this.controller = null;
    this.progress = null;
    this.volume = null;
    this.isPlaying = false;
    this.currentIndex = 0;
    this.meta = {
      currentTime: 0,
      duration: 0
    };
    this.init();
  };

  Audio.prototype = {
    // 构建视图 + 事件绑定
    init: function() {
      this.audio = this.createAudio();
      this.controller = new Controller(this);
      this.progress = new Progress(this);
      this.volume = new Volume(this);
      const container = doc.querySelector('.audio');
      tools.append(container, [
        this.controller.controllerArea,
        this.progress.progressDOM,
        this.volume.volumeArea
      ]);
      this.onEvents();
    },
    createAudio: function() {
      const audio = tools.createEle('audio-player', 'audio');
      audio.src = this.srcs[this.currentIndex];
      audio.preload = 'auto';
      return audio;
    },
    onEvents: function() {
      const that = this;
      const { formatTime } = tools;
      tools.on(this.audio, {
        'loadedmetadata': function() {
          that.meta.duration = this.duration;
          that.progress.changeEndTime(formatTime(this.duration));
        },
        'timeupdate': function() {
          const meta = that.meta;
          meta.currentTime = this.currentTime;
          that.progress.changeCurrentTime(formatTime(this.currentTime));
          const percent = (this.currentTime / meta.duration).toFixed(6) * 100;
          that.progress.setCurrentProgress(percent);
        },
        'ended': function() {
          that.next();
        }
      });
    },
    changeCurrentSrc: function() {
      this.audio.src = this.srcs[this.currentIndex];
      this.audio.load();
    },
    play: function() {
      this.audio.play();
      this.isPlaying = true;
    },
    pause: function() {
      this.audio.pause();
      this.isPlaying = false;
    },
    prev: function() {
      const targetIndex = this.currentIndex - 1;
      this.currentIndex = targetIndex < 0 ? this.srcs.length - 1 : targetIndex;
      this.changeCurrentSrc();
      this.play();
    },
    next: function() {
      const targetIndex = this.currentIndex + 1;
      this.currentIndex = targetIndex > this.srcs.length - 1 ? 0 : targetIndex
      this.changeCurrentSrc();
      this.play();
    },
    setCurrentTime: function(percent) {
      percent = percent || 0
      this.audio.currentTime = this.meta.duration * percent;
    },
    setCurrentVolume: function(volume) {
      this.audio.volume = volume || 0;
    }
  };

  const Controller = function($parent) {
    this.$parent = $parent;
    this.controllerArea = null;
    this.prevIcon = null;
    this.stateIcon = null;
    this.nextIcon = null;
    this.isPlaying = false;
    this.init();
  };

  Controller.prototype = {
    init: function() {
      const { createEle, append } = tools;
      const container = createEle('audio-controller');
      this.prevIcon = createEle('fa fa-step-backward icon__back', 'i');
      this.stateIcon = createEle('fa fa-play icon__state', 'i');
      this.nextIcon = createEle('fa fa-step-forward icon__next', 'i');
      append(container, [this.prevIcon, this.stateIcon, this.nextIcon]);
      this.controllerArea = container;
      this.onEvents();
    },
    changeStateIcon: function() {
      const { isPlaying, stateIcon } = this;
      const currentClass = isPlaying ? 'fa-pause' : 'fa-play';
      const targetClass = !isPlaying ? 'fa-pause' : 'fa-play';
      stateIcon.className = stateIcon.className.replace(currentClass, targetClass);
    },
    changeState: function() {
      this.isPlaying = !this.isPlaying;
    },
    onEvents: function() {
      const that = this;
      const { on } = tools;
      on(this.prevIcon, {
        'click': function() {
          that.$parent.prev();
        }
      });
      on(this.nextIcon, {
        'click': function() {
          that.$parent.next();
        }
      });
      on(this.stateIcon, {
        'click': function() {
          that.changeStateIcon();
          that.changeState();
          that.isPlaying ? that.$parent.play() : that.$parent.pause();
        }
      })
    }
  };

  const Slider = function($parent, isBuffer, currentPosition) {
    this.$parent = $parent;
    this.sliderBox = null;
    this.progressBox = null;
    this.thumbBox = null;
    this.isBuffer = isBuffer || false;
    this.isDragging = false;
    this.startX = 0;
    this.startPosition = currentPosition || 0;
    this.currentPosition = currentPosition || 0;
    this.currentValue = 0;
    this.init();
  };

  Slider.prototype = {
    init: function() {
      const { createEle, append } = tools;
      const sliderBox = createEle('slider');
      const sliderProgress = createEle('slider-progress');
      const runway = createEle('slider-runway');
      append(runway, createEle('thumb'));
      append(sliderBox, [sliderProgress, runway]);
      if (this.isBuffer) {
        append(sliderProgress, createEle('progress-buffer'));
      }
      this.sliderBox = sliderBox;
      this.progressBox = sliderProgress;
      this.thumbBox = runway;
      if (this.currentPosition) {
        this.updateView();
      }
      this.onEvents();
    },
    onEvents: function() {
      const that = this;
      const { thumbBox, sliderBox } = this;
      const { on } = tools;
      on(thumbBox, {
        'mousedown': function(event) {
          event.stopPropagation();
          that.dragStart(event);
          addEventListener('mousemove', function(e) {
            that.dragging(e);
          });
          addEventListener('mouseup', function() {
            that.dragEnd();
          });
        }
      });
      on(sliderBox, {
        'click': function(event) {
          const contentBox = this.getBoundingClientRect();
          const percent = (event.clientX - contentBox.left) / contentBox.width * 100;
          that.currentPosition = Math.max(0, Math.min(percent, 100));
          that.updateView();
          that.changeAudioAbort();
        }
      });
    },
    changeAudioAbort: function() {
      let percent = this.currentPosition * 0.01;
      if (this.isBuffer) {
        this.$parent.changeAudioCurrTime(percent);
      } else {
        const volume = Math.max(0, Math.min(percent.toFixed(1), 1));
        this.$parent.setCurrentVolume(volume);
      }
    },
    updateView: function() {
      const { thumbBox, progressBox } = this;
      const currentPosition = this.currentPosition;
      this.currentValue = Math.floor(currentPosition);
      thumbBox.style.left = currentPosition + '%';
      progressBox.style.width = currentPosition + '%';
    },
    changeCurrentPosition: function(position) {
      if (this.isDragging) return;
      this.currentPosition = position || 0;
      this.updateView();
    },
    setPosition: function(clientX) {
      const { sliderBox, thumbBox } = this;
      const contentWidth = sliderBox.offsetWidth;
      // 计算当前拖动位置与初始拖动位置的距离
      const diff = clientX - this.startX;
      // 计算差距占精度条的百分比
      const percent = (diff / contentWidth).toFixed(6) * 100;
      this.currentPosition = Math.max(0, Math.min(
        this.startPosition + percent, 100));
      this.updateView();
    },
    dragStart: function(event) {
      this.isDragging = true;
      this.startX = event.clientX;
      this.startPosition = this.currentPosition;
    },
    dragging: function(event) {
      if (!this.isDragging) return;
      this.setPosition(event.clientX);
      if (!this.isBuffer) {
        this.changeAudioAbort();
      }
    },
    dragEnd: function() {
      this.changeAudioAbort();
      this.isDragging = false;
      removeEventListener('mousemove', this.dragging);
      removeEventListener('mouseup', this.dragEnd);
    }
  };


  const Progress = function($parent) {
    this.$parent = $parent;
    this.slider = new Slider(this, true);
    this.progressDOM = null;
    this.curTimeDOM = null;
    this.endTimeDOM = null;
    this.currentTime = '00:00';
    this.endTime = '00:00';
    this.init();
  };

  Progress.prototype = {
    init: function() {
      const { createEle, append } = tools;
      const curTimeDOM = createEle('time__current', 'span');
      const endTimeDOM = createEle('time__end', 'span');
      const progress = createEle('audio-progress');
      const sliderContainer = createEle('slider-container');
      append(sliderContainer, this.slider.sliderBox);
      append(progress, [
        curTimeDOM,
        sliderContainer,
        endTimeDOM
      ]);
      this.curTimeDOM = curTimeDOM;
      this.endTimeDOM = endTimeDOM;
      this.setCurrentTimeText();
      this.setEndTimeText();
      this.progressDOM = progress;
    },
    changeCurrentTime: function(currentTime) {
      this.currentTime = currentTime;
      this.setCurrentTimeText();
    },
    changeEndTime: function(endTime) {
      this.endTime = endTime;
      this.setEndTimeText();
    },
    setCurrentTimeText: function() {
      this.curTimeDOM.innerText = this.currentTime;
    },
    setEndTimeText: function() {
      this.endTimeDOM.innerText = this.endTime;
    },
    setCurrentProgress: function(percent) {
      this.slider.changeCurrentPosition(percent);
    },
    changeAudioCurrTime: function(percent) {
      this.$parent.setCurrentTime(percent);
    }
  };

  const Volume = function($parent) {
    this.$parent = $parent;
    this.currentValue = 0.5;
    this.max = 1;
    this.min = 0;
    this.volumeArea = null;
    this.slider = new Slider(this, false, this.currentValue * 100);
    this.init();
  };

  Volume.prototype = {
    init: function() {
      const { createEle, append } = tools;
      const i = createEle('fa fa-volume-up icon__volume', 'i');
      const box = createEle('audio-volume');
      append(box, [i, this.slider.sliderBox]);
      this.volumeArea = box;
    },
    setCurrentVolume: function(volume) {
      this.currentValue = volume;
      this.$parent.setCurrentVolume(volume);
    }
  };

  new Audio();

})(window);