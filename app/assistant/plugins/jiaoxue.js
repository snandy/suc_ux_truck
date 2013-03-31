/**
 * 教学任务，助手plugin
 */
require('core::util::jQuery', "plugins::swfobject", 'app::assistant::popup', function($, swfobject, Popup) {
	define('app::assistant::plugins::jiaoxue', function(assistant, handle) {
		var now = (new Date()).getTime(), basicEventDialog, ie6 = $.browser.msie && parseFloat($.browser.version) < 7, win = window, doc = document, popup;
		function newMessage(data) {
			var s = data.html, nick = assistant.setting.nick;
			if (nick !== '狐狐')
				s = (s || '').replace('Hello，我是狐狐，你的搜狐助手', 'Hello，我是' + nick + '，你的搜狐助手');
			load('/app/assistant/d/quest.css');
			assistant.setEvent(function() {
				popup = new Popup({
					handle : assistant,
					arrow : 38,
					className : 'quest-tips-con education',
					content : s
				});
				popup.bind(Popup.Collapse, function() {
					if (basicEventDialog) {
						basicEventDialog.hide();
						basicEventDialog = null;
					}
					assistant.setStatus();
					handle.next();
				});
				data.onBigPopShow(popup.find('.quest-tips-con'));
			}, 'default', true);
			if (!assistant.$triggerEvent) {
				handle.next(0);
			}
		}
		function hideMessage() {
			popup.destroy();
		}
		function backTop() {
			$('#back_top').trigger('click');
		}
		// 当前的成长教学数据
		var currHintData = null;
		// 更换主题的教程
		var themeHint = {
			show : function($content) {
				var self = this;
				this.$box = $('<div><span id="theme_hint_' + now + '"></span></div>').appendTo('body');
				var soParams = {
					flashvars : {},
					param : {
						'quality' : 'high',
						'wmode' : 'transparent',
						'allowscriptaccess' : 'always'
					},
					attributes : {
						'id' : 'themehint' + now,
						'name' : 'themehint' + now
					}
				};
				swfobject
				.embedSWF('http://s3.suc.itc.cn/app/guide/themehint.v20111208.swf', 'theme_hint_' + now, '255', '158', '9.0.0', 'http://s3.suc.itc.cn/mysohu/plugins/swfobject/expressInstall.swf', soParams.flashvars, soParams.param, soParams.attributes);
				if (ie6) {
					this.$box[0].style.cssText = 'width:158px;height:136px;position:absolute;z-index:2000;cursor:pointer;top:expression(documentElement.scrollTop + 30 + "px");right:0px;';
				} else {
					this.$box.css({
						'width' : 255,
						'height' : 158,
						'position' : 'fixed',
						'top' : 30,
						'right' : 20,
						'z-index' : 1000,
						'cursor' : 'pointer'
					});
				}
				var $mask = $('<div style="position:absolute;left:0px;top:0px;z-index:2;left:0px;top:0px;width:275px;height:158px;cursor:pointer"></div>')
				.css({
					'backgroundColor' : '#000000',
					'opacity' : 0
				});
				this.$box.append($mask).bind('click', function() {
					hideMessage();
					$('#skin_sprite').click();
				});
				backTop();
				basicEvents($content, this);
				$content.find('a.hint-url').bind('click', function(event) {
					event.preventDefault();
					hideMessage();
					self.hide();
					$('#skin_sprite').click();
				});
				$('#skin_sprite').click(function() {
					self.hide();
				});
			},
			hide : function() {
				if (this.$box.is(':visible')) {
					this.$box.hide();
				}
			}
		};
		// 更换导航顺序的教程
		var navHint = {
			show : function($content) {
				var self = this;
				this.$box = $('<div><span id="nav_hint_' + now + '"></span></div>').appendTo('body');
				var soParams = {
					flashvars : {},
					param : {
						'quality' : 'high',
						'wmode' : 'transparent',
						'allowscriptaccess' : 'always'
					},
					attributes : {
						'id' : 'navhint' + now,
						'name' : 'navhint' + now
					}
				};
				swfobject
				.embedSWF('http://s3.suc.itc.cn/app/guide/navhint.v20111208.swf', 'nav_hint_' + now, '870', '170', '9.0.0', 'http://s3.suc.itc.cn/mysohu/plugins/swfobject/expressInstall.swf', soParams.flashvars, soParams.param, soParams.attributes);
				this.$box.css({
					'width' : 870,
					'height' : 170,
					'position' : 'absolute',
					'z-index' : 1000
				});
				this.pos();
				var $mask = $('<div style="position:absolute;z-index:2;left:55px;top:35px;width:806px;height:58px;cursor:pointer"></div>')
				.css({
					'backgroundColor' : '#000000',
					'opacity' : 0
				});
				this.$box.append($mask).bind('click', function() {
					hideMessage();
				});
				backTop();
				basicEvents($content, this);
				$content.find('a.hint-url').bind('click', function(event) {
					event.preventDefault();
					hideMessage();
				});
				$(win).bind('resize.navhint', function() {
					self.pos();
				});
			},
			hide : function() {
				if (this.$box.is(':visible')) {
					this.$box.hide();
				}
				$(win).unbind('resize.navhint');
			},
			pos : function() {
				var offset = $('#menuItems').offset();
				this.$box.css({
					left : offset.left - 59,
					top : offset.top - 38
				});
			}
		};
		function iKnow() {
			if (currHintData) {
				$.getJSON('http://i.sohu.com/a/task/education/skip?id=' + currHintData.id);
				currHintData = null;
			}
			assistant.setStatus();
			handle.next();
		}
		function basicEvents($content, dialog) {
			basicEventDialog = dialog;
			$content.find('a.hint-i-know').bind('click', function(event) {
				event.preventDefault();
				hideMessage();
				iKnow();
				if (basicEventDialog) {
					basicEventDialog.hide();
					basicEventDialog = null;
				}
			});
		}
		// 分析url，将param串到参数中
		function parseUrl(url, param) {
			var appUrl = url, params = '', hash = '', i0 = url.indexOf('?'), i1 = url.indexOf('#');
			if (i1 > -1) {
				appUrl = url.substring(0, i1);
				hash = url.substring(i1)
			}
			if (i0 > -1) {
				params = appUrl.substring(i0);
				appUrl = appUrl.substring(0, i0);
			}
			if (params == '' && param) {
				params = '?' + param;
			} else if (param) {
				params += '&' + param;
			}
			return appUrl + params + hash;
		}
		// 获取当前正在做的成长任务id
		function getEduid() {
			var match = /eduid=([^&]+)/i.exec(window.location.search);
			return match && match[1];
		}
		function taskHTML(data) {
			var html = [];
			// html.push('<h2>'+data.name+'</h2>');
			var url = parseUrl(data.url, 'eduid=' + data.eduid);
			html.push('<div>' + data.tiptext + '</div>');
			html.push('<div class="btn-wrapper">');
			html
			.push(data.actiontext ? '<a class="btn-green hint-url" href="' + url + '"><span>' + data.actiontext + '</span></a>' : '');
			html.push('<a class="blue hint-i-know" href="javascript:void(0);">我知道了</a>');
			if (typeof data.percent != 'undefined') {
				// html.push('<span>任务进度</span>');
				// html.push('<div class="progressbar-wrapper"><p style="width:
				// '+data.percent+'%;" class="progressbar"></p><p
				// class="text">'+data.percent+'%</p></div>');
			}
			html.push('</div>');
			return html.join('');
		}
		function getNewHint() {
			$.getJSON('/a/task/education/get', function(results) {
				if (results.code != 0) {// err
					return handle.next(0);
				}
				var data = results.data, autoOpen = false;
				if (getEduid() == data.eduid) {
					return handle.next(0);
				}
				currHintData = data;
				var html = taskHTML(data);
				if (data.order == 1 || data.order == 3)
					autoOpen = true;
				// 导航提示
				if (data.eduid == 5) {
					if ($('#menuItems').length) {
						newMessage({
							html : html,
							onBigPopShow : function($content) {
								navHint.show($content);
							},
							onBigPopHide : function() {
								navHint.hide();
							}
						});
					}
				}
				// 更换主题提示
				else if (data.eduid == 4) {
					newMessage({
						html : html,
						onBigPopShow : function($content) {
							if (!themeHint.$box) {
								themeHint.show($content);
							}
						},
						onBigPopHide : function() {
							themeHint.hide();
							handle.setStatus();
							handle.next();
						}
					});
				} else {
					newMessage({
						html : html,
						onBigPopShow : function($content) {
							basicEvents($content);
							if ($content.find('div.progressbar-wrapper').length) {
								$content.closest('div.quest-tips-wrapper').css('width', 400);
							}
						}
					});
				}
			});
		}
		getNewHint();
		return true;
	});
});
