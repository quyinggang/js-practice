(function(root) {

  /**
   * 简易图形编辑的一种实现，只简单处理了rect
   * - 本demo采用svg构建方式，样式方面参考mx-graph
   * - 也可以采用canvas，可以看ProcessOn
   * 注意：该demo仅仅启发思路而非完全实现，非rect情况可能存在Bug
   * 
   * 实现思路：
   * svg下存在多层g分组嵌套，rootGNode：表示最外层g分组的DOM
   * rootGNode下按功能分类成3个g分组：
   * - shapeGNode：组合图形的g分组，内部每一个图形都由另一个g分组包裹
   * - shadowShapeGNode: 每个图形有一个影子图形，用于拖拽等调整图形大小
   * - lineConnectGNode：每个图形有一个临时性分组，用于提供图形间连线
   */

  let selectedShape = null;
  const canvasNode = document.getElementById('canvas');
  const rootGNode = canvasNode.children[0];
  const [shapeGNode, shadowShapeGNode, lineConnectGNode] = rootGNode.children;
  const {
    width: canvasWidth,
    top: canvasTop,
    left: canvasLeft
   } = canvasNode.getBoundingClientRect();

  const shapeStatus = {
    isDraggingInCanvas: false,
    isSelected: false,
    isResize: false,
    isRotate: false,
    isDraggingFromSide: false
  };

  const RESIZE_DIR = {
    topLeft: 'nw-resize',
    topMid: 'n-resize',
    topRight: 'ne-resize',
    midLeft: 'w-resize',
    midRight: 'e-resize',
    bottomLeft: 'sw-resize',
    bottomMid: 's-resize',
    bottomRight: 'se-resize'
  }

  // 图像绘制到画布上的初始尺寸
  const SHAPE_SIZE = {
    RECT: {
      width: 120,
      height: 60
    },
    IMAGE: 18,
  };

  const getEleByClass = function(className) {
    if (!className) return;
    return document.getElementsByClassName(className)[0];
  };

  const createSVGElement = function(tag) {
    if (!tag) return;
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  const isSVGElement = function(node) {
    return node instanceof SVGElement;
  };

  const hiddenDom = function(node) {
    if (!node) return;
    node.style.display = 'none'; 
  }

  const displayDom = function(node) {
    if (!node) return;
    const cssText = node.style.cssText;
    node.style.cssText = cssText.replace('display:none;', '').trim();
  }

  const isExistIndexOfString = function(origin, dest) {
    return (origin || '').indexOf(dest) >= 0;
  }

  const getShapePositionAndSize = function(shapeNode) {
    if (!shapeNode) return;
    const x = Number(shapeNode.getAttribute('x'));
    const y = Number(shapeNode.getAttribute('y'));
    const width = Number(shapeNode.getAttribute('width'));
    const height = Number(shapeNode.getAttribute('height'));
    return { x, y, width, height };
  }

  // side区域宽度支持拖动拓展
  function dragReszieBar()  {
    let sideWidth = 0, startX = 0, isDragging = false;
    const minSideWidth = 0, maxSideWidth = 500;
    const sideNode = getEleByClass('side');
    const viewNode = getEleByClass('main');
    const resizeBarNode = getEleByClass('resize-bar');

    const draging = function(e) {
      if (!isDragging) return;
      const currentWidth = sideWidth + e.clientX - startX;
      if (currentWidth < minSideWidth || currentWidth > maxSideWidth) return;
      sideNode.style.width = `${currentWidth}px`;
      viewNode.style.marginLeft = `${currentWidth}px`;
    }
    const dragEnd = function() {
      isDragging = false;
      root.removeEventListener('mousemove', draging);
      root.removeEventListener('mouseup', dragEnd);
    }
    resizeBarNode.addEventListener('mousedown', function(event) {
      event.stopPropagation();
      startX = event.clientX;
      isDragging = true;
      sideWidth = sideNode.offsetWidth;
      root.addEventListener('mousemove', draging);
      root.addEventListener('mouseup', dragEnd);
    });
  }

  function getGNodeOfSVG(node) {
    if (!node) return;
    let target = null;
    if (isSVGElement(node)) {
      let current = node;
      while(current) {
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
  }

  function createShapeOutline(shapeNode) {
    if (!isSVGElement(shapeNode)) return;
    const cloneShape = shapeNode.cloneNode(true);
    cloneShape.setAttribute('fill', 'none');
    cloneShape.setAttribute('stroke', '#00a8ff');
    cloneShape.setAttribute('stroke-dasharray', '3 3');
    cloneShape.setAttribute('pointer-events', 'none');
    const gNode = createSVGElement('g');
    gNode.appendChild(cloneShape);
    return gNode;
  }

  /**
   * 影子图形创建，实际上就是选中图形外部虚影。
   * 理论上该方法每次调用创建的图形都需要重新设置外轮廓以及相关操作点的坐标，目前只简单处理rect
   * @param {} shapeNode 图形DOM
   * @returns 
   */
  function createShadowShape(shapeNode) {
    if (!isSVGElement(shapeNode)) return;
    shapeStatus.isSelected = true;
    const imageHalfSize = SHAPE_SIZE.IMAGE / 2;
    const shadowShapeOutline = createShapeOutline(shapeNode);
    const { x, y, width, height } = getShapePositionAndSize(shapeNode);
    const cursorMap = {
      [RESIZE_DIR.topLeft]: [x - imageHalfSize, y - imageHalfSize],
      [RESIZE_DIR.topMid]: [x + (width / 2) - imageHalfSize, y - imageHalfSize],
      [RESIZE_DIR.topRight]: [x + width - imageHalfSize, y - imageHalfSize],
      [RESIZE_DIR.midLeft]: [x - imageHalfSize, y + height / 2 - imageHalfSize],
      [RESIZE_DIR.midRight]: [x + width - imageHalfSize, y + height / 2 - imageHalfSize],
      [RESIZE_DIR.bottomLeft]: [x - imageHalfSize, y + height - imageHalfSize],
      [RESIZE_DIR.bottomMid]: [x + width / 2 - imageHalfSize, y + height - imageHalfSize],
      [RESIZE_DIR.bottomRight]: [x + width - imageHalfSize, y + height - imageHalfSize]
    };
    shadowShapeOutline && shadowShapeGNode.appendChild(shadowShapeOutline);
    for (let [key, value] of Object.entries(cursorMap)) {
      const image = createSVGElement('image');
      // svg image标签设置链接地址不能使用setAttribute
      image.href.baseVal= 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxOHB4IiBoZWlnaHQ9IjE4cHgiIHZlcnNpb249IjEuMSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjUiIHN0cm9rZT0iI2ZmZiIgZmlsbD0iIzI5YjZmMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+';
      image.setAttribute('width', imageHalfSize * 2);
      image.setAttribute('height', imageHalfSize * 2);
      image.setAttribute('x', value[0]);
      image.setAttribute('y', value[1]);
      const g = createSVGElement('g');
      g.style.cssText = `visibility: visible;cursor:${key}`;
      g.setAttribute('id', key);
      g.appendChild(image);
      shadowShapeGNode.appendChild(g);
    }
    const rotateGNode = createSVGElement('g');
    const rotateImage = createSVGElement('image');
    rotateImage.href.baseVal = 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBzdHJva2U9IiMyOWI2ZjIiIGZpbGw9IiMyOWI2ZjIiIGQ9Ik0xNS41NSA1LjU1TDExIDF2My4wN0M3LjA2IDQuNTYgNCA3LjkyIDQgMTJzMy4wNSA3LjQ0IDcgNy45M3YtMi4wMmMtMi44NC0uNDgtNS0yLjk0LTUtNS45MXMyLjE2LTUuNDMgNS01LjkxVjEwbDQuNTUtNC40NXpNMTkuOTMgMTFjLS4xNy0xLjM5LS43Mi0yLjczLTEuNjItMy44OWwtMS40MiAxLjQyYy41NC43NS44OCAxLjYgMS4wMiAyLjQ3aDIuMDJ6TTEzIDE3Ljl2Mi4wMmMxLjM5LS4xNyAyLjc0LS43MSAzLjktMS42MWwtMS40NC0xLjQ0Yy0uNzUuNTQtMS41OS44OS0yLjQ2IDEuMDN6bTMuODktMi40MmwxLjQyIDEuNDFjLjktMS4xNiAxLjQ1LTIuNSAxLjYyLTMuODloLTIuMDJjLS4xNC44Ny0uNDggMS43Mi0xLjAyIDIuNDh6Ii8+PC9zdmc+';
    rotateImage.setAttribute('width', imageHalfSize * 2);
    rotateImage.setAttribute('height', imageHalfSize * 2);
    rotateImage.setAttribute('x', x + width + 4);
    rotateImage.setAttribute('y', y - imageHalfSize * 2 - 4);
    rotateGNode.style.cssText = 'cursor: crosshair;';
    rotateGNode.setAttribute('id', 'rotate-image');
    rotateGNode.appendChild(rotateImage);

    shadowShapeGNode.appendChild(rotateGNode);
  }

  function recreateShadowShape(shapeNode) {
    shadowShapeGNode.innerHTML = '';
    createShadowShape(shapeNode);
  }

  function createLineConnectShape(shapeNode) {
    if (!shapeNode) return;
    const imageHalfSize = 4;
    const { x, y, width, height } = getShapePositionAndSize(shapeNode);
    const points = {
      'top-mid': [x + (width / 2) - imageHalfSize, y - imageHalfSize],
      'mid-left': [x - imageHalfSize, y + height / 2 - imageHalfSize],
      'mid-right': [x + width - imageHalfSize, y + height / 2 - imageHalfSize],
      'bottom-mid': [x + width / 2 - imageHalfSize, y + height - imageHalfSize]
    };
    lineConnectGNode.innerHTML = '';
    for (let value of Object.values(points)) {
      const pointGNode = createSVGElement('g');
      const image = createSVGElement('image');
      image.href.baseVal = 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI1cHgiIGhlaWdodD0iNXB4IiB2ZXJzaW9uPSIxLjEiPjxwYXRoIGQ9Im0gMCAwIEwgNSA1IE0gMCA1IEwgNSAwIiBzdHJva2U9IiMyOWI2ZjIiLz48L3N2Zz4=';
      image.setAttribute('x', value[0]);
      image.setAttribute('y', value[1]);
      image.setAttribute('width', imageHalfSize * 2);
      image.setAttribute('height', imageHalfSize * 2);
      pointGNode.appendChild(image);
      lineConnectGNode.appendChild(pointGNode);
    }
  }

  function createShapeFromSide() {
    const rectInitSize = SHAPE_SIZE.RECT;
    // 同一元素mousedown mouseup click事件顺序导致，如果click会触发拖拽事件
    let isDragEvent = true;
    let dragPositionX = null, dragPositionY = null, draggedGNode = null;
    const dragingShape = document.getElementById('shape--draging');
    const sideNode = getEleByClass('side');
    const canDragAreaNode = document.getElementById('graph');

    const viewArea = getEleByClass('view');
    const { left: viewLeft } = viewArea.getBoundingClientRect();
    

    const draging = function(e) {
      e.stopPropagation();
      if (!shapeStatus.isDraggingFromSide) return;
      isDragEvent = true;
      const style = dragingShape.style;
      const posX = e.clientX;
      const posY = e.clientY;
      dragPositionX = posX;
      dragPositionY = posY;
      style.zIndex = 3;
      // 拖动时鼠标处于图形框中心
      style.top = `${posY - rectInitSize.height / 2}px`;
      style.left = `${posX - rectInitSize.width / 2}px`;
    }
    const dragEnd = function(e) {
      e.stopPropagation();
      shapeStatus.isDraggingFromSide = false;
      console.log('side mouseup');
      dragingShape.style.cssText='display:none;top:0;left:0;';
      let posX = canvasLeft, posY = canvasTop;
      // 放弃side DOM上click事件，使用标识符来判断做处理
      if (isDragEvent) {
        if (dragPositionX < viewLeft) return;
        const limitRange = [
          canvasLeft + rectInitSize.width / 2,
          canvasTop + rectInitSize.height / 2
        ];
        // 拖拽矩形长度和宽度，注意svg默认坐标系统
        if (dragPositionX >= limitRange[0] && dragPositionY >= limitRange[1]) {
          posX = dragPositionX - limitRange[0];
          posY = dragPositionY - limitRange[1];
        }
      } else {
        posX = Math.floor(canvasWidth / 2) - rectInitSize.width / 2
      }
      const shapeNode = draggedGNode.children[0];
      const tagName = shapeNode.tagName;
      if (tagName === 'rect') {
        shapeNode.setAttribute('x', posX);
        shapeNode.setAttribute('y', posY);
        shapeNode.setAttribute('width', rectInitSize.width);
        shapeNode.setAttribute('height', rectInitSize.height);
      }
      recreateShadowShape(shapeNode);
      draggedGNode.style.cssText="cursor:move";
      selectedShape = draggedGNode;
      shapeGNode.appendChild(draggedGNode);
      canDragAreaNode.removeEventListener('mousemove', draging);
      canDragAreaNode.removeEventListener('mouseup', dragEnd);
    }

    sideNode.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      const gNode = getGNodeOfSVG(e.target);
      if (!gNode) return;
      isDragEvent = false;
      shapeStatus.isDraggingFromSide = true;
      draggedGNode = gNode.cloneNode(true);
      canDragAreaNode.addEventListener('mousemove', draging);
      canDragAreaNode.addEventListener('mouseup', dragEnd);
      dragingShape.style.display = 'block';
    })
  }
  
  function dragShapeInCanvas() {
    let shapeNode = null;
    const rectInitSize = SHAPE_SIZE.RECT;
    const draging = function(e) {
      e.stopPropagation();
      if (!shapeStatus.isDraggingInCanvas) return;
      const posX = e.clientX;
      const posY = e.clientY;
      shapeNode.setAttribute('x', posX - canvasLeft - rectInitSize.width / 2);
      shapeNode.setAttribute('y', posY - canvasTop - rectInitSize.height / 2);
    };
    const dragEnd = function(e) {
      e.stopPropagation();
      if (!shapeStatus.isDraggingInCanvas) return;
      console.log('dragInCanvas dragend');
      canvasNode.removeEventListener('mousemove', draging);
      canvasNode.removeEventListener('mouseup', dragEnd);
      shapeStatus.isDraggingInCanvas = false;
    };

    shapeGNode.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      // const { isResize, isDraggingInCanvas } = shapeStatus;
      // if (isResize || isDraggingInCanvas) return;
      const target = e.target;
      if (!isSVGElement(target)) return;
      console.log('shapeGNode mousedown');
      shapeStatus.isDraggingInCanvas = true;
      shapeNode = target;
      lineConnectGNode.innerHTML = '';
      shadowShapeGNode.innerHTML = '';
      canvasNode.addEventListener('mousemove', draging);
      canvasNode.addEventListener('mouseup', dragEnd);
    });
  }

  function hiddenShadowShapeImageNodes(images, livedImage) {
    if (!images || !images.length) return;
    for (let item of images) {
      const image = item.children[0];
      if (image.tagName == 'image' && image !== livedImage) {
        hiddenDom(item);
      }
    }
  }

  function resizeShadowShape(resizeGNode) {
    if (!resizeGNode) return;
    const imageHafSize = SHAPE_SIZE.IMAGE / 2;
    const resizeDir = resizeGNode.getAttribute('id');
    const imageNode = resizeGNode.children[0];
    let { x: initPosX, y: initPosY } = getShapePositionAndSize(imageNode);
    const shapeNode = selectedShape.children[0];
    const shadowShapeNode = shadowShapeGNode.children[0].children[0];
    const { width: initWidth, height: initHeight } = getShapePositionAndSize(shapeNode);
    hiddenShadowShapeImageNodes(
      resizeGNode.parentNode.children,
      imageNode
    );
    const isTopLeft =
      isExistIndexOfString(resizeDir, RESIZE_DIR.topLeft);
    const isTopMid =
      isExistIndexOfString(resizeDir, RESIZE_DIR.topMid);
    const isTopRight =
      isExistIndexOfString(resizeDir, RESIZE_DIR.topRight);
    const isMidLeft =
      isExistIndexOfString(resizeDir, RESIZE_DIR.midLeft);
    const isMidRight =
      isExistIndexOfString(resizeDir, RESIZE_DIR.midRight);
    const isBottomLeft =
      isExistIndexOfString(resizeDir, RESIZE_DIR.bottomLeft);
    const isBottomMid =
      isExistIndexOfString(resizeDir, RESIZE_DIR.bottomMid);
    const isBottomRight =
      isExistIndexOfString(resizeDir, RESIZE_DIR.bottomRight);

    const isChangeImagePosX =
      isTopLeft || isTopRight || isMidLeft || isMidRight || isBottomLeft || isBottomRight;
    const isChangeImagePosY =
      isTopLeft || isTopMid || isTopRight || isBottomLeft || isBottomMid || isBottomRight;
    const isChangeShapePosX =
      isTopLeft || isTopRight || isMidLeft || isBottomLeft;
    const isChangeShapePosY =
      isTopLeft || isTopMid || isTopRight || isBottomLeft;
    const isChangeShapeWidth =
      isTopLeft || isTopRight || isMidLeft || isMidRight || isBottomLeft || isBottomRight;
    const isChangeShapeHeight =
      isTopLeft || isTopMid || isTopRight || isBottomLeft || isBottomMid || isBottomRight;
    const draging = function(e) {
      if (!shapeStatus.isResize) return;
      const posXInSVG = e.clientX - canvasLeft;
      const posYInSVG = e.clientY - canvasTop;
      const yRatio = Math.abs(posYInSVG - initPosY);
      const xRatio = Math.abs(posXInSVG - initPosX);
      const width = initWidth + xRatio;
      const height = initHeight + yRatio;
      if (isTopLeft) {
        shadowShapeNode.setAttribute('width', width <= 0 ? 1 : width);
        shadowShapeNode.setAttribute('height', height <= 0 ? 1 : height);
        shapeNode.setAttribute('width', width <= 0 ? 1 : width);
        shapeNode.setAttribute('height', height <= 0 ? 1 : height);
        imageNode.setAttribute('x', posXInSVG - imageHafSize);
        imageNode.setAttribute('y', posYInSVG - imageHafSize);
        shapeNode.setAttribute('x', posXInSVG);
        shapeNode.setAttribute('y', posYInSVG);
      }
 
    };

    const dragEnd = function() {
      console.log('resize dragend');
      shapeStatus.isResize = false;
      recreateShadowShape(shapeNode);
      resizeGNode.removeEventListener('mousemove', draging);
      resizeGNode.removeEventListener('mouseup', dragEnd);
    }
  
    canvasNode.addEventListener('mousemove', draging);
    canvasNode.addEventListener('mouseup', dragEnd);
  }

  function rotateShadowShape(rotateGNode) {
    if (!rotateGNode) return;
    let isDragging = true;
    const shadowShape = shadowShapeGNode.children[0].children[0];
    const { width, height } = getShapePositionAndSize(shadowShape);
    const draging = function(e) {
      if (!isDragging) return;
    };

    const dragEnd = function() {
      isDragging = false;
      rotateGNode.removeEventListener('mousemove', draging);
      rotateGNode.removeEventListener('mouseup', dragEnd);
    }
  
    rotateGNode.addEventListener('mousemove', draging);
    rotateGNode.addEventListener('mouseup', dragEnd);
  }

  function handleShadowShapeResizeAndRotate() {
    shadowShapeGNode.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      const target = e.target;
      if (target.tagName !== 'image') return;
      const idAttr = target.parentNode.getAttribute('id');
      if (idAttr && idAttr.indexOf('rotate-image') >= 0) {
        shapeStatus.isRotate = true;
        rotateShadowShape(target.parentNode);
      } else {
        shapeStatus.isResize = true;
        resizeShadowShape(target.parentNode);
      }
    })
  }

  function registerShapeEvents() {
    // 在画布内拖动图形，在松开鼠标时会触发图形click事件，会创建shadow shape
    dragShapeInCanvas();

    // 处理拖放和旋转
    handleShadowShapeResizeAndRotate();

    document.addEventListener('keydown', function(e) {
      // 删除按键
      if (e.keyCode === 8 && selectedShape) {
        shapeGNode.removeChild(selectedShape);
        selectedShape = null;
        shadowShapeGNode.innerHTML = '';
        shapeStatus.isSelected = false;
      }
    });

    // 处理选择shape后取消
    canvasNode.addEventListener('click', function(e) {
      const target = e.target;
      const tagName = target.tagName;
      if (!isSVGElement(target) || tagName === 'svg') {
        console.log('canvasNode click');
        selectedShape = null;
        shadowShapeGNode.innerHTML = '';
        shapeStatus.isSelected = false;
      }
    });

    // 选择画布中某一个图形
    shapeGNode.addEventListener('click', function(e) {
      e.stopPropagation();
      const target = e.target;
      if (!isSVGElement(target)) return;
      console.log('shapeGNode click');
      selectedShape = target.parentNode;
      recreateShadowShape(target);
    });

    // 鼠标移到图形上事件
    shapeGNode.addEventListener('mouseover', function(e) {
      e.stopPropagation();
      const { isResize, isSelected } = shapeStatus;
      if (isSelected || isResize) return;
      const target = e.target;
      if (selectedShape === target) return;
      const tagName = target.tagName;
      if (tagName === 'g') return;
      console.log('shapeGNode mouseover');
      createLineConnectShape(target);
    });

    shapeGNode.addEventListener('mouseout', function(e) {
      e.stopPropagation();
      const { isSelected, isResize } = shapeStatus;
      if (isSelected || isResize) return;
      const target = e.target;
      const tagName = target.tagName;
      if (tagName === 'g') return;
      console.log('shapeGNode mouseout');
      lineConnectGNode.innerHTML = '';
    });

  }



  dragReszieBar();
  createShapeFromSide();
  registerShapeEvents();

})(window);