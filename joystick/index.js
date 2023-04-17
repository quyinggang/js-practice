function onMouseMove(e) {
  if (!this.isDragging) return;
  e.preventDefault();
  this.moveCallback && this.moveCallback(e);
}

function onMouseUp(e) {
  if (!this.isDragging) return;
  e.preventDefault();
  this.endCallback && this.endCallback(e);
  this.unbindEvents();
}

class DragManager {
  constructor(element, startCallback, moveCallback, endCallback) {
    this.element = element;
    this.isDragging = false;
    this.onMouseMove = onMouseMove.bind(this);
    this.onMouseUp = onMouseUp.bind(this);
    this.startCallback = startCallback;
    this.moveCallback = moveCallback;
    this.endCallback = endCallback;
    this.bindEvents();
  }
  bindEvents() {
    const { element, startCallback } = this;
    element.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      startCallback && startCallback(e);
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
    });
  }
  unbindEvents() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }
}

const joystickElement = document.querySelector(".joystick");
const frontElement = joystickElement.querySelector(".front");
const backElement = joystickElement.querySelector(".back");
const ballElement = document.getElementById("ball");
const joystickBox = joystickElement.getBoundingClientRect();
const { width: size } = backElement.getBoundingClientRect();
const center = {
  x: joystickBox.left,
  y: joystickBox.top,
};
const maxRadius = size / 2;
const modelConfig = {
  isMove: false,
  speed: 1.5,
};
let ballTransform = {
  x: 0,
  y: 0,
};
const degrees = (a) => {
  return a * (180 / Math.PI);
};
const calcDistance = (p1, p2) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
};
const normalize = (value) => {
  return value / (Math.abs(value) || 1);
};

const handlerDragStart = (event) => {
  modelConfig.isMove = true;
};
const handlerDragMove = (event) => {
  const mouse = {
    x: event.pageX,
    y: event.pageY,
  };
  const radian = Math.atan2(mouse.y - center.y, mouse.x - center.x);
  const distance = calcDistance(mouse, center);
  const limitRadius = Math.min(maxRadius, distance);
  const x = Number((limitRadius * Math.cos(radian)).toFixed(2));
  const y = Number((limitRadius * Math.sin(radian)).toFixed(2));
  frontElement.style.transform = `translate(${x}px, ${y}px)`;

  const { isMove, speed } = modelConfig;
  if (!isMove) return;
  const angle = degrees(radian);
  ballTransform.x += Math.cos(radian) * speed;
  ballTransform.y += Math.sin(radian) * speed;
  ballElement.style.transform = `translate(${ballTransform.x}px, ${ballTransform.y}px) rotate(${angle}deg) `;
};
const handleDragEnd = () => {
  modelConfig.isMove = false;
  frontElement.style.transform = `translate(0px, 0px)`;
};
new DragManager(
  joystickElement,
  handlerDragStart,
  handlerDragMove,
  handleDragEnd
);
