;(function(root) {
    const classes = {
        active: 'active',
        isFocus: 'is-focus',
        isDropdown: 'is-dropdown'
    };
    const body = root.document.body;
    const { on, addClass, removeClass } = tools;
    const defaultOptions = [{
        value: 'zhinan',
        label: '指南',
        children: [{
            value: 'shejiyuanze',
            label: '设计原则',
            isDisabled: true,
            children: [{
                value: 'yizhi',
                label: '一致'
            }, {
                value: 'fankui',
                label: '反馈'
            }, {
                value: 'xiaolv',
                label: '效率'
            }, {
                value: 'kekong',
                label: '可控'
            }]
        }, {
            value: 'daohang',
            label: '导航',
            children: [{
                value: 'cexiangdaohang',
                label: '侧向导航'
            }, {
                value: 'dingbudaohang',
                label: '顶部导航'
            }]
        }]
    }, {
        value: 'zujian',
        label: '组件',
        children: [{
            value: 'basic',
            label: 'Basic',
            children: [{
                value: 'layout',
                label: 'Layout 布局'
            }, {
                value: 'color',
                label: 'Color 色彩'
            }, {
                value: 'typography',
                label: 'Typography 字体'
            }, {
                value: 'icon',
                label: 'Icon 图标'
            }, {
                value: 'button',
                label: 'Button 按钮'
            }]
        }, {
            value: 'form',
            label: 'Form',
            children: [{
                value: 'radio',
                label: 'Radio 单选框'
            }, {
                value: 'checkbox',
                label: 'Checkbox 多选框'
            }, {
                value: 'input',
                label: 'Input 输入框'
            }, {
                value: 'input-number',
                label: 'InputNumber 计数器'
            }, {
                value: 'select',
                label: 'Select 选择器'
            }, {
                value: 'cascader',
                label: 'Cascader 级联选择器'
            }, {
                value: 'switch',
                label: 'Switch 开关'
            }, {
                value: 'slider',
                label: 'Slider 滑块'
            }, {
                value: 'time-picker',
                label: 'TimePicker 时间选择器'
            }, {
                value: 'date-picker',
                label: 'DatePicker 日期选择器'
            }, {
                value: 'datetime-picker',
                label: 'DateTimePicker 日期时间选择器'
            }, {
                value: 'upload',
                label: 'Upload 上传'
            }, {
                value: 'rate',
                label: 'Rate 评分'
            }, {
                value: 'form',
                label: 'Form 表单'
            }]
        }, {
            value: 'data',
            label: 'Data',
            children: [{
                value: 'table',
                label: 'Table 表格'
            }, {
                value: 'tag',
                label: 'Tag 标签'
            }, {
                value: 'progress',
                label: 'Progress 进度条'
            }, {
                value: 'tree',
                label: 'Tree 树形控件'
            }, {
                value: 'pagination',
                label: 'Pagination 分页'
            }, {
                value: 'badge',
                label: 'Badge 标记'
            }]
        }, {
            value: 'notice',
            label: 'Notice',
            children: [{
                value: 'alert',
                label: 'Alert 警告'
            }, {
                value: 'loading',
                label: 'Loading 加载'
            }, {
                value: 'message',
                label: 'Message 消息提示'
            }, {
                value: 'message-box',
                label: 'MessageBox 弹框'
            }, {
                value: 'notification',
                label: 'Notification 通知'
            }]
        }, {
            value: 'navigation',
            label: 'Navigation',
            children: [{
                value: 'menu',
                label: 'NavMenu 导航菜单'
            }, {
                value: 'tabs',
                label: 'Tabs 标签页'
            }, {
                value: 'breadcrumb',
                label: 'Breadcrumb 面包屑'
            }, {
                value: 'dropdown',
                label: 'Dropdown 下拉菜单'
            }, {
                value: 'steps',
                label: 'Steps 步骤条'
            }]
        }, {
            value: 'others',
            label: 'Others',
            children: [{
                value: 'dialog',
                label: 'Dialog 对话框'
            }, {
                value: 'tooltip',
                label: 'Tooltip 文字提示'
            }, {
                value: 'popover',
                label: 'Popover 弹出框'
            }, {
                value: 'card',
                label: 'Card 卡片'
            }, {
                value: 'carousel',
                label: 'Carousel 走马灯'
            }, {
                value: 'collapse',
                label: 'Collapse 折叠面板'
            }]
        }]
    }, {
        value: 'ziyuan',
        label: '资源',
        children: [{
            value: 'axure',
            label: 'Axure Components'
        }, {
            value: 'sketch',
            label: 'Sketch Templates'
        }, {
            value: 'jiaohu',
            label: '组件交互文档'
        }]
    }];

    const isUndefined = function(val) {
        return typeof val === 'undefined';
    };

    /**
     * 级联对象
     * @param {[type]} options   数据
     * @param {[type]} separator 分割符
     * 属性：
     *     cascader：DOM对象
     *     input：输入框容器DOM对象
     *     options：数据
     *     optionsMap: 数据-Map结构
     *     isDropdown：下拉框是否展开
     *     value：级联选择值
     *     panel：下拉框面板对象
     *     separator：分割符
     */
    const Cascader = function(options, separator) {
        this.cascader = null;
        this.input = null;
        this.options = options || [];
        this.optionsMap = null;
        this.isDropDown = false;
        this.value = null;
        this.panel = null;
        this.separator = '/';
        this.init();
    };

    Cascader.prototype = {
        init: function() {
            const cascader = document.querySelector('.cascader');
            const input = cascader.children[0];
            this.transferToMap(this.options);
            this.input = input;
            this.cascader = cascader;
            this.on();
        },
        /**
         * 递归构建数据的Map结构
         * 类似结构：
         *  第一块menu的第一项子项: 00
         *      第二块menu的第一项的子项: 0010
         *          第三块...: 001020
         *  第一块menu的第二项：01
         *      第二块...：0110
         *          第三块...：011020
         *  以此类推
         *      
         */
        transferToMap: function(options) {
            const optionsMap = {};
            let deep = 0;
            const loop = function(data, parentIndex, level) {
                level = isUndefined(level) ? '' : level;
                deep = String(parentIndex).length > deep ? String(parentIndex).length / 2 + 1: deep;
                data && data.forEach((item, i) => {
                    const key = `${parentIndex}${level}${i}`;
                    if (item && 'children' in item) {
                        optionsMap[key] = item.children;
                        loop(item.children, key, level + 1);
                    }
                })
            };
            loop(options, 0);
            this.optionsMap = optionsMap;
        },
        on: function() {
            const that = this;
            const { cascader, input } = this;
            const inputBox = cascader.getBoundingClientRect();
            const top = inputBox.top + inputBox.height + 10;
            const dropCssText = `position:absolute;left:${inputBox.left}px;top:${top}px;`;
            // 点击select触发下拉框显示
            on(cascader, {
                'click': function(e) {
                    e.stopPropagation();
                    let isInit = false;
                    input.children[0].focus();
                    if (!that.panel) {
                        isInit = true;
                        that.panel = new Panel(that);
                    }
                    that.changeState(isInit)
                    that.computedPosition(dropCssText);
                }
            });
            // 点击非下拉框和select部分关闭下拉
            on(document, {
                'click': function(e) {
                    const target = e.target;
                    const panel = that.panel;
                    if (cascader && panel && !cascader.contains(target) &&
                        !panel.panel.contains(target)) {
                        that.close();
                    }
                }
            })
        },
        // 切换下拉框的状态
        changeState: function(isInit) {
            const { panel, input, isDropdown } = this;
            const currentState = !isDropdown;
            this.isDropdown = currentState;
            const opearClass = currentState ? addClass : removeClass;
            opearClass(input, classes.isFocus);
            opearClass(panel.panel, classes.isDropdown);
            // isInit处理第一次点击select下拉框动画问题
            isInit ? setTimeout(function() {
                opearClass(panel.panel, classes.isDropdown);
            }, 0) : opearClass(panel.panel, classes.isDropdown);
        },
        computedPosition: function(cssText) {
            this.panel.panel.style.cssText = cssText;
        },
        // 关闭下拉框
        close: function() {
            this.isDropdown = false;
            removeClass(this.panel.panel, classes.isDropdown);
        },
        // 输出当前选择值
        changeCurrentSelected: function() {
            const menus = this.panel.menus;
            let label = '';
            let value = [];
            const input = this.input.children[0];
            menus.forEach((item, i) => {
                const separator = i === menus.length - 1 ? '' : this.separator;
                const option = item.currentOption;
                label += `${option.label} ${separator} `;
                value.push(option.value);
            });
            this.value = value;
            input.value = label;
            this.close();
        }
    };

    /**
     * 下拉面板对象
     * 属性：
     *     panel：面板DOM对象
     *     menus：面板主要由menu区域组成
     */
    const Panel = function(parent) {
        this.$parent = parent;
        this.panel = null;
        this.menus = [];
        this.createPanel();
    };

    Panel.prototype = {
        createPanel: function() {
            const doc = document;
            const panel = doc.createElement('div');
            const arrow = doc.createElement('div');
            panel.className = 'cascader-dropdown';
            arrow.className = 'arrow';
            panel.appendChild(arrow);
            this.panel = panel;
            this.createAndAppendMenu();
            body.appendChild(panel);
        },
        // 创建menu对象，并替换panel中已有menu区域 DOM节点
        createAndAppendMenu: function(level, currentIndex) {
            let parentIndex = !level ? '' : level - 1;
            let deepIndex = '';
            if (level) {
                const menu = this.menus[level - 1];
                deepIndex = menu ? menu.currentOption.index : '';
            }
            parentIndex = `${parentIndex}${deepIndex}`;
            const options = isUndefined(level) 
                                ? this.$parent.options
                                : this.$parent.optionsMap[`${parentIndex}${level}${currentIndex}`];
            let nextIndex = level + 1;
            nextIndex = Number.isNaN(nextIndex) ? 0 : nextIndex
            const menu = options && new PanelMenu(this, options, nextIndex);
            if (!menu) return;
            // 替换menus中指定的menu
            const isExist = this.menus.find(item => item.id === menu.id);
            if (isExist) {
                const len = this.menus.length;
                this.menus.splice(nextIndex, len - level, menu)
            } else {
                this.menus.push(menu);
            }
            // 获取panel中menu区域节点
            const nodes = [...this.panel.children].slice(1);
            nodes.length ? this.menus.forEach((item, i) => {
                if (nodes[i]) {
                    this.panel.replaceChild(item.menu, nodes[i]);
                } else {
                    this.append(menu);
                }
            }) : this.append(menu);
            // 处理最后一层menu切换时问题
            if (nodes.length > this.menus.length) this.panel.removeChild(nodes[nodes.length - 1]);
        },
        append: function(menu) {
          this.panel.appendChild(menu.menu);
        },
        // 向上分发处理当前选择项
        emitClose: function() {
            this.$parent.changeCurrentSelected();
        }
    };

    /**
     * Menu对象
     * @param {[type]} parent  
     * @param {[type]} options 数据
     * @param {[type]} index   编号
     * 属性：
     *     menu：DOM对象
     *     menuOptions： Option对象集合
     *     level：当前menu层次
     *     currentOption：当前menu对应的option
     *     options：用户传递的options数据
     */
    const PanelMenu = function(parent, options, index) {
        this.id = index;
        this.menu = null;
        this.menuOptions = [];
        this.$parent = parent;
        this.level = index || 0;
        this.currentOption = null;
        this.options = options;
        this.create();
    };

    PanelMenu.prototype = {
        create: function() {
            const ul = document.createElement('ul');
            ul.className = 'cascader-dropdown__menu';
            this.options.map((item, i) => {
                const params = {
                    parent: this,
                    label: item.label,
                    value: item.value,
                    index: i,
                    isLast: !!!item.children,
                    isDisabled: item.isDisabled
                };
                const option = new Option(params);
                this.menuOptions.push(option);
                ul.appendChild(option.option);
            });
            this.menu = ul;
        },
        resetCurrentSelect: function(index) {
            this.menuOptions.forEach(function(item, i) {
                if (i !== index) {
                    removeClass(item.option, classes.active);
                }
            });
        },
        judgeLast: function() {
            if (this.currentOption && this.currentOption.isLast) {
                this.$parent.emitClose();
            }
        }
    };


    const Option = function(params) {
        const {
            parent,
            label,
            value,
            index,
            isLast,
            isDisabled,
        } = params;
        this.$parent = parent;
        this.option = null;
        this.label = label;
        this.value = value;
        this.isDisabled = !!isDisabled;
        this.index = index;
        this.isLast = isLast || false;
        this.create();
        this.on();
    };

    Option.prototype = {
        create: function() {
            const liNode = document.createElement('li');
            addClass(liNode, 'item');
            liNode.innerText = this.label;
            if (!this.isLast) {
                const iconNode = document.createElement('i');
                addClass(iconNode, 'fa fa-caret-right is-right');
                liNode.appendChild(iconNode);
            }
            this.isDisabled && addClass(liNode, 'is-disabled');
            this.option = liNode;
        },
        on: function() {
            const { option, $parent, label, value, index, isLast, isDisabled } = this;
            const panel = this.getPanel();
            on(option, {
                'click': function() {
                    // 支持禁用选项
                    if (isDisabled) return;
                    addClass(this, classes.active);
                    $parent.currentOption = { label, value, index, isLast };
                    $parent.resetCurrentSelect(index);
                    panel.createAndAppendMenu($parent.level, index);
                    $parent.judgeLast();
                }
            });
        },
        getPanel: function() {
            return this.$parent.$parent;
        }
    };

    new Cascader(defaultOptions);
})(window);