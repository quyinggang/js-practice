
const tools = {};

tools.on = function(target, events) {
	if (!target || !events || !Object.keys(events)) return;
	Object.keys(events).forEach(function(ev) {
		target.addEventListener(ev, function(event) {
			events[ev].call(this, event);
		});
	});
};

tools.forEach = function(items, cb) {
  if (!items) return;
  for (let item of items) {
    cb(item);
  }
};

tools.addClass = function(nodes, className) {
  if (!nodes || !className) return;
  const isArray = Array.isArray(nodes);
  const _add = function(item) {
    const currentName = String(item.className).trim();
    if (currentName.indexOf(className) >= 0) return;
    item.className = `${currentName} ${className}`;
  };
  isArray ? tools.forEach(nodes, _add) : _add(nodes);
};

tools.removeClass = function(nodes, className) {
  if (!nodes || !className) return;
  const isArray = Array.isArray(nodes);
  const _remove = function(item) {
    const currentName = item.className;
    item.className = currentName.replace(className, '').trim();
  };
  isArray ? tools.forEach(nodes, _remove) : _remove(nodes);
};
