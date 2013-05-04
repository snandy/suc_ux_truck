// IE6下css背景图不缓存bug
try {
	document.execCommand("BackgroundImageCache", false, true);
} catch(e){}

String.prototype.trim || (String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
});
Function.prototype.bind || (Function.prototype.bind = function(obj) {
	var callee = this;
	return function() {
		return callee.apply(obj, arguments);
	};
});
window.JSON || loadResource('/mysohu/lang/JSON.js');
// extra: fix browser features
window.console || (window.console = {
	log : function() {
	},
	n : (document.documentElement.onkeydown = function(event) {
		(event || window.event)['keyCode'] == 123 && (console.n == 5 ? loadResource('/mysohu/lang/console.js') : console.n++);
	}) && 0
});
void function(window, undefined) {
	var ms = {
		build : "1.6.0",
		iphone : /\b(?:iPad|iPhone)\b/i.test(navigator.userAgent),
		appId : window.$space_config && $space_config._currentApp,
		setLocation : function(url, newWnd) {
			if (newWnd) {
				window.open(url);
			} else {
				window.load = window.loadResource = window.domReady = null;
				top.location.href = url;
			}
		},
		userFace : 'http://photo.pic.sohu.com/images/oldblog/person/11111.gif'
	};
	if (window.localStorage && localStorage.getItem('build') != ms.build) {
		localStorage.clear();
		localStorage.setItem('build', ms.build);
	}
	window.mysohu = window.MYSOHU = window.MS = ms;
	var head = document.head || document.getElementsByTagName("HEAD")[0];
	window.loadScript = function(src, callback, cng, varname) {
		var js = addJs(src);
		js.onload = js.onreadystatechange = (callback || cng) && function() {
			var state = js.readyState;
			if (state === undefined || state === 'loaded' || state === 'complete') {
				js.onload = js.onreadystatechange = null;
				cng && js.parentNode && js.parentNode.removeChild(js);
				callback && callback(varname && getV(varname));
				if (varname) {
					try {
						delete window[varname];
					} catch (e) {
						window[varname] = null;
					}
				}
			}
		};
		return js;
	};
	var aliased = {// 指定模块的真实输出模块
		'plugins::hijacker::ori_forward' : 'plugins::hijacker::forward',
		'plugins::hijacker::Forward' : 'plugins::hijacker::forward',
		'plugins::hijacker::video_expand' : 'plugins::hijacker::preview_expand',
		'plugins::hijacker::mblog.delete' : 'plugins::hijacker::feed.delete',
		'plugins::hijacker::page' : 'core::ui::Page',
		'plugins::hijacker::emote' : 'app::emote',
		'plugins::hijacker::comment.show' : 'app::discuss'
	};
	var vars = {// 指定模块由loadVar实现
		'core::util::jQuery' : [ '/mysohu/plugins/jquery-lastest.js', 'jQuery' ],
		'core::util::passport' : [ '/mysohu/base/passport.js', 'PassportSC' ],
		'core::ui::dialog' : [ '/mysohu/plugins/dialog/jquery.dialog.js', 'jQuery.dialog' ],
		'core::ui::ppDialog' : [ '/mysohu/plugins/ppdialog/jquery.ppdialog.js', 'jQuery.ppDialog' ],
		'core::ui::dialog::notice' : [ '/mysohu/plugins/dialog/jquery.dialog.js', 'jQuery.notice' ],
		'core::ui::dialog::confirm' : [ '/mysohu/plugins/dialog/jquery.dialog.js', 'jQuery.confirm' ],
		'core::ui::dialog::inform' : [ '/mysohu/plugins/dialog/jquery.dialog.js', 'jQuery.inform' ],
		'core::ui::dialog::success' : [ '/mysohu/plugins/dialog/jquery.dialog.js', 'jQuery.notice.success' ],
		'core::ui::dialog::error' : [ '/mysohu/plugins/dialog/jquery.dialog.js', 'jQuery.notice.error' ],
		'core::util::base64' : [ '/mysohu/base/base64.js', 'Base64' ],
		'plugins::swfobject' : [ '/mysohu/plugins/swfobject/swfobject.js', 'swfobject' ],
		'plugins::swfupload' : [ '/mysohu/plugins/swfupload/swfupload.js', 'SWFUpload' ]
	};
	function loadVar(name) {
		if (!vars[name])
			return undefined;
		var k = vars[name][1], v = getV(k);
		if (v)
			define(name, v);
		else
			loadResource(vars[name][0] || getPath(name)).ready(function() {
				v = getV(k);
				if (v)
					define(name, v);
			});
	}
	function getV(name) {
		var names = name.split('.'), curr = window;
		for ( var n = 0, L = names.length; n < L; n++) {
			curr = curr[names[n]];
			if (!curr)
				break;
		}
		return curr;
	}
	var required = {};
	// required mods
	var domReqs = {};
	// dom ready reqs
	/**
	 * 加载模块并指定回调函数。
	 */
	window.require = function() {
		var mods, callback;
		if (arguments.length === 0) {
			mods = [ '#document' ];
			callback = null;
		} else {
			callback = arguments[arguments.length - 1];
			if (typeof callback === "function") {
				mods = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
			} else {
				callback = null;
				mods = Array.prototype.slice.call(arguments, 0);
			}
		}
		return new ReqHandle(mods, callback);
	};
	function addJs(url) {
		var js = document.createElement("SCRIPT");
		js.type = 'text/javascript';
		js.charset = 'utf-8';
		js.src = url;
		head.appendChild(js);
		return js;
	}
	window.define = function(name, value) {
		var req = required[name] || (required[name] = {
			name : name,
			notReady : 0,
			plug : Required.prototype.plug
		});
		if (req.value) {
			throw name + " already defined";
		}
		req.value = value;
		if (req.isPlugin) {
			required[name.substr(0, name.lastIndexOf(':') - 1)].plug(name.substr(name.lastIndexOf(':') + 1), value);
		}
		if (req.plugins) {
			for ( var k in req.plugins)
				value[k] = req.plugins[k];
			req.plugins = null;
		}
		req.fireReady && req.fireReady();
	};
	// required
	function Required(name) {
		if (required[name])
			return required[name];
		required[name] = this;
		this.name = name;
		if (/^#/.test(name)) {
			var id = name.substr(1), dom = id == "document" ? domReady_ ? null : document : document.getElementById(id);
			if (dom) {
				this.notReady = 0;
				this.value = dom;
			} else {
				this.notReady = Required.nextId++;
				this.requires = [];
				domReqs[id] = this;
			}
			return;
		}
		if (vars[name]) {
			var v = getV(vars[name][1]);
			if (v) {
				this.notReady = 0;
				this.value = v;
				return;
			}
		}
		this.notReady = Required.nextId++;
		this.requires = [];
		document.getElementById("footer") && this.loadjs();
	}
	Required.prototype.fireReady = function() {
		this.fireReady = null;
		for ( var n = 0, L = this.requires.length; n < L; n++) {
			var reqn = this.requires[n];
			reqn.notReady -= this.notReady;
			reqn.notReady || reqn.fireReady();
		}
		this.notReady = 0;
		this.requires = null;
	};
	Required.prototype.plug = function(k, v) {
		if (this.isInterface) {
			this.value.inits.push(v);
			var _proto = this.value.prototype;
			for ( var l in v.prototype) {
				_proto[l] = v.prototype[l];
			}
		} else {
			(this.value || this.plugins || (this.plugins = {}))[k] = v;
		}
		return this;
	};
	Required.prototype.getPath = function() {
		return getPath(this.name);
	};
	Required.prototype.loadjs = function() {
		if (vars[this.name]) {
			loadVar(this.name);
		} else {
			loadResource(this.getPath());
		}
	};
	Required.nextId = 1;
	/**
	 * 根据模块名返回文件路径
	 * 
	 * @param name
	 *            以::作为命名空间分割的模块名称
	 */
	function getPath(name) {
		var paths = (aliased[name] || name).split('::');
		var last = paths[paths.length - 1], idx = last.lastIndexOf('.');
		if (idx != -1) {
			paths[paths.length - 1] = last = last.substr(0, idx);
		}
		if (paths[0] == 'app' && paths.length == 2) {
			paths.push(last);
		} else if (/^(?:core|plugins|libs)$/.test(paths[0]))
			paths.unshift('mysohu');
		return '/' + paths.join('/') + '.js';
	}
	// require返回的对象
	function ReqHandle(mods, callback) {
		this.notReady = 0;
		this.callbacks = [];
		this.mods = [];
		for ( var n = 0, L = mods.length; n < L; n++) {
			var modn = mods[n];
			if (/\[.*\]$/.test(modn)) {// plugins required
				var plugins = modn.substring(modn.indexOf('[') + 1, modn.length - 1);
				modn = modn.substr(0, modn.length - plugins.length - 2);
				var rdy = required[modn] || new Required(modn);
				this.notReady += rdy.notReady;
				rdy.notReady && rdy.requires.push(this);
				plugins = plugins.split(/[,;\|]/g);
				for ( var m = 0, L2 = plugins.length; m < L2; m++) {
					var plugn = modn + "::" + plugins[m];
					var rdyn = required[plugn] || new Required(plugn);
					if (rdyn.notReady) {
						rdyn.isPlugin = true;
						this.notReady += rdyn.notReady;
						rdyn.requires.push(this);
					} else {
						rdy.plug(plugins[m], rdyn.value);
					}
				}
			} else {
				var rdy = required[modn] || new Required(modn);
				this.notReady += rdy.notReady;
				rdy.notReady && rdy.requires.push(this);
			}
			this.mods.push(modn);
		}
		callback && this.callbacks.push(callback);
		this.notReady || this.fireReady();
	}
	ReqHandle.prototype.ready = function(fun) {
		if (fun) {
			if (this.args)
				fun.apply(this, this.args);
			else
				this.callbacks.push(fun);
		}
		return this;
	};
	ReqHandle.prototype.fireReady = function() {
		var self = this, callbacks = this.callbacks, args = this.args = [];
		for ( var n = 0, L = this.mods.length; n < L; n++) {
			args.push(required[this.mods[n]].value);
		}
		this.callbacks = null;
		~function sched() {
			var callback;
			while (callback = callbacks.shift()) {
				try {
					callback.apply(self, args);
					callback = null;
				} finally {
					callback && setTimeout(sched, 0);
				}
			}
		}();
	};
	mysohu.debug = function(em) {
		if (em && required[em]) {
			return required[em];
		}
		for ( var k in required) {
			console.log(k, required[k].notReady || required[k].value);
		}
	};
	var domReady_ = domReady;
	domReady = function(name) {
		if (typeof name != "string")
			name = "";
		else if (name.charAt(0) == '#')
			name = name.substr(1);
		if (!name || name === 'document') { // document.ready
			if (!domReady_)
				return;
			domReady_();
			domReady_ = null;
			for ( var k in domReqs) {
				var req = domReqs[k];
				if (!req)
					continue;
				req.value = k === 'document' ? document : document.getElementById(k);
				req.fireReady();
			}
			domReqs = {};
			// load not defined mods
			var toLoad = [];
			for ( var k in required) {
				if (/^#/.test(k) || !required[k].notReady)
					continue;
				if (vars[k]) {
					loadVar(k);
					continue;
				}
				required[k].notReady && toLoad.push(required[k].getPath());
			}
			toLoad.length && loadResource.apply(null, toLoad);
		} else {
			var req = domReqs[name];
			if (!req)
				return;
			domReqs[name] = false;
			req.value = document.getElementById(name);
			req.fireReady();
		}
	};
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", domReady, false);
		window.addEventListener('load', domReady, false);
	} else if (document.documentElement.doScroll) {
		if (window.attachEvent)
			window.attachEvent("onload", domReady);
		(function() {
			try {
				document.documentElement.doScroll("left");
			} catch (e) {
				setTimeout(arguments.callee, 4);
				return;
			}
			domReady();
		})();
	}
}(window);


/*
 * mysohu命名空间
 */

// 点击统计
mysohu.put_log = function(msg) {
	// console.log(msg + ' clicked');
	var img = new Image();
	img.src = 'http://cc.i.sohu.com/pv.gif?' + msg + '&ts=' + +new Date;
};

// 判断是否登录
mysohu.is_login = function(){
	if(!!$.cookie("ppinf")){
		return true;
	}
	return false;
};

// 判断当前登录用户访问的是否为自己的页面
mysohu.is_mine = function(){
	if(mysohu.is_login()) {
		var myxpt = Base64.encode(PassportSC.cookieHandle()),
			pagexpt = (window.$space_config && $space_config._xpt)? $space_config._xpt : '';
		if(myxpt == pagexpt){
			return true;
		}
	}
	return false;
};