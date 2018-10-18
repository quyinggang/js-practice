/**
 * 日期选择控件date
 * quyinggang
 */
!(function(root, undefined) {
	const doc = document;
	const formats = ['yyyy-MM-dd', 'localDate'];
	const defaultConfig = {
		el: '',
		type: 'date',
		format: formats[0],
		start: null,
		end: null,
		value: null
	};
	const classes = {
		date: 'date-picker',
		range: 'date-range-picker',
		panel: 'date-picker-panel',
		header: 'panel-header',
		content: 'panel-content',
		footer: 'panel-footer',
		yearLeft: 'fa fa-angle-double-left',
		monthLeft: 'fa fa-angle-left',
		yearRight: 'fa fa-angle-double-right',
		monthRight: 'fa fa-angle-right',
		dot: 'fa fa-circle',
		today: 'today',
		current: 'current',
		disabled: 'disabled',
		normal: 'normal',
		prevMonth: 'prev-month',
		nextMonth: 'next-month',
		none: 'none',
		hidden: 'hidden',
		left: 'is-left',
		right: 'is-right',
		inRange: 'is-in-range',
	};
	const tools = {};
	const toString = Object.prototype.toString;
	const weeks = ['日', '一', '二', '三', '四', '五', '六'];
	const monthOf31s = [1, 3, 5, 7, 8, 10, 12];

	// 判断对象
	tools.isObject = function(obj) {
		return toString.call(obj) === "[object Object]";
	};

	// 判断日期对象
	tools.isDate = function(date) {
		return toString.call(date) === '[object Date]';
	};

	// class是否存在
	tools.isExistClass = function(className, target) {
		if (!className) return;
		return className.indexOf(target) >= 0;
	}

	// 位数补齐
	tools.pad = function(val) {
		const numberVal = parseInt(val) || 0;
		return numberVal < 10 ? '0' + numberVal : numberVal;
	};

	// class添加
	tools.addClass = function(classes) {
		if (!Array.isArray(classes)) return;
		classes.forEach((item) => {
			let { node, className } = item || {};
			if (!node) return;
			if (String(node.className).indexOf(className) < 0) {
				node.className = String(node.className + ' ' + className).trim();
			}
		});
	};

	// 移除class
	tools.removeClass = function(elem, className) {
		if (!elem || !elem.nodeName) return;
		elem.className = String(elem.className).replace(className, '');
	};

	// 复制date对象
	tools.copyDate = function(date) {
		date = date.slice();
		const isArray = Array.isArray(date);
		date = isArray ? date : [date];
		date.map(item => {
			const { year, month, day, hour, minutes, seconds } = tools.getYMD(item);
			return new Date(year, month - 1, day, hour, minutes, seconds);
		});
		return isArray ? date : date[0];
	};

	// 节点添加
	tools.appendChild = function(nodes) {
		if (!Array.isArray(nodes)) return;
		nodes.forEach((item) => {
			let {node, childs} = item;
			if (Array.isArray(childs)) {
				childs.forEach((child) => {
					child ? node.appendChild(child) : '';
				});
			} else {
				node.appendChild(childs);
			}
		});
	};

	// 参数合并
	tools.extend = function(o, d) {
		o = tools.isObject(o) ? o : {};
		d = tools.isObject(d) ? d : {};
		for (let key of Object.keys(d)) {
			if (key in o) {
				o[key] = d[key];
			}
		}
		return o;
	};

	// 批量处理节点添加
	const createDetail = function(item) {
		const nodes = [];
		const items = String(item).split('*');
		const count = parseInt(items[1]);

		if (count) {
			for (let index = 0; index < count; index++) {
				nodes.push(doc.createElement(items[0]));
			}
		}
		return nodes;
	}
	// 创建节点
	tools.create = function(elems) {
		const isArray = Array.isArray(elems);
		const isString = typeof elems === 'string';
		const nodes = [];

		if (isArray) {
			elems.forEach((item) => {
				nodes.push(createDetail(item));
			});
		} else if (isString) {
			nodes.push(createDetail(elems));
		}
		return nodes;
	};

	// 获取指定位置的td对应的cell在cells集合的下标
	tools.getPosIndexOfCell = function(node) {
		if (node.nodeType !== 1) return;
		const dataIndex = node.getAttribute('data-index');
		const pos = dataIndex.split('-');
		return {
			line: Number(pos[0]),
			row: Number(pos[1])
		};
	};

	// 获取年月日时分秒
	tools.getYMD = function(date) {
		if (!date) return {};
		const result = {};
		if (tools.isDate(date)) {
			result.year = date.getFullYear();
			result.month = date.getMonth() + 1;
			result.day = date.getDate();
			result.hour = date.getHours() || 0;
			result.minutes = date.getMinutes() || 0;
			result.seconds = date.getSeconds() || 0;
		} else {
			const d = String(date).replace(/[^\d]/g, '');
			result.year = parseInt(d.substring(0, 4));
			result.month = parseInt(d.substring(4, 6)) + 1;
			result.day = parseInt(d.substring(6, 8));
			if (d.length > 8) {
				result.hour = parseInt(d.substr(8, 2));
				result.minutes = parseInt(d.substr(10, 2));
				result.seconds = parseInt(d.substring(12));
			} else {
				result.hour = result.minutes = result.seconds = 0;
			}
		}
		return result;
	};

	// 判断是否在指定时间点后
	tools.isAfter = function(oldDate, newDate) {
		return newDate.getTime() >= oldDate.getTime();
	};

	// 判断是否是先相连时间段
	tools.isNextMonth = function(next, old) {
		if (!next && !old) return false;
		const { year, month } = tools.getYMD(next);
		const { year: oldYear, month: oldMonth } = tools.getYMD(old);
		return year === oldYear && month === oldMonth;
	};

	// 对应下个月的时间点
	tools.nextMonth = function(date) {
		if (!tools.isDate(date)) return;
		const { year, month, day } = tools.getYMD(date);
		return new Date(year, month, day);
	};

	// 判断平闰年
	tools.isLeaf = function(year) {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	};

	// 获取指定月天数
	tools.getDaysOfMonth = function(month, year) {
		return  monthOf31s.includes(month)
							? 31
							: month !== 2 
									? 30
									: tools.isLeaf(year)
											? 28
											: 29;
	};

	// 判断是否是今天
	tools.isToday = function(year, month, day) {
		const now = new Date();
		const curYear = now.getFullYear();
		const curMonth = now.getMonth() + 1;
		const curDay = now.getDate();

		return year === curYear && month === curMonth && day === curDay;
	}
	
	// 日期内容数据
	tools.createCells = function(option, panel) {
		// 当前面板日期
		let { year, month } = option;
		// 支持范围选择
		const section = panel.$parent;
		const { settings: {start, end}, value} = section.$parent;
		// 当前选择日期
		const selectedValues= value.slice();
		const { isRange } = section;
		// 本月1号是周几
		const dayInWeek = new Date(year, month - 1, 1).getDay();
		const line = 6;
		const row = 7;
		// 具体的日期点Cell集合
		const cells = [];
		// 周几Cell集合
		const wkCells = [];
		// 每格对应的具体天
		let currentValue = 0;
		// 当前月
		const currentMonth = parseInt(month);
		// 当前月总天数
		const daysofCurrentMonth = tools.getDaysOfMonth(currentMonth, year);
		// 上个月总天数
		const daysOfPrevMonth = tools.getDaysOfMonth(currentMonth === 1 ? 11 : currentMonth - 1, year);

		// 周显示行Cell创建
		for (let index = 0, len = weeks.length; index < len; index++) {
			wkCells.push(new Cell(0, index, weeks[index]));
		}
		// 行
		for (let le = 0; le < line; le++) {
			let rows = [];
			// 列
			for (let rw = 0; rw < row; rw++) {
				// 处理上个月在本月面板展示的天
				if (le === 0) {
					// 本月1号是星期天情况
					dayInWeek === 0
						? rows.push(new Cell(le, rw, daysOfPrevMonth - row + rw + 1, -1))
						: rw < dayInWeek
								? rows.push(new Cell(le, rw, daysOfPrevMonth - dayInWeek + rw + 1, -1))
								: rows.push(new Cell(le, rw, rw - dayInWeek + 1));
					// 第一行最后一列	
					if (rw === row - 1) {
						// 获取第一行最后一列表示的当前日期
						let endValue = rows[rows.length - 1].value;
						// 处理超出上个月
						currentValue = endValue + 1 > daysOfPrevMonth ? daysOfPrevMonth - endValue : endValue;
					}
				} else  {
					currentValue += 1;
					if (currentValue <= daysofCurrentMonth) {
						// 本月
						rows.push(new Cell(le, rw, currentValue, 0));
					} else {
						// 下月
						rows.push(new Cell(le, rw, currentValue - daysofCurrentMonth, 1));
					}
				}

				let cell = rows.pop();
				// 处理已选择的对应日期高亮显示以及切换时非本月相同天情况
				if (cell.isCurrentMonth === 0 && selectedValues.length) {
					if (!isRange) {
						const {year: oldYear, month: oldMonth, day: oldDay } = tools.getYMD(selectedValues[0]);
						const isCurrentYM = year === oldYear && month === oldMonth;
						cell.isActive = isCurrentYM && oldDay === cell.value ? true : false;
					} else {
						// 处理在范围内显示样式
						const rangeStartTime= selectedValues[0] && selectedValues[0].getTime();
						const rangeEndTime = selectedValues[1] && selectedValues[1].getTime();
						const currentTime = new Date(year, month - 1, cell.value).getTime();
						if (currentTime >= rangeStartTime && currentTime <= rangeEndTime) {
							cell.isInRange = true;
							cell.isActive = currentTime === rangeStartTime 
																? true 
																: currentTime === rangeEndTime 
																		? true 
																		: false;
						}
					}
				}
				// 现在时间特殊处理
				if (tools.isToday(year, month, cell.value)) {
					cell.isToday = true;
					cell.note = '今天';
				}
				// 处理可选日期范围
				if (tools.isDate(start) || tools.isDate(end)) {
					// 上个月、本月、下个月构建Date时年月的处理
					const [cy, cm] = cell.isCurrentMonth < 0 ? (
						month === 1 ? [year - 1, 11] : [year, month - 2]
					) : (
						cell.isCurrentMonth === 0 ? [year, month - 1] : 
						(
							month === 12 ? [year + 1, 1] : [year, month]
						)
					);
					const curDate = new Date(cy, cm, cell.value);
					if (start && curDate < start) cell.isDisabled = true;
					if (end && curDate > end) cell.isDisabled = true;
				}
				rows.push(cell);
			}
			cells.push(rows);
		}
		return [wkCells, cells];
	};

	// 依据cells构建内容节点DOM
	tools.getContextArea = function(cells, wks) {
		const cellNodes = [];
		const [[table], trs] = tools.create(['table*1', `tr*7`]);
		if (Array.isArray(wks)) {
			let weekTr = trs[0];
			wks.forEach((item) => {
				let [[th]] = tools.create('th*1');
				th.innerText = item.value;
				weekTr.appendChild(th);
			});
			table.appendChild(weekTr);
		}
		for (let index = 0, len = cells.length; index < len; index++) {
			const lines = cells[index];
			const length = lines.length;
			const trNode = trs[index + 1];
			const cellTr = [];
			for (let rw = 0; rw < length; rw++) {
				const [[td]] = tools.create('td*1');
				const {
					isInRange,
					isDisabled, 
					isActive, 
					isCurrentMonth, 
					line, 
					row,
					value,
					isToday
				} = lines[rw];
				td.setAttribute('data-index', `${line}-${row}`);
				td.innerText = value;
				if (isToday) {
					td.innerText = '今天';
					tools.addClass([{node: td, className: classes.today}]);
				}
				// 处理日期范围的显示样式
				isInRange ? tools.addClass([{node: td, className: classes.inRange}]) : null;
				// 非范围时间点不可选择
				isDisabled ? tools.addClass([{node: td, className: classes.disabled}]) : null;
				// 选择时间点高亮显示处理
				isActive? tools.addClass([{node: td, className: classes.current}]) : null;
				// 本月、上月、下月样式显示区别
				isCurrentMonth === 0 ? tools.addClass([{
					node: td, 
					className: classes.normal
				}]) : tools.addClass([{
					node: td,
					className: isCurrentMonth < 0 ? classes.prevMonth : classes.nextMonth
				}]);
				cellTr.push(td);
				trNode.appendChild(td);
			}
			cellNodes.push(cellTr);
			table.appendChild(trNode);
		}
		table.setAttribute('cellspacing', '0');
		tools.addClass([
			{node: table, className: classes.content}
		]);
		return [table, cellNodes];
	};

	// type date时内容区数据以及节点构建
	tools.createDateContent = function(panel) {
		const { initDate } = panel;
		const { year, month, day } = tools.getYMD(initDate);
		const [wkCells, cells] = tools.createCells({
			year,
			month,
			day
		}, panel);
		const [ table, cellNodes ] = tools.getContextArea(cells, wkCells);

		return [table, cells, cellNodes];
	}

	// 构建panel面板对象的构成对象：nav对象、content对象
	tools.createDateView = function() {
		const panel = this;
		const [ table, cells, cellNodes] = tools.createDateContent(panel);
		panel.contentArea = new Content(panel, table, cells, cellNodes);
		panel.navArea = new Nav(panel);
	};

	// 创建panel面板
	tools.createPanel = function() {
		const panel = this;
		const [[panelNode]] = tools.create('div*1');
		const { isRange } = panel.$parent;
		const className = isRange ? (
			panel.id > 0 ? `${classes.panel} ${classes.right}` : 
				`${classes.panel} ${classes.left}`
			) : classes.panel;

		tools.addClass([
			{
				node: panelNode, 
				className
			}
		]);
		tools.appendChild([
			{
				node: panelNode, 
				childs: [
					panel.navArea.nav, 
					panel.contentArea.content
				]
			}
		]);
		panel.panelNode = panelNode;
	};

	// 处理日期以及日期范围的输出
	tools.handleExports = function(date, format, type) {
		let {year, month, day, hour, minutes, seconds} = tools.getYMD(date);
		let formatDate = null;

		format = formats.includes(format) ? format : formats[0];
		month = tools.pad(month);
		day = tools.pad(day);
		hour = tools.pad(hour);
		minutes = tools.pad(minutes);
		seconds = tools.pad(seconds);
		switch(format) {
			case formats[0]:
				formatDate = `${year}-${month}-${day}`;
				break;
			case formats[1]:
				formatDate = `${year}年${month}月${day}日`;
				break;
		}
		return formatDate;
	};

	// 输出选择的日期
	tools.exports = function(sdate) {
		const { settings: { type, format }, value } = sdate;
		const isRange = type === 'daterange';
		return isRange ? (function() {
			let separtor = '~',
				formatDates = [];

			value.forEach((date) => {
				if (date) {
					formatDates.push(tools.handleExports(date, format, type));
				}
			});
			return `${formatDates[0]} ${separtor} ${formatDates[1]}`;
		}()) : tools.handleExports(value[0], format, type);
	};

	// 替换日期中的内容区域DOM以及相关对象
	tools.replaceContent = function(panel) {
		const [table, cells, cellNodes] = tools.createDateContent(panel);
		const {
			panelNode, 
			navArea, 
			initDate, 
			contentArea
		} = panel;
		const { year, month } = tools.getYMD(initDate);
		panel.contentArea = new Content(panel, table, cells, cellNodes);
		// 替换内容区
		panelNode.replaceChild(table, contentArea.content);
		tools.handleContentEvents(panel);
		// 替换顶部部分区域
		navArea.changeYMValue(year, month);
	};

	// 处理顶部区域事件绑定
	tools.handleHeaderEvents = function(panel) {
		const {
			nav: headerNode,
			yearLeftNode,
			yearRightNode,
			monthLeftNode,
			monthRightNode
		} = panel.navArea;
		const { isRange } = panel.$parent;

		headerNode.addEventListener('click', function(e) {
			e.stopPropagation();
			const target = e.target;
			if (target) {
				let selectedDate = null;
				let selectedDateOfOtherPanel = null;
				const { initDate } = panel;
				const { year, month, day } = tools.getYMD(initDate);
				const isYL = yearLeftNode.contains(target);
				const isYR = yearRightNode.contains(target);
				const isML = monthLeftNode.contains(target);
				const isMR = monthRightNode.contains(target);
				
				// 上月、上年切换
				if (isML || isYL) {
					const targetMonth = isML ? month - 2 : month - 1;
					const targetYear = isYL ? year - 1 : year;
					selectedDate = new Date(targetYear, targetMonth, day);
					// 日期范围处理
					if (isRange) {
						selectedDateOfOtherPanel = new Date(targetYear, targetMonth + 1, day);
					}
				}
				// 下月、下年
				if (isMR || isYR) {
					const targetMonth = isMR ? month : month - 1;
					const targetYear = isYR ? year + 1 : year;
					selectedDate = new Date(targetYear, targetMonth, day);
					// 日期范围处理
					if (isRange) {
						selectedDateOfOtherPanel = new Date(targetYear, targetMonth - 1, day);
					}
				}
				// 防止非切换区域的点击
				if (isYL || isYR || isML || isMR) {
					panel.changeCurrentDate(selectedDate);
					tools.replaceContent(panel);
					if (isRange && selectedDateOfOtherPanel) {
						const { panels } = panel.$parent;
						const targetPanel = panel.id === 0 ? panels[1] : panels[0];
						targetPanel.changeCurrentDate(selectedDateOfOtherPanel);
						tools.replaceContent(targetPanel);
					}
				}
			}
		});
	};

	// 处理内容区域事件绑定
	tools.handleContentEvents = function(panel) {
		const { 
			$parent: section, 
			contentArea: {
				cells,
				content: contentNode
			}, 
			initDate
		} = panel;
		const sdate = section.$parent;
		const { input: el } = sdate;
		const { isRange } = section;
		const { year, month } = tools.getYMD(initDate);
		let rangeDates = [];
		// 输出选择值到输入框
		const attr = String(el.nodeName).toLowerCase() === 'input' ? 'value' : 'innerText';

		// 内容区域点击
		contentNode.addEventListener('click', function(e) {
			e.stopPropagation();
			const target = e.target;
			const className = String(target.className);
			const nodeName = String(target.nodeName).toLowerCase();

			// 可选内容区域点击
			if (nodeName === 'td' && !tools.isExistClass(className, classes.disabled)) {
				let selectedDate = null;
				let position = target.getAttribute('data-index');
				position = position.split('-');
				const targetCell = cells[Number(position[0])][Number(position[1])];
				const { isCurrentMonth, value } = targetCell;

				// 处理费本月点击的效果，目前不支持其点击
				if (isRange && isCurrentMonth !== 0) return;

				// 再次打开并选择，清空上次选择的值以及面板上选择的样式
				isRange ? sdate.value.length === 2 ? sdate.clear() : null : sdate.clear();

				targetCell.isActive = true;
				// 选择非本月时间处理
				if (isCurrentMonth === 0) {
					selectedDate = new Date(year, month - 1, value);
				} else {
					let selectedYear = null;
					let selectedMonth = null;
					const isPrevMonth = isCurrentMonth === -1;
					if (isPrevMonth) {
						selectedYear = month === 1 ? year - 1 : year;
						selectedMonth = month === 1 ? 11 : month - 2;
					} else {
						selectedYear = month === 12 ? year + 1 : year;
						selectedMonth = month === 12 ? 0 : month;
					}
					selectedDate = new Date(selectedYear, selectedMonth, value);
				}
				tools.addClass([
					{
						node: target,
						className: classes.current
					}
				]);
				// 同步当前选择日期
				sdate.setSelectedValue(selectedDate);
				if (!isRange) {
					// 同步当前panel面板的时间点
					panel.changeCurrentDate(selectedDate);
					el[attr] = tools.exports(sdate);
					// 关闭面板
					section.close();
				} else {
					// 处理上次选择的结果值
					if (section.dates.length === 2) section.clear();
					tools.addClass([
						{
							node: target,
							className: classes.inRange
						}
					]);
					// 处理后选时间大于先选时间
					rangeDates.length 
						? tools.isAfter(selectedDate, rangeDates[0]) 
								? rangeDates.push(selectedDate)
								: rangeDates.unshift(selectedDate)
						: rangeDates.push(selectedDate);
					panel.changeCurrentDate(selectedDate);
					// 范围选择时，只要选择两项则输出选则并关闭
					if (sdate.value.length === 2) {
						el[attr] = tools.exports(sdate);
						rangeDates = [];
						section.close();
					}
				}
			}
		});
	};

	/**
	 * Cell对象（组成日期面板）
	 * @param {*} line       所属当前行
	 * @param {*} row        所属当前列
	 * @param {*} value      当前值
	 * @param {*} cm         是否是当前月（-1：上个月，0：当前月，1：下个月）
	 * @param {*} isToday    是否是今天
	 * @param {*} isActive   当前是否被选择，用于高亮显示
	 * @param {*} isInRange  是否在指定范围内
	 * @param {*} isDisabled 是否可选，支持时间范围
	 * @param {*} note       备注
	 */
	const Cell = function(
		line, 
		row, 
		value, 
		cm, 
		isToday, 
		isActive, 
		isInRange,
		isDisabled,
		note
	) {
		this.line = line;
		this.row = row;
		this.value = value;
		this.isCurrentMonth = cm || 0;
		this.isToday = !!isToday;
		this.isActive = !!isActive;
		this.isInRange = !!isInRange;
		this.note = note;
		this.isDisabled = !!isDisabled;
	};

	/**
	 * 日期面板顶部区域对象
	 */
	const Nav = function($parent) {
		this.$parent = $parent;
		this.nav = null;
		this.yearNode = null;
		this.monthNode = null;
		this.yearLeftNode = null;
		this.yearRightNode = null;
		this.monthLeftNode = null;
		this.monthRightNode = null;
		this.init();
	};

	Nav.prototype = {
		init: function() {
			const { 
				initDate, 
				id, 
				$parent: section 
			} = this.$parent;
			const { year, month } = tools.getYMD(initDate);
			const [
				[headerNode, leftWrapper, middleWrapper, rightWrapper], 
				[ylNode, mlNode, yNode, mNode, textYNode, textMNode, mrNode, yrNode], 
				[ylIcon, mlIcon, mrIcon, yrIcon]
			] = tools.create(['div*4', 'span*8', 'i*4']);
			const [[yearText, monthText]] = tools.create(['span*2']);
	
			tools.addClass([
				{ node: ylIcon, className: classes.yearLeft },
				{ node: mlIcon, className: classes.monthLeft },
				{ node: mrIcon, className: classes.monthRight },
				{ node: yrIcon, className: classes.yearRight },
				{ node: leftWrapper, className: 'wrapper' },
				{ node: middleWrapper, className: 'text-wrapper' },
				{ node: textYNode, className: 'year' },
				{ node: textMNode, className: 'month' },
				{ node: rightWrapper, className: 'wrapper' },
				{ node: headerNode, className: classes.header },
			]);

			yearText.innerText = '年';
			monthText.innerText = '月';

			const defaultNodes = [
				{ node: ylNode, childs: ylIcon },
				{ node: mlNode, childs: mlIcon },
				{ node: yrNode, childs: yrIcon },
				{ node: mrNode, childs: mrIcon },
				{ node: yNode, childs: [textYNode, yearText] },
				{ node: mNode, childs: [textMNode, monthText] },
				{ node: leftWrapper, childs: [ylNode, mlNode] },
				{ node: middleWrapper, childs: [yNode, mNode] },
				{ node: rightWrapper, childs: [mrNode, yrNode] },
				{ 
					node: headerNode, 
					childs: [leftWrapper, middleWrapper, rightWrapper]
				}
			];
			if (section.isRange) {
				defaultNodes.splice(-1);
				const childs = id === 0 
													? [leftWrapper, middleWrapper] 
													: [middleWrapper, rightWrapper];
				defaultNodes.push({ 
					node: headerNode, 
					childs
				});
			}
			tools.appendChild(defaultNodes);
			this.yearNode = textYNode;
			this.monthNode = textMNode;
			this.yearLeftNode = ylNode;
			this.yearRightNode = yrNode;
			this.monthLeftNode = mlNode;
			this.monthRightNode = mrNode;
			this.changeYMValue(year, month);
			this.nav = headerNode;
		},
		// 改变顶部时间文本
		changeYMValue: function(year, month) {
			this.yearNode.innerText = `${year}`;
			this.monthNode.innerText = `${month}`;
		}
	};

	/**
	 * 面板内容区域对象
	 * @param {*} content 面板内容区域DOM
	 * @param {*} cells   cell集合，构成内容区域内容
	 */
	const Content = function($parent, content, cells, cellNodes) {
		this.$parent = $parent;
		this.cells = cells;
		this.content = content;
		this.cellNodes = cellNodes || [];
	};

	/**
	 * 时间对象
	 * @param {*} config 配置对象
	 * isInit     是否是初始化
	 * setion     面板容器对象
	 * settings   最终配置对象
	 * input      触发文本框
	 * userConfig 用户配置对象
	 * value      当前输出值
	 */
	const SDate = function(config) {
		this.isInit = true;
		this.section = null;
		this.settings = null;
		this.input = null;
		this.userConfig = config;
		this.value = [];
		this.render();
	};

	SDate.prototype = {
		render: function() {
			const settings = tools.extend(defaultConfig, this.userConfig);
			const idName = String(settings.el).replace('#', '');
			this.input = doc.getElementById(idName);
			this.settings = settings;
			this.section = new Section(this);
			this.onEvents();
		},
		onEvents: function() {
			const that = this;
			const { section, input } = this;
			const { panels } = section;
			input.addEventListener('focus', function(e) {
				if (!section) return;
				section.open();
				if (that.isInit) {
					that.isInit = false;
					doc.body.appendChild(section.sectionNode);
				} else {
					// 处理选择后切换上年上月等面板电视问题（初始化面板渲染时间点）
					const { year, month } = tools.getYMD(that.value[0]);
					const values = [new Date(year, month - 1, 1), new Date(year, month, 1)];
					panels.forEach((panel, i) => {
						panel.changeCurrentDate(values[i]);
						tools.replaceContent(panel);
					});
				}
			});
			document.addEventListener('click', function(e) {
				e.stopPropagation();
				const target = e.target;
				if (!input.contains(target)) section.close();
			});
		},
		setSelectedValue: function(date) {
			date = Array.isArray(date) ? date : [date];
			let value = this.value;
			if (value.length + date.length <= 2) {
				this.value.splice(value.length, 1, ...date);
			}
			// 处理后选日期小于已选日期问题
			this.value.sort((a, b) => a.getTime() - b.getTime());
		},
		// 已选择后，再次打开面板进行再次选择时清除相关样式和状态
		clear: function() {
			this.section.clearSelected();
			this.clearValue();
		},
		clearValue: function() {
			this.value = [];
		}
	};

	/**
	 * 面板容器对象
	 * @param {*} $parent 
	 * status       当前状态（true表示展开，false表示关闭）
	 * panels       所有面板对象集合
	 * dates        面板渲染的时间点
	 * sectionNode  面板容器DOM节点
	 * isRange      是否范围选择
	 */
	const Section = function($parent) {
		this.$parent = $parent;
		this.status = false;
		this.panels = [];
		this.dates = [];
		this.sectionNode = null;
		this.isRange = false;
		this.init();
	};

	Section.prototype = {
		init: function() {
			const { type, value } = this.$parent.settings;
			const isRange = type === 'daterange';
			this.isRange = isRange;
			const sectionNode = doc.createElement('section');
			const className = isRange ? `${classes.date} ${classes.range}` : classes.date;
			tools.addClass([
				{
					node: sectionNode,
					className
				}
			]);
			this.sectionNode = sectionNode;
			const now = value ? value : new Date();
			const { year, month, day } = tools.getYMD(now);
			const dates = isRange ? [now, new Date(year, month, day)] : [now];
			let panels = [];
			dates && dates.forEach((date, i) => {
				if (i === 1 && !tools.isNextMonth(date, dates[0])) {
					const { year, month, day } = tools.getYMD(dates[0]);
					date = new Date(year, month, day);
				}
				const panel = new Panel(this, i, date);
				panels.push(panel);
			}, this);
			this.panels = panels;
			panels = panels.map(item => item.panelNode);
			tools.appendChild([
				{
					node: sectionNode,
					childs: panels
				}
			]);
		},
		open: function() {
			this.status = true;
			tools.removeClass(this.sectionNode, classes.none);
		},
		close: function() {
			this.checkValueBeforeClose();
			this.status = false;
			tools.addClass([
				{
					node: this.sectionNode, 
					className: classes.none
				}
			]);
		},
		setDates: function(dates) {
			this.dates = dates;
		},
		clearSelected: function() {
			this.panels.forEach(panel => panel.clearSelected());
		},
		checkValueBeforeClose: function() {
			if (!this.isRange) return;
			const sdate = this.$parent;
			if (sdate.value.length !== 2) sdate.clearValue();
		}
	};

	/**
	 * 面板对象
	 * @param {*} $parent 
	 * @param {*} id           
	 * @param {*} currentDate 当前面板时间点
	 * initDate  当前面板根据该时间点渲染
	 * panelNode     面板DOM
	 * navArea       顶部区域对象
	 * contentArea   内容区域对象
	 */
	const Panel = function($parent, id, currentDate) {
		this.$parent = $parent;
		this.id = id;
		this.initDate = currentDate;
		this.panelNode = null;
		this.navArea = null;
		this.contentArea = null;
		this.init();
	};

	Panel.prototype = {
		init: function() {
			// 构建面板
			tools.createDateView.call(this);
			tools.createPanel.call(this);

			// 事件处理
			tools.handleHeaderEvents(this);
			tools.handleContentEvents(this);
		},
		changeCurrentDate: function(date) {
			this.initDate = date;
		},
		// 去除上一次选择的时间点active以及范围的样式
		clearSelected: function() {
			const { cells } = this.contentArea;
			const targetQueryClass = !this.$parent.isRange ? classes.current : classes.inRange;
			const nodes = this.panelNode.querySelectorAll(`.${targetQueryClass}`);
			[...nodes].forEach(node => {
				const { line, row } = tools.getPosIndexOfCell(node);
				const cell = cells[line][row];
				cell.isActive = false;
				cell.isInRange = false;
				tools.removeClass(node, classes.current);
				tools.removeClass(node, classes.inRange);
			});
		}
	};

	root.SDate = SDate;
})(window);