require('core::util', function(util) {
	var defaultUserInfo = {
		unick : '未登录',
		photo : 'http://img3.pp.sohu.com/ppp/blog/images/common/nobody.gif'
	};
	var escape_La, escape_arr, escape_init;
	var cookie = {
		getCookie : function(key) {
			var cookie = "; " + document.cookie + "; ";
			var start = cookie.indexOf("; " + key + "=");
			if (start === -1)
				return null;
			start += key.length + 3;
			return cookie.substring(start, cookie.indexOf("; ", start));
		},
		init : function() {
			var inf = this.getCookie('ppinf');
			if (inf) {
				this.isLogin = true;
				inf = this.getCookie('sucaccount');
				if (inf) {
					inf = inf.split('|');
					this.xpt = inf[0];
					this.unick = inf[1].replace(/%u([0-9a-fA-F]{4})/g, function(match, value) {
						return String.fromCharCode(parseInt(value, 16));
					});
					this.photo = inf[2];
					(!this.photo || this.photo === 'null') && (this.photo = defaultUserInfo.photo);
					this.uid = inf[3];
					this.upt = inf[4];
					this.ulink = 'http://i.sohu.com/p/' + this.upt;
					var upt = this.upt;
					escape_La = upt.length;
					escape_arr = new Array(escape_La);
					for ( var n = 0; n < escape_La; n++) {
						escape_arr[n] = upt.charCodeAt(n);
					}
					escape_init = escape_arr[upt.charCodeAt(upt.length - 1) % escape_La];
					this.isMine = typeof $space_config != "undefined" && this.xpt === $space_config._xpt;
					this.skey = key();
				}
			} else {
				this.isLogin = false;
				this.unick = defaultUserInfo.unick;
				this.photo = defaultUserInfo.photo;
				this.xpt = this.ulink = this.upt = this.uid = null;
			}
			this.onInit && this.onInit();
		},
		reload : function(callback) {
			loadScript('http://i.sohu.com/api/accountinfo.do', function() {
				cookie.init();
				callback();
			}, true);
		},
		escape : function escape(s, enc) {
			if (typeof s != "string")
				return s;
			for ( var n = 0, Ls = s.length, ret = new Array(Ls), last = escape_init; n < Ls; n++) {
				var x = s.charCodeAt(n), y = escape_arr[n % escape_La] + escape_arr[last % escape_La];
				y = enc ? x + y : x - y;
				last = enc ? y : x;
				ret[n] = String.fromCharCode(y);
			}
			return ret.join('');
		}
	};
	require("core::Watchdog", function(Watchdog) {
		var dog = new Watchdog({
			id : "cookie",
			timeout : 8000,
			onTimeout : function() {
				cookie.init();
			}
		});
	});

	function key() {
		var ukey = cookie.escape(cookie.upt, true);
		for ( var n = 4, tmp = [ 'user_' ]; n < 10; n++) {
			tmp.push(ukey.charCodeAt(n).toString(36));
		}
		return tmp.join('');
	}

	cookie.init();
	define('core::util::cookie', cookie);
});