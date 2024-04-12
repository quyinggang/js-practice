;(function(root) {
  const classes = {
    btn: 'btn',
    primary: 'btn__primary',
    transfer: 'transfer',
    panel: 'transfer-panel',
    leftPanel: 'transfer-panel--left',
    rightPanel: 'transfer-panel--right',
    panelHeader: 'panel__header',
    panelBody: 'panel__body',
    panelFooter: 'panel__footer',
    btns: 'transfer__btns',
    liItem: 'item',
    leftIcon: 'fa fa-angle-left',
    rightIcon: 'fa fa-angle-right',
    footerLabel: 'footer__label'
  };
  const {on, addClass, removeClass, createElm, appendChild } = tools;

  const Transfer = function(data, selected, leftDefaultSelected) {
    this.data = data || [];
    this.selected = selected || [];
    this.leftDefaultSelected = leftDefaultSelected || [];
    this.leftPanel = null;
    this.rightPanel = null;
    this.transferNode = null;
    this.dataMap = {};
    this.btns = null;
    this.init();
  };

  Transfer.prototype = {
    init: function() {
      const { data, dataMap } = this;
      const [[node]] = createElm(['div*1']);
      addClass(node, classes.transfer);
      this.leftPanel = new Panel(this, 0);
      this.rightPanel = new Panel(this, 1);
      const [
        [btnsWrapper],
        [leftBtn, rightBtn],
        [leftBtnIcon, rightBtnIcon]
      ] = createElm(['div*1', 'button*2', 'i*2']);
      addClass(leftBtnIcon, classes.leftIcon);
      addClass(rightBtnIcon, classes.rightIcon);
      addClass(leftBtn, classes.btn);
      addClass(rightBtn, classes.btn);
      addClass(btnsWrapper, classes.btns);
      appendChild(leftBtn, leftBtnIcon);
      appendChild(rightBtn, rightBtnIcon);
      appendChild(btnsWrapper, [leftBtn, rightBtn]);
      appendChild(node, [
        this.leftPanel.panelNode,
        btnsWrapper,
        this.rightPanel.panelNode
      ]);
      Array.isArray(data) && data.forEach(item => {
        dataMap[item.key] = item;
      });
      this.btns = [leftBtn, rightBtn];
      this.transferNode = node;
      document.body.appendChild(node);
      this.onEvents();
    },
    onEvents: function() {
      const {
        btns,
        leftPanel,
        rightPanel
      } = this;
      const handleClick = (panel, otherPanel) => {
        const { selected, options, panelBody } = panel;
        Object.keys(selected).forEach(key => {
          const target = options[key];
          const { label, value, isDisabled } = target;
          target.checkBox.changeChecked(true);
          target && panelBody.removeChild(target.node);
          panel.deleteOptions(key);
          panel.deleteSelected(key);
          // 构建新对象
          const copyTarget = new Option(otherPanel, label, value, isDisabled);
          otherPanel.setOptions(key, copyTarget);
          appendChild(otherPanel.panelBody, copyTarget.node);
        });
        panel.changeAllSelected();
        panel.changeBtnStatus();
        panel.changeTotalCount();
        otherPanel.changeTotalCount();
      };
      on(btns[0], {
        'click': function() {
          event.stopPropagation();
          handleClick(rightPanel, leftPanel);
        }
      });
      on(btns[1], {
        'click': function() {
          event.stopPropagation();
          handleClick(leftPanel, rightPanel);
        }
      });
    }
  };

  const Panel = function($parent, type) {
    this.$parent = $parent;
    this.type = type || 0;
    this.selected = {};
    this.panelNode = null;
    this.panelBody = null;
    this.countTextNode = null;
    this.totalTextNode = null;
    this.footerCheckBox = null;
    this.options = {};
    this.total = 0;
    this.init();
  };

  Panel.prototype = {
    init: function() {
      const { options, selected } = this;
      const { data } = this.$parent;
      const isLeft = this.type === 0;
      // this.selected = isLeft ? {} ;
      const [
        [panelNode],
        [panelHeader, panelFooter],
        [panelBody]
      ] = createElm(['div*1', 'p*2', 'ul*1']);
      const targetClass = isLeft ? classes.leftPanel : classes.rightPanel;
      addClass(panelNode, `${classes.panel} ${targetClass}`);
      addClass(panelHeader, classes.panelHeader);
      addClass(panelBody, classes.panelBody);
      addClass(panelFooter, classes.panelFooter);
      panelHeader.innerText = `列表${this.type + 1}`;
      const [
        [footerLabel],
        [textNode, countTextNode, totalTextNode, lastTextNode]
      ] = createElm(['label*1', 'span*4']);
      isLeft && data.forEach(item => {
        const { key, label, disabled } = item;
        const option = new Option(this, label, key, disabled);
        options[key] = option;
        appendChild(panelBody, option.node);
      }, this);
      textNode.innerText = '共 ';
      countTextNode.innerText = Object.keys(selected).length;
      totalTextNode.innerText = `/${isLeft ? data.length : 0}`;
      lastTextNode.innerText = ' 项';
      addClass(footerLabel, classes.footerLabel);
      this.total = isLeft ? data.length : 0;
      this.footerCheckBox = new root.CheckBox();
      appendChild(footerLabel, [textNode, countTextNode, totalTextNode, lastTextNode]);
      appendChild(panelFooter, [this.footerCheckBox.checkboxNode, footerLabel]);
      appendChild(panelNode, [panelHeader, panelBody, panelFooter]);
      this.panelNode = panelNode;
      this.countTextNode = countTextNode;
      this.totalTextNode = totalTextNode;
      this.panelBody = panelBody;
    },
    setOptions: function(key, option) {
      this.options[key] = option;
    },
    deleteOptions: function(key) {
      delete this.options[key];
    },
    clearOptions: function() {
      this.options = {};
    },
    clearSelected: function() {
      this.selected = {};
    },
    setSelected: function(key) {
      this.selected[key] = key;
      this.changeShowCount();
    },
    deleteSelected: function(key) {
      delete this.selected[key];
      this.changeShowCount();
    },
    getSelectedCount: function() {
      return Object.keys(this.selected).length;
    },
    changeShowCount: function() {
      const count = this.getSelectedCount();
      this.countTextNode.innerText = count;
    },
    changeTotalCount: function() {
      const count = Object.keys(this.options).length;
      this.totalTextNode.innerText = `/${count}`;
      this.total = count;
    },
    changeBtnStatus: function() {
      const { btns } = this.$parent;
      const status = this.getCurrentStatus();
      const operateClass = status >= 0 ? addClass : removeClass;
      operateClass(this.type ? btns[0] : btns[1], classes.primary);
    },
    getCurrentStatus: function() {
      const len = this.$parent.data.length;
      const count = this.getSelectedCount();
      return count ? (count < len ? 0 : count === len ? 1 : -1) : -1;
    },
    changeAllSelected: function() {
      const checkBox = this.footerCheckBox;
      const status = this.getCurrentStatus();
      if (status === 0) {
        checkBox.setIndeterminate();
      } else {
        checkBox.clearIndeterminate();
        checkBox.changeChecked(status !== 1);
      }
    }
  };

  const Option = function($parent, label, value, isDisabled) {
    this.$parent = $parent;
    this.node = null;
    this.label = label;
    this.value = value;
    this.isDisabled = isDisabled;
    this.checkBox = null;
    this.init();
  };

  Option.prototype = {
    init: function() {
      const [[liNode]] = createElm(['li*1']);
      addClass(liNode, classes.liItem);
      this.checkBox = new root.CheckBox(
        this.label,
        this.key,
        false,
        !!this.isDisabled
      );
      appendChild(liNode, this.checkBox.checkboxNode);
      this.node = liNode;
      this.onEvents();
    },
    onEvents: function() {
      const that = this;
      on(this.node, {
        'click': function(event) {
          const { checkBox, $parent: panel, value } = that;
          const nodeName = String(event.target.nodeName).toLowerCase();
          if (nodeName === 'li') {
            checkBox.changeChecked();      
            checkBox.getChecked()
              ? panel.setSelected(value)
              : panel.deleteSelected(value);
          }
          // 处理内部子元素触发事件
          if (nodeName === 'input') {
            !checkBox.getChecked()
              ? panel.setSelected(value)
              : panel.deleteSelected(value);
          }
          panel.changeAllSelected();
          panel.changeBtnStatus();
        }
      })
    }
  };
  
  root.Transfer = Transfer;
})(window);
