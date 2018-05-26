;(function(root) {
  const classes = {
    popover: 'tooltip__poper',
    isShow: 'is-show'
  };
  const on = tools.on;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  const Tooltip = function() {
    this.tooltip = null;
    this.panel = null;
    this.init();
  };

  Tooltip.prototype = {
    init: function() {
      const tooltip = document.querySelector('.tooltip');
      this.tooltip = tooltip;
      this.createPanel();
      this.on();
    },
    createPanel: function() {
      const poper = document.createElement('div');
      poper.className = classes.popover;
      const content = this.tooltip.getAttribute('content');
      poper.innerHTML = `
        ${content}
        <div class="arrow"></div>
      `;
      document.body.appendChild(poper);
      this.panel = poper;
    },
    on: function() {
      const { panel, tooltip } = this;
      on(this.tooltip, {
        'mouseenter': function(event) {
          event.stopPropagation();
          const tooltipBox = tooltip.getBoundingClientRect();
          addClass(panel, classes.isShow);
          const pos = `position:absolute;top:${tooltipBox.top - panel.offsetHeight - 15}px;
            left:${tooltipBox.left}px`;
          
          panel.style.cssText = pos;
        },
        'mouseleave': function() {
          removeClass(panel, classes.isShow);
        }
      })
    }
  };

  new Tooltip();
})(window);
