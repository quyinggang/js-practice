// 逻辑参考自countUp.js

class CountUp {
  constructor($el, endValue, config) {
    this.$el = $el
    this.endValue = this.validateNumber(endValue)
    this.startValue = 0
    this.frameValue = 0
    this.finalEndValue = null
    this.countDown = false
    this.startTime = 0
    this.rAF = null
    this.config = Object.assign({}, {
      separator: ',',
      decimal: '.',
      decimalDigit: 2,
      duration: 2000,
      useEasing: true
    }, config || {})
    this.duration = this.config.duration || 2000
    this.useEasing = this.config.useEasing || true
    this.start()
  }

  render(value) {
    const text = this.formatNumber(value)
    this.$el.innerText = text
  }

  toFixed(value, digit) {
    const formattedValue = String(value)
    let result = formattedValue
    const index = formattedValue.indexOf('.')
    if (index >= 0) {
      result = `${formattedValue.slice(0, index + 1)}${formattedValue.slice(index + 1, index + 1 + digit)}`
    } else {
      const suffix = digit > 0 ? '.'.padEnd(digit + 1, '0') : ''
      result = formattedValue + suffix
    }
    return result
  }

  validateNumber(value) {
    const formattedValue = Number(value)
    return Number.isNaN(formattedValue) ? '-' : formattedValue
  }

  resetDuration() {
    this.startTime = null
    this.duration = this.config.duration
  }

  formatNumber(value) {
    const { separator, decimal, decimalDigit } = this.config
    const neg = value < 0 ? '-' : ''
    const result = this.toFixed(Math.abs(value), decimalDigit)
    const parts = result.split('.')
    const decimalPart = parts.length > 1 ? `${decimal}${parts[1]}` : ''
    const integerPart = this.processThousand(parts[0], separator)
    return `${neg}${integerPart}${decimalPart}`
  }

  // 处理千分位
  processThousand(value, separator = ',') {
    let result = ''
    for (let index = 0, len = value.length; index < len; index++) {
      if (index !== 0 && (index % 3) === 0) {
          result = separator + result;
      }
      result = value[len - index - 1] + result;
    }
    return result || value
  }

  start() {
    this.hastenEasing()
    this.rAF = requestAnimationFrame(this.count.bind(this));
  }

  hastenEasing() {
    const { finalEndValue, endValue, startValue } = this
    const duration = this.config.duration
    const end = finalEndValue ? finalEndValue : endValue;
    const countDown = startValue > endValue
    const animateAmount = end - startValue;
    // 数值差距大时加速
    if (Math.abs(animateAmount) > 999) {
        this.finalEndValue = end;
        const up = (this.countDown) ? 1 : -1;
        this.endValue = end + (up * 333);
        this.duration = duration / 2;
    } else {
        this.endValue = end;
        this.finalEndValue = null;
    }
    this.useEasing = this.finalEndValue ? false : this.config.useEasing
    this.countDown = countDown
  }

  update(newValue) {
    const frameValue = this.frameValue
    cancelAnimationFrame(this.rAF);
    this.startTime = null;
    this.endValue = this.validateNumber(newValue);
    if (this.endValue === frameValue) {
      return;
    }
    this.startValue = frameValue;
    if (!this.finalEndValue) {
        this.resetDuration();
    }
    this.finalEndValue = null;
    this.start()
  }

  easing(currentTime, beginValue, changeValue, duration) {
    return changeValue * (-Math.pow(2, -10 * currentTime / duration) + 1) * 1024 / 1023 + beginValue;
  }

  count(timestamp) {
    let frameValue = null
    const { startValue, endValue, finalEndValue, countDown, startTime, useEasing, duration } = this
    const { decimalDigit } = this.config
    if (!startTime) {
      this.startTime = timestamp
    }
    const progress = timestamp - this.startTime;
    if (useEasing) {
      frameValue = countDown
        ? startValue - this.easing(progress, 0, startValue - endValue, duration)
        : this.easing(progress, startValue, endValue - startValue, duration)
    } else {
      frameValue = countDown
        ? startValue - ((startValue - endValue) * (progress / duration))
        : startValue + ((endValue - startValue) * (progress / duration))
    }
    frameValue = countDown ? Math.max(frameValue, endValue) : Math.min(frameValue, endValue)
    frameValue = Number(this.toFixed(frameValue, decimalDigit))
    this.frameValue = frameValue
    this.render(frameValue)
    if (progress < duration) {
      this.rAF = requestAnimationFrame(this.count.bind(this));
    } else if (finalEndValue !== null) {
      this.update(finalEndValue);
    }
  }
}

export default CountUp