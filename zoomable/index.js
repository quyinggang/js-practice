class Zoomable {
  constructor($el, options) {

    this.config = options || {};
    this.zoomElement = $el;
    this.transform = { x: 0, y: 0, scale: 1 }
    this.minZoom = 0.2;
    this.maxZoom = 8;
    this.dragging = false;
    this.zooming = false;
    this.init();
    this.bindEvents();
  }

  init() {
    const zoomElement = this.zoomElement;
    const { top, left } = zoomElement.getBoundingClientRect();
    this.transform = { x: top, y: left, scale: 1 }
    this.layout();
  }

  layout() {
    const { transform, zoomElement } = this
    const { x, y, scale } = transform
    const style = zoomElement.style
    style.transformOrigin = '0 0 0';
    // transform: matrix(a, b, c, d, e, f)
    style.transform = `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`;
  }

  drag(originalEvent) {
    if (this.dragging || this.zooming) return;
    const oldTransform = this.transform;
    const { pageX: startX, pageY: startY } = originalEvent;
    const handleMouseMove = (event) => {
      this.dragging = true;
      this.transform = {
        ...oldTransform,
        x: Number((event.pageX - startX + oldTransform.x).toFixed(3)),
        y: Number((event.pageY - startY + oldTransform.y).toFixed(3)),
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
    const speed = Number(config.speed) || 1;
    let delta = event.deltaY;
    if (event.deltaMode > 0) delta *= 100;
    const sign = Math.sign(delta);
    const deltaAdjustedSpeed = Math.min(0.25, Math.abs(speed * delta / 128));
    return 1 - sign * deltaAdjustedSpeed;
  }

  wheelZoom(event) {
    event.preventDefault();
    if (this.zooming) return;
    this.zooming = true;
    // 简单节流
    setTimeout(() => {
      this.zooming = false;
    }, 10);
    const ratio = this.getRatio(event);
    const { transform, minZoom, maxZoom } = this
    const { scale: oldScale, x: oldTransformX, y: oldTransformY } = transform
    const newScale = Math.min(Math.max(oldScale * ratio, minZoom), maxZoom);
    if (oldScale === newScale) return
    const center = {
      x: event.pageX,
      y: event.pageY
    }

    /**
     * 另一种方法：
     * - 容器size缩放前后偏差
     * - 缩放点坐标缩放前后偏差值
     * - 保证缩放点与缩放元素缩放前后相对位置不变：缩放前元素偏移offset缩放后的值 + 本次缩放物体大小改变的偏差值 - 当前缩放点的坐标缩放偏差
     * 
     * 当不设置缩放中心, css默认的缩放中心是center，此时计算就需要考虑容器自身大小缩放偏差
     * 如果设置缩放中心始终是左上角，则不需要考虑容器自身大小缩放偏差
     */
    // const sizeDiff = {
    //   x: (ratio - 1) * size.width * 0.5,
    //   y: (ratio - 1) * size.height * 0.5,
    // };
    // const centerDiff = {
    //   x: (ratio - 1) * center.x,
    //   y: (ratio - 1) * center.y
    // }
    // this.transform = {
    //   x: oldOffset.x * ratio + diff.x - centerDiff.x,
    //   y: oldOffset.y * ratio + diff.y - centerDiff.y,
    //   scale: newScale
    // };
    this.transform = {
      x: center.x - ratio * (center.x - oldTransformX),
      y: center.y - ratio * (center.y - oldTransformY),
      scale: newScale
    }
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
