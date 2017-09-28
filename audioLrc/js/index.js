/**
 * 实现音频歌词同步
 */
!(function() {
	let doc = document,
		tools = {},
		classes = {
			control: 'audio-control',
			pause: 'fa fa-pause',
			play: 'fa fa-play',
			on: 'on',
			lyric: 'lyric',
			playing: 'play'
		},
		theAudio = null,
		isCanPlay = false;

	// 判断是否存在指定class
	tools.isExist = function(elem, className) {
		if (!elem || !elem.nodeName || !className) {
			return;
		}
		return String(elem.className).indexOf(className) >= 0;
	};

	tools.addClass = function(elem, className) {
		if (!elem || !elem.nodeName || !className) {
			return;
		}
		if (!tools.isExist(elem, className)) {
			elem.className = (elem.className + ' ' + className).trim();
		}
	};

	tools.removeClass = function(elem, className) {
		if (!elem || !elem.nodeName || !className) {
			return;
		}
		if (tools.isExist(elem, className)) {
			elem.className = elem.className.replace(new RegExp(className, 'g'), '').trim();
		}
	};

	// 获取本地歌词, 本地无法直接获取
	tools.fileReader = function() {
		let lyric = '[00:18.66]怎么大风越狠\
		 			 [00:22.20]我心越荡\
					 [00:25.55]幻如一丝尘土\
					 [00:27.29]随风自由的在狂舞\
					 [00:32.23]我要握紧手中坚定\
					 [00:35.59]却又飘散的勇气\
					 [00:39.03]我会变成巨人\
					 [00:41.27]踏着力气 踩着梦\
					 [00:46.03]怎么大风越狠\
					 [00:49.20]我心越荡\
					 [00:52.82]又如一丝消沙\
					 [00:54.64]随风轻飘的在狂舞\
					 [00:59.59]我要深埋心头上秉持\
					 [01:03.07]却又重小的勇气\
					 [01:06.45]一直往大风吹的方向走过去\
					 [01:12.79]吹啊吹啊 我的骄傲放纵\
					 [01:16.20]吹啊吹不尽我纯净花园\
					 [01:19.43]任风吹 任它乱\
					 [01:21.13]毁不灭是我 尽头的展望\
					 [01:26.53]吹啊吹啊 我赤脚不害怕\
					 [01:29.99]吹啊吹啊 无所谓 扰乱我\
					 [01:33.34]你看我在勇敢地微笑\
					 [01:36.81]你看我在勇敢地去挥手啊\
					 [01:54.54]是你吗 会给我一扇心房\
					 [01:57.14]让我勇敢前行\
					 [02:01.28]是你呀 会给我一扇灯窗\
					 [02:04.29]让我让我无所畏惧\
					 [02:08.19]吹啊吹啊 我的骄傲放纵\
					 [02:11.60]吹啊吹不尽我纯净花园\
					 [02:14.59]任风吹 任它乱\
					 [02:16.38]毁不灭是我 尽头的展望\
					 [02:21.90]吹啊吹啊 我赤脚不害怕\
					 [02:25.27]吹啊吹啊 无所谓 扰乱我\
					 [02:28.63]你看我在勇敢地微笑\
					 [02:32.08]你看我在勇敢地去挥手啊\
					 [02:52.94]吹啊吹啊 我的骄傲放纵\
					 [02:56.20]吹啊吹不尽我纯净花园\
					 [02:59.19]任风吹 任它乱\
					 [03:00.85]毁不灭是我 尽头的展望\
					 [03:06.49]吹啊吹啊 我赤脚不害怕\
					 [03:09.86]吹啊吹啊 无所谓 扰乱我\
					 [03:13.37]你看我在勇敢地微笑\
					 [03:16.74]你看我在勇敢地去挥手啊\
					 [03:27.77]怎么大风越狠 我心越荡\
					 [03:35.32]我会变成巨人\
					 [03:37.70]踏着力气 踩着梦';

		return lyric;
	};

	// 获取audio
	tools.getAudio = function() {
		theAudio = doc.getElementsByTagName('audio')[0];
	};

	// 获取dom节点
	tools.getElements = function() {
		return [doc.getElementsByClassName(classes.control)[0].children[0],
				doc.getElementsByClassName(classes.lyric)[0]];
	};

	// 播放
	tools.play = function() {
		theAudio.play();
	};

	// 暂停
	tools.pause = function() {
		theAudio.pause();
	};

	// 创建节点
	tools.create = function(nodeName) {
		if (!nodeName) {
			return;
		}
		let values = String(nodeName).split('*'),
		nodes = [];

		if (values[0]) {
			let count = parseInt(values[1]) > 1 ? parseInt(values[1]) : 1;
			for (let index = 0; index < count; index++) {
				nodes.push(doc.createElement(values[0]));
			}
		}
		return nodes;
	};

	// 处理歌词
	tools.formatLyricText = function() {
		let timestamps = [],
			lyrics = [],
			temp = [],
			lyric = null,
			copyLyric = null,
			timeRegex = /\[\d+:\d+\.\d+\]/g,
			lyricRegex = /[^\[\d+:\d+\.\d+\]]/g,
			regex = /\[/g;

		copyLyric = lyric = tools.fileReader();
		copyLyric = copyLyric.replace(timeRegex, '_').split('_');
		lyric = lyric.replace(lyricRegex, '').replace(regex, '').split(']');
		copyLyric.forEach((item) => {
			if (item) {
				lyrics.push(item.trim());
			}
		});
		lyric.forEach((item) => {
			if (item) {
				timestamps.push(item.trim());
			}
		});

		return [timestamps, lyrics];
	};

	// 改变播放状态
	tools.changePlayState = function(elem) {
		let play = classes.play,
			pause = classes.pause,
			playing = classes.playing;

		if (tools.isExist(elem, play)) {
			tools.addClass(elem.parentNode, playing);
			tools.removeClass(elem, play);
			tools.addClass(elem, pause);
		} else if (tools.isExist(elem, pause)) {
			tools.removeClass(elem.parentNode, playing);
			tools.removeClass(elem, pause);
			tools.addClass(elem, play);
		}
	};

	// error
	tools.defaultHandleError = function() {
		console.log('音频文件加载失败');
	};

	// 歌词显示处理
	tools.showLyric = function(parentNode, lyrics) {
		let nodes = null;
		if (!lyrics || !Array.isArray(lyrics)) {
			nodes = tools.create('p*1');
			nodes[0].innerText = '暂无歌词';
		} else if (Array.isArray(lyrics)) {
			nodes = tools.create(`p*${lyrics.length}`);
			lyrics.forEach((item, index) => {
				nodes[index].innerText = item;
			});
			nodes.forEach((item) => {
				parentNode.appendChild(item);
			});
		}
		return nodes;
	};

	// 时间格式处理
	tools.formatTime = function(time) {
		let times = String(time).split(':'),
			minute = Number(times[0]) * 60,
			second = Number(times[1]);

		return minute + second;
	};
	// 事件处理
	tools.events = function() {
		let [controlIcon, lyric] = tools.getElements(),
			timestamps = null,
			lyrics = null,
			lyricLines = null,
			currentLine = null,
			lyricOffsetTop = lyric.offsetTop,
			lyricHeight = lyric.clientHeight,
			duration = null;

		// 检测音频文件是否加载成功
		theAudio.addEventListener('loadeddata', function(e) {
			e.stopPropagation();
			isCanPlay = true;
			duration = this.duration;
			[timestamps, lyrics] = tools.formatLyricText();
			lyricLines = tools.showLyric(lyric, lyrics);
		});

		// 播放处理
		controlIcon.addEventListener('click', function(e) {
			e.stopPropagation();
			if (isCanPlay) {
				if (tools.isExist(this.children[0], classes.play)) {
					tools.play();
				} else {
					tools.pause();
				}
			} else {
				tools.defaultHandleError();
			}
		});

		// 歌曲播放, 处理音频与歌词同步
		theAudio.addEventListener('timeupdate', function(e) {
			e.stopPropagation();
			let lyricScrollHeight = lyric.scrollHeight;
			timestamps.forEach((time, index) => {
				if (tools.formatTime(time) - this.currentTime <= 0.1) {
					tools.removeClass(currentLine, classes.on);
					currentLine = lyricLines[index];
					lyric.scrollTop = currentLine.offsetTop - lyricOffsetTop - currentLine.offsetHeight * 8;
					tools.addClass(currentLine, classes.on);
					// timestamps.splice(index, 1);
					// lyricLines.splice(index, 1);
					return;
				}
			});
			if (timestamps.length === 0) {
				tools.removeClass(currentLine, classes.on);
			}
		});

		// 歌曲结束
		theAudio.addEventListener('ended', function(e) {
			e.stopPropagation();
			tools.changePlayState(controlIcon.children[0]);
		});

		// 暂停
		theAudio.addEventListener('pause', function(e) {
			e.stopPropagation();
			tools.changePlayState(controlIcon.children[0]);
		});

		// 播放
		theAudio.addEventListener('play', function(e) {
			e.stopPropagation();
			tools.changePlayState(controlIcon.children[0]);
		});
	};

	(function() {
		tools.getAudio();
		tools.events();
	})();
})();