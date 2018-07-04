;(function(root) {
	const addEventListener = root.addEventListener;
	const removeEventListener = root.removeEventListener;
	const on = tools.on;
	let slider = null;

	const Slider = function(currentValue, end, start, max, min) {
		this.start = start;
		this.end = end;
		this.currentValue = currentValue || 0;
		this.dom = {
			start: null,
			runway: null,
			progress: null,
			end: null
		};
		this.thumb = new Thumb(currentValue);
		this.max = max || 100;
		this.min = min || 0;
		this.init();
	};

	Slider.prototype = {
		init: function() {
			const { dom, thumb } = this;
			const slider = document.querySelector('.slider');
			const content = slider.children[1];
			dom.start = slider.children[0];
			dom.runway = content;
			dom.progress = content.children[0];
			// wrap区域
			thumb.dom = content.children[1];
			dom.end = slider[2];
			this.on();
			thumb.on();
		},
		on: function() {
			const that = this;
			const { runway } = this.dom;
			on(runway, {
				'click': function(event) {
					const contentBox = runway.getBoundingClientRect();
					const percent = (event.clientX - contentBox.left) / contentBox.width * 100;
					that.thumb.currentPosition = Math.max(0, Math.min(percent, 100));
					that.updateView(); 
				}
			});
		},
		// 更新视图
		updateView() {
			const { thumb, dom } = this;
			const currentPosition = thumb.currentPosition;
			this.currentValue = Math.floor(currentPosition);
			thumb.dom.style.left = currentPosition + '%';
			dom.progress.style.width = currentPosition + '%';
		},
		// 计算偏移位置
		setPosition(clientX) {
			const { dom, thumb } = this;
			const { runway } = dom;
			const contentWidth = runway.offsetWidth;
			// 计算当前拖动位置与初始拖动位置的距离
			const diff = clientX - thumb.startX;
			// 计算差距占精度条的百分比
			const percent = (diff / contentWidth).toFixed(6) * 100;
			thumb.currentPosition = Math.max(0, Math.min(
				thumb.startPosition + percent, 100));
			this.updateView();
		}
	};

	const Thumb = function(currentPosition, dom) {
		this.dom = dom;
		this.isDragging = false;
		this.startX = 0;
		this.startPosition = currentPosition;
		this.currentPosition = currentPosition || 0;
	};

	Thumb.prototype = {
		on: function() {
			const that = this;
			on(this.dom, {
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
		},
		dragStart: function(event) {
			this.isDragging = true;
			this.startX = event.clientX;
			this.startPosition = this.currentPosition;
		},
		dragging: function(event) {
			if (!this.isDragging) return;
			slider.setPosition(event.clientX);
		},
		dragEnd: function() {
			this.isDragging = false;
			removeEventListener('mousemove', this.dragging);
			removeEventListener('mouseup', this.dragEnd);
		}
	};

	slider = new Slider();
})(window);