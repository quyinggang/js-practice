;(function(root) {
  const classes = {
    isChecked: 'is-checked'
  };
  const nodes = {
    radio: null,
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
        const radio = nodes.radio;
        this.checked ? addClass(radio, classes.isChecked) : 
          removeClass(radio, classes.isChecked);
      }
    });
  };

  (function() {
    const radio = document.querySelector('.radio');
    const inner = radio.children[0].children;
    nodes.radio = radio;
    nodes.input = inner[1];
    initEvents();
  })();
})(window);