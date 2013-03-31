/**
 * 母婴后台管理app加载
 * @author bobotieyang
 */
;(function($){

var app = 'babyapp';

var settings = {
	pages: {
		babyinfo: '/baby/babyinfo.php',//激活修改
		calendar: '/baby/calendar.php'//按周 calendar.php
	},
	defaultPage: 'calendar'		//默认页面
};


$(function() {
	if(!$[app + '-config']) {
		$[app + '-config'] = {};
	}
	$.extend(settings,$[app + '-config']);
	$[app].init.call($('#innerCanvas'), settings);
});

})(jQuery);