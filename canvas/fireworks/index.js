(function(w) {
    var document = w.document,
        body = w.document.body,
        canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        windowWidth = w.innerWidth,
        windowHeight = w.innerHeight;

    canvas.width = windowWidth;
    canvas.height = windowHeight;

    var options = {

        // 发射点
        startX: windowWidth / 2,
        startY: windowHeight - 2,

        // 鼠标点击
        isMouseDown: false,
        // 限制鼠标滑动创建目标数目
        mouseMoveCount: 0,

        // hsla颜色表达式h的值
        hslaColor: 120,

        // 速度与加速度
        bullotSpeed: 2,
        acceleration: 1.05,

        // 烟花基数
        firection: 0.93,
        // 重力
        grivaty: 1,

        // 烟花最小数目以及最大数目
        fireWorkMinCount: 25,
        fireWorkMaxCount: 40,

        // 烟花粒子的最小最大半径(烟花有大有小)
        fireWorkMinRadius: 5,
        fireWorkMaxRadius: 7
    };

    var currentHue = options.hslaColor;
    var targetToStartDistance = function (p1x, p1y, p2x, p2y) {
        var xDistance = p1x - p2x;
        var yDistance = p1y - p2y;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    };


    var Target = function(sx, sy, tx, ty) {
        // 起点坐标
        this.x = this.sx = sx;
        this.y = this.sy = sy;
        // 目标坐标
        this.tx = tx;
        this.ty = ty;
        // 颜色
        this.hue = currentHue;
        this.brightness = random(50, 80);
        // 控制闪烁：闪烁的原理是原圈的半径从1-8，再从8-1,
        this.directionFlag = false;
        this.radius = 1;

        // 目标与发射点的距离与角度
        this.angle = Math.atan2(this.ty - this.sy, this.tx - this.sx);

        // 存储子弹的发射点
        this.beginPoint = [[this.x, this.y]];

        // 速度与加速度
        this.speed = options.bullotSpeed;
        this.acceleration = options.acceleration;

        // 目标点与发射点距离
        this.distanceToTarget = targetToStartDistance(this.sx, this.sy, this.tx, this.ty);
    };

    // 第一帧为1，第二帧是1.15，第三帧是2.3,直至第n帧达到数值超过8，从下帧开始半径减少,从而形成动画
    // change方法就是圆圈的大小
    Target.prototype.change = function(index) {

        // 改变目标圆环的半径，实现闪烁的效果
        if(!this.directionFlag) {
            if(this.radius < 8) {
                this.radius += 0.15;
            } else {
                this.directionFlag = true; 
            } 
        } else {
            if(this.radius > 1) {
                this.radius -= 0.15;
            } else {
                this.directionFlag = false;
            }
        }

        /* 
            确定子弹的终点
         */
        this.beginPoint.pop();
        this.beginPoint.unshift([this.x, this.y]);
        // 确定三角形斜边
        this.speed *= this.acceleration;

        // 由斜边和角度确定x和y值
        var vx = Math.cos(this.angle) * this.speed;
        var vy = Math.sin(this.angle) * this.speed;

        // 求得新的终点与新起点的距离
        var distance = targetToStartDistance(this.sx, this.sy, this.x + vx, this.y + vy);
        if (distance >= this.distanceToTarget) {
            createFireWorks(this.tx, this.ty);
            targetPoints.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    };

    // 绘制目标和路径
    Target.prototype.draw = function() {

        var beginPoint = this.beginPoint[this.beginPoint.length - 1];
        // 绘制目标
        context.beginPath();
        context.arc(this.tx, this.ty, this.radius, 0, Math.PI * 2);
        context.strokeStyle = 'hsl(' + this.hue + ',100%,' + this.brightness + '%)';
        context.stroke();

        // 绘制子弹
        context.beginPath();
        context.moveTo(beginPoint[0], beginPoint[1]);
        context.lineTo(this.x, this.y);
        context.strokeStyle = 'hsl(' + this.hue + ',100%,' + this.brightness + '%)';
        context.stroke();
        context.closePath();
    };

    // 烟花粒子对象，每个烟花都是由25~40粒子对象构成
    var FireWork = function(x, y) {
        // 烟花粒子的坐标
        this.x = x;
        this.y = y;
        // 颜色
        this.hue = random(currentHue - 30,currentHue + 30);
        this.brightness = random(50, 80);
        // 烟花大小
        this.radius = random(options.fireWorkMinRadius, options.fireWorkMaxRadius);
        // 烟花粒子的角度，每一次创建粒子都是不同的角度形成爆炸的效果
        this.angle = random(0, Math.PI * 2);
        // 重力
        this.grivaty = options.grivaty;
        // 透明度
        this.alpha = 1;

        // 透明度消逝速度
        this.decay = random(0.01, 0.03);

        // 扩散速度
        this.speed = random(1, 10);

        // 扩散速度的加速度
        this.firection = options.firection;

        // 每一个粒子都是运动的，保存粒子的起点
        // this.beginPoint = [[this.x, this.y]];
    };

    // 绘制烟花
    FireWork.prototype.draw = function() {
        // 创建径向渐变(开始圆x, y, 开始圆半径, 结束圆x, y, 外圆半径)
        var gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        // 定义径向的颜色变化
        gradient.addColorStop(0.0, 'rgba(255, 255, 255, .2)');
        gradient.addColorStop(0.1, 'hsla(' + this.hue + ',100%,' + this.brightness + '%,' + this.alpha + ')');
        gradient.addColorStop(1.0, 'rgba(0, 0, 0, .6)');

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
        context.closePath();
    };

    FireWork.prototype.change = function(index) {
        // 粒子前进方向的扩散
        this.speed *= this.firection;

        // 粒子扩散距离的x轴与y轴增量, 其中y轴方向要加上重力效应
        var vx = Math.cos(this.angle) * this.speed;
        var vy = Math.sin(this.angle) * this.speed + this.grivaty;
        this.alpha -= this.decay;
        if(this.alpha <= this.decay) {
            fireWorks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    };

    // 存储目标点
    var targetPoints = [];
    // 存储烟花
    var fireWorks = [];
    // 随机值
    var random = function(min, max) {
        return Math.random() * (max - min) + min;
    };
    // 创建目标点
    var createTarget = function(x, y, isDraw) {
        if (options.isMouseDown) {
            if (options.mouseMoveCount % 12 === 0) {
                var tg = new Target(options.startX, options.startY, x, y);
                targetPoints.push(tg);
            } else if (isDraw) {
                var tg = new Target(options.startX, options.startY, x, y);
                targetPoints.push(tg);
            }
        }
    };

    // 创建烟花
    var createFireWorks = function(x, y) {
        // 随机确定烟花粒子的数量
        var count = Math.round(random(options.fireWorkMinCount, options.fireWorkMaxCount));
        while(count--) {
            fireWorks.push(new FireWork(x, y));
        }
    };
    // 事件监听，canvas随着页面变化而变化
    body.addEventListener('resize', function() {
        canvas.width = windowWidth = w.innerWidth;
        canvas.height =  windowHeight = w.innerHeight;
    });

    canvas.addEventListener('mousedown', function(e) {
        options.isMouseDown = true;
        createTarget(e.pageX, e.pageY, true);
    });

    canvas.addEventListener('mousemove', function(e) {
        options.mouseMoveCount += 1;
        createTarget(e.pageX, e.pageY);
    });

    canvas.addEventListener('mouseup', function(e) {
        options.isMouseDown = false;
        options.mouseMoveCount = 0;
    });

    (function run() {
        window.requestAnimationFrame(run);
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        currentHue += 1;
        // 绘制目标数组中所有目标
        let targetLenght = targetPoints.length;
        while(targetLenght--) {
            targetPoints[targetLenght].draw();
            targetPoints[targetLenght].change(targetLenght);
        }
        let fireWorkLength = fireWorks.length;
        while(fireWorkLength--) {
            fireWorks[fireWorkLength].draw();
            fireWorks[fireWorkLength].change(fireWorkLength);
        }
    })();
})(window);