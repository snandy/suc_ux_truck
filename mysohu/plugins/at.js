loadResource('/mysohu/at/d/at.css');
require('core::util::jQuery', function($) {
	// 默认参数
	var defaults = {
		flag: '@'
	};

	var replaceCJK = /[^\x00-\xff]/g,
		testCJK = /[^\x00-\xff]/;

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
		var s = str.split(''),
			c = 0,
			tmpA = [];
		for (var i = 0; i < s.length; i += 1) {
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

	var $attip; // 弹出层对象，每个页面只实例化一个

	var methods = {
		// 初始化
		init: function(options) {
			var $window = $(window),
				data = this.data('at'),
				settings = $.extend({}, defaults, options || {});

			if (!data) {
				// init code

				var eventName = $.browser.msie ? 'propertychange' : 'input';
				this.bind(eventName + '.at', methods.change);
				this.bind('focus.at', methods.change);
				this.bind('blur.at', methods.hide);
				this.bind('keydown.at', methods.change);
				this.bind('click.at', methods.change);

				this.data('at', {
					target: this,
					settings: settings
				});

			};
		},
		// 输入内容或光标移动出发的事件
		change: function(event) {
			var $this = $(this),
				data = $this.data('at'),
				settings = data.settings,
				$window = $(window);

			// 如果不是值的改变就停止
			if ($.browser.msie && window.event && window.event.propertyName && window.event.propertyName != 'value') {
				return false;
			}

			// 判断是否是keydown事件
			if (data.show && event.type == 'keydown') {
				switch (event.keyCode) {
					case 13:
						methods['insertat'].call($this, {
							nick: $attip.find('li.active').attr('data-nick'),
							sname: $attip.find('li.active').attr('data-sname')
						});
						event.preventDefault();
						return false;
						break;
					case 9:
						methods['insertat'].call($this, {
							nick: $attip.find('li.active').attr('data-nick'),
							sname: $attip.find('li.active').attr('data-sname')
						});
						event.preventDefault();
						return false;
						break;
					case 27:
						methods['insertat'].call($this, {
							nick: $attip.find('li.active').attr('data-nick'),
							sname: $attip.find('li.active').attr('data-sname')
						});
						event.preventDefault();
						return false;
						break;
					case 38:
						var current = $attip.find('li.active');
						if (current.prev('li').length) {
							current.removeClass('active');
							current = current.prev('li');
							current.addClass('active');
						} else {
							current.removeClass('active');
							current = current.parent('').find('li:last');
							current.addClass('active');
						}
						event.preventDefault();
						return false;
						break;
					case 40:
						var current = $attip.find('li.active');
						if (current.next('li').length) {
							current.removeClass('active');
							current = current.next('li');
							current.addClass('active');
						} else {
							current.removeClass('active');
							current = current.parent().find('li:first');
							current.addClass('active');
						}
						event.preventDefault();
						return false;
						break;
				}
			}

			if (data.eventTimer) {
				clearTimeout(data.eventTimer);
				data.eventTimer = null;
			}
			data.eventTimer = setTimeout(function() {
				if (data.show) {
					methods['hide'].call($this);
				}
				methods['checkat'].call($this, event);
			}, 200);

		},
		// 检测@字符
		checkat: function(event) {
			var $this = $(this),
				data = $this.data('at');

			if (!data) {
				return false;
			}

			var settings = data.settings,
				$window = $(window),
				textarea = $this.get(0),
				eIndex = 0;
			if (textarea.selectionStart === undefined) {
				var selection = document.selection;
				var range, stored_range;
				if (textarea.tagName.toLowerCase() != "textarea") {
					var val = $this.val();
					range = selection.createRange().duplicate();
					range.moveEnd("character", val.length);
					eIndex = (range.text == "" ? val.length : val.lastIndexOf(range.text));
					range = selection.createRange().duplicate();
					range.moveStart("character", -val.length);
				} else {
					range = selection.createRange();
					stored_range = range.duplicate();
					stored_range.moveToElementText(textarea);
					stored_range.setEndPoint('EndToEnd', range);
					eIndex = stored_range.text.length - range.text.length;
				}
			} else {
				eIndex = textarea.selectionStart;
			}
			var text = $this.val();
			var selectText = text.slice(0, eIndex);
			data.eIndex = eIndex;
			var r = selectText.match(new RegExp([settings.flag, '([a-zA-Z0-9\u4e00-\u9fa5\-_]{0,20})$'].join('')));
			if (r) {
				var beforeText = text.slice(0, r.index);
				var keyword = r[1];
				data.beforeText = beforeText;
				data.keyword = keyword;
				methods['getData'].call($this);
			} else {
				if (data.show) {
					methods['hide'].call($this);
				}
			}
		},
		// 获取数据
		getData: function() {
			var $this = $(this),
				data = $this.data('at'),
				settings = data.settings,
				$window = $(window);

			// 创建镜像文本
			var $mirror = $('.jquery-at-mirror');
			if (!$mirror.length) {
				$mirror = $('<div class="jquery-at-mirror"></div>').appendTo($('body'));
			}

			// 初始化镜像的样式
			if (data.currentTextarea != $this.get(0)) {
				var cssOptions = {};
				$.each(['margin', 'padding', 'border'], function(i, h) {
					$.each(["Top", "Left", "Bottom", "Right"], function(j, c) {
						if (h != 'border') {
							cssOptions[h + c] = $this.css(h + c);
							return;
						}
						$.each(['Color', 'Style', 'Width'], function(m, e) {
							cssOptions[h + c + e] = $this.css(h + c + e);
						})
					})
				});
				cssOptions = $.extend(cssOptions, {
					fontSize: $this.css('fontSize'),
					fontFamily: $this.css('fontFamily'),
					lineHeight: $this.css('lineHeight'),
					visibility: 'hidden',
					position: 'absolute',
					'background-color': '#fff',
					'word-wrap': 'break-word',
					'outline': 'none',
					'overflow-x': 'hidden',
					'overflow-y': 'auto'
				});

				$mirror.css(cssOptions);

				data.currentTextarea = $this.get(0);
			}

			$mirror.css({
				width: $this.css('width'),
				height: $this.css('height'),
				left: $this.offset().left,
				top: $this.offset().top - $this.outerHeight('height')
			});

			$mirror.html(encodeValue(data.beforeText) + '<span class="jquery-at-flag">@</span>');

			// 计算@标记的实际坐标
			var $flag = $('.jquery-at-flag', $mirror);
			var position = $flag.position();
			var offset = $this.offset();
			var realPosition = {
				left: offset.left + position.left - $this.prop('scrollLeft') + 5,
				top: offset.top + position.top - $this.prop('scrollTop') + 20
			};

			// 创建弹出提示层
			if (!$attip) {
				$attip = $('<div class="jquery-at-tip"></div>');
				$attip.appendTo($('body'));
				$attip.css({
					display: 'none',
					position: 'absolute',
					zIndex: 212122001
				});
				// 设置缓存对象
				$attip.data('cache', {});
				$attip.data('recentlycache', {});
				$attip.data('lastInput', '');
				$attip.data('inputEle', $this);

				// 设置提示框事件
				$attip.bind('click.at', function(event) {
					var $target = $(event.target);

					// 鼠标点击li
					if ($target.closest('li').length) {
						var $elt = $target.closest('li');
						methods['insertat'].call($attip.data('inputEle'), {
							nick: $elt.attr('data-nick'),
							sname: $elt.attr('data-sname')
						});
					}
				});

				$attip.bind('mouseover.at', function(event) {
					var $target = $(event.target);
					var $relatedTarget = $(event.relatedTarget);

					// 鼠标滑过li
					if ($target.closest('li').length) {
						var $elt = $target.closest('li');
						within.call($elt, event, function() {
							if (!$elt.hasClass('active')) {
								$elt.parent().find('li').removeClass('active');
								$elt.addClass('active');
							}
						});
					}
				});

				// 给输入框绑定失去焦点事件
				$attip.hover(function() {
					$attip.data('inputEle').unbind('blur.at');
				}, function() {
					$attip.data('inputEle').bind('blur.at', function(event) {
						methods['hide'].call($attip.data('inputEle'), event);
					});
				});

				// 失去焦点关闭提示框事件
				$('body').bind('click.at', function(event) {
					var $target = $(event.target);
					if (!$target.closest('.jquery-at-tip').length) {
						var data = $attip.data('inputEle').data('at');
						if (data && data.show) {
							methods['hide'].call($attip.data('inputEle'));
						}
					}
				});

			}
			$attip.data('inputEle', $this); // 更新input框元素
			data.show = true;

			var cache = $attip.data('cache');
			var recentlycache = $attip.data('recentlycache');
			var keyword = data.keyword;

			if (!data.keyword) {
				if (recentlycache.dataFinish && recentlycache.data) {
					methods['show'].call($this, {
						keyword: keyword,
						data: recentlycache.data
					});
				} else if (recentlycache !== false) {
					if (recentlycache.gettingData) {
						return false;
					} else {
						recentlycache.gettingData = true;
					}
					$.getJSON('/a/app/mblog/refer/list.htm', {
						_: new Date().getTime()
					}, function(data) {
						if (data && !data.code) {
							data = data.data;
							if (!data.refer.length) {
								recentlycache.dataFinish = true;
								recentlycache.data = '';
							} else {
								var html = [];
								html.push('<div class="title">最近@的好友</div><ul>');
								$.each(data.refer.slice(0, 10), function(i, user) {
									html.push(
										'<li data-nick="' + user.nick + '" data-sname="' + user.sname + '">', '<img src="' + user.uavatar + '" />',
										//cutCjkString(user.nick, 14),
										user.nick,
										'(' + user.sname + ')',
										'</li>');
								});
								html.push('</ul>');
								html = html.join('');
								recentlycache.dataFinish = true;
								recentlycache.data = html;
								methods['show'].call($this, {
									keyword: keyword,
									data: html
								});
							}
						} else {
							recentlycache.dataFinish = true;
							recentlycache.data = '';
						}
					});
				}
			} else {
				if (cache[keyword] && cache[keyword].dataFinish) {
					methods['show'].call($this, {
						keyword: keyword,
						data: cache[keyword].data
					});
				} else {
					if (cache[keyword] && cache[keyword].gettingData) {
						return false;
					} else {
						cache[keyword] = {};
						cache[keyword].gettingData = true;
					}
					$.getJSON('/a/search/user/search/pinyin.do?_input_encode=UTF-8', {
						nick: keyword,
						_: new Date().getTime()
					}, function(data) {
						if (data && !data.code) {
							data = data.data;
							if (!data.accounts.length) {
								cache[keyword].dataFinish = true;
								cache[keyword].data = '';
								methods['show'].call($this, {
									keyword: keyword,
									data: ''
								});
							} else {
								var html = [];
								html.push('<div class="title">想用@提到谁？</div><ul>');
								$.each(data.accounts, function(i, user) {
									var cut_nick = user.nick; // cutCjkString(user.nick, 14);
									var cut_sname = user.sname;
									if (keyword) {
										user.newnick = cut_nick.replace(keyword, '<strong>' + keyword + '</strong>');
										user.newsname = cut_sname.replace(keyword, '<strong>' + keyword + '</strong>');
									}
									html.push(
										'<li data-nick="' + user.nick + '" data-sname="' + user.sname + '">', 
										'<img src="' + user.uavatar + '" />',
										user.newnick,
										'(' + user.newsname + ')',
										'</li>'
									);
								});
								html.push('</ul>');
								html = html.join('');
								cache[keyword].dataFinish = true;
								cache[keyword].data = html;
								methods['show'].call($this, {
									keyword: keyword,
									data: html
								});
							}
						} else {
							cache[keyword].dataFinish = true;
							cache[keyword].data = '';
						}
					});
				}
			}

			$attip.css({
				left: realPosition.left,
				top: realPosition.top
			});

		},
		// 显示提示框
		show: function(options) {
			var $this = $(this),
				data = $this.data('at'),
				settings = data.settings,
				$window = $(window);

			if (data.show && data.keyword == options.keyword) {
				if (!options.data) {
					options.data = '<div class="title">想用@提到谁？</div><ul><li data-nick="' + data.keyword + '" data-sname="' + data.keyword + '">' + data.keyword + '</li></ul>';
				}
				$attip.html(options.data).show();
				// 把最后一次录入的词排到第一个
				if ($attip.data('lastInput')) {
					var $tmp_li = $attip.find('ul li[data-nick=' + $attip.data('lastInput') + ']')
					if($tmp_li.length){
						$tmp_li.prependTo($attip.find('ul'));
					}
					else{
						$attip.find('ul li[data-sname=' + $attip.data('lastInput') + ']').prependTo($attip.find('ul'));
					}
					
				}
				$attip.find('ul li:first').addClass('active');
			}

		},
		// 隐藏提示框
		hide: function(event) {
			var $this = $(this);
			data = $this.data('at');
			data && (data.show = false);
			if ($attip) {
				$attip.hide();
			}

		},
		// 插入@+昵称
		insertat: function(options) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('at');

				var beforeContent = data.beforeText + '@' + options.sname + ' ';
				var content = beforeContent + $this.val().slice(data.eIndex);

				$this.val(content);

				if (data.show) {
					methods['hide'].call($this);
				}

				var eIndex = beforeContent.length;
				var textarea = $this.get(0);
				if (textarea.setSelectionRange) {
					textarea.focus();
					textarea.setSelectionRange(eIndex, eIndex);
				} else if (textarea.createTextRange) {
					var range = textarea.createTextRange();
					range.collapse(true);
					range.moveEnd('character', eIndex);
					range.moveStart('character', eIndex);
					range.select();
				}
				$attip.data('lastInput', options.nick);

			});
		},
		destroy: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('at'),
					$window = $(window);
				$window.unbind('.at');
				$this.unbind('.at');
				$this.removeData('at');
			});
		}
	};

	// 实体化HTML代码
	var encodeValue = (function() {
		// 实体对照表
		var font = 'font-family:Tahoma,宋体;';
		var hash = {
			'<': '&lt;',
			'>': '&gt;',
			'\"': '&quot;',
			'\\': '&#92;',
			'&': '&amp;',
			'\'': '&#039;',
			'\r': '',
			'\n': '<br>',
			' ': (navigator.userAgent.match(/.+(?:ie) ([\d.]+)/i) || [8])[1] < 8 ? [
				'<pre style="overflow:hidden;display:inline;', font, 'word-wrap:break-word;"> </pre>'].join('') : [
				'<span style="white-space:pre-wrap;', font, '"> </span>'].join('')
		};
		// 实休函数返回
		return function(value) {
			var ret = value.replace(/(<|>|\"|\\|&|\'|\n|\r| )/g, function(h) {
				return hash[h];
			});
			// 返回实体文本
			return ret;
		};
	})();

	// 用于closest方式的mouseover和mouseout事件
	var within = function(event, callback) {
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
		} catch (e) {}
	};

	$.clearAtCache = function() {
		if ($attip) {
			$attip.data('recentlycache', {});
			$attip.data('lastInput', '');
		}
	};

	define('plugins::at', methods);
});