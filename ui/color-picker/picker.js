;(function(root) {
	const doc = root.document;
	const body = doc.body;
	const { on, addClass, removeClass } = tools;
	const addEventListener = root.addEventListener;
	const removeEventListener = root.removeEventListener;
	const classes = {
		show: 'is-open'
	};
	const btn = document.querySelector('.color-picker');

	const createNode = function(tagName, className) {
		const node = doc.createElement(tagName);
		node.className = className;
		return node;
	};

	const ColorPicker = function() {
		this.dom = null;
		this.value = 0;
		this.alpha = 1;
		this.isClose = true;
		this.colorPanel = null;
		this.colorSlider = null;
		this.alphaSlider = null;
		this.footer = null;
		this.init();
	};

	ColorPicker.prototype = {
		init: function() {
			const dom = createNode('div', 'color-picker__panel');
			const mainDom = createNode('div', 'main');
			this.colorPanel = new ColorPanel(this);
			this.colorSlider = new Slider(this, 'color', 1);
			this.alphaSlider = new Slider(this, 'alpha');
			['colorPanel', 'colorSlider'].forEach(item => {
				mainDom.appendChild(this[item].dom);
			});
			dom.appendChild(mainDom);
			['alphaSlider'].forEach(item => {
				dom.appendChild(this[item].dom);
			});
			this.dom = dom;
			body.appendChild(dom);
			this.on();
			this.updatePanel();
			this.updateBtn();
			this.updateAlphaSlider();
		},
		on: function() {
			const that = this;
			on(doc, {
				'click': function(e) {
					if (that.isClose) return;
					const target = e.target;
					if (!that.dom.contains(target)) {
						that.close();
					}
				}
			})
		},
		open: function() {
			this.isClose = false;
			addClass(this.dom, classes.show);
		},
		close: function() {
			this.isClose = true;
			removeClass(this.dom, classes.show);
		},
		updatePanel: function() {
			const value = `hsl(${this.value},100%,50%)`;
			this.colorPanel.dom.style.cssText = `background: ${value}`;
			console.log(value);
		},
		updateBtn: function() {
			const value = `hsla(${this.value},100%,50%,${this.alpha})`;
			btn.style.cssText = `background: ${value}`;
			console.log(value);
		},
		changeValue: function(value) {
			this.value = value;
			this.updatePanel();
			this.updateBtn();
			this.updateAlphaSlider();
		},
		changeAlpha: function(alpha) {
			this.alpha = alpha;
			this.updateBtn();
		},
		updateAlphaSlider: function() {
			const value = this.value;
			const cssText = `background:linear-gradient(to right, hsla(${value},100%,50%,0) 0%, hsla(${value},100%,50%,1) 100%)`;
			this.alphaSlider.dom.children[0].style.cssText = cssText;
			console.log(cssText);
		}
	};

	const ColorPanel = function(parent) {
		this.$parent = parent;
		this.dom = null;
		this.init();
	};

	ColorPanel.prototype = {
		init: function() {
			const dom = createNode('div', 'color-panel');
			dom.innerHTML = `
				<div class="panel__white"></div>
				<div class="panel__black"></div>
				<div class="panel__cursor"></div>
			`;
			this.dom = dom;
		}
	};

	const Slider = function(parent, type, direction) {
		this.$parent = parent;
		this.type = type;
		this.direction = direction || 0;
		this.dom = null;
		this.thumb = null;
		this.currentValue = 0;
		this.init();
	};

	Slider.prototype = {
		init: function() {
			const targetClass = `${this.type}-slider`;
			const dom = createNode('div', targetClass);
			dom.innerHTML = `
				<div class="slider__bar"></div>
			`;
			this.thumb = new Thumb(this, 0);
			dom.appendChild(this.thumb.dom);
			this.dom = dom;
			this.on();
		},
		on: function() {
			const that = this;
			const { dom, direction, thumb } = this;
			on(dom, {
				'click': function(event) {
					const contentBox = dom.getBoundingClientRect();
					const props = direction ? ['clientY', 'top', 'height'] : ['clientX', 'left', 'width'];
					const percent = (event[props[0]] - contentBox[props[1]]) / contentBox[props[2]] * 100;
					thumb.currentPosition = Math.max(0, Math.min(percent, 100));
					that.updateView();
				}
			});
		},
		// 更新视图
		updateView() {
			const { thumb, dom, direction } = this;
			const currentPosition = thumb.currentPosition;
			this.currentValue = Math.floor(currentPosition);
			if (direction) {
				this.$parent.changeValue(Math.floor(this.currentValue * 3.6));
			} else {
				this.$parent.changeAlpha(this.currentValue * 0.01);
			}
			const property = direction ? 'top' : 'left';
			thumb.dom.style.cssText = `${property}:${currentPosition}%`;
		},
		// 计算偏移位置
		setPosition(currentPoint) {
			const { dom, thumb, direction } = this;
			const contentSize = direction ? dom.offsetHeight : dom.offsetWidth;
			// 计算当前拖动位置与初始拖动位置的距离
			const diff = currentPoint - thumb.start;
			// 计算差距占精度条的百分比
			const percent = (diff / contentSize).toFixed(6) * 100;
			thumb.currentPosition = Math.max(0, Math.min(
				thumb.startPosition + percent, 100));
			this.updateView();
		}
	};

	const Thumb = function(parent, currentPosition) {
		this.$parent = parent;
		this.dom = null;
		this.isDragging = false;
		this.start = 0;
		this.startPosition = currentPosition;
		this.currentPosition = currentPosition || 0;
		this.init();
	};

	Thumb.prototype = {
		init: function() {
			const dom = createNode('div', 'slider__thumb-wrapper');
			dom.innerHTML = `
				<div class="thumb"></div>
			`;
			this.dom = dom;
			this.on();
		},
		on: function() {
			const that = this;
			on(this.dom, {
				'mousedown': function(event) {
					event.preventDefault();
					that.dragStart(event);
					addEventListener('mousemove', function(e) {
						that.dragging(e);
					});
					addEventListener('mouseup', function() {
						that.dragEnd();
					});
				}
			});
		},
		dragStart: function(e) {
			const { direction } = this.$parent;
			this.isDragging = true;
			this.start = direction ? e.clientY : e.clientX;
			this.startPosition = this.currentPosition
		},
		dragging: function(e) {
			if (!this.isDragging) return;
			const { direction } = this.$parent;
			const currentPoint = direction ? e.clientY : e.clientX;
			this.$parent.setPosition(currentPoint);
		},
		dragEnd: function() {
			this.isDragging = false;
			removeEventListener('mousemove', this.dragging);
			removeEventListener('mouseup', this.dragEnd);
		}
	};

	const colorPicker = new ColorPicker();
	on(btn, {
		'click': function(e) {
			e.stopPropagation();
			if (colorPicker.isClose) {
				const {top, left, height} = this.getBoundingClientRect();
				colorPicker.dom.style.cssText = `top: ${top + height + 15}px;left:${left}px;`;
				colorPicker.open();
			} else {
				colorPicker.close();
			}
		}
	});

})(window);