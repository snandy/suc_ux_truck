/**
 * @description 短消息组件
 */
require(
	'core::ui::dialog[success,error]', 
	'app::widgets::template', 
	'core::ui::TextBox', 
	'core::util[fx,channel,ajax,beLogin]', 
	'core::stringUtil', 
	'app::emote', 
	function($dialog, PLUGINS, TextBox, util, stringUtil, Emote) {
	/**
	 * @description 发送短消息
	 * @param options
	 *            选项。nick字段为接收者昵称，content字段为消息文本框内容，reply字段为是否是恢复。
	 *            如果options为空或nick为空，则提示输入昵称
	 *
	 */
	loadResource("/i/inform/d/whisper.css");
	var defaults = {
		chars: 200, // 最大字符数
		norepeat_timeout: 30000
		// 查重时间
	};
	var repeat_cache = {};
	var firstLoad = true;

	function Whisper(options) {
		if (util.beLogin()) return;
		if (!(this instanceof Whisper)) return new Whisper(options);
		var self = Whisper.instance = this;
		this.options = options = util.probe(defaults, options);
		var $dlg = this.$dlg = $dialog({
			id: 'whisper',
			title: options.nick ? (options.reply ? "回复 " : "发送给 ") + options.nick : "发送短消息",
			contentWidth: 370,
			className: "dialog-whisper",
			btns: ["accept"],
			labAccept: "发送",
			contentHeight: options.nick ? 209 : 234,
			content: PLUGINS.whisper(options),
			onBeforeAccept: this.onSend = function() {
				self.post();
				return false;
			}
		});
		this.$content = new TextBox($dlg.find('textarea#whisper_content'));
		if (firstLoad) {
			firstLoad = false;
			setTimeout(function sched() {
				if (self.$content.height() === 154) $dlg.adjust();
				else setTimeout(sched, 10);
			}, 10);
		}
		this.$hint = $dlg.find('.hint span');
		// 发送短息窗口，增加送礼物
		$dlg.find('.btn-gift a')
			.attr('href', 'http://i.sohu.com/app/score/#/score/sur/virtual.json?nick=' + encodeURIComponent(encodeURIComponent(options.nick)));
		if (!options.nick) {
			this.$nick = $dlg.find('input#whisper_nick').bind('keyup', this.mmKeyup).bind('focus', function(e) {
				self.oldnick = "";
				self.mmKeyup(e);
			}).focus().bind('blur', function(e) {
				if (self.nicks) {
					self.$nicks.hide();
				}
			});
			this.oldnick = "";
			this.$contact = $dlg.find('.contact');
			this.$nicks = $dlg.find('.nicks').bind('mousedown', function(e) {
				var elem = e.target;
				while (elem.nodeName != "LI" && elem != e.currentTarget)
				elem = elem.parentNode;
				var index = elem.getAttribute("index");
				if (typeof index == "string") {
					self.$nick[0].value = self.nicks[index].nick;
					self.$nick[0].setAttribute('data-sname', self.nicks[index].sname);
					setTimeout(function() {
						self.$content.focus();
					}, 10);
				}
			});
			this.$nicks.$list = this.$nicks.find('ul');
			this.$nicks.current = 0;
		} else {
			this.$content.focus();
		}
		this.$content.onChange = function(value) {
			var len = stringUtil.gbLength(value);
			self.$hint.html(len).css('color', len > options.chars ? '#c43737' : '');
		};
		$dlg.find('.emote').bind('click', this.mmEmote);
		this.$content.onChange(this.options.content);
		this.$content.onSend = this.onSend;
	}
	Whisper.checkRepeat = function(nick, content) {
		var hash = hex_md5(nick + ':=' + content),
			now = new Date().getTime();
		if (now - (repeat_cache[hash] || 0) < defaults.norepeat_timeout) {
			return true;
		}
		repeat_cache[hash] = now;
		util.channel.broadcast("whisper", "repeat", [hash, now]);
		return false;
	};
	util.channel.listenOther("whisper", "repeat", function(data) {
		data = data.data;
		console.log(data);
		repeat_cache[data[0]] = data[1];
	});
	Whisper.prototype.post = function() {
		var self = this,
			options = this.options;
		if (this.posting) {
			return;
		}
		this.$nick && (options.nick = $.trim(this.$nick[0].value));
		this.$nick && (options.sname = this.$nick[0].getAttribute('data-sname'));
		if (!options.nick) {
			this.$nick.focus();
			this.error('昵称不能为空', '#c43737');
			util.fx.highlight(this.$nick);
			return;
		}
		var content = this.$content[0].value;
		if (!content) {
			this.$content.focus();
			this.error('发送内容不能为空', '#c43737');
			util.fx.highlight(this.$content);
			return;
		}
		var exceed = stringUtil.gbLength(content) - options.chars;
		if (exceed > 0) {
			this.$content.focus();
			this.error('超出<span style="color:#c43737">' + exceed + '</span>个字');
			util.fx.highlight(this.$content);
			return;
		}
		if (Whisper.checkRepeat(options.nick, content)) {
			this.error('相同内容发送一次就够了', '#c43737');
			return;
		}
		options.content = content;
		this.posting = true;
		this.error('正在发送...');
		Whisper.post({
			nick: options.nick,
			sname: options.sname || '', 
			content: options.content
		}, function(ret) {
			self.posting = false;
			if (!ret.status) {
				self.error(ret.msg, '#c43737');
				return;
			}
			self.destroy();
			$dialog.success('发送成功');
			options.onSuccess && options.onSuccess(options, ret.msg);
		}, function() {
			self.posting = false;
			$dialog.error('发送失败，请稍后再试');
		});
	};
	Whisper.post = function(param, onSuccess, onError) {
		util.ajax.postJSON('/a/whisper/send.htm?_input_encode=UTF-8', param, onSuccess, onError);
	};
	Whisper.prototype.error = function(html, color) {
		var self = this;
		this.$error || (this.$error = $('<span class="error"></span>').insertBefore(this.$dlg.find('.dialog-button-accept')));
		this.$error.html(html).css('color', color || '');
		this.$error.pid && clearTimeout(this.$error.pid);
		this.$error.pid = setTimeout(function() {
			self.$error.html('').pid = 0;
		}, 2400);
	};
	Whisper.prototype.mmKeyup = function(e) {
		var self = Whisper.instance,
			input = e.target;
		if (e.keyCode == 38) { // up
			self.setCurrentNick("prev");
			e.preventDefault();
		} else if (e.keyCode == 40) { // down
			self.setCurrentNick("next");
			e.preventDefault();
		} else if (e.keyCode == 13) { // Enter
			if (self.nicks) {
				input.value = self.nicks[self.$nicks.current].nick;
				input.setAttribute('data-sname', self.nicks[self.$nicks.current].sname);
				self.$nicks.hide();
			}
			self.$content.focus();
		} else if ($.trim(input.value) != self.oldnick && $.trim(input.value) != self.hint) {
			self.oldnick = $.trim(input.value);
			input.setAttribute('data-sname', '');
			if (e.keyCode !== 8) {
				self.autoFill();
			}
			util.ajax.getJSON('/a/search/user/search/pinyin.do?_input_encode=UTF-8&nick=' + encodeURIComponent(self.oldnick), function(ret) {
				if (ret.code != 0) {
					return;
				}
				self.redrawNicks(ret.data.accounts, e.keyCode === 8);
			});
		} else if($.trim(input.value) == self.hint) {
			if(self.nicks && self.nicks.length){
				input.setAttribute('data-sname', self.nicks[self.$nicks.current].sname);
			}
		}
	};
	Whisper.prototype.redrawNicks = function(nicks, backspace) {
		if (!nicks || !nicks.length) {
			this.nicks = null;
			this.$nicks.hide();
		} else {
			this.$nicks.show();
			this.nicks = nicks;
			var oldlen = this.oldnick.length;
			for (var n = 0, L = nicks.length; n < L; n++) {
				if (nicks[n].nick.substr(0, oldlen) === this.oldnick) break;
			}
			if (n == L) n = 0;
			this.setCurrentNick(n, backspace);
		}
	};
	Whisper.prototype.setCurrentNick = function(n, backspace) {
		var arr = this.nicks;
		if (!arr) return;
		if (n === "next") {
			if (this.$nicks.current === arr.length - 1) return;
			n = ++this.$nicks.current;
		} else if (n === "prev") {
			if (this.$nicks.current === 0) return;
			n = --this.$nicks.current;
		} else {
			this.$nicks.current = n;
		}
		var range = util.range(0, arr.length - 1, n, 5);
		for (var i = range[0], buf = []; i <= range[1]; i++) {
			buf.push('<li index="', i, '"><a href="javascript:;"', i == n ? ' class="current"' : '', '><img width="24" height="24" src="', arr[i].uavatar, '"/><span>', arr[i].nick, '(', arr[i].sname, ')</span></a></li>');
		}
		this.$nicks.$list.html(buf.join(''));
		if (!backspace) {
			this.autoFill(n);
		}
	};
	Whisper.prototype.autoFill = function(n) {
		if (!this.oldnick || !this.nicks) return;
		var oldlen = this.oldnick.length,
			nick;
		if (arguments.length == 0) {
			for (n = 0, L = this.nicks.length; n < L; n++) {
				if ((nick = this.nicks[n].nick).substr(0, oldlen) === this.oldnick) break;
			}
			if (n == L) return;
		} else if (!((nick = this.nicks[n].nick).substr(0, oldlen) === this.oldnick)) return;
		var tf = this.$nick[0];
		this.hint = tf.value = nick;
		this.hint_sname = this.nicks[n].sname;
		if (typeof tf.selectionStart != "undefined") {
			tf.selectionStart = oldlen;
		} else if (document.selection) {
			tf.parentNode.focus();
			tf.focus();
			var o = tf.createTextRange();
			o.moveStart("character", oldlen);
			o.select();
		}
	};
	Whisper.prototype.destroy = function() {
		this.$nick && this.$nick.unbind('keyup', this.mmKeyup);
		this.$dlg.find('.emote').unbind('click', this.mmEmote);
		this.$dlg.close();
		Whisper.instance = null;
	};
	Whisper.prototype.mmEmote = function(e) {
		e.stopPropagation();
		var self = Whisper.instance;
		Emote.show(self.$dlg.find('.emotion-list'), self.$content, null, 38).css({
			marginTop: "-15px",
			marginLeft: "16px"
		});
	};
	define('app::whisper', Whisper);
});