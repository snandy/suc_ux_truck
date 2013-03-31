loadResource('/mysohu/plugins/dialog/space/dialog.css', '/mysohu/plugins/ibutton/space/ibutton.css');
loadResource('/mysohu/plugins/jquery-lastest.js', '/mysohu/plugins/dialog/jquery.dialog.js', '/mysohu/plugins/ishadow/jquery.ishadow.js', '/mysohu/plugins/box/jquery.box.js', '/mysohu/plugins/scrollbarwidth/jquery.scrollbarwidth.js',
	'/mysohu/base/passport.js', '/mysohu/plugins/ibutton/jquery.ibutton.js');
require('core::util::jQuery', 'core::ui::TextBox', 'core::util[beLogin,cookie,ajax]', 'core::stringUtil', function($, TextBox, util, stringUtil) {
	var defaultText = '有什么想说的？';
	var parentid = (parentid = $('input')).length && parentid.val();
	var maxLen = parentid ? 300 : 2000;
	var $tf = function() {
		var tmp = document.getElementById('onesentencetext'), oldVal = tmp.value;
		tmp.value = '';
		var ret = new TextBox(tmp);
		return ret.focus().val(oldVal);
	}();
	var posting = false;
	$tf.onChange = function() {
		var content = this.getText();
		content === defaultText && (content = '');
		var len = stringUtil.gbLength(content);
		$('.share-title i').html(maxLen - len).css('color', len > maxLen ? 'red' : '');
	};
	$tf.onChange();
	$tf.focus(function() {
		if ($tf.getText() === defaultText) {
			$tf.setText('').css('color', '');
		}
	}).blur(function() {
		if ($tf.getText() === '') {
			$tf.setText(defaultText).css('color', '#999999');
		}
	})
	$('.share-content .btn-submit span.ui-btn').click(function(e) {
		this.recalledFromBeLogin || e.preventDefault();
		if (util.beLogin())
			return;
		if (posting) {
			notice('正在提交，请耐心等待');
			return;
		}
		var content = $tf.getText();
		content === defaultText && (content = '');
		if (stringUtil.gbLength(content) > maxLen) {
			notice('内容太长');
			return;
		}
		if (parentid) {
			posting = true;
			util.ajax.postJSON('/a/app/mblog/spread.htm?_input_encode=UTF-8', {
				committype : 0,
				from : 'qingsohu',
				parentid : $('input')[0].value,
				content : content || '转发新闻'
			}, success);
		} else {
			if (!content) {
				return $tf.focus();
			}
			util.ajax.postJSON('/a/app/mblog/save.htm?_input_encode=UTF-8', {
				type : 0,
				from : '',
				content : content,
				url : ''
			}, success);
		}
		function success(ret) {
			if (ret.code == 0) {
				$('.share-content').html('').hide();
				var n = 3, tmr = $('.share-success>p')[1].children[0], sched = setInterval(function() {
					n--;
					if (n == 0) {
						wndClose();
						clearInterval(sched);
					}
					tmr.innerHTML = n;
				}, 1000);
				$('.share-success span.close').click(wndClose);
				$('.share-success a.finalpage').attr('href', ret.sentence.ext[0].turl);
			} else {
				notice(ret.msg);
				posting = false;
			}
		}
	});
	$('a.login').click(function(e) {
		this.recalledFromBeLogin || e.preventDefault();
		if (util.beLogin()) {
			return;
		}
		$('.logo-header-extra').html('<span><a href="http://i.sohu.com/" target="_blank">' + util.cookie.unick + '</a></span>, 已登录');
	});
	function notice(content) {
		require('core::ui::dialog::notice', function(notice) {
			notice({
				type : 'notice',
				icon : 'error',
				content : content,
				delay : 1400,
				onClose : function() {
					$tf.focus();
				}
			});
		});
	}
	function wndClose() {
		window.open('', '_parent', '');
		window.close();
	}
});