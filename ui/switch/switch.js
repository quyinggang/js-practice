;(function(root) {
	let isChecked = false;
	const nodes = {
		switch: null,
		checkBox: null,
		switchCore: null,
		switchBtn: null
	};
	const classes = {
		isChecked: 'is-checked'
	};
	const addClass = tools.addClass;
	const removeClass = tools.removeClass;

	const initEvents = function() {
		const btn = nodes.switchBtn;
		const sw = nodes.switch;
		tools.on(nodes.switchCore, {
			'click': function() {
				isChecked = !nodes.checkBox.checked;
				nodes.checkBox.checked = isChecked;
				const temp = [btn, sw];
				isChecked ? addClass(temp, classes.isChecked) : 
					removeClass(temp, classes.isChecked);
				console.log(isChecked);
			}
		})
	};

	const sw = document.querySelector('.switch');
	nodes.switch = sw;
	nodes.checkBox = sw.children[0];
	nodes.switchCore = sw.children[1];
	nodes.switchBtn = sw.children[1].children[0];
	initEvents();
})(window);