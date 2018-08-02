;(function(root, undefined) {
  const doc = root.document;
  const htmlEle = doc.documentElement;

  const Rellax = function () {
    this.rellaxes = null;
    this.currentPosition = 0;
    this.init();
  };

  Rellax.prototype = {
    init: function() {
      let rellaxes = doc.querySelectorAll('.rellax-element');
      rellaxes = rellaxes ? [...rellaxes] : [];
      this.rellaxes = rellaxes;
      this.currentPosition = 1;
      this.scroll(this.currentPosition);
      this.onEvents();
    },
    scroll: function(val, isTop) {
      this.rellaxes.forEach(item => {
        const speed = item.getAttribute('data-rellax-speed');
        item.style.cssText = `transform: translateY(${speed * val}px)`;
      });
    },
    onEvents: function() {
      const that = this;
      const pos = this.currentPosition;
      window.addEventListener('scroll', function(e) {
        const scrollTop = htmlEle.scrollTop || 
                          window.pageYOffset || 
                          doc.body.scrollTop;
        if (htmlEle.scrollHeight - 5 <= htmlEle.clientHeight + scrollTop) return;
        const isToTop = scrollTop < pos;
        const currPos = isToTop ? scrollTop - pos : pos - scrollTop;
        that.currentPosition = currPos;
        that.scroll(currPos, isToTop);
      });
    }
  };

  new Rellax();

})(window);