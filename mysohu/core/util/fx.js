require('core::util', function(util) {
	function fx(options) {
		if (options.mutex) {
			if (options.mutex.locked)
				return;
			options.mutex.locked = true;
		}
		util.probe(defaults, options);
		options.interval || (options.interval = intervals[options.speed]);

		var Y = (methods[options.type] || methods.linear)(options.steps), n = 0;
		options.delay ? options.pid = setTimeout(sched, options.delay) : sched();
		return options;

		function sched() {
			var now = new Date().getTime();
			if (n === 0) {
				options.now = now;
				options.init && options.init.call(options.self);
				n = 1;
			} else {
				if (options.fixFrame) {
					n++;
				} else {
					n = Math.min(options.steps, ((now - options.now) / options.interval + 1) << 0);
				}
			}
			if (typeof options.src === 'number') {
				var y = options.src + Y[n] * (options.dst - options.src);
				options.round && (y <<= 0);
			} else {
				var y = {};
				for ( var k in options.src) {
					y[k] = options.src[k] + Y[n] * (options.dst[k] - options.src[k]);
					options.round && (y[k] <<= 0);
				}
			}
			try {
				options.callback.call(options.self, y);
			} catch (e) {
				console.log('Error calling fx callback');
			}
			if (n == options.steps) {
				options.mutex && (options.mutex.locked = false);
				options.complete && options.complete.call(options.self);
			} else {
				options.pid = setTimeout(arguments.callee, Math.max(options.now + n * options.interval - now, 0));
			}
		}
	}
	var defaults = {
		speed : "normal",
		src : 0,
		dst : 10,
		steps : 10,
		type : "linear",
		fixFrame : true
	};

	var methods = {
		"linear" : function(steps) {// 线性
			var arr = new Array(steps + 1);
			for ( var n = 0; n <= steps; n++) {
				arr[n] = n / steps;
			}
			return arr;
		},
		"exp" : function(steps) {// 指数
			var arr = methods.linear(steps);
			for ( var n = 1; n < steps; n++) {
				arr[n] = (Math.exp(arr[n]) - 1) / (Math.E - 1);
			}
			return arr;
		},
		"log" : function(steps) {// 对数
			var arr = methods.linear(steps);
			var log100 = Math.log(100);
			for ( var n = 1; n < steps; n++) {
				arr[n] = Math.log(9.9 * arr[n] + 0.1) / log100 + 0.5;
			}
			return arr;
		},
		"p2" : function(steps) {// 平方
			var arr = methods.linear(steps);
			for ( var n = 1; n < steps; n++) {
				arr[n] *= arr[n];
			}
			return arr;
		}
	};
	var intervals = {
		"normal" : 50,
		"slow" : 200,
		"slowest" : 1000,
		"fast" : 10,
		"fastest" : 1
	};

	fx.highlight = function(self, callback, counter) {
		fx({
			steps : 20,
			round : true,
			self : self,
			callback : function(n) {
				var color;
				if (counter)
					color = counter(n);
				else {
					n = n > 5 ? 55 + n * 20 : 255 - n * 20;
					color = 'rgb(255,' + n + ',' + n + ')';
				}
				this.css('backgroundColor', color);
			},
			complete : callback
		});
	};

	define('core::util::fx', fx);
});