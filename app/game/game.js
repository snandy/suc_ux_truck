;(function($, sohu) {
	var gid = $space_config.gid,//游戏id
		source = $space_config.game_source,
		aidUrl = '/sogougame.html',
		game = {
			init: function() {
				this._getFollow();
				this._event();
				this._server.name();
				this._server.list();
			},
			_event: function() {
				var _self = this;
				
				//进入游戏，先加跟随然后直接进入游戏
				$('#enter-game').click(function() {
					_self._play();
				});
			},
			_getFollow: function() {
				var _self = this,
					flag = false;
				
				//跟随关系
				$.getJSON('/a/app/friend/friend/count.do?xpt=' + this._config.userid, function(json) {
					if(json.code === 1) {
						_self._followStatus(json.data.isAtted);
					}
				});
			},
			_addFollow: function() {//添加跟随
				var url = this._config.addUrl,
					userid = this._config.userid,
					wrap = this._config.wrap,
					nick = this._config.nick,
				param = {
					xpt: userid,
					from_type : 'game'
				};
				$.getJSON(url, param, function(json) {
					if(json.code === 1 || json.code === -2) {
						//friendType : 1 双向好友 0 单向好友
						if(wrap) {
							$('<span class="btn-gray-h20 ui-btn-later"><span>已跟随</span></span>').insertAfter(wrap.children().first()).next().remove();
						}
						//弹出设置分组对话框
						if($.iCard && $.iCard.SetGroupsDialog) {
							$.iCard.SetGroupsDialog.show({
								friendid: json.data.friendId,
								nick: nick,
								friendType: json.data.friendType,
								xpt: userid
							});
						}
					}else{
						$.inform({
							icon : 'icon-error',
							delay : 1000,
							easyClose : true,
							content : json.msg || '添加跟随失败'
						});
					}
				});
			},
			_followStatus: function(s) {//跟随状态
				var _self = this,
					r = [];
				if (window.$space_config) {
					$space_config.isAtted = s;
				}
				
				this._config.wrap = $('#attention-wrapper');
				if(!this._config.wrap.length) {
					return;
				}
				r.push('<span class="ui-btn btn-green-h20"><span class="attention-home">访问公共主页</span></span>');
				//没有关系
				if(s == -1) {//s为字符串类型'-1'
					r.push('<span class="ui-btn btn-green-h20"><span class="attention-status"><i class="ui-btn-icon"></i>跟随');
				}else if(s == 0 || s == 3) {//单向跟随,我跟随他
					r.push('<span class="btn-gray-h20 ui-btn-later"><span>已跟随');
				}else if(s == 2) {//互相跟随
					r.push('<span class="btn-gray-h20 ui-btn-later"><span>已跟随');
				}
				r.push('</span></span>');
				this._config.wrap.html(r.join(''));
				
				this._config.wrap.click(function(event) {
					var target = event.target,
						className = target.className;
					if(className === 'attention-status') {
						_self._addFollow();
					}else if(className === 'attention-home') {
						window.open(_self._config.homeUrl);
					}
				});
			},
			_play: function(sid) {
				var _self = this;
				
				//加跟随
				var userid = this._config.userid,
					param = {
						xpt: userid,
						from_type : 'game'					
					};
				$.getJSON(this._config.addUrl, param);
			},
			_server: {
				wrap: null,
				url: 'http://wan.sogou.com/webservice/iserverlist.do?callback=?&gid=' + gid,
				lastLoginUrl: 'http://wan.sogou.com/webservice/irecentserver.do?callback=?&gid=' + gid,
				playUrl: aidUrl + '?gid=' + gid + '&sid=',
				part: [],
				total: [],
				latest: null,
				name: function() {
					var _self = this,
						url = this.lastLoginUrl;
						$.getJSON(url, function(data) {
							if(data) {
								if($.isEmptyObject(data)) {//最新服
									_self.first();
								}else{//上次登录服务器
									_self.last(data, '上次登录：');
								}
							}
						});				
				},
				list: function() {
					var _self = this,
						url = this.url,
						callback = this.update;
					$.getJSON(url, function() {
						callback.apply(_self, arguments);
					});
				},
				update: function(data) {
					if(data) {
						var i = 0,
							length = data.length,
							cur,
							count = 0,
							s;
						this.wrap = $('#server-list');
						
						if(length > 14) {
							this.button();
						}
						for(; i < length; i++) {
							cur = data[i];
							if(cur) {
								count++;		
								s = '<li><a href="' + this.playUrl + cur.sid + '&s=' + this.title() + '&source=' + source + '" target="_blank">搜狗'+ cur.sid + '服</a></li>';
								if(count < 15) {
									this.part.push(s);
								}
								this.total.push(s);
							}
						}
						this.latest = data[0];
						this.defaults();
					}
				},
				toggle: function(elem) {
					if(elem.hasClass('down')) {
						this.more();
						elem.removeClass('down').addClass('up').text('收起列表');
					}else{
						this.defaults();
						elem.removeClass('up').addClass('down').text('更多选择');
					}
				},
				button: function() {
					var _self = this;
					//游戏列表，更多选择
					$('#server-more').show().click(function() {
						_self.toggle($(this));
					});
				},
				more: function() {
					var tmp = this.total.join('');
					if(this.wrap && tmp) {
						this.wrap.html(tmp);
					}
				},
				defaults: function() {
					var tmp = this.part.join('');
					if(this.wrap && tmp) {
						this.wrap.html(tmp);	
					}
				},
				status: function(data, msg) {
					$('#server-default').text('搜狗' + data.sid + '服').prev().text(msg);
					$('#enter-game').attr('href', this.playUrl + data.sid + '&s=' + this.title() + '&source=' + source);
				},
				first: function() {
					var _self = this;
					if(!_self.latest) {
						setTimeout(function() {
							_self.first();
						}, 10);
					}else{
						_self.status(_self.latest, '默认新服：');
					}
				},
				last: function(data, s) {
					this.status(data, '上次登录：');			
				},
				title: function() {
					var s = document.title,
						match = (s || '').replace(/\s+/g, '').match(/\S+(?=-)/),
						r = '';
					if(match) {
						r = encodeURIComponent(encodeURIComponent(match[0]));
					}
					return r;
				}
			},
			_config: {
				addUrl: '/a/app/friend/friend/add.do',
				homeUrl: $space_config.game_url,
				userid: $space_config.game_xpt,
				nick: $space_config.game_nick,
				wrap: null
			}
		};
	
	$(function() {
		game.init();
	});
})(jQuery, mysohu);
