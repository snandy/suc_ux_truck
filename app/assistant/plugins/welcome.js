/**
 * 每日第一次登陆提示，助手plugin
 */
require("core::util::ajax", "core::util::Ready", "core::spy", "app::assistant::popup", "app::assistant::template", "core::stringUtil", function(ajax, Ready, spy, Popup, Template, stringUtil) {
	define('app::assistant::plugins::welcome', function(self, handle) {// 跟随者，通知，请求，系统消息，短消息，评论
		if (!self.firstLogin || self.hidden)
			return;
		var popup;
		var q = new Ready("followers", "inform", "request", "sys_msg", "whisper", "comment",
		function(followers, inform, request, sys_msg, whisper, comment) {
			if (!(followers || inform || request || whisper)) {
				handle.next(0);
				return;
			}
			self.$log('notice_welcome');
			var html = [ '亲爱的<span class="lord">', self.setting.lord, '</span>，在您离开的这段时间里，' ];
			var first = true, link;
			if (followers) {
				var url = link = 'http://i.sohu.com/app/friend/!!/a/app/friend/fans/fans.do';
				html.push('增加了<a href="', url, '">', followers, '位新的跟随者</a>');
				first = false;
			}
			if (whisper) {
				var url = 'http://i.sohu.com/whisper/general.htm';
				if (first) {
					link = url;
					first = false;
				} else {
					html.push('、');
				}
				html.push('收到<a href="', url, '">', whisper, '条短消息</a>');
			}
			if (inform) {
				var url = 'http://i.sohu.com/request/home/message.htm';
				if (first) {
					link = url;
					first = false;
				} else {
					html.push('、');
				}
				if (!whisper)
					html.push('收到');
				html.push('<a href="', url, '">', inform, '条通知</a>');
			}
			if (request) {
				var url = 'http://i.sohu.com/request/home/request/list.htm';
				if (first) {
					link = url;
					first = false;
				} else {
					html.push('、');
				}
				html.push('有<a href="', url, '">', request, '个请求等待处理</a>');
			}
			html.push('，<a href="', link, '">快去看看吧&gt;&gt;</a>');
			html = html.join('');
			popup = new Popup({
				handle : self,
				arrow : 38,
				className : 'welcome',
				content : html
			});
			popup.autoPos();
			self.setStatus("welcome");
			// TODO
			// readFeed(html);
			popup.bind(Popup.Collapse, function() {
				self.popup = null;
				self.setStatus();
				handle.next();
			});
		});
		function readFeed(html) {
			html += '<span class="qiyu">这段时间都发生了哪些新鲜事？<a class="right" href="#">去奇遇一下&gt;&gt;</a></span>';
			// ajax.get("", )
			function callback(ret) {
				var feeds = ret.feeds;
				for ( var i = 0, L = feeds.length; i < L; i++) {
					var feed = feeds[i];
					i == 0 && (feed.first = true);
					feed.filtered_title = stringUtil.filter_all(feed.title);
					html += Template.welcome_feed(feed);
				}
				popup.setContent(html);
			}
		}
		spy.getNewFollowers(function onFollower(followers) {
			spy.remove(onFollower);
			q.ready('followers', followers);
		});
		spy.getMessages(function onMessage(inform, request, sys_msg) {
			spy.remove(onMessage);
			q.ready({
				inform : inform,
				request : request,
				sys_msg : sys_msg
			});
		});
		spy.getWhisper(function onWhisper(whisper) {
			spy.remove(onWhisper);
			q.ready('whisper', whisper);
		});
		spy.getNewCount(function onNewCount(comments, atts) {
			spy.remove(onNewCount);
			q.ready("comment", comments);
		});
		return true;
	});
});
