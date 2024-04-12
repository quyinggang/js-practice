
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
    const targetClassName = `${currentName} ${className}`;
    item.className = targetClassName.trim();
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

  // 批量创建节点
tools.createElm = function(elems) {
	const isArray = Array.isArray(elems);
	const isString = typeof elems === 'string';
  const nodes = [];
  const createDetail = function(item) {
    const nodes = [];
    const items = String(item).split('*');
    const count = parseInt(items[1]);
    if (count) {
      for (let index = 0; index < count; index++) {
        nodes.push(document.createElement(items[0]));
      }
    }
    return nodes;
  };

	if (isArray) {
		elems.forEach((item) => nodes.push(createDetail(item)));
	} else if (isString) {
		nodes.push(createDetail(elems));
	}
	return nodes;
};

tools.appendChild = function(node, childs) {
  if (!node.nodeType) return;
  childs = Array.isArray(childs) ? childs : [childs];
  childs.forEach(item => {
    node.appendChild(item);
  });
}
