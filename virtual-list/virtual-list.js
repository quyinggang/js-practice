(function() {

  function initData() {
    return new Array(10000).fill(0).map((item, i) => {
      return i + 1;
    });
  }

  /**
   * 简易固定高度虚拟列表，用于启发思路
   * 
   * itemHeight：列表项高度
   * viibleCount: 可见列表数量
   * @returns 
   */
  function VirtualList(data, itemHeight, visibleCount) {
    this.contentNode = null;
    this.data = data || initData();
    this.itemHeight = itemHeight || 40;
    this.visibleCount = visibleCount || 10;
    this.nodeList = [];
  }

  VirtualList.prototype.getCurrentRangeData = function(start) {
    const end = start + this.visibleCount;
    return this.data.slice(start, end);
  };

  VirtualList.prototype.init = function() {
    const startIndex = 0, { itemHeight, visibleCount } = this;
    const contentNode = document.getElementById('list-content');
    const rangeData = this.getCurrentRangeData(startIndex);
    const nodeList = [];
    for (const item of rangeData) {
      const node = document.createElement('div');
      node.className = 'list-item';
      node.innerHTML = item;
      node.style.cssText = `height:${itemHeight}px;line-height:${itemHeight}px`;
      nodeList.push(node);
      contentNode.appendChild(node);
    }

    // 设置scroll容器总高度
    const totalHeight = this.data.length * itemHeight;
    const container = document.getElementById('list-scroll');
    container.style.height = `${totalHeight}px`;
    // 绑定scroll事件
    const scrollEventTarget = document.getElementById('list');
    scrollEventTarget.style.height = `${visibleCount * itemHeight}px`;
    scrollEventTarget.addEventListener('scroll', e => {
      const scrollTop = e.target.scrollTop;
      window.requestAnimationFrame(() => {
        this.updateList(scrollTop);
      })
    });

    this.nodeList = nodeList;
    this.contentNode = contentNode;
  }

  VirtualList.prototype.updateList = function(scrollTop) {
    const { itemHeight, contentNode, nodeList } = this;
    const data = this.getCurrentRangeData(Math.floor(scrollTop / itemHeight));
    let count = 0;
    for (const item of data) {
      nodeList[count].innerHTML = item;
      count++;
    }
    contentNode.style.transform = `translate3d(0, ${scrollTop}px, 0)`;
  }
  
  new VirtualList().init();

})();
