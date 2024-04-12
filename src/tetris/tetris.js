!(function(root, undefined) {
  const tools = {};
  let timer = null;
  let screenClikTimer = null;
  let shapeCache = null;
  const shapeCellPos = {};
  const shapeIndex = ['I', 'J', 'T', 'L', 'Z', 'O', 'S'];
  const shapes = {
    I: {rotateCount: 2, data: [[1, 1, 1, 1]]},
    J: {rotateCount: 4, data: [[1, 0, 0], [1, 1, 1]]},
    T: {rotateCount: 4, data: [[0, 1, 0], [1, 1, 1]]},
    L: {rotateCount: 4, data: [[0, 0, 1], [1, 1, 1]]},
    Z: {rotateCount: 2, data: [[1, 1, 0], [0, 1, 1]]},
    O: {rotateCount: 1, data: [[1, 1], [1, 1]]},
    S: {rotateCount: 2, data: [[0, 1, 1], [1, 1, 0]]}
  };
  let boards = null;
  let lineHeadIndex = null;
  const config = {
    x: -1,
    y: 8,
    line: 26,
    row: 18,
    speed: 18,
    levelSpeedGap: 6,
    time: 30,
    levelScore: 300,
    baseScore: 100
  };

  const classes = {
    on: 'on',
    cell: 'cell',
    over: 'over',
    title: 'title',
    hidden: 'hidden',
    screen: 'screen',
    level: 'detail-level',
    score: 'detail-score',
    line: 'detail-line',
    next: 'detail-next'
  };

  /**
   * lines: 总行数
   * rows: 总列数
   * screenDom: 游戏区域DOM节点
   * titleDom: 游戏状态提示区域DOM节点
   * levelDom: 等级区域DOM节点
   * nextDom: 下一个形状显示区域DOM节点
   * lineDom: 消除行数区域DOM节点
   * scoreDom: 分数区域DOM节点
   * cells: 块DOM数组
   * nextAreaCells: 下一个显示区域块DOM数组
   * currentShape: 当前俄罗斯形状
   * nextShape: 下一个俄罗斯形状
   * isPlay: 游戏是否正在进行
   * isOver: 游戏是否结束
   * score: 分数
   *   一次性消除多行：line * 200, 一次性消除一行：100
   * clearLines: 消除行数
   * level: 等级
   *   分为1、2、3三级
   */
  let Tetris = function() {
    this.lines = config.line;
    this.rows = config.row;
    this.screenDom = null;
    this.titleDom = null;
    this.levelDom = null;
    this.nextDom = null;
    this.lineDom = null;
    this.scoreDom = null;
    this.cells = null;
    this.nextAreaCells = [];
    this.currentShape = null;
    this.nextShape = null;
    this.isPlay = false;
    this.isOver = false;
    this.score = 0;
    this.level = 1;
    this.clearLines = 0;
  };

  let tp = Tetris.prototype;

  tp.init = function() {
    let screen = document.querySelector(`.${classes.screen}`);
    if (!screen) {
      throw new Error('游戏区域不存在');
    }
    let nextDom = document.querySelector(`.${classes.next}`);
    let lineDom = document.querySelector(`.${classes.line}`);
    let scoreDom = document.querySelector(`.${classes.score}`);
    let levelDom = document.querySelector(`.${classes.level}`);
    this.screenDom = screen;
    this.nextDom = nextDom;
    this.lineDom = lineDom;
    this.scoreDom = scoreDom;
    this.levelDom = levelDom;
    tools.initScreen.call(this);
    tools.initEvents.call(this);
    tools.initShapeShow.call(this);
  };

  // 创建俄罗斯形状
  tp.create = function(type) {
    // 缓存形状
    let {shape, area, cellXY} = shapeCache && shapeCache[type] ? shapeCache[type] : (() => {
      cache = {};
      let sh = shapeIndex[type];
      let area = shapes[sh].data;
      let allCellPos = tools.getShapeCellPos(area, [config.x, config.y]);
      cache[type] = {
        shape: sh,
        area: area,
        cellXY: allCellPos
      };
      return cache[type];
    })();
    // 等级对应速度的设置
    let speed = this.level > 1 ? config.speed - (this.level - 1) * config.levelSpeedGap : config.speed;
    return new Shape(shape, area, cellXY, speed);
  };

  // 开始游戏
  tp.start = function() {
    // 构建形状
    let currentShape = this.currentShape;
    let nextShape = this.nextShape;
    this.currentShape = currentShape ? currentShape : this.create(tools.getShapeIndex());
    this.nextShape = nextShape ? nextShape : this.create(tools.getShapeIndex());
    this.currentShape.isPause = false;
    tools.setNextShape.call(this);

    // 每隔40s开启一次下落
    timer = setInterval(() => {
      let currentShape = this.currentShape;
      // 使用defer使得下落更可控
      let isDrop = currentShape.defer === currentShape.speed;
      isDrop ? (() => {
        currentShape.isPause ? (() => {
          clearInterval(timer);
          tools.boardLayout(currentShape.cellXY);
          tools.clearLine.call(this);
          if (this.level > 1) {
            this.nextShape.speed = (this.level - 1) * config.speed - config.levelSpeedGap;
          }
          this.currentShape = this.nextShape;
          this.nextShape = null;
          this.isOver = tools.checkGameOver();
          if (this.isOver) {
            this.stop();
            tools.setTitle.call(this);
            return;
          }
          this.start();
        })() : (() => {
          tools.step({attr: 'x', step: 1}, this.currentShape);
          currentShape.defer = 0;
        })();
      })() : currentShape.defer++;
      this.draw();
    }, config.time);
  };

  // 暂停
  tp.stop = function() {
    clearInterval(timer);
    this.isPlay = false;
  };

  // 绘制
  tp.draw = function() {
    let {cellXY} = this.currentShape;
    let cells = this.cells;
    // 清除下落的路径
    cells.forEach((cell, index) => {
      if (boards[index] === 0) {
        tools.removeClass(cell, classes.on);
      }
    });
    // 设置形状累积显示
    cellXY.forEach(cell => {
      if (cell.x >= 0) {
        tools.addClass(cells[tools.getIndex(cell.x, cell.y)], classes.on);
      }
    });
  };

  // 下一局游戏开始前清屏
  tp.clear = function() {
    this.nextShape = null;
    this.isOver = false;
    this.score = 0;
    this.clearLines = 0;
    this.cells.forEach((cell, index) => {
      boards[index] = 0;
      tools.removeClass(cell, classes.on);
    });
    tools.initShapeShow.call(this);
    tools.addClass(this.titleDom, classes.hidden);
    this.start();
  };
  /**
   * type     类型
   * areaData 形状区域
   * cellXY   形状坐标
   * speed    速度
   * origin   中心点
   * rotateIndex(暂未使用)
   * isPause  是否是暂停状态
   * defer    下落处理
   */
  let Shape = function(type, areaData, cellXY, speed) {
    this.type = type;
    this.areaData = areaData;
    this.cellXY = cellXY;
    this.origin = [config.x, config.y];
    this.speed = speed || config.speed;
    this.rotateIndex = 1;
    this.isPause = true;
    this.defer = 0;
  };
  let sp = Shape.prototype;

  // 形状变换
  sp.changeShape = function() {
    this.type && this.type !== 'O' ? (() => {
      let rotateIndex = this.rotateIndex;
      let count = shapes[this.type].rotateCount;
      this.rotateIndex = rotateIndex + 1 > count ? 1 : rotateIndex + 1;
      tools.rotateShape(this, rotateIndex - count === 1 ? true : false);
    })() : '';
  };

  // 处理向下、左、右运动
  sp.move = function(dir) {
    let step = null;
    switch(dir) {
    case 'left':
      step = {attr: 'y', step: -1};
      break;
    case 'right':
      step = {attr: 'y', step: 1};
      break;
    case 'down':
      (() => {
        if (this.speed !== config.speed) {
          this.quicken(1); 
        }
        step = {attr: 'x', step: 1};
      })();
    }
    step ? tools.step(step, this) : '';
  };

  // 加速
  sp.quicken = function(speed) {
    this.speed = speed;
    this.defer = 0;
  };

  // 构建游戏区HTML
  tools.initScreen = function() {
    let cells = [];
    boards = [];
    lineHeadIndex = [];
    let {line, row} = config;
    for (let index = 0; index < line * row; index++) {
      let cell = document.createElement('span');
      tools.addClass(cell, classes.cell);
      cells.push(cell);
      boards.push(0);
      if (index % 18 === 0) {
        lineHeadIndex.push(index);
      }
      this.screenDom.appendChild(cell);
    }
    for (let index = 0; index < 2; index++) {
      let line = document.createElement('p');
      for (let r = 0; r < 4; r++) {
        let cell = document.createElement('span');
        cell.className = 'cell';
        this.nextAreaCells.push(cell);
        line.appendChild(cell);
      }
      this.nextDom.appendChild(line);
    }
    let titleDom = document.createElement('div');
    tools.addClass(titleDom, classes.title);
    titleDom.innerText = '开始游戏';
    this.scoreDom.innerText = this.score;
    this.lineDom.innerText = this.clearLines;
    this.levelDom.innerText = this.level;
    this.cells = cells;
    this.titleDom = titleDom;
    this.screenDom.appendChild(titleDom);
  };

  // 事件初始化
  tools.initEvents = function() {
    let screen = this.screenDom;
    screen.addEventListener('click', e => {
      clearTimeout(screenClikTimer);
      screenClikTimer = setTimeout(() => {
        this.isPlay = !this.isPlay;
        this.isPlay ? (() => {
          this.isOver ? this.clear() : (() => {
            tools.addClass(this.titleDom, classes.hidden);
            this.start();
          })();
        })() : (() => {
          tools.removeClass(this.titleDom, classes.hidden);
          this.stop();
        })();
      }, 100);
    });

    document.addEventListener('keydown', e => {
      if (!this.isPlay) {
        return;
      }
      let keyCode = e.keyCode;
      let currentShape = this.currentShape;
      let codes = [32, 37, 38, 39, 40];
      if (codes.includes(keyCode)) {
        e.preventDefault();
        switch(keyCode) {
        case codes[0]:
          currentShape.quicken();
          break;
        case codes[2]:
          currentShape.changeShape();
          break;
        default:
          (() => {
            let dir = keyCode === codes[1] ? 'left' : (keyCode === codes[3] ? 
              'right' : 'down');
            currentShape.move(dir);
          })();
        }
      }
    });

    // 加速按钮↑松开恢复默认速度
    document.addEventListener('keyup', e => {
      if (e.keyCode === 40) {
        this.currentShape.speed = config.speed;
      }
    });
  };

  // 游戏未开始前设置下一个形状的显示
  tools.initShapeShow = function() {
    this.currentShape = this.create(tools.getShapeIndex());
    tools.setNextShape.call(this, this.currentShape);
  };

  // 根据x，y生成index
  tools.getIndex = function(x, y, row) {
    row = row || config.row;
    return row * x + y;
  };

  // 获取[0, 6]随机数代表对应形状
  tools.getShapeIndex = function() {
    return Math.floor(Math.random() * 7);
  };

  // 判断是否存在指定class
  tools.isExist = function(node, cls) {
    return String(node.className).indexOf(cls) >= 0;
  };

  tools.addClass = function(node, cls) {
    cls = String(cls).toLowerCase();
    if (node && cls && !tools.isExist(node, cls)) {
      node.className = `${String(node.className).trim()} ${cls}`;
    }
  };

  tools.removeClass = function(node, cls) {
    cls = String(cls).toLowerCase();
    if (node && cls && tools.isExist(node, cls)) {
      node.className = String(node.className).replace(cls, '').trim();
    }
  };

  // 构建初始形状构成坐标
  tools.getShapeCellPos = function(data, origin) {
    let cells = [];
    for (let line = 0, len = data.length; line < len; line++) {
      for (let row = 0, rLen = data[line].length; row < rLen; row++) {
        let [x, y] = origin;
        let isOrigin = false;
        if (data[line][row] > 0) {
          len > 1 ? (() => {
            x = line === 1 ? x : x - 1;
            y = row === 1 ? y : (row > 0 ? y + 1 : y - 1);
            isOrigin = line === 1 && row === 1 ? true : false;
          })() : (len === 1 ? (() => {
            y = y - 2 + row;
            isOrigin = row === 2 ? true : false;
          })() : '');
          let cell = !isOrigin ? {x: x, y: y} : {x: x, y: y, isOrigin: true};
          cells.push(cell);
        }
      }
    }
    return cells;
  };

  // 校验边界
  tools.checkIsLegal = function(cell) {
    if (!cell) {
      return;
    }
    let {x, y} = cell;
    let isOutOfBorder = x <= config.line - 1 && y >= 0 && 
      y <= config.row - 1;
    return isOutOfBorder ? isOutOfBorder && !boards[tools.getIndex(x, y)] : isOutOfBorder;
  };

  // 处理坐标计算
  tools.step = function(option, currentShape) {
    if (!currentShape || !option) {
      return;
    }
    let isMove = null;
    let {attr, step} = option;
    let {cellXY} = currentShape;
    for (let index = cellXY.length; index--;) {
      let cell = cellXY[index];
      let copyCell = {};
      Object.assign(copyCell, cell);
      copyCell[attr] = copyCell[attr] + step;
      isMove = tools.checkIsLegal(copyCell);
      if (typeof isMove === 'boolean' && !isMove) {
        currentShape.isPause = attr === 'x' ? true : false;
        break;
      }
    };
    if (!isMove) {
      return;
    }
    cellXY.forEach(cell => {
      cell[attr] += step;
      if (cell.isOrigin) {
        currentShape.origin = [cell.x, cell.y];
      }
    });
  };

  // 图形变换核心
  tools.rotatePoint = function(cell, origin, isCheck) {
    if (!cell) {
      return;
    }
    let x = origin[0] - origin[1] + cell.y;
    let y = origin[0] + origin[1] - cell.x;
    if (isCheck) {
      return {x: x, y: y};
    } else {
      cell.x = x;
      cell.y = y;
    }
  };

  // 图形变化
  tools.rotateShape = function(currentShape, isChange) {
    if (!currentShape || currentShape.isPause) {
      return;
    }
    let isMove = null;
    let {origin, cellXY, type} = currentShape;
    for (let index = cellXY.length; index--;) {
      let target = cellXY[index];
      let next = tools.rotatePoint(target, origin, true);
      isMove = tools.checkIsLegal(next);
      if (typeof isMove === 'boolean' && !isMove) {
        break;
      }
    }
    if (!isMove) {
      return;
    }
    cellXY.forEach(cell => {
      tools.rotatePoint(cell, origin);
      if (cell.isOrigin) {
        currentShape.origin = [cell.x, cell.y];
      }
    });
  };

  // 设置落子
  tools.boardLayout = function(position) {
    if (!position) {
      return;
    }
    position.forEach(cell => {
      boards[tools.getIndex(cell.x, cell.y)] = 1;
    });
  };

  // 判断是否结束
  tools.checkGameOver = function() {
    let isOver = false;
    for (let index = 0, len = 18; index < len; index++) {
      let value = boards[index];
      if (value === 1) {
        isOver = true;
        break;
      }
    }
    return isOver;
  };

  // 清除行
  tools.clearLine = function() {
    let delLines = [];
    for (let index = lineHeadIndex.length; index--;) {
      let headX = lineHeadIndex[index];
      let val = boards[headX];
      if (val) {
        for (let row = headX, len = headX + 18; row < len; row++) {
          let rowVal = boards[row];
          if (!rowVal) {
            break;
          }
          if (row === len - 1 && rowVal) {
            delLines.push(headX);
          }
        }
      }
    }
    if (delLines.length) {
      delLines.forEach(head => {
        boards.splice(head, 18);
      });
      for (let index = 0, len = delLines.length * config.row; index < len; index++) {
        boards.unshift(0);
      }
      // 分数
      let len = delLines.length;
      let score = len > 1 ? len * (config.baseScore +  100) : len * config.baseScore;
      this.clearLines += len;
      this.score += score;
      tools.setScoreAndLines.call(this);
    }
  };

  // 设置游戏结束提示信息
  tools.setTitle = function() {
    this.titleDom.innerText = '游戏结束';
    tools.addClass(this.titleDom, classes.over);
    tools.removeClass(this.titleDom, classes.hidden);
  };

  // 更新分数以及消除行显示
  tools.setScoreAndLines = function() {
    if (this.score % config.levelScore === 0 && this.score <= 6000) {
      this.level = Math.min(this.level + 1, 3);
    }
    this.scoreDom.innerText = this.score;
    this.lineDom.innerText = this.clearLines;
    this.levelDom.innerText = this.level;
  };

  // 更新下一个形状显示
  tools.setNextShape = function(shape) {
    let nextShape = shape ? shape : this.nextShape;
    let nextAreaCells = this.nextAreaCells;
    let cells = tools.getShapeCellPos(nextShape.areaData, [1, 2]);
    nextAreaCells.forEach(cell => {
      tools.removeClass(cell, classes.on);
    });
    cells.forEach(cell => {
      tools.addClass(nextAreaCells[tools.getIndex(cell.x, cell.y, 4)], classes.on);
    });
  };

  new Tetris().init();
} )(window);