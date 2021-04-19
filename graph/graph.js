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

  // 图像绘制到画布上的初始尺寸
  const SHAPE_SIZE = {
    RECT: {
      width: 120,
      height: 60
    }
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

  const displayDom = function() {
    if (!node) return;
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
    const imageHalfSize = 9;
    const shadowShapeOutline = createShapeOutline(shapeNode);
    const { x, y, width, height } = getShapePositionAndSize(shapeNode);
    const cursorMap = {
      'nw-resize': [x - imageHalfSize, y - imageHalfSize],
      'n-resize': [x + (width / 2) - imageHalfSize, y - imageHalfSize],
      'ne-resize': [x + width - imageHalfSize, y - imageHalfSize],
      'w-resize': [x - imageHalfSize, y + height / 2 - imageHalfSize],
      'e-resize': [x + width - imageHalfSize, y + height / 2 - imageHalfSize],
      'sw-resize': [x - imageHalfSize, y + height - imageHalfSize],
      's-resize': [x + width / 2 - imageHalfSize, y + height - imageHalfSize],
      'se-resize': [x + width - imageHalfSize, y + height - imageHalfSize]
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
      g.appendChild(image);
      shadowShapeGNode.appendChild(g);
    }
    const rotateImage = createSVGElement('image');
    rotateImage.href.baseVal = 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBzdHJva2U9IiMyOWI2ZjIiIGZpbGw9IiMyOWI2ZjIiIGQ9Ik0xNS41NSA1LjU1TDExIDF2My4wN0M3LjA2IDQuNTYgNCA3LjkyIDQgMTJzMy4wNSA3LjQ0IDcgNy45M3YtMi4wMmMtMi44NC0uNDgtNS0yLjk0LTUtNS45MXMyLjE2LTUuNDMgNS01LjkxVjEwbDQuNTUtNC40NXpNMTkuOTMgMTFjLS4xNy0xLjM5LS43Mi0yLjczLTEuNjItMy44OWwtMS40MiAxLjQyYy41NC43NS44OCAxLjYgMS4wMiAyLjQ3aDIuMDJ6TTEzIDE3Ljl2Mi4wMmMxLjM5LS4xNyAyLjc0LS43MSAzLjktMS42MWwtMS40NC0xLjQ0Yy0uNzUuNTQtMS41OS44OS0yLjQ2IDEuMDN6bTMuODktMi40MmwxLjQyIDEuNDFjLjktMS4xNiAxLjQ1LTIuNSAxLjYyLTMuODloLTIuMDJjLS4xNC44Ny0uNDggMS43Mi0xLjAyIDIuNDh6Ii8+PC9zdmc+';
    rotateImage.setAttribute('width', imageHalfSize * 2);
    rotateImage.setAttribute('height', imageHalfSize * 2);
    rotateImage.setAttribute('x', x + width + 4);
    rotateImage.setAttribute('y', y - imageHalfSize * 2 - 4);
    rotateImage.style.cssText = 'cursor: crosshair;';

    shadowShapeGNode.appendChild(rotateImage);
  }

  function recreateShadowShape(shapeNode) {
    shadowShapeGNode.innerHTML = '';
    createShadowShape(shapeNode);
  }

  function handleGraphClick() {
    const rectInitSize = SHAPE_SIZE.RECT;
    const sideNode = getEleByClass('side');
    const posX = Math.floor(canvasWidth / 2);
    sideNode.addEventListener('click', function(e) {
      const gNode = getGNodeOfSVG(e.target);
      if (!gNode) return;
      // 克隆DOM节点
      const newGNode = gNode.cloneNode(true);
      newGNode.style.cssText="cursor:move";
      /*
        mx-graph库就是处理每个元素相关属性实现重绘svg图形，这个过程相当复杂
        这里简单处理g下面的元素，只考虑rect，并且初始化位置也是静态的存在叠加
      */
      const shapeNode = newGNode.children[0];
      const tagName = shapeNode.tagName;
      if (tagName === 'rect') {
        shapeNode.setAttribute('x', posX - rectInitSize.width / 2);
        shapeNode.setAttribute('y', 100);
        shapeNode.setAttribute('width', rectInitSize.width);
        shapeNode.setAttribute('height', rectInitSize.height);
      }
      recreateShadowShape(shapeNode);
      selectedShape = newGNode;
      shapeGNode.appendChild(newGNode);
    })
  }

  function handleGraphGrag() {
    const rectInitSize = SHAPE_SIZE.RECT;
    let isDragging = false, draggedGNode = null;
    let dragPositionX = 0, dragPositionY = 0;
    const dragingShape = document.getElementById('shape--draging');
    const sideNode = getEleByClass('side');
    const canDragAreaNode = document.getElementById('graph');

    const viewArea = getEleByClass('view');
    const { left: viewLeft } = viewArea.getBoundingClientRect();
    

    const draging = function(e) {
      if (!isDragging) return;
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
    const dragEnd = function() {
      isDragging = false;
      dragingShape.style.cssText='display:none;top:0;left:0;';
      if (dragPositionX >= viewLeft) {
        let posX = canvasLeft + 100, posY = canvasTop + 100;
        const limitRange = [
          canvasLeft + rectInitSize.width / 2,
          canvasTop + rectInitSize.height / 2
        ];
        // 拖拽矩形长度和宽度，注意svg默认坐标系统
        if (dragPositionX >= limitRange[0] && dragPositionY >= limitRange[1]) {
          posX = dragPositionX - limitRange[0];
          posY = dragPositionY - limitRange[1];
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
      }
      canDragAreaNode.removeEventListener('mousemove', draging);
      canDragAreaNode.removeEventListener('mouseup', dragEnd);
    }

    sideNode.addEventListener('mousedown', function(e) {
      const gNode = getGNodeOfSVG(e.target);
      if (!gNode) return;
      isDragging = true;
      draggedGNode = gNode.cloneNode(true);
      canDragAreaNode.addEventListener('mousemove', draging);
      canDragAreaNode.addEventListener('mouseup', dragEnd);
      dragingShape.style.display = 'block';
    })
  }

  function createLineConnectShape(shapeNode) {
    if (!shapeNode) return;
    const imageHalfSize = 2.5;
    const { x, y, width, height } = getShapePositionAndSize(shapeNode);
    const points = {
      'top-left': [x - imageHalfSize, y - imageHalfSize],
      'top-mid': [x + (width / 2) - imageHalfSize, y - imageHalfSize],
      'top-right': [x + width - imageHalfSize, y - imageHalfSize],
      'mid-left': [x - imageHalfSize, y + height / 2 - imageHalfSize],
      'mid-right': [x + width - imageHalfSize, y + height / 2 - imageHalfSize],
      'bottom-left': [x - imageHalfSize, y + height - imageHalfSize],
      'bottom-mid': [x + width / 2 - imageHalfSize, y + height - imageHalfSize],
      'bottom-right': [x + width - imageHalfSize, y + height - imageHalfSize]
    };
    lineConnectGNode.innerHTML = '';
    for (let value of Object.values(points)) {
      const pointGNode = createSVGElement('g');
      const image = createSVGElement('image');
      image.href.baseVal = 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI1cHgiIGhlaWdodD0iNXB4IiB2ZXJzaW9uPSIxLjEiPjxwYXRoIGQ9Im0gMCAwIEwgNSA1IE0gMCA1IEwgNSAwIiBzdHJva2U9IiMyOWI2ZjIiLz48L3N2Zz4=';
      image.setAttribute('x', value[0]);
      image.setAttribute('y', value[1]);
      image.setAttribute('width', 5);
      image.setAttribute('height', 5);
      pointGNode.appendChild(image);
      lineConnectGNode.appendChild(pointGNode);
    }
  }

  function dragShapeInCanvas() {
    let isDragging = false, shapeNode = null;
    const draging = function(e) {
      if (!isDragging) return;
      const posX = e.clientX;
      const posY = e.clientY;
      shapeNode.setAttribute('x', posX - canvasLeft);
      shapeNode.setAttribute('y', posY - canvasTop);
    };
    const dragEnd = function(e) {
      isDragging = false;
      canvasNode.removeEventListener('mousemove', draging);
      canvasNode.removeEventListener('mouseup', dragEnd);
    };

    shapeGNode.addEventListener('mousedown', function(e) {
      const target = e.target;
      if (!isSVGElement(target)) return;
      isDragging = true;
      shapeNode = target;
      canvasNode.addEventListener('mousemove', draging);
      canvasNode.addEventListener('mouseup', dragEnd);
    });
  }

  function registerShapeEvents() {

    dragShapeInCanvas();

    document.addEventListener('keydown', function(e) {
      // 删除按键
      if (e.keyCode === 8 && selectedShape) {
        shapeGNode.removeChild(selectedShape);
        selectedShape = null;
        shadowShapeGNode.innerHTML = '';
      }
    });

    // 处理选择shape后取消
    canvasNode.addEventListener('click', function(e) {
      const target = e.target;
      const tagName = target.tagName;
      if (!isSVGElement(target) || tagName === 'svg') {
        selectedShape = null;
        shadowShapeGNode.innerHTML = '';
      }
    });

    // 选择画布中某一个图形
    shapeGNode.addEventListener('click', function(e) {
      const target = e.target;
      if (!isSVGElement(target)) return;
      selectedShape = target.parentNode;
      recreateShadowShape(target);
    });

    // 鼠标移到图形上事件
    shapeGNode.addEventListener('mouseover', function(e) {
      e.stopPropagation();
      const target = e.target;
      if (selectedShape === target) return;
      const tagName = target.tagName;
      if (tagName === 'g') return;
      createLineConnectShape(target);
    });

    shapeGNode.addEventListener('mouseout', function(e) {
      const target = e.target;
      const tagName = target.tagName;
      if (tagName === 'g') return;
      lineConnectGNode.innerHTML = '';
    });
  }



  dragReszieBar();
  handleGraphClick();
  handleGraphGrag();
  registerShapeEvents();

})(window);