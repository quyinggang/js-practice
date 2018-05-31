;(function(root) {
  let carousel = null;
  const document = root.document;
  const { on, addClass, removeClass } = tools;
  const classes = {
    animating: 'is-animating',
    active: 'is-active'
  };
  let timer = null;

  /**
   * 改变index, 计算没有item的translate偏移量（核心）
   * @param index 位置下标
   * @param activeIndex 当前item的下标
   * @param length  所有item的个数    
   */
  const computedTranslate = function(index, activeIndex, length) {
    if (activeIndex === 0 && index === length - 1) {
      return -1;
    } else if (activeIndex === length - 1 && index === 0) {
      return length;
    } else if (index < activeIndex - 1 && activeIndex - index >= length / 2) {
      return length + 1;
    } else if (index > activeIndex + 1 && index - activeIndex >= length / 2) {
      return -2;
    }
    return index;
  };

  /**
   * 函数节流和去抖
   * @param  {[type]}   delay        延时
   * @param  {[type]}   noTrailing   最后一次是否调用callback， true不执行
   * @param  {Function} callback     回调函数
   * @param  {[type]}   debounceMode 模式：false -> throttle true -> debounce
   *
   * throttle-debounce源码
   * 分为如下几种情况：
   * - 300 true cb true => exec，没有节流效果
   * - 300 true cb => 只执行elapsed > delay部分
   * - 300 false cb => 如上, 如果elpsed < delay 会执行timeoutID设置部分
   * - 300 false cb true => exec、timeoutID部分
   */
  const throttle = function(delay, noTrailing, callback, debounceMode) {
    // 定时器ID
    var timeoutID;
    // 上一次执行函数的时间
    var lastExec = 0;
    function wrapper () {
      var self = this;
      // 计算当前触发与上一次执行函数之间时间间隔
      var elapsed = Number(new Date()) - lastExec;
      var args = arguments;

      // 执行函数并设置触发时间为当前时间
      function exec () {
        lastExec = Number(new Date());
        callback.apply(self, args);
      }

      function clear () {
        timeoutID = undefined;
      }

      // debounce时，第一次主动触发
      if ( debounceMode && !timeoutID ) {
        exec();
      }

      // 清除当前定时器
      if ( timeoutID ) {
        clearTimeout(timeoutID);
       }
      if ( debounceMode === undefined && elapsed > delay ) {
        exec();
      } else if ( noTrailing !== true ) {
        timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
      }
    }
    return wrapper;
  };

  const Carousel = function(autoPlay) {
    this.dom = null;
    this.items = null;
    this.indicators = null;
    this.activeIndex = 0;
    this.leftDom = null;
    this.rightDom = null;
    this.init();
  };

  Carousel.prototype = {
    init: function() {
      const dom = document.querySelector('.carousel');
      this.dom = dom;
      const items = [...dom.children[0].children];
      const indicators = dom.children[1];
      const directDoms = items.slice(-2);
      items.splice(-2);
      this.leftDom = directDoms[0];
      this.rightDom = directDoms[1];
      this.items = items.map((item, i) => {
        return new CarouselItem({ 
          parent: this, 
          dom: item, 
          width: item.offsetWidth, 
          isActive: !i,
          index: i
        });
      });
      this.indicators = [...indicators.children].map((item, i) => {
        return new Indicator(this, item, i, !i);
      });
      this.on();
      this.setItemsPosition();
    },
    on: function() {
      const that = this;
      const _traggle = throttle(300, true, type => {
        type === 'left' ? that.prev() : that.next();
      });
      on(this.leftDom, {
        'click': function() {
          _traggle('left');
        }
      });
      on(this.rightDom, {
        'click': function() {
          _traggle('right');
        }
      });
    },
    prev: function() {
      const { activeIndex, items } = this;
      const targetIndex = activeIndex - 1;
      this.activeIndex = targetIndex < 0 ? items.length - 1 : targetIndex;
      this.setItemsPosition();
    },
    next: function() {
      const { activeIndex, items } = this;
      const targetIndex = activeIndex + 1;
      this.activeIndex = targetIndex > items.length - 1 ? 0 : targetIndex;
      this.setItemsPosition();
    },
    clear: function() {
      const { activeIndex } = this;
      // 移除除了当前actiev之外的所有is-animating类
      this.items.forEach(item => {
        !item.isActive ? removeClass(item.dom, classes.animating) : null;
        item.isActive = activeIndex === item.index;
      });
      // 与上类似
      this.indicators.forEach(item => {
        item.isActive = activeIndex === item.index;
        removeClass(item.dom, classes.active);
      });
    },
    setItemsPosition: function() {
      const { activeIndex, items, indicators } = this;
      const targetIndircator = indicators[activeIndex];
      this.clear();
      items[activeIndex].isActive = true;
      targetIndircator.isActive = true;
      targetIndircator.setActive();
      items.forEach(item => {
        item.computedTranslate();
        item.isActive ? addClass(item.dom, classes.animating) : null;
        item.dom.style.cssText = `transform:translateX(${item.translate}px);`;
      });
    }
  };

  const CarouselItem = function(params) {
    const { parent, dom, width, isActive, index} = params;
    this.dom = dom;
    this.width = width;
    this.isActive = isActive
    this.translate = 0;
    this.index = index;
    this.parent = parent;
  };

  CarouselItem.prototype = {
    // 核心，计算translate
    computedTranslate: function() {
      const { index, parent, width } = this; 
      const { activeIndex, items } = parent;
      const computedIndex = computedTranslate(index, activeIndex, items.length);
      this.translate = width * (computedIndex - activeIndex);
    }
  };

  const Indicator = function(parent, dom, index, isActive) {
    this.dom = dom;
    this.index = index;
    this.isActive = isActive;
    this.parent = parent;
    this.on();
    this.setActive();
  };

  Indicator.prototype = {
    on: function() {
      const that = this;
      on(this.dom, {
        'click': function() {
          that.parent.activeIndex = that.index;
          that.parent.setItemsPosition();
        }
      })
    },
    setActive: function() {
      this.isActive ? addClass(this.dom, classes.active) : null;
    }
  };

  new Carousel();
})(window);