require('core::util', 'core::util::jQuery', 'core::ui::dialog::confirm', 'core::ui::dialog::error', 'core::stringUtil', '#document', function(util, $, $confirm, $error, stringUtil, document) {
	"use strict";
	var READY = "ready", TESTING = "testing", MOVING = "moving", EDITING = "editing";
	var MOUSEDOWN = "mousedown";
	var lastPos = null, hideTime = 0, hanging = false;
	var RLink = /^(?:http:\/\/)?(?:[^\/]*\.)?sohu\.com(?:\/|$)/;
	var myurl = $space_config._url;
	var handle = {
		$ul : $('ul.main-nav'),
		popup : $('<div class="popup main-nav-tools"><div class="content-box"><div class="popup tips"><i class="diamond tip-top"></i></div><div class="btn-tools"><a class="wrench" herf="#"><i class="icon-wrench"></i></a> <a class="delete" herf="javascript:;"><i class="icon-delete"></i></a></div></div></div>'),
		data : null,
		init : function() {
			this.$addNav = this.$ul.find('.newmodule');
			var sel = '.main-nav>li';
			// 鼠标拖拽事件
			this.$ul.delegate(sel, 'mouseenter mouseleave click ' + (util.ie ? 'dragstart' : MOUSEDOWN), this.event.handler)
			// 编辑/删除事件
			.delegate('.main-nav-tools a', 'click', this.event.actions);
			// 保存修改事件
			this.$addNav.delegate('a', 'click', this.setLink);
			// 添加按钮
			this.$ul.find('.no-border>a').click(this.showAdd);
			// 自动勾选链接
			this.$addNav.find('.form-item input:eq(0)').bind('change', this.event.checkURL);
			var buttons = this.buttons = {};
			this.$addNav.find('ul.app-menu>li>a').each(function() {
				buttons[(this.textContent || this.innerText).trim()] = this;
			});
			this.initData();
			toggleBtnAdd(true, this.data.length < 8);
		},
		initData : function() {
			var selected = {};
			for ( var arr = this.$ul.children(), i = 0, L = arr.length - 1, arr2 = this.data = Array(L); i < L; i++) {
				selected[(arr2[i] = digest(arr[i].children[0])).title] = true;
			}
			for ( var k in this.buttons) {
				this.buttons[k].className = selected[k] ? '' : 'unselected';
			}
		},
		post : function(success) {
			util.ajax.postJSON('/a/setting/custom/nav/set?_input_encode=UTF-8', {
				custombar : JSON.stringify(this.data)
			}, function(ret) {
				if (ret.code != 0)
					$error(ret.msg);
				else
					success && success();
			});
			mysohu.put_log('show_top_custom');
		},
		status : READY,
		event : {
			checkURL : function(e) {
				handle.$addNav.find('input[type=checkbox]')[0].checked = this.value.substr(0, myurl.length) !== myurl;
			},
			handler : function(e) {
				if (this.className === 'no-border') {
					return;
				}
				handle.event[e.type].call(this, e);
			},
			mouseenter : function(e) {
				if (hanging || handle.status != READY)
					return;
				var self = this;
				var offTime = new Date().getTime() - hideTime;
				if (offTime < 10) {
					sched();
				} else {
					hanging = setTimeout(sched, 400);
				}
				function sched() {
					if (handle.status == READY) {
						hanging = true;
						var $self = $(self);
						handle.popup.prependTo(self).css('left', $self.position().left + $self.width() / 2 - 27);
					} else
						hanging = false;
				}
			},
			mouseleave : function(e) {
				if (!hanging)
					return;
				if (typeof hanging == 'number') {
					hanging = clearTimeout(hanging);
				} else {
					hanging = false;
					hideTime = new Date().getTime();
					handle.popup.remove();
				}
			},
			mousedown : function(e) {
				e.preventDefault();
				if (handle.status != READY)
					return;
				handle.status = TESTING;
				lastPos = {
					x : e.clientX,
					y : e.clientY,
					li : e.currentTarget
				};
				$(document).bind('mousemove', handle.event.mousemove).bind('mouseup mouseleave', handle.event.mouseup);
			},
			mousemove : function(e) {
				var $li = $(lastPos.li);
				if (handle.status == TESTING) {
					if (norm2(e.clientX - lastPos.x, e.clientY - lastPos.y) < 225)
						return;
					var obj = $li.position();
					lastPos.x -= obj.left;
					lastPos.y -= obj.top;
					lastPos.dummy = $('<li class="dummy" style="width: ' + ($li.width() - 7) + 'px"></li>').insertBefore($li);
					$li.addClass("dragging");
					$li.prependTo($li.parent());
					handle.status = MOVING;
					handle.popup.remove();
				}
				if (handle.status == MOVING) {
					$li.css({
						'left' : e.clientX - lastPos.x + "px",
						'top' : e.clientY - lastPos.y + "px"
					});
					var lis = $li.nextAll();
					var left = e.clientX - lastPos.x + $li.width() / 2;
					for ( var n = 0, L = lis.length; n < L; n++) {
						var elem = lis[n], $elem = $(elem);
						if (left < $elem.position().left + $elem.width() / 2) {
							if (elem != lastPos.dummy[0] && elem != lastPos.dummy.next()[0]) {
								lastPos.dummy.insertBefore($elem);
							}
							break;
						}
					}
				}
			},
			mouseup : function(e) {
				if (handle.status == TESTING) {
				} else if (handle.status == MOVING) {
					handle.preventing = new Date().getTime();
					var $dummy = lastPos.dummy, $item = $(lastPos.li).animate($dummy.position(), 'fast', 'swing', function() {
						handle.status = READY;
						$item.removeClass('dragging').css({
							'left' : "",
							'top' : ""
						});
						$dummy.replaceWith($item);
						handle.initData();
						handle.post();
					});
				}
				lastPos = null;
				handle.status = READY;
				$(document).unbind('mousemove', handle.event.mousemove).unbind('mouseup mouseleave', handle.event.mouseup);
			},
			click : function(e) {
				if (handle.preventing) {
					if (new Date().getTime() - handle.preventing < 5) {
						e.preventDefault();
						e.stopPropagation();
					}
					handle.preventing = false;
				}
			},
			actions : function(e) {
				e.stopPropagation();
				var $li = $(this).closest('li'), n = $li.index();
				switch (this.className) {
				case 'wrench':
					var data = handle.data[n];
					handle.editing = [ data, $li ];
					handle.showEdit($li, data);
					break;
				case 'delete':
					if (handle.data.length == 1) {
						$error('不能删除最后一个导航按钮');
						return;// TODO
					}
					var custom = $li.attr('i:type') == 'custom';
					if (custom) {
						$confirm({
							content : '删除自定义链接?',
							labAccept : '删除',
							onConfirm : rmLink
						});
					} else {
						rmLink();
					}
					break;
				}
				function rmLink() {
					hanging = false;
					var btn = handle.buttons[handle.data.splice(n, 1)[0].title];
					btn && (btn.className = 'unselected');
					$li.remove();
					toggleBtnAdd(handle.data.length == 7, true);
					handle.post();
				}
			}
		},
		clickOutside : function(e) {
			if (!$(e.target).closest(handle.$addNav).length) {
				if (handle.$dummy) {
					handle.$dummy.remove();
					handle.$dummy = null;
					toggleBtnAdd(true, true);
				}
				handle.onModify();
			}
		},
		setLink : function(e) {
			e.preventDefault();
			if (!this.className)
				return;
			var data;
			if (this.parentNode.nodeName != "LI") {// 自定义
				var inputs = handle.$addNav[0].getElementsByTagName('INPUT');
				var title = inputs[1].value, url = inputs[0].value;
				if (!title || stringUtil.gbLength(title) > 4) {
					$error(title ? '最多输入8个字符' : '名称不能为空');
					return;
				}
				// 判重
				for ( var i = 0, arr = handle.data, L = arr.length; i < L; i++) {
					if (arr[i].title == title && (!handle.editing || arr[i] !== handle.editing[0])) {
						$error('名称不能重复');
						return;
					}
				}
				if (!url || !RLink.test(url)) {
					$error(url ? '仅限搜狐网链接' : '链接地址不能为空');
					return;
				} else if (url.substr(0, 7) != 'http://') {
					url = 'http://' + url;
				}
				data = {
					title : title,
					url : url,
					blank : inputs[2].checked
				};
			} else {
				this.className = '';
				data = digest(this);
			}
			if (handle.editing) {
				var old = handle.editing[0];
				var oldBtn = handle.buttons[old.title];
				oldBtn && (oldBtn.className = 'unselected');
				for ( var k in data) {
					old[k] = data[k];
				}
				handle.editing[1].html(undigest(data));
				handle.editing = null;
			} else if (handle.$dummy) {
				handle.data.push(data);
				toggleBtnAdd(true, handle.data.length < 8);
				handle.$dummy.removeClass('dummy').css('width', '').html(undigest(data));
				handle.$dummy = null;
			}
			handle.onModify();
			handle.post();
		},
		onModify : function(data) {
			this.status = READY;
			this.$addNav.hide();
			$(document).unbind(MOUSEDOWN, this.clickOutside);
		},
		showAdd : function() {
			if (handle.data.length >= 8) {
				$error('已经有8个导航链接了');
				return;
			}
			toggleBtnAdd(true, false);
			var $inserted = handle.$dummy = $('<li><a href="javascript:;">新建链接</a></li>');
			$inserted.insertBefore(handle.$addNav.parent());
			handle.showEdit($inserted);
			$(document).bind(MOUSEDOWN, handle.clickOutside);
		},
		showEdit : function(em, data) {
			this.status = EDITING;
			var $spans = this.$addNav.css('left', em.position().left).show().find('h4>span');
			$spans[0].innerHTML = data ? '替换' : '添加';
			$spans[1].innerHTML = data ? '编辑' : '添加自定义';
			var inputs = this.$addNav[0].getElementsByTagName('INPUT');
			if (data) {
				inputs[0].value = data.url;
				inputs[1].value = data.title;
				inputs[2].checked = data.blank;// TODO
			} else {
				inputs[0].value = 'http://';
				inputs[1].value = '新建链接';
				inputs[2].checked = false;
			}
			$(document).bind(MOUSEDOWN, handle.clickOutside);
		}
	};
	handle.event.dragstart = handle.event.mousedown;
	handle.init();
	function norm2(dx, dy) {
		return dx * dx + dy * dy;
	}
	function digest(a) {
		return {
			title : (a.textContent || a.innerText).trim(),
			url : a.href,
			blank : Boolean(a.target)
		};
	}
	function undigest(data) {
		return '<a href="' + data.url + (data.blank ? '" target="_blank">' : '">') + stringUtil.filter_html(data.title) + '</a>';
	}
	function toggleBtnAdd(bool, toggle) {
		bool && handle.$addNav.next().css('visibility', toggle ? '' : 'hidden');
	}
});