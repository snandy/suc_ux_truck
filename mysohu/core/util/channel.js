/**
 * 频道系统。 通过注册频道、监听频道，达到快速统一的在页面组件间传递信息。 通过listen来注册监听函数，一般地，监听函数生存于整个生命周期，不会被移除。
 */
require('core::util[cookie]', function(util) {
	var xpt = window.$space_config && $space_config._xpt;
	var handle = {
		adapter : window.localStorage,
		/**
		 * function broadcast 广播一个事件，触发所有的监听函数
		 * 
		 * @param channel
		 *            频道
		 * @param type
		 *            事件类型
		 * @param obj
		 *            事件附加参数，接受任何数据类型，但最好是扁平化的数据
		 * @param xpt
		 *            事件被触发的页面xpt，只有与当前页面xpt匹配的事件才会被触发
		 */
		broadcast : function(ch, type, obj, xpt) {
			this.dispatch(false, ch, {
				type : type,
				winId : util.winId,
				data : obj
			});
			if (!util.cookie.xpt) // not login
				return;
			var str = stringify(type, obj, xpt);
			if (str.length + ch.length < 4000)
				this.adapter && this.adapter.setItem("ch__" + ch, str);
		},
		listen : function(ch, type, fun) {
			switch (true) {
			case !listened[ch]:
				listened[ch] = {};
			case !listened[ch][type]:
				listened[ch][type] = [];
			default:
				listened[ch][type].push(fun);
			}
		},
		listenOther : function(ch, type, fun) {
			if (!window.localStorage)
				return;
			switch (true) {
			case !listened_other[ch]:
				listened_other[ch] = {};
			case !listened_other[ch][type]:
				listened_other[ch][type] = [];
			default:
				listened_other[ch][type].push(fun);
			}
			if (!listening) {
				listening = true;
				if (window.addEventListener) {
					window.addEventListener("storage", onStorage, false);
				} else if (document.attachEvent && handle.adapter) { // IE
					checked = {};
					for ( var k in localStorage) {
						if (/^ch__/.test(k))
							checked[k] = localStorage[k];
					}
					document.attachEvent("onstorage", function() {
						setTimeout(check, 1);
					});
				} else {// communicate using assistant
				}
			}
		},
		listenAll : function(ch, type, fun) {
			this.listen(ch, type, fun);
			this.listenOther(ch, type, fun);
		},
		dispatch : function(isOther, ch, evt) {// 在本地监听函数中分发事件
			isOther && contexts[ch] && contexts[ch].onMsg(evt.type, evt);
			var channels = isOther ? listened_other : listened;
			var funs = channels[ch] && channels[ch][evt.type];
			if (!funs)
				return;
			for ( var n = 0, L = funs.length; n < L; n++) {
				funs[n](evt);
			}
		},
		createContext : function(ch, onMsg) {
			return contexts[ch] = {
				onMsg : onMsg,
				broadcast : function(type, obj, xpt) {
					handle.broadcast(ch, type, obj, xpt);
				}
			};
		},
		trigger : function(ch, evt) {
			evt = parse(evt);
			evt.winId !== util.winId && (!evt.xpt || evt.xpt === xpt) && this.dispatch(true, ch, evt);
		}
	};
	var listening = false;
	var listened = {};
	var listened_other = {};
	var contexts = {};
	var checked;
	// 已触发过的数据
	function parse(str) {
		var arr = str.split(':', 5);
		return {
			type : arr[0],
			winId : arr[1],
			xpt : arr[2],
			data : arr[4] && JSON.parse(util.cookie.escape(arr[4], false))
		};
	}
	function stringify(type, data, xpt) {
		return [ type, util.winId, xpt, util.uuid(), util.cookie.escape(JSON.stringify(data), true) ].join(':');
	}
	function check() {// IE
		for ( var k in listened) {
			var key = "ch__" + k;
			var current = localStorage.getItem(key);
			if (!current || checked[key] == current)
				continue;
			checked[key] = current;
			handle.trigger(k, current);
		}
	}
	function onStorage(e) {// addEventListener callback
		if (/^ch__/.test(e.key)) {
			handle.trigger(e.key.substr(4), e.newValue);
		}
	}
	mysohu && (mysohu.broadcast = function(ch, type, obj) {
		handle.broadcast(ch, type, obj);
	});
	define('core::util::channel', handle);
});
