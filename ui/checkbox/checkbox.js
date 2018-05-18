;(function(root) {
  const classes = {
    isChecked: 'is-checked'
  };
  const nodes = {
    checkbox: null,
    input: null
  };
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  const initEvents = function() {
    tools.on(nodes.input, {
      'click': function(event) {
        const checkbox = nodes.checkbox;
        this.checked ? addClass(checkbox, classes.isChecked) : 
          removeClass(checkbox, classes.isChecked);
      }
    });
  };

  const checkbox = document.querySelector('.checkbox');
  const inner = checkbox.children[0].children;
  nodes.checkbox = checkbox;
  nodes.input = inner[1];
  initEvents();
})(window);