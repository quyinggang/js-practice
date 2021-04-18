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

  function handleGraphClick() {
    const sideNode = getEleByClass('side');
    const canvasNode = document.getElementById('canvas');
    const { top, left } = canvasNode.getBoundingClientRect();
    sideNode.addEventListener('click', function(e) {
      const gNode = getGNodeOfSVG(e.target);
      if (!gNode) return;
      // 克隆DOM节点
      const newGNode = gNode.cloneNode(true);
      /*
        mx-graph库就是处理每个元素相关属性实现重绘svg图形，这个过程相当复杂
        这里简单处理g下面的元素，只考虑rect和ellipse，并且初始化位置也是静态的
      */
      const shapeNode = newGNode.children[0];
      const tagName = shapeNode.tagName;
      if (tagName === 'rect') {
        shapeNode.setAttribute('x', left + 100);
        shapeNode.setAttribute('y', top + 100);
        shapeNode.setAttribute('width', '120');
        shapeNode.setAttribute('height', '60');
      } else if (tagName === 'ellipse') {
        shapeNode.setAttribute('cx', left + 100);
        shapeNode.setAttribute('cy', top + 100);
        shapeNode.setAttribute('rx', '40');
        shapeNode.setAttribute('ry', '40');
      }

      canvasNode.appendChild(newGNode);
    })
  }

  dragReszieBar();
  handleGraphClick();

})(window);