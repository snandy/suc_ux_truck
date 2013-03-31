;(function($) {
if ($.waitUntil) {
	return;
}

$.waitUntil = function(settings) {
	var opts = $.extend({
		condition: null,
		work: null,
		interval: 100
	}, settings);

	function _waitUntil() {
		var bExec = $.isFunction(opts.condition) ? opts.condition() : window["eval"]("(" + opts.condition + ")");
		if (bExec) {
			if ($.isFunction(opts.work)) {
				opts.work();
			}
		}
		else {
			window.setTimeout(_waitUntil, opts.interval);
		}
	};

	_waitUntil();
};

})(jQuery);