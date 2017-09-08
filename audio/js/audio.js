/**
 * 音乐播放
 * created by quyinggang 2017/09/05
 */
!(function(window, document, undefiend) {
	let doc = document,
		theAudio = null,
		cssPrefix = 'audio',
		tools = {},
		cssClasses = {},
		classes = {
			volume: 'volume',
			volumeIcon: 'volume-icon',
			volumeAdjust: 'volume-adjust',
			bar: 'bar',
			progress: 'progress',
			currentTime: 'time-current',
			duration: 'time-duration',
			controller: 'controller',
			prev: 'prev',
			next: 'next',
			state: 'state'
		}, 
		PREV = 'fa fa-step-backward', 
		NEXT = 'fa fa-step-forward',
		PLAY = 'fa fa-pause',
		PAUSE = 'fa fa-play',
		VOLUMEUP = 'fa fa-volume-up',
		NOVOLUME = 'fa fa-volume-off',
		timer = null,
		settings = null,
		audioNodes = null,
		audioData = {
			currentTime: 0,
			timeSeconds: 0,
			currentVolume: 0,
			duration: 0,
			durSeconds: 0,
			currentSongIndex: 0,
			isLoaded: false
		};

	// 判断是否是可播放的类型
	tools.canPlayType = function(src) {
		if (!src) {
			return;
		}
		let type = String(src).split('.').pop()
		type === 'mp3' ? 'mpeg' : type;
		return theAudio.canPlayType('audio/' + type);
	};

	tools.isEffectedSource = function() {
		return audioData.isLoaded;
	};

	// 位数转换
	tools.pad = function(value) {
		return String(value).length === 1 && parseInt(value) >= 0 ? '0' + value : value;
	};

	// 将秒转换为分秒的格式
	tools.formatSeconds = function(secs) {
		let minutes = Math.floor( secs / 60 ), 
			seconds = Math.floor( secs % 60);

		return tools.pad(minutes) + ':' + tools.pad(seconds);
	};

	// 播放
	tools.play = function() {
		theAudio.play();
	};

	// 暂停
	tools.pause = function() {
		theAudio.pause();
	};

	// 计算当前音频文件相关数据
	tools.computeCurSrcData = function(options) {
		let timeCurrent = audioNodes.timeCurrent,
			timeDuration = audioNodes.timeDuration,
			duration = theAudio.duration,
			currentTime = theAudio.currentTime,
			formatCurrentTime = tools.formatSeconds(currentTime),
			formatDuration = tools.formatSeconds(duration);

		timeDuration.innerText = formatDuration;
		timeCurrent.innerText = formatCurrentTime;
		audioData.currentTime = formatCurrentTime;
		audioData.duration = formatDuration;
		audioData.timeSeconds = currentTime;
		audioData.durSeconds = duration;
	};

	// 设置当前时间以及进度条滚动
	tools.run = function(currentTime, duration) {
		let progressBar = audioNodes.progressBar,
			progressBg = audioNodes.progressBg,
			barWidth = progressBar.offsetWidth,
			bgWidth = progressBg.offsetWidth,
			percent = bgWidth / duration,
			step = Math.floor(percent * currentTime),
			left = progressBar.offsetLeft,
			initLeft = Math.abs(left);

		// 是否播放完毕
		if(!theAudio.ended) {
			audioData.currentTime = tools.formatSeconds(currentTime);
			audioNodes.timeCurrent.innerText = audioData.currentTime;
			step = step >= bgWidth ? bgWidth : step;
			if (timer) {
				left = left < 0 ? left + 2 : step - barWidth / 2;
			} else {
				left = step - barWidth / 2;
			}
			tools.setPosition([
				{node: progressBar, cssText: `left: ${left}px;`},
				{node: audioNodes.progressFg, cssText: `width: ${step}px;`}
			]);
		}
	};

	// 设置滑块与进度
	tools.setPosition = function(items) {
		if (Array.isArray(items)) {
			items.forEach((item) => {
				item.node.style.cssText = item.cssText;
			});
		} else if (typeof items === 'object') {
			items.node.style.cssText = items.cssText;
		}
	};

	// 设置音量
	tools.setVolume = function(volume) {
		theAudio.volume = volume;
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
		if (!Array.isArray(arr) || !parentNode.nodeName) {
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
			if (className) {
				node.className = className;
			}
			parentNode.appendChild(node);
		}
	};

	// 滑动效果
	tools.drag = function(bar, bgNode, fgNode, type) {
		if (!bar.nodeName || !bgNode.nodeName || !fgNode) {
			return;
		}

		let options = {
			clientX: 0,
			left: 0,
			max: 0,
			isDrag: false,
			offsetX: 0
		};
		// 滑动效果
		bar.addEventListener('mousedown', function(e) {
			e.stopPropagation();
			options.clientX = e.clientX;
			options.left = this.offsetLeft;
			options.max = bgNode.offsetWidth - this.offsetWidth / 2;
			options.isDrag = true;
		});

		document.addEventListener('mousemove', function(e) {
			e.stopPropagation();
			if (options.isDrag) {
				let currentClientX = e.clientX,
					left = options.left,
					max = options.max,
					initClientX = options.clientX,
					barHalfWidth = bar.offsetWidth / 2,
					fgWidth = 0,
					to = Math.max(0, Math.min(max, left + (currentClientX - initClientX)));

				bar.style.left = to + 'px';
				if (to > barHalfWidth) {
					fgWidth = to + barHalfWidth;
				}
				fgNode.style.width = Math.max(0, fgWidth) + 'px';
				options.offsetX = Math.max(0, fgWidth);
			}
		});

		bgNode.parentNode.addEventListener('mouseup', function(e) {
			e.stopPropagation();
			if (options.isDrag) {
				tools.timeUpdateOrVolumeUpdate(options.offsetX, type);
				options.isDrag = false;
			}
		});
	};

	// 进度条以及音量调节
	tools.timeUpdateOrVolumeUpdate = function(offsetX, type) {
		let volumeAdjustBg = audioNodes.volumeAdjustBg,
			volumeAdjustFg = audioNodes.volumeAdjustFg,
			volumeAdjustBar = audioNodes.volumeAdjustBar,
			durSeconds = audioData.durSeconds,
			progressBg = audioNodes.progressBg;

		if (type === 'progress') {
			let timeSeconds = (offsetX / progressBg.offsetWidth) * durSeconds;
			theAudio.currentTime = timeSeconds;
			tools.run(timeSeconds, durSeconds);
		} else if (type === 'volume') {
			let width = volumeAdjustBg.offsetWidth,
				currentVolume = Math.max(0, offsetX / width),
				barHalfWidth = volumeAdjustBar.offsetWidth / 2,
				currentWidth = Math.min(width, offsetX),
				currentLeft = Math.max(0, currentWidth - barHalfWidth);

			tools.setVolume(currentVolume);
			tools.setPosition( [
				{node: volumeAdjustFg, cssText: `width: ${currentWidth}px;`}, 
				{node: volumeAdjustBar,	cssText: `left: ${currentLeft}px;`}
			]);
		}
	};

	// 改变图标
	tools.changeIcon = function(node, className) {
		if (!node.nodeName) {
			return;
		}
		node.className = className;
	};
	// 构建需要的结构
	/*
	* <div class="audio">
	* 	<audio></audio>
	* 	<div class="audio-controller">
	* 		<span class="audio-prev"></span>
	* 		<span class="audio-state"></span>
	* 		<span class="audio-next"></span>
	* 	</div>
	* 	<div class="audio-bar">
	* 		<span class="audio-time-current"></span>
	* 		<div class="audio-progress">
	* 			<div>
	* 				<div></div>
	* 				<div></div>
	* 			</div>
	* 		</div>
	* 		<span class="audio-time-duration"></span>
	* 	</div>
	* 	<div class="audio-volume">
	* 		<span class="audio-volume-icon"></span>
	* 		<div class="audio-volume-adjust">
	* 			<div>
	* 				<div></div>
	* 				<div></div>
	* 			</div>
	* 		</div>
	* 	</div>
	* </div>
	*/
	tools.view = function(el) {
		let [[audio, controller, bar, progress, progressBg, progressFg, progressBar, volume, volumeAdjust,
			  volumeAdjustBg, volumeAdjustFg, volumeAdjustBar],
			[prev, state, next, timeCurrent, timeDuration, volumeIcon], [prevINode, stateINode, 
			nextINode, volumeINode]] = tools.create(['div*12', 'span*6', 'i*4']),
			mainClass = 'audio',
			legalRegex = /^[a-zA-Z]+[^\u4e00-\u9fa5]+/g;

		if (settings.hasOwnProperty('custom') && settings.custom && legalRegex.test(settings.custom)) {
			mainClass += ' ' + settings.custom;
		}
		tools.appendAndAndClass([
			{
				node: audio,
				class: `${mainClass}`,
				children: [
					{
						node: theAudio,
						class: 'none'
					},
					{
						node: controller,
						class: cssClasses['controller'],
						children: [
							{
								node: prev,
								class: cssClasses['prev'],
								children: [
									{
										node: prevINode,
										class: PREV
									}
								]
							},
							{
								node: state,
								class: cssClasses['state'],
								children: [
									{
										node: stateINode,
										class: PAUSE
									}
								]
							},
							{
								node: next,
								class: cssClasses['next'],
								children: [
									{
										node: nextINode,
										class: NEXT
									}
								]
							}
						]
					},
					{
						node: bar,
						class: cssClasses['bar'],
						children: [
							{
								node: timeCurrent,
								class: cssClasses['currentTime']
							},
							{
								node: progress,
								class: cssClasses['progress'],
								children: [
									{
										node: progressBg,
										class: '',
										children: [
											{
												node: progressFg,
												class: ''
											},
											{
												node: progressBar,
												class: ''
											}
										]
									}
								]
							},
							{
								node: timeDuration,
								class: cssClasses['duration']
							}
						]
					},
					{
						node: volume,
						class: cssClasses['volume'],
						children: [
							{
								node: volumeIcon,
								class: cssClasses['volumeIcon'],
								children: [
									{
										node: volumeINode,
										class: VOLUMEUP
									}
								]
							},
							{
								node: volumeAdjust,
								class: cssClasses['volumeAdjust'],
								children: [
									{
										node: volumeAdjustBg,
										class: '',
										children: [
											{
												node: volumeAdjustFg,
												class: ''
											},
											{
												node: volumeAdjustBar,
												class: ''
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

		audioNodes = {
			controller: controller,
			stateINode: stateINode,
			progressBg: progressBg,
			progressFg: progressFg,
			progressBar: progressBar,
			timeCurrent: timeCurrent,
			timeDuration: timeDuration,
			volumeINode: volumeINode,
			volumeAdjustFg: volumeAdjustFg,
			volumeAdjustBar: volumeAdjustBar,
			volumeAdjustBg: volumeAdjustBg
		};
	};

	// 事件处理
	tools.events = function(nodes) {
		let {controller, progressBar, progressBg, progressFg,
			stateINode, timeCurrent, timeDuration, volumeINode, volumeAdjustBar, 
			volumeAdjustBg, volumeAdjustFg} = audioNodes,
			cachevolumeInfo = {
				left: 0,
				width: 0
			};

		// 设置默认音量
		// 音频文件加载完成时触发
		theAudio.addEventListener('loadedmetadata', function() {
			if (tools.canPlayType(this.src) === '-') {
				alert('当前文件格式不支持');
				return;
			}
			let width = volumeAdjustBg.offsetWidth,
				barHalfWidth = volumeAdjustBar.offsetWidth / 2;

			audioData.isLoaded = true;
			tools.computeCurSrcData();
			audioData.currentVolume = theAudio.volume;
			tools.setPosition([
				{node: volumeAdjustFg, cssText: `width: ${width}px;`}, 
				{node: volumeAdjustBar,	cssText: `left: ${width - barHalfWidth}px;`}
			]);
			if (settings.hasOwnProperty('autoplay') && settings.autoplay) {
				tools.changeIcon(audioNodes.stateINode, PLAY);
				timer = setInterval(() => {
					audioData.timeSeconds = theAudio.currentTime;
					tools.run(audioData.timeSeconds, audioData.durSeconds);
				}, 900);
			}
		});

		// 当当前音频文件播放结束
		theAudio.addEventListener('ended', function(e) {
			e.stopPropagation();
			clearInterval(timer);
			theAudio.currentTime = audioData.durSeconds;
			audioNodes.timeCurrent.innerText = audioData.duration;
			if (!settings.hasOwnProperty('loop') || !settings.loop) {
				tools.changeIcon(audioNodes.stateINode, PAUSE);
			}
			if (Array.isArray(settings.src)) {
				let currentSrc = '',
					src = settings.src,
					length = src.length,
					currentIndex = audioData.currentSongIndex;

				if (currentIndex < length - 1) {
					currentSrc = src[currentIndex + 1];
					audioData.currentSongIndex = currentIndex + 1;
				} else {
					currentSrc = src[0];
					audioData.currentSongIndex = 0;
				}
				theAudio.src = currentSrc;
				tools.play();
			}
		});

		// 进度条相关处理
		// 进度条click事件
		progressBg.addEventListener('click', function(e) {
			if (tools.isEffectedSource()) {
				tools.timeUpdateOrVolumeUpdate(e.offsetX, 'progress');
			}
		});

		// 滑动
		tools.drag(progressBar, progressBg, progressFg, 'progress');

		// 音频相关事件处理
		// 音量调节的click事件
		volumeAdjustBg.addEventListener('click', function(e) {
			if (tools.isEffectedSource()) {
				tools.timeUpdateOrVolumeUpdate(e.offsetX, 'volume');
			}
		});

		// 音量调节滑动
		tools.drag(volumeAdjustBar, volumeAdjustBg, volumeAdjustFg, 'volume');

		// 音量icon的click事件
		volumeINode.addEventListener('click', function(e) {
			e.stopPropagation();
			let className = String(this.className),
				targetClassName = '',
				left = 0,
				width = 0;

			if (className.indexOf(VOLUMEUP) >= 0) {
				cachevolumeInfo.left = volumeAdjustBar.style.left || 0;
				cachevolumeInfo.width = volumeAdjustFg.style.width || 0;
				left = width = 0;
				targetClassName = NOVOLUME;
				// 设置静音
				theAudio.volume = 0;
			} else if (className.indexOf(NOVOLUME) >= 0) {
				targetClassName = VOLUMEUP;
				left = cachevolumeInfo.left;
				width = cachevolumeInfo.width;
				theAudio.volume = parseInt(width) / volumeAdjustBg.offsetWidth;
			}
			this.className = targetClassName;
			volumeAdjustBar.style.left = left;
			volumeAdjustFg.style.width = width;
		});

		// 播放区域click事件
		controller.addEventListener('click', function(e) {
			e.stopPropagation();

			if (!tools.isEffectedSource()) {
				return;
			}
			let target = e.target || e.srcElement,
				className = String(target.className),
				nodeName = String(target.nodeName).toLowerCase();

			if (nodeName === 'i') {
				if (className.indexOf(PAUSE) >= 0 ||
					className.indexOf(PLAY) >= 0) {
					if (className.indexOf(PAUSE) >= 0) {
						tools.changeIcon(target, PLAY);
						tools.play();
						timer = setInterval(() => {
							audioData.timeSeconds = theAudio.currentTime;
							tools.run(audioData.timeSeconds, audioData.durSeconds);
						}, 900);
					} else if (className.indexOf(PLAY) >= 0) {
						tools.changeIcon(target, PAUSE);
						tools.pause();
					}
				} else {
					let src = settings.src;
					if (Array.isArray(src)) {
						let length = src.length,
							currentIndex = audioData.currentSongIndex,
							currentSrc = '';

						if (className.indexOf(PREV) >= 0) {
							if (currentIndex <= 0) {
								currentSrc = src[length - 1];
								audioData.currentSongIndex = length - 1;
							} else {
								currentSrc = src[currentIndex - 1];
								audioData.currentSongIndex = currentIndex - 1;
							}
						} else if (className.indexOf(NEXT) >= 0) {
							if (currentIndex < length - 1) {
								currentSrc = src[currentIndex + 1];
								audioData.currentSongIndex = currentIndex + 1;
							} else {
								currentSrc = src[0];
								audioData.currentSongIndex = 0;
							}
						}
						theAudio.src = currentSrc;
						// 重新计算文件相关数据
						tools.computeCurSrcData();
						tools.play();
					} else {
						return;
					}
				}
			}
		});
			
	};

	// 构建audio节点
	tools.createAudio = function(options) {
		let el = null;
		theAudio = doc.createElement('audio');
		for (let key of Object.keys(options)) {
			switch(key) {
				case 'key':
					el = doc.getElementById(options[key]); 
					break;
				case 'src':
					theAudio[key] = Array.isArray(options[key]) ? options[key][0] : options[key];
					break;
				default:
					theAudio[key] = options[key];
			}
		}
		if (!el) {
			el = doc.body;
		}
		if (!theAudio.hasOwnProperty('preload')) {
			theAudio.preload = 'auto';
		}
		return el;
	};

	let Audio = function() {
		this.settings = null;
	};

	Audio.fn = Audio.prototype;

	Audio.fn.init = function(options) {
		if (typeof options !== 'object' || !options.src) {
			return;
		}

		let el = tools.createAudio(options);
		settings = options;
		// 构建需要的css类名
		for (let key of Object.keys(classes)) {
			cssClasses[key] = cssPrefix + '-' + classes[key];
		}
		// 构建结构
		tools.view(el);
		// 绑定事件及事件处理
		tools.events();
	};

	window.audioPlayer = new Audio();
})(window, document)