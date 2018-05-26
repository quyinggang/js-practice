;(function(root) {
  let tabs = null;
  const classes = {
    active: 'is-active'
  };
  const navsWidth = {};
  const on = tools.on;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;
  
  const Tabs = function(dom, currentIndex) {
    this.currentIndex = currentIndex || 0;
    this.dom = dom;
    this.tabs = null;
    this.panels = null;
    this.navBar = null;
    this.widthMap = null;
    this.init();
  };

  Tabs.prototype = {
    init: function() {
      const widthMap = {};
      const tabs = document.querySelector('.tabs');
      const header = tabs.children[0];
      const content = tabs.children[1];
      this.dom = tabs;
      this.navBar = header.children[0];
      this.tabs = [...header.children[1].children].map((item, index) => {
        const width = item.offsetWidth;
        widthMap[index] = width;
        return new TabItem(index, item, width, !index ? true : false);
      });
      this.widthMap = widthMap;
      this.panels = [...content.children];
      const defaultNav = this.tabs[0];
      this.navBar.style.cssText = `width:${widthMap[0]}px;`;
      addClass(defaultNav, classes.active);
      addClass(this.panels[0], classes.active);
    }
  };

  const TabItem = function(index, dom, width, isCurrent) {
    this.index = index;
    this.dom = dom;
    this.width = width || 0;
    this.isCurrent = isCurrent || false;
    this.on();
  };

  TabItem.prototype = {
    on: function() {
      const that = this;
      on(this.dom, {
        'click': function(event) {
          event.stopPropagation();
          const { index } = that;
          const { navBar, panels, widthMap } = tabs;
          that.reset();
          addClass(this, classes.active);
          addClass(panels[index], classes.active);
          const pos = index ? (
            Object.values(widthMap).slice(0, index).reduce((sum, currentValue) => 
                sum + currentValue) + 40 * index
            ) : 0;
          navBar.style.cssText = `width:${that.width}px;transform:translateX(${pos}px)`;
        }
      });
    },
    reset: function() {
      const { tabs: navs, panels } = tabs;
      const index = this.index;
      navs.forEach((nav, i) => {
        if (i !== index) {
          removeClass(nav.dom, classes.active);
        }
      });
      panels.forEach((panel, i) => {
        if (i !== index) {
          removeClass(panel, classes.active);
        }
      });
    }
  };
  
  tabs = new Tabs();
})(window);