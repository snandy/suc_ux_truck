require(
'core::util::jQuery',
'core::stringUtil',
'core::util[ajax,userData,channel]',
'app::widgets::template',
'core::ui::dialog',
function($, stringUtil, util, PLUGINS, $dialog) {
	var defaults = {
		target : 'feed_nav_box'
	};
	var self = util
	.probe(
	{
		init : function(options, feed) {
			this.feed = feed;
			this.options = options = util.probe(defaults, options);
			this[0] = document.getElementById(options.target);
			this.length = 1;
			// init doms
			this.$filter = this.find('ul.filter-menu');
			this.initEvents();
			if (util.userData.groups) {
				this.setGroups(util.userData.groups);
				setTimeout(function() {
					self.load();
				}, 3200);
			} else {
				this.load();
			}
		},
		initEvents : function() {
			var self = this;
			this.delegate("[action]", "click", this.onClick);
			this.hideGroups = function() {
				self.pid_hide = 0;
				self.shown = false;
				self.find('.tabs-float').hide();
			};
			this.showGroups = function(e) {
				self.pid_hide && (self.pid_hide = clearTimeout(self.pid_hide));
				if (!self.shown) {
					self.shown = true;
					self.find('.tabs-float').show().find('.tabs-float-top').css('marginLeft',
					self.find('li.current').width() - 86 + "px");
				}
				if (util.ie === 6 && e) {
					// for IE==6, mouseover will trigger
					var $target = $(e.target);
					if (e.target.tagName === "P" && !$target.hasClass("hover")) {
						self.find('.tabs-groups p').removeClass('hover');
						$target.addClass('hover');
					}
				}
			};
			this.find('.tabs-float-body').bind('mouseover', this.showGroups).bind('mouseleave', function() {
				self.pid_hide || (self.pid_hide = setTimeout(self.hideGroups, 500));
			});
		},
		setGroups : function(groups) {
			self.groups = groups;
			var arr = [ '<p action="group" data-gid="-2" style="display:none">全部新鲜事</p>' ];
			for ( var L = groups.length, n = 0; n < L; n++) {
				arr.push('<p action="group" data-gid="', groups[n].id, '">', groups[n].name, '</p>');
			}
			this.find('.tabs-groups').html(arr.join(''));
		},
		load : function() {
			util.ajax.getJSON('/a/app/friend/group/getgroups.do', function(ret) {
				ret = ret.data.groups;
				var changed = false, old = util.userData.groups;
				if (!old || old.length != ret.length)
					changed = true;
				for ( var n = 0, L = ret.length; n < L; n++) {
					ret[n] = {
						name : ret[n].groupName,
						id : ret[n].groupId
					};
					if (!changed && (!old[n] || ret[n].name !== old[n].name || ret[n].id !== old[n].id))
						changed = true;
				}
				if (changed) {
					util.userData.groups = ret;
					util.userData.save();
					self.setGroups(ret);
					util.channel.broadcast("feed", "group", ret);
				}
			});
		},
		resetTypes : function() {
			var lis = this.$filter.children();
			for ( var n = 0; n < lis.length; n++) {
				lis[n].className = n ? "" : "current";
			}
		},
		beginSort : function() {
			var groups = self.groups;
			var $dlg = $dialog({
				title : "调整分组顺序",
				btns : [ "accept", "cancel" ],
				defaultBtn : "cancel",
				contentBtnHelp : true,
				className : "custom-dialog",
				content : PLUGINS.group_sort({
					'groups' : self.groups,
					'tabs' : getTabsHTML()
				}),
				onBeforeAccept : function(event) {
					self.groups = util.userData.groups = groups;
					self.setGroups(groups);
					util.channel.broadcast("feed", "group", groups);
					for ( var n = 0, L = groups.length, arr = new Array(L); n < L; n++) {
						arr[n] = groups[n].id;
					}
					util.ajax.post('/a/app/friend/group/order.do', {
						gids : arr.join()
					});
					util.userData.save();
					$(document).unbind('mousedown', mmDown);
					$dlg.unbind('click', mmClick);
				}
			});
			var dragging = null, pos = {}, status = "ready";
			$(document).bind('mousedown', mmDown);
			$dlg.bind('click', mmClick);
			function mmDown(e) {
				var target = e.target;
				if (target.tagName === "A" && target.className === "editable")
					target = target.parentNode;
				if (target.tagName === "LI"
				&& (util.ie ? target.attributes["data-gid"] != undefined : target.hasAttribute("data-gid"))) {
					// start drag
					dragging = $(target);
					status = "testing";
					pos = {
						x : e.clientX,
						y : e.clientY
					};
					$(document).bind('mousemove', mmMove).bind('mouseup', mmUp);
				}
			}
			function mmClick(e) {
				if (status === "docking") {
					status = "ready";
					e.preventDefault();
					return;
				}
				var target = e.target;
				if (target.tagName === "A" && target.className == "editable") {
					var $dlg2 = $dialog({
						title : "修改分组名称",
						type : 'dialog',
						btns : [ "accept", "cancel" ],
						defaultBtn : "cancel",
						content : '<div style="padding:6px">请输入分组名：<br/><input type="text" style="margin-top:6px;width:160px; height:18px; border:1px solid; border-color:#CCC #EEE #EEE #CCC" maxlength="16"/></div>',
						onBeforeAccept : function(event) {
							var val = input.value, self = null;
							if (val.length === 0) {
								input.value = input.oldVal;
								$dialog.error('分组名称不能为空');
								self = this;
							} else if (stringUtil.gbLength(val) > 16) {
								$dialog.error('分组名称不能超过16个字符');
								self = this;
							} else {
								var parent = target.parentNode;
								var gid = parent.getAttribute('data-gid');
								var modified = false;
								for ( var n = 0; n < groups.length; n++) {
									if (groups[n].id == gid) {
										modified = groups[n].name !== val;
										groups[n].name = val;
									} else if (groups[n].name == val) {
										$dialog.error('分组名称不能重复');
										input.value = input.oldVal;
										self = input;
										break;
									}
								}
							}
							if (self) {
								setTimeout(function() {
									self.focus();
								}, 60);
								return false;
							} else if (modified) {
								util.ajax.post('/a/app/friend/group/update.do?_input_encode=UTF-8', {
									gid : gid,
									gname : val
								}, function() {
									target.innerHTML = val;
									$dlg.find('.tabs-menu').html(getTabsHTML());
								});
							}
						}
					}), input = $dlg2.find('input')[0];
					input.focus();
					input.oldVal = input.value = target.innerHTML;
				}
			}
			function mmMove(e) {
				if (!dragging)
					return;
				e.preventDefault();
				var offY = e.clientY - pos.y;
				if (status === "testing") {
					var offX = e.clientX - pos.x;
					if (offX * offX + offY * offY >= 25) {
						dragging.css({
							'position' : 'relative',
							'cursor' : '-moz-grabbing'
						}).css('opacity', 0.9);
						status = "moving";
					} else {
						return;
					}
				}
				if (status === "moving") {
					var d0 = dragging[0];
					var next = util.getSibling(d0, 'next'), prev = util.getSibling(d0, 'previous');
					if (offY > 25 && next) {
						pos.y += 25;
						next = util.getSibling(next, 'next');
						next ? d0.parentNode.insertBefore(d0, next) : d0.parentNode.appendChild(d0);
					} else if (offY < -25 && prev) {
						pos.y -= 25;
						d0.parentNode.insertBefore(d0, prev);
					}
					dragging.css({
						'left' : e.clientX - pos.x + "px",
						'top' : e.clientY - pos.y + "px"
					});
					window.getSelection && window.getSelection().removeAllRanges();
					document.selection && document.selection.empty();
				}
			}
			function mmUp(e) {
				if (status === 'ready')
					return;
				$(document).unbind('mousemove', mmMove).unbind('mouseup', mmUp);
				if (status === 'moving') {
					var list = dragging[0].parentNode;
					dragging.css({
						'position' : '',
						'left' : '',
						'top' : '',
						'cursor' : ''
					}).css('opacity', 1);
					for ( var n = 0, L = list.children.length; n < L; n++) {
						var elem = list.children[n];
						groups[n] = {
							id : parseInt(elem.getAttribute('data-gid')),
							name : elem.firstChild.innerHTML
						};
					}
					$dlg.find('.tabs-menu').html(getTabsHTML());
					dragging = null;
					status = "docking";
				} else {
					status = "ready";
				}
			}
			function getTabsHTML() {
				for ( var i = 0, arr = [ '<li><a href="javascript:;">全部新鲜事</a></li><li class="split-tag">|</li>' ]; i < groups.length
				&& i < 4; i++) {
					var group = groups[i];
					arr.push('<li><a href="javascript:;" title="', group.name, '"><span>', stringUtil.gbSubstr(group.name, 4),
					'</span></a></li><li class="split-tag">|</li>');
					if (i === 3) {
						arr.push('<li><a href="javascript:;"><span>更多</span></a></li>');
					}
				}
				return arr.join('');
			}
		},
		filter_hidden : false,
		currentGid : -2,
		onClick : function(e) {
			var action = (target = e.currentTarget).getAttribute("action");
			e.preventDefault();
			switch (action) {
			case "group":
				self.qiyu && self.qiyu.dispose();
				var gid = target.getAttribute("data-gid");
				self.resetTypes();
				self.feed.setParam({
					showtype : 0,
					gid : gid
				});
				if (target.nodeName !== "LI") {
					$.fn.each.call(target.parentNode.children, function() {
						this.style.display = this === target ? "none" : "";
					});
					var btnAll = self.find("ul.tabs-menu li.current").attr('data-gid', gid);
					btnAll = btnAll.find('span');
					btnAll.html(btnAll.html().replace(/\s*[^<]*/,
					gid === '-2' ? target.innerHTML : stringUtil.gbSubstr(target.innerHTML, 4)));
				}
				break;
			case "down":
				self.showGroups();
				break;
			case "type":
				var type = target.getAttribute("data-tid");
				var old = self.$filter.find('.current')[0];
				if (old != target) {
					old.className = "";
					target.className = "current";
				}
				self.feed.setParam('showtype', type);
				break;
			case "reload":
				self.feed.reload();
				break;
			case "collapse":
				var hidden = self.filter_hidden = !self.filter_hidden;
				self.$filter.slideToggle(hidden);
				self.find('i.icon-collapse').toggleClass("expand", hidden);
				break;
			case "sort":
				self.beginSort();
				break;
			case "qiyu":// 奇遇
				self.initQiyu();
				break;
			}
		},
		initQiyu : function(type) {
			if (this.qiyu) {
				this.qiyu.feed.reload();
			} else {
				require("app::feed::adventure", function(adventure) {
					window.scrollTo(0, 0);
					self.activateTab(1);
					adventure.init(self, type);
				});
			}
		},
		activateTab : function(n) {
			var tabs = self.find('.tabs-menu li');
			tabs.each(function(i) {
				this.className = i == n ? "current" : "";
			});
			return this;
		}
	}, new $.fn.init());
	util.channel.listenOther("feed", "group", function(e) {
		self.setGroups(e.data);
	});
	define('app::feed::feedgroup', self);
	function getAction(elem) {
		var ret, n = 6;
		while (n && elem && !(ret = elem.getAttribute('action'))) {
			elem = elem.parentNode;
			n--;
		}
		return {
			value : ret,
			element : elem
		};
	}
});