require('core::util', function(util) {
	function Ready() {
		var L = arguments.length;
		var callback = arguments[L - 1];
		if (typeof callback != "function") {
			this.callbacks = [];
		} else {
			this.callbacks = [ callback ];
			L--;
		}
		var mods = {}, names = Array.prototype.slice.call(arguments, 0, L);
		for ( var i = 0; i < L; i++) {
			mods[names[i]] = i;
		}
		this.notReady = L;
		this.names = names;
		this.mods = mods;
		this.values = new Array(L);
	}
	Ready.prototype.add = function(callback) {
		this.callbacks.push(callback);
	};
	Ready.prototype.ready = function(name, value) {
		if (typeof name === "object") {
			for ( var k in name) {
				this.put(k, name[k]);
			}
		} else {
			this.put(typeof name === "number" ? this.names[name] : name, value);
		}
		if (!this.notReady)
			util.each(this.callbacks, this.values);
		return this;
	};
	Ready.prototype.put = function(name, value) {
		var number = this.mods[name];
		if (name && typeof number === "number") {
			this.mods[name] = false;
			this.values[number] = value;
			this.notReady--;
		}
	};
	define('core::util::Ready', Ready);
});