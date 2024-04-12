;(function(root) {
  const { on, addClass, removeClass } = tools;
  const classes = {
    open: 'is-open'
  };

  const createEle = function(className, tag) {
    tag = tag || 'div';
    const dom = document.createElement(tag);
    dom.className = className;
    return dom;
  };

  const MsgBox = function() {
    this.id = 0;
    this.dom = null;
    this.isOpen = false;
    this.modal = null;
    this.content = null;
    this.header = null;
    this.footer = null;
    this.init();
  };

  MsgBox.prototype = {
    init: function() {
      this.content = new Content('这是一个MessageBox');
      this.header = new Header('提示', this);
      this.footer = new Footer(this);
      this.create();
      const box = this.dom;
      [this.header, this.content, this.footer].forEach(item => {
        box.appendChild(item.dom);
      });
      this.on();
    },
    on: function() {
      const that = this;
      on(this.modal, {
        'click': function() {
          that.close();
        }
      })
    },
    create: function() {
      let body = document.body;
      this.modal = createEle('message-box__modal')
      this.dom = createEle('message-box');
      body.appendChild(this.modal);
      body.appendChild(this.dom);
    },
    close: function() {
      removeClass(this.dom, classes.open);
      removeClass(this.modal, classes.open);
    },
    open: function() {
      addClass(this.dom, classes.open);
      addClass(this.modal, classes.open);
    }
  };

  const Header = function(title, parent) {
    this.dom = null;
    this.title = title;
    this.closeIcon = null;
    this.$parent = parent;
    this.init();
  };

  Header.prototype = {
    init: function() {
      const header = createEle('message-box__header');
      const title = createEle('title', 'span');
      title.innerText = this.title;
      this.closeIcon = createEle('fa fa-close', 'i');
      this.dom = header;
      header.appendChild(title);
      header.appendChild(this.closeIcon);
      this.on();
    },
    close: function() {
      this.$parent.close();
    },
    on: function() {
      const that = this;
      on(this.closeIcon, {
        'click': function() {
          that.close();
        }
      })
    }
  };

  const Content = function(text) {
    this.dom = null;
    this.text = text;
    this.init();
  };

  Content.prototype = {
    init: function() {
      const content = createEle('message-box__content');
      content.innerText = this.text;
      this.dom = content;
    }
  };

  const Footer = function(parent) {
    this.dom = null;
    this.cancelBtn = null;
    this.confirmBtn = null;
    this.$parent = parent;
    this.init();
  };

  Footer.prototype = {
    init: function() {
      this.dom = createEle('message-box__footer');
      const cancelBtn = createEle('btn', 'button');
      const confirmBtn = createEle('btn', 'button');
      cancelBtn.innerText = '取消';
      confirmBtn.innerText = '确认';
      this.cancelBtn = cancelBtn;
      this.confirmBtn = confirmBtn;
      this.dom.appendChild(cancelBtn);
      this.dom.appendChild(confirmBtn);
      this.on();
    },
    close: function() {
      this.$parent.close();
    },
    on: function() {
      const that = this;
      on(this.cancelBtn, {
        'click': function() {
          that.close();
        }
      });
      on(this.confirmBtn, {
        'click': function() {
          that.close();
        }
      })
    }
  };

  const msgBox = new MsgBox();
  on(document.querySelector('.btn'), {
    'click': function() {
      msgBox.open();
    }
  });
})(window);