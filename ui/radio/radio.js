;(function(root) {
  const classes = {
    isChecked: 'is-checked'
  };
  const nodes = {
    radio: null,
    input: null
  };
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  const initEvents = function() {
    tools.on(nodes.input, {
      'click': function(event) {
        const radio = nodes.radio;
        this.checked ? addClass(radio, classes.isChecked) : 
          removeClass(radio, classes.isChecked);
      }
    });
  };

  const radio = document.querySelector('.radio');
  const inner = radio.children[0].children;
  nodes.radio = radio;
  nodes.input = inner[1];
  initEvents();
})(window);