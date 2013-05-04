loadResource('/mysohu/forward/d/forward.css');
require(
	'core::util[cookie,ajax,fx,beLogin,channel]', 
	'core::stringUtil', 
	'core::util::jQuery', 
	'core::ui::TextBox',
	'app::widgets::template', 
	'app::feed::common', 
	'core::ui::dialog[success,error]', 
	'plugins::at', 
	'plugins::hijacker', 
	function(util, stringUtil, $, TextBox, PLUGINS, COMMON, $dialog, $at, hijacker) {

	var defaults = {
		dialogTitle : '转发到我的搜狐', // 对话框标题
		chars : 300, // 可输入中文字数
		api : '/a/app/mblog/spread.htm?_input_encode=UTF-8', // api
		otherDomain : document.domain == 'pub.i.sohu.com'
	};
	/**
	 * class Forward extends jQuery.fn.init implements EmoteHandler
	 */
	function Forward(options) {
		this.init(util.probe(defaults, options));
	}
	util.probe({
		'init' : function(options) {
			this.options = options;
			var self = this;

			var send = function() {
				self.post();
				return false;
			};
			this.$dlg = $dialog({
				title : options.dialogTitle,
				btns : [ "accept", "cancel" ],
				defaultBtn : "cancel",
				contentWidth : 498,
				labAccept : "转发",
				content : PLUGINS.forward(options, COMMON),
				onBeforeAccept : send,
				onClose : function() {
					self.destroy();
				}
			});
			this[0] = this.$dlg.find('.forward-box')[0];
			this.length = 1;
			this.$btn = this.$dlg.find('.dialog-button-accept');
			this.data('EmoteHandler', {
				// @implement EmoteHandler
				getEmoteContext : function() {
					return {
						target : self.find('div.emotion-list'),
						editor : self.tf,
						arrowLeft : 170
					};
				},
				onEmote : function(emote) {
					emote.css({
						marginLeft : '-170px',
						marginTop : '12px'
					});
					self.tf.focus();
				}
			});

			this.tf = new TextBox($('textarea', this)[0]);
			$at.init.apply(this.tf);
			this.numLen = $('.forwoard-tip-txt', this);
			this.tf.onChange = function(value) {
				var len = stringUtil.gbLength(value);
				self.numLen.html((len > options.chars ? '<span style="color:#AA0000">' + len + '</span>' : len) + " / "
				+ options.chars);
			};
			this.tf.setText(stringUtil.filter_sname(options.origin.title ? ' //@' + options.origin.usname + '：' + options.origin.title : '')).moveTo(0);// TODO
			this.tf.onSend = send;
			hijacker.hijackthis(this);
		},
		'post' : function() {
			if (this.posting || util.beLogin())
				return;
			var self = this, options = this.options;
			var inputs = $('input[type="checkbox"]', this);
			var param = {
				appid : options.appId,
				itemid : options.itemid,
				committype : (inputs[0].checked ? 1 : 0) + (inputs[1] && inputs[1].checked ? 2 : 0),
				content : this.tf.getText(),
				parentpass : options.xpt
			};
			if (stringUtil.gbLength(param.content) > options.chars) {
				self.tf.focus();
				self.numLen.html('<span style="color:#AA0000">内容过长</span>');
				util.fx.highlight(self.tf, function() {
					this.onChange(this.getText());
				});
				return;
			}
			if (param.content.length === 0)
				param.content = "转发微博";
			if (options.operatortype == 4) {// 对转发进行转发，提供originalid
				param.oriappid = options.data.appId;
				param.oriid = options.data.id;
				param.oriitemid = options.data.itemid;
			}
			(options.data.album || options.data.photo || options.data.video) && (param.orixpt = options.xpt);
			this.setPosting(true);
			if (options.otherDomain) {
				self.$dlg.close();
				$dialog.success('转发成功');
				util.ajax.postForm('http://i.sohu.com' + options.api, param);
			} else {
				util.ajax.postJSON(options.api, param, function(ret) {// onsuccess
					self.setPosting(false);
					if (ret.code == 0) {
						self.$dlg.close();
						$dialog.success("转发成功");
						if (options.elem && options.operatortype !== 4) {
							var ori = ret.sentence.originfo;
							var as = options.elem.as || options.elem.parentNode.children;
							for ( var L = as.length, n = 0; n < L; n++) {
								var an = as[n].getAttribute("action");
								if (an == "junction")
									an = as[n].getAttribute("jTarget");
								if (!an)
									continue;
								if (/forward/.test(an))
									util.refreshCount(as[n], ori.spreadcount);
								else if (/comment|discuss/.test(an))
									util.refreshCount(as[n], ori.commentcount);
							}
						}
						util.channel.broadcast('feed', 'push', ret.sentence);
					} else if (ret.code == 4) {
						$dialog.error('请不要发表含有不适当内容的言论 。');

					} else {
						$dialog.error("转发失败：" + ret.msg);
					}
				}, function() { // onerror
					$dialog.error("转发失败，请稍后再试");
					self.setPosting(false);
				});
				return false;
			}
		},
		setPosting : function(bool) {
			this.posting = bool;
			this.$btn[bool ? "addClass" : "removeClass"]("disabled");
		},
		destroy : function() {
			$at.destroy.apply(this.tf);
			hijacker.free(this);
			this[0] = null;
			this.length = 0;
		}
	}, Forward.prototype = new $.fn.init());

	define('plugins::hijacker::Forward', Forward);
	function setType(options, from, tblog) {
		if (!from)
			from = options.data.appId || 'sentence';
		if (tblog || from == 'forward')
			from = 'sentence';
		options.data[from] = true;

		if (options.data.title) {
			options.data.filtered_title = stringUtil.filter_all(stringUtil.safeCut(options.data.title, 140), tblog);
			options.data.title = stringUtil.filter_lt(options.data.title);
		}
		if (options.data.content) {
			options.data.filtered_content = stringUtil.filter_all(options.data.content, tblog);
			options.data.content = stringUtil.filter_lt(options.data.content);
		}
	}
	define('plugins::hijacker::ori_forward', function(e) {
		if (util.beLogin())
			return;
		var dom = util.getParentByClassName(e.actionTarget, "hijackdata");
		if (!dom)
			return;
		var $data = $(dom);
		var options = {
			elem : e.actionTarget,
			usericon : util.cookie,
			operatortype : 3,
			xpt : $data.attr('data-xpt'),
			origin : {
				unick : $data.attr('data-oriunick'),
				usname : $data.attr('data-oriusname')
			},
			data : {
				appId : $data.attr('data-oriappid'),
				ulink : $data.attr('data-oriulink'),
				unick : $data.attr('data-oriunick'),
				url : $data.attr('data-oriurl'),
				title : $data.attr('data-orititle'),
				content : $data.attr('data-oricontent'),
				itemid : $data.attr('data-oriitemid'),
				tblog : $data.attr('data-oriappid') == "tblog"
			}
		};
		options.appId = options.data.appId;
		options.itemid = options.data.itemid;
		setType(options, options.data.appId, options.data.tblog);
		new Forward(options);
	});
	define('plugins::hijacker::forward', function(e) {
		if (util.beLogin())
			return;
		var dom = util.getParentByClassName(e.actionTarget, "hijackdata");
		if (!dom)
			return;
		var $data = $(dom);
		var options = {
			elem : e.actionTarget,
			usericon : util.cookie,
			appId : $data.attr('data-appid') || $space_config._currentApp,
			itemid : $data.attr('data-itemid'),
			from : $data.attr('data-from'),
			xpt : $data.attr('data-xpt'),
			origin : {
				unick : $data.attr('data-unick'),
				usname : $data.attr('data-usname')
			}
		};
		if (options.from === "forward") {// 对转发进行转发
			options.operatortype = 4;
			options.isForward = true;

			options.origin.title = $data.attr('data-title');
			options.data = {
				id : $data.attr('data-oriid'),
				appId : $data.attr('data-oriappid'),
				ulink : $data.attr('data-oriulink'),
				unick : $data.attr('data-oriunick'),
				url : $data.attr('data-oriurl'),
				title : $data.attr('data-orititle'),
				content : $data.attr('data-oricontent'),
				itemid : $data.attr('data-oriitemid'),
				tblog : $data.attr('data-oriappid') == "tblog"
			};
			options.data.appId !== 'qingsohu' && (options.origin.fwd = {
				unick : $data.attr('data-oriunick'),
				usname : $data.attr('data-oriusname')
			});
			setType(options, $data.attr('data-orifrom'), options.data.tblog);
		} else {
			options.operatortype = 3;
			options.data = {
				appId : options.appId,
				ulink : $data.attr('data-ulink'),
				unick : $data.attr('data-unick'),
				url : $data.attr('data-link'),
				title : $data.attr('data-title'),
				content : $data.attr('data-content')
			};
			var itemids = $data.attr('data-itemids');
			if (options.appId == 'album' && itemids) {
				options.appId = 'photos';
				options.albumid = options.itemid;
				options.itemid = itemids;
			}
			setType(options, options.appId, $data.attr('data-from') === "tblog" || options.appId === "tblog");
		}
		new Forward(options);
	});
});
