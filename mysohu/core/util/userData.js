require('core::util[cookie]', function(util) {
	var allowed = /^(?:string|number|boolean)$/;

	var UserData = new Function();
	UserData.prototype = window.localStorage && document.domain === "i.sohu.com" ? {
		load : load,
		save : save
	} : {
		load : UserData,
		save : UserData,
		unavailable : true
	};
	var exports = new UserData();

	util.cookie.onInit = function() {
		for ( var k in exports) {
			delete exports[k];
		}
		exports.load();
	};

	exports.load();
	define('core::util::userData', exports);

	function accept(obj) {
		var ret = undefined;
		if (allowed.test(typeof obj))
			ret = obj;
		else if (Object.prototype.toString.apply(obj) === "[object Array]") {
			ret = new Array(obj.length);
			for ( var n = 0, L = ret.length; n < L; n++) {
				ret[n] = accept(obj[n]);
			}
		} else if (Object.prototype.toString.apply(obj) === "[object Object]") {
			ret = {};
			for ( var k in obj) {
				ret[k] = accept(obj[k]);
			}
		}
		return ret;
	}

	function load() {
		if (!util.cookie.upt)
			return;
		var s = localStorage.getItem(util.cookie.skey);
		if (!s)
			return;
		try {
			util.probe(JSON.parse("{" + util.cookie.escape(s, false).substring(4, s.length - 4) + "}"), this);
		} catch (e) {
		}
	}
	function save() {
		var s = JSON.stringify(accept(this));
		var tmp = util.uuid();
		s = util.cookie.escape(tmp.substr(4, 4) + s.substring(1, s.length - 1) + tmp.substr(0, 4), true);
		localStorage.setItem(util.cookie.skey, s);
	}
});