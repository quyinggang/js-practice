const defaultConfig = {
  duration: 800
};
let taskId = 0;
const minMax = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
}

/**
 * 简易JavaScript动画引擎，代码逻辑参考anime.js
 * - Animation：动画类，目前只支持translateX
 * - Task：根据动画创建对应的Task，实现动画具体执行逻辑
 * - Scheduler：调度器，实现任务调度执行
 */
class Scheduler {
  constructor() {
    this.pendingTasks = [];
    this.activeTasks = [];
    this.raf = null;
  }
  step(time) {
    let currentIndex = 0;
    const activeTasks = this.activeTasks;
    let limit = activeTasks.length;
    // 遍历动画任务
    // - 任务结束则推出
    // - 如果还存在活动中的任务则继续使用requestAnimationFrame执行动画
    while (currentIndex < limit) {
      const task = activeTasks[currentIndex];
      if (task.isComplete) {
        activeTasks.splice(currentIndex, 1);
        currentIndex -= 1;
        limit -= 1;
      } else {
        task.tick(time);
      }
      currentIndex += 1;
    }
    activeTasks.length > 0 ? this.run() : (this.raf = null);
  }
  run() {
    this.raf = window.requestAnimationFrame(this.step.bind(this));
  }
  start() {
    const newActiveTasks = this.pendingTasks.filter(task => task.isActive);
    this.activeTasks = [...this.activeTasks, ...newActiveTasks];
    this.run();
  }
  push(task) {
    this.pendingTasks.push(task);
  }
}

class Task {
  constructor(config) {
    this.id = config.id;
    this.elements = config.elements;
    this.tween = {
      from: 0,
      to: config.translateX,
      delay: config.delay,
      duration: config.duration
    }
    this.isActive = false;
    this.startTime = 0;
    this.currentTime = 0;
    this.currentValue = 0;
    this.isComplete = false;
  }
  run(engineDuration) {
    const { elements, tween, currentTime } = this
    const { duration, delay } = tween;
    // 处理delay逻辑
    if (engineDuration <= delay && currentTime !== 0) {
      return;
    }
    /*
      动画核心逻辑
      - 动画执行完成后设置状态
      - 执行中则计算当前的value值并设置DOM Style
    */
    const currentDuration = engineDuration - delay;
    if (currentDuration <= duration) {
      const { from, to } = tween;
      // 根据当前时长和总时长计算出占比
      const elapsed = minMax(currentDuration, 0, duration) / duration;
      // 可以应用不同的运行效果，即使用运动效果函数改变elapsed值
      const eased  = Number.isNaN(elapsed) ? 1 : elapsed;
      const value = from + (eased * (to - from));
      this.currentValue = value;
      for (const element of elements) {
        element.style.transform = `translateX(${value}px)`;
      }
    }
    if (currentDuration >= duration) {
      this.isComplete = true;
      this.isActive = false;
      this.startTime = 0;
    }
  }
  tick(time) {
    this.currentTime = time;
    if (this.startTime === 0) {
      this.startTime = time;
    }
    // 计算动画开始到本次Tick的时长
    this.run(this.currentTime - this.startTime);
  }
  active() {
    this.isActive = true;
  }
  restart() {
    this.startTime = 0;
    this.isComplete = false;
  }
}

const scheduler = new Scheduler();

class Animation {
  constructor(userConfig) {
    const checkedResult = this.checkConfig(userConfig);
    if (!checkedResult.isValid) {
      throw new Error(checkedResult.message);
    }
    this.config = Object.assign({}, defaultConfig, userConfig);
    this.task = this.createTask();
    this.schedulerTask();
  }
  checkConfig(config = {}) {
    const targets = config.targets;
    const isValidTargets =
      Array.isArray(targets) || typeof targets === "string";
    return {
      isValid: isValidTargets,
      message: isValidTargets ? "" : "targets is not valid",
    };
  }
  createTask() {
    const { targets, ...other } = this.config;
    const elements = [];
    const selectorList = Array.isArray(targets) ? [...targets] : [targets];
    selectorList.forEach((item) => {
      if (item instanceof Element) {
        elements.push(item);
      } else {
        const result = document.querySelectorAll(item);
        elements.push(...(result || []));
      }
    });
    taskId += 1;
    return new Task({
      id: taskId,
      elements,
      ...other
    });
  }
  schedulerTask() {
    scheduler.push(this.task);
  }
  play() {
    this.task.active();
    scheduler.start();
  }
  replay() {
    this.task.restart();
    this.play();
  }
}

export default Animation;
