/**
 * @description Watchdog为看门狗系统，通过channel协调在不同页面之间的互斥动作
 */
require('core::util[channel]', function(util) {

	var dogs = {};

	var channel = util.channel.createContext('dog', function(type, e) {
		var dog = dogs[e.data];
		if (!dog || !dog.useChannel)
			return;
		dog[type]();
	});

	/**
	 * Watchdog. 0: 剩余时间; 1: 是否被停止; 2: 暂停时间
	 */
	function Watchdog(options) {
		util.probe(options, this);
		dogs[this.id] = this;
		this[0] = this.timeout;
	}

	Watchdog.prototype = {
		/**
		 * @field id
		 * @description 在不同页面之间协调狗狗的id
		 */
		id : 'default',
		/**
		 * @field timeout
		 * @description 超时时间（毫秒），若在此之前未接收到重置信号，则执行onTimeout
		 */
		timeout : 15000,
		pauseTime : 5000,
		/**
		 * @field useChannel
		 * @description 指定是否通过channel进行全局调控
		 */
		useChannel : true,
		onTimeout : function() {
		},
		/**
		 * @function destroy
		 * @description
		 */
		destroy : function() {
			dogs[this.id] = null;
			delete dogs[this.id];
		},
		reset : function() {
			this[0] = this.timeout;
			this[1] = false;
			this[2] = 0;
			return this;
		},
		pause : function() {
			this[2] = this.pauseTime;
			return this;
		},
		stop : function() {
			this[1] = true;
			return this;
		},
		resume : function() {
			this[0] = false;
			this[2] = 0;
			return this;
		},
		/**
		 * @function resetAll
		 * @description 向所有的相同id的狗狗发送重置信号
		 */
		resetAll : function() {
			this.reset();
			this.useChannel && channel.broadcast('reset', this.id);
			return this;
		},
		stopAll : function() {
			this.stop();
			this.useChannel && channel.broadcast('stop', this.id);
			return this;
		},
		/**
		 * @function pauseAll
		 * @description 向所有相同id的狗狗发送暂停信号，收到暂停信号的狗狗将暂停计数，等待5秒。如果5秒后没有调用reset，则狗狗会继续计数
		 */
		pauseAll : function() {
			this.pause();
			this.useChannel && channel.broadcast('pause', this.id);
			return this;
		},
		resumeAll : function() {
			this.resume();
			this.useChannel && channel.broadcast('resume', this.id);
			return this;
		},
		isTimeout : function() {
			return this.timeout <= 0;
		}
	};

	var prev = new Date().getTime();
	setInterval(function() {
		var now = new Date().getTime(), diff = now - prev;
		prev = now;
		for ( var k in dogs) {
			var dog = dogs[k];
			if (dog[0] <= 0 || dog[1])// paused or already timeout
				continue;

			if (dog[2] > diff) {// paused
				// dog[0]-=0;
				dog[2] -= diff;
				continue;
			} else if (dog[2] > 0) {
				dog[0] -= diff - dog[2];
				dog[2] = 0;
			} else {// dog[2]<=0
				dog[0] -= diff;
			}
			if (dog[0] <= 0)
				dog.onTimeout();
		}
	}, 249);

	define('core::Watchdog', Watchdog);
});