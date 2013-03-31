/**
 * 空间好友后台管理app加载
 * @author bobotieyang
 */
;(function($){

var app = 'friendsapp';

var settings = {
	pages: {
		attsManage: '/a/app/friend/friend/atts.do',//跟随后台
		fansManage: '/a/app/friend/fans/fans.do',//跟随者后台
		attsSearch: '/a/search/user/friend/search.do',//跟随后台搜索
		finsSearch: '/a/search/user/fans/search.do',//跟随者后台搜索
		find: '/a/search/user/search/find.do',//找人
		may: '/a/search/user/search/may.do',//可能认识的人
		guest: '/a/guest/web/recentlist.do',//最近访客
		quest: '/a/app/friend/quest/show.do',//求跟随
		blog: '/a/app/friend/recommend/list/'//博友推荐
	},
	defaultPage: 'attsManage'		//默认页面
}


$(function() {
	if(!$[app + '-config']) {
		$[app + '-config'] = {};
	}
	$.extend(settings,$[app + '-config']);
	$[app].init.call($('#friend-canvas'), settings);	
});

})(jQuery);