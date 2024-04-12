!(function (global) {
  const CURSOR_MAP = {
    topLeft: "nw-resize",
    top: "n-resize",
    topRight: "ne-resize",
    left: "w-resize",
    right: "e-resize",
    bottomLeft: "sw-resize",
    bottom: "s-resize",
    bottomRight: "se-resize",
  };

  const ROTATE_CURSOR_LIST = [
    CURSOR_MAP.topLeft,
    CURSOR_MAP.top,
    CURSOR_MAP.topRight,
    CURSOR_MAP.right,
    CURSOR_MAP.bottomRight,
    CURSOR_MAP.bottom,
    CURSOR_MAP.bottomLeft,
    CURSOR_MAP.left,
  ];

  const SIZER_CURSOR_LIST = [
    CURSOR_MAP.topLeft,
    CURSOR_MAP.top,
    CURSOR_MAP.topRight,
    CURSOR_MAP.left,
    CURSOR_MAP.right,
    CURSOR_MAP.bottomLeft,
    CURSOR_MAP.bottom,
    CURSOR_MAP.bottomRight,
  ];

  function getRotatedPoint(point, cos, sin, center) {
    const diffX = point.x - center.x;
    const diffY = point.y - center.y;
    const dx = diffX * cos - diffY * sin;
    const dy = diffY * cos + diffX * sin;
    return { x: center.x + dx, y: center.y + dy };
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function toRadians(deg) {
    return (Math.PI * deg) / 180;
  }

  function union(index, bounds, dx, dy) {
    let { top, left, right, bottom } = bounds;
    if (index > 4) {
      bottom = Math.round(bottom + dy);
    } else if (index < 3) {
      top = Math.round((top + dy));
    }
    if (index === 0 || index === 3 || index === 5) {
      left = Math.round((left + dx));
    } else if (index === 2 || index === 4 || index === 7) {
      right = Math.round((right + dx));
    }
    const nextWidth = right - left;
    const nextHeight = bottom - top;
    return {
      x: left,
      y: top,
      width: nextWidth,
      height: nextHeight,
    };
  }

  function getNewLayoutData(bounds, diff, directionId, rotation) {
    const alpha = toRadians(rotation);
    const {
      centerX: oldCenterX,
      centerY: oldCenterY,
    } = bounds;
    const { x: diffX, y: diffY } = diff;
    let cos = Math.cos(-alpha);
    let sin = Math.sin(-alpha);
    const dx = (cos * diffX - sin * diffY);
    const dy = (sin * diffX + cos * diffY);
    const newBounds = union(directionId, bounds, dx, dy);
    cos = Math.cos(alpha);
    sin = Math.sin(alpha);
    const newCenter = {
      x: newBounds.x + newBounds.width / 2,
      y: newBounds.y + newBounds.height / 2,
    };
    const centerDiffX = newCenter.x - oldCenterX;
    const centerDiffY = newCenter.y - oldCenterY;
    diff = {
      x: cos * centerDiffX - sin * centerDiffY - centerDiffX,
      y: sin * centerDiffX + cos * centerDiffY - centerDiffY,
    };
    newBounds.x += diff.x;
    newBounds.y += diff.y;
    return {
      x: Math.round(newBounds.x * 100) / 100,
      y: Math.round(newBounds.y * 100) / 100,
      width: Math.round(newBounds.width * 100) / 100,
      height: Math.round(newBounds.height * 100) / 100,
    };
  }

  function addStyles(element, styles) {
    if (!element instanceof HTMLElement || !styles) return;
    const cssText = Object.keys(styles).reduce((total, key) => {
      const styleText = `${key}:${styles[key]}`;
      return `${total}${styleText};`;
    }, "");
    element.style.cssText = cssText;
  }

  function createElement(tag = "div") {
    return document.createElement(tag);
  }

  function Rotatable(x, y, parent) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.element = null;
    this.parent = parent;
    this.init();
  }

  Rotatable.prototype = {
    init: function () {
      const element = createElement();
      this.element = element;
      this.bindEvents();
      this.render();
    },
    updatePosition: function (x, y) {
      this.x = x;
      this.y = y;
      this.render();
    },
    render: function () {
      const { x, y, width, height, element } = this;
      const posX = x - width / 2;
      const posY = y - height / 2;
      element.classList.add("rotation");
      addStyles(element, {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${posX}px,${posY}px)`,
      });
    },
    bindEvents: function () {
      const { element, parent } = this;
      element.addEventListener("mousedown", function (e) {
        e.stopPropagation()
        const center = parent.getCenterPosition()
        const handleMove = (ev) => {
          const { pageX: endX, pageY: endY } = ev
          const diffX = center.x - endX
          const diffY = center.y - endY
          // const currentAlpha = Math.atan2(diffY, diffX) * 180 / Math.PI - 90
          let currentAlpha = 0
          if (diffX !== 0) {
            currentAlpha = Math.atan(diffY / diffX) * 180 / Math.PI + 90
          } else {
            currentAlpha = diffY < 0 ? 180 : 0
          }
          diffX > 0 && (currentAlpha -= 180)
          parent.updateRotation(Math.round(currentAlpha))
        }
        const handleUp = () => {
          window.removeEventListener('mousemove', handleMove)
          window.removeEventListener('mouseup', handleUp)
        }
        window.addEventListener('mousemove', handleMove)
        window.addEventListener('mouseup', handleUp)
      });
    },
  };

  function Sizer(id, x, y, cursor, parent) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = 18;
    this.height = 18;
    this.cursor = cursor;
    this.parent = parent;
    this.element = null;
    this.init();
  }

  Sizer.prototype = {
    init: function () {
      const element = createElement();
      this.element = element;
      this.bindEvents();
      this.render();
    },
    updatePosition: function (x, y) {
      this.x = x;
      this.y = y;
      this.render();
    },
    updateCursor: function (cursor) {
      this.cursor = cursor;
      this.render();
    },
    render: function () {
      const { x, y, width, height, element, cursor } = this;
      const pointX = x - width / 2;
      const pointY = y - height / 2;
      element.classList.add("sizer");
      addStyles(element, {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${pointX}px,${pointY}px)`,
        cursor: cursor,
      });
    },
    bindEvents: function () {
      const { id, element, parent } = this;
      element.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        const { pageX: startX, pageY: startY } = e;
        const { rotation } = parent.transform;
        const bounds = parent.getBoundingRect();
        const center = parent.getCenterPosition();
        const oldBounds = {
          ...bounds,
          centerX: center.x,
          centerY: center.y,
        };
        const handleMove = (ev) => {
          ev.stopPropagation();
          const { pageX: endX, pageY: endY } = ev;
          const diff = {
            x: endX - startX,
            y: endY - startY,
          };
          const layoutInfo = getNewLayoutData(
            oldBounds,
            diff,
            id,
            rotation
          );
          parent.updateBounds(layoutInfo);
        };
        const handleUp = () => {
          window.removeEventListener("mousemove", handleMove);
          window.removeEventListener("mouseup", handleUp);
        };
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
      });
    },
  };

  function Moveable(config) {
    const { container: root, x, y, width, height, rotate } = config;
    this.bounds = {
      width: width || 100,
      height: height || 100,
      x: x || 0,
      y: y || 0,
    };
    this.transform = {
      rotation: rotate || 0,
    };
    this.root = root || document.body;
    this.rotatable = null;
    this.sizers = [];
    this.container = null;
    this.rectElement = null;
    this.init();
  }

  Moveable.prototype = {
    init: function () {
      const container = createElement("div");
      const rectElement = createElement("div");
      rectElement.classList.add("moveable");
      const rotatable = new Rotatable(0, 0, this);
      this.createSizers();
      container.appendChild(rotatable.element);
      this.sizers.forEach((sizer) => {
        container.appendChild(sizer.element);
      });
      container.appendChild(rectElement);
      this.rotatable = rotatable;
      this.rectElement = rectElement;
      this.container = container;
      this.render();
      this.root.appendChild(container);
    },
    createSizers: function () {
      const self = this;
      const sizers = [];
      SIZER_CURSOR_LIST.map((cursor, index) => {
        sizers.push(new Sizer(index, 0, 0, cursor, self));
      });
      this.sizers = sizers;
    },
    getCenterPosition: function () {
      const { x, y, width, height } = this.bounds;
      return { x: x + width / 2, y: y + height / 2 };
    },
    getBoundingRect: function () {
      const { x, y, width, height } = this.bounds;
      return {
        x,
        y,
        left: x,
        right: x + width,
        top: y,
        bottom: y + height,
        width,
        height,
      };
    },
    updateBounds: function (bounds) {
      const { x, y, width, height } = bounds;
      this.bounds = { x, y, width, height };
      this.render();
    },
    updateRotation: function(rotation) {
      this.transform.rotation = rotation
      this.render()
    },
    render: function() {
      this.updateSizerPosition()
      this.updateRotatablePosition()
      this.redraw()
    },
    redraw: function () {
      const { rectElement, container, bounds, transform } = this;
      const { x, y, width, height } = bounds;
      const { rotation } = transform

      addStyles(rectElement, {
        width: `${width}px`,
        height: `${height}px`,
        'transform-origin': 'center',
        transform: `rotate(${rotation}deg)`
      });
      addStyles(container, {
        position: "absolute",
        transform: `translate3d(${x}px,${y}px,0)`,
      });
    },
    updateSizerPosition: function () {
      const { sizers, transform: { rotation }} = this;
      const center = this.getCenterPosition()
      const { x, y, right, bottom } = this.getBoundingRect()
      const cursorListSize = ROTATE_CURSOR_LIST.length;
      const alpha = toRadians(rotation);
      const cursorIndexIncrement = Math.round((alpha * 4) / Math.PI);
      let cosValue = Math.cos(alpha);
      let sinValue = Math.sin(alpha);
      const sizerPoints = [
        {
          position: { x, y },
          cursorIndex: mod(cursorIndexIncrement, cursorListSize),
        },
        {
          position: { x: center.x, y },
          cursorIndex: mod(cursorIndexIncrement + 1, cursorListSize),
        },
        {
          position: { x: right, y },
          cursorIndex: mod(cursorIndexIncrement + 2, cursorListSize),
        },
        {
          position: { x, y: center.y },
          cursorIndex: mod(cursorIndexIncrement + 7, cursorListSize),
        },
        {
          position: { x: right, y: center.y },
          cursorIndex: mod(cursorIndexIncrement + 3, cursorListSize),
        },
        {
          position: { x, y: bottom },
          cursorIndex: mod(cursorIndexIncrement + 6, cursorListSize),
        },
        {
          position: { x: center.x, y: bottom },
          cursorIndex: mod(cursorIndexIncrement + 5, cursorListSize),
        },
        {
          position: { x: right, y: bottom },
          cursorIndex: mod(cursorIndexIncrement + 4, cursorListSize),
        },
      ];
      sizerPoints.forEach((point, index) => {
        const sizer = sizers[index];
        const { position, cursorIndex } = point;
        const rotatedPoint = getRotatedPoint(
          position,
          cosValue,
          sinValue,
          center
        );
        sizer.updatePosition(rotatedPoint.x - x, rotatedPoint.y - y);
        sizer.updateCursor(ROTATE_CURSOR_LIST[cursorIndex]);
      });
    },
    updateRotatablePosition: function() {
      const {
        rotatable,
        transform: { rotation }
      } = this;
      const { x, y, top } = this.getBoundingRect()
      const center = this.getCenterPosition()
      const alpha = toRadians(rotation)
      const cosValue = Math.cos(alpha)
      const sinValue = Math.sin(alpha)
      const rotatablePoint = getRotatedPoint({ x: center.x, y: top - 16 }, cosValue, sinValue, center);
      rotatable.updatePosition(rotatablePoint.x - x, rotatablePoint.y - y)
    }
  };

  global.Moveable = Moveable;
})(window);
