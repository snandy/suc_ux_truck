load('/app/assistant/d/setting.css');
require("core::ui::dialog[success,error]", "app::assistant::template", "core::util::ajax", function($dialog, TEMPLATE, ajax) {
	var defaults = {
		minAlpha : 20,
		alphaWidth : 302
	};
	var resAlpha = 100 - defaults.minAlpha;
	var assistant, setting;
	define("app::assistant::plugins::setting", function(self) {
		self.$log('setting');
		assistant = self;
		setting = self.setting;
		setting.all = setting.whisper && setting.inform && setting.festival && setting.event;
		var $dlg = $dialog({
			title : "助手设置",
			btns : [ "accept", "cancel" ],
			content : TEMPLATE.setting(setting),
			contentWidth : 455,
			contentHeight : 305,
			className : "i-setting",
			onBeforeAccept : function() {
				var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{2,12}$/;
				var nick = $dlg.find('input[name="nick"]')[0].value;
				if (!reg.test(nick)) {
					$dialog
					.error(!nick ? '助手昵称不能为空' : nick.length < 2 ? '请输入2个字符以上的助手昵称' : nick.length > 12 ? '助手昵称不能超过12个中英文字符或数字' : '助手昵称格式错误，支持中英文字符和数字');
					return false;
				}
				var lord = $dlg.find('input[name="lord"]')[0].value;
				if (!reg.test(lord)) {
					$dialog
					.error(!lord ? '主人称谓不能为空' : lord.length < 2 ? '请输入2个字符以上的主人称谓' : lord.length > 12 ? '主人称谓不能超过12个中英文字符或数字' : '主人称谓格式错误，支持中英文字符和数字');
					return false;
				}
				var welcome = $dlg.find("textarea")[0].value;
				if (!welcome) {
					$dialog.error('欢迎词不能为空');
					return false;
				}
				if (welcome.length > 50) {
					$dialog.error('欢迎词不能超过50个中英文字符或数字');
					return false;
				}
				setting.nick = nick;
				setting.lord = lord;
				setting.welcome = welcome;
				setting.percent = parseInt($dlg.find(".percent").html());
				$dlg.find('.msg-option input').each(function() {
					setting[this.name] = this.checked;
				});
				ajax.postJSON("/a/assistant/personal/set?_input_encode=UTF-8", {
					name : setting.nick,
					hostName : setting.lord,
					browseTip : setting.welcome,
					percent : setting.percent,
					recevieTypes : [
							Number(setting.festival),
							Number(setting.inform),
							Number(setting.whisper),
							Number(setting.event),
							Number(setting.quest) ].join("")
				}, function(ret) {
					if (ret.code == 0) {
						self.setStatus();
						$dlg.close();
						$dialog.success("保存成功");
						mysohu.setLocation(top.location.href);
					}
				}, function() {
					$dialog.error("让服务器飞一会，请稍后再试");
				});
				return false;
			},
			onCancel : function() {
				self.invoke("setOpacity", setting.percent);
				self.setStatus();
			}
		});
		$dlg.click(function(e) {
			var target = e.target, nodeName = target.nodeName;
			if (nodeName == "INPUT") {
				var name = target.name, $inputs = $dlg.find('INPUT[type=checkbox]');
				if (name === "all") {
					var checked = target.checked;
					for ( var i = 0; i < 4; i++)
						$inputs[i].checked = checked;
				} else {
					self.$log('setting_' + {
						'nick' : 'petname',
						'lord' : 'mastername',
						'whisper' : 'message',
						'inform' : 'notice',
						'festival' : 'festival',
						'event' : 'event'
					}[name]);
					if (target.type === "checkbox") {
						var checked = true;
						for ( var i = 0; i < 4; i++)
							if (!$inputs[i].checked) {
								checked = false;
								break;
							}
						$inputs[4].checked = checked;
					}
				}
			} else if (nodeName == 'TEXTAREA') {
				self.$log('setting_welcome');
			}
		});
		initDrag($dlg.find('i'));
	});
	function initDrag(i) {
		var $span = i.prev();
		var $opacity = i.closest('.progress-bar').next();
		var $d = $(document);
		$span.css('width', (setting.percent - defaults.minAlpha) / resAlpha * defaults.alphaWidth + 10 + "px");
		var currentX, lastRatio = -1;
		i.bind('mousedown', mmDown);
		function mmDown(e) {
			currentX = e.clientX - parseInt($span.css('width'));
			$d.bind('mousemove', mmMove).bind('mouseup', mmUp);
		}
		function mmMove(e) {
			var x = e.clientX - currentX, ratio = x < 0 ? 0 : x > defaults.alphaWidth ? 1 : x / defaults.alphaWidth;
			if (ratio != lastRatio) {
				lastRatio = ratio;
				$span.css('width', ratio * defaults.alphaWidth + 10 + "px");
				ratio = Math.round(ratio * resAlpha + defaults.minAlpha);
				$opacity.html(ratio + "%");
				assistant.invoke("setOpacity", ratio);
			}
			window.getSelection && window.getSelection().removeAllRanges();
			document.selection && document.selection.empty();
		}
		function mmUp(e) {
			assistant.$log('setting_pellucid');
			$d.unbind('mousemove', mmMove).unbind('mouseup', mmUp);
		}
	}
});