(function (window) {

    /**
     * 简易懒加载demo，仅用于启发思路
     */

    const defaultSettings = {
        src: "data-src",
        lazyClass: "lazyload",
        loadedClass: 'lazyloaded',
        root: null,
        rootMargin: "0px",
        threshold: 0.2
    };

    function LazyLoad(options) {
        this.settings = Object.assign(defaultSettings, options || {});
        this.images = [...document.getElementsByClassName(this.settings.lazyClass)];
        this.count = this.images.length;
        this.observer = null;
        this.init();
    }

    LazyLoad.prototype.init = function() {
      const self = this;
      const { images, settings } = self;
      const { root, rootMargin, threshold } = settings;
      if (!window.IntersectionObserver) {
        self.observer = new window.IntersectionObserver(entries => {
          entries.forEach(({ isIntersecting, target }) => {
            // 元素出现在可见区域中
            if (isIntersecting) {
              // 已加载的就不再监听，否则在滚动时会重复触发
              self.observer.unobserve(target);
              self.load(target);
            }
          })
        }, { root, rootMargin, threshold });

        // 监听DOM节点
        images.forEach(imageNode => self.observer.observe(imageNode));
      } else {
        if (!root) return;
        const { bottom: viewportLimit } = root.getBoundingClientRect();
        this.scrollListener(viewportLimit);
        root.addEventListener('scroll', () => {
          self.scrollListener(viewportLimit);
        })
      }
    };

    LazyLoad.prototype.scrollListener = function(viewportLimit) {
      if (this.count <= 0) return;
      const { images, settings: { loadedClass }} = this;
      window.requestAnimationFrame(() => {
        // 简单处理下垂直方向，不考虑水平方向以及全局滚动情况
        images.forEach(item => {
          if (item.className.indexOf(loadedClass) !== -1) return;
          const { top } = item.getBoundingClientRect();
          // 注册scroll事件的容器底部与每一个元素的顶部距离做比较，当元素出现在可视区域内必然小于rootBottom
          if (viewportLimit > top) {
            this.load(item);
            this.count--;
          }
        })
      });
    };

    LazyLoad.prototype.load = function(target) {
      const { src, lazyClass, loadedClass } = this.settings;
      const className = target.className.replace(
        lazyClass.replace('.', '').trim(),
        ''
      ).trim();
      const imageUrl = target.getAttribute(src);
      imageUrl && target.setAttribute('src', imageUrl);
      // 设置加载完后后class
      target.className = `${className} ${loadedClass}`;
    };

    window.LazyLoad = LazyLoad;
  })(window);