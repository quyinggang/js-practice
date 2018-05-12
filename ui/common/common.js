var on = function(target, events) {
	if (!target || !events || !Object.keys(events)) return;
	Object.keys(events).forEach(function(ev) {
		target.addEventListener(ev, function(event) {
			events[ev].call(this, event);
		});
	});
};