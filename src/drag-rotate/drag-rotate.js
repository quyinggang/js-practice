function onMouseMove(e) {
  e.preventDefault();
  const instance = this;
  if (!instance.isRotating) return;
  const currentAngle = instance.getRotateAngle(e.pageX, e.pageY);
  instance.rotation = currentAngle - instance.startAngle;
  instance.render();
}

function onMouseUp(e) {
  e.preventDefault();
  const instance = this;
  if (!instance.isRotating) return;
  instance.angle += instance.rotation
  instance.unbindEvents();
}

class DragRotate {
  constructor(element, origin) {
    if (!element) return;
    this.element = element;
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;
    // 旋转点
    this.origin = origin || [this.width / 2, this.height / 2];
    this.point = null;
    this.angle = 0;
    this.rotation = 0
    this.isRotating = false;
    this.onMouseMove = null;
    this.onMouseUp = null;
    this.init();
  }

  init() {
    const element = this.element;
    const [originX, originY] = this.origin;
    element.style.transformOrigin = `${originX} ${originY}`;
    const bounding = element.getBoundingClientRect();
    this.center = { x: originX + bounding.left, y: originY + bounding.top }
    this.bindEvents();
  }

  bindEvents() {
    const element = this.element;
    this.onMouseMove = onMouseMove.bind(this);
    this.onMouseUp = onMouseUp.bind(this);
    element.addEventListener("mousedown", (e) => {
      this.isRotating = true;
      this.startAngle = this.getRotateAngle(e.pageX, e.pageY)
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
    });
  }

  unbindEvents() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  getRotateAngle(x, y) {
    const center = this.center
    const diffY = center.y - y;
    const diffX = center.x - x;
    const angle = (Math.atan2(diffY, diffX) * 180) / Math.PI;
    return Math.round(angle);
  }

  render() {
    const { angle, rotation, element } = this;
    element.style.transform = `rotate(${angle + rotation}deg)`;
  }
}

export default DragRotate;
