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
  }

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
        graphInstance.createShape(svgTagName, {
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
    const { shapeContainerGNode, canvasNode } = graphInstance;

    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });

    // 快捷键删除图形支持
    document.addEventListener('keydown', function(e) {
      if (dragFlag.isEditing) return;
      if (e.keyCode === 8 && graphInstance.selectedShape) {
        graphInstance.destorySelectedShape();
      }
    });

    // 处理选择shape后取消
    canvasNode.addEventListener('click', function(e) {
      e.stopPropagation();
      graphInstance.destoryEditTextarea();
      if (dragFlag.isRotateDrag) {
        dragFlag.isRotateDrag = false;
        return;
      }
      console.log('canvas click')
      const target = e.target;
      const tagName = target.tagName;
      if (!isSVGElement(target) || tagName === 'svg') {
        graphInstance.clearSelectedShape();
      }
    });

    // 选择画布中某一个图形
    shapeContainerGNode.addEventListener('click', function(e) {
      e.stopPropagation();
      if (dragFlag.isDragInCanvas) {
        dragFlag.isDragInCanvas = false;
        return;
      }
      const target = e.target;
      if (!isSVGElement(target)) return;
      const gNode = target.parentNode;
      const id = parseInt(gNode.getAttribute('id'), 10);
      if (!isNumber(id)) return;
      const selectedShape = graphInstance.selectedShape;
      if (dragFlag.isEditing && selectedShape && selectedShape.id === id) {
        return;
      }
      console.log('shape click')
      graphInstance.setSelectedShape(id);
    });

    // 支持双击输入信息
    shapeContainerGNode.addEventListener('dblclick', function(e) {
      dragFlag.isEditing = true;
      const target = e.target;
      if (!isSVGElement(target)) return;
      const gNode = target.parentNode;
      const id = parseInt(gNode.getAttribute('id'), 10);
      if (!isNumber(id)) return;
      // 已存在文本信息需要隐藏其svg text标签内容显示
      const selectedShape = graphInstance.selectedShape;
      if (selectedShape && selectedShape.isExistTextContent()) {
        selectedShape.textBox.hiddenText();
      }
      graphInstance.createEditTextarea();
    });

    // 鼠标移到图形上事件
    canvasNode.addEventListener('mousemove', function(e) {
      e.preventDefault();
      const { selectedShape, connectContainerGNode } = graphInstance;
      const target = e.target;
      if (selectedShape || !isSVGElement(target)) return;
      const gNode = target.parentNode;
      const id = parseInt(gNode.getAttribute('id'), 10);
      if (isNumber(id)) return;
      // mouseHoverShapeId = id;
      // const shape = graphInstance.getShapeFromShapeMap(id);
      // const connectBox = shape.connectBox;
      // graphInstance.destoryConnectContainerContent();
      // connectContainerGNode.appendChild(connectBox.gNode);
    });

    // shapeContainerGNode.addEventListener('mouseleave', function(e) {
    //   e.stopPropagation();
    //   const { selectedShape } = graphInstance;
    //   if (selectedShape) return;
    //   const target = e.target;
    //   if (!isSVGElement(target)) return;
    //   mouseHoverShapeId = null;
    //   graphInstance.destoryConnectContainerContent();
    // });
  };

  // 处理图形在画布内拖动
  const bindEventsOfShape = function() {
    const graphInstance = this;
    const { shapeContainerGNode, canvasData } = graphInstance;
    let isDragging = false, startX = null, startY = null, shapeId = null;
    registerDrag(
      shapeContainerGNode,
      function onDragStart(e) {
        if (dragFlag.isEditing) return;
        const target = e.target;
        if (!isSVGElement(target)) return;
        const gNode = target.parentNode;
        shapeId = parseInt(gNode.getAttribute('id'), 10);
        if (!isNumber(shapeId)) return;
        graphInstance.setSelectedShape(shapeId);
        graphInstance.hiddenResizePoints();
        isDragging = true;
        startX = e.pageX;
        startY = e.pageY;
        graphInstance.destoryEditTextarea();
      },
      function onDraging(e) {
        if (!isDragging) return;
        dragFlag.isDragInCanvas = true;
        const { pageX, pageY } = e;
        // 简单处理顶部边界
        const isRender = pageX >= canvasData.left && pageY >= canvasData.top;
        if (!isRender) return;
        const xRatio = pageX - startX;
        const yRatio = pageY - startY;
        const { x, y } = graphInstance.selectedShape;
        const current = [x + xRatio, y + yRatio];
        const newX = current[0] <= 0 ? 0 : current[0];
        const newY = current[1] <= 0 ? 0 : current[1];
        graphInstance.resizeShape(newX, newY);
        graphInstance.resizeResizeBox(newX, newY);
        startX = pageX;
        startY = pageY;
      },
      function onDragEnd() {
        if (!isDragging || !dragFlag.isDragInCanvas) return;
        console.log('shape in canvas:' + isDragging)
        isDragging = false;
        graphInstance.createResizeBox();
      }
    );
  };

  // const handleShapeRotate = function() {
  //   const graphInstance = this;
  //   const { resizeContainerGNode, canvasData } = graphInstance;
  //   const { top, left } = canvasData;
  //   let isDragging = false, originX = null, originY = null,
  //     rotateAngle = null, startAngle = null, startDist = null;
  //   registerDrag(
  //     resizeContainerGNode,
  //     function onDragStart(e) {
  //       const target = e.target;
  //       if (!isSVGElement(target) || target.tagName !== 'image') {
  //         return;
  //       }
  //       const gNode = target.parentNode;
  //       const id = gNode.getAttribute('id');
  //       if (id.indexOf('rotate-image') < 0) return;
  //       isDragging = true;
  //       graphInstance.hiddenResizePoints();
  //       [originX, originY] = graphInstance.selectedShape.center;
  //       originX += left;
  //       originY += top;
  //       const dx = e.pageX - originX;
  //       const dy = e.pageY - originY;
  //       startAngle = (dx !== 0) ? Math.atan(dy / dx) * 180 / Math.PI + 90 : 0;
  //       startDist = Math.sqrt(dx * dx + dy * dy);
  //     },
  //     function onDraging(e) {
  //       if (!isDragging) return;
  //       dragFlag.isRotateDrag = true;
  //       const { pageX, pageY } = e;
  //       var dx = originX - pageX;
  //       var dy = originY - pageY;
  //       let currentAlpha = (dx != 0) ? Math.atan(dy / dx) * 180 / Math.PI + 90 : ((dy < 0) ? 180 : 0);
  //       console.log(currentAlpha + ': ---- 1')
  //       if (dx > 0)
  //       {
  //         currentAlpha -= 180;
  //       }
  //       console.log(currentAlpha + ': ---- 2')
  //       currentAlpha -= startAngle;
  //       console.log(currentAlpha + ': ---- 3' + '---:' + startAngle)

  //         var dx = pageX - originX;
  //         var dy = pageY - originY;
  //         var dist = Math.sqrt(dx * dx + dy * dy);
  //         if (dist - startDist < 2)
  //         {
  //           raster = 15;
  //         }
  //         else if (dist - this.startDist < 25)
  //         {
  //           raster = 5;
  //         }
  //         else
  //         {
  //           raster = 1;
  //         }
          
  //       currentAlpha = Math.round(currentAlpha / raster) * raster;
  //       console.log(currentAlpha + ': ---- 4')
  //       // rotateAngle = Math.atan2(pageY - originY, pageX - originX) / Math.PI * 180;
  //       graphInstance.setRotateAngle(currentAlpha);
  //       graphInstance.rotateResizeBox();
  //     },
  //     function onDragEnd() {
  //       if (!dragFlag.isRotateDrag || !isDragging) return;
  //       isDragging = false;
  //       graphInstance.createResizeBox();
  //       graphInstance.rotateResizeBox();
  //       graphInstance.rotateShape();
  //     }
  //   );
  // };

  const handleShapeResize = function() {
    const graphInstance = this;
    const { resizeContainerGNode, canvasData } = graphInstance;
    let isDragging = false, startX = null, startY = null,
        action = null, imageNode = null;
    registerDrag(
      resizeContainerGNode,
      function onDragStart(e) {
        const target = e.target;
        if (!isSVGElement(target) || target.tagName !== 'image') {
          return;
        }
        const gNode = target.parentNode;
        const id = gNode.getAttribute('id');
        if (!id || id.indexOf('resize') < 0) return;
        isDragging = true;
        imageNode = gNode.children[0];
        action = id.trim();
        startX = e.pageX;
        startY = e.pageY;
        pointX = Number(imageNode.getAttribute('x'));
        pointY = Number(imageNode.getAttribute('y'))
        graphInstance.hiddenResizeBoxAndSomePoints(gNode);
      },
      function onDraging(e) {
        if (!isDragging) return;
        const { width: canvasWidth, height: canvasHeight } = canvasData;
        const minLeft = 0, minTop = 0;
        const rightLimit = minLeft + canvasWidth;
        const bottomLimit = minTop + canvasHeight;
        const { pageX, pageY } = e;
        const { selectedShape } = graphInstance;
        let { x: left, y: top, width, height } = selectedShape;
        let tempAction = action, isRender = true;
        dragFlag.isResizeDrag = true;
        const right = left + width;
        const bottom = top + height;
        const offset = {
          x: pageX - startX,
          y: pageY - startY
        };
        switch (tempAction) {
          // 左边
          case RESIZE_DIR.midLeft:
            // 左边框到达边界后继续向左滑动不需要计算和渲染
            if (offset.x <= 0 && left <= minLeft) {
              isRender = false;
              break;
            }
            graphInstance.checkBound(SIDE.left, offset);
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
            graphInstance.checkBound(SIDE.right, offset);
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
            graphInstance.checkBound(SIDE.top, offset);
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
            graphInstance.checkBound(SIDE.bottom, offset);
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
            graphInstance.checkBound(SIDE.top, offset);
            graphInstance.checkBound(SIDE.left, offset);
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
            graphInstance.checkBound(SIDE.top, offset);
            graphInstance.checkBound(SIDE.right, offset);
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
            graphInstance.checkBound(SIDE.bottom, offset);
            graphInstance.checkBound(SIDE.left, offset);
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
            graphInstance.checkBound(SIDE.bottom, offset);
            graphInstance.checkBound(SIDE.right, offset);
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
          graphInstance.resizeShape(left, top, width, height);
          const pointMap = computeResizeImagePosition(left, top, width, height);
          const point = pointMap[action];
          setAttributes(imageNode, { x: point.x, y: point.y });
          graphInstance.updateEditTextareaPositionAndSize();
          action = tempAction;
        }
        startX = pageX;
        startY = pageY;
      },
      function onDragEnd() {
        if (!isDragging || !dragFlag.isResizeDrag) return;
        isDragging = false;
        graphInstance.createResizeBox();
      }
    );
  };

  function Graph(element) {
    if (!isElement(element)) return;
    this.element = element;
    this.selectedShape = null;
    this.resizeBox = null;
    this.connectBox = null;
    this.rotateAngle = null;
    this.sideNode = null;
    this.canvasNode = null;
    this.contentNode = null;
    this.shapeContainerGNode = null;
    this.resizeContainerGNode = null;
    this.ConnectContainerGNode = null;
    this.editTextarea = null;
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
      // handleShapeRotate.call(this);
      handleShapeResize.call(this);
    },
    createEditTextarea: function() {
      const {
        canvasData: { top, left },
        sideNode,
        selectedShape: { x, y, width, height }
      } = this;
      const contentEditTextarea = document.createElement('div');
      setAttributes(contentEditTextarea, {
        id: 'edit-container',
        contenteditable: true
      });
      const sideWidth = sideNode.offsetWidth;
      const pos = [left - sideWidth + x - 2, y + top];
      setStyles(contentEditTextarea, {
        top: `${pos[1] + height / 2 - 10}px`,
        left: `${pos[0]}px`,
        width: `${width - 16}px`,
        height: `${Math.round(height / 3)}px`
      });
      const { textBox } = this.selectedShape;
      if (textBox && !!textBox.text) {
        contentEditTextarea.innerText = textBox.text;
      }
      this.canvasNode.parentNode.appendChild(contentEditTextarea);
      contentEditTextarea.focus();
      this.editTextarea = contentEditTextarea;
      this.bindEditEndEvent();
    },
    destoryEditTextarea() {
      const editTextarea = this.editTextarea;
      if (!editTextarea) return;
      this.editTextarea = null;
      this.canvasNode.parentNode.removeChild(editTextarea);
    },
    updateEditTextareaPositionAndSize: function() {
      const editTextarea = this.editTextarea;
      if (!editTextarea) return;
      const {
        canvasData: { top, left },
        sideNode,
        selectedShape: { x, y, width, height }
      } = this;
      const sideWidth = sideNode.offsetWidth;
      const pos = [left - sideWidth + x - 2, y + top];
      setStyles(editTextarea, {
        top: `${pos[1]}px`,
        left: `${pos[0]}px`,
        width: `${width - 16}px`,
        height: `${height}px`
      });
    },
    bindEditEndEvent: function() {
      const editTextarea = this.editTextarea;
      if (!editTextarea) return;
      editTextarea.addEventListener('blur', e => {
        dragFlag.isEditing = false;
        const text = e.target.innerText.trim();
        if (!!text) {
          this.insertTextContent(text);
        } else {
          this.destoryTextBox();
        }
        this.destoryEditTextarea();
      });
    },
    checkBound: function(side, offset) {
      const { width: canvasWidth, height: canvasHeight } = this.canvasData;
      const minLeft = 0, minTop = 0;
      const rightLimit = minLeft + canvasWidth;
      const bottomLimit = minTop + canvasHeight;
      const { x: left, y: top, width, height } = this.selectedShape;
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
    setRotateAngle: function(angle) {
      if (!isNumber(angle)) return;
      this.rotateAngle = angle;
    },
    getShapeFromShapeMap: function(id) {
      return this.shapeMap.get(id);
    },
    createShape: function(tag, tagAttrs) {
      const id = getUId();
      const shape = new Shape(id, tag, tagAttrs);
      this.shapeMap.set(id, shape);
      this.selectedShape = shape;
      this.createResizeBox();
      this.shapeContainerGNode.appendChild(shape.gNode);
    },
    insertTextContent: function(text) {
      if (!text || !String(text).trim()) return;
      const selectedShape = this.selectedShape;
      if (!selectedShape) return;
      const textBox = selectedShape.textBox;
      if (!textBox) {
        selectedShape.createTextBox(text);
        const { gNode } = selectedShape.textBox;
        this.shapeContainerGNode.appendChild(gNode);
      } else {
        textBox.displayText();
      }
    },
    destoryTextBox: function() {
      const selectedShape = this.selectedShape;
      if (!selectedShape || !selectedShape.textBox) return;
      const { gNode } = selectedShape.textBox;
      this.shapeContainerGNode.removeChild(gNode);
      selectedShape.destoryTextBox();
    },
    rotateShape: function() {
      const { rotateAngle, selectedShape } = this;
      if (!selectedShape || !isNumber(rotateAngle)) return;
      const center = selectedShape.center;
      setAttributes(selectedShape.shapeNode, {
        transform: `rotate(${rotateAngle},${center[0]},${center[1]})`
      });
      if (rotateAngle === 0) {
        removeAttributes(selectedShape.shapeNode, ['transform']);
      }
    },
    resizeShape: function(x, y, width, height) {
      const { selectedShape } = this;
      if (!selectedShape) return;
      selectedShape.updatePositionAndSize(x, y, width, height);
    },
    setSelectedShape: function(id) {
      const shape = this.getShapeFromShapeMap(id);
      if (shape) {
        this.selectedShape = shape;
        this.createResizeBox();
        this.rotateShape();
      }
    },
    clearSelectedShape: function() {
      const selectedShape = this.selectedShape;
      if (!selectedShape) return;
      this.selectedShape = null;
      this.destoryResizeBox();
    },
    destoryResizeBox: function() {
      this.resizeBox = null;
      this.destoryResizeContainerContent();
    },
    destorySelectedShape: function() {
      const { selectedShape, shapeContainerGNode } = this;
      if (!selectedShape) return;
      shapeContainerGNode.removeChild(selectedShape.gNode);
      this.shapeMap.delete(selectedShape.id);
      this.clearSelectedShape();
    },
    createResizeBox: function() {
      const { selectedShape, rotateAngle } = this;
      if (!selectedShape) return;
      let resizeBox = null;
      const tag = selectedShape.tag;
      if (tag === 'rect') {
        const { x, y, width, height } = selectedShape;
        resizeBox = new ResizeBox(x, y, width, height, rotateAngle);
      }
      if (!resizeBox) return;
      this.destoryResizeContainerContent();
      this.resizeContainerGNode.appendChild(resizeBox.gNode);
      this.resizeBox = resizeBox;
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
    displayResizePoints: function() {
      const resizeBox = this.resizeBox;
      if (!resizeBox) return;
      resizeBox.displayResizePoints();
    },
    hiddenResizeBoxAndSomePoints: function(visibleDom) {
      const resizeBox = this.resizeBox;
      if (!resizeBox) return;
      resizeBox.hiddenResizeBoxAndSomePoints(visibleDom);
    },
    displayResizeBoxAndAllPoints: function() {
      const resizeBox = this.resizeBox;
      if (!resizeBox) return;
      resizeBox.displayResizeBoxAndAllPoints();
    },
    destoryResizeContainerContent: function() {
      this.resizeContainerGNode.innerHTML = '';
    },
    destoryConnectContainerContent: function() {
      this.connectContainerGNode.innerHTML = '';
    },
  }

  function Shape(uid, tag, tagAttrs) {
    this.tag = tag;
    this.id = uid;
    setKeys(this, tagAttrs);
    this.center = null;
    this.gNode = null;
    this.shapeNode = null;
    this.textBox = null;
    this.init();
  }

  Shape.prototype = {
    init: function() {
      const tag = this.tag;
      const gNode = createSVGElement('g');
      setStyles(gNode, {
        visibility: 'visible',
        cursor: 'move'
      });
      const shapeNode = createSVGElement(tag);
      if (tag === 'rect') {
        const { x, y, width, height } = this;
        setAttributes(shapeNode, { x, y, width, height });
      }
      setAttributes(shapeNode, {
        fill: '#fff',
        stroke: '#000',
        'stroke-width': '1.3',
        'pointer-events': 'all'
      });
      gNode.setAttribute('id', this.id);
      gNode.appendChild(shapeNode);
      this.updateCenter();
      this.shapeNode = shapeNode;
      this.gNode = gNode;
    },
    updateCenter: function() {
      if (this.tag === 'rect') {
        const { x, y, width, height } = this;
        this.center = [x + width / 2, y + height / 2];
      }
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

  function ResizeBox(x, y, width, height, angle) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = angle;
    this.gNode = null;
    this.shapeNode = null;
    this.imageNodeList = [];
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
      this.imageNodeList = [...images];
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
    displayResizePoints: function() {
      const gNode = this.gNode;
      if (!gNode) return;
      const children = gNode.children;
      if (!children.length) return;
      const itemList = [...children].slice(1);
      for (let item of itemList) {
        displayDom(item);
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
    displayResizeBoxAndAllPoints: function() {
      const gNode = this.gNode;
      if (!gNode) return;
      const children = gNode.children;
      if (!children.length) return;
      const itemList = [...children]
      for (let item of itemList) {
        displayDom(item);
      }
    },
  }

  function ConnectBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.gNode = null;
    this.init();
  }

  ConnectBox.prototype = {
    init: function() {
      const imageHalfSize = 4, nodes = [];
      const { x, y, width, height } = this;
      const points = {
        'top-mid': [x + (width / 2) - imageHalfSize, y - imageHalfSize],
        'mid-left': [x - imageHalfSize, y + height / 2 - imageHalfSize],
        'mid-right': [x + width - imageHalfSize, y + height / 2 - imageHalfSize],
        'bottom-mid': [x + width / 2 - imageHalfSize, y + height - imageHalfSize]
      };
      for (let value of Object.values(points)) {
        const pointGNode = createSVGElement('g');
        const image = createSVGElement('image');
        image.href.baseVal = IMAGE_SVG_URL.connect;
        setAttributes(image, {
          x: value[0],
          y: value[1],
          width: imageHalfSize * 2,
          height: imageHalfSize * 2,
          'pointer-events': 'all'
        });
        pointGNode.appendChild(image);
        nodes.push(pointGNode);
      }
      const fragment = document.createDocumentFragment();
      const gNode = createSVGElement('g');
      for (let node of nodes) {
        fragment.appendChild(node);
      }
      gNode.appendChild(fragment);
      this.gNode = gNode;
    }
  };

  root.Graph = Graph;
})(window);