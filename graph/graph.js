(function(root) {

  const getEleByClass = function(className) {
    if (!className) return;
    return document.getElementsByClassName(className)[0];
  };

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
    if (node instanceof SVGElement) {
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
    const gNode = target.children[0];
    return gNode && gNode.tagName === 'g' ? gNode : null;
  }

  function createDashedShapeNodes() {
    const gScaleNode = document.createElement('g');
    const cursorList = [
      'nw-resize',
      'n-resize',
      'ne-resize',
      'w-resize',
      'e-resize',
      'sw-resize',
      's-resize',
      'se-resize'
    ];
    for (let i = 0; i < 8; i++) {
      const imageContainer = document.createElement('image');
      const g = document.createElement('g');
      imageContainer.setAttribute('xlink:href', 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxOHB4IiBoZWlnaHQ9IjE4cHgiIHZlcnNpb249IjEuMSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjUiIHN0cm9rZT0iI2ZmZiIgZmlsbD0iIzI5YjZmMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+');
      g.style.cssText = `cursor:${cursorList[i]}`;
      imageContainer.setAttribute('width', 18);
      imageContainer.setAttribute('height', 18);
      g.appendChild(imageContainer);
      gScaleNode.appendChild(g);
    }

    return gScaleNode;
  }

  function handleGraphClick() {
    const sideNode = getEleByClass('side');
    const canvasNode = document.getElementById('canvas');
    const { width } = canvasNode.getBoundingClientRect();
    const posX = Math.floor(width / 2);
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
        shapeNode.setAttribute('x', posX - 60);
        shapeNode.setAttribute('y', 100);
        shapeNode.setAttribute('width', '120');
        shapeNode.setAttribute('height', '60');
      }
      // const gDashedShapeNode = createDashedShapeNodes();
      // const gContainerNode = document.createElement('g');
      // gContainerNode.appendChild(newGNode);
      // gContainerNode.appendChild(gDashedShapeNode);
      // console.log(gContainerNode);
      canvasNode.appendChild(newGNode);
    })
  }

  function handleGraphGrag() {
    let isDragging = false, draggedGNode = null;
    let dragPositionX = 0, dragPositionY = 0;
    const dragingShape = document.getElementById('shape--draging');
    const sideNode = getEleByClass('side');
    const canDragAreaNode = document.getElementById('graph');
    const canvasNode = document.getElementById('canvas');
    const viewArea = getEleByClass('view');
    const { left: viewLeft } = viewArea.getBoundingClientRect();
    const { top, left } = canvasNode.getBoundingClientRect();

    const draging = function(e) {
      if (!isDragging) return;
      const style = dragingShape.style;
      const posX = e.clientX;
      const posY = e.clientY;
      dragPositionX = posX;
      dragPositionY = posY;
      style.zIndex = 5;
      style.top = `${posY - 30}px`;
      style.left = `${posX - 60}px`;
    }
    const dragEnd = function() {
      isDragging = false;
      const style = dragingShape.style;
      style.display = 'none';
      style.top = 0;
      style.left = 0;
      if (dragPositionX >= viewLeft) {
        let posX = left + 100, posY = top + 100;
        const shapeNode = draggedGNode.children[0];
        const tagName = shapeNode.tagName;
        // 拖拽矩形长度和宽度
        if (dragPositionX > left + 120 && dragPositionY > top + 60) {
          posX = dragPositionX - left - 60;
          posY = dragPositionY - top - 30;
        }
        if (tagName === 'rect') {
          shapeNode.setAttribute('x', posX);
          shapeNode.setAttribute('y', posY);
          shapeNode.setAttribute('width', '120');
          shapeNode.setAttribute('height', '60');
        }
        draggedGNode.style.cssText="cursor:move";
        canvasNode.appendChild(draggedGNode);
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

  dragReszieBar();
  handleGraphClick();
  handleGraphGrag();

})(window);