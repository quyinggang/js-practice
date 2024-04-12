function onMouseMove(e) {
  e.preventDefault();
  const instance = this;
  if (!instance.isRotating) return;
  const currentAngle = instance.getRotateAngle(e.pageX, e.pageY);
  instance.rotation = currentAngle - instance.startAngle;
  instance.render();
  instance.emit('onRotate')
}

function onMouseUp(e) {
  e.preventDefault();
  const instance = this;
  if (!instance.isRotating) return;
  instance.angle += instance.rotation
  instance.unbindEvents();
  instance.emit('onRotateEnd')
}

class EventEmitter {
  constructor() {
    this.map = new Map()
  }
  on(name, callback) {
    const map = this.map
    const value = map.get(name) || []
    map.set(name, [...value, callback])
  }
  emit(name, data) {
    const value = this.map.get(name)
    if (Array.isArray(value)) {
      for (const callback of value) {
        typeof callback === 'function' && callback(data)
      }
    }
  }
  off(name, callback) {
    const value = this.map.get(name) || []
    const index = value.findIndex((cb) => cb === callback)
    if (index !== -1) {
      value.splice(index, 1)
    }
  }
}

class DragRotate extends EventEmitter {
  constructor(element) {
    super()
    if (!element) return;
    this.element = element;
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
    const bounding = element.getBoundingClientRect();
    const originX = bounding.width * 0.5;
    const originY = bounding.height * 0.5;
    element.style.transformOrigin = `${originX} ${originY}`;
    this.bindEvents();
    this.boundingRect = bounding
    this.center = { x: originX + bounding.left, y: originY + bounding.top }
  }

  bindEvents() {
    const element = this.element;
    this.onMouseMove = onMouseMove.bind(this);
    this.onMouseUp = onMouseUp.bind(this);
    element.addEventListener("mousedown", (e) => {
      this.isRotating = true;
      this.startAngle = this.getRotateAngle(e.pageX, e.pageY)
      this.emit('onRotateStart')
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
