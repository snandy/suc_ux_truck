require("core::spy", "app::assistant::popup", function(spy, Popup) {
	var current;
	var showing = {};
	var self, poping = false;
	var singleMessage = false;
	define("app::assistant::plugins::message", function(assistant) {
		self = assistant;
		var msgs;
		if (assistant.firstLogin) {
			current = {
				inform : -1,
				quest : '',
				whisper : -1
			};
		} else if (msgs = assistant.load('ms')) {
			msgs = msgs.split('|');
			current = {
				inform : parseInt(msgs[0]),
				whisper : parseInt(msgs[1]),
				quest : msgs[2]
			};
		} else {
			current = {
				inform : 0,
				quest : '',
				whisper : 0
			};
		}
		var setting = self.setting;
		setting.inform && spy.getMessages(function(i) {
			newMessage("inform", i);
		});
		setting.whisper && spy.getWhisper(function(i) {
			newMessage("whisper", i);
		});
		setting.quest && spy.getQuestReady(function(quests) {
			newMessage('quest', quests);
		});
	});
	function saveRed() {
		self.save('ms', [ current.inform, current.whisper, current.quest ].join('|'));
	}
	function newMessage(type, num) {
		if (poping) {// when poping do nothing
			return;
		}
		if (type == 'quest') {
			var red = [], notRed = [];
			for ( var i = 0, L = num.length; i < L; i++) {
				var quest = num[i];
				if (quest.percent != 100)
					continue;
				red.push(quest.id);
				if (current.quest.indexOf(' ' + quest.id + ' ') == -1) {
					// not red
					notRed.push(quest);
				}
			}
			current.quest = red.length ? ' ' + red.join(' ') + ' ' : '';
			if (!notRed.length) {
				saveRed();
				return;
			}
			current.quests = notRed;
		} else {
			if (current[type] == -1) {// 上线欢迎中已经提醒过了
				current[type] = num;
				return;
			} else if (current[type] == num) {// 数字没变
				return;
			}
			current[type] = num;
			if (!num) {// 0条消息
				saveRed();
				return;
			}
		}
		showing[type] = true;
		var toShow = [];
		for ( var k in showing)
			toShow.push(k);
		if (toShow.length > 1 || type == "quest" && notRed.length > 1) {// 多种消息或多条任务
			if (singleMessage && self.$triggerEvent) {// 召回单条消息事件
				self.setStatus();
				singleMessage = false;
			}
			self.setEvent(triggerEvent, "messages");
		} else {
			singleMessage = true;
			self.setEvent(triggerEvent, type);
		}
	}
	function triggerEvent() {
		saveRed();
		singleMessage = false;
		var toShow = [];
		for ( var k in showing)
			toShow.push(k);
		var L = toShow.length;
		var html = [ '亲爱的<span class="lord">', self.setting.lord, '</span>，' ];
		if (L > 1 || L == 1 && toShow[0] == 'quest' && current.quests.length > 1) {
			self.$log('notice_more');
			html.push('有很多消息等着您处理哦：</div>');
			if (showing.whisper) {
				html
				.push('<p class="first"><span class="title">短消息</span> : 有<a href="http://i.sohu.com/whisper/general.htm">', current.whisper, '条短消息</a>，<a href="http://i.sohu.com/whisper/general.htm">请尽快处理。</a></p>');
			}
			if (showing.inform) {
				html
				.push(showing.whisper ? '<p>' : '<p class="first">', '<span class="title">通&nbsp;&nbsp;知</span> : 有<a href="http://i.sohu.com/request/home/inform/list.htm">', current.inform, '条通知</a>，<a href="http://i.sohu.com/request/home/inform/list.htm">请尽快处理。</a></p>');
			}
			if (showing.quest) {
				html
				.push(showing.whisper || showing.inform ? '<p>' : '<p class="first">', '<span class="title">任&nbsp;&nbsp;务</span> : 完成<a href="http://i.sohu.com/task/home/listall.htm">', current.quests.length, '项任务</a>，<a href="http://i.sohu.com/task/home/listall.htm">快去领奖吧。</a></p>');
			}
		} else if (L == 1) {
			toShow = toShow[0];
			if (toShow == "whisper") {
				self.$log('notice_message');
				html
				.push('您收到<a href="http://i.sohu.com/whisper/general.htm">', current.whisper, '条短消息</a>，<a href="http://i.sohu.com/whisper/general.htm">快去看一下！</a>');
			} else if (toShow == "inform") {
				self.$log('notice_notice');
				html
				.push('您收到<a href="http://i.sohu.com/request/home/inform/list.htm">', current.inform, '条通知</a>，<a href="http://i.sohu.com/request/home/inform/list.htm">快去看一下！</a>');
			} else if (toShow == "quest") {
				var quest = current.quests[0];
				var a = '<a href="javascript:;" onclick="mysohu.task.getTask(' + current.quests[0].id + ')"';
				html.unshift(a, ' class="quest-icon"><img src="', quest.icon, '"/></a>');
				html.push(a, '>', quest.name, '</a> 任务完成了，快去领取奖励吧！', a, '>领奖</a>');
			}
		}
		showing = {};
		var popup = new Popup({
			handle : self,
			className : 'message',
			content : html.join('')
		});
		popup.bind(Popup.Collapse, function() {
			self.popup = null;
			poping = false;
			self.setStatus();
		});
		poping = true;
	}
});