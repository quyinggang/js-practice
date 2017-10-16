/**
 * 日期选择控件date
 * quyinggang
 */
!(function(root, undefined) {
	let doc = document,
		formats = ['yyyy-MM-dd', 'localDate'],
		defaultConfig = {
			el: '',
			type: 'date',
			range: false,
			format: formats[0],
			start: null,
			end: null
		},
		classes = {
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
			active: 'active',
			diabled: 'disabled',
			normal: 'normal',
			prevMonth: 'prev-month',
			nextMonth: 'next-month',
			none: 'none',
			hidden: 'hidden',
			left: 'is-left',
			right: 'is-right',
			inRange: 'is-in-range',
		},
		tools = {},
		weeks = ['日', '一', '二', '三', '四', '五', '六'],
		monthOf31s = [1, 3, 5, 7, 8, 10, 12];

	// 判断对象
	tools.isObject = function(obj) {
		return Object.prototype.toString.call(obj) === "[object Object]";
	};

	// 判断日期对象
	tools.isDate = function(date) {
		return Object.prototype.toString.call(date) === '[object Date]';
	};

	// 位数补齐
	tools.pad = function(val) {
		let numberVal = parseInt(val) || 0;
		return numberVal < 10 ? '0' + numberVal : numberVal;
	};

	// class添加
	tools.addClass = function(classes) {
		if (Array.isArray(classes)) {
			classes.forEach((item) => {
				if (item) {
					let {node, className} = item;
					if (node) {
						if (String(node.className).indexOf(className) < 0) {
							node.className = String(node.className + ' ' + className).trim();
						}
					}
				}
			})
		}
	};

	// 移除class
	tools.removeClass = function(elem, className) {
		if (!elem || !elem.nodeName) {
			return;
		}
		elem.className = String(elem.className).replace(className, '');
	};

	// 节点添加
	tools.appendChild = function(nodes) {
		if (Array.isArray(nodes)) {
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
		}
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


	let createDetail = function(item) {
		let nodes = [],
			items = String(item).split('*'),
			count = parseInt(items[1]);

		if (count) {
			for (let index = 0; index < count; index++) {
				nodes.push(doc.createElement(items[0]));
			}
		}
		return nodes;
	}
	// 创建节点
	tools.create = function(elems) {
		let isArray = Array.isArray(elems),
			isString = typeof elems === 'string',
			nodes = [];

		if (isArray) {
			elems.forEach((item) => {
				nodes.push(createDetail(item));
			});
		} else if (isString) {
			nodes.push(createDetail(elems));
		}
		return nodes;
	};

	// 获取年月日时分秒
	tools.getYMD = function(date) {
		let result = {};
		if (tools.isDate(date)) {
			result.year = date.getFullYear();
			result.month = date.getMonth() + 1;
			result.day = date.getDate();
			result.hour = date.getHours() || 0;
			result.minutes = date.getMinutes() || 0;
			result.seconds = date.getSeconds() || 0;
		} else {
			let d = String(date).replace(/[^\d]/g, '');
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

	// 判断平闰年
	tools.isLeaf = function(year) {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	};

	// 获取指定月天数
	tools.getDaysOfMonth = function(month, year) {
		return  monthOf31s.includes(month) ? 31 : 
			(month !== 2 ? 30 : (tools.isLeaf(year) ? 28 : 29));
	};

	// 判断是否是今天
	tools.isToday = function(year, month, day) {
		let now = new Date(),
			curYear = now.getFullYear(),
			curMonth = now.getMonth() + 1,
			curDay = now.getDate();

		return year === curYear && month === curMonth && day === curDay;
	}
	// 日期内容数据
	tools.createCells = function(dates, that) {
		let {year, month, day} = dates,
			{start, end} = that.settings,
			isRange = that.section.isRange,
			rangeDate = that.section.rangeDate,
			dayInWeek = new Date(year, month - 1, 1).getDay(),
			line = 6,
			row = 7,
			cells = [],
			wkCells = [],
			lineStart = 0,
			currentMonth = parseInt(month),
			daysofCurrentMonth = tools.getDaysOfMonth(currentMonth, year),
			daysOfPrevMonth = tools.getDaysOfMonth(currentMonth === 1 ? 11 : currentMonth - 1, year);

		for (let index = 0, len = weeks.length; index < len; index++) {
			wkCells.push(new Cell(0, index, weeks[index]));
		}
		for (let le = 0; le < line; le++) {
			let rows = [];
			for (let rw = 0; rw < row; rw++) {
				if (le === 0) {
					dayInWeek === 0 ? (function() {
						rows.push(new Cell(le, rw, daysOfPrevMonth - row + rw + 1, -1));
					}()) : (function() {
						rw < dayInWeek ? rows.push(new Cell(le, rw, daysOfPrevMonth - dayInWeek + rw + 1, -1)) :
							rows.push(new Cell(le, rw, rw - dayInWeek + 1));
					}());
					if (rw === row - 1) {
						let endValue = rows[rows.length - 1].value;
						lineStart = endValue + 1 > daysOfPrevMonth ? daysOfPrevMonth - endValue : endValue;
					}
				} else  {
					lineStart += 1;
					if (lineStart === day && lineStart <= daysofCurrentMonth) {
						rows.push(new Cell(le, rw, lineStart));
					} else if (lineStart <= daysofCurrentMonth) {
						rows.push(new Cell(le, rw, lineStart));
					} else {
						rows.push(new Cell(le, rw, lineStart - daysofCurrentMonth, 1));
					}
				}
				let cell = rows.pop();
				if (cell.isCurrentMonth === 0) {
					isRange ? (function() {
						let [sd, ed] = rangeDate.length ? rangeDate : '',
							tempDate = new Date(year, month - 1, cell.value);

						if (sd) {
							if (tempDate >= sd && tempDate <= ed) {
								if (tempDate - sd === 0 || tempDate - ed === 0) {
									cell.isCurrent = true;
								}
								cell.isINRange = true;
							}
						}

					}()) : (function() {
						day = Array.isArray(day) ? day : [day];
						cell.isCurrent = day.includes(cell.value) ? true : false;
					}());
				}
				if (tools.isToday(year, month, cell.value)) {
					cell.isToday = true;
					cell.note = '今天';
				}
				if (start || end) {
					let [cy, cm] = cell.isCurrentMonth < 0 ? (month === 1 ? [year - 1, 11] : 
						[year, month - 2]) : (cell.isCurrentMonth === 0 ? [year, month - 1] : 
						(month === 12 ? [year + 1, 1] : [year, month])),
						curDate = new Date(cy, cm, cell.value),
						{year: sy, month: sm, day: sd} = start ? tools.getYMD(start) : '',
						{year: ey, month: em, day: ed} = end ? tools.getYMD(end): '';

					if (sy && new Date(sy, sm - 2, sd) > curDate) {
						cell.isActive = false;
					}
					if (ey && new Date(ey, em - 2, ed) < curDate) {
						cell.isActive = false;
					}
				}
				rows.push(cell);
			}
			cells.push(rows);
		}
		return [wkCells, cells];
	};

	// 依据cells构建内容节点
	tools.getContextArea = function(trCount, cells, wks) {
		let [[table], trs] = tools.create(['table*1', `tr*${trCount}`]);
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
			let lines = cells[index],
				length = lines.length,
				trNode = trs[index + 1];

			for (let rw = 0; rw < length; rw++) {
				let [[td]] = tools.create('td*1'),
					cell = lines[rw];
				td.innerText = cell.value;
				if (cell.isToday) {
					td.innerText = '今天';
					tools.addClass([{node: td, className: classes.today}]);
				}
				cell.isINRange ? tools.addClass([{node: td, className: classes.inRange}]) : '';
				!cell.isActive ? tools.addClass([{node: td, className: classes.diabled}]) : '';
				cell.isCurrent ? tools.addClass([{node: td, className: classes.current}]) : '';
				cell.isCurrentMonth === 0 ? tools.addClass([{node: td, className: classes.normal}]) : 
					(function() {
						let className = cell.isCurrentMonth < 0 ? classes.prevMonth : classes.nextMonth;
						tools.addClass([{node: td, className: className}]);
					}());
				
				trNode.appendChild(td);
			}
			table.appendChild(trNode);
		}
		table.setAttribute('cellspacing', '0');
		tools.addClass([
			{node: table, className: classes.content}
		]);
		return table;
	};

	// type date时内容区数据以及节点构建
	tools.createDateContent = function(that) {
		let sectionObj = that.section,
			isRange  = sectionObj.isRange,
			rangeDate = sectionObj.rangeDate,
			id = that.id,
			date = that.date,
			{year, month, day, hour, minutes, seconds} = tools.getYMD(date);
		
		if (!isRange) {
			that.date = new Date(year, month - 1, day, hour, minutes, seconds);
		}

		let options = {year: year, month: month, day: day},
			[wkCells, cells] = tools.createCells(options, that),
			table = tools.getContextArea(7, cells, wkCells);

		return isRange ? [table, cells, options] : [table, cells];
	}

	// date
	tools.createDateView = function() {
		let [[headerNode], [ylNode, mlNode, yNode, mNode, mrNode, yrNode], 
			[ylIcon, mlIcon, mrIcon, yrIcon]] = tools.create(['div*1', 'span*6', 'i*4']),
			[table, cells, headDate] = tools.createDateContent(this),
			isRange = this.section.isRange,
			{year, month} = isRange ? headDate : tools.getYMD(this.date);
			isLeft = this.id > 0 ? false : true;

		this.contentObj = new Content(table, cells);
		tools.addClass([
			{node: ylIcon, className: classes.yearLeft},
			{node: mlIcon, className: classes.monthLeft},
			{node: mrIcon, className: classes.monthRight},
			{node: yrIcon, className: classes.yearRight},
			{node: headerNode, className: classes.header},
		]);

		yNode.innerText = `${year} 年`;
		mNode.innerText = `${month} 月`;

		tools.appendChild([
			{node: ylNode, childs: ylIcon},
			{node: mlNode, childs: mlIcon},
			{node: yrNode, childs: yrIcon},
			{node: mrNode, childs: mrIcon},
			{node: headerNode, childs: [ylNode, mlNode, yNode, mNode, yrNode, mrNode]}
		]);
		this.navObj = isRange ? (function() {
			let nav = null;
			if (isLeft) {
				tools.addClass([
					{node: yrNode, className: classes.hidden},
					{node: mrNode, className: classes.hidden}
				]);
				nav = new Nav(headerNode, yNode, mNode, ylNode, mlNode);
			} else {
				tools.addClass([
					{node: ylNode, className: classes.hidden},
					{node: mlNode, className: classes.hidden}
				]);
				nav = new Nav(headerNode, yNode, mNode, null, null, mrNode, yrNode);
			}
			return nav;
		}()) : new Nav(headerNode, yNode, mNode, ylNode, mlNode, mrNode, yrNode);
	};

	// 创建panel面板
	tools.createPanel = function(panelObj) {
		let [[panelNode]] = tools.create('div*1'),
			that = panelObj,
			className = that.section.isRange ? (that.id > 0? `${classes.panel} ${classes.right}` : 
				`${classes.panel} ${classes.left}`) : classes.panel;

		tools.addClass([{node: panelNode, className: className}]);
		that.panel = panelNode;
		tools.appendChild([{node: panelNode, childs: [that.navObj.nav, that.contentObj.content]}]);
	};
	// // year
	// tools.createYearView = function() {
	// };

	// // month
	// tools.createMonthView = function() {
	// };

	// // time(HH:mm:ss)
	// tools.createTimeView = function() {
	// 	let [[footerNode], [clearNode, ]] = tools.create(['div*1', 'span*3']);
	// };

	// 日期面板构建
	tools.views = function() {
		let type = this.settings.type;
		switch(type) {
			case 'date':
				tools.createDateView.call(this);
		}
		tools.createPanel(this);
	};

	// 清除所有当前选中的日期样式
	tools.clear = function(isRange) {
		if (isRange) {
			let currentTd = doc.querySelectorAll(`.${classes.current}`),
				inRangeTd = doc.querySelectorAll(`.${classes.inRange}`);

			for (let index = 0, len = currentTd.length; index < len; index++) {
				let td = currentTd[index];
				tools.removeClass(td, 'current');
			}
			for (let index = 0, len = inRangeTd.length; index < len; index++) {
				let td = inRangeTd[index];
				tools.removeClass(td, 'is-in-range');
			}
		} else {
			let currentTd = doc.querySelector(`.${classes.current}`);
			tools.removeClass(currentTd, 'current');
		}
	};

	// 显示日期面板
	tools.showSection = function(sectionNode) {
		tools.removeClass(sectionNode, classes.none);
	};

	// 隐藏日期面板
	tools.hiddenSection = function(sectionNode) {
		tools.addClass([{node: sectionNode, className: classes.none}]);
	};

	// 处理日期以及日期范围的输出
	tools.handleExports = function(date, format, type,) {
		let {year, month, day, hour, minutes, seconds} = tools.getYMD(date),
			formatDate = null;

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
	tools.exports = function(dates, format, type, isRange) {
		return isRange ? (function() {
			let separtor = '~',
				formatDates = [];

			dates.forEach((date) => {
				if (date) {
					formatDates.push(tools.handleExports(date, format, type));
				}
			});
			return `${formatDates[0]}${separtor}${formatDates[1]}`;
		}()) : tools.handleExports(dates, format, type);
	};

	tools.replaceContent = function(that) {
		let [table, cells] = tools.createDateContent(that),
			yNode = that.navObj.y,
			mNode = that.navObj.m,
			panel = that.panel,
			date = that.date;

		// 替换内容区
		panel.replaceChild(table, that.contentObj.content);
		that.contentObj = new Content(table, cells);
		tools.handleContentEvents(that);
		// 替换顶部部分区域
		year = date.getFullYear();
		month = date.getMonth() + 1;
		yNode.innerText = `${year} 年`;
		mNode.innerText = `${month} 月`;
	};
	// 处理顶部区域事件绑定
	tools.handleHeaderEvents = function(that) {
		let headerNode = that.navObj.nav,
			panel = that.panel,
			isRange = that.section.isRange,
			id = that.id;

		headerNode.addEventListener('click', function(e) {
			e.stopPropagation();
			let target = e.target,
				panels = that.section.panels,
				length = e.target.children.length;

			if (length === 0 || length === 1) {
				let className = target.className,
					date = that.date,
					id = that.id,
					next = null,
					isYL = isML = isMR = isYR = null;

				let {year, month} = tools.getYMD(date);
				isYL = String(className).indexOf(classes.yearLeft) >= 0;
				isML = String(className).indexOf(classes.monthLeft) >= 0;
				isMR = String(className).indexOf(classes.monthRight) >= 0;
				isYR = String(className).indexOf(classes.yearRight) >= 0;

				isML ? (function() {
					date.setMonth(month - 2);
					if (isRange) {
						let {year, month, day, hour, minutes, seconds} = tools.getYMD(date);
						next = new Date(year, month, day, hour, minutes, seconds);
					}
				}()) : (isMR ? (function() {
					date.setMonth(month);
					if (isRange) {
						let {year, month, day, hour, minutes, seconds} = tools.getYMD(date);
						next = new Date(year, month - 2, day, hour, minutes, seconds);
					}
				}()) : (isYL ? (function() {
					date.setFullYear(year - 1);
					if (isRange) {
						let {year, month, day, hour, minutes, seconds} = tools.getYMD(date);
						next = new Date(year, month, day, hour, minutes, seconds);
					}
				}()) : (isYR ? (function() {
					date.setFullYear(year + 1);
					if (isRange) {
						let {year, month, day, hour, minutes, seconds} = tools.getYMD(date);
						next = new Date(year, month - 2, day, hour, minutes, seconds);
					}
				}()) : '')));
				
				that.date = date;
				if (isRange) {
					panels.forEach((panel) => {
						if (panel.id !== that.id) {
							panel.date = next;
						}
						tools.replaceContent(panel);
					});
				} else {
					tools.replaceContent(that);
				}
			}
		});
	};

	// 处理内容区域事件绑定
	tools.handleContentEvents = function(that) {
		let contentNode = that.contentObj.content,
			count = 0,
			el = that.el,
			sectionObj = that.section,
			isRange = sectionObj.isRange,
			panel = that.panel,
			id  = that.id,
			{format, type} = that.settings;

		contentNode.addEventListener('click', function(e) {
			e.stopPropagation();
			let target = e.target,
				className = String(target.className),
				nodeName = String(target.nodeName).toLowerCase();

			if (nodeName === 'td' && String(className).indexOf(classes.diabled) < 0) {
				let isCurrentMonth = className.indexOf(classes.normal) >= 0,
					isPrevMonth = className.indexOf(classes.prevMonth) >= 0,
					value = target.innerText,
					selectedDay = String(value).indexOf('今天') >= 0 ? new Date().getDate() : parseInt(value),
					{year, month, day} = tools.getYMD(that.date),
					date = new Date(year, month - 1, day),
					cache = null;

				count += 1;
				isCurrentMonth ? date.setDate(selectedDay) : (function() {
					if (isPrevMonth) {
						date = month === 1 ? new Date(year - 1, 11, selectedDay) : new Date(year, month - 2, selectedDay);
					} else {
						date = month === 12 ? new Date(year + 1, 0, selectedDay) : new Date(year, month, selectedDay);
					}
				}());
				if (!isRange) {
					tools.addClass([
						{node: target, className: classes.current}
					]);
					that.date = date;
					let attr = String(el.nodeName).toLowerCase() === 'input' ? 'value' : 'innerText';
					el[attr] = tools.exports(date, format, type, isRange);
					tools.hiddenSection(that.parentNode);
					sectionObj.status = 'off';
				} else {
					if (sectionObj.rangeDate.length === 2) {
						tools.clear(isRange);
						sectionObj.rangeDate = [];
						count = 0;
					}
					count === 1 ? (function() {
						cache = new Date(year, month - 1, day);
						tools.clear(isRange);
						tools.addClass([
							{node: target, className: classes.current}
						]);
						sectionObj.rangeDate.push(date);
					}()) : (count === 2 ? (function() {
						let sdate = sectionObj.rangeDate[0];
						tools.addClass([
							{node: target, className: classes.current}
						]);
						if (date >= sdate) {
							sectionObj.rangeDate.push(date);
						} else if (date < sdate) {
							sectionObj.rangeDate.unshift(date);
						}
					}()): '');
					if (sectionObj.rangeDate.length > 1) {
						let attr = String(el.nodeName).toLowerCase() === 'input' ? 'value' : 'innerText';
						el[attr] = tools.exports(sectionObj.rangeDate, format, type, isRange);
						tools.hiddenSection(that.parentNode);
						sectionObj.status = 'off';
					}
				}
			}
		});
		// if (isRange) {
		// 	contentNode.addEventListener('dbclick', function(e) {
		// 		e.stopPropagation();
		// 	});
		// }
	};

	// 事件绑定以及处理
	tools.events = function() {
		tools.handleHeaderEvents(this);
		tools.handleContentEvents(this);
	};


	/**
	 * isCurrentMonth
	 * -1：前一个月
	 * 0:当月
	 * 1: 下一个
	 */
	let Cell = function(line, row, value, cm, isToday, isActive) {
		this.line = line;
		this.row = row;
		this.value = value;
		this.isCurrentMonth = cm || 0;
		this.isToday = isToday || false;
		this.isActive = isActive || true;
		this.isINRange = false;
		this.isCurrent = false;
		this.note = null;
	};

	/**
	 * 日期面板顶部区域
	 * @param {[type]} nav 顶部节点对象
	 * @param {[type]} yl  上一年
	 * @param {[type]} yr  下一年
	 * @param {[type]} ml  上个月
	 * @param {[type]} mr  下个月
	 * @param {[type]} y   年显示
	 * @param {[type]} m   月显示
	 */
	let Nav = function(nav, y, m, yl, ml, mr, yr) {
		this.nav = nav;
		this.yearLeft = yl;
		this.yearRight = yr;
		this.monthLeft = ml;
		this.monthRight = mr;
		this.y = y;
		this.m = m;
	};

	let Content = function(content, cells) {
		this.cells = cells;
		this.content = content;
	};

	let Panel = function(id, el, settings, date, parentNode, section) {
		this.id = id;
		this.el = el;
		this.settings = settings;
		this.date = date;
		this.panel = null;
		this.navObj = null;
		this.contentObj = null;
		this.parentNode = parentNode;
		this.section = section;
	};

	Panel.prototype.init = function() {
		tools.views.call(this);
		tools.events.call(this);
	};

	let Section = function(el, settings, status) {
		this.el = el;
		this.settings = settings;
		this.status = status || 'off';
		this.panels = [];
		this.isRange = false;
		this.rangeDate = [];
	};

	let SDate = function() {};

	SDate.prototype.render = function(config) {
		let settings = tools.extend(defaultConfig, config),
			el = doc.getElementById(String(settings.el).replace('#', '')),
			isRange = settings.hasOwnProperty('range') && settings.range,
			sectionNode = doc.createElement('section'),
			sectionObj = new Section(el, settings);

		isRange ? tools.addClass([
			{node: sectionNode, className: `${classes.date} ${classes.range}`}
			]): tools.addClass([{node: sectionNode, className: classes.date}]);
		el.addEventListener('focus', function(e) {
			let panels = sectionObj.panels,
				dates = isRange ? (function() {
					let temps = [];
					panels.length ? (function() {
						panels.forEach((panel) => {
							temps.push(panel.date);
						});
					}()) : (function() {
						let now = new Date(),
							next = new Date(),
							{year, month} = tools.getYMD(now);

						if (month === 12) {
							next.setFullYear(year + 1);
							next.setMonth(1);
						} else {
							next.setMonth(month);
						}
						temps = [now, next];
					}());
					return temps;
				}()) : (panels.length ? [panels[0].date] : [new Date()]);

			if (sectionObj.status === 'off') {
				let isExistPanel = panels.length > 0;
				tools.removeClass(sectionNode, classes.none);
				dates.forEach((date, index) => {
					sectionObj.isRange = isRange ? true : false;
					let panel = new Panel(index, el, settings, date, sectionNode, sectionObj);
					panel.init();
					isExistPanel ? sectionNode.replaceChild(panel.panel, panels.shift().panel) : 
						tools.appendChild([{node: sectionNode, childs: panel.panel}]);
					panels.push(panel);
				});
				sectionObj.status = 'on';
				!isExistPanel ? doc.body.appendChild(sectionNode) : '';
			}
		});
		document.addEventListener('click', function(e) {
			e.stopPropagation();
			let elNodeName = String(el.nodeName).toLowerCase(),
				target = e.target,
				paths = e.path,
				isClose = true,
				targetNodeName = String(target.nodeName).toLowerCase();

			if (targetNodeName !== elNodeName && sectionObj.panels.length) {
				for (let index = paths.length; index--;) {
					let node = paths[index];
					if (node) {
						if (String(node.nodeName).toLowerCase() === 'section' && 
							String(node.className).indexOf(classes.date) >= 0) {
							isClose = false;
							break;
						}
					}
				}
				if (isClose) {
					tools.hiddenSection(sectionNode);
					sectionObj.status = 'off';
				}
			}
		});
	};

	root.sdate = new SDate();
})(window);