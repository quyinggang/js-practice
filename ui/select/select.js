;(function(root) {
  const classes = {
    active: 'active',
    isFocus: 'is-focus',
    isDropdown: 'is-dropdown'
  };
  const body = root.document.body;
  const { on, addClass, removeClass } = tools;
  const options = [
    {
      label: '选项1',
      value: 0
    },
    {
      label: '选项2',
      value: 1
    },
    {
      label: '选项3',
      value: 2
    },
    {
      label: '选项4',
      value: 3
    }
  ];

  const Select = function() {
    this.select = null;
    this.input = null;
    this.panel = null;
    this.state = false;
    this.options = null;
    this.currentOption = null;
    this.isInit = false;
    this.init();
  };

  Select.prototype = {
    init: function() {
      const select = document.querySelector('.select');
      const child = select.children;
      this.select = select;
      this.input = child[1];
      this.on()
    },
    on: function() {
      const that = this;
      const { select, input } = this;
      const inputBox = select.getBoundingClientRect();
      const top = inputBox.top + inputBox.height + 10;
      const dropCssText = `min-width:${inputBox.width}px;position:absolute;left:${inputBox.left}px;top:${top}px;`;
      on(select, {
        'click': function(e) {
          e.stopPropagation();
          let isInit = false;
          input.children[0].focus();
          if (!that.isInit) {
            isInit = true;
            that.isInit = true;
            that.panel = new Panel(that);
          }
          that.changeState(isInit)
          that.computedPosition(dropCssText);
        }
      });
      on(document, {
        'click': function(e) {
          const target = e.target;
          const panel = that.panel;
          if (select && panel && !select.contains(target) && 
              !panel.panel.contains(target)) {
            that.close();
          }
        }
      })
    },
    computedPosition: function(cssText) {
      this.panel.panel.style.cssText = cssText;
    },
    changeState: function(isInit) {
      const { panel, input, state } = this;
      const currentState = !state;
      this.state = currentState;
      const opearClass = currentState ? addClass : removeClass;
      opearClass(input, classes.isFocus);
      isInit ? setTimeout(function() {
        opearClass(panel.panel, classes.isDropdown);
      }, 0) : opearClass(panel.panel, classes.isDropdown);
    },
    resetOptions: function(index) {
      this.options.forEach(function(item, i) {
        if (i !== index) {
          removeClass(item.option, classes.active);
        }
      });
    },
    setInputValue: function() {
      const { input, currentOption } = this;
      input.children[0].value = currentOption.label;
      console.log(this.getValue())
    },
    getValue: function() {
      return this.currentOption.value;
    },
    close: function() {
      this.state = !this.state;
      removeClass(this.panel.panel, classes.isDropdown);
    }
  };

  const Option = function(parent, dom, label, value, index, disabled) {
    this.parent = parent;
    this.option = dom;
    this.label = label;
    this.value = value;
    this.disabled = !!disabled;
    this.index = index;
    this.on();
  };

  Option.prototype = {
    on: function() {
      const { option, parent, label, value, index } = this;
      on(option, {
        'click': function() {
          addClass(this, classes.active);
          parent.currentOption = {label, value};
          parent.setInputValue();
          parent.changeState();
          parent.resetOptions(index);
        }
      });
    }
  };

  const Panel = function(parent) {
    this.parent = parent;
    this.panel = null;
    this.createPanel();
  };

  Panel.prototype = {
    createPanel: function() {
      const that = this.parent;
      const doc = document;
      const panel = doc.createElement('div');
      const arrow = doc.createElement('div');
      const ul = doc.createElement('ul');
      panel.className= 'select-dropdown';
      arrow.className = 'arrow';
      ul.className = 'select-dropdown__list';
      that.options = options.map(function(item, index) {
        const option = doc.createElement('li');
        option.className = 'item';
        option.innerText = item.label;
        ul.appendChild(option);
        return new Option(that, option, item.label, item.value, index);
      });
      panel.appendChild(ul);
      panel.appendChild(arrow);
      body.appendChild(panel);
      this.panel = panel;
    }
  };


  new Select();
})(window);