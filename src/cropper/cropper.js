/**
 * 简易图形裁剪，主要是理解裁剪区域拖拽计算逻辑，次要是裁剪功能
 * 相关样式和逻辑参考cropper.js
 */
(function(root) {
    const ACTION_MOVE = 'move';
    const ACTION_LEFT = 'l';
    const ACTION_RIGHT = 'r';
    const ACTION_TOP = 't';
    const ACTION_TOP_RIGHT = 'tr';
    const ACTION_TOP_LEFT = 'tl';
    const ACTION_BOTTOM = 'b';
    const ACTION_BOTTOM_RIGHT = 'br';
    const ACTION_BOTTOM_LEFT = 'bl';

    function createCropContainer() {
        const cropContainerNode = document.createElement('div');
        cropContainerNode.className = 'crop-container';
        cropContainerNode.innerHTML = `
                <div class="crop-modal"></div>
                <div class="crop-box">
                    <span class="crop-view-box"></span>
                    <span class="crop-dashed dashed-h"></span>
                    <span class="crop-dashed dashed-v"></span>
                    <span class="crop-center"></span>
                    <span class="crop-drag" data-action="move"></span>
                    <span class="crop-line line-e" data-action="r"></span>
                    <span class="crop-line line-n" data-action="t"></span>
                    <span class="crop-line line-w" data-action="l"></span>
                    <span class="crop-line line-s" data-action="b"></span>
                    <span class="crop-point point-e" data-action="r"></span>
                    <span class="crop-point point-n" data-action="t"></span>
                    <span class="crop-point point-w" data-action="l"></span>
                    <span class="crop-point point-s" data-action="b"></span>
                    <span class="crop-point point-ne" data-action="tr"></span>
                    <span class="crop-point point-nw" data-action="tl"></span>
                    <span class="crop-point point-sw" data-action="bl"></span>
                    <span class="crop-point point-se" data-action="br"></span>
                </div>
        `;
        return cropContainerNode;
    }

    const handlers = {
        onMouseMove: function(e) {
            window.requestAnimationFrame(() => {
                const cropInstance = this;
                if (!cropInstance.isCropping) return;
                const { mousePoint: point, cropBoxData } = cropInstance;
                let action = cropInstance.action, isRender = true;
                let {
                    top, left, width, height,
                    minLeft, maxWidth, minTop, maxHeight
                } = cropBoxData;
                const right = left + width;
                const bottom = top + height;
                const offset = {
                    x: e.pageX - point.x,
                    y: e.pageY - point.y
                };
                switch(action) {
                    case ACTION_MOVE:
                        top += offset.y;
                        left += offset.x;
                        break;
                    // 左边
                    case ACTION_LEFT:
                        // 左边框到达边界后继续向左滑动不需要计算和渲染
                        if (offset.x <= 0 && left <= minLeft) {
                            isRender = false;
                            break;
                        }
                        cropInstance.checkBound(ACTION_LEFT, offset);
                        width -= offset.x;
                        left += offset.x;
                        if (width < 0) {
                            action = ACTION_RIGHT;
                            width = -width;
                            left -= width;
                        }
                        break;
                    // 右边
                    case ACTION_RIGHT:
                        if (offset.x >= 0 && right >= maxWidth) {
                            isRender = false;
                            break;
                        }
                        cropInstance.checkBound(ACTION_RIGHT, offset);
                        width += offset.x;
                        if (width < 0) {
                            action = ACTION_LEFT;
                            width = -width;
                            left -= width;
                        }
                        break;
                    // 顶边
                    case ACTION_TOP:
                        if (offset.y <= 0 && top <= minTop) {
                            isRender = false;
                            break;
                        }
                        cropInstance.checkBound(ACTION_TOP, offset);
                        height -= offset.y;
                        top += offset.y;
                        if (height < 0) {
                            action = ACTION_BOTTOM;
                            height = -height;
                            top -= height;
                        }
                        break;
                    // 底边
                    case ACTION_BOTTOM:
                        if (offset.y <= 0 && top + height >= maxHeight) {
                            isRender = false;
                            break;
                        }
                        cropInstance.checkBound(ACTION_BOTTOM, offset);
                        height += offset.y;
                        if (height < 0) {
                            action = ACTION_TOP;
                            // 控制反向操作后位置和大小问题，没有此处逻辑多次反向会导致明显的偏移
                            height = -height;
                            top -= height;
                        }
                        break;
                    // 左上角
                    case ACTION_TOP_LEFT:
                        if (offset.x <= 0 && offset.y <= 0 && (top <= minTop || left <= minLeft)) {
                            isRender = false;
                            break;
                        }
                        cropInstance.checkBound(ACTION_TOP, offset);
                        cropInstance.checkBound(ACTION_LEFT, offset);
                        width -= offset.x;
                        height -= offset.y;
                        top += offset.y;
                        left += offset.x;
                        if (width < 0 && height < 0) {
                            action = ACTION_BOTTOM_RIGHT;
                            height = -height;
                            width = -width;
                            top -= height;
                            left -= width;
                        } else if (width < 0) {
                            action = ACTION_TOP_RIGHT;
                            width = -width;
                            left -= width;
                        } else if (height < 0) {
                            action = ACTION_BOTTOM_LEFT;
                            height = -height;
                            top -= height;
                        }
                        break;
                    // 右上角
                    case ACTION_TOP_RIGHT:
                        if (offset.x >= 0 && offset.y <= 0 && (right >= maxWidth || top <= minTop)) {
                            isRender = false;
                            break;
                        }
                        cropInstance.checkBound(ACTION_TOP, offset);
                        cropInstance.checkBound(ACTION_RIGHT, offset);
                        width += offset.x;
                        height -= offset.y;
                        top += offset.y;
                        if (width < 0 && height < 0) {
                            action = ACTION_BOTTOM_LEFT;
                            height = -height;
                            width = -width;
                            top -= height;
                            left -= width;
                        } else if (width < 0) {
                            action = ACTION_TOP_LEFT;
                            width = -width;
                            left -= width;
                        } else if (height < 0) {
                            action = ACTION_BOTTOM_RIGHT;
                            height = -height;
                            top -= height;
                        }
                        break;
                    // 左下角
                    case ACTION_BOTTOM_LEFT:
                        if (offset.x <= 0 && offset.y >= 0 && (left <= minLeft || bottom >= maxHeight)) {
                            isRender = false;
                            break;
                        }
                        cropInstance.checkBound(ACTION_BOTTOM, offset);
                        cropInstance.checkBound(ACTION_LEFT, offset);
                        width -= offset.x;
                        height += offset.y;
                        left += offset.x;
                        if (width < 0 && height < 0) {
                            action = ACTION_TOP_RIGHT;
                            height = -height;
                            width = -width;
                            top -= height;
                            left -= width;
                        } else if (width < 0) {
                            action = ACTION_BOTTOM_RIGHT;
                            width = -width;
                            left -= width;
                        } else if (height < 0) {
                            action = ACTION_TOP_LEFT;
                            height = -height;
                            top -= height;
                        }
                        break;
                    // 右下角
                    case ACTION_BOTTOM_RIGHT:
                        if (offset.x >= 0 && offset.y >= 0 && (right >= maxWidth || bottom >= maxHeight)) {
                            isRender = false;
                            break;
                        }
                        cropInstance.checkBound(ACTION_BOTTOM, offset);
                        cropInstance.checkBound(ACTION_RIGHT, offset);
                        width += offset.x;
                        height += offset.y;
                        if (width < 0 && height < 0) {
                            action = ACTION_TOP_LEFT;
                            height = -height;
                            width = -width;
                            top -= height;
                            left -= width;
                        } else if (width < 0) {
                            action = ACTION_BOTTOM_LEFT;
                            width = -width;
                            left -= width;
                        } else if (height < 0) {
                            action = ACTION_TOP_RIGHT;
                            height = -height;
                            top -= height;
                        }
                        break;
                }
                if (isRender) {
                    cropInstance.updateCropBoxData({ top, left, width, height });
                    // 在每个方向上调整大小归0后实现反向的关键
                    cropInstance.action = action;
                }
                /*
                    更新初始位置点，用于计算每一步偏移量，从而计算当前top和left
                    也可以根据isRender来决定是否更新，但是不同点超出边界调整效果会有差异
                    总的来说，始终更新的效果会好些
                */
                point.x = e.pageX;
                point.y = e.pageY;
            })
        },
        onMouseUp: function(e) {
            const cropInstance = this;
            if (!cropInstance.isCropping) return;
            cropInstance.isCropping = false;
            cropInstance.unbindEvents();
        }
    };

    /**
     * 整体结构分为三层：
     * - background: 这里以原始imageElement为背景
     * - modal：显示阴影效果
     * - crop-box：裁剪区域，分为两层：
     *   - 外观：基本骨架
     *   - view层：存放image，用于显示裁剪的区域图像，与background在视觉上呈现为一张图像效果
     * @param {*} imageElement 
     * @returns 
     */
    function Cropper(imageElement) {
        if (
            !(imageElement instanceof Element) ||
            imageElement.tagName !== 'IMG'
        ) {
            return;
        }
        this.imageElement = imageElement;
        this.viewBox = null;
        this.cropBox = null;
        this.cropBoxData = null;
        this.cropContainer = null;
        this.isCropping = false;
        this.mousePoint = null;
        this.action = null;
        this.onMouseMove = null;
        this.onMouseUp = null;
        this.init();
    }

    Cropper.prototype = {
        init: function() {
            this.createCrop();
            // 设置crop-container容器高度和宽度以保证铺满最外层容器
            this.initCropContainer();
            // view区域初始化
            this.initViewBox();
            // 绑定mousedown、mousemove、mouseup
            this.bindEvents();
            // 获取可裁剪区域初始相关数据
            this.initCropBoxData();
            // 显示初始大小裁剪区域
            this.displayCrop();
        },
        initCropContainer: function() {
            const imageElement = this.imageElement;
            const cropContainer = this.cropContainer;
            const width = imageElement.offsetWidth;
            const height = imageElement.offsetHeight;
            cropContainer.style.cssText = `width:${width}px;height:${height}px;`;
        },
        initViewBox: function() {
            const viewBox = this.viewBox;
            const image = this.cloneImage();
            this.viewBoxImage = image;
            viewBox.appendChild(image);
        },
        createCrop: function() {
            const cropContainer = createCropContainer();
            this.cropBox = cropContainer.querySelector('.crop-box');
            this.viewBox = cropContainer.querySelector('.crop-view-box');
            this.cropContainer = cropContainer;
            this.imageElement.parentNode.appendChild(cropContainer);
        },
        cloneImage: function() {
            const imageElement = this.imageElement;
            const url = imageElement.getAttribute('src');
            const crossOrigin = imageElement.crossOrigin;
            const image = document.createElement('img');
  
            if (crossOrigin) {
                image.crossOrigin = crossOrigin;
            }
            image.src = url;
            image.onload = function(e) {
                console.log(e.target.naturalWidth);
            }
            return image;
        },
        displayCrop: function() {
            const { cropBoxData } = this;
            const initClientAreaRatio = 0.8;
            const { width: boxWidth, height: boxHeight } = cropBoxData;
            const initWidth = boxWidth * initClientAreaRatio;
            const initHeight = boxHeight * initClientAreaRatio;
            const top = (boxHeight - initHeight) / 2;
            const left = (boxWidth - initWidth) / 2;
            this.updateCropBoxData({
                top: top,
                left: left,
                width: initWidth,
                height: initHeight
            });
            
        },
        initCropBoxData: function() {
            const cropBox = this.cropBox;
            const cropBoxWidth = cropBox.offsetWidth;
            const cropBoxHeight = cropBox.offsetHeight;
            // 注意top、left不是距离窗口位置，而是在容器内的偏移量
            // min、max相关数据都是边界
            this.cropBoxData = {
                width: cropBoxWidth,
                minWidth: 0,
                maxWidth: cropBoxWidth,
                height: cropBoxHeight,
                minHeight: 0,
                maxHeight: cropBoxHeight,
                top: 0,
                minTop: 0,
                maxTop: 0,
                left: 0,
                minLeft: 0,
                maxLeft: 0
            }
        },
        updateCropBoxData: function(data) {
            if (!data) return;
            const newData = data || {};
            const cropBoxData = this.cropBoxData;
            const {
                width: oldWidth,
                height: oldHeight
            } = cropBoxData;
            for (let key of Object.keys(newData)) {
                if (key.indexOf('min') >= 0 || key.indexOf('max') >= 0) {
                    continue
                };
                let value = newData[key];
                if (typeof value === 'number' && !Number.isNaN(value)) {
                    cropBoxData[key] = value;
                }
            }

            // 更改区域大小自动计算边界值
            if (cropBoxData.height !== oldHeight) {
                const { height, maxHeight } = cropBoxData;
                cropBoxData.maxTop = maxHeight - height;
            }
            if (cropBoxData.width !== oldWidth) {
                const { width, maxWidth } = cropBoxData;
                cropBoxData.maxLeft = maxWidth - width;
            }
            // 裁剪区域数据变化就需要触发渲染
            this.renderCropBox();
        },
        bindEvents: function() {
            this.onMouseMove = handlers.onMouseMove.bind(this);
            this.onMouseUp = handlers.onMouseUp.bind(this);
            this.cropContainer.addEventListener('mousedown', e => {
                e.preventDefault();
                this.isCropping = true;
                // pageX = clienX + window.pageXOffset
                const { pageX, pageY } = e;
                const target = e.target;
                this.action = target.dataset.action;
                this.mousePoint = { x: pageX, y: pageY };
                document.addEventListener('mousemove', this.onMouseMove);
                document.addEventListener('mouseup', this.onMouseUp);
            });
        },
        unbindEvents: function() {
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        },
        limitCropBoxData: function() {
            const cropBoxData = this.cropBoxData;
            const {
                width, minWidth, maxWidth,
                height, minHeight, maxHeight,
                top, minTop, maxTop,
                left, minLeft, maxLeft
            } = cropBoxData;
            cropBoxData.width = Math.min(Math.max(width, minWidth), maxWidth);
            cropBoxData.height = Math.min(Math.max(height, minHeight), maxHeight);
            cropBoxData.left = Math.min(Math.max(left, minLeft), maxLeft);
            cropBoxData.top = Math.min(Math.max(top, minTop), maxTop);
        },
        renderCropBox: function() {
            // 边界检查
            this.limitCropBoxData();
            const cropBox = this.cropBox;
            const viewBoxImage = this.viewBoxImage;
            const {
                top, left, width, height,
                maxWidth, maxHeight
            } = this.cropBoxData;

            // 更新crop位置
            cropBox.style.cssText = `width:${width}px;height:${height}px;transform:translate(${left}px,${top}px)`;
            
            /*
                view与background在视觉上呈现同一张图画的效果的核心思路：
                - view中图像始终与background中图像相同大小，crop-box显示具体的裁剪区域大小 crop-box大小 <= view中图像大小
                - 使用translate来实现位置移动，crop-box与view中图像数值相反（需要理解translate坐标系）
            */
            viewBoxImage.style.cssText = `width:${maxWidth}px;height:${maxHeight}px;transform:translate(${-left}px,${-top}px)`;
        },
        /**
         * 扩大裁剪区域时计算是否到达边界
         * @param {*} side 边
         * @param {*} offset 偏移量
         */
        checkBound: function(side, offset) {
            const cropBoxData = this.cropBoxData;
            const {
                left, width, top, height,
                maxWidth, minTop, maxHeight,
                minLeft
            } = cropBoxData;
            const { x: offsetX, y: offsetY } = offset;
            const startRight = left + width;
            const endRight = startRight + offsetX;
            const startTop = top;
            const endTop = top + offsetY;
            const startBottom = top + height;
            const endBottom = startBottom + offsetY;
            const startLeft = left;
            const endLeft = left + offsetX;
            switch (side) {
                case ACTION_TOP:
                    if (endTop < minTop) {
                        offset.y = minTop - startTop;
                    }
                    break; 
                case ACTION_BOTTOM:
                    if (endBottom > maxHeight) {
                        offset.y = maxHeight - startBottom;
                    }
                    break;
                case ACTION_RIGHT:
                    if (endRight > maxWidth) {
                        offset.x = maxWidth - startRight;
                    }
                    break;  
                case ACTION_LEFT:
                    if (endLeft < minLeft) {
                        offset.x = minLeft - startLeft;
                    }
                    break;
            }
        },
        getCropCanvas: function() {
            const viewBoxImage = this.viewBoxImage;
            const { width, height, top, left } = this.cropBoxData;
            const imageWidth = viewBoxImage.width;
            const imageHeight = viewBoxImage.height;
            const naturalWidth = viewBoxImage.naturalWidth;
            const naturalHeight = viewBoxImage.naturalHeight;
            // 根据原始宽高和实际宽高得到不同的比例
            const widthRatio = imageWidth / naturalWidth;
            const heightRatio = imageHeight / naturalHeight;
            const targetWidth = width / widthRatio;
            const targetHeight = height / heightRatio;
            let params = [left / widthRatio, top / heightRatio, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight];
            params = params.map(item => Math.floor(item));
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = Math.floor(targetWidth);
            canvas.height = Math.floor(targetHeight);
            context.drawImage(viewBoxImage, ...params);
            return canvas;
        }
    }

    root.Cropper = Cropper;
})(window);
