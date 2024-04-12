;(function(root) {
  const classes = {
    isChecked: 'is-checked'
  };
  const nodes = {
    radio: null,
    input: null
  };
  const on = tools.on;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  const Radio = function(checked, radio, box) {
    this.checked = checked;
    this.radio = radio;
    this.radioBox = box;
    this.init();
  };

  Radio.prototype = {
    init: function() {
      const that = this;
      const radioBox = document.querySelector('.radio');
      const inner = radioBox.children[0].children;
      this.radioBox = radioBox;
      this.radio = inner[1];
      on(this.radio, {
        'click': function() {
          that.checked = true;
          that.check();
        }
      })
    },
    check: function() {
      addClass(this.radioBox, classes.isChecked);
    }
  };

  new Radio();
})(window);