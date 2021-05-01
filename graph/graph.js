/**
 * 简易图形编辑：旨在学习相关思想
 * - 支持拖拽、点击创建图形，只支持rect
 * - 支持快捷键delete删除图形
 * - 支持图形拖拽改变大小
 * - 支持图形画布内拖动
 * - 支持输入信息
 * - 支持简易连线逻辑
 * note: 图形旋转后改变大小、位置逻辑相对复杂，其背后涉及到较为复杂的数学计算，待研究补充
 */
 (function(root) {

  let uid = 0;
  const dragFlag = {
    isRotateDrag: false,
    isDragInCanvas: false,
    isResizeDrag: false,
    isEditing: false
  };

  const TEMPLATE = `
    <aside class="side">
      <div class="graph-container">
        <svg class="svg">
          <g><rect x="1.44" y="7.68" width="28.8" height="14.4" fill="#ffffff" stroke="#000000" stroke-width="1.3" pointer-events="all"></rect></g>
        </svg>
      </div>
      <div class="graph-container">
        <svg class="svg">
          <g><rect x="1.44" y="7.68" width="28.8" height="14.4" rx="2.16" ry="2.16" fill="#ffffff" stroke="#000000" stroke-width="1.3" pointer-events="all"></rect></g>
        </svg>
      </div>
    </aside>
    <main class="main">
      <div class="resize-bar"></div>
      <div class="view">
        <div class="container">
          <svg id="canvas">
            <g>
              <g></g>
              <g></g>
              <g></g>
            </g>
          </svg>
        </div>
      </div>
    </main>
    <div id="shape--draging"></div>
  `;

  const RESIZE_DIR = {
    topLeft: 'nw-resize',
    topMid: 'n-resize',
    topRight: 'ne-resize',
    midLeft: 'w-resize',
    midRight: 'e-resize',
    bottomLeft: 'sw-resize',
    bottomMid: 's-resize',
    bottomRight: 'se-resize',
    rotate: 'crosshair'
  };

  const SIDE = {
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right'
  };

  const IMAGE_SVG_URL = {
    resize: 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxOHB4IiBoZWlnaHQ9IjE4cHgiIHZlcnNpb249IjEuMSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjUiIHN0cm9rZT0iI2ZmZiIgZmlsbD0iIzI5YjZmMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+',
    rotate: 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBzdHJva2U9IiMyOWI2ZjIiIGZpbGw9IiMyOWI2ZjIiIGQ9Ik0xNS41NSA1LjU1TDExIDF2My4wN0M3LjA2IDQuNTYgNCA3LjkyIDQgMTJzMy4wNSA3LjQ0IDcgNy45M3YtMi4wMmMtMi44NC0uNDgtNS0yLjk0LTUtNS45MXMyLjE2LTUuNDMgNS01LjkxVjEwbDQuNTUtNC40NXpNMTkuOTMgMTFjLS4xNy0xLjM5LS43Mi0yLjczLTEuNjItMy44OWwtMS40MiAxLjQyYy41NC43NS44OCAxLjYgMS4wMiAyLjQ3aDIuMDJ6TTEzIDE3Ljl2Mi4wMmMxLjM5LS4xNyAyLjc0LS43MSAzLjktMS42MWwtMS40NC0xLjQ0Yy0uNzUuNTQtMS41OS44OS0yLjQ2IDEuMDN6bTMuODktMi40MmwxLjQyIDEuNDFjLjktMS4xNiAxLjQ1LTIuNSAxLjYyLTMuODloLTIuMDJjLS4xNC44Ny0uNDggMS43Mi0xLjAyIDIuNDh6Ii8+PC9zdmc+',
    connect: 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI1cHgiIGhlaWdodD0iNXB4IiB2ZXJzaW9uPSIxLjEiPjxwYXRoIGQ9Im0gMCAwIEwgNSA1IE0gMCA1IEwgNSAwIiBzdHJva2U9IiMyOWI2ZjIiLz48L3N2Zz4='
  };

  // 图像绘制到画布上的初始尺寸
  const SHAPE_SIZE = {
    RECT: {
      width: 120,
      height: 60
    },
    IMAGE: 18,
  };

  const getUId = function() {
    uid += 1;
    return uid;
  };
  // 自定义事件
  const dispatchEvent = function(element, type, data) {
    let event;
    if (isFunction(Event) && isFunction(CustomEvent)) {
      event = new CustomEvent(type, {
        detail: data,
        bubbles: true,
        cancelable: true
      });
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(type, true, true, data);
    }
    return element.dispatchEvent(event);
  };

  const hiddenDom = function(node) {
    if (!node) return;
    node.style.display = 'none';
  }

  const displayDom = function(node) {
    if (!node) return;
    const displayRegex = /display:\s+none;?/gi;
    const cssText = node.style.cssText;
    node.style.cssText = cssText.replace(displayRegex, '').trim();
  }

  const createSVGElement = function(tag) {
    if (!tag) return;
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  };

  const isSVGElement = function(node) {
    return node instanceof SVGElement;
  };

  const getTargetGNodeInSVG = function(node) {
    if (!node) return;
    let target = null;
    if (isSVGElement(node)) {
      let current = node;
      while (current) {
        const tagName = current.tagName;
        if (tagName === 'svg') {
          target = current;
          break;
        }
        current = current.parentNode;
      }
    } else if (node.className.indexOf('graph-container') >= 0) {
      target = node.children[0];
    }
    if (!target) return;
    const gNode = target.children[0];
    return gNode && gNode.tagName === 'g' ? gNode : null;
  };

  const isElement = function(element) {
    return element instanceof Element && element.nodeType === 1;
  };

  const isFunction = function(fn) {
    return typeof fn === 'function';
  };

  const isObject = function(value) {
    return value && typeof value === 'object';
  };

  const isNumber = function(value) {
    return typeof value === 'number' && !Number.isNaN(value);
  }

  const setAttributes = function(element, attrs) {
    if (!isObject(attrs) || !(isElement(element) || isSVGElement(element))) {
      return;
    }
    for (let key of Object.keys(attrs)) {
      element.setAttribute(key, attrs[key]);
    }
  };

  const removeAttributes = function(element, keys) {
    if (!Array.isArray(keys) || !(isElement(element) || isSVGElement(element))) {
      return;
    }
    for (let key of keys) {
      element.removeAttribute(key);
    }
  };

  const setStyles = function(element, styles) {
    if (!('style' in element) || !isObject(styles)) return;
    let cssText = '';
    for (let key of Object.keys(styles)) {
      const value = styles[key];
      cssText += `${key}:${value};`;
    }
    element.style.cssText = cssText;
  };

  const setKeys = function(object, map) {
    if (!isObject(map) || !isObject(object)) return;
    for (let key of Object.keys(map)) {
      object[key] = map[key];
    }
  };

  const getRotatedPoint = function(pt, sin, cos, c) {
    const x = pt.x - c.x;
    const y = pt.y - c.y;
    return {
      x: x * cos - y * sin + c.x,
      y: y * cos + x * sin + c.y
    };
  };

  const getImagePoint = function(point) {
    const imageSize = SHAPE_SIZE.IMAGE;
    return {
      x: Math.floor(point.x - imageSize / 2),
      y: Math.floor(point.y - imageSize / 2)
    };
  };

  const mod = function(n, m) {
    return ((n % m) + m) % m;
  };

  // 依据旋转角度动态计算resizebox每个点的坐标
  const computeResizeImagePosition = function(x, y, width, height, angle = 0) {
    const r = x + width;
    const b = y + height;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const ct = { x: cx, y: cy };
    const imageHalfSize = SHAPE_SIZE.IMAGE / 2;
    const crs = [
      RESIZE_DIR.topLeft,
      RESIZE_DIR.topMid,
      RESIZE_DIR.topRight,
      RESIZE_DIR.midRight,
      RESIZE_DIR.bottomRight,
      RESIZE_DIR.bottomMid,
      RESIZE_DIR.bottomLeft,
      RESIZE_DIR.midLeft
    ];
    const crsLen = crs.length;
    const alpha = Math.PI * angle / 180;
    var cos = Math.cos(alpha);
    var sin = Math.sin(alpha);
    const da = Math.round(alpha * 4 / Math.PI);
    return {
      [crs[mod(0 + da, crsLen)]]: {
        ...getImagePoint(getRotatedPoint({x, y}, sin, cos, ct))
      },
      [crs[mod(1 + da, crsLen)]]: {
        ...getImagePoint(getRotatedPoint({x: cx, y}, sin, cos, ct))
      },
      [crs[mod(2 + da, crsLen)]]: {
        ...getImagePoint(getRotatedPoint({x: r, y}, sin, cos, ct))
      },
      [crs[mod(7 + da, crsLen)]]: {
        ...getImagePoint(getRotatedPoint({x, y: cy}, sin, cos, ct)),
      },
      [crs[mod(3 + da, crsLen)]]: {
        ...getImagePoint(getRotatedPoint({x: r, y: cy}, sin, cos, ct))
      },
      [crs[mod(6 + da, crsLen)]]: {
        ...getImagePoint(getRotatedPoint({x, y: b}, sin, cos, ct))
      },
      [crs[mod(5 + da, crsLen)]]: {
        ...getImagePoint(getRotatedPoint({x: cx, y: b}, sin, cos, ct))
      },
      [crs[mod(4 + da, crsLen)]]: {
        ...getImagePoint(getRotatedPoint({x: r, y: b}, sin, cos, ct))
      },
      // [RESIZE_DIR.rotate]: {
      //   x: x + width + 4,
      //   y: y - imageHalfSize * 2 - 4
      // }
    };
  };

  const registerDrag = function(element, onDragStart, onDraging, onDragEnd, doc) {
    if (!isElement(element) || (doc && !isElement(doc))) return;
    doc = doc || document;
    const draging = function(e) {
      isFunction(onDraging) && onDraging(e);
    }
    const dragEnd = function(e) {
      isFunction(onDragEnd) && onDragEnd(e);
      doc.removeEventListener('mousemove', draging);
      doc.removeEventListener('mouseup', dragEnd);
    }
    element.addEventListener('mousedown', function(event) {
      event.preventDefault();
      isFunction(onDragStart) && onDragStart(event);
      doc.addEventListener('mousemove', draging);
      doc.addEventListener('mouseup', dragEnd);
    });
  };

  const bindEventsOfResizeBar = function() {
    const graphInstance = this;
    let isDragging = false, sideWidth = null, startX = null;
    const minSideWidth = 0, maxSideWidth = 500;
    const { sideNode, contentNode } = graphInstance;
    const resizeBarNode = contentNode.querySelector('.resize-bar');
    registerDrag(
      resizeBarNode,
      function onDragStart(e) {
        isDragging = true;
        startX = e.pageX;
        sideWidth = sideNode.offsetWidth;
      },
      function onDraging(e) {
        if (!isDragging) return;
        const currentWidth = sideWidth + e.pageX - startX;
        if (currentWidth < minSideWidth || currentWidth > maxSideWidth) return;
        sideNode.style.width = `${currentWidth}px`;
        contentNode.style.marginLeft = `${currentWidth}px`;
      },
      function onDragEnd() {
        isDragging = false;
        graphInstance.updateCanvasData();
      }
    );
  };

  const bindEventsOfAside = function() {
    const graphInstance = this;
    const { sideNode, contentNode, canvasData } = graphInstance;
    // 同一元素mousedown mouseup click事件顺序导致，如果click会触发拖拽事件
    let isDragEvent = true, dragPositionX = null,
      dragPositionY = null, svgTagName = null,
      initShapeSize = null;
    const dragingShape = document.getElementById('shape--draging');
    const { left: contentLeft } = contentNode.getBoundingClientRect();

    registerDrag(
      sideNode,
      function onDragStart(e) {
        const gNode = getTargetGNodeInSVG(e.target);
        if (!gNode) return;
        isDragEvent = false;
        svgTagName = gNode.children[0].tagName;
        initShapeSize = svgTagName === 'rect'
          ? SHAPE_SIZE.RECT
          : { width: 0, height: 0 };
        dragingShape.style.display = 'block';
      },
      function onDraging(e) {
        isDragEvent = true;
        const style = dragingShape.style;
        const posX = e.pageX;
        const posY = e.pageY;
        dragPositionX = posX;
        dragPositionY = posY;
        style.zIndex = 1;
        // 拖动时鼠标处于图形框中心
        style.top = `${posY - initShapeSize.height / 2}px`;
        style.left = `${posX - initShapeSize.width / 2}px`;
      },
      function onDragEnd() {
        setStyles(dragingShape, { display: 'none', top: 0, left: 0});
        let { left: posX, top: posY } = canvasData;
        // 放弃side DOM上click事件，使用标识符来判断做处理
        if (isDragEvent) {
          if (dragPositionX < contentLeft) return;
          const limitRange = [
            posX + initShapeSize.width / 2,
            posY + initShapeSize.height / 2
          ];
          // 拖拽矩形长度和宽度，注意svg默认坐标系统
          if (dragPositionX >= limitRange[0] && dragPositionY >= limitRange[1]) {
            posX = dragPositionX - limitRange[0];
            posY = dragPositionY - limitRange[1];
          }
        } else {
          posX = initShapeSize.width
        }
        isDragEvent = false;
        graphInstance.createRectShape(svgTagName, {
          x: posX,
          y: posY,
          width: initShapeSize.width,
          height: initShapeSize.height
        });
      }
    );
  };

  const bindEventsOfContent = function() {
    const graphInstance = this;
    const { canvasNode } = graphInstance;
    let mouseoverShape = null;
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });

    // 处理选择shape后取消
    canvasNode.addEventListener('click', function(e) {
      e.stopPropagation();
      graphInstance.destoryEditText();
      const target = e.target;
      const tagName = target.tagName;
      if (!isSVGElement(target) || tagName === 'svg') {
        graphInstance.destoryResizeBox();
      }
    });

    // 鼠标移到图形上事件
    canvasNode.addEventListener('mousemove', function(e) {
      e.preventDefault();
      if (graphInstance.resizeBox) {
        mouseoverShape = null;
        return;
      };
      if (graphInstance.connectBox && mouseoverShape) {
        const { pageX, pageY } = e;
        const { top, left } = graphInstance.canvasData;
        const { x, y, width, height } = mouseoverShape;
        // 扩展mouse离开图形范围边界
        const range = [ x - 10, x + width + 10, y - 10, y + height + 10];
        const offsetX = pageX - left, offsetY = pageY - top;
        const isOutsideX = offsetX < range[0] || offsetX > range[1];
        const isOutsideY = offsetY < range[2] || offsetY > range[3];
        if (isOutsideX || isOutsideY) {
          graphInstance.destoryConnectBox();
          mouseoverShape = null;
        }
      }
      const target = e.target;
      if (!isSVGElement(target)) return;
      const gNode = target.parentNode;
      const id = parseInt(gNode.getAttribute('id'), 10);
      if (!isNumber(id)) return;
      graphInstance.destoryConnectBox();
      mouseoverShape = graphInstance.getShapeFromShapeMap(id);
      const { x, y, width, height } = mouseoverShape;
      graphInstance.createConnectBox(x, y, width, height);
    });
  };

  const bindEventsOfShape = function() {
    const graphInstance = this;
    const { shapeContainerGNode, resizeContainerGNode } = graphInstance;
    // shape选择后创建resize box
    document.addEventListener('createResizeBox', function(event) {
      const { shapeInstance } = event.detail;
      graphInstance.destoryConnectBox();
      graphInstance.createResizeBox(shapeInstance);
    });

    // shape双击后创建输入框
    document.addEventListener('createEditText', function(event) {
      const { x, y, width, height, initTextContent } = event.detail;
      const { canvasData: { top, left }, sideNode } = graphInstance;
      const sideWidth = sideNode.offsetWidth;
      const pos = [left - sideWidth + x - 2, y + top + height / 2 - 10];
      graphInstance.createEditText(
        pos[0], pos[1], width - 16, Math.round(height / 3),
        initTextContent
      );
    });

    // 删除指定shape
    document.addEventListener('destoryShape', function(event) {
      const { id, shapeNode, textNode } = event.detail;
      graphInstance.destoryResizeBox();
      shapeContainerGNode.removeChild(shapeNode);
      textNode && shapeContainerGNode.removeChild(textNode);
      graphInstance.shapeMap.delete(id);
    });

    // 插入或删除textbox node
    document.addEventListener('insertOrRemoveTextNode', function(event) {
      const { type, node } = event.detail;
      if (type === 0) {
        node && shapeContainerGNode.appendChild(node);
      } else if (type === 1) {
        node && shapeContainerGNode.removeChild(node);
      }
    });

    // shape拖拽
    document.addEventListener('dragShape', function(event) {
      let { startX, startY, shapeInstance } = event.detail;
      const canvasData = graphInstance.canvasData;
      graphInstance.destoryConnectBox();
      graphInstance.hiddenResizePoints();
      graphInstance.destoryEditText();
      const onDraging = function(e) {
        if (shapeInstance.getShapeStatus('edit')) return;
        shapeInstance.activeShapeStatus('drag');
        const { pageX, pageY } = e;
        // 简单处理顶部边界
        const isRender = pageX >= canvasData.left && pageY >= canvasData.top;
        if (!isRender) return;
        const xRatio = pageX - startX;
        const yRatio = pageY - startY;
        const { x, y } = shapeInstance;
        const current = [x + xRatio, y + yRatio];
        const newX = current[0] <= 0 ? 0 : current[0];
        const newY = current[1] <= 0 ? 0 : current[1];
        shapeInstance.updatePositionAndSize(newX, newY);
        graphInstance.resizeResizeBox(newX, newY);
        startX = pageX;
        startY = pageY;
      };
      const onDragEnd = function(e) {
        document.removeEventListener('mousemove', onDraging);
        document.removeEventListener('mouseup', onDragEnd);
        if (!shapeInstance.getShapeStatus('drag')) return;
        graphInstance.createResizeBox(shapeInstance);
      };
      document.addEventListener('mousemove', onDraging);
      document.addEventListener('mouseup', onDragEnd);
    });

    // resize shape
    document.addEventListener('resizeShape', function(event) {
      const detail = event.detail;
      const { imageNode, targetShape } = detail;
      const { width: canvasWidth, height: canvasHeight } = graphInstance.canvasData;
      const minLeft = 0, minTop = 0, rightLimit = minLeft + canvasWidth,
            bottomLimit = minTop + canvasHeight;
      let { startX, startY, action } = detail;
      let isResizeDrag = false;

      const onDraging = function(e) {
        const { pageX, pageY } = e;
        let { x: left, y: top, width, height } = targetShape;
        let tempAction = action, isRender = true;
        const right = left + width;
        const bottom = top + height;
        const offset = {
          x: pageX - startX,
          y: pageY - startY
        };
        isResizeDrag = true;
        switch (tempAction) {
          // 左边
          case RESIZE_DIR.midLeft:
            // 左边框到达边界后继续向左滑动不需要计算和渲染
            if (offset.x <= 0 && left <= minLeft) {
              isRender = false;
              break;
            }
            graphInstance.checkBound(targetShape, SIDE.left, offset);
            width -= offset.x;
            left += offset.x;
            if (width < 0) {
              tempAction = RESIZE_DIR.midRight;
              width = -width;
              left -= width;
            }
            break;
          // 右边
          case RESIZE_DIR.midRight:
            if (offset.x >= 0 && right >= rightLimit) {
              isRender = false;
              break;
            }
            graphInstance.checkBound(targetShape, SIDE.right, offset);
            width += offset.x;
            if (width < 0) {
              tempAction = RESIZE_DIR.midLeft;
              width = -width;
              left -= width;
            }
            break;
          // 顶边
          case RESIZE_DIR.topMid:
            if (offset.y <= 0 && top <= minTop) {
              isRender = false;
              break;
            }
            graphInstance.checkBound(targetShape, SIDE.top, offset);
            height -= offset.y;
            top += offset.y;
            if (height < 0) {
              tempAction = RESIZE_DIR.bottomMid;
              height = -height;
              top -= height;
            }
            break;
          // 底边
          case RESIZE_DIR.bottomMid:
            if (offset.y <= 0 && bottom >= bottomLimit) {
              isRender = false;
              break;
            }
            graphInstance.checkBound(targetShape, SIDE.bottom, offset);
            height += offset.y;
            if (height < 0) {
              tempAction = RESIZE_DIR.topMid;
              height = -height;
              top -= height;
            }
            break;
          // 左上角
          case RESIZE_DIR.topLeft:
            if (offset.x <= 0 && offset.y <= 0 && (top <= minTop || left <= minLeft)) {
              isRender = false;
              break;
            }
            graphInstance.checkBound(targetShape, SIDE.top, offset);
            graphInstance.checkBound(targetShape, SIDE.left, offset);
            width -= offset.x;
            height -= offset.y;
            top += offset.y;
            left += offset.x;
            if (width < 0 && height < 0) {
              tempAction = RESIZE_DIR.bottomRight;
              height = -height;
              width = -width;
              top -= height;
              left -= width;
            } else if (width < 0) {
              tempAction = RESIZE_DIR.topRight;
              width = -width;
              left -= width;
            } else if (height < 0) {
              tempAction = RESIZE_DIR.bottomLeft;
              height = -height;
              top -= height;
            }
            break;
          // 右上角
          case RESIZE_DIR.topRight:
            if (offset.x >= 0 && offset.y <= 0 && (right >= rightLimit || top <= minTop)) {
              isRender = false;
              break;
            }
            graphInstance.checkBound(targetShape, SIDE.top, offset);
            graphInstance.checkBound(targetShape, SIDE.right, offset);
            width += offset.x;
            height -= offset.y;
            top += offset.y;
            if (width < 0 && height < 0) {
              tempAction = RESIZE_DIR.bottomLeft;
              height = -height;
              width = -width;
              top -= height;
              left -= width;
            } else if (width < 0) {
              tempAction = RESIZE_DIR.topLeft;
              width = -width;
              left -= width;
            } else if (height < 0) {
              tempAction = RESIZE_DIR.bottomRight;
              height = -height;
              top -= height;
            }
            break;
          // 左下角
          case RESIZE_DIR.bottomLeft:
            if (offset.x <= 0 && offset.y >= 0 && (left <= minLeft || bottom >= bottomLimit)) {
              isRender = false;
              break;
            }
            graphInstance.checkBound(targetShape, SIDE.bottom, offset);
            graphInstance.checkBound(targetShape, SIDE.left, offset);
            width -= offset.x;
            height += offset.y;
            left += offset.x;
            if (width < 0 && height < 0) {
              tempAction = RESIZE_DIR.topRight;
              height = -height;
              width = -width;
              top -= height;
              left -= width;
            } else if (width < 0) {
              tempAction = RESIZE_DIR.bottomRight;
              width = -width;
              left -= width;
            } else if (height < 0) {
              tempAction = RESIZE_DIR.topLeft;
              height = -height;
              top -= height;
            }
            break;
          // 右下角
          case RESIZE_DIR.bottomRight:
            if (offset.x >= 0 && offset.y >= 0 && (right >= rightLimit || bottom >= bottomLimit)) {
              isRender = false;
              break;
            }
            graphInstance.checkBound(targetShape, SIDE.bottom, offset);
            graphInstance.checkBound(targetShape, SIDE.right, offset);
            width += offset.x;
            height += offset.y;
            if (width < 0 && height < 0) {
              tempAction = RESIZE_DIR.topLeft;
              height = -height;
              width = -width;
              top -= height;
              left -= width;
            } else if (width < 0) {
              tempAction = RESIZE_DIR.bottomLeft;
              width = -width;
              left -= width;
            } else if (height < 0) {
              tempAction = RESIZE_DIR.topRight;
              height = -height;
              top -= height;
            }
            break;
        }
        if (isRender) {
          targetShape.updatePositionAndSize(left, top, width, height);
          const pointMap = computeResizeImagePosition(left, top, width, height);
          const point = pointMap[action];
          setAttributes(imageNode, { x: point.x, y: point.y });
          graphInstance.updateEditTextPositionAndSize(targetShape);
          action = tempAction;
        }
        startX = pageX;
        startY = pageY;
      };
      const onDragEnd = function() {
        document.removeEventListener('mousemove', onDraging);
        document.removeEventListener('mouseup', onDragEnd);
        if (!isResizeDrag) return;
        graphInstance.createResizeBox(targetShape);
      };
      document.addEventListener('mousemove', onDraging);
      document.addEventListener('mouseup', onDragEnd);
    });

    // connect shape
    document.addEventListener('connectLine', function(event) {
      const {
        startPoint, startX, startY, direction,
        limit: { xLimit, yLimit }
      } = event.detail;
      const { top, left } = graphInstance.canvasData;
      const onDraging = function(e) {
        const { pageX, pageY } = e;
        const svgPointX = pageX - left;
        const svgPointY = pageY - top;
        if (svgPointX >= xLimit[0] && svgPointX <= xLimit[1]) {
          return;
        }
      };
      const onDragEnd = function(e) {
        document.removeEventListener('mousemove', onDraging);
        document.removeEventListener('mouseup', onDragEnd);
      };
      document.addEventListener('mousemove', onDraging);
      document.addEventListener('mouseup', onDragEnd);
    });
  };

  function Graph(element) {
    if (!isElement(element)) return;
    this.element = element;
    this.resizeBox = null;
    this.connectBox = null;
    this.rotateAngle = null;
    this.sideNode = null;
    this.canvasNode = null;
    this.contentNode = null;
    this.shapeContainerGNode = null;
    this.resizeContainerGNode = null;
    this.connectContainerGNode = null;
    this.editText = null;
    this.shapeMap = new Map();
    this.canvasData = { top: 0, left: 0, width: 0, height: 0 };
    this.init();
  }

  Graph.prototype = {
    init: function() {
      const element = this.element;
      element.innerHTML = TEMPLATE;
      const sideNode = element.querySelector('.side');
      const contentNode = element.querySelector('.main');
      const canvasNode = element.querySelector('#canvas');
      const rootGNode = canvasNode.children[0];
      const [
        shapeContainerGNode,
        resizeContainerGNode,
        connectContainerGNode
      ] = rootGNode.children;
      this.canvasNode = canvasNode;
      this.sideNode = sideNode;
      this.contentNode = contentNode;
      this.shapeContainerGNode = shapeContainerGNode;
      this.resizeContainerGNode = resizeContainerGNode;
      this.connectContainerGNode = connectContainerGNode;
      this.updateCanvasData();
      this.bind();
    },
    bind: function() {
      bindEventsOfResizeBar.call(this);
      bindEventsOfAside.call(this);
      bindEventsOfContent.call(this);
      bindEventsOfShape.call(this);
    },
    createEditText: function(x, y, width, height, initTextContent) {
      const editTextNode = document.createElement('div');
      setAttributes(editTextNode, {
        id: 'edit-container',
        contenteditable: true
      });
      setStyles(editTextNode, {
        top: `${y}px`,
        left: `${x}px`,
        width: `${width}px`,
        height: `${height}px`
      });
      if (!!initTextContent) {
        editTextNode.innerText = initTextContent;
      }
      this.canvasNode.parentNode.appendChild(editTextNode);
      editTextNode.focus();
      this.editText = editTextNode;
      this.bindEditEndEvent();
    },
    destoryEditText() {
      const editText = this.editText;
      if (!editText) return;
      this.editText = null;
      this.canvasNode.parentNode.removeChild(editText);
    },
    updateEditTextPositionAndSize: function(shape) {
      const editText = this.editText;
      if (!editText) return;
      const {
        canvasData: { top, left },
        sideNode,
        selectedShape: { x, y, width, height }
      } = this;
      const sideWidth = sideNode.offsetWidth;
      const pos = [left - sideWidth + x - 2, y + top];
      setStyles(editText, {
        top: `${pos[1]}px`,
        left: `${pos[0]}px`,
        width: `${width - 16}px`,
        height: `${height}px`
      });
    },
    bindEditEndEvent: function() {
      const editText = this.editText;
      if (!editText) return;
      editText.addEventListener('blur', e => {
        dispatchEvent(document, 'createOrDestoryTextBox', {
          textContent: e.target.innerText.trim()
        });
        this.destoryEditText();
      });
    },
    checkBound: function(shape, side, offset) {
      const { width: canvasWidth, height: canvasHeight } = this.canvasData;
      const minLeft = 0, minTop = 0;
      const rightLimit = minLeft + canvasWidth;
      const bottomLimit = minTop + canvasHeight;
      const { x: left, y: top, width, height } = shape;
      const { x: offsetX, y: offsetY } = offset;
      const startRight = left + width;
      const endRight = startRight + offsetX;
      const startTop = top;
      const endTop = top + offsetY;
      const startBottom = top + height;
      const endBottom = startBottom + offsetY;
      const startLeft = left;
      const endLeft = left + offsetX;
      switch (side) {
        case SIDE.top:
          if (endTop < minTop) {
            offset.y = minTop - startTop;
          }
          break; 
        case SIDE.bottom:
          if (endBottom > bottomLimit) {
            offset.y = bottomLimit - startBottom;
          }
          break;
        case SIDE.right:
          if (endRight > rightLimit) {
            offset.x = rightLimit - startRight;
          }
          break;  
        case SIDE.left:
          if (endLeft < minLeft) {
            offset.x = minLeft - startLeft;
          }
          break;
        }
    },
    updateCanvasData: function() {
      const { canvasData, canvasNode } = this;
      const { left, top, width, height } = canvasNode.getBoundingClientRect();
      canvasData.left = left;
      canvasData.top = top;
      canvasData.width = width;
      canvasData.height = height;
    },
    getShapeFromShapeMap: function(id) {
      return this.shapeMap.get(id);
    },
    createRectShape: function(tag, tagAttrs) {
      const id = getUId();
      const shape = new RectShape(id, tag, tagAttrs);
      this.shapeMap.set(id, shape);
      this.createResizeBox(shape);
      this.shapeContainerGNode.appendChild(shape.gNode);
    },
    createConnectBox: function(x, y, width, height) {
      const connectBox = new ConnectBox(x, y, width, height);
      this.connectBox = connectBox;
      this.connectContainerGNode.appendChild(connectBox.gNode);
    },
    destoryConnectBox: function() {
      const connectBox = this.connectBox;
      if (!connectBox) return;
      this.destoryConnectContainerContent();
      this.connectBox = null;
    },
    createLineShape: function() {
      const id = getUId();
      const shape = new LineShape(id, tag);
      this.shapeMap.set(id, shape);
      this.shapeContainerGNode.appendChild(shape.gNode);
    },
    createResizeBox: function(shape) {
      if (!shape) return;
      resizeBox = new ResizeBox(shape.x, shape.y, shape.width, shape.height, shape);
      this.destoryResizeContainerContent();
      this.resizeContainerGNode.appendChild(resizeBox.gNode);
      this.resizeBox = resizeBox;
    },
    destoryResizeBox: function() {
      this.resizeBox = null;
      this.destoryResizeContainerContent();
    },
    resizeResizeBox: function(x, y, width, height) {
      const resizeBox = this.resizeBox;
      if (!resizeBox) return;
      resizeBox.updatePositionAndSize(x, y, width, height);
    },
    hiddenResizePoints: function() {
      const resizeBox = this.resizeBox;
      if (!resizeBox) return;
      resizeBox.hiddenResizePoints();
    },
    destoryResizeContainerContent: function() {
      this.resizeContainerGNode.innerHTML = '';
    },
    destoryConnectContainerContent: function() {
      this.connectContainerGNode.innerHTML = '';
    },
  }

  const rectShapeHandler = {
    onDelete: function(event) {
      if (event.keyCode !== 8) return;
      const shapeInstance = this;
      if (shapeInstance.getShapeStatus('edit')) return;
      const { id, gNode, textBox } = shapeInstance;
      shapeInstance.unbindEvents();
      dispatchEvent(document, 'destoryShape', {
        id,
        shapeNode: gNode,
        textNode: textBox ? textBox.gNode : null
      });
    },
    onCreateOrDestoryTextBox: function(event) {
      const { textContent } = event.detail;
      const shapeInstance = this;
      shapeInstance.effectShapeStatus('edit');
      if (textContent) {
        const textBox = shapeInstance.textBox;
        if (!textBox) {
          shapeInstance.createTextBox(textContent);
          dispatchEvent(document, 'insertOrRemoveTextNode', {
            type: 0,
            node: shapeInstance.textBox.gNode
          });
        } else {
          textBox.updateTextContent(textContent);
          textBox.displayText();
        }
      } else {
        const textBox = shapeInstance.textBox;
        textBox && dispatchEvent(document, 'insertOrRemoveTextNode',{
          type: 1,
          node: textBox.node
        });
        shapeInstance.destoryTextBox();
      }
    },
    onClick: function(event) {
      event.stopPropagation();
      const shapeInstance = this;
      if (shapeInstance.getShapeStatus('drag')) {
        return shapeInstance.effectShapeStatus('drag');
      }
      if (shapeInstance.getShapeStatus('edit')) {
        return;
      }
      dispatchEvent(document, 'createResizeBox', { shapeInstance });
    },
    onDbClick: function(event) {
      event.stopPropagation();
      const shapeInstance = this;
      const { x, y, width, height } = shapeInstance;
      let initTextContent = null;
      shapeInstance.activeShapeStatus('edit');
      // 已存在文本信息需要隐藏其svg text标签内容显示
      if (shapeInstance.isExistTextContent()) {
        const textBox = shapeInstance.textBox;
        textBox.hiddenText();
        initTextContent = textBox.getTextContent();
      }
      dispatchEvent(document, 'createEditText', {
        x, y, width, height, initTextContent
      });
    },
    onMouseDown: function(event) {
      event.stopPropagation();
      const shapeInstance = this;
      if (shapeInstance.getShapeStatus('edit')) return;
      dispatchEvent(document, 'dragShape', {
        startX: event.pageX,
        startY: event.pageY,
        shapeInstance
      });
    },
  };

  function RectShape(uid, tag, tagAttrs) {
    this.id = uid;
    this.tag = tag;
    setKeys(this, tagAttrs);
    this.center = null;
    this.gNode = null;
    this.shapeNode = null;
    this.textBox = null;
    this.isDragging = false;
    this.isEditing = false;
    this.init();
  }

  RectShape.prototype = {
    init: function() {
      const gNode = this.createElement();
      this.updateCenter();
      this.shapeNode = gNode.children[0];
      this.gNode = gNode;
      this.bindEvents();
    },
    createElement: function() {
      const gNode = createSVGElement('g');
      setStyles(gNode, {
        visibility: 'visible',
        cursor: 'move'
      });
      const shapeNode = createSVGElement('rect');
      const { x, y, width, height } = this;
      setAttributes(shapeNode, {
        x, y, width, height,
        fill: '#fff',
        stroke: '#000',
        'stroke-width': '1.3',
        'pointer-events': 'all'
      });
      setAttributes(gNode, { id: this.id });
      gNode.appendChild(shapeNode);
      return gNode;
    },
    bindEvents: function() {
      const { gNode } = this;
      const prototype = RectShape.prototype;
      prototype.onClick = rectShapeHandler.onClick.bind(this);
      prototype.onDbClick = rectShapeHandler.onDbClick.bind(this);
      prototype.onMouseDown = rectShapeHandler.onMouseDown.bind(this);
      prototype.onDelete = rectShapeHandler.onDelete.bind(this);
      prototype.onCreateOrDestoryTextBox = rectShapeHandler.onCreateOrDestoryTextBox.bind(this);
      document.addEventListener('keydown', this.onDelete);
      document.addEventListener('createOrDestoryTextBox', this.onCreateOrDestoryTextBox);
      gNode.addEventListener('click', this.onClick);
      gNode.addEventListener('dblclick', this.onDbClick);
      gNode.addEventListener('mousedown', this.onMouseDown);
    },
    unbindEvents: function() {
      const { gNode } = this;
      document.removeEventListener('keydown', this.onDelete);
      document.removeEventListener('createOrDestoryTextBox', this.onCreateOrDestoryTextBox);
      gNode.removeEventListener('click', this.onClick);
      gNode.removeEventListener('dbclick', this.onDbClick);
      gNode.removeEventListener('mousedown', this.onMouseDown);
    },
    activeShapeStatus: function(key) {
      let prop = key;
      switch(key) {
        case 'edit': prop = 'isEditing';break;
        case 'drag': prop = 'isDragging';break;
      }
      if (this.hasOwnProperty(prop)) {
        this[prop] = true;
      }
    },
    effectShapeStatus: function(key) {
      let prop = key;
      switch(key) {
        case 'edit': prop = 'isEditing';break;
        case 'drag': prop = 'isDragging';break;
      }
      if (this.hasOwnProperty(prop)) {
        this[prop] = false;
      }
    },
    getShapeStatus: function(key) {
      let prop = key;
      switch(key) {
        case 'edit': prop = 'isEditing';break;
        case 'drag': prop = 'isDragging';break;
      }
      return !!this[prop];
    },
    updateCenter: function() {
      const { x, y, width, height } = this;
      this.center = [x + width / 2, y + height / 2];
    },
    updatePositionAndSize: function(x, y, width, height) {
      const { x: oldX, y: oldY, width: oldWidth, height: oldHeight } = this;
      if (isNumber(x) && oldX !== x) {
        this.x = x;
      }
      if (isNumber(y) && oldY !== y) {
        this.y = y;
      }
      if (isNumber(width) && oldWidth !== width) {
        this.width = width;
      }
      if (isNumber(height) && oldHeight !== height) {
        this.height = height;
      }
      setAttributes(this.shapeNode, {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
      });
      this.updateCenter();
      this.updateTextPosition();
    },
    createTextBox: function(text) {
      if (!text) return;
      const { x, y, width, height } = this;
      const textBox = new TextBox(x, y, width / 2, height / 2, text);
      this.textBox = textBox;
    },
    updateTextPosition: function() { 
      const textBox = this.textBox;
      if (!textBox) return;
      const { x, y, width, height } = this;
      textBox.updatePosition(x, y, width / 2, height / 2);
    },
    destoryTextBox: function() {
      this.textBox = null;
    },
    isExistTextContent: function() {
      const textBox = this.textBox;
      return textBox && !!textBox.text;
    }
  };

  function LineShape(uid, tag) {
    this.uid = uid;
    this.tag = tag;
    this.gNode = null;
    this.lineNode = null;
    this.init();
  }

  LineShape.prototype = {
    init: function() {},
    createElement: function() {
      const gNode = createSVGElement('g');
      const pathNode = createSVGElement('path');
      setAttributes(pathNode, {
        fill: 'none',
        stroke: '#000',
        'stroke-miterlimit': 10,
        'pointer-events': 'stroke'
      });
      gNode.appendChild(pathNode);
      this.gNode = gNode;
    },
    bindEvents: function() {},
    updatePosition: function() {},
  }

  function TextBox(x, y, dx, dy, text) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.text = text;
    this.gNode = null;
    this.textNode = null;
    this.init();
  }

  TextBox.prototype = {
    init: function() {
      const { x, y, dx, dy, text } = this;
      const gNode = createSVGElement('g');
      const textTag = createSVGElement('text');
      setAttributes(textTag, {
        x, y, dx, dy,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-size': '12',
        'pointer-events': 'none'
      });
      textTag.textContent = text;
      gNode.appendChild(textTag);
      this.gNode = gNode;
      this.textNode = textTag;
    },
    getTextContent: function() {
      return this.text;
    },
    updatePosition: function(x, y, dx, dy) {
      const { x: oldX, y: oldY, dx: oldDx, dy: oldDy } = this;
      if (isNumber(x) && oldX !== x) {
        this.x = x;
      }
      if (isNumber(y) && oldY !== y) {
        this.y = y;
      }
      if (isNumber(oldDx) && oldDx !== dx) {
        this.dx = dx;
      }
      if (isNumber(oldDy) && oldDy !== dy) {
        this.dy = dy;
      }
      setAttributes(this.textNode, { x, y, dx, dy });
    },
    updateTextContent: function(text) {
      if (!text) return;
      this.text = text;
      this.textNode.textContent = text;
    },
    hiddenText: function() {
      const textNode = this.textNode;
      if (!textNode) return;
      setAttributes(textNode, { opacity: 0 });
    },
    displayText: function() {
      const textNode = this.textNode;
      if (!textNode) return;
      removeAttributes(textNode, ['opacity']);
    }
  }

  function ResizeBox(x, y, width, height, shape) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.targetShape = shape;
    this.gNode = null;
    this.shapeNode = null;
    this.init();
  }

  ResizeBox.prototype = {
    init: function() {
      const outlineGNode = this.createOutline();
      const images = this.createImagePoints();
      const gNode = createSVGElement('g');
      const fragment = document.createDocumentFragment();
      for (let node of [outlineGNode, ...images]) {
        fragment.appendChild(node);
      }
      gNode.appendChild(fragment);
      this.gNode = gNode;
      this.shapeNode = outlineGNode.children[0];
      this.bindEvents();
    },
    createOutline: function() {
      const { x, y, width, height } = this;
      const shapeNode = createSVGElement('rect');
      setAttributes(shapeNode, {
        x, y, width, height,
        fill: 'none',
        stroke: '#00a8ff',
        'stroke-dasharray': '3 3',
        'pointer-events': 'none'
      });
      const gNode = createSVGElement('g');
      setStyles(gNode, { visibility: 'visible' });
      gNode.appendChild(shapeNode);
      return gNode;
    },
    createImagePoints: function() {
      const points = [];
      const { x, y, width, height } = this;
      const imageHalfSize = SHAPE_SIZE.IMAGE / 2;
      const pointMap = computeResizeImagePosition(x, y, width, height);
      for (let [key, value] of Object.entries(pointMap)) {
        const isRotateImage = key === RESIZE_DIR.rotate;
        const image = createSVGElement('image');
        // svg image标签设置链接地址
        image.href.baseVal =
          isRotateImage ? IMAGE_SVG_URL.rotate : IMAGE_SVG_URL.resize;
        setAttributes(image, {
          x: value.x,
          y: value.y,
          width: imageHalfSize * 2,
          height: imageHalfSize * 2,
          'pointer-events': 'all'
        });
        const g = createSVGElement('g');
        setAttributes(g, { id: isRotateImage? 'rotate-image' : key });
        setStyles(g, { visibility: 'visible', cursor: key });
        g.appendChild(image);
        points.push(g);
      }
      return points;
    },
    bindEvents: function() {
      const gNode = this.gNode;
      gNode.addEventListener('mousedown', e => {
        const target = e.target;
        const gNode = target.parentNode;
        const id = gNode.getAttribute('id');
        if (!id || id.indexOf('resize') < 0) return;
        this.hiddenResizeBoxAndSomePoints(gNode);
        dispatchEvent(document, 'resizeShape', {
          targetShape: this.targetShape,
          action: id.trim(),
          startX: e.pageX,
          startY: e.pageY,
          imageNode: target
        });
      });
    },
    updatePositionAndSize: function(x, y, width, height) {
      const { x: oldX, y: oldY, width: oldWidth, height: oldHeight } = this;
      if (isNumber(x) && oldX !== x) {
        this.x = x;
      }
      if (isNumber(y) && oldY !== y) {
        this.y = y;
      }
      if (isNumber(width) && oldWidth !== width) {
        this.width = width;
      }
      if (isNumber(height) && oldHeight !== height) {
        this.height = height;
      }
      setAttributes(this.shapeNode, {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
      });
    },
    hiddenResizePoints: function() {
      const gNode = this.gNode;
      if (!gNode) return;
      const children = gNode.children;
      if (!children.length) return;
      const itemList = [...children].slice(1);
      for (let item of itemList) {
        hiddenDom(item);
      }
    },
    hiddenResizeBoxAndSomePoints: function(visibleDom) {
      const gNode = this.gNode;
      if (!gNode) return;
      const children = gNode.children;
      if (!children.length) return;
      const itemList = [...children]
      for (let item of itemList) {
        if (item !== visibleDom) {
          hiddenDom(item);
        }
      }
    },
  }

  function ConnectBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.gNode = null;
    this.pointPositionMap = null;
    this.init();
  }

  ConnectBox.prototype = {
    init: function() {
      this.gNode = this.createElement();
      this.bindEvents();
    },
    createElement: function() {
      const imageHalfSize = 4, nodes = [], posMap = {};
      const { x, y, width, height } = this;
      const points = {
        'top-mid': [x + (width / 2) - imageHalfSize, y - imageHalfSize],
        'mid-left': [x - imageHalfSize, y + height / 2 - imageHalfSize],
        'mid-right': [x + width - imageHalfSize, y + height / 2 - imageHalfSize],
        'bottom-mid': [x + width / 2 - imageHalfSize, y + height - imageHalfSize]
      };
      for (let key of Object.keys(points)) {
        const value = points[key];
        const pointGNode = createSVGElement('g');
        const image = createSVGElement('image');
        image.href.baseVal = IMAGE_SVG_URL.connect;
        setAttributes(image, {
          id: key,
          x: value[0],
          y: value[1],
          width: imageHalfSize * 2,
          height: imageHalfSize * 2,
          'pointer-events': 'all'
        });
        posMap[key] = [value[0] + imageHalfSize, value[1] + imageHalfSize];
        pointGNode.appendChild(image);
        nodes.push(pointGNode);
      }
      const fragment = document.createDocumentFragment();
      const gNode = createSVGElement('g');
      for (let node of nodes) {
        fragment.appendChild(node);
      }
      setStyles(gNode, { cursor: 'crosshair' });
      gNode.appendChild(fragment);
      this.pointMap = posMap;
      return gNode;
    },
    bindEvents: function() {
      const { pointMap, gNode, x, y, width, height } = this;
      const range = {
        xLimit: [x, x + width],
        yLimit: [y, y + height]
      };
      gNode.addEventListener('mousedown', e => {
        const { pageX, pageY } = e;
        const target = e.target;
        const id = target.getAttribute('id');
        const point = pointMap[id];
        if (!point) return;
        dispatchEvent(document, 'connectLine', {
          startPoint: point,
          startX: pageX,
          startY: pageY,
          limit: range,
          direction: id.replace('-mid', '')
        });
      });
    }
  };

  root.Graph = Graph;
})(window);