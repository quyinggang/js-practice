;(function(root) {
  let startZIndex = 1000;
  let startTop = -60;
  let startId = 0;
  let step = 90;
  let timer = null;
  const duration = 4500;
  const on = tools.on;
  const body = document.body;
  const types = [
    {
      state: 'info',
      class: 'fa fa-exclamation-circle'
    }
  ];
  const classes = {
    notice: 'notification',
    close: 'fa fa-close noticifition__close',
    isShow: 'is-show'
  };
  const addClass = tools.addClass;
  const removeClass = tools.removeClass;
  const notices = [];

  const Notification = function({type, content}) {
    this.id = (startId++);
    this.type = type || 0;
    this.content = content || '这是一条消息提示';
    this.closeNode = null;
    this.msgNode = null;
    this.zIndex = startZIndex++;
    startTop += 90;
    this.top = startTop;
    this.init();
  };

  Notification.prototype = {
    init: function() {
      const notice = document.createElement('div');
      const targetType = types[this.type];
      notice.className = `${classes.notice} is-${targetType.state}`;
      if (this.isClose) {
        const close = document.createElement('i');
        close.className = classes.close;
        this.closeNode = close;
      }
      notice.innerHTML = `
        <i class="${targetType.class}"></i>
        <p class="message__content">${this.content}</p>
      `;
      this.closeNode ? notice.appendChild(this.closeNode) : null;
      this.msgNode = notice;
      notice.style.cssText = `top:${this.top}px;z-index:${this.zIndex}`;
      body.appendChild(notice);
      // 保证创建msg之后动画的执行
      setTimeout(() => {
        addClass(notice, classes.isShow);
      }, 30);
    },
    on: function() {
      const that = this;
      on(this.closeNode, {
        'click': function() {
          destory(that);
        }
      });
    },
    desc: function() {
      const { msgNode } = this;
      const top = Math.max(parseInt(msgNode.style.top, 10) - 90, 30);
      this.top = top;
      msgNode.style.top = `${top}px`;
    },
    close: function() {
      if (body.contains(this.msgNode)) body.removeChild(this.msgNode);
      this.msgNode.removeEventListener('transitionend', this.close);
    }
  };

  const destory = function(notice) {
    notice.msgNode.addEventListener('transitionend', () => {
      notice.close();
    });
    notices.forEach(item => {
      console.log(item.top + '----');
      item.desc();
      console.log(item.top);
    });
    removeClass(notice.msgNode, classes.isShow);
    setTimeout(function() {
      descNotification(notices);
    }, duration);
  };

  const descNotification = function(notices) {
    notices.length ? destory(notices.shift()) : startTop = -60;
  };

  const initEvents = function() {
    let timer = null;
    const btn = document.querySelector('.btn');
    on(btn, {
      'click': function(event) {
        event.stopPropagation();
        isStartTimer = false;
        let notice = new Notification({isClose: true});
        notices.push(notice);
        timer = !timer ? setTimeout(function() {
          descNotification(notices);
          timer = null;
        }, duration) : null;
      }
    });
  };
  
  initEvents();
})(window);