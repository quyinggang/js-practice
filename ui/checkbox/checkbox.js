;(function(root) {
  const classes = {
    isChecked: 'is-checked'
  };
  const nodes = {
    checkbox: null,
    input: null
  };

  const addClass = function(node, className) {
    if (!node || !className) return;
    const currentClass = node.className;
    if (currentClass.indexOf(className) >= 0) return;
    node.className = `${currentClass} ${className}`;
  };

  const removeClass = function(node, className) {
    if (!node || !className) return;
    node.className = node.className.replace(className, '').trim();
  };

  const initEvents = function() {
    on(nodes.input, {
      'click': function(event) {
        const checkbox = nodes.checkbox;
        this.checked ? addClass(checkbox, classes.isChecked) : 
          removeClass(checkbox, classes.isChecked);
      }
    });
  };

  (function() {
    const checkbox = document.querySelector('.checkbox');
    const inner = checkbox.children[0].children;
    nodes.checkbox = checkbox;
    nodes.input = inner[1];
    initEvents();
  })();
})(window);