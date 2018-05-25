;(function(root) {
  const nodes = {
    navs: null,
    navBar: null,
    panels: null
  };
  const classes = {
    active: 'is-active'
  };
  const navsWidth = {};
  const on = tools.on;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  const setBarActive = function(index, ) {
  };

  const initEvents = function() {
    const navs = [...nodes.navs];
    const panels = [...nodes.panels];
    navs.forEach((item, index) => {
      navsWidth[index] = item.offsetWidth;
      on(item, {
        'click': function(event) {
          event.stopPropagation();
          navs.forEach((nav, i) => {
            if (i !== index) {
              removeClass(nav, classes.active);
            }
          });
          panels.forEach((panel, i) => {
            if (i !== index) {
              removeClass(panel, classes.active);
            }
          });
          addClass(this, classes.active);
          addClass(panels[index], classes.active);
          const pos = index ? (
            Object.values(navsWidth).slice(0, index).reduce((sum, currentValue) => 
                sum + currentValue) + 40 * index
            ) : 0;
          nodes.navBar.style.cssText = `width:${navsWidth[index]}px;transform:translateX(${pos}px)`;
        }
      })
    });
  };

  const initActive = function() {
    const defaultNav = nodes.navs[0];
    nodes.navBar.style.cssText = `width:${defaultNav.offsetWidth}px;`;
    addClass(defaultNav, classes.active);
    addClass(nodes.panels[0], classes.active);
  };

  const tabs = document.querySelector('.tabs');
  const header = tabs.children[0];
  const content = tabs.children[1];
  nodes.navBar = header.children[0];
  nodes.navs = header.children[1].children;
  nodes.panels = content.children;
  initActive();
  initEvents();
})(window);