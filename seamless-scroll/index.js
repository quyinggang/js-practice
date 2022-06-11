class SeamlessScroll {
  constructor($el, config) {
    if (!($el instanceof HTMLElement)) {
      throw new Error('非法滚动内容节点')
    }
    const defaultConfig = {
      step: 1,
      interval: false,
      distance: 10,
      wait: 1000
    }
    this.$el = $el
    this.rAF = null
    this.timer = null
    this.hover = false
    this.height = null
    this.translateY = 0
    this.config = Object.assign({}, defaultConfig, config)
    this.init()
  }

  init() {
    this.render()
    this.setBoundingRect()
    this.bindEvents()
    this.start()
  }

  render() {
    const $el = this.$el
    const html = $el.innerHTML
    $el.innerHTML = `${html}${html}`
  }

  setBoundingRect() {
    const $el = this.$el
    this.height = $el.offsetHeight
  }

  bindEvents() {
    const $el = this.$el
    $el.addEventListener('mouseenter', () => {
      this.hover = true;
      this.cancel()
    })
    $el.addEventListener('mouseleave', () => {
      this.hover = false
      this.start()
    })
  }

  cancel() {
    this.rAF && cancelAnimationFrame(this.rAF)
  }

  start() {
    this.cancel()
    this.rAF = requestAnimationFrame(this.infiniteScroll.bind(this))
  }

  scroll() {
    const { height, config, $el, translateY } = this
    const realHeight = height / 2
    if (Math.abs(translateY) >= realHeight) this.translateY = 0
		this.translateY -= config.step
    $el.style.transform = `translate3d(0, ${this.translateY}px, 0)`
  }

  waitScroll() {
    const { translateY  } = this
    const { wait, distance } = this.config
    const delay = Math.max(0, wait)
    if (Math.abs(translateY) % distance === 0) {
      this.timer = setTimeout(() => {
        this.start()
      }, delay)
    } else {
      this.start()
    }
  }
  
  infiniteScroll() {
    const timer = this.timer
    const { interval } = this.config
    this.scroll()
    timer && clearTimeout(timer)
    if (interval) {
      this.waitScroll()
    } else {
      this.start()
    }
  }

}

export default SeamlessScroll