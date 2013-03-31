/**
 * 收到的评论、发出的评论、新闻评论页面js
 */
require('core::util[ajax,cookie]', 'core::util::jQuery', 'plugins::hijacker', 'core::ui::dialog[confirm,success,error]', '#document', function(util, $, hijacker, $dialog) {
	hijacker.hijackthis('div.hijackthis');

	define('plugins::hijacker::discuss.delete', function(e) {
		require("core::ui::dialog[confirm,success,error]", function($dialog) {
			$dialog.confirm({
				content : "确定删除这条评论吗？",
				onConfirm : proceed
			});
			function proceed() {
				var $data = $(e.actionTarget).closest(".hijackdata");
				var ids = $data.attr('data-replytocommentid') + '_' + $data.attr('data-xpt');
				$.getJSON('/a/app/discuss/delete.htm', {
					ids : ids
				}, function(ret) {
					if (ret.code != "0") {
						$dialog.error("删除失败：" + ret.msg);
					} else {
						$dialog.success("删除成功");
						var elem = util.getParentByClassName($data[0], "remark-reply-box");
						elem.parentNode.removeChild(elem);
					}
				});
			}
		});
	});

	define('plugins::hijacker::discuss.selectall', function(e) {
		var all = $('input.select-all');
		var checked, target = e.actionTarget;
		if (all[0] !== target && all[1] !== target) {
			target = util.getSibling(target, 'previous');
			checked = !target.checked;
		} else {
			checked = target.checked;
		}
		all[0].checked = all[1].checked = checked;

		$('input.cmd-item').each(function() {
			this.checked = checked;
		});
		e.dont_prevent = true;
	});
	define('plugins::hijacker::discuss.deleteall', function(e) {
		var arr = [], toDelete = [];
		$('input.cmd-item').each(function() {
			if (this.checked) {
				var dom = util.getParentByClassName(this, 'hijackdata');
				arr.push(dom.getAttribute('data-replytocommentid') + '_' + dom.getAttribute('data-xpt'));
				toDelete.push(dom);
			}
		});
		if (arr.length)
			$dialog.confirm({
				content : '确实要删除这' + arr.length + '条评论吗？',
				onConfirm : proceed
			});
		function proceed() {
			$.getJSON('/a/app/discuss/delete.htm?ids=' + arr.join(','), function(ret) {
				if (ret.code != "0") {
					$dialog.error("删除失败：" + ret.msg);
				} else {
					$dialog.success("删除成功");
					var parent = toDelete[0].parentNode;
					for ( var n = 0, L = toDelete.length; n < L; n++) {
						parent.removeChild(toDelete[n]);
					}
				}
			});
		}
	});
	define('plugins::hijacker::discuss.reply', function(e) {
		var dom = util.getParentByClassName(e.actionTarget, "hijackdata");
		if (dom.discuss) {
			dom.discuss.destroy();
			dom.discuss = null;
			return;
		}
		var $data = $(dom);
		var options = {
			dom : dom,
			elem : e.actionTarget,
			$data : $data,
			appId : $data.attr('data-appid') || $data.attr('data-from') || mysohu.appId,
			autoFocus : true,
			auto_load : false,
			parentid : $data.attr('data-itemid'),
			xpt : $data.attr('data-xpt'),
			noPush : true,
			usericon : util.cookie,
			onSuccess : function() {
				require('core::ui::dialog::success', function($success) {
					$success('评论成功');
				});
			},
			reply : {
				id : $data.attr('data-replytocommentid'),
				xpt : $data.attr('data-replytopassport'),
				unick : $data.attr('data-unick')
			}
		};
		options.isSComment = options.appId == 'scomment' || $data.attr('data-from') === 'comment';
		if ($data.attr('data-from') === "forward") {
			options.isForward = true;
			$data.attr('data-oriappid') !== 'qingsohu' && (options.origin = {
				username : {
					tblog : $data.attr('data-oriappid') == 'tblog',
					xpt : $data.attr('data-orixpt'),
					ulink : $data.attr('data-oriulink'),
					unick : $data.attr('data-oriunick')
				}
			});
			options.originalid = $data.attr('data-oriid');
		} else if (options.isSComment) {
			options.showDelete = false;
			options.ulink = $data.attr('data-ulink');
			options.replyid = $data.attr('data-replyid');
			options.hideFwd = true;
		} else if (options.appId === 'baby') {
			options.hideFwd = true;
		}
		var oriid = $data.attr('data-oriid');
		if (oriid) {
			options.isForward = true;
			options.originalid = oriid;
		}
		require('app::discuss', function(Discuss) {
			new Discuss(options);
		});
	});
});
