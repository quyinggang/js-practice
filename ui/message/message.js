;(function(root) {
  let startZIndex = 1000;
  const on = tools.on;
  const body = document.body;
  const types = [
    {
      state: 'info',
      class: 'fa fa-exclamation-circle'
    }
  ];
  const classes = {
    msg: 'message',
    close: 'fa fa-close message__close',
    isShow: 'is-show'
  };
  let btn = null;
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;

  const Msg = function({type, content, duration, isClose}) {
    this.type = type || 0;
    this.content = content || '这是一条消息提示';
    this.duration = duration || 3000;
    this.isClose = typeof isClose === 'boolean' && isClose ? true : false;
    this.closeNode = null;
    this.msgNode = null;
    this.zIndex = startZIndex++;
    this.init();
  };

  Msg.prototype = {
    init: function() {
      const msg = document.createElement('div');
      const targetType = types[this.type];
      msg.className = `${classes.msg} is-${targetType.state}`;
      if (this.isClose) {
        const close = document.createElement('i');
        close.className = classes.close;
        this.closeNode = close;
      }
      msg.innerHTML = `
        <i class="${targetType.class}"></i>
        <p class="message__content">${this.content}</p>
      `;
      this.closeNode ? msg.appendChild(this.closeNode) : null;
      this.msgNode = msg;
      msg.style.cssText = `z-index:${this.zIndex}`;
      body.appendChild(msg);
      // 保证创建msg之后动画的执行
      setTimeout(() => {
        addClass(msg, classes.isShow);
      }, 30);
    },
    close: function() {
      body.removeChild(this.msgNode);
      this.msgNode.removeEventListener('transitionend', this.close);
    }
  };

  const destory = function(msg) {
    msg.msgNode.addEventListener('transitionend', () => {
      msg.close();
    });
    removeClass(msg.msgNode, classes.isShow);
  };

  /**
   * transitionend：
   *   判断CSS3 transition动画过渡结束事件
   * 
   */
  const initEvents = function() {
    on(btn, {
      'click': function(event) {
        event.stopPropagation();
        let timer = null;
        let msg = new Msg({isClose: true});
        // 处理关闭
        msg.isClose ? on(msg.closeNode, {
          'click': function() {
            clearTimeout(timer);
            destory(msg);
            msg = null;
          }
        }) : null;
        timer = setTimeout(function() {
          destory(msg);
          msg = null;
        }, msg.duration);
      }
    });
  };

  btn = document.querySelector('.btn');
  initEvents();
})(window);