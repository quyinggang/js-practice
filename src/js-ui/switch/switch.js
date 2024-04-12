;(function(root) {
	const classes = {
		isChecked: 'is-checked'
	};
	const addClass = tools.addClass;
	const removeClass = tools.removeClass;
	const on = tools.on;

	const Switch = function(checked) {
		this.checked = checked || false;
		this.dom = {
			switch: null,
			checkBox: null,
			switchCore: null,
			switchBtn: null
		};
		this.init();
	};

	Switch.prototype = {
		init: function() {
			const { dom } = this;
			const sw = document.querySelector('.switch');
			dom.switch = sw;
			dom.checkBox = sw.children[0];
			dom.switchCore = sw.children[1];
			dom.switchBtn = sw.children[1].children[0];
			this.on();
		},
		on: function() {
			const { switchBtn, switch: sw, switchCore, 
				checkBox } = this.dom;
			on(switchCore, {
				'click': function() {
					isChecked = !checkBox.checked;
					this.checked = isChecked;
					checkBox.checked = isChecked;
					const temp = [switchBtn, sw];
					isChecked ? addClass(temp, classes.isChecked) : 
						removeClass(temp, classes.isChecked);
					console.log(isChecked);
				}
			});
		}
	};

	new Switch();
})(window);