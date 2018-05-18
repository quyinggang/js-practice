;(function(root) {
  let isInit = true;
  let isDropdown = false;
  const nodes = {
    select: null,
    input: null,
    dropDown: null
  };
  const classes = {
    isFocus: 'is-focus',
    isDropdown: 'is-dropdown'
  };
  const body = root.document.body;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;
  const on = tools.on;

  const createDropDown = function() {
    const panel = document.createElement('div');
    panel.className= 'select-dropdown';
    panel.innerHTML = `
      <div class="scrollbar">
        <div class="scrollbar__wrap">
          <ul class="scrollbar__view">
            <li class="item">
              <span>选项1</span>
            </li>
            <li class="item">
              <span>选项2</span>
            </li>
            <li class="item">
              <span>选项3</span>
            </li>
            <li class="item">
              <span>选项4</span>
            </li>
            <li class="item">
              <span>选项5</span>
            </li>
          </ul>
        </div>
        <div class="scrollbar__bar is-horizontal">
          <div class="scrollbar__thumb"></div>
        </div>
        <div class="scrollbar__bar is-vertical">
          <div class="scrollbar__thumb"></div>
        </div>
      </div>
      <div class="arrow"></div>
    `;
    body.appendChild(panel);
    nodes.dropDown = panel;
  };

  const switchDropDown = function() {
    isDropdown = !isDropdown;
  };

  const changeDropDownStyle = function(cssText) {
    if (!nodes.dropDown) return;
    nodes.dropDown.style.cssText = cssText;
  };

  const initEvents = function() {
    const input = nodes.input;
    const inputBox = input.getBoundingClientRect();
    const top = inputBox.top + inputBox.height + 10;
    const dropCssText = `min-width:${inputBox.width}px;position:absolute;left:${inputBox.left}px;top:${top}px;`;
    on(nodes.select, {
      'click': function(event) {
        input.children[0].focus();
        switchDropDown();
        const opearClass = isDropdown ? addClass : removeClass;
        opearClass(input, classes.isFocus);
        if (isDropdown) {
          isInit ? createDropDown() : null;
          isInit = false;
          changeDropDownStyle(dropCssText);
        } else {
          changeDropDownStyle(`${dropCssText}display:none;`);
        }
        opearClass(nodes.dropDown, classes.isDropdown);
      }
    });
    on(body, {
      'click': function(event) {
        const nodeName = String(event.target.nodeName).toLowerCase();
        if (nodeName === 'input' || nodeName === 'span') return;
        switchDropDown();
        removeClass(input, classes.isFocus);
        removeClass(nodes.dropDown, classes.isDropdown);
        changeDropDownStyle(`${dropCssText}display:none;`);
      }
    });
  };

  const select = document.querySelector('.select');
  const child = select.children;
  nodes.select = select;
  nodes.input = child[1];
  initEvents()
})(window);