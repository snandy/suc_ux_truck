require('core::util', function(util) {
	var XHR = window.XMLHttpRequest || function() {
		return new ActiveXObject("Microsoft.XMLHTTP");
	};
	/**
	 * class Ajax
	 * 
	 * @param opts.method
	 * @param opts.url
	 * @param opts.data
	 * @param opts.vars
	 * @param opts.headers
	 * @param opts.success
	 * @param opts.error
	 * @param opts.timeout
	 */
	function Ajax(opts) {
		if (!(this instanceof Ajax))
			return new Ajax(opts).send();
		opts = this.options = util.probe(this.options, opts);
		this.callbacks = {
			success : opts.success,
			error : opts.error,
			timeout : opts.timeout
		};
		opts.headers || (opts.headers = {});
	}
	Ajax.prototype = Ajax.fn = {
		options : {
			type : "text",
			retries : 0,
			timeout : 8000,
			retryTimeout : 3000
		},
		open : function(method, url) {
			this.options.method = method;
			this.options.url = url;
			return this;
		},
		get : function(url) {
			return this.open("GET", url);
		},
		post : function(url) {
			return this.open("POST", url);
		},
		header : function(name, value) {
			this.options.headers[name] = value;
			return this;
		},
		vars : function(obj) {
			this.options.vars = obj;
			return this;
		},
		data : function(mixed) {
			this.options.data = mixed;
			return this;
		},
		retries : function(n) {
			if (arguments.length) {
				this.options.retries = n;
				return this;
			} else {
				return this.options.retries;
			}
		},
		success : function(callback) {
			this.callbacks.success = hook(this.callbacks.success, callback);
			return this;
		},
		error : function(callback) {
			this.callbacks.error = hook(this.callbacks.error, callback);
			return this;
		},
		timeout : function(callback) {
			this.callbacks.timeout = hook(this.callbacks.timeout, callback);
			return this;
		},
		retry : function() {
			this.options.retries--;
			// TODO
			this.opened = this.sent = false;
			this.send();
		},
		onreadyStateChange : function() {
			this.pid && (this.pid = clearTimeout(this.pid));
			if (this.handle.readyState == 4) {// DONE
				if (this.handle.status && this.handle.status != 200) {
					return this.onError();
				}
				var opts = this.options, handle = this.handle;
				var data = handle.responseText;
				if (opts.type == "json") {
					try {
						data = JSON.parse(data);
					} catch (e) {
						try {
							data = new Function("return " + data.trim())();
						} catch (e) {
							return this.onError();
						}
					}
				}
				this.callbacks.success && this.callbacks.success.call(this, data);
			}
		},
		onTimeout : function() {
			this.handle.abort();
			if (this.options.retries > 0) {
				setTimeout(this.retry.bind(this), this.options.retryTimeout);
			} else {
				(this.callbacks.onTimeout || this.onError).call(this);
			}
		},
		onError : function() {
			if (this.options.retries > 0) {
				setTimeout(this.retry.bind(this), this.options.retryTimeout);
			} else {
				var cb = this.callbacks.error;
				cb && cb === "onComplete" && (cb = this.callbacks.success);
				cb && cb.call(this);
			}
		},
		send : function() {
			var opts = this.options;
			var handle = this.handle = new XHR();
			var url = opts.url;
			var vars = util.toQueryString(opts.vars);
			url = [ url, url.indexOf('?') === -1 ? '?' : '&', vars, vars ? '&_=aj' : '_=aj', util.uuid() ].join('');
			handle.open(opts.method, url, true);
			if (opts.method == "POST") {
				var data = opts.data;
				if (typeof data === "object") {
					var contentType = opts.headers[CONTENT_TYPE];
					data = contentType === this.ENCFORM ? util.toQueryString(data) : contentType === this.JSON ? JSON.stringify(data) : data.toString();
				}
			}
			if (!("Accept" in opts.headers) && opts.type == "json") {
				opts.headers.Accept = "application/json, text/javascript, */*; q=0.01";
			}
			for ( var k in opts.headers) {
				handle.setRequestHeader(k, opts.headers[k]);
			}
			var forker = this.onreadyStateChange.bind(this);
			handle.addEventListener ? handle.addEventListener("readystatechange", forker) : handle.onreadystatechange = forker;
			handle.send(data);
			this.pid = setTimeout(this.onTimeout.bind(this), opts.timeout);
			return this;
		},
		ILLEAGALSTATE : "Illeagal state",
		ENCFORM : "application/x-www-form-urlencoded",
		JSON : "text/json"
	};
	var CONTENT_TYPE = "Content-Type";
	function hook(before, after) {
		if (typeof before != "function")
			return after;
		return function() {
			try {
				before.apply(this, arguments);
			} finally {
				after.apply(this, arguments);
			}
		};
	}
	Ajax.get = function(url, success, type) {
		return new Ajax({
			method : "GET",
			url : url,
			success : success,
			type : type
		}).send();
	};
	Ajax.getJSON = function(url, success) {
		return Ajax.get(url, success, 'json')
	};
	Ajax.post = function(url, content, callback, onError, type) {
		var options = {
			'method' : 'POST',
			'url' : url,
			'success' : callback,
			'error' : onError,
			'type' : type,
			'data' : content
		};
		if (content && typeof content === "object") {
			options.headers = {};
			options.headers[CONTENT_TYPE] = Ajax.fn.ENCFORM;
		}
		return new Ajax(options).send();
	};
	Ajax.postJSON = function(url, content, callback, onError) {
		return Ajax.post(url, content, callback, onError, 'json');
	};
	Ajax.postForm = function(url, content) {
		var dom = document.createElement('DIV');
		var arr = [], ifname = 'if' + util.uuid();
		arr.push('<iframe name="', ifname, '" style="display:none;" src="about:blank"></iframe>');
		arr.push('<form method="post" action="', url, '" target="', ifname, '">');
		for ( var k in content) {
			arr.push('<input type="hidden" name="', k, '" />');
		}
		arr.push('</form>');
		dom.innerHTML = arr.join('');
		arr = null;
		var form = dom.lastChild;
		for ( var k in content) {
			form[k].value = content[k];
		}
		document.body.appendChild(dom);
		form.submit();
		setTimeout(function() {
			document.body.removeChild(dom);
		}, 6000);
	};
	/**
	 * jsonp方式拉取数据。
	 * 
	 * @param url
	 *            带参数的URL地址，
	 * @param callback
	 *            回调函数，如果jsonp为varname方式，则在js加载完成后执行
	 * @param isVarname
	 *            是否为varname方式
	 * @param paramname
	 *            参数名，对callback方式默认为"callback"，对varname方式默认为"varname"
	 */
	Ajax.jsonp = function(url, callback, isVarname, paramname) {
		var vn = 'j' + util.uuid();
		var called = false;
		var js = loadScript(url + (url.lastIndexOf('?') == -1 ? '?' : '&') + (paramname || (isVarname ? 'varname' : 'callback')) + '=' + vn, isVarname ? callback : function() {
			if (!called) {
				callback();
			}
		}, true, vn);
		if (!isVarname) {
			window[vn] = function() {
				called = true;
				callback.apply(this, arguments);
			};
		}
		return {
			abort : function() {
				if (!isVarname)
					try {
						delete window[vn];
					} catch (e) {
						window[vn] = undefined;
					}
				js.parentNode && js.parentNode.removeChild(js);
			}
		};
	};
	define('core::util::ajax', Ajax);
});
