;(function(root) {
  const classes = {
    badge: 'badge',
    content: 'badge-content',
    dot: 'is-dot'
  };
  const on = tools.on;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;
  /**
   * 标记对象
   * @param {[type]} value 当前值
   * @param {[type]} type  类型：badge | dot
   * 属性：
   *   content：标记区域的DOM节点
   *   badge：标记整体DOM对象
   */
  const Badge = function(value, type) {
    this.value = value;
    this.badge = null;
    this.content = null;
    this.type = type || 'badge';
    this.init();
  };

  Badge.prototype = {
    init: function() {
      const badge = document.querySelector('.badge');
      const content = document.createElement('div');
      const value = badge.getAttribute('value');
      this.value = value;
      content.innerText = value > 99 ? '99+' : value;
      content.className = classes.content;
      badge.appendChild(content);
      this.content = content;
      this.badge = badge;
    },
    change: function(type) {
      this.type = type;
      type === 'dot' ? (
        this.content.innerText = ''
      ) : null;
      addClass(this.badge, classes[this.type]);
    }
  };

  const badge = new Badge();
  // badge.change('dot');
})(window);