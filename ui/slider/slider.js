;(function(root) {
	const addEventListener = root.addEventListener;
	const removeEventListener = root.removeEventListener;
	const sliderMax = 100;
	const sliderMin = 0;
	let startPosition = 0;
	let currentPosition = 0;
	let value = 0;
	const dragState = {
		isdragging: false,
		startX: null
	};
	const nodes = {
		start: null,
		runway: null,
		progress: null,
		thumbWrapper: null,
		end: null
	};
	
	/**
	 * 更新视图
	 */
	const updateView = function() {
		const progress = nodes.progress;
		const thumbWrapper = nodes.thumbWrapper;
		value = Math.floor(currentPosition);
		console.log(value);
		thumbWrapper.style.left = currentPosition + '%';
		progress.style.width = currentPosition + '%';
	};

	// 计算偏移位置
 	const setPosition = function(clientX) {
		const contentWidth = nodes.runway.offsetWidth;
		// 计算当前拖动位置与初始拖动位置的距离
		const diff = clientX - dragState.startX;
		// 计算差距占精度条的百分比
		const prec = (diff / contentWidth).toFixed(6) * 100;
		currentPosition = Math.max(0, Math.min(startPosition + prec, 100));
		updateView();
	};

	const dragStart = function(event) {
		dragState.isdragging = true;
		dragState.startX = event.clientX;
		startPosition = currentPosition;
	};

	const dragging = function(event) {
		if (!dragState.isdragging) return;
		setPosition(event.clientX);
	};

	const dragEnd = function() {
		dragState.isdragging = false;
		removeEventListener('mousemove', dragging);
		removeEventListener('mouseup', dragEnd);
	};
	
	/**
	 * 绑定事件
	 * runway绑定点击时间
	 * thumb所在容器绑定:
	 * 	mousedown、mousemove、mouseup实现拖动
	 * 也可以使用drag API
	 * 
	 */
	const initEvents = function() {
		on(nodes.runway, {
			'click': function(event) {
				const contentBox = nodes.runway.getBoundingClientRect();
				const prec = (event.clientX - contentBox.left) / contentBox.width * 100;
				currentPosition = Math.max(0, Math.min(prec, 100));
				updateView(); 
			}
		});
		on(nodes.thumbWrapper, {
			'mousedown': function(event) {
				event.preventDefault();
				dragStart(event);
				addEventListener('mousemove', dragging);
				addEventListener('mouseup', dragEnd);
			}
		});
	};

	/**
	 * 获取相应的DOM节点
	 */
	(function() {
		const slider = document.querySelector('.slider');
		const content = slider.children[1];
		nodes.start = slider.children[0];
		nodes.runway = content;
		nodes.progress = content.children[0];
		nodes.thumbWrapper = content.children[1];
		nodes.end = slider[2];
		initEvents();
	})();
})(window);