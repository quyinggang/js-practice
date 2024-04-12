/**
 * player.js 自定义视频控制条
 */

;(function(root, undefined) {
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
	
	const Player = function() {
		this.settings = {
			poster: './poster.jpg',
			el: '#player',
			src: './video/movie.mp4'
		};
		this.player = null;
		this.video = null;
		this.progress = null;
		this.volume = null;
		this.controller = null;
		this.contentArea = null;
		this.init();
	};

	Player.prototype = {
		init: function() {
			this.player = doc.querySelector(this.settings.el);
			this.video = new Video(this);
			this.progress = new Progress(this);
			this.controller = new Controller(this);
			this.volume = new Volume(this);
			this.createView();
			this.onEvents();
		},
		createView: function() {
			const { video, progress, controller, volume } = this;
			const { createEle, append } = tools;
			const contentArea = createEle('player-wrapper');
			contentArea.appendChild(video.video);
			const control = createEle('control');
			const controlStrip = createEle('player-controller');
			append(control, [controller.controllerArea, volume.volumeArea]);
			append(controlStrip, [progress.progressDOM, control]);
			append(this.player, [contentArea, controlStrip]);
			this.contentArea = contentArea;
		},
		onEvents: function() {
		}
	};

	const Video = function($parent) {
		this.$parent = $parent;
		this.src = null;
		this.video = null;
		this.isPlaying = false;
		this.meta = {
			currentTime: 0,
			duration: 0,
			volume: 0.5
		};
		this.init();
	};

	Video.prototype = {
		init: function() {
			this.src = this.$parent.src;
			this.video = this.createVideo();
			this.video.poster = this.$parent.settings.poster;
			this.onEvents();
		},
		createVideo: function() {
			const options = this.$parent.settings;
			const theVideo = tools.createEle('video', 'video');
			theVideo.setAttribute('preload', 'auto');
			const sourceNode = doc.createElement('source');
			sourceNode.setAttribute('src', options['src']);
			sourceNode.setAttribute('type', 'video/' + String(options['src']).split('.').pop())
			theVideo.appendChild(sourceNode);
			return theVideo;
		},
		setCurrentVolume: function(volume) {
			this.video.volume = volume;
		},
		changeVideoPlayProgress: function(percent) {
			const { duration } = this.meta;
			const currentTime = duration * percent;
			this.video.currentTime = currentTime;
		},
		setCurrentProgress: function() {
			const progress = this.$parent.progress;
			const { currentTime, duration } = this.meta;
			let percent = currentTime / duration;
			percent = percent ? percent.toFixed(6) : 0;
			progress.setCurrentProgress(percent);
		},
		setCurrentTime: function(currentTime) {
			const timeArea = this.$parent.controller.timeArea;
			const formatCurrentTime = tools.formatTime(currentTime);
			timeArea.setCurrentTime(formatCurrentTime);
			timeArea.setCurrentTimeText();
			this.setCurrentProgress();
		},
		setDuration: function() {
			const timeArea = this.$parent.controller.timeArea;
			const formatDuration = tools.formatTime(this.meta.duration);
			timeArea.setEndTime(formatDuration);
			timeArea.setEndTimeText();
		},
		onEvents: function() {
			const that = this;
			tools.on(this.video, {
				'click': function() {
					that.isPlaying ? that.pause() : that.play();
					that.changeStateIcon();
				},
				'loadedmetadata': function() {
					const meta = that.meta;
					meta.duration = this.duration;
					that.setDuration();
				},
				'timeupdate': function() {
					that.meta.currentTime = this.currentTime;
					that.setCurrentTime(this.currentTime);
				},
				'ended': function() {
					that.isPlaying = false;
					that.changeStateIcon();
					that.meta.currentTime = 0;
					that.setCurrentProgress();
				}
			})
		},
		changeStateIcon: function() {
			const playArea = this.$parent.controller.playArea;
			playArea.changeIcon();
			playArea.changePlayState();
		},
		play: function() {
			this.video.play();
			this.isPlaying = true;
		},
		pause: function() {
			this.video.pause();
			this.isPlaying = false;
		},
		volume: function(volume) {
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
					that.isBuffer ? that.setVideoCurrentTime() : that.setCurrentVolume();
				}
			})
		},
		getVideo: function() {
			return this.$parent.$parent.video;
		},
		setVideoCurrentTime: function() {
			const { currentPosition ,isBuffer } = this;
			const percent = isBuffer && currentPosition >= 97 ? 1 : currentPosition * 0.01;
			this.getVideo().changeVideoPlayProgress(percent);
		},
		setCurrentVolume: function() {
			let volume = this.currentPosition * 0.01;
			volume = Math.max(0, Math.min(volume.toFixed(1), 1));
			this.$parent.setCurrentVolume(volume);
		},
		setCurrentPosition: function(percent) {
			percent = this.isBuffer && percent >= 0.97 ? 0.97 : percent;
			this.currentPosition = percent * 100;
			this.updateView();
		},
		updateView: function() {
			const { thumbBox, progressBox } = this;
			const currentPosition = this.currentPosition;
			this.currentValue = Math.floor(currentPosition);
			thumbBox.style.left = currentPosition + '%';
			progressBox.style.width = currentPosition + '%';
		},
		setPosition: function(clientX) {
			const { sliderBox, thumbBox } = this;
			const contentWidth = sliderBox.offsetWidth;
			// 计算当前拖动位置与初始拖动位置的距离
			const diff = clientX - this.startX;
			// 计算差距占精度条的百分比
			const percent = (diff / contentWidth).toFixed(6) * 100;
			let currentPosition = Math.max(0, Math.min(
				this.startPosition + percent, 100));
			// 处理播放精度条滑块超出问题
			if (this.isBuffer) {
				currentPosition = currentPosition >= 97 ? 97 : currentPosition;
			}
			this.currentPosition = currentPosition;
			this.updateView();
		},
		dragStart: function(event) {
			this.isDragging = true;
			this.startX = event.clientX;
			this.startPosition = this.currentPosition;
			if (!this.isBuffer) return;
			this.getVideo().pause();
			if (this.$parent.getPlayArea().isPlaying) {
				this.$parent.changeVideoStateIcon();
			}
		},
		dragging: function(event) {
			if (!this.isDragging) return;
			this.setPosition(event.clientX);
			if (!this.isBuffer) {
				this.setCurrentVolume();
			}
		},
		dragEnd: function() {
			if (this.isBuffer) {
				this.getVideo().play();
				this.setVideoCurrentTime();
				if (!this.$parent.getPlayArea().isPlaying) {
					this.$parent.changeVideoStateIcon();
				}
			}
			this.isDragging = false;
			removeEventListener('mousemove', this.dragging);
			removeEventListener('mouseup', this.dragEnd);
		}
	};

	const Progress = function($parent) {
		this.$parent = $parent;
		this.slider = new Slider(this, true);
		const progress = tools.createEle('progress');
		tools.append(progress, this.slider.sliderBox);
		this.progressDOM = progress;
	};

	Progress.prototype = {
		getPlayArea: function() {
			return this.$parent.controller.playArea;
		},
		setCurrentProgress: function(percent) {
			this.slider.setCurrentPosition(percent);
		},
		changeVideoStateIcon: function() {
			const playArea = this.$parent.controller.playArea;
			playArea.changeIcon();
			playArea.changePlayState();
		}
	};

	const PlayArea = function($parent) {
		this.$parent = $parent;
		this.stateIcon = null;
		this.area = null;
		this.isPlaying = false;
		this.init();
	};

	PlayArea.prototype = {
		init: function() {
			const { createEle, append } = tools;
			const stateIcon = createEle('fa fa-play icon__state', 'i');
			const area = createEle('controller__state-left');
			append(area, stateIcon);
			this.area = area;
			this.stateIcon = stateIcon;
			this.onEvents();
		},
		getVideo: function() {
			return this.$parent.$parent.video;
		},
		changePlayState: function() {
			this.isPlaying = !this.isPlaying;
		},
		changeIcon: function() {
			const currentClass = this.isPlaying ? 'fa-pause' : 'fa-play';
			const targetClass = this.isPlaying ? 'fa-play' : 'fa-pause';
			const stateIcon = this.stateIcon;
			stateIcon.className = stateIcon.className.replace(currentClass, targetClass);
		},
		onEvents: function() {
			const that = this;
			const video = this.getVideo();
			tools.on(this.stateIcon, {
				'click': function(event) {
					event.stopPropagation();
					that.changeIcon();
					that.changePlayState();
					that.isPlaying ? video.play() : video.pause();
				}
			});
		}
	};

	const TimeArea = function($parent) {
		this.$parent = $parent;
		this.curTimeDOM = null;
		this.endTimeDOM = null;
		this.area = null;
		this.currentTime = '00:00';
		this.endTime = '00:00';
		this.init();
	};

	TimeArea.prototype = {
		init: function() {
			const { createEle , append } = tools;
			const area = createEle('controller__state-right');
			const curTimeDOM = createEle('current', 'span');
			const endTimeDOM = createEle('end', 'span');
			const sp = createEle('sepertor', 'span');
			sp.innerText = '/';
			append(area, [curTimeDOM, sp, endTimeDOM]);
			this.curTimeDOM = curTimeDOM;
			this.endTimeDOM = endTimeDOM;
			this.area = area;
			this.setCurrentTimeText();
			this.setEndTimeText();
		},
		setCurrentTime: function(currentTime) {
			this.currentTime = currentTime;
		},
		setEndTime: function(endTime) {
			this.endTime = endTime;
		},
		setCurrentTimeText: function() {
			this.curTimeDOM.innerText = this.currentTime;
		},
		setEndTimeText: function() {
			this.endTimeDOM.innerText = this.endTime;
		}
	}

	const Controller = function($parent) {
		this.$parent = $parent;
		this.controllerArea = null;
		this.playArea = new PlayArea(this);
		this.timeArea = new TimeArea(this);
		this.init();
	};

	Controller.prototype = {
		init: function() {
			const area = tools.createEle('controller');
			tools.append(area, [this.playArea.area, this.timeArea.area]);
			this.controllerArea = area;
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
			const i = createEle('fa fa-volume-down volume-icon', 'i');
			const box = createEle('volume');
			append(box, [i, this.slider.sliderBox]);
			this.volumeArea = box;
		},
		setCurrentVolume: function(volume) {
			this.currentValue = volume;
			this.$parent.video.setCurrentVolume(volume);
		}
	};

	new Player();

})(window);