;(function(root) {
	let isChecked = false;
	const nodes = {
		sw: null,
		checkBox: null,
		switchCore: null,
		switchBtn: null
	};

	const initEvents = function() {
		on(nodes.switchCore, {
			'click': function() {
				isChecked = !nodes.checkBox.checked;
				nodes.checkBox.checked = isChecked;
				const cssText = isChecked ?  'transform: translate3d(20px, 0, 0)' : '';
				let className = nodes.switch.className;
				const targetClass = isChecked ? `${className} is-checked` : className.replace(' is-checked', '');
				nodes.switchBtn.style.cssText = cssText;
				nodes.switch.className = targetClass;
				console.log(isChecked);
			}
		})
	};

	(function() {
		var sw = document.querySelector('.switch');
		nodes.switch = sw;
		nodes.checkBox = sw.children[0];
		nodes.switchCore = sw.children[1];
		nodes.switchBtn = sw.children[1].children[0];
		initEvents();
	})();
})(window);