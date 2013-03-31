require(
	'core::util[ajax,fx,channel,beLogin]', 
	'core::util::jQuery', 
	'core::ui::TextBox', 
	'core::ui::dialog[success,error,inform]', 
	'app::widgets::template', 
	'core::stringUtil',
	'plugins::hijacker', 
	'plugins::at', 
	function(util, $, TextBox, $dialog, PLUGINS, stringUtil, hijacker, $at) {
	var defaults = {
		chars: 2000
	};
	define('app::widgets::atTA', function(options) {
		if (util.beLogin()) return;
		options = util.probe(defaults, options);
		var $dlg = $dialog({
			'title': '对@' + options.nick + '说',
			'content': PLUGINS.atTa(),
			onBeforeAccept: function() {
				hijacker.free($dlg);
			}
		});
		var $tf = new TextBox($dlg.find('textarea')[0]),
			$numLen = $dlg.find('.txt-number-now');
		$at.init.apply($tf);
		$tf.onChange = function(value) {
			var len = stringUtil.gbLength(value);
			$numLen.html((len > options.chars ? '<span style="color:#AA0000">' + len + '</span>' : len) + " / " + options.chars);
		};
		$tf.focus();
		$dlg.find('.emote-handler').data('EmoteHandler', {
			getEmoteContext: function() {
				return {
					target: $dlg.find('.emotion-list'),
					editor: $tf[0],
					arrowLeft: 0
				};
			},
			onEmote: function(emote) {
				emote.css({
					'marginTop': '22px',
					'marginLeft': '6px'
				});
			}
		});
		hijacker.hijackthis($dlg);
		$dlg.find('.btn-submit').click($tf.onsend = function() {
			if ($dlg.posting) {
				$dialog.inform('正在发布，请耐心等待');
				return;
			}
			var content = $tf.getText();

			if (stringUtil.gbLength(content) > options.chars) {
				$tf.focus();
				$numLen.html('<span style="color:#AA0000">内容过长</span>');
				util.fx({
					srt: 0,
					dst: 200,
					steps: 20,
					round: true,
					callback: function(n) {
						n = n > 100 ? 55 + n : 255 - n;
						$tf.css('backgroundColor', 'rgb(255,' + n + ',' + n + ')');
					},
					complete: function() {
						$tf.onChange($tf.getText());
					}
				});
				return;
			}
			$dlg.posting = true;
			util.ajax.postJSON('/a/app/mblog/save.htm?_input_encode=UTF-8', {
				content: '@' + options.nick + ' ' + content,
				from: 'sentence',
				type: 0
			}, function(ret) {
				$dlg.posting = false;
				if (ret.code == 0) {
					$dialog.success('发布成功');
					$at.destroy.apply($tf);
					$dlg.close();
					util.channel.broadcast('feed', 'push', ret.sentence);
				} else if (ret.code == 4) {
					$dialog.error('请不要发表含有不适当内容的微博。 ');
				} else {
					$dialog.error('发布微博失败：' + ret.msg);
				}
			}, function() {
				$dlg.posting = false;
				$dialog.error('发送失败：服务器错误');
			});
		});
	});
});