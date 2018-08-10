;(function(root, undefined) {
  let tableIndex = 1;
  const doc = root.document;
  const tools = {
    createEle: function(tag, className) {
      tag = tag || 'div';
      className = className || '';
      const node = doc.createElement(tag);
      className ? node.className = className : null;
      return node;
    },
    addClass: function(node, className) {
      if (!node || !('nodeType' in node)) return;
      className = className || '';
      const cn = String(node.className).trim();
      if (cn.lastIndexOf(className) >= 0) return;
      node.className = cn ? `${cn} ${className}` : className;
    },
    append: function(node, childs) {
      if (!node || !('nodeType' in node)) return;
      childs = Array.isArray(childs) ? childs : [childs];
      childs.forEach(child => {
        if (child && 'nodeType' in child) {
          node.appendChild(child);
        }
      });
    },
    createTable: function(className) {
      const table = this.createEle('table', className);
      table.border = 0;
      table.cellPadding = 0;
      table.cellSpacing = 0;
      return table;
    },
    removeClass: function(node, className) {
      if (!node || !('nodeType' in node)) return;
      node.className = String(node.className).replace(className, '').trim();
    },
    bindTREvents: function(targetTrs, otherTrs) {
      if (!Array.isArray(targetTrs)) return;
      const targetClass = 'hover-tr';
      targetTrs.forEach((tr, index) => {
        const targetTr = otherTrs[index];
        tr.addEventListener('mouseenter', function() {
          const nodeName = String(this.nodeName).toLowerCase();
          if (nodeName === 'tr') {
            tools.addClass(this, targetClass);
            tools.addClass(targetTr, targetClass);
          }
        });
        tr.addEventListener('mouseleave', function() {
          tools.removeClass(this, targetClass);
          tools.removeClass(targetTr, targetClass);
        });
      });
    }
  }

  /*
    config: 用于配置table的属性，对象类型
    - height: 高度
    - data: 数据
    - border: 是否显示边框
    columns: 列定义，数组类型
    - label: 列名
    - fixed: left
    - width: 宽度
    - prop: 数据中变量值
   */
  
  const TableContainer = function(config, columns) {
    if (Array.isArray(config) && !columns) {
      columns = config;
      config = {};
    }

    this.config = config;
    this.columns = columns;
    this.tableIndex = tableIndex++;
    this.table = new Table(this, 0);
    this.fixedTable = new Table(this, 1);
    this.tableWrapper = null;
    this.fixedBodyWidth = null;
    this.init();
  };

  TableContainer.prototype = {
    init: function() {
      const { table: { headerTable, bodyTable }, fixedTable, config } = this;
      const tableDOM = tools.createEle('div', 'table');
      if ('border' in config) {
        tools.addClass(tableDOM, 'is-border');
      }
      if ('height' in config) {
        tableDOM.style.height = `${config.height}px`;
      }
      const fixedTableDOM = tools.createEle('div', 'table__fixed-wrapper');
      fixedTable && tools.append(fixedTableDOM, [
        fixedTable.headerTable.tableDOM, 
        fixedTable.bodyTable.tableDOM
      ]);
      tools.append(tableDOM, [
        headerTable && headerTable.tableDOM, 
        bodyTable && bodyTable.tableDOM, 
        fixedTableDOM
      ]);
      fixedTable.wrapper = fixedTableDOM;
      this.tableWrapper = tableDOM;
      this.onEvents();
      if ('el' in config) {
        const el = doc.querySelector(config.el);
        el ? tools.append(el, tableDOM) : tools.append(doc.body, tableDOM);
      }

      // 计算固定列总宽度
      this.computedFixedWidth();
    },
    onEvents: function() {
      const that = this;
      const trsOfFixedTable = this.fixedTable && this.fixedTable.bodyTable.trNodes;
      const trsOfTable = this.table.bodyTable && this.table.bodyTable.trNodes;
      if (trsOfFixedTable && trsOfFixedTable.length) {
        const tableBodyDOM = this.table.bodyTable.tableDOM;
        const headerTableDOM = this.table.headerTable.tableDOM;
        const fixedTableBodyDOM = this.fixedTable.bodyTable.tableDOM;
        // 鼠标hover效果
        tools.bindTREvents(trsOfFixedTable, trsOfTable);
        tools.bindTREvents(trsOfTable, trsOfFixedTable);

        // 保证内容区滚动时表头或固定列同步滚动
        tableBodyDOM.addEventListener('scroll', function() {
          let scrollLeft = this.scrollLeft;
          let scrollTop = this.scrollTop;
          const targetClass = scrollLeft ? 'is-scroll-x' : scrollTop ? 'is-scroll-y' : '';
          tools.addClass(that.tableWrapper, targetClass);
          headerTableDOM.scrollLeft = scrollLeft;
          fixedTableBodyDOM.scrollTop = scrollTop;
          if (scrollLeft < 5) {
            tools.removeClass(that.tableWrapper, targetClass);
          }
        });
      }
    },
    computedFixedWidth: function() {
      setTimeout(() => {
        let fixedBodyWidth = 0;
        const fixedTableDOM = this.fixedTable.wrapper;
        const columns = this.columns;
        columns.forEach(column => {
          if (column.fixed) {
            fixedBodyWidth += parseInt(column.width || 80, 10);
          }
        });
        this.fixedBodyWidth = fixedBodyWidth;
        fixedTableDOM.style.width = `${fixedBodyWidth}px`;
        const childs = [...fixedTableDOM.children];
        childs.forEach(child => {
          const target = child.children[0];
          target.style.width = `${fixedBodyWidth}px`;
        });
      }, 0);
    }
  };

  const ColGroup = function($parent) {
    this.$parent = $parent;
    this.dom = null;
    this.cols = null;
    this.bodyWidth = null;
    this.init();
  };

  ColGroup.prototype = {
    init: function() {
      const { createEle } = tools;
      const { columns, tableIndex } = this.$parent;
      const colgroup = createEle('colgroup');
      let bodyWidth = 0;
      const cols = columns ? columns.map((column, index) => {
        const name = `table_${tableIndex}_column_${index}`;
        const width = column.width || 0;
        bodyWidth += parseInt(width, 10);
        const col = createEle('col');
        col.setAttribute('name', name);
        width ? col.width = width : null;
        return col;
      }) : [];
      this.cols = cols;
      this.bodyWidth = bodyWidth;
      tools.append(colgroup, cols);
      this.dom = colgroup;
    }
  };

  const Table = function($parent, type) {
    this.$parent = $parent;
    this.type = type;
    this.headerTable = null;
    this.bodyTable = null;
    this.init();
  };

  Table.prototype = {
    init: function() {
      this.headerTable = new HeaderTable(this);
      this.bodyTable = new BodyTable(this);
    }
  };

  const HeaderTable = function($parent) {
    this.$parent = $parent;
    this.tableDOM = null;
    this.colgroup = new ColGroup($parent.$parent);
    this.init();
  };

  HeaderTable.prototype = {
    init: function() {
      const { createEle, append } = tools;
      const fixedValue = ['left', 'right'];
      const tableDOM = createEle('div', 'table__header-wrapper');
      const table = tools.createTable('table__header');
      const thead = createEle('thead');
      const tr = createEle('tr');
      const { columns } = this.$parent.$parent;
      const { type } = this.$parent;

      // 创建表头区域table，对于固定列做特别处理，fixed-table中非固定的列加上类is-hidden
      const ths = columns.map(column => {
        const th = createEle('th');
        const cell = createEle('div', 'cell is-left');
        const innerText = column.label;
        cell.innerText = 'fixed' in column ? (type ? innerText : ''): innerText;
        if (type && !('fixed' in column)) tools.addClass(th, 'is-hidden');
        append(th, cell);
        return th;
      });
      table.style.width = `${this.colgroup.bodyWidth}px`;
      append(tr, ths);
      append(thead, tr);
      append(table, this.colgroup.dom);
      append(table, thead);
      append(tableDOM, table);
      this.tableDOM = tableDOM;
    }
  };

  const BodyTable = function($parent) {
    this.$parent = $parent;
    this.tableDOM = null;
    this.trNodes = null;
    this.colgroup = new ColGroup($parent.$parent);
    this.init();
  };

  BodyTable.prototype = {
    init: function() {
      const { createEle, append } = tools;
      const tableDOM = createEle('div', 'table__body-wrapper');
      const table = tools.createTable('table__body');
      const tbody = createEle('tbody');
      const { config, columns } = this.$parent.$parent;
      const { type } = this.$parent;
      if ('height' in config) {
        const maxHeight = parseInt(config.height, 10) - 48;
        tableDOM.style.cssText = `height:${maxHeight}px`;
      }

      // 创建内容区域table，对于固定列做特别处理，fixed-table中非固定的列加上类is-hidden
      const trs = config.data.map(item => {
        const tr = createEle('tr');
        columns.forEach(column => {
          const td = createEle('td');
          const cell = createEle('div', 'cell');
          const innerText = item[column.prop] || '';
          cell.innerText = 'fixed' in column ? (type ? innerText : '') : innerText;
          if (type && !('fixed' in column)) tools.addClass(td, 'is-hidden');
          append(td, cell);
          append(tr, td);
        });
        return tr;
      });
      table.style.width = `${this.colgroup.bodyWidth}px`;
      this.trNodes = trs;
      append(tbody, trs);
      append(table, this.colgroup.dom);
      append(table, tbody);
      append(tableDOM, table);
      this.tableDOM = tableDOM;
    }
  };



  root.Table = TableContainer;

  Object.freeze(root.Table);
})(window);