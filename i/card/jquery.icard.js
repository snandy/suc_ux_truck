/*
 *	用户名片 空间版本
 *  @author bobotieyang@sohu-inc.com
 *  
 */
;
(function($, ms) {
	// data-card-type:isohu 空间样式

	if ($.iCard) {
		return;
	}
	var win = window;

	var ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

	var GROUP_LIMIT = 20;// 可创建的分组
	var NEW_GROUP_TIP_TEXT = '请输入新分组名称';

	var replaceCJK = /[^\x00-\xff]/g, testCJK = /[^\x00-\xff]/;

	function cjkLength(strValue) {
		return strValue.replace(replaceCJK, "lv").length;
	}

	function isCjk(strValue) {
		return testCJK.test(strValue);
	}

	function cutCjkString(str, len, suffix, slen) {
		suffix = suffix || '';
		slen = slen || suffix.length;
		len -= slen;
		if (cjkLength(str) <= len) {
			return str;
		}
		var s = str.split(''), c = 0, tmpA = [];
		for ( var i = 0; i < s.length; i += 1) {
			if (c < len) {
				tmpA[tmpA.length] = s[i];
			}
			if (isCjk(s[i])) {
				c += 2;
			} else {
				c += 1;
			}
		}
		return tmpA.join('') + suffix;
	}

	function emptyContentAlert(a) {
		var b = [ 255, 200, 200 ];
		a.style.backgroundColor = "rgb(" + b[0] + "," + b[1] + "," + b[2] + ")";
		var c = setInterval(function() {
			b[1] += 10;
			b[2] += 10;
			if (b[1] > 255) {
				clearInterval(c);
			}
			a.style.backgroundColor = "rgb(" + b[0] + "," + b[1] + "," + b[2] + ")";
		}, 100);
	}

	// 用于mouseover和mouseout事件，判断触发事件的是否是包含在名片内
	function within(event, callback) {
		var $this = this;
		var parent = event.relatedTarget;
		var el = $this.get(0);
		try {
			while (parent && parent !== el) {
				parent = parent.parentNode;
			}
			if (parent !== el) {
				callback();
			}
		} catch (e) {
		}
	}
	// 是否登录检测
	function login() {
		if (!$.cookie("ppinf")){
			if(!$.ppDialog) {
				location.href="http://i.sohu.com";
			}else{
				$.ppDialog({
					appId : '1019',
					regRedirectUrl : location.href,
					title : '想要查看更多精彩内容，马上登录吧！',
					onLogin : function(userId) {
						location.reload();
					}
				});
			}
			return false;
		}
		return true;
	}

	var unFollowDialog = null;
	var unFollowDialogSliding = false;

	//取消跟随的确认框
	var UnfollowDlg = function(settings){
		var defaults = {
			onAccept : null,
			onCancel : null
		};
		this.opts = $.extend(defaults, settings);
		this.init();
	}

	UnfollowDlg.prototype = {
		init: function(){
			var self = this;
			this.$container = $('<div class="card-win-wrapper" style="z-index:520"></div>');
			var html = [
			'<div class="card-win-con">确定不再跟随？</div>',
			'<div class="card-win-btn">',
				'<a href="#" class="accept">确定</a>',
				'<a href="#" class="cancel">取消</a>',
			'</div>'
			].join('');
			this.$container.html(html).appendTo('body');
			
			this.$container.find('a.accept').bind('click',function(event){
				event.preventDefault();
				if($.isFunction(self.opts.onAccept) && self.opts.onAccept.call(self) === false){
					return false;
				}
				self.close();
			});

			this.$container.find('a.cancel').bind('click',function(event){
				event.preventDefault();
				if($.isFunction(self.opts.onCancel) && self.opts.onCancel.call(self) === false){
					return false;
				}
				self.close();
			});
		},
		dlg: function(){
			return this.$container;
		},
		close: function(){
			this.$container.hide();
		},
		destroy: function(){
			this.$container.find('a.accept,a.cancel').unbind('click');
			this.$container.remove();
		}
	};

	var instanceId = 0;
	var instanceList = [];// 缓存创建的卡片实例

	// 添加一个卡片实例，一个容器只能绑定一个卡片，后绑定的覆盖之前绑定的
	function addInstance(bindElement, instance) {
		var $ele = $(bindElement).eq(0);
		if ($ele.data('iCardInstance')) {
			$ele.data('iCardInstance').destroy();
		}
		$ele.data('iCardInstance', instance);
		for ( var i = 0, len = instanceList.length; i < len; i += 1) {
			if (instanceList[i][0] === $ele[0]) {
				break;
			}
		}
		if (i >= len) {
			instanceList[instanceList.length] = $ele;
		}
	}
	// 销毁一个容器上绑定的若干卡片
	function destroyInstance(bindElement) {
		var $ele = $(bindElement).eq(0);
		if ($ele.data('iCardInstance')) {
			$ele.data('iCardInstance').destroy();
		}
	}
	function hideAllInstance(currentInstance) {
		for ( var i = 0, len = instanceList.length; i < len; i += 1) {
			if (instanceList[i].data('iCardInstance') && instanceList[i].data('iCardInstance') !== currentInstance) {
				instanceList[i].data('iCardInstance').hide();
			}
		}
	}
	// 清理所有卡片实例的缓存
	function clearAllCache() {
		for ( var i = 0, len = instanceList.length; i < len; i += 1) {
			if (instanceList[i].data('iCardInstance')) {
				instanceList[i].data('iCardInstance').clearCache();
			}
		}
	}

	function getVisibleInstance() {
		for ( var i = 0, len = instanceList.length; i < len; i += 1) {
			var ins = instanceList[i].data('iCardInstance');
			if (ins && ins.isVisible()) {
				return ins;
			}
		}
		return null;
	}

	var iCard = function(options) {
		var defaults = {
			params : {},// 附加参数
			type : 'isohu',// 默认类型
			bindElement : '',// 绑定事件的容器 选择器字符串
			autoBindEvent : true,// 是否自动绑定mouseover和mouseout事件
			getcard : '/a/usercard/getcard.do',// 按xpt返回card
			getnickcard : '/a/usercard/getnickcard.do?_input_encode=UTF-8',// 按昵称返回card
			getsname : '',
			follow : '/a/app/friend/friend/add.do',// 添加跟随
			unFollow : '/a/app/friend/friend/delete.do',// 取消跟随
			getgroups : '/a/app/friend/group/getgroups.do',// 取分组信息
			createGroup : '/a/app/friend/group/add.do?_input_encode=UTF-8',// 新建分组
			mapping : '/a/app/friend/update/group/mapping.do',// 批量添加分组
			getDesc : '/a/app/friend/get/friend/desc.do',// 取得好友备注
			setDesc : '/a/app/friend/friend/update.do?_input_encode=UTF-8',// 修改备注
			maxHeight : 170,// 计算显示位置的高度
			ajaxDelay : 300,// 延迟500豪秒后请求
			fromType : 'usercard',// 添加关注来源
			side : 'auto',// 显示的位置，left , auto
			showInviteCheckbox: true,//分组框是否显示求跟随的复选框
			onCreateGroup : null,// 当创建了新分组
			onSetGroup : null,// 当设置了分组
			onCancelSetGroup : null,//当跳过了设置分组
			onFollow : null,// 当跟随
			onUnfollow : null,// 当取消跟随
			onSetDesc : null
		// 当设置备注
		};
		this.options = $.extend(defaults, options || {});
		if (this.options.bindElement != '' && !$(this.options.bindElement).length) {
			return;
		}
		// 第一次创建实例的时候绑定事件
		if (instanceId == 0) {
			$('body').bind('click.icard', function(event) {
				var ins = getVisibleInstance();
				if (ins && !$(event.target).closest('.card-box,.card-box-dialog').length) {
					ins.hide();
				}
			});
		}
		this.instanceId = 'iCardInstance' + (++instanceId);
		this.cache = {};
		this.xhr = null;// ajax请求对象
		this.ajaxTimeoutId = null;// ajax请求延迟
		this.timeoutID = null;
		this.init();
		this.bindEvent();
	}

	iCard.prototype = {
		init : function() {
			var self = this;
			var html = '<div class="jt-right"></div><div class="jt-top"></div><div class="jt-bottom"></div>';
			html += '<div class="card-con">';
			html += '</div>';
			this.container = $('<div class="card-box" id="' + this.instanceId + '"></div>');
			this.container.css({
				'position' : 'absolute',
				'zIndex' : '510'
			}).html(html).appendTo('body');
			this.container.hide();
			this.$fixmask = $('<div></div>').css({
				'position' : 'absolute',
				'opacity' : 0,
				'backgroundColor' : '#ffffff'
			}).appendTo(this.container);
			// 绑定事件
			this.container.bind('mouseenter.' + this.instanceId, function() {
				if (self.timeoutID) {
					clearTimeout(self.timeoutID);
				}
			}).bind('mouseleave.' + this.instanceId, function() {
				if (!unFollowDialog) {
					self.hide(0);
				}
			}).bind('click.' + this.instanceId, function(event) {
				var $target = $(event.target), xpt = self.container.data('xpt'), friendid = self.container.data('friendid'), groupids = self.container.data('groupids');
				// 取消跟随
				if ($target.closest('.card-unfollow').length) {
					event.preventDefault();
					self.unfollow(event);
				}
				// 跟随
				else if ($target.closest('.card-follow').length) {
					event.preventDefault();
					self.follow();
				}
				// 设置分组
				else if ($target.closest('.card-setgroup').length) {
					event.preventDefault();
					self.setGroup();
				}
				// 设置备注
				else if ($target.closest('.card-remark').length) {
					event.preventDefault();
					self.setDesc();
				}
				// atTA
				else if ($target.closest('.card-at').length) {
					event.preventDefault();
					self.atTA();
				}
				// 留言
				else if ($target.closest('.card-msg').length) {
					event.preventDefault();
					self.message();
				}
				//求跟随
				else if($target.closest('.card-invite').length){
					event.preventDefault();
					self.inviteFollow();
				}
				//短消息
				else if($target.closest('.card-whisper').length){
					event.preventDefault();
					self.whisper();
				}
			});
			if (ieBug) {
				this.iframe = $(
				'<iframe frameborder="0" tabindex="-1" src="about:blank" style="position:absolute;z-index:' + this.container.css('z-index')
				+ ';display:block;cursor:default;opacity:0;filter:alpha(opacity=0);"></iframe>').insertBefore(this.container).hide();
			}
			if (this.options.bindElement != '') {
				destroyInstance(this.options.bindElement);// 销毁之前在这个容器上绑定的名片，一个容器只能绑定一个名片
				addInstance(this.options.bindElement, this);
			} else {
				destroyInstance('body');
				addInstance('body', this);
			}
		},
		bindEvent : function() {
			var self = this, ele;
			if (this.options.bindElement != '') {
				ele = $(this.options.bindElement).eq(0);
			} else {
				ele = $('body');
			}
			if (this.options.autoBindEvent) {
				ele.delegate('[data-card]', 'mouseenter.' + this.instanceId, function(event) {
					self.show($(this), {});
				}).delegate('[data-card]', 'mouseleave.' + this.instanceId, function(event) {
					self.hide(1000);
				});

				/*
				 * ele.bind('mouseover.'+this.instanceId,function(event){ var
				 * $target = $(event.target);
				 * if($target.closest('[data-card]').length){ $target =
				 * $target.closest('[data-card]');
				 * within.call($target,event,function(){ self.show($target,{});
				 * }); } });
				 * 
				 * ele.bind('mouseout.'+this.instanceId,function(event){ var
				 * $target = $(event.target);
				 * if($target.closest('[data-card]').length){ $target =
				 * $target.closest('[data-card]');
				 * within.call($target,event,function(){ self.hide(1000); }); }
				 * });
				 */
			}
		},
		position : function($o) {
			var x, 
				y, 
				side = this.options.side,
				$win = $(win),
				ww = $win.width(),
				scrollTop = $win.scrollTop(), 
				toolbarHeight = 30, // 工具条高度
				offset = $o.offset(),
				cw = this.container.width(), 
				ch = this.container.height(), 
				jtR = this.container.find('.jt-right'), 
				jtT = this.container.find('.jt-top'), 
				jtB = this.container.find('.jt-bottom'), 
				param = this.getParam($o.attr('data-card-action')), 
				maxHeight = ch > this.options.maxHeight ? ch : this.options.maxHeight;
			
			if(this.container.outerWidth() + offset.left > ww){
				side = 'left';
			}
			
			if (side == 'left') {
				// 在左侧显示
				jtR.show();
				jtT.hide();
				jtB.hide();
				x = offset.left - cw - jtR.width();
				y = offset.top - jtR.position().top + $o.height() / 2 - jtR.height() / 2;
				this.$fixmask.css({
					top : 0,
					right : -10,
					left : 'auto',
					bottom : 'auto',
					width : 12,
					height : ch
				});
			} else if (offset.top - maxHeight - scrollTop - toolbarHeight - 2 >= 0) {
				// 上面
				x = offset.left;
				y = offset.top - ch - jtB.height() + 2;
				jtR.hide();
				jtT.hide();
				jtB.show();
				this.$fixmask.css({
					left : 0,
					right : 'auto',
					top : 'auto',
					width : cw,
					height : 12
				});
				if (ieBug) {
					this.$fixmask.css({
						top : this.container.outerHeight() - 8
					});
				} else {
					this.$fixmask.css({
						bottom : -10
					});
				}
			} else {
				// 下面
				x = offset.left;
				y = offset.top + $o.height() + jtT.height() - 2;
				jtR.hide();
				jtT.show();
				jtB.hide();
				this.$fixmask.css({
					top : -10,
					left : 0,
					right : 'auto',
					bottom : 'auto',
					width : cw,
					height : 12
				});
			}
			this.container.css({
				'top' : y,
				'left' : x
			});
			if (this.iframe) {
				this.iframe.css({
					top : this.container.css('top'),
					left : this.container.css('left'),
					width : this.container.outerWidth(),
					height : this.container.outerHeight()
				}).show();
			}
		},
		show : function($o, opts) {
			if (this.timeoutID) {
				clearTimeout(this.timeoutID);
			}
			if (this.ajaxTimeoutId) {
				clearTimeout(this.ajaxTimeoutId);
			}
			if (this.xhr) {
				this.xhr.abort();
				this.xhr = null;
			}
			var self = this, 
				flag = $o.attr('data-card'), 
				paramStr = $o.attr('data-card-action'), 
				type = $o.attr('data-card-type') || this.options.type;

			if (!$o.data('data-card-instanceId')) {
				$o.data('data-card-instanceId', this.instanceId);
			}
			if (type != 'isohu' || flag == 'false' || flag == false || unFollowDialogSliding || ($o.data('data-card-instanceId') != this.instanceId)) {
				return;
			}
			hideAllInstance(this);// 隐藏其他实例
			var url, side;
			var param = this.getParam(paramStr), cache = this.getCacheData(paramStr);
			if (this.options.ajaxDelay > 0) {
				this.ajaxTimeoutId = setTimeout(function() {
					if (cache) {
						self.setHTML(cache);
					} else {
						self.loadCard($o, opts);
					}
					self.container.data('paramStr', paramStr);// 存储当前显示的key
					self.container.show();
					self.position($o);
					self.destroyUnfollowDialog();
				}, this.options.ajaxDelay);
			} else {
				if (cache) {
					this.setHTML(cache);
				} else {
					this.loadCard($o, opts);
				}
				this.container.data('paramStr', paramStr);// 存储当前显示的key
				this.container.show();
				this.position($o);
				this.destroyUnfollowDialog();
			}
		},
		hide : function(time) {
			var self = this;
			if (!this.isVisible()) {
				if (this.ajaxTimeoutId) {
					clearTimeout(this.ajaxTimeoutId);
				}
				if (this.xhr) {
					this.xhr.abort();
					this.xhr = null;
				}
				return;
			}
			if (time > 0) {
				this.timeoutID = setTimeout(function() {
					self.container.hide();
					if (self.iframe) {
						self.iframe.hide();
					}
					self.destroyUnfollowDialog();
				}, time);
			} else {
				this.container.hide();
				if (this.iframe) {
					this.iframe.hide();
				}
				this.destroyUnfollowDialog();
			}

		},
		destroyUnfollowDialog : function() {
			if (unFollowDialog) {
				unFollowDialog.destroy();
				unFollowDialog = null;
				unFollowDialogSliding = false;
			}
		},
		loading : function() {
			this.setHTML('<div class="data-load"><div class="data-load-icon"></div>正在加载，请稍候...</div>');
		},
		loadCard : function($o, opts) {
			var self = this, paramStr = $o.attr('data-card-action'), url;
			var param = $.extend(this.getParam(paramStr), this.options.params);

			if (param['xpt']) {
				url = this.options.getcard;
			}
			else if (param['nick']) {
				url = this.options.getnickcard;
			}
			else if (param['sname']) {
				url = this.options.getsname;
			}
			else {
				this.setHTML('<div class="data-error">抱歉，该用户无法访问</div>');
				return;
			}
			param['_'] = (new Date()).getTime();
			this.loading();

			this.xhr = $.getJSON(url, param, function(data) {
				if (data.code == 0 && self.xhr) {
					self.setCacheData(paramStr, data.data);
					self.setHTML(data.data);
				} else {
					// do nothing
					self.setHTML('<div class="data-load">' + data.msg + '</div>');
				}
				self.position($o);
				self.xhr = null;
			});
		},
		getParam : function(param) {
			if(!param) return {};
			var ary = param.split('&');
			var obj = {}, index, key, value;
			for ( var i = 0; i < ary.length; i += 1) {
				index = ary[i].indexOf('=');
				key = ary[i].substring(0, index);
				value = ary[i].substring(index + 1);
				obj[key] = value;
			}
			return obj;
		},
		setCacheData : function(paramStr, data) {
			return this.cache[paramStr] = data;
		},
		getCacheData : function(paramStr) {
			if (this.cache[paramStr]) {
				return this.cache[paramStr];
			}
			return null;
		},
		setHTML : function(param) {
			var html;
			if ($.isPlainObject(param)) {
				html = param.view.replace(/(\r?\n)|\t/g, '');
				this.container.data('friendid', param.friendid || '');
				this.container.data('xpt', param.xpt || '');
				this.container.data('groupids', param.groupids || '');
				this.container.data('nick', param.nick || '');
			} else {
				html = param;
			}
			this.container.find('.card-con').html(html);
		},
		follow : function() {
			var self = this, 
				paramStr = this.container.data('paramStr'), 
				xpt = this.container.data('xpt'), 
				friendid = this.container.data('friendid'), 
				groupids = this.container.data('groupids');
				
			var param = $.extend(this.getParam(paramStr), this.options.params);

			if (!iCard.login()) {
				return;
			}
			$.get(this.options.follow, {
				'xpt' : xpt,
				'from_type' : this.options.fromType,
				'pageid' : param.pageid || ''
			}, function(results) {
				if (results.code == 1 || results.code == -2) {
					// @friendType : 1 双向好友 0 单向好友
					if (results.data.friendType == 1) {
						self.container.find('span.card-button-attention,span.card-button-attention-add').replaceWith(
						'<span class="card-button-attention-each-other"><em>互相跟随</em><a class="card-unfollow" href="#">取消</a></span>');
					} else {
						self.container.find('span.card-button-attention,span.card-button-attention-add').replaceWith(
						'<span class="card-button-attention-already"><em>已跟随</em><a class="card-unfollow" href="#">取消</a></span>');
					}
					clearAllCache();
					self.setCacheData(paramStr, null);
					self.container.data('friendid', results.data.friendId);
					self.container.data('groupids', '');
					self.followMode();
					self.setGroup('跟随成功' ,'跳过' ,self.options.showInviteCheckbox ? results.data.friendType : 1);
					if ($.isFunction(self.options.onFollow)) {
						self.options.onFollow({
							'xpt' : xpt,
							'friendid' : friendid,
							'friendType' : results.data.friendType
						});
					}
				} else {
					$.alert(results.msg);
				}
			}, 'json');
		},
		unfollow : function(event) {
			var self = this, 
				paramStr = this.container.data('paramStr'), 
				xpt = this.container.data('xpt'), 
				friendid = this.container.data('friendid'), 
				groupids = this.container.data('groupids');

			if (!iCard.login() || unFollowDialogSliding || (unFollowDialog && unFollowDialog.dlg().is(':visible'))) {
				return;
			}
			this.destroyUnfollowDialog();
			var $target = $(event.target).parent();
			var offset = $target.offset();
			var $dialog = new UnfollowDlg({
				onAccept : function() {
					$.get(self.options.unFollow, {
						'xpt' : xpt
					}, function(results) {
						if (results.code == 1) {
							// 取消成功
							// @friendType : 1 单向好友 2 没有关系
							if (results.data.friendType == 1) {
								self.container.find('span.card-button-attention-already,span.card-button-attention-each-other').replaceWith(
								'<span class="card-button-attention-add"><a class="card-follow" href="#">跟随</a></span>');
							} else {
								self.container.find('span.card-button-attention-already,span.card-button-attention-each-other').replaceWith(
								'<span class="card-button-attention"><a class="card-follow" href="#">跟随</a></span>');
							}
							clearAllCache();
							self.setCacheData(paramStr, null);
							self.unFollowMode();
							if ($.isFunction(self.options.onUnfollow)) {
								self.options.onUnfollow({
									'xpt' : xpt,
									'friendid' : friendid,
									'groupids' : groupids,
									'friendType' : results.data.friendType
								});
							}
						} else {
							$.alert(results.msg);
						}

					}, 'json');

					self.destroyUnfollowDialog();
					return false;
				},
				onCancel : function() {
					unFollowDialogSliding = true;
					this.dlg().hide('slide', {
						'direction' : 'down'
					}, function() {
						self.destroyUnfollowDialog();
					});
					return false;
				}
			});
			var topPx = offset.top - $dialog.dlg().outerHeight() - 2;
			var leftPx = offset.left + ($target.outerWidth() - $dialog.dlg().outerWidth()) / 2;
			var ww = $(win).width();
			if (topPx < 0) {
				topPx = 0;
			}
			if ((leftPx + $dialog.dlg().outerWidth()) > ww) {
				leftPx = ww - $dialog.dlg().outerWidth() - 10;
			}
			unFollowDialogSliding = true;
			unFollowDialog = $dialog;
			$dialog.dlg().css({
				top : topPx,
				left : leftPx
			}).show('slide', {
				'direction' : 'down'
			}, function() {
				unFollowDialogSliding = false;
			});
		},
		followMode : function() {
			this.container.find('.card-remark').parent().show();// 显示设置备注
			this.container.find('.card-setgroup').show();// 显示设置分组
		},
		unFollowMode : function() {
			this.container.find('.card-remark').parent().hide();// 隐藏设置备注
			this.container.find('.card-setgroup').hide();// 隐藏设置分组
		},
		setGroup : function(title, cbtnText, friendType) {
			var self = this, 
				paramStr = this.container.data('paramStr'), 
				xpt = this.container.data('xpt'), 
				friendid = this.container.data('friendid'), 
				groupids = this.container.data('groupids'),
				hasInvite = (friendType == 0 ? true : false);

			$.getJSON(this.options.getgroups, function(results) {
				if (results.code == 1) {
					self.showGroupWin(results.data.groups, title, cbtnText, hasInvite);
				}
			});
		},
		isInGroup : function(gid, groups) {
			if (groups == '') {
				return false;
			}
			groups += '';
			var ag = groups.split(',');
			for ( var i = 0; i < ag.length; i += 1) {
				if (ag[i] == gid) {
					return true;
				}
			}
			return false;
		},
		checkGroupName : function(gname) {
			var re = {
				pass : true,
				text : ''
			};
			if (gname == '' || gname == NEW_GROUP_TIP_TEXT) {
				re.pass = false;
				re.text = '请输入新分组名称';
				return re;
			}
			if (cjkLength(gname) > 16) {
				re.pass = false;
				re.text = '请不要超过16个字符';
				return re;
			}
			for ( var i = 0, len = this.groupsData.length; i < len; i += 1) {
				if (this.groupsData[i].groupName == gname || gname == '未分组') {
					re.pass = false;
					re.text = '此分组名已存在';
					return re;
				}
			}
			return re;
		},
		compareArray : function(aArray, bArray) {
			if (aArray.length != bArray.length) {
				return false;
			}
			function sortIt(a, b) {
				return parseInt(a, 10) - parseInt(b, 10);
			}
			aArray = aArray.sort(sortIt);
			bArray = bArray.sort(sortIt);

			if (aArray.join(',') == bArray.join(',')) {
				return true;
			}
			return false;
		},
		showGroupWin : function(data, title, cbtnText ,hasInvite) {
			var self = this, 
				paramStr = this.container.data('paramStr'), 
				xpt = this.container.data('xpt'), 
				friendid = this.container.data('friendid'), 
				groupids = this.container.data('groupids') || '',
				nick = this.container.data('nick');

			this.groupsData = data;

			var $content = $('<div class="card-win-clew" style="width:348px;"></div>');
			
			var randCkId = 'ci_'+(+new Date());

			var html = [
			'<div class="boxD">',
				'<h2>为"' + nick.replace(/&amp;/g, '&') + '"选择分组：</h2>',
				'<ul class="clearfix"></ul>',
				'<h3><a class="card-createGroup" href="#"><span class="card-icon-add"></span>创建分组</a></h3>',
				'<p style="display:none" class="card-createGroupBox clearfix"><input type="text" class="text-input"><input type="button" class="card-button-found-disabled" value="创建"><span class="cancel-found"><a href="#">取消</a></span><span class="input-clew">你最多可以输入16个字符</span></p>',
				hasInvite ? '<div class="card-invite-follow-bg"><label for="'+randCkId+'"><input id="'+randCkId+'" class="card-invite" type="checkbox" checked="checked" /><span>是否邀请TA与你互相跟随？</span></label></div>' : '',
			'</div>'
			];

			$content
			.html(html.join(''));

			var $ul = $content.find('ul'), i, len;
			for (i = 0, len = data.length; i < len; i += 1) {
				$ul.append('<li><label><input type="checkbox" value="' + data[i].groupId + '"' + (this.isInGroup(data[i].groupId, groupids) ? ' checked="checked"' : '') + ' />'
				+ data[i].groupName + '</label></li>');
			}
			var $dialog = $.dialog({
				className : 'jquery-btn-boxA',
				btns : [ 'accept', 'cancel' ],
				labAccept : '保存',
				labCancel : cbtnText || '取消',
				title : title || '设置分组',
				content : $content,
				fixed : true,
				modal : true,
				scrollIntoView : true,
				onBeforeAccept : function() {
					// 确认分组
					var oldGroups, ids = [];
					$ul.find(':checkbox:checked').each(function() {
						ids.push(this.value);
					});
					if (groupids == '') {
						oldGroups = [];
					} else {
						oldGroups = groupids.split(',');
					}
					if (!self.compareArray(oldGroups, ids)) {
						$.post(self.options.mapping, {
							'friendId' : friendid,
							'groupIds' : ids.join(',')
						}, function(results) {
							if (results.code == 0) {
								self.okAlert();
								if ($.isFunction(self.options.onSetGroup)) {
									self.options.onSetGroup({
										'xpt' : xpt,
										'friendid' : friendid,
										'groupids' : ids.join(','),
										'noGroupCount' : results.data.noGroupCount
									});
								}
							} else {
								self.errorAlert();
							}

						}, 'json');
						clearAllCache();
						self.setCacheData(paramStr, null);
					}else{
						//如果没有修改分组，则和按了取消一样处理
						if ($.isFunction(self.options.onCancelSetGroup)) {
							self.options.onCancelSetGroup({
								'xpt' : xpt
							});
						}
					}
					if($content.find('input.card-invite:checked').length){
						InviteFollowDialog.show({
							'xpt':xpt,
							'nick':nick,
							'fromType':'user_card'
						});
					}
				},
				onCancel : function() {
					// 跳过分组
					if ($.isFunction(self.options.onCancelSetGroup)) {
						self.options.onCancelSetGroup({
							'xpt' : xpt
						});
					}
				}
			});
			// 超过分组上限则隐藏
			if (len >= GROUP_LIMIT) {
				$content.find('.card-createGroup').parent().hide();
			}
			var $btn = $content.find('.card-createGroupBox :button');
			var $text = $content.find('.card-createGroupBox :text');
			var $err = $content.find('.input-clew');

			// 绑定事件

			$content.delegate('li', 'mouseenter', function() {
				$(this).addClass('now');
			}).delegate('li', 'mouseleave', function() {
				$(this).removeClass('now');
			}).click(function(event) {
				var $target = $(event.target);
				// 创建分组
				if ($target.closest('.card-createGroup').length) {
					event.preventDefault();
					$content.find('.card-createGroup').parent().hide();
					$content.find('.card-createGroupBox').show();
					$text.val('').focus();
					$dialog.adjust();
				}
				// 取消
				else if ($target.closest('.cancel-found').length) {
					event.preventDefault();
					$content.find('.card-createGroup').parent().show();
					$content.find('.card-createGroupBox').hide();
					$dialog.adjust();
				}
			});

			var _eventName_ = (function(){
				var evtname = '';
				if($.browser.msie){
					if(parseInt($.browser.version,10) > 8){
						evtname = 'input keyup';
					}else{
						evtname = 'propertychange';
					}
				}else{
					evtname = 'input';
				}
				return evtname;
			})();

			$text.bind(_eventName_, function() {
				if (this.value.length > 0) {
					$btn.removeClass().addClass('card-button-found');
				} else {
					$btn.removeClass().addClass('card-button-found-disabled');
				}
			});

			$btn.click(function() {
				if ($btn.hasClass('card-button-found-disabled')) {
					return;
				}
				var gname = $.trim($text.val());
				$text.val(gname);
				var re = self.checkGroupName(gname);
				if (re.pass) {
					$.post(self.options.createGroup, {
						'gname' : gname
					}, function(results) {
						if (results.code == 1) {
							// 创建分组成功
							self.groupsData[self.groupsData.length] = {
								'groupId' : results.data.gid,
								'groupName' : results.data.gname
							};
							$ul.append('<li><label><input type="checkbox" value="' + results.data.gid + '" checked="checked" />' + results.data.gname + '</label></li>');
							$content.find('.card-createGroup').parent().show();
							$content.find('.card-createGroupBox').hide();
							// 超过分组上限则隐藏
							if (self.groupsData.length >= GROUP_LIMIT) {
								$content.find('.card-createGroup').parent().hide();
							}
							$dialog.adjust();
							if ($.isFunction(self.options.onCreateGroup)) {
								self.options.onCreateGroup({
									'gid' : results.data.gid,
									'gname' : results.data.gname
								});
							}
						} else {
							$.alert(results.msg);
						}
					}, 'json');
					$err.removeClass('input-error').addClass('input-clew').html('你最多可以输入16个字符');
				} else {
					$text.focus();
					$err.removeClass().addClass('input-error').html(re.text);
				}
				// end
			}).hover(function() {
				if (!$btn.hasClass('card-button-found-disabled')) {
					$btn.removeClass().addClass('card-button-found-hover');
				}
			}, function() {
				if (!$btn.hasClass('card-button-found-disabled')) {
					$btn.removeClass().addClass('card-button-found');
				}
			}).mousedown(function() {
				if (!$btn.hasClass('card-button-found-disabled')) {
					$btn.removeClass().addClass('card-button-found-down');
				}
			}).mouseup(function() {
				if (!$btn.hasClass('card-button-found-disabled')) {
					$btn.removeClass().addClass('card-button-found-hover');
				}
			});
			// end
		},
		okAlert : function(msg) {
			$.inform({
				icon : 'icon-success',
				delay : 1000,
				easyClose : true,
				content : msg || "设置成功"
			});
		},
		errorAlert : function(msg) {
			$.inform({
				icon : 'icon-error',
				delay : 1000,
				easyClose : true,
				content : msg || '设置失败'
			});
		},
		// 设置备注
		setDesc : function() {
			var self = this, 
				paramStr = this.container.data('paramStr'), 
				xpt = this.container.data('xpt'), 
				friendid = this.container.data('friendid'), 
				groupids = this.container.data('groupids');

			$.getJSON(this.options.getDesc, {
				'friendid' : friendid
			}, function(results) {
				if (results.code == 0) {
					self.showDescWin(results.data.desc.replace(/&amp;/g, '&'));
				}
			});
		},
		showDescWin : function(desc) {
			var self = this, 
				paramStr = this.container.data('paramStr'), 
				xpt = this.container.data('xpt'), 
				friendid = this.container.data('friendid'), 
				groupids = this.container.data('groupids'), 
				nick = this.container.data('nick');

			var $content = $('<div class="card-win-clew" style="width:315px;"></div>');
			$content.html('<div class="boxC"><p>请输入备注名字，方便认出TA是谁</p><p class="clearfix"><input type="text" class="text-input" value="' + desc
			+ '"><br><span class="input-error" style="display:none">请不要超过16个字符</span></p>');

			var $dialog = $.dialog({
				className : 'jquery-btn-boxA',
				btns : [ 'accept', 'cancel' ],
				labAccept : '确定',
				labCancel : '取消',
				title : '设置备注名',
				content : $content,
				fixed : true,
				modal : true,
				scrollIntoView : true,
				onBeforeAccept : function() {
					// 保存备注
					var $text = $content.find(':text');
					var value = $.trim($text.val());
					$text.val(value);
					if (cjkLength(value) > 16) {
						$content.find('.input-error').html('请不要超过16个字符').show();
						$dialog.adjust();
						return false;
					} else {
						if (value != desc) {
							$.post(self.options.setDesc, {
								'friendid' : friendid,
								'desc' : value
							}, function(results) {
								if (results.code == 1) {
									clearAllCache();
									self.setCacheData(paramStr, null);
									if ($.isFunction(self.options.onSetDesc)) {
										self.options.onSetDesc({
											'xpt' : xpt,
											'friendid' : friendid,
											'desc' : results.data.desc
										});
									}
								} else {
									$.alert(results.msg);
								}
							}, 'json');
						}
					}
					// end
				}
			});
			$content.find(':text').focus().select();
		},
		// atTA
		atTA : function() {
			var self = this, nick = this.container.data('nick');
			require("app::widgets::atTA", function($at) {
				$at({
					'nick' : nick
				});
			});

		},
		// 留言
		message : function() {
			var self = this;
			if (!ms.tweet) {
				loadResource('/mysohu/tweet/msg_dlg.js').ready(function(){setTimeout(function(){self.message();},1000);});
				return;
			}
			var xpt = this.container.data('xpt'), nick = this.container.data('nick');
			ms.tweet.message_dialog({
				'receiverPassport' : xpt,
				'nick' : nick
			});
		},
		//求跟随
		inviteFollow : function(){
			var self = this, 
				xpt = this.container.data('xpt'), 
				nick = this.container.data('nick');
			InviteFollowDialog.show({
				'xpt':xpt,
				'nick':nick,
				'fromType':'user_card'
			});
		},
		//短消息
		whisper : function(){
			var nick = this.container.data('nick');
			require('app::whisper',function($whisper){$whisper({'nick':nick});});
		},
		isVisible : function() {
			return this.container.is(':visible');
		},
		// 外部接口
		clearCache : function() {
			this.cache = {};
		},
		destroy : function() {
			var self = this, ele;
			if (this.options.bindElement != '') {
				ele = $(this.options.bindElement).eq(0);
			} else {
				ele = $('body');
			}
			if (this.options.autoBindEvent) {
				ele.unbind('.' + this.instanceId).undelegate('.' + this.instanceId);
			}
			ele.removeData('iCardInstance');
			$('body').unbind('.' + this.instanceId);
			this.container.unbind('.' + this.instanceId);
			this.container.remove();
		}
	};

	// 加跟随后设置用户的分组，依赖iCard的一些方法，如果修改了iCard对应的方法要检查是否影响
	var SetGroupsDialog = {
		getgroups : '/a/app/friend/group/getgroups.do',// 取得分组信息
		createGroup : '/a/app/friend/group/add.do?_input_encode=UTF-8',// 新建分组
		mapping : '/a/app/friend/update/group/mapping.do',// 批量添加分组
		groupsData : null,// 分组信息
		isInGroup : iCard.prototype.isInGroup,// 使用iCard内的方法
		compareArray : iCard.prototype.compareArray,
		checkGroupName : iCard.prototype.checkGroupName,
		errorAlert : iCard.prototype.errorAlert,
		okAlert : iCard.prototype.okAlert,
		show : function(opts ,callback) {

			opts = opts || {};

			var self = this,
				friendid = opts.friendid,
				nick = opts.nick,
				friendType = opts.friendType,
				xpt = opts.xpt,
				hasInvite = (friendType == 0 ? true : false),
				ifFromType = opts.ifFromType || 'add_follow';//求跟随的来源

			this.callback = callback;

			$.getJSON(this.getgroups, function(results) {
				if (results.code == 1) {
					self.showGroupWin(results.data.groups, friendid , xpt, nick ,hasInvite ,ifFromType);
				}
			});
		},
		showGroupWin : function(data, friendid, xpt, nick ,hasInvite ,ifFromType) {
			var self = this;

			this.groupsData = data;

			var $content = $('<div class="card-win-clew" style="width:348px;"></div>');

			var randCkId = 'ci_'+(+new Date());

			var html = [
			'<div class="boxD">',
				'<h2>为"' + nick.replace(/&amp;/g, '&') + '"选择分组：</h2>',
				'<ul class="clearfix"></ul>',
				'<h3><a class="card-createGroup" href="#"><span class="card-icon-add"></span>创建分组</a></h3>',
				'<p style="display:none" class="card-createGroupBox clearfix"><input type="text" class="text-input"><input type="button" class="card-button-found-disabled" value="创建"><span class="cancel-found"><a href="#">取消</a></span><span class="input-clew">你最多可以输入16个字符</span></p>',
				hasInvite ? '<div class="card-invite-follow-bg"><label for="'+randCkId+'"><input id="'+randCkId+'" class="card-invite" type="checkbox" checked="checked" /><span>是否邀请TA与你互相跟随？</span></label></div>' : '',
			'</div>'
			];

			$content
			.html(html.join(''));

			var $ul = $content.find('ul'), i, len;
			for (i = 0, len = data.length; i < len; i += 1) {
				$ul.append('<li><label><input type="checkbox" value="' + data[i].groupId + '" />' + data[i].groupName + '</label></li>');
			}
			
			var $dialog = $.dialog({
				className : 'jquery-btn-boxA',
				btns : [ 'accept', 'cancel' ],
				labAccept : '保存',
				labCancel : '跳过',
				title : '跟随成功',
				content : $content,
				fixed : true,
				modal : true,
				scrollIntoView : true,
				onBeforeAccept : function() {
					// 确认分组
					var ids = [];
					$ul.find(':checkbox:checked').each(function() {
						ids.push(this.value);
					});

					$.post(self.mapping, {
						'friendId' : friendid,
						'groupIds' : ids.join(',')
					}, function(results) {
						if (results.code == 0) {
							self.okAlert();
						} else {
							self.errorAlert();
						}
					}, 'json');
					
					$.isFunction(self.callback) && self.callback();

					if($content.find('input.card-invite:checked').length){
						InviteFollowDialog.show({
							'xpt':xpt,
							'nick':nick,
							'fromType': ifFromType
						});
					}

				},
				onCancel : function() {
					// 跳过分组
					$.isFunction(self.callback) && self.callback();
				}
			});
			// 超过分组上限则隐藏
			if (len >= GROUP_LIMIT) {
				$content.find('.card-createGroup').parent().hide();
			}
			var $btn = $content.find('.card-createGroupBox :button');
			var $text = $content.find('.card-createGroupBox :text');
			var $err = $content.find('.input-clew');

			// 绑定事件
			$content.delegate('li', 'mouseenter', function() {
				$(this).addClass('now');
			}).delegate('li', 'mouseleave', function() {
				$(this).removeClass('now');
			}).click(function(event) {
				var $target = $(event.target);
				// 创建分组
				if ($target.closest('.card-createGroup').length) {
					event.preventDefault();
					$content.find('.card-createGroup').parent().hide();
					$content.find('.card-createGroupBox').show();
					$text.val('').focus();
					$dialog.adjust();
				}
				// 取消
				else if ($target.closest('.cancel-found').length) {
					event.preventDefault();
					$content.find('.card-createGroup').parent().show();
					$content.find('.card-createGroupBox').hide();
					$dialog.adjust();
				}
			});

			var _eventName_ = (function(){
				var evtname = '';
				if($.browser.msie){
					if(parseInt($.browser.version,10) > 8){
						evtname = 'input keyup';
					}else{
						evtname = 'propertychange';
					}
				}else{
					evtname = 'input';
				}
				return evtname;
			})();

			$text.bind(_eventName_, function() {
				if (this.value.length > 0) {
					$btn.removeClass().addClass('card-button-found');
				} else {
					$btn.removeClass().addClass('card-button-found-disabled');
				}
			});

			$btn.click(function() {
				if ($btn.hasClass('card-button-found-disabled')) {
					return;
				}
				var gname = $.trim($text.val());
				$text.val(gname);
				var re = self.checkGroupName(gname);
				if (re.pass) {
					$.post(self.createGroup, {
						'gname' : gname
					}, function(results) {
						if (results.code == 1) {
							// 创建分组成功
							self.groupsData[self.groupsData.length] = {
								'groupId' : results.data.gid,
								'groupName' : results.data.gname
							};
							$ul.append('<li><label><input type="checkbox" value="' + results.data.gid + '" checked="checked" />' + results.data.gname + '</label></li>');
							$content.find('.card-createGroup').parent().show();
							$content.find('.card-createGroupBox').hide();
							// 超过分组上限则隐藏
							if (self.groupsData.length >= GROUP_LIMIT) {
								$content.find('.card-createGroup').parent().hide();
							}
							$dialog.adjust();
						} else {
							$.alert(results.msg);
						}
					}, 'json');
					$err.removeClass('input-error').addClass('input-clew').html('你最多可以输入16个字符');
				} else {
					$text.focus();
					$err.removeClass().addClass('input-error').html(re.text);
				}
				// end
			}).hover(function() {
				if (!$btn.hasClass('card-button-found-disabled')) {
					$btn.removeClass().addClass('card-button-found-hover');
				}
			}, function() {
				if (!$btn.hasClass('card-button-found-disabled')) {
					$btn.removeClass().addClass('card-button-found');
				}
			}).mousedown(function() {
				if (!$btn.hasClass('card-button-found-disabled')) {
					$btn.removeClass().addClass('card-button-found-down');
				}
			}).mouseup(function() {
				if (!$btn.hasClass('card-button-found-disabled')) {
					$btn.removeClass().addClass('card-button-found-hover');
				}
			});
			// end
		}
	};

	//求跟随弹框
	var InviteFollowDialog = {
		show: function(opts,callback){
			opts = opts || {};
			callback = $.isFunction(callback)? callback : function(){}; 
			var self = this,
				xpt = opts.xpt;

			if(!xpt){
				return;
			}
			if(opts.noCheck){
				this.showDialog(opts,callback);
				return;
			}
			$.getJSON('/a/app/friend/quest/send/check.do',{'xpt':xpt},function(results){
				if(results.code == 0){
					if(results.data.isAllowFollow){
						opts.autoFollow = true;
					}
					self.showDialog(opts,callback);
				}else{
					$.inform({
						icon : 'icon-error',
						delay : 1000,
						easyClose : true,
						content : results.msg
					});
				}
			});
		},
		showDialog: function(opts,callback){
			opts = opts || {};
			callback = $.isFunction(callback)? callback : function(){}; 
			var self = this,
				maxLength = 200,
				textFollowed = 'Hi，我已跟随你啦，求互相跟随！',
				textNotFollow = 'Hi，很希望认识你，求互相跟随！',
				defText = textFollowed,
				xpt = opts.xpt,
				fromType = opts.fromType || '',//来源
				nick = opts.nick || 'TA',
				autoFollow = opts.autoFollow || false;//是否显示跟随他复选框
			
			if(autoFollow){
				defText = textNotFollow;
			}

			var $content = $('<div class="card-invite-follow-wrapper"></div>');

			var html = [
			'<div class="title">对TA说点什么：</div>',
			'<div class="textarea-wrapper">',
				'<textarea class="invite-textarea">'+defText+'</textarea>',
			'</div>',
			'<div class="card-invite-follow-bottom">',
				/*
				autoFollow ? '<div class="selector"><label><input type="checkbox" checked="checked" /><span>是否跟随TA</span></label></div>' : '',
				*/
				'<div class="btn">',
					'<span class="txt red error-text">请输入内容</span>',
					'<span class="txt inputed-counter"><em class="inputed-length">0</em>&nbsp;/&nbsp;'+maxLength+'</span>',
					'<span class="ui-btn"><span>发送</span></span>',
				'</div>',
			'</div>'
			];

			$content.html(html.join(''));

			var $dialog = $.dialog({
				className : '',
				title : '邀请'+nick+'与我互相跟随',
				content : $content,
				fixed : true,
				modal : true,
				scrollIntoView : true
			});

			var $textarea = $content.find('textarea'),
				$errorText = $content.find('span.error-text'),
				$inputedCounter = $content.find('span.inputed-counter'),
				$inputedLen = $content.find('em.inputed-length'),
				$btn = $content.find('span.ui-btn');

			$errorText.hide();
			
			//跟随复选框
			/*
			if(autoFollow){
				$content.find('div.selector input:checkbox').bind('click',function(){
					defText = this.checked ? textFollowed : textNotFollow;
					var _v = $.trim($textarea.val());
					if(_v == '' || _v == textFollowed || _v == textNotFollow){
						$textarea.val(defText);
					}
				});
			}
			*/
			var _eventName_ = (function(){
				var evtname = '';
				if($.browser.msie){
					if(parseInt($.browser.version,10) > 8){
						evtname = 'input keyup';
					}else{
						evtname = 'propertychange';
					}
				}else{
					evtname = 'input';
				}
				return evtname;
			})();

			$textarea
			.css('color','#999')
			.bind(_eventName_, function(event){
				var len = this.value.length;
				if(len > maxLength){
					$inputedLen.addClass('red');
				}else{
					$inputedLen.removeClass('red');
				}
				$inputedLen.html(len);
			})
			.bind('focus',function(){
				$textarea.css('color','#000').removeClass('invite-textarea-err');
				$errorText.hide();
				$inputedCounter.show();
			});
			
			var sending = false;

			$btn.bind('click',function(event){
				var text = $.trim($textarea.val());
				if(text == ''){
					$textarea.addClass('invite-textarea-err');
					$errorText.show();
					$inputedCounter.hide();
				}
				else if(text.length > maxLength){
					$textarea.addClass('invite-textarea-err');
				}
				else{
					if(sending){
						return;
					}
					sending = true;
					$textarea.attr('disabled',true);
					$btn.html('<span>发送中</span>');
					var postFunc = function(){
						$.post('/a/app/friend/quest/send/request.do?_input_encode=UTF-8',
						{	
							'xpt': xpt,
							'sweetWords': text, 
							'from_type': fromType
						},
						function(results){
							if(results.code == 0){
								$.inform({
									icon : 'icon-success',
									delay : 1000,
									easyClose : true,
									content : '邀请发送成功'
								});
								$dialog.close();
								callback();
							}else{
								$.inform({
									icon : 'icon-error',
									delay : 1000,
									easyClose : true,
									content : results.msg
								});
								sending = false;
								$textarea.attr('disabled',false);
								$btn.html('<span>发送</span>');
							}
							
						},'json');
					};
					
					if($content.find('div.selector input:checkbox:checked').length){
						$.getJSON('/a/app/friend/friend/add.do',{'xpt':xpt},function(results){
							if(results.code == 1 || results.code == -2){
								postFunc();
							}
						});
					}else{
						postFunc();
					}
				}
			});

		}
	};

	iCard.destroyInstance = destroyInstance;
	iCard.SetGroupsDialog = SetGroupsDialog;// 扩展到iCard的命名空间下
	iCard.InviteFollowDialog = InviteFollowDialog;
	iCard.login = login;

	$.iCard = ms.iCard = iCard;

	// 根据data-card-handle 属性来批量初始化
	$(function() {

		$('[data-card-handle]').each(function() {
			var $this = $(this), params = iCard.prototype.getParam($this.attr('data-card-handle') || '');

			var _c_ = new iCard({
				'bindElement' : $this,
				'params' : params
			});

		});

	});

})(jQuery, mysohu);