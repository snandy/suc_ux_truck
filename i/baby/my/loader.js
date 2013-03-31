/**
 * 母婴后台管理app加载
 * 
 * @author bobotieyang
 */
;
loadResource('/app/discuss/discuss.js');
(function($, ms) {

	var app = 'babyapp';

	var settings = {
		pages : {
			babyinfo : '/baby/babyinfo.php',// 激活修改
			calendar : '/baby/calendar.php',// 按周 calendar.php
			square : '/baby/square.php'// 育儿广场
		},
		defaultPage : 'calendar' // 默认页面
	};

	$(function() {
		if (!$[app + '-config']) {
			$[app + '-config'] = {};
		}
		$.extend(settings, $[app + '-config']);
		$[app].init.call($('#innerCanvas'), settings);
		// ms.hijacker.hijackthis('.hijackthis');
		require('plugins::hijacker', function($hijacker) {
			$hijacker.hijackthis('.hijackthis');
		});
	});

})(jQuery, mysohu);