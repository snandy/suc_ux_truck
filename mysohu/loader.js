/**
 * @filedescription 静态资源加载器，通过svn版本号控制文件版本
 * @author yongzhongzhang@sohu-inc.com kyriosli@sohu-inc.com
 */
~function(window, document, undefined) {
	"use strict";
	var head = document.head || document.getElementsByTagName("HEAD")[0];

	/**
	 * @class Revision
	 * @description 版本号相关内容的封装
	 * @constructor
	 * @param combo
	 *            需要combo时，该仓库对应的combo域
	 */
	function Revision(url, combo) {
		this.url = url;
		this.combo = combo;
		this.loaded = {};
	}
	Revision.prototype = {

		/**
		 * @field HEAD
		 * @type integer
		 * @description svn版本中最高版本号
		 */
		HEAD: -1,

		/**
		 * @field url
		 * @type string
		 * @description 加载单一文件时对应的仓库
		 */
		url: "",

		/**
		 * @field comboURL
		 * @type string
		 * @description combo时对应的仓库
		 */
		combo: "",

		/**
		 * @function init
		 * @description 初始化版本号信息
		 * @param files
		 *            用分号隔开的单行字符串,代表所有文件及其版本号
		 */
		init: function(files){
			var HEAD = -1;
			if(typeof files === "number" || /^\d+$/.test(files)){
				// revision is number
				HEAD = parseInt(files);
			}
			else {
				files = files.split(';');
				files[files.length - 1] || (files.length = files.length - 1);// 忽略字符串最后是;的问题
				for ( var n = 0, L = files.length; n < L; n++) {
					var fn = files[n], ver = fn.substr(fn.lastIndexOf(':') + 1);
					fn = '/' + fn.substr(0, fn.length - ver.length - 1);
					ver = parseInt(ver);
					ver > HEAD && (HEAD = ver);
					this[fn] = ver;
				}
			}
			this.HEAD = HEAD;
		},

		getURL: function(type, files){
			if(arguments.length == 1){
				files = type;
				type = files[0].substr(files[0].lastIndexOf('.') + 1);
			}
			if(files.length === 0) return;
			if(files.length === 1){
				var src = files[0];
				if(this.HEAD != -1){
					var i = src.lastIndexOf('.');
					src = src.substr(0, i) + ".v" + (this[src] || this.HEAD) + src.substr(i);
				}
				return this.url + src;
			}
			else{
				var url = this.combo;
				if(this.HEAD != -1){
					var head = 0;
					for( var n = 0, L = files.length; n < L; n++){
						var rn = this[files[n]] || this.HEAD;
						if(head < rn) head = rn;
					}
					url += "v." + head + "&";
				}
				return url + (type == 'js' ? "t=js" : "c=gbk&t=css") + "&r=" + files.join("|");
			}
		}

	};
	var repos = {
		r1: new Revision("http://r1.suc.itc.cn", "http://r.suc.itc.cn/combo.action?"),
		s2: new Revision("http://s2.suc.itc.cn", "http://s.suc.itc.cn/combo.action?"),
		s3: new Revision("http://s3.suc.itc.cn", "http://s.suc.itc.cn/combo.action?p=mysohu&"),
		other: new Revision("", "")
	};
	var defaults = {
		from: "loadResource",
		repo: "s3"// 资源库
	};

	/**
	 * @description 获取一个js的载入上下文
	 */
	var getLoadContext = (function(){
		var loaded = {};
		return function(src, dom){
			if(!dom) return loaded[src[0]];
			var obj = {
				dom: dom,
				ready: mmReady
			};
			for( var i = 0, L = src.length; i < L; i++){
				loaded[src[i]] = obj;
			}
			return obj;
		};
		function mmReady(callback, obj){
			if(this.isReady){
				callback.apply(obj);
			}
			else{
				var args = Array.prototype.slice.call(arguments);
				if(!this.callbacks){
					this.callbacks = [ args ];
					this.dom.onload = this.dom.onreadystatechange = mmLoad;
					this.dom.loadContext = this;
				}
				else {
					this.callbacks.push(args);
				}
			}
			return this;
		}
		function mmLoad(){
			var state = this.readyState;
			if(state === undefined || state === 'loaded' || state === 'complete'){
				var self = this.loadContext, callbacks = self.callbacks;
				self.dom = this.loadContext = this.onload = this.onreadystatechange = self.callbacks = null;
				self.isReady = true;
				for( var n = 0; n < callbacks.length; n++){
					try{
						var args = callbacks[n];
						args[0].apply(args[1], args.slice(2));
					}
					catch(e){
					}
				}
			}
		}
	})();

	/**
	 * @function loadResource
	 * @description 加载资源的入口
	 * @param option
	 * {object} {optional} 选项，覆盖defaults里面的默认值
	 * 
	 */
	window.loadResource = function(option){
		var isOpt = typeof option === "object";
		var options = probe(defaults, isOpt && option);
		var toLoad_js = [], toLoad_css = [], rev = 0, repo = repos[options.repo];
		var files = Array.prototype.slice.call(arguments, isOpt ? 1 : 0).join(',').split(',');
		for( var n = 0, L = files.length; n < L; n++){
			var fn = files[n];
			if(!fn || repo.loaded[fn]) continue;
			(options.type == "text/javascript" || fn.substr(fn.lastIndexOf('.') + 1) == 'js' ? toLoad_js : toLoad_css).push(fn);
			repo.loaded[fn] = true;
			rev < repo[fn] && (rev = repo[fn]);
		}
		var domLoaded = Boolean(document.body && document.getElementById("footer"));
		if(toLoad_js.length){
			var joption = probe({
				type: "text/javascript",
				charset: "utf-8",
				src: repo.getURL('js', toLoad_js)
			}, probe(options));
			if (domLoaded || joption.later) {
				var js = document.createElement("SCRIPT");
				for( var k in joption){
					js.setAttribute(k, joption[k]);
				}
				domLoaded? head.appendChild(js): load_later.push(js);
			}
			else{
				var arr = [];
				for( var k in joption){
					arr.push(k, '="', joption[k], '" ');
				}
				document.write('<script ' + arr.join('') + '></script>');
			}
		}
		if(toLoad_css.length){
			var coption = probe({
				type: "text/css",
				rel: "stylesheet",
				href: repo.getURL('css', toLoad_css)
			}, probe(options));
			if( domLoaded || coption.later ){
				var css = document.createElement("LINK");
				for( var k in coption ){
					css.setAttribute(k, coption[k]);
				}
				domLoaded? head.appendChild(css): load_later.push(css);
			}
			else{
				var arr = [];
				for( var k in coption ){
					arr.push(k, '="', coption[k], '" ');
				}
				document.write('<link ' + arr.join('') + '/>');
			}
		}
		return getLoadContext(files, js);
	};
	window.load = function(ns){
		loadResource.apply(this, repos.macros && repos.macros[ns] || arguments);
	};
	window.load.repos = repos;
	var load_later = [];
	function probe(a, b) {
		b || (b = {});
		for( var k in a ){
			if(!(k in b)) b[k] = a[k];
		}
		return b;
	}
	window.domReady = function(){
		setTimeout(function(){
			for( var i = 0, L = load_later.length; i < L; i++ ){
				head.appendChild(load_later[i]);
			}
			load_later = null;
		}, 0);
	};
}(window, document);