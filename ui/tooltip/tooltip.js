;(function(root) {
  let isPosition = 'top-center';
  const nodes = {
    tooltip: null,
    poper: null
  };
  const classes = {
    popover: 'tooltip__poper',
    isShow: 'is-show'
  };
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  const createPoper = function() {
    const poper = document.createElement('div');
    poper.className = classes.popover;
    const content = nodes.tooltip.getAttribute('content');
    poper.innerHTML = `
      ${content}
      <div class="arrow"></div>
    `;
    document.body.appendChild(poper);
    nodes.poper = poper;
  };

  const initEvents = function() {
    const { poper, tooltip } = nodes;
    tools.on(nodes.tooltip, {
      'mouseenter': function(event) {
        event.stopPropagation();
        const tooltipBox = tooltip.getBoundingClientRect();
        addClass(poper, classes.isShow);
        console.log(tooltipBox.top);
        console.log(poper.offsetHeight);
        const pos = `position:absolute;top:${tooltipBox.top - poper.offsetHeight - 15}px;
          left:${tooltipBox.left}px`;
        
        poper.style.cssText = pos;
      },
      'mouseleave': function() {
        removeClass(poper, classes.isShow);
      }
    })
  };

  const tooltip = document.querySelector('.tooltip');
  nodes.tooltip = tooltip;
  createPoper();
  initEvents();
})(window);
