;(function(root) {
  const { on, addClass, removeClass } = tools;
  const classes = {
    scroll: 'is-scroll'
  };

  /**
   * Scroll对象
   */
  const Scroll = function() {
    this.dom = null;
    this.wrap = null;
    this.isScroll = false;
    this.bar = null;
    this.init();
  };

  Scroll.prototype = {
    init: function() {
      const scroll = document.querySelector('.scrollbar');
      const child = scroll.children;
      this.dom = scroll;
      this.wrap = child[0];
      // 计算bar的高度，核心点
      const thumbHeight = (child[0].clientHeight / child[0].scrollHeight) * 100;
      this.bar = new Bar(this, child[1], thumbHeight < 100 ? thumbHeight : 0);
      this.on();
    },
    on: function() {
      const that = this;
      on(this.wrap, {
        'scroll': function() {
          that.changeState();
          // 计算需要scroll的距离, 核心点
          const top = (this.scrollTop / this.clientHeight) * 100;
          that.bar.scroll(top);
        }
      })
    },
    changeState: function() {
      // 滚动时显示滚动条
      addClass(this.dom, classes.scroll);
    }
  };

  const Bar = function(parent, dom, height) {
    this.dom = dom;
    this.width = 0;
    this.thumbHeight = height;
    this.thumb = null;
    this.parent = parent;
    this.init();
  };

  Bar.prototype = {
    init: function() {
      const dom = this.dom;
      this.width = dom.offetWidth;
      this.thumb = dom.children[0];
      this.scroll();
      this.on();
    },
    on: function() {
      const that = this;
      on(this.dom, {
        'click': function(event) {
          event.stopPropagation();
          const { top, height } = this.getBoundingClientRect();
          // 当前点击位置在滚动条可视区域占比
          // （当前点击位置 - bar距离浏览器窗口top值 - thumb的高度1/2）/ bar的高度
          const pres = (event.clientY - top - (that.thumb.offsetHeight / 2)) / height;
          // 计算scrollTop，比例 * 实际内容总高度
          const scrollTop = pres * that.parent.wrap.scrollHeight;
          that.parent.changeState();
          // 注意这里：此处是设置wrap的scrollTop,会触发wrap绑定的scroll事件， 这是关键
          that.parent.wrap.scrollTop = scrollTop;
         }
      })
    },
    scroll: function(top) {
      // 确定bar的高度以及scrollTop的值
      this.thumb.style.cssText = `height:${this.thumbHeight}%;transform:translateY(${top}%)`;
    }
  };

  new Scroll();
})(window);
