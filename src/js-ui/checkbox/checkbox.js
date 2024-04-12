;(function(root) {
  const classes = {
    isDisabled: 'is-disabled',
    isChecked: 'is-checked',
    isIndeterMinate: 'is-indeter',
    checkbox: 'checkbox',
    ckInput: 'checkbox__input',
    ckInner: 'checkbox__inner',
    ckLabel: 'checkbox__label',
    ckOriginal: 'checkbox__original'
  };
  const { on, addClass, removeClass, createElm, appendChild } = tools; 

  /**
   * 选择框对象
   * @param {*} label         后面的label文本值
   * @param {*} value         选择后的返回的值
   * @param {*} checked       是否被选择
   * @param {*} isDisabled    是否禁止
   * @param {*} indeterminate 多选模式
   */
  const CheckBox = function(label, value, checked, isDisabled, indeterminate) {
    this.label = label || '';
    this.checked = !!checked;
    this.checkbox = null;
    this.checkboxNode = null;
    this.value = value || '';
    this.isDisabled = !!isDisabled;
    this.indeterminate = !!indeterminate;
    this.init();
  };

  CheckBox.prototype = {
    init: function() {
      const [
        [labelNode],
        [InputWrapper, innerNode, checkBoxLabel],
        [input]
      ] = createElm(['label*1', 'span*3', 'input*1']);
      addClass(labelNode, classes.checkbox);
      addClass(InputWrapper, classes.ckInput);
      addClass(innerNode, classes.ckInner);
      addClass(input, classes.ckOriginal);
      addClass(checkBoxLabel, classes.ckLabel);
      input.type = 'checkbox';
      input.value = this.value;
      checkBoxLabel.innerText = this.label;
      appendChild(InputWrapper, [innerNode, input]);
      appendChild(labelNode, [InputWrapper, checkBoxLabel]);
      if (this.checked && !this.indeterminate) {
        input.checked = true;
        addClass(labelNode, classes.isChecked);
      }
      if (this.indeterminate) {
        addClass(labelNode, classes.isIndeterMinate);
      }
      if (this.isDisabled) {
        input.setAttribute('disabled', 'disabled');
        addClass(labelNode, classes.isDisabled);
      }
      this.checkbox = input;
      // 处理初始化checked
      if (this.checked) input.checked = true;
      this.checkboxNode = labelNode;
      this.onEvents();
      document.body.append(this.checkboxNode);
    },
    onEvents: function() {
      const that = this;
      on(this.checkbox, {
        'change': function() {
          if (that.isDisabled) return;
          // 处理多选情况显示
          that.checked = this.checked;
          that.toggle();
        }
      });
    },
    changeChecked: function(isClear) {
      this.checked = isClear ? false : !this.checked;
      this.checkbox.checked = this.checked;
      this.toggle();
    },
    toggle: function() {
      const operatorClass = this.checked ? addClass : removeClass;
      operatorClass(this.checkboxNode, classes.isChecked);
    },
    getChecked: function() {
      return this.checked;
    },
    setIndeterminate: function() {
      if (this.checked) {
        removeClass(this.checkboxNode, classes.isChecked);
      }
      this.indeterminate = true;
      addClass(this.checkboxNode, classes.isIndeterMinate);
    },
    clearIndeterminate: function() {
      if (!this.indeterminate) return;
      this.indeterminate = false;
      removeClass(this.checkboxNode, classes.isIndeterMinate);
    }
  };

  root.CheckBox = CheckBox;
})(window);