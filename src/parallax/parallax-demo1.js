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
      let rellaxes = doc.querySelectorAll('.rellax');
      rellaxes = rellaxes ? [...rellaxes] : [];
      this.rellaxes = rellaxes;
      this.currentPosition = -200;
      this.scroll(this.currentPosition);
      this.onEvents();
    },
    scroll: function(val, isTop) {
      this.rellaxes.forEach(item => {
        item.style.cssText = `background: url(../images/parallax.jpg) center ${val}px no-repeat`;
      });
    },
    onEvents: function() {
      const that = this;
      const pos = this.currentPosition;
      window.addEventListener('scroll', function(e) {
        const scrollTop = doc.documentElement.scrollTop || 
                          window.pageYOffset || 
                          doc.body.scrollTop;
        if (htmlEle.scrollHeight - 5 <= htmlEle.clientHeight + scrollTop) return;
        const isToTop = scrollTop < pos;
        const currPos = isToTop ? scrollTop - pos : pos + scrollTop;
        that.currentPosition = currPos;
        that.scroll(currPos, isToTop);
      });
    }
  };

  new Rellax();

})(window);