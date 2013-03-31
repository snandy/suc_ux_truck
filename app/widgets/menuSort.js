require('#menuItems', 'core::util[userData]', function(menuItems, util) {
	if (!menuItems)
		return;
	var items = util.toArray(menuItems.children);
	if (!menuItems.inited) {
		for ( var n = 0, L = items.length; n < L; n++) {
			items[n].data = n;
		}
		menuItems.inited = items;
	}
	var order = util.userData.menuOrder;
	if (order) {
		for ( var n = 0, L = order.length; n < L; n++) {
			menuItems.appendChild(items[order[n]]);
		}
		menuItems.appendChild(items[items.length - 1]);
	}
});
require('core::util::jQuery', 'core::util[ajax,userData,channel]', '#document', function($, util) {
	// var $dom =, ul, startPos, elemPos, items, $item, dummy, last;
	var appIndexes = {
		"home" : 0,
		"mblog" : 5,
		// "refer" : 5,
		"blog" : 1,
		"photo" : 2,
		"album" : 2,
		"video" : 3,
		"scomment" : 4
	};
	var self = $('div.menu-top');
	util.probe({
		state : "Ready",
		'init' : function() {
			this.ul = document.getElementById('menuItems');
			var items = this.items = this.ul.inited;
			var curr = appIndexes[$space_config._currentApp];
			curr !== undefined && $(items[curr]).addClass("curr");
			this.bind(util.ie ? 'dragstart' : 'mousedown', this.__Down).bind('click', this.__Click);
			util.channel.listenOther("common", "menuSort", function(e) {
				self.setOrder(e.data);
			});
			setTimeout(function() {
				util.ajax.getJSON("/a/setting/navigation/get", function(ret) {
					var arr = ret.navigation;
					for ( var n = 0; n < arr.length; n++)
						arr[n] = parseInt(arr[n]);
					self.setOrder(arr);
				});
			}, 2400);
		},
		order : [ 0, 0, 0, 0, 0 ],
		setOrder : function(order) {
			if (!order || order.slice(0).sort().join('') != '12345')
				return;
			this.order = order;
			for ( var n = 0, last = this.items[this.items.length - 1]; n < order.length; n++) {
				this.ul.insertBefore(this.items[order[n]], last);
			}
			util.userData.menuOrder = order;
			util.userData.save();
		},
		__Down : function(e) {
			if (self.state != "Ready")
				return;
			e.preventDefault();
			var item = findItem(e.target);
			if (!item)
				return;
			self.$current = $(item);
			self.startPos = {
				x : e.clientX,
				y : e.clientY
			};
			$(document).bind("mousemove", self.__Move).bind('mouseup', self.__Up);
			self.state = "Testing";
		},
		__Move : function(e) {
			var offX = e.clientX - self.startPos.x, offY = e.clientY - self.startPos.y;
			if (self.state == "Testing") {
				if (offX * offX + offY * offY < 225)
					return;
				// start drag
				var curr = self.$current[0];
				self.currPos = self.$current.position();
				self.$dummy = $([ '<li class="dummy" style="width:', self.$current.width() - 7, 'px; height:',
					self.$current.height() - 8, 'px"><div style="margin:-4px -4px 0; width:', self.$current.width(),
					'px"></div></li>' ].join(''));
				self.$dummy[0].data = curr.data;
				self.$current.addClass('dragging');
				self.ul.insertBefore(self.$dummy[0], curr);
				self.ul.insertBefore(curr, self.items[0]);
				self.state = "Moving";
			}
			if (self.state == "Moving") {
				var left = offX + self.currPos.left, top = offY + self.currPos.top;
				self.$current.css({
					'left' : left + "px",
					'top' : top + "px"
				});
				left += self.$current.width() / 2;
				var dummy = self.$dummy[0];
				for ( var n = 2, L = self.ul.children.length; n < L; n++) {
					var elem = self.ul.children[n], $elem = $(elem);
					if (left < $elem.position().left + $elem.width() / 2) {
						if (elem != dummy) {
							self.ul.insertBefore(dummy, elem);
						}
						break;
					}
				}
			}
		},
		__Up : function(e) {
			$(document).unbind('mousemove', self.__Move).unbind('mouseup', self.__Up);
			if (self.state === "Testing") {
				self.state = "Ready";
			} else if (self.state === "Moving") {
				var $item = self.$current;
				self.state = "Docking";
				// prevent click
				var arr = [];
				for ( var i = 0; i < self.order.length; i++) {
					arr[i] = parseInt(self.ul.children[i + 2].data);
				}
				var modified = arr.join() != self.order.join();
				if (modified) {
					util.ajax.getJSON('/a/setting/navigation/set?navigation=' + arr.join(''), function(ret) {
						var succ = ret && (ret.code == 0);
						if (!succ) {
							$.notice.error('保存排序失败');
						} else {
							util.channel.broadcast("common", "menuSort", arr);
							util.userData.menuOrder = arr;
							util.userData.save();
						}
					});
				}
				$item.animate(self.$dummy.position(), 'fast', 'swing', function() {
					self.state = "Ready";
					$item.removeClass('dragging').css({
						'left' : "",
						'top' : ""
					});
					self.ul.replaceChild($item[0], self.$dummy[0]);
					self.$current = self.$dummy = null;
				});
			}
		},
		__Click : function(e) {
			if (self.state !== "Ready") {
				e.preventDefault();
			}
		}
	}, self);
	self.init();
	function findItem(elem) {
		for ( var n = 0; n < 6; n++) {
			if (elem.tagName === "LI") {
				return elem.data >= 1 && elem.data <= 5 && elem;
			}
			elem = elem.parentNode;
		}
		return false;
	}
});
