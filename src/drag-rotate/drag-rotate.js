(function(root) {

  function onMouseMove(e) {
    e.preventDefault();
    const instance = this;
    if (!instance.isRotating) return;
    window.requestAnimationFrame(() => {
      const angle = instance.getRotateAngle(e.clientX, e.clientY);
      instance.rotateAngle = angle;
      instance.render();
    })
  }

  function onMouseUp(e) {
    e.preventDefault();
    const instance = this;
    if (!instance.isRotating) return;
    instance.unbindEvents();
  }

  function DragRotate(element, origin) {
    if (!element) return;
    this.element = element;
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;
    // 旋转点
    this.origin = origin || [this.width / 2, this.height / 2];
    this.point = null;
    this.rotateAngle = 0;
    this.isRotating = false;
    this.onMouseMove = null;
    this.onMouseUp = null;
    this.init();
  }

  DragRotate.prototype = {
    init: function() {
      const element = this.element;
      const [originX, originY] = this.origin;
      element.style.transformOrigin = `${originX} ${originY}`;
      const {top, left} = element.getBoundingClientRect();
      // 旋转点的坐标
      this.point = [left + originX, top + originY];
      this.bindEvents();
    },
    bindEvents: function() {
      const element = this.element; 
      this.onMouseMove = onMouseMove.bind(this);
      this.onMouseUp = onMouseUp.bind(this);
      element.addEventListener('mousedown', e => {
        this.isRotating = true;
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
      });
    },
    unbindEvents: function() {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    },
    getRotateAngle: function(x, y) {
      const [ pointX, pointY ] = this.point;
      const diffY = pointY - y
      const diffX = pointX - x
      // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
      const angle = Math.atan2(diffY, diffX) * 180 / Math.PI;
      return Math.round(angle)
    },
    render: function() {
      const angle = this.rotateAngle;
      const element = this.element;
      element.style.transform = `rotate(${angle}deg)`;
    }
  }

  root.DragRotate = DragRotate;
})(window);