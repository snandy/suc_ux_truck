require('core::util[ajax]', 'core::ui::dialog[success,error]', function(util, $dialog) {
	var otherDomain = document.domain == 'pub.i.sohu.com';
	var url = '/a/app/discuss/delete.htm?';
	define('plugins::hijacker::discuss.delete', function(e) {
		require("core::ui::dialog[confirm,success,error]", function($dialog) {
			$dialog.confirm({
				content : "确定删除这条评论吗？",
				onConfirm : proceed
			});
			function proceed() {
				var $data = $(e.actionTarget).closest(".hijackdata");

				(otherDomain ? util.ajax.jsonp : util.ajax.getJSON)((otherDomain ? 'http://i.sohu.com' : '') + url + 'ids=' + $data.attr('data-replytodiscussid') + '_'
				+ $data.attr('data-xpt'), function(ret) {
					if (ret.code != "0") {
						$dialog.error("删除失败：" + ret.msg);
					} else {
						$dialog.success("删除成功");
						$data.remove();
					}
				});
			}
		});
	});
	define('plugins::hijacker::discuss.focus', function(e) {
		var commentbox = $.find('.comment-box')[0];
		commentbox && commentbox.parentNode.discuss && commentbox.parentNode.discuss.focus();
	});
});