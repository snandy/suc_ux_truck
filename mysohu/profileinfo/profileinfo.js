(function($) {
		// 获取帐号base64的兼容
		var xpt = function() {
			try {
				return window._xpt || (window.$space_config && window.$space_config._xpt) || 
						Base64.encode(/focus\.cn$/ig.test(PassportSC.cookie.userid) ?
						(PassportSC.cookie.uid + "@focus.cn") : PassportSC.cookie.userid);
			} catch(e) {
				return null;
			}
		};
		
		// 个人信息模块
		var profileInfo = {
			// proInfo: '__profile_info',
			proInfo: 'profile_widget_info',
			// 检查全局变量是否已经被命名过
			checkProVal: function() {
				try {
					if(window[this.proInfo]) {
						alert(this.proInfo + '这个变量已经被占用了，请重新命名');
						return false;
					}
					return true;
				} catch(e) {
					return false;
				}
			},
			getUrl: function() {
				try {
					var _xp = xpt(),
						_vn = this.proInfo,
						_url = 'http://profile.blog.sohu.com/service/profile.htm?xp='+ _xp +'&vn=' + _vn + '&_a=' + +new Date();
						// _url = 'http://test.sohu.com/index_host.htm?xp='+ _xp +'&vn=' + _vn + '&a=a.js';
						// _url = 'http://10.1.80.133:8102/api/profile.jsp';
					return _url;
				} catch(e) {
					return '';
				}
			},
			// 自定义返回值的全局变量
			setProInfo: function(arg) {
				this.proInfo = arg;
			},
			init: function() {
				var _arg = arguments;
				if(!$.isFunction(_arg[0])) return;
				if(_arg[1] && typeof _arg[1] === 'string') {
					this.setProInfo(_arg[1]);
				}
				if(!this.checkProVal()) return false;
				var _url = this.getUrl(),
					_self = this;
				$.getScript(_url, function() {
					try {
						_arg[0]();
					} catch(e) {}
				});
			}
		};
		
		// 勋章模块
		var medalInfo = {
			init: function() {
				var _a = arguments[0];
				if(!$.isFunction(_a)) return;
				var _url = 'http://api.ums.sohu.com/sur/summary.json',
					_callback = '__medal_info_' + parseInt(Math.random()*100000);
				$.ajax({
					url: _url + '?xpt=' + xpt() + '&callback=?',
					dataType: 'jsonp',
					scriptCharset: 'utf-8',
					success: function(data) {
						_a(data);
					}
				});
			}
		};

		// 好友模块
		var friendsInfo = {
			init: function() {
				var _a = arguments[0];
				if(!_a || typeof _a !== 'object') return;
				// if(!$('#attention_btn')) return;
				var _url = '/a/app/friend/friend/count.do';
				$.ajax({
					url: _url,
					cache: false,
					data: {'xpt': xpt()},
					dataType: 'json',
					success: function(_obj) {
						try {
							_a.callback(_obj);
							isfollow(_obj.data.isAtted, _a.nologin, _a.islogin);
						} catch(e) {}
					}
				});
				// 根据登陆与否，判断关注区域是否显示
				// isadd:是否已经加过关注
				function isfollow(isadd, nologin, islogin) {
					sched();
					
					function sched(){
						if(typeof PassportSC == "undefined"){
							setTimeout(arguments.callee, 100);
							return;
						}
						if(PassportSC.cookie) {
							islogin(isadd);
						} else {
							nologin();
						}
					}
				}
			}
		};

		var avatarInfo = {
			avInfo: '__avatar_info_' + parseInt(Math.random()*10000),
			init: function() {
				var _xpt = xpt(),
					_url = 'http://i.sohu.com/api/accountinfo.do?xp=' + _xpt + '&vn=' + this.avInfo,
					_arg = arguments,
					_self = this;
				if(!$.isFunction(_arg[0])) return;
				$.getScript(_url, function() {
					var _data = window[_self.avInfo][_xpt];
					_arg[0](_data);
				});
			}
		};

		// 公用接口
		if($.iProfile) {
			return;
		}
		$.iProfile = {
			_pinf: profileInfo.proInfo,
			_ainf: avatarInfo.avInfo,
			_xpt: xpt,
			// 获取用户性别，住址相关的接口
			// 这个接口不是标准的ajax接口，是一个script跨域请求的数据接口
			// 接口支持两个参数
			// callback: function (回调函数)
			// varname: string (可自定义返回值所占用的全局变量名称，如果不传这个参数，默认'__profile_info')
			getProfile: function() {
				var arg = arguments;
				try {
					profileInfo.init(arg[0], arg[1]);
				} catch(e) {}
			},
			// 获取用户勋章相关数据的接口
			// 接口参数只有一个，类型为function
			// callback: function
			getMedal: function() {
				try {
					medalInfo.init(arguments[0]);
				} catch(e) {}
			},
			// 获取用户关注，粉丝数据；以及当前用户是否被关注的接口
			// 获取好友信息的接口参数是一个object
			// 由于获取好友状态需要区分用户是否登陆
			// 所以object中有3个属性
			// callback: function (ajax的回调函数)
			// nologin: function (如果用户在未登录的情况下需要处理的回调)
			// islogin: function (用户在已经登录的情况下处理的回调函数)
			getFriends: function() {
				try {
					friendsInfo.init(arguments[0]);
				} catch (e) {}
			},
			// 获取头像接口
			getAvatar: function() {
				var arg = arguments;
				try {
					avatarInfo.init(arg[0], arg[1]);
				} catch (e) {}
			}
		};
	})(jQuery);