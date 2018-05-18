;(function(root) {
  const nodes = {
    rate: null,
    iconItems: null
  };
  let selectIndex = null;
  const classes = {
    default: 'fa-star-o',
    active: 'fa-star'
  };

  const forEach = function(items, cb) {
    if (!items) return;
    for (let item of items) {
      cb(item);
    }
  };

  const addClass = function(nodes, className) {
    if (!nodes || !className) return;
    const isArray = Array.isArray(nodes);
    const _add = function(item) {
      const currentName = item.className;
      if (currentName.indexOf(className) >= 0) return;
      item.className = `${currentName} ${className}`;
    };
    isArray ? forEach(nodes, _add) : _add(nodes);
  };

  const removeClass = function(nodes, className) {
    if (!nodes || !className) return;
    const isArray = Array.isArray(nodes);
    const _remove = function(item) {
      const currentName = item.className;
      item.className = currentName.replace(className, '').trim();
    };
    isArray ? forEach(nodes, _remove) : _remove(nodes);
  };

  const initEvents = function() {
    const icons = [];
    forEach(nodes.iconItems, function(item) {
      icons.push(item.children[0]);
    });
    forEach(nodes.iconItems, function(item) {
      const _getSelectIndex = function() {
        return Number(this.getAttribute('data-index'));
      };
      const _set = function(index, isSelectIndex) {
        const activeNodes = icons.slice(0, index);
        const defaultNodes = icons.slice(index + 1);
        // 移除所有选中状态，恢复默认状态，添加当前选中状态
        removeClass(icons, classes.active);
        addClass(icons, classes.default);
        removeClass(activeNodes, classes.default);
        addClass(activeNodes, classes.active);
      };
      // 点击和移动，rate状态切换
      on(item, {
        'click': function(event) {
          event.stopPropagation();
          selectIndex = _getSelectIndex.call(this);
          _set.call(this, selectIndex, true);
        },
        'mousemove': function(event) {
          event.stopPropagation();
          const index = _getSelectIndex.call(this);
          _set.call(this, index);
        }
      });
      // 处理离开容器前一次选择的结果
      on(nodes.rate, {
        'mouseleave': function() {
          _set.call(icons[selectIndex], selectIndex);
        }
      });
    });
  };

  (function() {
    const rate = document.querySelector('.rate');
    nodes.rate = rate;
    nodes.iconItems = rate.children;
    initEvents();
  })();
})(window);