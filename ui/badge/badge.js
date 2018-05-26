;(function(root) {
  const classes = {
    badge: 'badge',
    content: 'badge-content',
    dot: 'is-dot'
  };
  const on = tools.on;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  const Badge = function(value, badge, type) {
    this.value = value;
    this.badge = badge;
    this.content = null;
    this.type = type || 'badge';
    this.init();
  };

  Badge.prototype = {
    init: function() {
      const badge = document.querySelector('.badge');
      const div = document.createElement('div');
      const value = badge.getAttribute('value');
      this.value = value;
      div.innerText = value > 99 ? '99+' : value;
      div.className = classes.content;
      badge.appendChild(div);
      this.dom = div;
      this.badge = badge;
    },
    change: function(type) {
      this.type = type;
      type === 'dot' ? (
        this.dom.innerText = ''
      ) : null;
      addClass(this.badge, classes[this.type]);
    }
  };

  const badge = new Badge();
  // badge.change('dot');
})(window);