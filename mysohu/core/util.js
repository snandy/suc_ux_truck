(function() {
	if (!String.prototype.trim) {
		var regBlank = /^\s+|\s+$/;
		String.prototype.trim = function() {
			return this.replace(regBlank, '');
		};
	}
	var $D = document, div_ = $D.createElement("span");
	var util = {
		uuid : function(len) {
			if (!len || len < 1) {
				len = 8;
			}
			var ret = '';
			while (ret.length < len) {
				ret += (Math.random() * 2147483647 << 0).toString(36);
			}
			return ret.substr(0, len);
		},
		seed : {
			valueOf : function() {
				return '_' + util.uuid(8);
			}
		},
		/**
		 * 将对象的key附加到目标对象上，但是不覆盖已有的key
		 * 
		 * @returns {Object}
		 */
		probe : function() {
			var L = arguments.length;
			var dst = L > 1 && arguments[L - 1] || {};
			L > 1 && L--;
			for ( var i = 0; i < L; i++) {
				var src = arguments[i];
				if (typeof src != "object")
					continue;
				for ( var k in src) {
					if (src.hasOwnProperty(k) && !dst.hasOwnProperty(k))
						dst[k] = src[k];
				}
			}
			return dst;
		},
		each : function(arr, args) {
			if (!arr)
				return;
			for ( var i = 0, L = arr.length; i < L; i++) {
				typeof arr[i] === "function" && arr[i].apply(this, args);
			}
		},
		toArray : function(obj) {
			try {
				return Array.prototype.slice.call(obj, 0);
			} catch (e) {
				for ( var n = 0, L = obj.length, ret = new Array(L); n < L; n++)
					ret[n] = obj[n];
				return ret;
			}
		},
		toQueryString : function(obj) {
			if (!obj)
				return obj;
			var arr = [];
			for ( var k in obj) {
				arr.push(k + "=" + encodeURIComponent(obj[k]));
			}
			return arr.join('&');
		},
		refreshCount : function(elem, count) {
			if (!elem)
				return;
			if (count !== undefined)
				count = "(" + +count + ")";
			elem.innerHTML = elem.innerHTML.replace(/(?:\((\d+|\??)\))?$/, function(quote, num) {
				return count === "(0)" ? "" : count || (quote ? "(" + (parseInt(num) + 1) + ")" : "(1)");
			});
		},
		parseHTML : function(str) {
			var div = $D.createElement("DIV");
			div.innerHTML = str;
			for ( var n = 0, L = div.children.length, arr = new Array(L); n < L; n++) {
				arr[n] = div.children[n];
			}
			return arr;
		},
		toFragment : function(html) {
			div_.innerHTML = html;
			for ( var n = 0, arr = div_.children, L = arr.length, ret = $D.createDocumentFragment(); n < L; n++) {
				ret.appendChild(arr[0]);
			}
			return ret;
		},
		getParentByClassName : function(elem, name, limit) {
			limit || (limit = 12);
			while (limit && elem && !util.hasClassName(elem, name)) {
				elem = elem.parentNode;
				limit--;
			}
			return limit && elem;
		},
		wndTop : function() {
			return util.ie ? document.documentElement.scrollTop : window.scrollY;
		},
		hasClassName : function(elem, name) {
			return elem.nodeType == 1 && (' ' + elem.className + ' ').indexOf(' ' + name + ' ') != -1;
		},
		addClassName : function(elem, name) {
			util.hasClassName(elem, name) || (elem.className += " " + name);
		},
		removeClassName : function(elem, name) {
			elem.className = (" " + elem.className + " ").split(" " + name + " ").join("").trim();
		},
		toggleClassName : function(elem, name) {
			elem.className = util.hasClassName(elem, name) ? (" " + elem.className + " ").split(" " + name + " ").join("")
			.trim() : elem.className + " " + name;
		},
		setClassName : function(elem, name, bool) {
			elem.className = bool ? (" " + elem.className + " ").split(" " + name + " ").join("").trim() : util
			.hasClassName(elem, name) || elem.className + " " + name;
		},
		getSibling : function(elem, name) {
			if (!ie)
				return elem[name + "ElementSibling"];
			name = name + "Sibling";
			while (elem = elem[name]) {
				if (elem.nodeType === 1)
					return elem;
			}
			return null;
		},
		/**
		 * @function range
		 * @description 获得一个取值范围，使得其最小值不小于min，最大值不大于max，范围尽量大且不超过length，包含current且current尽量在中间范围
		 * @param min
		 * @param max
		 * @param current
		 * @param length
		 * @return 一个数组，范围的左值（包含）和右值（包含）
		 */
		range : function(min, max, current, length) {
			length--;
			var left = length >> 1, right = length - left;
			return length > max - min ? [ min, max ] : current < min + left ? [ min, min + length ] : current > max - right ? [
					max - length,
					max ] : [ current - left, current + right ];
		}
	};
	var ie = /MSIE ([6-9])/.exec(navigator.userAgent);
	util.ie = ie ? parseInt(ie[1]) : false;
	util.winId = util.uuid();
	define('core::util', util);
})();
