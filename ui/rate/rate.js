;(function(root) {
  const classes = {
    default: 'fa-star-o',
    active: 'fa-star'
  };
  let rate = null;
  let timer = null;
  const on = tools.on;
  const removeClass = tools.removeClass;
  const addClass = tools.addClass;

  const Rate = function(rate, items, selectIndex) {
    this.items = items;
    this.icons = null;
    this.rate = rate;
    this.selectIndex = selectIndex || 0;
    this.init();
  };

  Rate.prototype = {
    init: function() {
      const rate = document.querySelector('.rate');
      this.rate = rate;
      this.items = [...rate.children].map(item => {
        return new RateItem(item, false);
      });
      this.icons = this.items.map(item => {
         return item.dom.children[0];
      });
      this.on();
    },
    on: function() {
      const that = this;
      on(this.rate, {
        'mouseleave': function() {
          const selectIndex = that.selectIndex;
          const items = that.items.slice(selectIndex);
          items.forEach(item => {
            item.state = false;
          });
          _set(selectIndex);
        }
      });
    }
  };

  const RateItem = function(dom, state) {
    this.dom = dom;
    this.state = state;
    this.on();
  };

  RateItem.prototype = {
    on: function() {
      const that = this;
      on(this.dom, {
        'click': function(event) {
          event.stopPropagation();
          rate.selectIndex = _getSelectIndex.call(this);
          that.state = true;
          _set(rate.selectIndex);
        },
        'mousemove': function(event) {
          event.stopPropagation();
          clearTimeout(timer);
          timer = setTimeout(() => {
            const index = _getSelectIndex.call(this);
            that.state = true;
            _set(index);
          }, 10);
        }
      });
    },

  };

  const _set = function(index) {
    const icons = rate.icons;
    const activeNodes = icons.slice(0, index);
    const defaultNodes = icons.slice(index);
    // 移除所有选中状态，恢复默认状态，添加当前选中状态
    removeClass(icons, classes.active);
    addClass(icons, classes.default);
    removeClass(activeNodes, classes.default);
    addClass(activeNodes, classes.active);
  };

  const _getSelectIndex = function() {
    return Number(this.getAttribute('data-index'));
  };

  rate = new Rate();
})(window);