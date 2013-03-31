require('core::util::jQuery', 'core::timeUtil', 'core::util[ajax,beLogin,cookie,fx]', 'core::ui::TextBox', 'core::ui::Page', 'app::feed::common', 'app::discuss::template', 'core::stringUtil',
'core::ui::dialog[success,error]', 'plugins::hijacker', 'plugins::at', function($, timeUtil, util, TextBox, Page, COMMON, DISCUSS, stringUtil, $dialog, hijacker, $at) {
	var defaults = {
		listURL : '/a/app/discuss/indexList.htm?_input_encode=UTF-8&_output_encode=UTF-8',
		saveURL : '/a/app/discuss/save.htm',
		chars : 300,
		pagesize : 10,
		showDelete : true,
		otherDomain : document.domain == 'pub.i.sohu.com'
	};

	/**
	 * class Discuss extends $.fn.init implements PageHandler, EmoteHandler
	 * 
	 * @param {object}
	 *            options
	 * @return {Discuss}
	 */
	function Discuss(options) {
		load('/d/common-remark.css');
		options = util.probe(defaults, options);
		options.dom.discuss = this;
		this.length = 1;
		this[0] = util.parseHTML(DISCUSS.layout(options, COMMON))[0];
		this[0].wrapped = this;
		options.dom.appendChild(this[0]);
		this.$ul = this.find('ul');
		this.$msg = this.find('.show-total');
		this.$btn = this.find('.btn-submit .ui-btn');
		this.numLen = this.find('.txt-number-now');
		this.tf = new TextBox(this.find('textarea')[0]);
		$at.init.apply(this.tf);
		hijacker.hijackthis(this);
		var self = this;
		this.init(options);
		this.emoteContext = {
			target : self.find('div.emotion-list'),
			editor : self.tf,
			arrowLeft : 100
		};
		this.data('EmoteHandler', {
			getEmoteContext : function() {
				return self.emoteContext;
			},
			// @implement EmoteHandler
			onEmote : function(emote) {
				var $btn = self.find('span.btn-emot');
				var left, top;

				var parent = self[0].offsetParent, current = $btn[0];
				while (parent) {
					var style = parent.currentStyle || document.defaultView.getComputedStyle(parent, null);
					if (style.position != "static")
						break;
					parent = parent.offsetParent;
				}
				left = 0;
				top = 0;
				while (current && current != parent) {
					left += current.offsetLeft;
					top += current.offsetTop;
					current = current.offsetParent;
				}

				emote.css({
					left : left - 98 + "px",
					top : top + 14 + "px"
				});
				self.tf.focus();
			}
		});
	}

	Discuss.prototype = Discuss.funs = new $.fn.init();
	util.probe({
		init : function(options) {
			var self = this;
			// init fields
			this.tf.onChange = function(value) {
				var len = stringUtil.gbLength(value);
				self.numLen.html(len + "/" + options.chars).css('color', len > options.chars ? '#c43737' : '');
			};
			this.options && this.options.reply && (this.options.reply = null);
			options = this.options = util.probe(this.options, options);
			(options.reply || options.autoFocus) && this.tf.setText(options.reply ? '回复@' + options.reply.unick + '：' : '').moveTo(-1);
			this.params = {
				page : options.page || 1,
				sz : options.pagesize || 10,
				ids : [ options.appId, options.parentid, options.appId == 'photo' ? 7 : options.appId == 'album' ? 8 : 0, options.xpt ].join('_')
			};
			options.load && this.load();
			this.tf.onSend = function() {
				self.post();
			};
			options.extra && options.extra.apply(this);
		},
		push : function(arr) {
			var isMine = this.options.xpt === util.cookie.xpt;
			if (arr) {
				!$.isArray(arr) && (arr = [ arr ]);
				timeUtil.setServerTime();
				for ( var i = 0, L = arr.length, htms = []; i < L; i++) {
					var arrn = arr[i];
					arrn.xpt = arrn.passport;
					arrn.time_ago = timeUtil.get_timeago(arrn.createtime);
					arrn.content = stringUtil.filter_all(arrn.content.replace(/<br\s*\/?>/ig, ""));
					arrn.showDelete = this.options.showDelete && (isMine || (arrn.xpt || arrn.passport) === util.cookie.xpt);
					htms.push(DISCUSS.content(arrn, COMMON));
				}
				htms = htms.join('');
			} else
				var htms = '';
			if (this.$ul[0].hasChild && /replaceme/.test(this.$ul[0].children[0].className))
				this.$ul.html(htms);
			else
				this.$ul.html(htms + this.$ul.html());
			if (this.$msg.noDiscuss) {
				this.$msg.html('').hide().noDiscuss = false;
			}
		},
		load : function(param) {
			var self = this;
			param = util.probe(this.params, param);
			this.page || this.$msg.show().html('评论加载中');
			this.requesting && this.requesting.abort();
			if (this.options.isSComment) {
				var rep = "reply_" + this.options.replyid;
				var js = loadScript('http://comment4.news.sohu.com/dynamic/cmt_' + rep + '.json', function(data) {
					self.requesting = false;
					var chars = {
						amp : '&',
						lt : '<',
						gt : '>',
						quot : '"',
						"#039" : '\'',
						'#040' : '(',
						'#041' : ')',
						'#064' : '@'
					};
					if (!data) {
						onload({
							commentcount : 0
						});
						return;
					}
					for ( var n = 0, L = data.replies.length, discusses = new Array(L); n < L; n++) {
						var replyn = data.replies[n];
						var contentn = unescape(replyn.content);
						contentn = contentn.replace(/&(amp|lt|gt|quot|#039|#040|#041|#064);/g, function(match, rep) {
							return chars[rep];
						}).replace(/<br>/g, '\r\n');
						if (stringUtil.gbLength(contentn) > defaults.chars) {
							contentn = stringUtil.gbCut(contentn, defaults.chars) + "...";
						}
						discusses[n] = {
							content : contentn,
							passport : Base64.encode(unescape(replyn.passport)),
							id : replyn.replyId,
							createtime : replyn.createTime,
							unick : unescape(replyn.nickname),
							uavatar : unescape(replyn.authorimg),
							ulink : unescape(replyn.mylinks)
						};
					}
					onload({
						commentcount : data.totalNumber,
						comments : discusses,
						url : '/p/' + self.options.xpt + '/scomment/person/single/' + self.options.replyid + '/'
					});

					function unescape(s) {
						return JSON.parse('"' + s.replace(/%u([0-9a-z]{4})/ig, '\\u$1').replace(/%([0-9a-z]{2})/ig, '\\u00$1') + '"');
					}

				}, true, rep);
				this.requesting = {
					js : js,
					abort : function() {
						this.js.parentNode && js.parentNode.removeChild(this.js);
					}
				};
			} else {
				this.requesting = (this.options.otherDomain ? util.ajax.jsonp : util.ajax.getJSON)((this.options.otherDomain ? 'http://i.sohu.com' : '') + this.options.listURL + '&'
				+ util.toQueryString(param), function(obj) {
					self.requesting = false;
					onload(obj[param.ids] || {
						code : 1,
						msg : '没有找到条目'
					});
				});
			}
			function onload(ret) {
				self.$ul.html('');
				if (ret.code) {
					self.$msg.html(ret.msg);
					return;
				}
				self.options.onSuccess && self.options.onSuccess(ret);
				self.push(ret.comments);
				if (ret.commentcount > self.options.pagesize) {
					if (self.options.load.all) {
						self.$msg.html(DISCUSS.show_total({
							link : ret.url,
							count : ret.commentcount - 10
						}));
					} else if (self.options.load.page) {
						var pages = ret.commentcount ? Math.ceil(ret.commentcount / param.sz) : 1;
						var $page = self.page;
						if (!$page) {
							self.page = $page = new Page(pages);
							$page.handler = self;
							self.data('page', $page);
							$page.appendTo(self.$msg.html(''));
						} else if (pages != $page.pages)
							$page.setPages(pages);
						$page.showPage(param.page);
					}
				} else if (!ret.commentcount) {
					self.$msg.html('暂时没有评论').noDiscuss = true;
				} else if (!ret.comments || !ret.comments.length) {// 翻页到此
					self.$ul.html(DISCUSS.no_more);
				} else {
					self.$msg.hide();
				}
			}

		},
		// @implement PageHandler
		setPage : function(page) {
			this.params.page = page;
			if (this.options.auto_scroll) {
				var feedTop = this.position().top - 30;
				if (feedTop < util.wndTop())
					window.scrollTo(0, feedTop);
			}
			this.load();
		},
		post : function() {
			if (this.posting || util.beLogin())
				return;
			var self = this, options = this.options;
			var content = this.tf.getText();
			if (content == "" || stringUtil.gbLength(content) > options.chars) {
				self.tf.focus();
				self.numLen.html(content ? "内容过长" : "想说点什么？").css('color', '#c43737');
				util.fx.highlight(self.tf, function() {
					this.onChange(this.getText());
				});
				return;
			}

			if (this.options.isSComment) {// 我来说两句
				var param = {
					topicId : options.parentid,
					content : content,
					replyToId : options.reply ? options.reply.id : options.replyid,
					from : 2,
					urlBack : ''
				};
				this.tf.setText('');
				$dialog.success('评论已提交，正在审核中，请耐心等待。');
				options.reply = null;
				util.ajax.postForm('http://comment4.news.sohu.com/post/comment/', param);
				return;
			}
			var inputs = this.find('input');
			var param = {
				type : 0,
				discusstype : (inputs[0] && inputs[0].checked ? 1 : 0) + ((inputs[1] && inputs[1].checked) ? 2 : 0),
				appid : options.appId,
				itemid : options.parentid,
				content : content
			};

			if (options.isForward) {
				param.originalid = options.originalid;
			}
			if (options.replytoid) {
				param.replytocommentid = options.replytoid;
				param.replytopassport = options.replytopp;
			}
			var appId = options.appId;

			if (appId === "album" || appId === "photo" || appId == "video" || appId == "sentence") {
				param.orixpt = options.xpt;
				if (appId == 'photo') {
					param.type = 7;
				}
				if (appId == 'album') {
					param.type = 8;
					var parentid = options.$data.attr('data-itemids');
					if (parentid) {
						param.parentid = parentid;
					}
				}
			}
			if (options.reply) {
				param.replytodiscussid = options.reply.id;
				param.replytopassport = options.reply.xpt;
				options.reply = null;
			}
			if (options.otherDomain) {// 广场页等其他域
				self.tf.setText('').focus();
				self.options.noPush || self.push({
					content : content,
					unick : util.cookie.unick,
					ulink : util.cookie.ulink,
					uavatar : util.cookie.photo,
					createtime : timeUtil.setServerTime()
				});
				util.ajax.postForm('http://i.sohu.com/' + options.saveURL + "?_input_encode=GBK", param);
			} else {
				this.setPosting(true);
				util.ajax.postJSON(options.saveURL + "?_input_encode=UTF-8", param, function(ret) {
					self.setPosting(false);
					if (ret.code == 0) {
						self.tf.setText('').focus();
						if (ret.comment) {
							self.options.noPush || self.push(ret.comment);
							if (options.onSuccess) {
								(param.discusstype & 1) && (ret.comment.spreadcount = undefined);
								options.onSuccess(ret.comment);
							}
						}
					} else if (ret.code == 4) {
						$dialog.error('请不要发表含有不适当内容的评论 。');
					} else {
						$dialog.error('保存评论失败：' + ret.msg);
					}
				}, function() {// onError
					self.setPosting(false);
					$dialog.error('保存评论失败，请稍后重试');
				});
			}
		},
		setPosting : function(posting) {
			this.posting = posting;
			this.$btn.attr('action', posting ? '' : 'app::discuss::discuss.post')[posting ? "addClass" : "removeClass"]('ui-btn-disabled');
		},
		destroy : function() {
			this.requesting && this.requesting.abort();
			hijacker.free(this);
			$at.destroy.apply(this.tf);
			this.tf.destroy();
			this.options.dom.removeChild(this[0]);
			this.options.dom.discuss = null;
		},
		replyto : function(reply) {
			this.options.reply = reply;
			var text = this.tf.getText();
			text = text.replace(/^((?:回复@.*?：)*)/, "回复@" + reply.unick + "：");
			this.tf.setText(text).moveTo(text.length);
			var pos = this.position().top;
			util.wndTop() - pos > -24 && window.scrollTo(0, pos - 24);
		},
		focus : function() {
			var pos = this.tf.offset();
			this.tf.focus();
			$(document).scrollTop(pos.top + 500);
		}
	}, Discuss.funs);
	// hijackers

	define('app::discuss', Discuss);

});

require("core::util[beLogin]", "app::discuss", 'core::util::jQuery', function(util, Discuss, $) {
	define('app::discuss::discuss', function(e) {
		if (util.beLogin())
			return;
		var options = getDiscussOption(e.actionTarget, {
			load : {
				all : true,
				page : false
			},
			autoFocus : true
		});
		if (!options) {
			return;
		}
		new Discuss(options);
	});
	define('plugins::hijacker::baby.comment', function(e) {
		if (util.beLogin())
			return;
		var options = getDiscussOption(e.actionTarget, {
			load : {
				page : true
			},
			autoFocus : true
		});
		if (!options) {
			return;
		}
		new Discuss(options);
	});
	define('plugins::hijacker::comment.show', function(e) {
		var options = {
			load : {
				all : false,
				page : true
			},
			focus : false,
			pagesize : 20,
			xpt : $space_config._xpt
		};
		if (e.onSuccess) {
			options.onSuccess = e.onSuccess;
		}
		options = getDiscussOption(e.actionTarget, options);
		if (!options) {
			return;
		}
		new Discuss(options);
	});

	define('app::discuss::discuss.replyto', function(e) {
		var dom;
		if (util.beLogin() || !(dom = util.getParentByClassName(e.actionTarget, "hijackdata")))
			return;
		var $data = $(dom);
		util.getParentByClassName(dom, 'comment-box').wrapped.replyto({
			xpt : $data.attr('data-xpt'),
			unick : $data.attr('data-nick'),
			id : $data.attr('data-replytodiscussid')
		});
	});
	define('app::discuss::discuss.post', function(e) {
		if (util.beLogin())
			return;
		util.getParentByClassName(e.actionTarget, 'comment-box').wrapped.post();
	});
	function getDiscussOption(elem, options) {
		var dom = util.getParentByClassName(elem, "hijackdata"), box = dom;
		var query = dom && dom.getAttribute('comment-box');
		query && (box = $(query)[0]);
		if (!box)
			return;
		if (box.discuss) {
			box.discuss.destroy();
			box.discuss = null;
			return;
		}
		var $data = $(dom);
		options = util.probe({
			$data : $data,
			elem : elem,
			usericon : util.cookie,
			appId : $data.attr('data-appid') || $data.attr('data-from') || $space_config._currentApp,
			xpt : $data.attr('data-xpt'),
			parentid : $data.attr('data-itemid'),
			type : $data.attr('data-type'),
			dom : box,
			onSuccess : function(cmt) {
				if (!cmt)
					return;
				var as = this.elem.parentNode.children;
				for ( var n = 0, L = as.length; n < L; n++) {
					var an = as[n].getAttribute("action");
					if (!an)
						continue;
					if (/forward/.test(an))
						util.refreshCount(as[n], cmt.spreadcount);
					else if (/comment|discuss/.test(an))
						util.refreshCount(as[n], cmt.commentcount);
				}
			}
		}, options);
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
		} 
		// else if ($data.attr('data-from') === 'tblog') {
			// options.appId = 'tblog';
		// } 
		else if (options.isSComment) {
			options.showDelete = false;
			options.ulink = $data.attr('data-ulink');
			options.replyid = $data.attr('data-replyid');
			options.hideFwd = true;
		} else if (options.appId === 'baby') {
			options.hideFwd = true;
		}
		options.auto_scroll = options.appId != 'baby';
		return options;
	}
});