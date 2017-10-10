/**
 * 实现requireJs的功能
 * 对外暴露的api：define、require
 * 关键点：处理依赖加载以及循环依赖
 */
!(function(root, undefined) {
	let doc = document,
		define = null,
		require = null,
		head = doc.getElementsByTagName('head')[0],
		// 模块id
		mid = 0,
		// 上下文id
		contextId = 0,
		// 模块与上下文对象之间的关系
		maps = {},
		// context对象集合
		contexts = {},
		// 模块集合
		modules = {},
		tools = {};

	tools.isFunction = function(fn) {
		return typeof fn === 'function';
	};

	// 处理模块路径
	tools.nameToUrl = function(name) {
		return `./${name}.js`;
	};

	// 获取js文件名作为模块名
	tools.getMoudleName = function(path) {
		let subs = path.split('/'),
			name = null;

		if (subs.length > 0) {
			name = subs.pop();
		} else {
			name = path;
		}
		name = name.replace(/.js/g, '');
		return name;
	};
	// 获取data-main的js文件名称
	tools.getMainScript = function() {
		if (head) {
			let scripts = doc.body.getElementsByTagName('script'),
				name = null;

			for (let index = scripts.length; index--;) {
				let script = scripts[index],
					targetSrc = script && script.getAttribute('data-main');

				if (targetSrc) {
					name = tools.getMoudleName(targetSrc);
					break;
				}
			}
			return name;
		}
	};

	// 获取当前js文件的名称
	tools.getCurrentModuleName = function() {
		return tools.getMoudleName(doc.currentScript.src);
	};

	// 创建script节点
	tools.createNode = function(src) {
		if (!src || !tools.getMainScript(src)) {
			tools.defaultHandleError(`获取模块失败, 模块路径为${src}`);
			return;
		}
		let scriptNode = doc.createElement('script');
        scriptNode.type = 'text/javascript';
        scriptNode.src = src;
		return scriptNode;
	};

	tools.defaultHandleError = function(message) {
		console.error(message);
	};


	// 模块对象
	let Module = function(name, deps, callback, errback) {
		this.mid = ++mid;
		this.init(name, deps, callback, errback);
		this.fetch();
	};

	// 模块的状态
	Module.STATUS = {
		// 模块初始化中
		INIT: 1,
		// 模块请求中
		FETCHING: 2,
		// 模块解析中
		EXECTED: 3,
		// 模块加载出错
		ERROR: 4
	};

	Module.prototype = {
		init: function(name, deps, callback, errback) {
			// 路径
			this.src = tools.nameToUrl(name);
			// 模块名
			this.name = name;
			// 模块依赖列表
			this.deps = deps;
			// 回调函数
			this.callback = callback;
			// 错误处理函数
			this.errback = errback;
			// 模块状态
			this.status = null;
			// 模块输出
			this.exports = {};
			this.changeStatus(Module.STATUS.INIT);
		},
		// 创建Script并添加
		fetch: function() {
			let scriptNode = tools.createNode(this.src);
			if (scriptNode) {
				document.body.appendChild(scriptNode);
				this.changeStatus(Module.STATUS.FETCHING);
			} else {
				this.changeStatus(Module.STATUS.ERROR);
			}
		},
		checkCycle: function() {
			let cycleDep = [];
        	for (let depModuleName of (this.deps || [])) {
            	if (maps[this.name] && maps[this.name].indexOf(modules[depModuleName]) !== -1) {
                	cycleDep.push(depModuleName);
            	}
        	}
        	return cycleDep.length ? cycleDep : undefined;
    	},
    	// 处理依赖
		handleDeps: function() {
        	let depCount = this.deps ? this.deps.length : 0;

        	// require.js中处理循环依赖的处理
        	let requireInDep = (this.deps || []).indexOf('require');
        	if (requireInDep !== -1) {
            	depCount--;
            	this.requireInDep = requireInDep;
            	this.deps.splice(requireInDep, 1);
        	}

        	// 处理循环依赖情况
        	let cycleArray = this.checkCycle();
        	if (cycleArray) {
            	depCount = depCount - cycleArray.length;
        	}
        
        	this.depCount = depCount;
        
        	if (depCount === 0) {
            	this.execute();
            	return;
        	}
       
        	this.deps.forEach((depModuleName) => {
            	if (!modules[depModuleName]) {
                	let module = new Module(depModuleName);
                	modules[module.name] = module;
            	}

            	if (!maps[depModuleName]) {
                	maps[depModuleName] = [];
            	}
            	maps[depModuleName].push(this);
        	});
		},
		// 改变模块状态
		changeStatus: function(status) {
			this.status = status;
			// 模块加载成功
			if (status === 3) {
				let moduleContexts = maps[this.name];
				if (moduleContexts) {
					moduleContexts.forEach((item) => {
						item.depCount--;
						if (!item.depCount) {
							item.execute();
						}
					});
				}
			}
		},
		execute: function() {
        	// 根据依赖数组输出每个模块的exports
        	let arg = (this.deps || []).map((dep) => {
            	return modules[dep].exports;
        	});

        	// 插入require到回调函数的参数列表中
        	if (this.requireInDep !== -1 && this.requireInDep !== undefined) {
            	arg.splice(this.requireInDep, 0, require);
        	}
        
        	// 调用callback会调函数，将模块与参数列表一一对应
        	this.exports = this.callback.apply(this, arg);
        	this.changeStatus(Module.STATUS.EXECTED);
		}
	};

	// 上下文对象构造函数, 没调用一次rquire就会创建上下文对象
	let Context = function(deps, callback, errback) {
		this.cid = ++contextId;
		this.init(deps, callback, errback);
	};

	// 与Module指向同一原型对象
	Context.prototype = Object.create(Module.prototype);

	Context.prototype.init = function(deps, callback, errback) {
		this.deps = deps;
		this.callback = callback;
		this.errback = errback;
		contexts[this.cid] = this;
	};
	
	define = function(name, deps, callback, errback) {
		// 处理参数
		if (tools.isFunction(name)) {
			callback = name;
			name = tools.getCurrentModuleName();
		} else if (Array.isArray(name) && tools.isFunction(deps)) {
			callback = deps;
			deps = name;
			name = tools.getCurrentModuleName();
		}

		let module = modules[name];
		module.name = name;
		module.deps = deps;
		module.callback = callback;
		module.errback = errback;
		module.handleDeps();
	};

	require = function(deps, callback, errback) {
		if (tools.isFunction(deps)) {
			callback = deps;
			errback = callback;
			deps = [];
		}

		let context = new Context(deps, callback, errback);
		context.handleDeps();
	};

	let mainModule = new Module(tools.getMainScript());
	modules[mainModule.name] = mainModule;

	root.define = define;
	root.require = require;
})(window);