/**
 * 空间好友后台管理app加载
 * @author bobotieyang
 */
;(function($){

var app = 'friendsapp';

var settings = {
	pages: {
		attsShow: '/a/app/friend/friend/attsshow.do',//关注前台
		fansShow: '/a/app/friend/fans/fansshow.do'//粉丝前台
	},
	defaultPage: 'attsShow'		//默认页面
}


$(function() {
	if(!$[app + '-config']) {
		$[app + '-config'] = {};
	}
	$.extend(settings,$[app + '-config']);
	$[app].initShow.call($('#friend-canvas'), settings);	
});

})(jQuery);