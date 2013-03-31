require('core::ui::dialog[confirm,success,error]', 'core::util[ajax]', 'core::util::jQuery', function($dlg, util, $) {
	define('plugins::hijacker::feed.hide', function(e) {
		var dialog = $dlg.confirm({
			className : "feed-delete",
			content : "确定隐藏这条新鲜事吗？",
			onConfirm : proceed
		});
		function proceed() {
			util.ajax.postJSON('/a/newsfeed/delete', {
				pp : util.cookie.xpt,
				mid : e.actionTarget.getAttribute('data-id'),
				dtype : "other"
			}, function(ret) {
				if (ret.status != "0") {
					$dlg.error("隐藏失败：" + ret.statusText);
				} else {
					$dlg.success("隐藏成功");
					deleteFeed(e.actionTarget);
				}
			});
		}
	});

	define('plugins::hijacker::feed.delete', function(e) {
		var $data = $(e.actionTarget).closest(".hijackdata");
		var appid = $data.attr('data-appid');
		var delSync = '';
		if (appid === 'photo' || appid === 'album') {// 单图/多图
			delSync = '是否同时删除原图片？';
		} else if (appid === 'blog') {
			delSync = '是否同时删除原博客？';
		} else if (appid === 'video') {
			delSync = '是否同时删除原视频？';
		}
		var dialog = $dlg.confirm({
			className : "feed-delete",
			content : "确定要删除这条新鲜事吗？"
			+ (delSync && '<p class="dialog-txt dialog-span-top"><label><input type="checkbox"/>&nbsp;' + delSync
			+ '</label></p>'),
			onBeforeAccept : proceed
		});
		function proceed() {
			var from = $data.attr('data-from');
			from === "forward" && (from = 'sentence');
			var sync = delSync && dialog.find("INPUT")[0].checked;
			util.ajax.postJSON('/a/newsfeed/delete', {
				pp : util.cookie.xpt,
				mid : $data.attr('data-id'),
				dtype : "self",
				syn : sync
			}, function(ret) {
				if (ret.status != "0") {
					$dlg.error("删除失败：" + ret.statusText);
				} else {
					$dlg.success("删除成功");
					if (sync && appid === 'video') {
						//用户删除视频后同步发视频任务
						$.getJSON('http://i.sohu.com/a/video/deleteVideoSuccess.htm?videoId=' + $data.attr('data-itemid'));
					}
					deleteFeed($data[0]);
				}
			});
		}
	});
	define('plugins::hijacker::mblog.delete', function(e) {
		$dlg.confirm({
			className : "feed-delete",
			content : "确定要删除这条微博吗？",
			onConfirm : proceed
		});
		function proceed() {
			var $data = $data = $(e.actionTarget).closest(".hijackdata");
			util.ajax.getJSON('/a/app/mblog/delete.htm?id=' + $data.attr('data-itemid'), function(ret) {
				if (ret.code != "0") {
					$dlg.error("删除失败：" + ret.msg);
				} else {
					if (/\/mblog\/view.htm/.test(location.href) && ret.data.callbackurl) {// 微博最终页：跳走
						location.href = ret.data.callbackurl;
						return;
					}
					$dlg.success("删除成功");
					deleteFeed($data[0]);
				}
			});
		}

	});

	function deleteFeed(elem) {
		elem = util.getParentByClassName(elem, "section");
		elem.parentNode.removeChild(elem);
		$('#feedlist').trigger('i-feed-delete');
	}
	define('plugins::hijacker::feed.dig', function(e) {
		if (util.beLogin())
			return;
		var $data = $(e.actionTarget).closest(".hijackdata");
		var appid = $data.attr('data-appid');

		util.ajax.getJSON('/a/dig/digit?' + util.toQueryString({
			pp : util.cookie.xpt,
			fpp : $data.attr('data-xpt'),
			appid : appid,
			itemid : $data.attr('data-itemid'),
			mtype : $data.attr('data-from') == 'forward' ? 35 : '',
			time : $data.attr('data-time')
		}), function(ret) {
			if (ret.status == 0) {
				$dlg.success('赞成功');
				util.refreshCount(e.actionTarget);
				/*
				 * var zan =
				 * $(e.actionTarget).closest('.feed-box').find('.inner-zan a');
				 * if (zan.length) { zan.before("我和"); }
				 */
			} else if (ret.status == 1) {
				$dlg.error('你已经赞过了！');
			} else if (ret.status == 2) {
				$dlg.error('你的赞操作太频繁');
			} else if (ret.status == 5) {
				$dlg.error('你还没有登录');
			} else {
				$dlg.error(ret.statusText);
			}
		});
	});
	define('plugins::hijacker::feed.follow_expand', function(e) {
		$(e.actionTarget).closest('.text').hide().next().show();
	});
	define('plugins::hijacker::feed.follow_shrink', function(e) {
		$(e.actionTarget).closest('.text').hide().prev().show();
	});

	define('plugins::hijacker::feed.read', function(e) {// 奇遇 已阅
		proceed();
		function proceed() {
			util.ajax.postJSON('/a/adventure/hide-it/' + e.actionTarget.getAttribute('data-id') + '/', {}, function(ret) {
				if (ret.code != "0") {
					$dlg.error("已阅失败：" + ret.msg);
				} else {
					deleteFeed(e.actionTarget);
				}
			});
		}
	});
});