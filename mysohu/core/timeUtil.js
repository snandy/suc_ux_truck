(function() {
	var tmp = new Date();
	var exports = {
		serverTime : tmp.getTime(),
		timeOffset : 0,
		tzOffset : tmp.getTimezoneOffset() * 60000,
		setServerTime : function(n) {
			if (n) {
				this.timeOffset = new Date().getTime() - n;
				return this.serverTime = n;
			} else {
				return this.serverTime = new Date().getTime() - this.timeOffset;
			}
		},
		get_timeago : function(time, shorten) {
			if (!time)
				return '';
			var now_time = this.serverTime, diff = now_time - time;
			if (diff < 300000)
				return '刚刚';
			if (diff < 3600000)
				return (diff / 60000 << 0) + '分钟前';
			if (((now_time - this.tzOffset) / 86400000 << 0) == ((time - this.tzOffset) / 86400000 << 0)) {// 同一天
				var t = new Date(time), hh = t.getHours(), mm = t.getMinutes();
				return '今日 ' + (hh < 10 ? 0 : '') + hh + ':' + (mm < 10 ? 0 : '') + mm;
			} else {
				var t = new Date(time), YY = t.getFullYear(), MM = t.getMonth() + 1, DD = t.getDate(), hh = t.getHours(), mm = t
				.getMinutes();
				return (YY == new Date(now_time).getFullYear() ? '' : YY + (shorten ? '-' : "年")) + (MM < 10 ? 0 : '') + MM
				+ (shorten ? '-' : "月") + (DD < 10 ? 0 : '') + DD + (shorten ? ' ' : "日 ") + (hh < 10 ? 0 : '') + hh + ':'
				+ (mm < 10 ? 0 : '') + mm;
			}
		}
	};
	tmp = null;
	define('core::timeUtil', exports);
})();