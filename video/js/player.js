/**
 * player.js 自定义视频控制条
 */

!(function(root, undefined) {
	let doc = document,
		config = {
			el: 'body',
			src: '',
			poster: './poster.jpg'
		},
		tools = {},
		classes = {
			video: 'player-video',
			wrapper: 'player-video-wrapper',
			videoBox: 'video-box',
			controller: 'player-controller',
			progress: 'player-progress',
			controllerLeft: 'player-controller-left',
			play: 'fa fa-play',
			pause: 'fa fa-pause',
			currentTime: 'current-time',
			duration: 'duration',
			controllerRight: 'player-controller-right',
			volume: 'volume',
			expand: 'fa fa-expand',
			volumeUp: 'fa fa-volume-up',
			volumeOff: 'fa fa-volume-off',
			icon: 'icon',
			buffer: 'progress-buffer',
			fullScreen: 'full-screen',
			fadeInUp: 'fadeInUp',
			fadeOutDown: 'fadeOutDown',
			end: 'end',
			stalled: 'stalled',
			loading: 'loading',
			compress: 'fa fa-compress',
			error: 'fa fa-ban',
			spinner: 'fa fa-spinner',
			rotateLeft: 'fa fa-rotate-left'
		},
		videoNodes = {},
		theVideo = null,
		isCanPlay = false,
		isFullScreen = false,
		media = {
			currentTime: 0,
			duration: 0,
			volume: 0
		},
		max = 100;

	// 设置时间点
	tools.setTime = function(elem, time) {
		if (!elem || !elem.nodeName) {
			return;
		}
		elem.innerText = time;
	};

	// 是否存在指定的class
	tools.isExist = function(elem, className) {
		if (!elem || !elem.nodeName) {
			return;
		}
		let result = false;
		if (className) {
			result = String(elem.className).indexOf(className) >= 0 ? true : false;
		}
		return result;
	};
	// 添加class
	tools.addClass = function(elem, className) {
		if (!elem || !elem.nodeName) {
			return;
		}
		if (!tools.isExist(elem, className)) {
			let targetClass = elem.className;
			elem.className = String(`${targetClass} ${className}`).trim();
		}
	};

	// 移除class
	tools.removeClass = function(elem, className) {
		if (!elem || !elem.nodeName) {
			return;
		}

		if (tools.isExist(elem, className)) {
			elem.className = elem.className.replace(className, '').trim();
		}
	};

	// 判断是否是可播放的类型
	tools.canPlayType = function(src) {
		if (!src) {
			return;
		}
		let type = String(src).split('.').pop();
		return theAudio.canPlayType('video/' + type);
	};

	// 设置当前时间
	tools.setCurrentTime = function(time) {
		let {currentTime} = videoNodes;
		currentTime.innerText = tools.formatTime(time);
	};

	// 改变结束以及视频照片中断的图标显示、
	// tool.changeVideoStateIncon = function(state) {
	// 	let {playerVideo, msg, reload} = videoNodes;
	// };

	// 播放
	tools.play = function() {
		if (isCanPlay) {
			theVideo.play();
		}
	};

	// 暂停
	tools.pause = function() {
		theVideo.pause();
	};

	// 改变图标
	tools.changeIcon = function(node, className) {
		if (!node.nodeName) {
			return;
		}
		node.className = className;
	};

	// 创建节点, 支持批量
	tools.create = function(nodeNames) {
		if (!nodeNames) {
			return;
		}
		let nodes = [],
			isArray = Array.isArray(nodeNames);

		if (isArray) {
			nodeNames.forEach((name) => {
				let temp = [],
					params = String(name).split('*');
				
				for (let index = parseInt(params[1]); index--;) {
					temp.push(doc.createElement(params[0]))
				}
				nodes.push(temp);
			})
		} else {
			nodes = doc.createElement(nodeNames);
		}
		return nodes;
	};

	// 构建结构并添加class
	tools.appendAndAndClass = function(arr, parentNode) {
		if (!Array.isArray(arr) || !parentNode || !parentNode.nodeName) {
			return;
		}
		for (let index = 0; index < arr.length; index++) {
			let item = arr[index],
				node = item.node,
				className = item.class,
				children = item.children;

			if (children && children.length > 0) {
				tools.appendAndAndClass(children, node);
			}
			if (node && className) {
				node.className = className;
			}
			parentNode.appendChild(node);
		}
	};

	// 构建vedio节点
	tools.createVideo = function(options) {
		let data = options['el'];
		theVideo = doc.createElement('video');
		theVideo.setAttribute('preload', 'auto');
		sourceNode = doc.createElement('source');
		sourceNode.setAttribute('src', options['src']);
		sourceNode.setAttribute('type', 'video/' + String(options['src']).split('.').pop())
		let el = data === 'body' ? doc.body : doc.getElementById(data);
		theVideo.appendChild(sourceNode);
		return el;
	};

	// 批量设置属性
	tools.setAttrs = function(attrs) {
		if (typeof attrs !== 'object') {
			return;
		}
		let node = null;
		if (Array.isArray(attrs)) {
			attrs.forEach((item) => {
				let children = item.attrs;
				node = item.node;
				children.forEach((attr) => {
					node.setAttribute(attr.name, attr.value);
				})
			});
		} else {
			let children = attrs.attrs;
			node = attrs.node;
			children.forEach((attr) => {
				node.setAttribute(attr.name, attr.value);
			});
		}
	};

	// 设置当前进度
	tools.setProgress = function(elem, value) {
		if (!elem || !elem.nodeName) {
			return;
		}

		if (value >= 0 && value <= max) {
			elem.value = Number(value);
		}
	};

	// 设置当前时间点
	tools.setCurrentProgress = function(progressBar, progressFG) {
		let percent = tools.getPercent(media.currentTime, media.duration),
			value = parseInt(percent * max);

		tools.setProgress(progressBar, value);
		tools.setProgress(progressFG, value);
	};

	// 将秒的时间格式化输出
	tools.formatTime = function(time) {
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
	};

	// 获取进度百分比
	tools.getPercent = function(numer, den) {
		if (den <= 0) {
			return;
		}
		return numer / den;
	};

	// 获取缓冲对应的progress的进度值
	tools.getBuffered = function() {
		let buffered = theVideo.buffered;
		if (buffered.length) {
			let end = buffered.end(0),
				precent = 0;

			percent = tools.getPercent(end, media.duration);
			return parseInt(percent * max);
		}
	};
	
	// 设置音量
	tools.setVolume = function(value, flag) {
		let volume = Number(tools.getPercent(value, max)).toFixed(1),
			{volumeFG, volumeBar} = videoNodes;

		tools.setProgress(volumeFG, value);
		tools.setProgress(volumeBar, value);
		theVideo.volume = volume;
		if (!flag) {
			media.volume = volume;
		}
	};
	
	// 设置缓冲进度
	tools.setBufferProgress = function(progressBuffer) {
		let bufferValue = tools.getBuffered();
		tools.setProgress(progressBuffer, bufferValue);
	};

	// 拖动进度显示问题处理
	tools.drag = function(bar, progress) {
		if (!bar || !bar.nodeName || !progress || !progress.nodeName) {
			return;
		}
		let isDrag = false;
		bar.addEventListener('mousedown', function(e) {
			e.stopPropagation();
			isDrag = true;
		});
		bar.addEventListener('mousemove', function(e) {
			e.stopPropagation();
			if (isDrag) {
				tools.setProgress(progress, this.value);
			}
		});
		bar.addEventListener('mouseup', function(e) {
			e.stopPropagation();
			isDrag = false;
		});
	};

	// 合并参数
	tools.extend = function(options) {
		if (Object.prototype.toString.call(options) !== '[object Object]') {
			return;
		}

		let keys = Object.keys(config),
			clone = {};
		for (let key of keys) {
			clone[key] = key in options ? options[key] : config[key];
		}
		return clone;
	};

	// 处理视频进度改变图标的修改
	tools.changeState = function(isStop) {
		let {currentTime, state, progressBar, progressFG} = videoNodes,
			play = classes.play,
			pause = classes.pause;

		tools.setCurrentTime(media.currentTime);
		if (isStop) {
			if (tools.isExist(state, play)) {
				tools.changeIcon(state, pause);
				tools.play();
				tools.setCurrentProgress(progressBar, progressFG);
			} else if (tools.isExist(state, pause)) {
				tools.changeIcon(state, play);
				tools.pause();
			}
		} else {
			tools.changeIcon(state, pause);
			tools.play();
		}
	};

	// 处理音量进度改变图标的修改
	tools.changeVolumeState = function() {
		let {volumeIcon} = videoNodes;
		let targetClass = '',
			volumeUp = classes.volumeUp,
			volumeOff = classes.volumeOff,
			currentClass = volumeIcon.className;

		targetClass = currentClass.indexOf(volumeUp) >= 0 ? volumeOff: volumeUp;
		tools.removeClass(volumeIcon, currentClass);
		tools.addClass(volumeIcon, targetClass);
		if (targetClass.indexOf(volumeUp) >= 0) {
			this.setVolume(media.volume * max);
		} else {
			this.setVolume(0, true);
		}
	}

	// 视频进度相关
	tools.progressEvents = function() {
		let {progressBar, progressFG, progressBuffer} = videoNodes;

		tools.drag(progressBar, progressFG);

		progressBar.addEventListener('change', function(e) {
			e.stopPropagation();
			let currentTime = (this.value / max) * media.duration;
			media.currentTime = currentTime;
			theVideo.currentTime = currentTime;
			tools.changeState(false);
		});
	};

	tools.volumeEvents = function() {
		let {volumeBar, volumeFG, volumeIcon} = videoNodes;
		// 拖动进度显示处理
		tools.drag(volumeBar, volumeFG);

		// 音量进度处理
		volumeBar.addEventListener('change', function(e) {
			e.stopPropagation();
			tools.setVolume(this.value);
		});

		// 音量图标点击
		volumeIcon.addEventListener('click', function(e) {
			e.stopPropagation();
			tools.changeVolumeState();
		});
	};

	// 全屏图标改变
	tools.changefullScreenIcon = function() {
		let {expand} = videoNodes,
			currentClass = expand.className,
			targetClass = '';

		targetClass = isFullScreen ? classes.compress : classes.expand;
		tools.removeClass(expand, currentClass);
		tools.addClass(expand, targetClass);
	};

	tools.playAboutEvents = function(el) {
		let {playerVideo, state, wrapper, progressBar, progressFG, 
			controller, expand, reload} = videoNodes,
			callbacks = [];

		// 控制条显示与隐藏
		playerVideo.addEventListener('mousemove', function(e) {
			e.stopPropagation();
			let fadeInUp = classes.fadeInUp,
				fadeOutDown = classes.fadeOutDown;

			if (isFullScreen) {
				if (tools.isExist(controller, fadeOutDown)) {
					tools.removeClass(controller, fadeOutDown);
					tools.addClass(controller, fadeInUp);
				} else if (tools.isExist(controller, fadeInUp)) {
					let lastTimer = callbacks.pop(),
						currentTimer = null;

					clearTimeout(lastTimer);
					currentTimer = setTimeout(() => {
						if (isFullScreen) {
							tools.removeClass(controller, fadeInUp);
							tools.addClass(controller, fadeOutDown);
						}
					}, 2000);
					callbacks.push(currentTimer);
				} else {
					currentTimer = setTimeout(() => {
						if (isFullScreen) {
							tools.removeClass(controller, fadeInUp);
							tools.addClass(controller, fadeOutDown);
						}
					}, 2000);
					callbacks.push(currentTimer);
				}
			}
		});

		// 播放暂停处理
		state.addEventListener('click', function(e) {
			e.stopPropagation();
			tools.changeState(true);
		});

		// 点击视频内容区域处理
		wrapper.addEventListener('click', function(e) {
			e.stopPropagation();
			tools.removeClass(playerVideo, classes.end);
			reload.className = '';
			tools.changeState(true);
		});

		// 全屏处理
		expand.addEventListener('click', function(e) {
			e.stopPropagation();
			let fullScreen = classes.fullScreen;

			if (tools.isExist(playerVideo, fullScreen)) {
				isFullScreen = false;
				tools.removeClass(playerVideo, fullScreen);
				if (callbacks.length > 0) {
					clearTimeout(callbacks.pop());
					tools.removeClass(controller, classes.fadeInUp);
					tools.removeClass(controller, classes.fadeOutDown);
				}
			} else {
				isFullScreen = true;
				tools.addClass(playerVideo, classes.fullScreen);
				if (String(el.nodeName).toLowerCase() !== 'body') {
					el.style.cssText = 'width: 100%;height: 100%';
				}
			}
			tools.changefullScreenIcon();
		});
	};

	tools.fullScreenEvents = function() {
		let {playerVideo, controller} = videoNodes;
		// 支持esc
		document.addEventListener('keydown', function(e) {
			e.stopPropagation();
			if (e.keyCode === 27) {
				isFullScreen = false;
				tools.removeClass(controller, classes.fadeOutDown);
				tools.removeClass(playerVideo, classes.fullScreen);
			}
		});
	};

	// 视频相关
	tools.videoEvents = function() {
		let {progressBar, progressFG, progressBuffer, reload, 
			state, msg, playerVideo, duration, currentTime} = videoNodes,
			timer = null;

		// 时长和分辨率等加载后触发
		theVideo.addEventListener('loadedmetadata', function(e) {
			e.stopPropagation();
			media.currentTime = 0;
			media.duration = this.duration;
			duration.innerText = tools.formatTime(this.duration);
			isCanPlay = true;
			theVideo.setAttribute('poster', config.poster);
		});
		// progress事件, 处理缓冲
		theVideo.addEventListener('progress', function(e) {
			e.stopPropagation();
			tools.setBufferProgress(progressBuffer);
		});

		// 缓冲数据处理
		theVideo.addEventListener('loadstart', function(e) {
			e.stopPropagation();
			timer = setInterval(() => {
				console.log(progressBuffer.value);
				tools.setBufferProgress(progressBuffer);
				if (progressBuffer.value >= max) {
					clearInterval(timer);
				}
			}, 400);	
		});

		theVideo.addEventListener('emptied', function(e) {
		});

		theVideo.addEventListener('error', function(e) {
		});

		theVideo.addEventListener('stalled', function(e) {
			e.stopPropagation();
			if (isCanPlay) {
				tools.addClass(playerVideo, classes.stalled);
				tools.addClass(loading, classes.loading);
			} else {
				tools.addClass(playerVideo, classes.stalled);
				tools.addClass(loading, classes.loading);
			}
		});

		// 视频结束
		theVideo.addEventListener('ended', function(e) {
			e.stopPropagation();
			tools.addClass(playerVideo, classes.end);
			tools.addClass(reload, classes.rotateLeft);
			tools.removeClass(state, classes.pause);
			tools.addClass(state, classes.play);
		});

		// playing事件处理，处理缓冲
		theVideo.addEventListener('playing', function(e) {
			e.stopPropagation();
			tools.setBufferProgress(progressBuffer);
		});

		// 视频播放时间点改变，改变进度
		theVideo.addEventListener('timeupdate', function(e) {
			e.stopPropagation();
			if (isCanPlay) {
				media.currentTime = this.currentTime;
				tools.setCurrentTime(this.currentTime);
				tools.setCurrentProgress(progressBar, progressFG);
				tools.setBufferProgress(progressBuffer);
			} else {
			}
		});
	};

	tools.views = function(el) {
		let [[playerVideo, wrapper, controller, left, right, progress, volumeContainer, videoBox], 
			[state, expand, volumeIcon, reload], [stateContainer, expandContainer, volumeIconCon, 
			currentTime, duration, seperator, msg],
			[progressBar, volumeBar], [progressFG, volumeFG, progressBuffer]] = tools.create(['div*8', 'i*4', 'span*7', 'input*2', 'progress*3']),
			rangeAttr = [
				{name: 'type', value: 'range'},
				{name: 'min', value: 0},
				{name: 'max', value: max},
				{name: 'value', value: 0}
			],
			progressAttr = [
				{name: 'value', value: 0},
				{name: 'max', value: max}
			],
			initVolume = 30;

		media.volume = Number(initVolume / max).toFixed(1);
		tools.setAttrs([
			{node: progressBar, attrs: rangeAttr},
			{
				node: volumeBar, 
				attrs: [
					rangeAttr[0],
					rangeAttr[1],
					rangeAttr[2],
					{name: 'value', value: initVolume}
				]
			},
			{node: progressFG, attrs: progressAttr},
			{node: progressBuffer, attrs: progressAttr},
			{
				node: volumeFG,
				attrs: [
					{name: 'value', value: initVolume},
					progressAttr[1]
				]
			}
		]);
		tools.setTime(currentTime, '00:00');
		seperator.innerText = '/';
		tools.appendAndAndClass([
			{
				node: playerVideo,
				class: `${classes.video}`,
				children: [
					{
						node: wrapper,
						class: `${classes.wrapper}`,
						children: [
							{
								node: videoBox,
								class: `${classes.videoBox}`,
								children: [
									{
										node: msg,
										class: `${classes.icon}`,
										children: [
											{
												node: reload,
												class: ''
											}
										]
									}
								]
							},
							{
								node: theVideo,
								class: ''
							}
						]
					},
					{
						node: controller,
						class: `${classes.controller}`,
						children: [
							{
								node: progress,
								class: `${classes.progress}`,
								children: [
									{
										node: progressBar,
										class: ''
									},
									{
										node: progressFG,
										class: ''
									},
									{
										node: progressBuffer,
										class: `${classes.buffer}`
									}
								]
							},
							{
								node: left,
								class: `${classes.controllerLeft}`,
								children: [
									{
										node: stateContainer,
										class: `${classes.icon}`,
										children: [
											{
												node: state,
												class: `${classes.play}`
											}
										]
									},
									{
										node: currentTime,
										class: `${classes.currentTime}`
									},
									{
										node: seperator,
										class: ''
									},
									{
										node: duration,
										class: `${classes.duration}`
									}
								]
							},
							{
								node: right,
								class: `${classes.controllerRight}`,
								children: [
									{
										node: volumeIconCon,
										class: `${classes.icon}`,
										children: [
											{
												node: volumeIcon,
												class: `${classes.volumeUp}`
											}
										]
									},
									{
										node: volumeContainer,
										class: `${classes.volume}`,
										children: [
											{
												node: volumeBar,
												class: ''
											},
											{
												node: volumeFG,
												class: ''
											}
										]
									},
									{
										node: expandContainer,
										class: `${classes.icon}`,
										children: [
											{
												node: expand,
												class: `${classes.expand}`
											}
										]
									}
								]
							}
						]
					}
				]
			}
		], el);

		videoNodes = {
			playerVideo: playerVideo,
			controller: controller,
			wrapper: wrapper,
			progressBar: progressBar,
			progressFG: progressFG,
			progressBuffer: progressBuffer,
			volumeBar: volumeBar,
			volumeFG: volumeFG,
			volumeIcon: volumeIcon,
			expand: expand,
			state: state,
			currentTime: currentTime,
			duration: duration,
			msg: msg,
			videoBox: videoBox,
			reload: reload
		};
	};

	tools.events = function(el) {
		tools.fullScreenEvents();
		tools.videoEvents();
		tools.playAboutEvents(el);
		tools.volumeEvents();
		tools.progressEvents();
	};
	let Player = function() {
		this.settings = null;
	};

	// 初始化
	Player.prototype.init = function(config) {
		this.settings = tools.extend(config);
		let el = tools.createVideo(this.settings);
		tools.views(el);
		tools.events(el);
	};

	window.player = new Player();

})(window);