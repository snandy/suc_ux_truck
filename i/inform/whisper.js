/**
 * @description 消息中心/短消息页面
 * @author kyriosli@sohu-inc.com
 */
loadResource("/i/inform/d/whisper.css");
require('core::util::jQuery', 'app::whisper', 'core::Watchdog', 'core::util[ajax,cookie,base64,channel,fx]',
'plugins::hijacker', 'core::ui::dialog[confirm,error,success]', 'app::whisper::template', 'core::stringUtil', 'core::timeUtil',
'core::ui::TextBox', 'plugins::at', 'core::ui::Page', function($, whisper, Watchdog, util, hijacker, $dialog, WHISPER,
stringUtil, timeUtil, TextBox, $at, Page) {
	var defaults = {
		productid : 'isohu',
		prefix : 'http://' + (typeof dev === "undefined" ? 'd' : 'ndev') + '.me.sohu.com/operations?productid=isohu&magicCode='
		+ $space_config.magic + '&',
		pp : 'isohu|' + util.base64.decode(util.cookie.xpt),
		me : {
			ico : util.cookie.photo,
			url : util.cookie.ulink,
			title : "我",
			xpt : util.cookie.xpt
		},
		pagesize : 10,
		chars : 200,
		screensize : 10,
		check_timeout : 18000
	};
	hijacker.hijackthis('.app-wraper');

	var accounts = {};

	timeUtil.setServerTime($space_config._now);

	var state = {
		general : {
			init : function(page) {
				$('.app-content.detail').hide();
				location.hash = "";
				document.title = "短消息 - 我的搜狐";
				var self = this;
				if (!this.inited) {
					this.$dom = $('.app-content.general');
					this.$list = this.$dom.find('.items-list-wrap');
					this.$dom.find('.ui-btn').click(function() {
						whisper({
							onSuccess : self.onSent
						});
					});

					this.inited = true;
					define("plugins::hijacker::whisper.detail", function(e) {
						var pp = e.actionTarget.getAttribute("data-pp");
						pp ? state.detail.init(pp) : $dialog.error('发生错误，请尝试刷新页面');
					});
				}
				this.$dom.show();
				state.current = "general";
				this.loadPage(page || 0);
			},
			findTr : function(em) {
				for ( var n = 6; em && n > 0; n--) {
					if (em.nodeName == "TR")
						return em;
					em = em.parentNode;
				}
				return null;
			},
			drawList : function() {
				var self = this;
				// 初始化联系人个数显示
				this.$dom.find('.head h3').html(
				this.total ? '已有' + this.total + '个联系人' : '没有消息，我来<a href="javascript:;" action="whisper.send">发一个</a>');
				// 初始化分页显示
				var pages = Math.ceil(this.total / defaults.screensize), current = 1;
				if (this.$page) {
					if (pages <= 1) {
						this.$page.hide();
					} else {
						this.$page.setPages(pages);
						this.$page.showPage(this.page + 1);
					}
				} else if (pages > 1) {
					this.$page = new Page(pages, this.page + 1);
					this.$dom.append(this.$page);
					this.$page.click(this.mmPage);
				}
				// 删除按钮
				this.$dom.find('.head .del').html(
				'<i class="inform-icon-del"></i>'
				+ (this.total ? '<a href="javascript:;" action="whisper.deleteAll">全部删除</a>'
				: '<span style="color:gray">全部删除</span>'));
				var msgs = self.msgs;
				var accounts_toLoad = [];
				for ( var i = 0, L = msgs.length; i < L; i++) {
					var msg = msgs[i];
					if (!msg.account) {
						var pp = msg.friend.substr(defaults.productid.length + 1);
						if (!(msg.account = accounts[pp])) {
							accounts_toLoad.push(util.base64.encode(pp));
						} else {
							msg.nick = msg.account.title;
						}
						filter(msg);
						msg[0] = parseInt(msg.dt);
						msg.time = timeUtil.get_timeago(msg[0] + 28800000);
					}
				}

				if (accounts_toLoad.length) {
					util.ajax.postJSON('/api/accountinfo.htm', {
						xp : accounts_toLoad.join(',')
					}, function(ret) {
						for ( var k in ret) {
							if (k == "null")
								continue;
							var pp = util.base64.decode(k), retk = accounts[pp] = ret[k];
							retk.xpt = k;
							retk.pp = pp;
						}
						for ( var i = 0, L = msgs.length; i < L; i++) {
							var msg = msgs[i];
							if (!msg.account) {
								var pp = msg.friend.substr(defaults.productid.length + 1);
								if (!(msg.account = accounts[pp])) {
									msgs.splice(i, 1);
									i--;
									L--;
								}
							}
						}
						self.render(msgs);
					});
				} else {
					this.render(msgs);
				}
			},
			loadPage : function(n) {
				if (typeof n === "undefined")
					n = this.$page ? this.$page.current - 1 : 0;
				this.page = n;
				location.hash = "page=" + n;
				var self = this;
				window.scrollTo(0, 0);
				util.ajax.jsonp(defaults.prefix + util.toQueryString({
					type : 'getGeneralMsgList',
					offset : n * defaults.screensize,
					limit : defaults.screensize
				}), function(ret) {
					if (!ret.status) {
						console.log("Error retriving data", ret);
						return;
					}
					self.msgs = ret.msg;
					self.total = ret.totalCount;
					self.drawList(ret, n);

				});

				if (this.$page) {
					this.$page.showPage(n + 1);
					this.$page.hidePages();
				}
			},
			render : function(msgs) {
				this.$list.html('').append(WHISPER.general(msgs));
			},
			mmPage : function(e) {
				var self = state.general;
				var elem = e.target, page = elem.getAttribute('data-page');
				while (elem != e.currentTarget && !page) {
					elem = elem.parentNode;
					page = elem.getAttribute('data-page');
				}
				if (page) {
					page = self.$page.showPage(page);
					if (typeof page == "number")
						self.loadPage(page - 1);
				}
			},
			onSent : function(options, ackmsg) {
				var self = state.general;
				var found = false;
				for ( var n = 0, L = self.msgs.length; n < L; n++) {
					var msg = self.msgs[n];
					if (msg.nick === options.nick) {// found
						found = true;
						msg.recv_send = 1;
						msg.message = options.content;
						filter(msg);
						msg.mid = ackmsg.mid;
						msg.time = "刚刚";
						msg.count++;
						msg[0] = timeUtil.setServerTime();
						self.drawList();
						break;
					}
				}
				if (!found) {
					self.loadPage();
				}
			}
		},
		detail : {
			init : function(pp, page) {
				$('.app-content.general').hide();
				location.hash = "pp=" + Base64.encode(pp);
				var self = this;
				if (!this.inited) {
					this.$dom = $('.app-content.detail');
					this.$list = this.$dom.find('.text-msg-releasewrap');

					this.$dom.find('.text-msg-btn .ui-btn').click(function() {
						state.general.init();
					});
					this.$tf = new TextBox(this.$dom.find('.text-msg-release textarea'));

					this.$tf.onChange = function(content) {
						var len = stringUtil.gbLength(content);
						self.$dom.find('.txt-number').html(len + '/' + defaults.chars).css('color',
						len > defaults.chars ? '#c43737' : '');
					};
					this.$tf.onSend = this.post;

					this.$dom.data('EmoteHandler', {
						getEmoteContext : function() {
							return self.emoteContext;
						},
						onEmote : function(emote) {
							emote.css('margin', "72px 0 0 26px");
							self.$tf.focus();
						}
					}).addClass('emote-handler');
					this.emoteContext = {
						target : this.$dom.find('.emotion-list'),
						editor : this.$tf,
						arrowLeft : 30
					};
					this.schedog = new Watchdog({
						id : 'whisper_detail',
						timeout : defaults.check_timeout,
						onTimeout : this.checkNewMsg,
						useChannel : false
					});
					this.pp = pp;
					this.inited = true;
					define("plugins::hijacker::whisper.post", state.detail.post);
				}
				state.current = this.pp = pp;
				this.$list.html('');
				this.peer = accounts[pp];
				this.$dom.show();
				var account = accounts[pp];
				document.title = "我与" + account.title + "的对话 - 我的搜狐";
				this.$dom.find('.head h3').html(
				[ '我与<a target="_blank" href="', account.url, '" data-card="true" data-card-action="xpt=', account.xpt, '">',
					account.title, '</a>的对话(共<span>0</span>条)' ].join(''));
				this.$count = this.$dom.find('.head h3 span');
				this.minid = 0;
				this.loadPage(page || 0);
			},
			checkNewMsg : function() {
				var self = state.detail;
				if (state.current != self.pp)
					return;
				self.schedog.pauseAll();

				util.ajax.jsonp(defaults.prefix + util.toQueryString({
					type : 'getDetailMsgList',
					mode : 2,
					minid : self.minid,
					limit : defaults.pagesize,
					other : defaults.productid + '|' + self.pp
				}), function(ret) {
					if (!ret.status) {
						self.schedog.resetAll();
						console.log('Error retriving detailmsglist');
						return;
					}
					self.schedog.resetAll();
					self.$count.html(ret.count[0].count);
					self.$list.find('>.temp').remove();
					if (ret.msg && ret.msg.length) {
						self.insert(ret.msg);
					}
				});
			},
			loadPage : function(page) {
				var self = state.detail;
				location.hash = location.hash.replace(/(?:&page=\d+)?$/, "&page=" + page);
				window.scrollTo(0, 0);
				util.ajax.jsonp(defaults.prefix + util.toQueryString({
					type : 'getDetailMsgList',
					mode : 1,
					offset : page * defaults.pagesize,
					limit : defaults.pagesize,
					other : defaults.productid + '|' + self.pp
				}), function(ret) {
					if (!ret.status) {
						console.log('Error retriving detailmsglist');
						return;
					}
					self.$count.html(ret.count[0].count);
					self.$list.html('');
					self.insert(ret.msg);
					var pages = Math.ceil(ret.count[0].count / defaults.pagesize);
					if (pages > 1) {
						if (!self.$page) {
							self.$page = new Page(pages, page + 1);
							self.$page.appendTo(self.$dom);
							self.$page.click(self.mmPage);
						} else {
							self.$page.setPages(pages);
							self.$page.showPage(page + 1);
							self.$page.hidePages();
						}
					} else {
						self.$page && self.$page.hide();
					}
				});
			},
			insert : function(msgs, tmp) {
				var unread = [];
				timeUtil.setServerTime();
				for ( var n = 0, L = msgs.length, arr = []; n < L; n++) {
					var msg = msgs[n];
					if (this.minid < msg.id)
						this.minid = msg.id;
					arr.push({
						mid : msg.mid,
						from : msg.recv_send ? defaults.me : this.peer,
						time : msg.dt ? timeUtil.get_timeago(parseInt(msg.dt) + 28800000) : "刚刚",
						isrecv : !msg.recv_send,
						unread : Boolean(msg.message_type & 1),
						filtered_content : stringUtil.filter_emote(msg.message)
					});
					if (msg.message_type & 1) {
						unread.push(msg.mid);
					}
				}
				if (unread.length) {
					// 标记为已读
					loadScript(defaults.prefix + util.toQueryString({
						type : 'ackMsg',
						mode : 1,
						mid : unread.join('|'),
						callback : "void",
						_ : util.uuid()
					}), null, true);
				}
				arr.tmp = tmp;
				this.$list.prepend(WHISPER.detail(arr));
			},
			error : function(message, timeout) {
				var $div = this.$dom.find('.txt-error');
				if (message)
					$div.show().html(message);
				else if (timeout) {
					setTimeout(function() {
						$div.hide();
					}, timeout);
				} else
					$div.hide();
				return $div;
			},
			post : function(e) {
				var self = state.detail, content = self.$tf.getText(), len = stringUtil.gbLength(content);
				if (self.posting)
					return;
				if (len == 0 || len > defaults.chars) {
					util.fx.highlight(self.$tf, function() {
						self.error(false);
					});
					self.error(len == 0 ? '内容不能为空' : '内容超长').css('color', '#c43737');
					return;
				}
				if (whisper.checkRepeat(self.peer.title, content)) {
					self.error('相同内容发布一次就够了').css('color', '#c43737');
					self.error(false, 1400);
					return;
				}
				this.posting = true;
				whisper.post(self.peer.title, content, function(ret) {
					self.posting = false;
					if (!ret.status) {
						self.error(ret.msg).css('color', '#c43737');
						self.error(false, 1000);
						return;
					}
					self.insert([ {
						mid : ret.msg.mid,
						recv_send : 1,
						message : content,
						message_type : 0
					} ], true);
					self.$count.html(parseInt(self.$count.html()) + 1);
					self.$tf.setText("").focus();
				}, function() {
					self.posting = false;
					self.error('服务器错误，发送失败');
					self.error(false, 1000);
				});
			},
			mmPage : function(e) {
				var self = state.detail;
				var elem = e.target, page = elem.getAttribute('data-page');
				while (elem != e.currentTarget && !page) {
					elem = elem.parentNode;
					page = elem.getAttribute('data-page');
				}
				if (page) {
					page = self.$page.showPage(page);
					if (typeof page == "number")
						self.loadPage(page - 1);
				}
			}

		}
	};

	var xp = location.hash.match(/pp=([^&]*)/i), page = location.hash.match(/page=(\d+)/i);
	page = page ? parseInt(page[1]) : 0;
	if (xp) {
		xp = xp[1];
		var pp = Base64.decode(xp);
		util.ajax.postJSON('/api/accountinfo.htm', {
			xp : xp
		}, function(ret) {
			if (!ret[xp]) {
				$dialog.error("未找到该用户");
				state.general.init();
				return;
			}
			ret[xp].pp = pp;
			(accounts[pp] = ret[xp]).xpt = xp;
			state.detail.init(pp, page);
		});
	} else {
		state.general.init(page);
	}

	define("plugins::hijacker::whisper.delete", function(e) {
		var mid = util.getParentByClassName(e.actionTarget, "hijackdata").getAttribute("data-mid");
		$dialog.confirm({
			content : '您真的要删除这条消息吗？',
			onConfirm : proceed
		});
		function proceed() {
			util.ajax.jsonp(defaults.prefix + util.toQueryString({
				type : 'deleteMsg',
				mode : 1,
				mid : mid
			}), function(ret) {
				if (!ret.status) {
					$dialog.error(ret.msg);
					return;
				}
				if (state.current == "general") {
					state.general.loadPage(0);
				} else {
					state.detail.$list.find('>div[data-mid=' + mid + ']').remove();
				}
			});
		}

	});
	define("plugins::hijacker::whisper.deleteAll", function(e) {
		var target = state.current == "general" ? e.actionTarget.getAttribute("data-pp") || "all" : state.detail.peer;
		$dialog.confirm({
			content : "真的要"
			+ (target === "all" ? '删除与<b>所有好友</b>的消息' : "删除与<b>"
			+ (typeof target == "string" ? e.actionTarget.title.substr(3, e.actionTarget.title.length - 8) : target.title)
			+ "</b>的所有消息") + "吗？<br /><span style=\"color:#F69;float:left;margin-top:4px;font-size:13px\">被删除后将无法恢复！</span>",
			onConfirm : proceed,
			labConfirm : "删除"
		});
		function proceed() {
			util.ajax.jsonp(defaults.prefix + util.toQueryString({
				type : 'deleteMsg',
				mode : target === "all" ? 3 : 2,
				friend : target === "all" ? "" : defaults.productid + "|" + (typeof target == "string" ? target : target.pp)
			}), function(ret) {
				if (!ret.status) {
					$dialog.error(ret.msg);
					return;
				}
				if (target === "all") {
					state.general.loadPage(0);
				} else {
					state.general.init();
				}
				$dialog.success("删除成功");
			});
		}
	});
	define("plugins::hijacker::whisper.send", function(e) {
		whisper({
			nick : e.actionTarget.getAttribute("data-nick"),
			onSuccess : state.general.onSent
		});
	});

	function filter(msg) {
		var content = msg.message;
		msg.filtered_content = stringUtil.filter_emote((msg.iscuted = stringUtil.gbLength(content) > 30) ? stringUtil.safeCut(
		content, 28)
		+ "..." : content);
	}
});

window.jQuery && jQuery.iCard && new jQuery.iCard({
	bindElement : '.app-wraper'
});