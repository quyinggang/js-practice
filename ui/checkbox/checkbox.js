;(function(root) {
  const classes = {
    isChecked: 'is-checked'
  };
  const on = tools.on;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  const Checkbox = function(checkboxBox, checkbox, checked) {
    this.checked = checked;
    this.checkbox = checkbox;
    this.checkboxBox = checkboxBox;
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