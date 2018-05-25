;(function(root) {
  const classes = {
    active: 'is-active'
  };
  const on = tools.on;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  const Collapse = function() {
    this.items = null;
    this.init();
  };

  Collapse.prototype = {
    init: function() {
      const collapse = document.querySelector('.collapse');
      this.items = [...collapse.children].map(item => {
        return new CollapseItem(item);
      });
      this.items.forEach(item => {
        item.panel.style.cssText = 'height:0';
        on(item.header, {
          click: function(event) {
            event.stopPropagation();
            item.toggle();
          }
        });
      });
    }
  };

  const CollapseItem = function(dom, state) {
    this.state = state || false;
    this.dom = dom;
    this.header = dom.children[0];
    this.panel = dom.children[1];
    this.panelHeight = this.panel ? this.panel.offsetHeight : 0;
  };

  CollapseItem.prototype = {
    toggle: function() {
      const { state, dom, panel } = this;
      const currentState = !state;
      const active = classes.active;
      this.state = currentState;
      currentState ? (
        addClass(dom, active),
        panel.style.cssText = `height:${this.panelHeight + 30}px`
       ) : (
         removeClass(dom, active),
         panel.style.cssText = 'height: 0'
       );
    }
  };

  new Collapse();
})(window);