/**
 * 左边栏 more btns
 */
require(
"core::util::jQuery",
"core::util::userData",
"core::util::channel",
"#document",
function($, userData, channel) {
	var $app_more = $('div.sidebar > div.user-app-list'); // 个人中心
	if ($app_more.length) {
		var $apps_list = $('ul.apps-list', $app_more), $btn_expand = $('div.actions > span.more-btn', $app_more), $btn_collapse = $(
		'div.actions > span.less-btn', $app_more);
		var sidebar = {
			is_expand : userData.unavailable ? $.cookie('person_sidebar_is_expand') : userData.Sexp,
			put_expand : function(status) {
				if (userData.unavailable) {
					$.cookie('person_sidebar_is_expand', status, {
						expires : 365,
						path : '/',
						domain : 'i.sohu.com'
					});
				} else {
					userData.Sexp = status;
					userData.save();
				}
			},
			expand : function(event) {
				$apps_list.slideDown();
				$btn_expand.hide();
				$btn_collapse.show();
				sidebar.put_expand(true);
				event && channel.broadcast("common", "sidebar", true);
			},
			collapse : function(event) {
				$apps_list.slideUp();
				$btn_collapse.hide();
				$btn_expand.show();
				sidebar.put_expand(false);
				event && channel.broadcast("common", "sidebar", false);
			},
			init : function() {
				$app_more.addClass('app-collapse');
			}
		};
		channel.listenOther("common", "sidebar", function(e) {
			if (e.data)
				sidebar.expand();
			else
				sidebar.collapse();
		});
		$btn_expand.bind('click.sidebar', sidebar.expand);
		$btn_collapse.bind('click.sidebar', sidebar.collapse);
		// 左侧子导航状态设置
		var sidebar_nav_ids = {
			blog : 0, // 博客
			album : 1, // 相册
			video : 2, // 视频
			scomment : 3, // 我来说两句
			mblog : 4
		// 微博
		}, sidebar_nav_more_ids = {};
		// 初始化sidebar交互样式
		if (String(sidebar.is_expand) === 'false') {
			sidebar.init();
		}
		if ($space_config && $space_config._currentApp) {
			var current_app = $space_config._currentApp, $sidebar_app_list = $('div.sidebar > div.user-app-list'), $sidebar_app_more_list = $('div.sidebar > div.user-app-more');
			if (current_app in sidebar_nav_ids) {
				var sidebar_position = sidebar_nav_ids[current_app];
				if (typeof sidebar_position !== 'undefined') {
					$('ul > li', $sidebar_app_list).eq(sidebar_position).addClass('nonce');
				}
			}
			// sidebar扩展菜单
			else if (current_app in sidebar_nav_more_ids) {
				var sidebar_position = sidebar_nav_more_ids[current_app];
				if (typeof sidebar_position !== 'undefined') {
					$('ul > li', $sidebar_app_more_list).eq(sidebar_position).addClass('nonce');
				}
			}
		}
	}
});