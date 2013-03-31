/*
 *	用户名片 站外版本
 *  @author bobotieyang@sohu-inc.com
 *  
 */
;
(function($) {
	// data-card-type:wenda 问答样式

	if ($.iCard) {
		return;
	}
	var win = window;

	var ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

	// 是否登录检测
	function login() {

		if ($.cookie && $.ppDialog && !$.cookie("ppinf")) {
			$.ppDialog({
				appId : '1019',
				regRedirectUrl : location.href,
				title : '想要查看更多精彩内容，马上登录吧！',
				onLogin : function(userId) {
					location.reload();
				}
			});
			return false;
		}
		return true;
	}

	function cAlert(text){
		if($.alert){
			$.alert(text);
		}else{
			alert(text);
		}
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
		if ($ele.data('iCardInstanceExt')) {
			$ele.data('iCardInstanceExt').destroy();
		}
		$ele.data('iCardInstanceExt', instance);
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
		if ($ele.data('iCardInstanceExt')) {
			$ele.data('iCardInstanceExt').destroy();
		}
	}
	function hideAllInstance(currentInstance) {
		for ( var i = 0, len = instanceList.length; i < len; i += 1) {
			if (instanceList[i].data('iCardInstanceExt') && instanceList[i].data('iCardInstanceExt') !== currentInstance) {
				instanceList[i].data('iCardInstanceExt').hide();
			}
		}
	}
	// 清理所有卡片实例的缓存
	function clearAllCache() {
		for ( var i = 0, len = instanceList.length; i < len; i += 1) {
			if (instanceList[i].data('iCardInstanceExt')) {
				instanceList[i].data('iCardInstanceExt').clearCache();
			}
		}
	}

	function getVisibleInstance() {
		for ( var i = 0, len = instanceList.length; i < len; i += 1) {
			var ins = instanceList[i].data('iCardInstanceExt');
			if (ins && ins.isVisible()) {
				return ins;
			}
		}
		return null;
	}

	var iCard = function(options) {
		var defaults = {
			params : {},// 附加参数
			type : 'ext',// 默认类型
			bindElement : '',// 绑定事件的容器 选择器字符串
			autoBindEvent : true,// 是否自动绑定mouseover和mouseout事件
			getcard : 'http://i.sohu.com/a/usercard/exp/getcard.do?callback=?',// 按xpt返回card
			getnickcard : 'http://i.sohu.com/a/usercard/exp/getnickcard.do?callback=?&_input_encode=UTF-8',// 按昵称返回card
			follow : 'http://i.sohu.com/a/app/friend/friend/add.do?callback=?',// 添加跟随
			unFollow : 'http://i.sohu.com/a/app/friend/friend/delete.do?callback=?',// 取消跟随
			maxHeight : 170,// 计算显示位置的高度
			ajaxDelay : 300,// 延迟500豪秒后请求
			fromType : 'usercard',// 添加关注来源
			side : 'auto',// 显示的位置，left , auto
			onCreateGroup : null,// 当创建了新分组
			onSetGroup : null,// 当设置了分组，不论设置成功与否
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
		this.instanceId = 'iCardInstanceExt' + (++instanceId);
		this.cache = {};
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
			
			var self = this, 
				flag = $o.attr('data-card'), 
				paramStr = $o.attr('data-card-action');

			if (!$o.data('data-card-instanceId')) {
				$o.data('data-card-instanceId', this.instanceId);
			}
			if (flag == 'false' || flag == false || unFollowDialogSliding || ($o.data('data-card-instanceId') != this.instanceId)) {
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
			var self = this, paramStr = $o.attr('data-card-action'), url, side;
			var param = $.extend(this.getParam(paramStr), this.options.params);

			if (param['xpt']) {
				url = this.options.getcard;
			}
			else if (param['nick']) {
				url = this.options.getnickcard;
			}
			else {
				this.setHTML('<div class="data-error">抱歉，该用户无法访问</div>');
				return;
			}
			
			this.loading();

			$.ajax({
				url: url,
				data: param,
				dataType:'jsonp',
				scriptCharset:'GBK',
				cache:false,
				success: function(data) {
					if (data.code == 0) {
						self.setCacheData(paramStr, data.data);
						self.setHTML(data.data);
					} else {
						// do nothing
						self.setHTML('<div class="data-load">' + data.msg + '</div>');
					}
					self.position($o);
				}
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
			
			$.ajax({
				url: this.options.follow,
				data: {
					'xpt' : xpt,
					'from_type' : this.options.fromType,
					'product' : param.product || 'out_website'
				},
				dataType:'jsonp',
				scriptCharset:'GBK',
				cache:false,
				success: function(results) {
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
						if ($.isFunction(self.options.onFollow)) {
							self.options.onFollow({
								'xpt' : xpt,
								'friendid' : friendid,
								'friendType' : results.data.friendType
							});
						}
					} else {
						cAlert(results.msg);
					}
				}
			});

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
					$.ajax({
						url: self.options.unFollow,
						data: {
							'xpt' : xpt
						},
						dataType:'jsonp',
						scriptCharset:'UTF-8',
						cache:false,
						success: function(results) {
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
								cAlert(results.msg);
							}

						}
					});

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
			return;
		},
		unFollowMode : function() {
			return;
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
			ele.removeData('iCardInstanceExt');
			$('body').unbind('.' + this.instanceId);
			this.container.unbind('.' + this.instanceId);
			this.container.remove();
		}
	};

	iCard.destroyInstance = destroyInstance;
	iCard.login = login;
	
	$.iCard = iCard;

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

})(jQuery);