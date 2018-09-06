;(function(root) {
  const classes = {
    isChecked: 'is-checked'
  };
  const on = tools.on;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  /**
   * 选择框对象
   * @param {[type]} checked 是否被选择
   */
  const Checkbox = function(checked) {
    this.checked = checked || false;
    this.checkbox = null;
    this.checkboxBox = null;
    this.init();
  };

  Checkbox.prototype = {
    init: function() {
      const that = this;
      const checkboxBox = document.querySelector('.checkbox');
      const inner = checkboxBox.children[0].children;
      this.checkbox = inner[1];
      this.checkboxBox = checkboxBox;
      this.checked = this.checkbox.checked;
      on(this.checkbox, {
        'click': function() {
          that.checked = !that.checked;
          that.toggle();
        }
      });
    },
    toggle: function() {
      const operatorClass = this.checked ? addClass : removeClass;
      operatorClass(this.checkboxBox, classes.isChecked);
    }
  };

  new Checkbox();
})(window);