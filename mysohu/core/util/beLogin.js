require('core::util[cookie]', function(util) {
	var defaults = {
		'appId' : '1019',
		'title' : "想要查看更多精彩内容，马上登录吧！",
		recall : true
	};
	define('core::util::beLogin', function(arg0) {
		if (util.cookie.getCookie('ppinf'))// already login
			return false;
		var callbak = arguments.callee.caller, args = callbak.arguments;
		var options = util.probe(defaults, arg0 && arg0.options || arg0), self = arg0 && arg0.self || arg0 || {};
		options.recall && (options.onLogin = function() {
			util.cookie.reload(function() {
				self.recalledFromBeLogin = true;
				// put reload in a new timeline in case any exceptions happen.
				(options.reload || options.reload === 0) && setTimeout(function() {
					window.location.reload();
				}, Number(options.reload) || 1);
				callbak.apply(self, args);
			});
		});
		loadResource('/mysohu/plugins/ppdialog/default/ppdialog.css');
		require('core::ui::ppDialog', function($ppdlg) {
			$ppdlg(options);
		});
		return true;
	});
});