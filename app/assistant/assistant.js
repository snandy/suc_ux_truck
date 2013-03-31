require(
	"core::util::jQuery",
	"plugins::swfobject",
	"core::util[ajax,cookie,channel,userData]",
	"app::assistant::popup",
	"core::util::Ready",
	function($, SWFObject, util, Popup, Ready) {
		var defaults = {
			'width' : 124,
			'height' : 126,
			setting : {
				"name" : "狐狐",
				"location" : [ 1, 0, 20, 25 ],
				"hostName" : "主人",
				"hidden" : -1,
				"percent" : 100,
				"browseTip" : "欢迎来到我的地盘，想说点什么吗？给我留言或者发短消息吧~",
				"recevieTypes" : "11111"
			}
		};
		var logHead = $space_config._currentSite === 'person' ? 'show_helper_' : 'helper_';
		var isMine = util.cookie.isMine;
		var config = null;
		var assistant = {
			handle : null,
			setting : null,
			init : function() {
				var aid = "assist_" + util.uuid();
				this.$dom = $('<div class="i-assist" style="z-index:2000;width:' + defaults.width + 'px;height:' + defaults.height + 'px;"><div style="position:absolute;overflow:hidden;"><div style="margin-left: -100px; margin-top: -100px;"><span id="wrapper_' + aid + '"></span></div></div></div>');
				this.$dom.toggle = function(bool) {
					assistant.domHidden = !bool;
					this.css(bool ? {
						width : defaults.width,
						height : defaults.height,
						overflow : ''
					} : {
						width : 0,
						height : 0,
						overflow : 'hidden'
					});
				};
				this.$dom.css("position", util.ie == 6 ? "absolute" : "fixed").appendTo(document.body);
				this.$dom.$innerWrapper = (this.$dom.$outerWrapper = this.$dom.children()).children();
				if (SWFObject.getFlashPlayerVersion().major === 0) {
					return noFlash();
				}
				// flash installed
				var q = new Ready("handle", "setting", this.init_stage2);
				util.ajax.getJSON('/a/assistant/personal/get?xpt=' + $space_config._xpt, function(ret) {
					if (ret.code == 0)
						q.ready("setting", ret.data || defaults.setting);
				});
				SWFObject.embedSWF('http://s3.suc.itc.cn/app/assistant/loader.v20120821.swf', 'wrapper_' + aid, 800, 600,
					'9.0.0', 'http://s3.suc.itc.cn/mysohu/plugins/swfobject/expressInstall.swf', {
						'skey' : util.cookie.skey,
						'config' : "20120821"
					}, {
						'quality' : 'high',
						'wmode' : 'transparent',
						'allowscriptaccess' : 'always'
					}, {
						'id' : aid,
						'name' : aid
					}, function(ret) {
						if (ret.success) {
							var handle = assistant.handle = ret.ref;
							~function sched() {
								if (typeof handle.callFlash === "function") {
									q.ready("handle", handle);
								} else {
									setTimeout(sched, 10);
								}
							}();
						} else {
							noFlash();
						}
					});
				function noFlash() {
					require("app::assistant::picture", function(handle) {
						handle(assistant, aid);
					});
				}
			},
			config : function(_conf) {
				// call flash config
				this.handle.$config(config = _conf);
			},
			$config : function(_conf) {
				if (_conf) {
					// called from flash
					config = _conf;
				} else {
					load('/app/assistant/conf.js');
				}
			},
			$timeout : function(status, idleTimes) {// as状态倒计时完成触发
				// console.log('$timeout', arguments);
				switch (status) {
				case "destroy":// 动画销毁完成
					this.idle();
					break;
				case "default":// 空闲超时
					var sched = this.schedEvent;
					if (!this.$triggerEvent && sched) {
						this.schedEvent = null;
						this.setEvent(sched.callback, sched.name);
					} else if (this.hidden == 1) {
						this.setStatus("sleep");
						this.toggleHide();
					} else if (idleTimes == 2) {// 耍宝时间到
						this.invoke('ai', "shuabao");
					}
					break;
				case "shuabao":// 耍宝完成
					this.$setMargin(0);
					this.setStatus("default", config.ai.idleBeforePlay);
					break;
				case "nod":// 菜单收起
					this.idle();// idle
					break;
				}
			},
			init_stage2 : function(handle, setting) {
				var self = assistant;
				var types = setting.recevieTypes;
				self.setting = {
					nick : setting.name,
					lord : setting.hostName,
					welcome : setting.browseTip,
					festival : getType(0),
					inform : getType(1),
					whisper : getType(2),
					event : getType(3),
					quest : getType(4),
					percent : setting.percent
				};
				(self.hidden = setting.hidden) == 1 && self.toggleHide();
				setting.location || (setting.location = defaults.setting.location);
				self.pos = {
					left : Boolean(setting.location[0]),
					top : Boolean(setting.location[1]),
					x : setting.location[2],
					y : setting.location[3]
				};
				self.firstLogin = self.invoke('isFirstLogin', util.cookie.skey);
				self.invoke("setOpacity", self.setting.percent);
				self.initPosition();
				self.initEvents();
				if (isMine)
					self.runPlugins();
				else
					self.initFe();
				function getType(n) {
					return types.charAt(n) === '1';
				}
			},
			initEvents : function() {// init event bindings
				var self = this;
				isMine && util.channel.listenOther("assist", "pos", function(e) {
					self.setPosition(e.data);
				});
				this.$dom.$outerWrapper.bind('click', function(e) {
					if (self.inBound(e)) {
						// self.invoke("ai", "clicked");
						self.$log('hit');
					}
				});
				$(document).bind('mouseleave', function() {
					self.invoke('ai', 'onRollOut');
				});
			},
			load : function(key) {
				return this.invoke("load", util.cookie.skey, key);
			},
			save : function(key, val) {
				this.invoke("save", util.cookie.skey, key, val);
				return this;
			},
			inBound : function(e) {
				var pos = this.$dom.position(), mouseX = e.pageX, mouseY = e.pageY;
				return mouseX >= pos.left && mouseY >= pos.top && mouseX <= pos.left + defaults.width - 10 && mouseY <= pos.top + defaults.height;
			},
			initFe : function() {
				var self = this;
				this.invoke("ai", 'access', 'fe', true);
				this.hidden != 1 && this.setEvent(function() {
					new Popup({
						handle : self,
						className : "fe-welcome",
						dir : "bottom",
						content : self.setting.nick + ": " + self.setting.welcome.replace(/</g, '&lt;')
					}).css({
						left : "80px"
					}).bind(Popup.Collapse, function() {
						self.idle();
					});
				}, "Defaultvisit");
			},
			initPosition : function() {
				var self = this;
				this.setPosition(this.pos || {
					left : true,
					top : false,
					x : 10,
					y : 10
				});
				var status = "ready";
				var currPos;
				this.$dom.$outerWrapper.bind("mousedown", mmDown);
				$(window).bind('resize', mmResize);
				var wndWidth, wndHeight;
				mmResize();
				function mmResize() {
					wndWidth = document.documentElement.clientWidth - defaults.width;
					wndHeight = document.documentElement.clientHeight - defaults.height;
					autoPos();
					if (util.ie == 6)
						self.calcPos();
				}
				if (util.ie == 6)
					$(window).bind('scroll', function() {
						self.calcPos();
					});
				/**
				 * 自动调整位置
				 * 
				 * @param reset
				 *            是否强制调整位置
				 */
				function autoPos(reset) {
					var pos = self.pos;
					if (pos.x > wndWidth / 2) {
						pos.x = wndWidth - pos.x;
						pos.left = !pos.left;
						reset = true;
					}
					if (pos.y > wndHeight / 2) {
						pos.y = wndHeight - pos.y;
						pos.top = !pos.top;
						reset = true;
					}
					pos.x < 0 && (pos.x = 0);
					pos.y < 0 && (pos.y = 0);
					reset && self.setPosition(pos);
				}
				function mmDown(e) {// start dragTest
					if (status != "ready")
						return;
					if (!self.inBound(e))
						return;
					status = "testing";
					$(document.body).bind("mousemove", mmMove).bind("mouseup mouseleave", mmUp);
					currPos = {
						x : e.clientX,
						y : e.clientY
					};
				}
				function mmMove(e) {
					var dx = e.clientX - currPos.x, dy = e.clientY - currPos.y;
					if (status == "testing" && dx * dx + dy * dy >= 81) {
						status = "moving";
						self.moving = true;
					}
					if (status == "moving") {
						var pos = self.pos;
						pos.x += pos.left ? dx : -dx;
						pos.y += pos.top ? dy : -dy;
						autoPos(true);
						currPos = {
							x : e.clientX,
							y : e.clientY
						};
					}
				}
				function mmUp(e) {
					$(document.body).unbind("mousemove", mmMove).unbind("mouseup mouseleave", mmUp);
					if (status == "moving") {
						self.moving = false;
						e.stopPropagation();
						if (isMine) {
							self.savePosition();
							util.channel.broadcast("assist", "pos", self.pos);
						}
					}
					status = "ready";
				}
			},
			setPosition : function(pos) {
				// console.dir(pos);
				var param = {
					left : '',
					right : '',
					top : '',
					bottom : ''
				};
				param[pos.left ? "left" : "right"] = pos.x + "px";
				if (util.ie !== 6) {
					param[pos.top ? "top" : "bottom"] = pos.y + "px";
				} else {
					param.top = document.documentElement.scrollTop + (pos.top ? pos.y : document.documentElement.clientHeight - pos.y - defaults.height) + "px";
				}
				this.pos = pos;
				this.$dom.css(param);
				return this;
			},
			savePosition : function() {
				this.popup && this.popup.options.dir == 'auto' && this.popup.autoPos();
				var self = this;
				var saveTimeout = this.lastSaved ? 6000 + this.lastSaved - new Date().getTime() : 0;
				if (saveTimeout <= 0) {
					save();
				} else if (!this.saveTimer) {
					this.saveTimer = setTimeout(save, saveTimeout);
				}
				function save() {
					self.saveTimer = 0;
					self.lastSaved = new Date().getTime();
					var pos = self.pos;
					util.ajax.get("/a/assistant/personal/setlocations?locations=" + [ pos.left ? 1 : 0, pos.top ? 1 : 0, pos.x,
						pos.y ].join());
				}
				return this;
			},
			/**
			 * 推送消息
			 * 
			 * @param type
			 *            消息类型，有效值为：event:事件，msg:消息
			 * @param data
			 */
			pushMsg : function(type, data) {
				// console.log("msg: ", type, data);
				if (type === "event") {
					var unread = this.handle.$checkUnread(data.id);
				}
			},
			runPlugins : function() {
				// 一个一个执行plugin，如果plugin返回为false，则继续执行下一个plugin，否则等待plugin
				var self = this;
				// plugin名字，前面带#的表示需要firstLogin
				var plugins = [ "jiaoxue", "#welcome", "event", "message" ];
				var handler = {
					disabled : {},
					disable : function(name) {
						handler.disabled[name] = true;
					},
					next : next
				};
				if (util.ie <= 7 && !window.localStorage) {
					plugins.unshift("channel");
					runPlugin();
				} else {
					next(1000);
				}
				function runPlugin() {
					if (!plugins.length)
						return;
					var name = plugins.shift();
					if (name.charAt(0) == '#') {
						if (!self.firstLogin) {
							return next(0);
						}
						name = name.substr(1);
					}
					if (handler.disabled[name]) {
						return next(0);
					}
					require("app::assistant::plugins::" + name, function(plugin) {
						var next = false;
						try {
							next = plugin(self, handler);
						} finally {
							next || runPlugin();
						}
					});
				}
				function next(n) {
					plugins.length && setTimeout(runPlugin, typeof n === "undefined" ? 10000 : n);
				}
			},
			schedEvent : null,
			setEvent : function(callback, name, dontDisturb) {
				// console.log('setEvent', arguments);
				if (this.invoke('ai', 'isBusy'))
					return;
				var self = this;
				if (dontDisturb && this.domHidden) {
					this.schedEvent = {
						callback : callback,
						name : name
					};
					return;
				}
				this.$dom.toggle(true);
				this.btnShow && this.btnShow.hide();
				var popup = new Popup({
					handle : this,
					autoCollapse : false,
					dir : "bottom",
					className : name === "Defaultvisit" ? "news dot" : 'news'
				});
				popup.css({
					left : 60
				}).bind('mouseover', function mover() {
					self.invoke('ai', 'onRollOver');
				});
				this.$triggerEvent = function() {
					self.$triggerEvent = null;
					popup.destroy();
					callback(this);
				};
				this.invoke('ai', 'pushEvent', name || "default");
			},
			invoke : function(name) {
				// console.log('invoke', arguments);
				return this.handle.callFlash.apply(this.handle, Array.prototype.slice.call(arguments));
			},
			$log : function(name) {
				mysohu.put_log(logHead + name);
			},
			$invoke : function(name, args) {
				// console.log("as::invoke", name, args);
				var fun = this["$" + name];
				if (fun) {
					return fun.apply(this, args);
				} else {
					return undefined;
				}
			},
			reset : function() {
				this.invoke("reset");
			},
			setStatus : function(name, time) {
				var __args = Array.prototype.slice.call(arguments);
				__args.unshift("ai", "setStatus");
				// console.log('setStatus', arguments);
				this.handle.callFlash.apply(this.handle, __args);
			},
			idle : function() {
				this.setStatus();
			},
			$setMargin : function(top, right, bottom, left) {
				isNaN(right) && (right = top);
				isNaN(bottom) && (bottom = top);
				isNaN(left) && (left = right);
				var zoom = config.zoom;
				top *= zoom;
				right *= zoom;
				left *= zoom;
				bottom *= zoom;
				this.$dom.$outerWrapper.css({
					width : defaults.width + left + right,
					height : defaults.height + top + bottom,
					top : -top,
					left : -left
				});
				this.$dom.$innerWrapper.css({
					marginTop : top - 100,
					marginLeft : left - 100
				});
			},
			$runExternal : function(name, data) {
				var self = this;
				require("app::assistant::plugins::" + name, function(plugin) {
					plugin(self, data);
				});
			},
			$hide : function(bool) {
				var unset = this.hidden == -1;
				this.hidden = Number(!bool);
				this.toggleHide();
				if (unset && !bool) {
					new Popup({
						dir : "right",
						content : "<p>主人我在这里，有需要的时候可以叫我</p>",
						autoInsert : false
					}).css({
						width : "140px",
						top : "-76px",
						right : "70px"
					}).prependTo(this.btnShow);
				}
				if (bool) {// shown
					this.idle();
				}
				// save state
				util.ajax.getJSON('/a/assistant/personal/setHidden?hidden=' + this.hidden);
			},
			toggleHide : function() {
				this.$dom.toggle(this.hidden != 1);
				if (this.hidden == 1) {
					(this.btnShow || (this.btnShow = $(
						'<div id="float_yjfk" style="display:none;font-size: 12px"><div onclick="mysohu.assistant.$hide(true)" style="position:absolute;right:0;top:-92px;cursor:pointer;width:54px;height:74px;' + (util.ie == 6 ? 'filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'http://s3.suc.itc.cn/app/assistant/fox_hidden.png\');' : 'background:url(\'http://s3.suc.itc.cn/app/assistant/fox_hidden.png\')') + '"></div></div>')
					.appendTo(document.body))).fadeIn();
				} else {
					this.btnShow && this.btnShow.hide();
				}
				this.setStatus("sleep");
			},
			$onCollapse : function() {
				var data = null, $d = $(document);
				return function(d) {
					if (!d) {
						if (data) {
							$d.unbind('mouseup', mmDown);
							data = null;
						}
					} else {
						if (!data) {
							$d.bind('mouseup', mmDown);
						}
						data = d;
					}
				};
				function mmDown(e) {
					for ( var current = e.target, parent = assistant.$dom[0]; current; current = current.parentNode) {
						if (current === parent)
							return;
					}
					assistant.invoke('ai', 'clickOutside', data);
				}
			}(),
			$goto : function(action, url) {
				if (action == "Weibo") {
					var weibo_fabu = $("#onesentencetext");
					if (weibo_fabu.length) {
						window.scrollTo(0, 0);
						weibo_fabu.focus();
						return;
					}
				}
				this.$log({
					'Weibo' : 'pub_tblog',
					'Blog' : 'pub_blog',
					'Photo' : 'pub_album',
					'Video' : 'pub_video',
					'LiuyanAdmin' : 'app_guestbook',
					'Wenda' : 'app_wenda',
					'Yuer' : 'app_baby',
					'Youxi' : 'app_youxi',
					'Jinbi' : 'app_gift',
					'Renwu' : 'app_task'
				}[action]);
				mysohu.setLocation(url, "Youxi|Jinbi".indexOf(action) != -1);
			},
			$Duanxiaoxi : function() {
				this.$log('message');
				if (util.beLogin())
					return;
				require('app::whisper', function(whisper) {
					whisper({
						nick : _sucNick
					});
				});
			},
			$Liuyan : function() {
				this.$log('guestbook');
				if (util.beLogin())
					return;
				$('.main-leavemsg').trigger("focusin").focus();
			},
			$Atta : function() {
				this.$log('at');
				if (util.beLogin())
					return;
				require('app::widgets::atTA', function(atTA) {
					atTA({
						nick : _sucNick
					});
				});
			},
			checkRead : function(ids) {
				var red = this.load("red") || "";
				var tmp = red.split("|");
				var redObj = {};
				for ( var i = 0, L = tmp.length; i < L; i++) {
					redObj[tmp[i]] = true;
				}
				var newRed = [], unread = -1;
				for (i = 0, L = ids.length; i < L; i++) {
					var id = ids[i];
					if (redObj[id])
						newRed.push(id);
					else {
						unread = i;
						for (; i < L; i++) {
							id = ids[i];
							redObj[id] && newRed.push(id);
						}
						break;
					}
				}
				newRed = newRed.join("|");
				newRed != red && this.save("red", newRed);
				return unread;
			},
			calcPos : function() {
				this.$dom[0].style.top = document.documentElement.scrollTop + (this.pos.top ? this.pos.y : document.documentElement.clientHeight - this.pos.y - defaults.height) + "px";
			},
			setRead : function(id) {
				var red = this.load("red");
				if (red) {
					if (("|" + red + "|").indexOf("|" + id + "|") != -1) {
						// already marked as read
						return;
					}
					red += "|" + id;
				} else {
					red = id;
				}
				this.save("red", red);
			}
		};
		require("#document", function() {
			assistant.init();
			assistant.init = null;
		});
		mysohu && (mysohu.assistant = assistant);
		~function shuabao() {
		}();
	});