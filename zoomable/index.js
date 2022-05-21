class Zoomable {
  constructor($el, options) {
    if (!($el instanceof HTMLElement)) {
      throw new Error("非法挂载元素");
    }
    this.$el = $el;
    this.config = options || {};
    this.zoomElement = null;
    this.size = { width: 0, height: 0 };
    this.offset = { x: 0, y: 0 };
    this.scale = 1;
    this.minScale = 0.2;
    this.maxScale = 8;
    this.dragging = false;
    this.zooming = false;
    this.init();
    this.bindEvents();
  }

  init() {
    this.render();
    const zoomElement = this.zoomElement;
    const { width, height, top, left } = zoomElement.getBoundingClientRect();
    this.size = { width, height };
    this.offset = { x: top, y: left };
    this.layout();
  }

  render() {
    const $el = this.$el;
    const zoomElement = document.createElement("div");
    zoomElement.className = "zoom-container";
    zoomElement.innerHTML =
      '<img class="image" src="https://tse1-mm.cn.bing.net/th/id/R-C.5bad3460c502d864fbba90bdabbbb6ce?rik=k6V%2bk0v8pM%2f0HA&riu=http%3a%2f%2fi.loli.net%2f2020%2f02%2f21%2fp5xi2MvnRt3zoDy.jpg&ehk=vrXS1c4Z7s1gdWHNLNlbZTKbuipqYciCF9Hi81LWLdM%3d&risl=&pid=ImgRaw&r=0" />';
    this.zoomElement = zoomElement;
    $el.appendChild(zoomElement);
  }

  layout() {
    const { offset, zoomElement, scale } = this;
    zoomElement.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`;
  }

  drag(originalEvent) {
    if (this.dragging || this.zooming) return;
    const oldOffset = this.offset;
    const { pageX: startX, pageY: startY } = originalEvent;
    const handleMouseMove = (event) => {
      this.dragging = true;
      this.offset = {
        x: Number((event.pageX - startX + oldOffset.x).toFixed(3)),
        y: Number((event.pageY - startY + oldOffset.y).toFixed(3)),
      };
      this.layout();
    };
    const handleMouseUp = () => {
      if (!this.dragging) return;
      this.dragging = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  getRatio(event) {
    const config = this.config;
    let initialRatio = Number(config.wheelZoomRatio) || 0.1;
    let delta = 1;
    if (event.deltaY) {
      delta = event.deltaY > 0 ? 1 : -1;
    } else if (event.wheelDelta) {
      delta = -event.wheelDelta / 120;
    } else if (event.detail) {
      delta = event.detail > 0 ? 1 : -1;
    }
    let ratio = -delta * initialRatio;
    return ratio < 0 ? 1 / (1 - ratio) : 1 + ratio;
  }

  wheelZoom(event) {
    event.preventDefault();
    if (this.zooming) return;
    this.zooming = true;
    // 简单节流
    setTimeout(() => {
      this.zooming = false;
    }, 10);
    const { size, offset: oldOffset, scale: oldScale, minScale, maxScale } = this
    const ratio = this.getRatio(event);
    const scale = Math.min(Math.max(oldScale * ratio, minScale), maxScale);
    if (scale === oldScale) return
    const center = {
      x: event.pageX,
      y: event.pageY
    }
    // 容器size缩放前后偏差
    const diff = {
      x: (ratio - 1) * size.width * 0.5,
      y: (ratio - 1) * size.height * 0.5,
    };
    // 缩放点坐标缩放前后偏差值
    const centerDiff = {
      x: (ratio - 1) * center.x,
      y: (ratio - 1) * center.y
    }
    // 保证缩放点与缩放元素缩放前后相对位置不变：缩放前元素偏移offset缩放后的值 + 本次缩放物体大小改变的偏差值 - 当前缩放点的坐标缩放偏差
    this.offset = {
      x: oldOffset.x * ratio + diff.x - centerDiff.x,
      y: oldOffset.y * ratio + diff.y - centerDiff.y
    };
    this.scale = scale;
    this.layout();
  }

  bindEvents() {
    const zoomElement = this.zoomElement;
    zoomElement.addEventListener("mousedown", this.drag.bind(this));
    window.addEventListener("wheel", this.wheelZoom.bind(this), {
      passive: false,
    });
  }
}

export default Zoomable;
