(function($,ms) {
	var profileBasic = {
		checkInput: function() {
			var el = $('#nick_input'),
				elov = el.attr('value'),
				elname = $('#name_input'),
				nameset = $('#name_set_btn'),
				birthdayset = $('#birthday_set_btn'),
				constallationset = $('#constallation_set_btn'),
				marryset = $('#marry_set_btn'),
				placeset = $('#place_set_btn'),
				detaildesc = $('#detailDesc'),
				elnameov = elname.attr('value'),
				descv = detaildesc.attr('value'),
				tp = el.next(),
				tpname = elname.next(),
				cklen = function(str) {
					var index = 0;
					for(var i=0;i<str.length;i++) {
						if(str.charCodeAt(i) > 255) {
							index += 2;
						} else {
							index ++;
						}
					}
					return index;
				};
			el.bind('focus', function(e) {
				$(this).removeClass('profile-input-error');
				tp.html('<span class="profile-input-clew"><em>请填写4-16位的中英文字符、数字、"_"或减号</em></span>');
			}).bind('blur', function(e) {
				var elv = el.attr('value');
				if($.trim(elv).length == 0) {
					$(this).addClass('profile-input-error');
					tp.html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>请填写昵称</em></span>');
					return false;
				}
				if(!(/^(([a-zA-Z0-9_-])|([\u4e00-\u9fa5]))+$/.test(elv))) {
					$(this).addClass('profile-input-error');
					tp.html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>仅支持中英文字符、数字、"_"或减号</em></span>');
					return false;
				}
				if(cklen(elv) > 16) {
					$(this).addClass('profile-input-error');
					tp.html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>不能超过16个字符或8个汉字</em></span>');
					return false;
				}
				if(cklen(elv) < 4) {
					$(this).addClass('profile-input-error');
					tp.html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>请填写4位以上的字符昵称</em></span>');
					return false;
				}
				// 如果昵称已被占用（这个判断走ajax接口）
				// if(false) {
				// 	tp.html('<span class="profile-input-error-clew"><em>昵称已被占用</em></span>');
				// 	return false;
				// }
				if(elov == elv) {
					$(this).removeClass('profile-input-error');
					tp.html('');
					return false;
				}
				var _self = this;
				tp.html('<span class="profile-icon"><span class="profile-icon-loading"></span></span>');
				var url = '/a/profile/service/nick.htm?n=' + encodeURIComponent(elv) + '&vn=nickisright&_input_encode=UTF-8';
				$.getScript(url, function() {
					if(window['nickisright'] == 0) {
						tp.html('<i class="global-icon-right-12">正确</i>');
						$(_self).removeClass('profile-input-error');
					} else {
						tp.html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>昵称已被占用</em></span>');
						$(_self).addClass('profile-input-error');
					}
				});
				// tp.html('<span class="profile-icon"><span class="profile-icon-right"></span></span>');
				return false;
			});
			elname.bind('focus', function(e) {
				tpname.html('<span class="profile-input-clew"><em>请填写真实姓名，方便我们联系你。你的资料不会被透露给任何人</em></span>');
				$(this).removeClass('profile-input-error');
				nameset.hide();
			}).bind('blur', function(e) {
				var elv = elname.attr('value');
				if($.trim(elv).length == 0 || elnameov == elv) {
					tpname.html('');
					$(this).removeClass('profile-input-error');
					nameset.show();
					return false;
				}
				if(!(/^([a-zA-Z ])+$/.test(elv) || /^([\u4e00-\u9fa5 ])+$/.test(elv)) || cklen(elv) > 16 || cklen(elv) < 4) {
				// if(!(/^(([a-zA-Z])|([\u4e00-\u9fa5]))+$/.test(elv)) || cklen(elv) > 16 || cklen(elv) < 4) {
					tpname.html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>请输入真实姓名</em></span>');
					$(this).addClass('profile-input-error');
					return false;
				}
				tpname.html('<i class="global-icon-right-12">正确</i>');
				$(this).removeClass('profile-input-error');
				nameset.show();
				return false;
			});
			detaildesc.bind('focus', function(e) {
				$(this).next().html('<span class="profile-input-clew"><em>请不要超过200字</em></span>');
			}).bind('blur', function(e) {
				var _v = $(this).attr('value');
				if($.trim(_v).length == 0 || descv == _v) {
					$(this).next().html('');
					return false;
				}
				if(cklen(_v) > 400) {
					$(this).addClass('profile-input-error').next().html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>个性介绍不能超过200字</em></span>');
					return false;
				}
				$(this).removeClass('profile-input-error').next().html('<i class="global-icon-right-12">正确</i>');
			});
			// 权限设置相关
			// console.log(nameset.offset());
			$['profileapp'].changePrivacy([{
				name: 'nameset',
				el: nameset,
				html: '<ul><li><a vindex="0" href="javascript:;">所有人可见</a></li><li><a vindex="1" href="javascript:;">我跟随的人可见</a></li><li><a vindex="2" href="javascript:;">仅自己可见</a></li></ul>'
			}, {
				name: 'birthdayset',
				el: birthdayset,
				html: '<ul><li><a vindex="0" href="javascript:;">公开，完整显示</a></li><li><a vindex="1" href="javascript:;">仅自己可见</a></li><li><a vindex="3" href="javascript:;">只显示月日</a></li></ul>'
			}, {
				name: 'constallationset',
				el: constallationset,
				html: '<ul><li><a vindex="0" href="javascript:;">所有人可见</a></li><li><a vindex="1" href="javascript:;">我跟随的人可见</a></li><li><a vindex="2" href="javascript:;">仅自己可见</a></li></ul>'
			}, {
				name: 'marryset',
				el: marryset,
				html: '<ul><li><a vindex="0" href="javascript:;">所有人可见</a></li><li><a vindex="1" href="javascript:;">我跟随的人可见</a></li><li><a vindex="2" href="javascript:;">仅自己可见</a></li></ul>'
			}, {
				name: 'placeset',
				el: placeset,
				html: '<ul><li><a vindex="0" href="javascript:;">所有人可见</a></li><li><a vindex="1" href="javascript:;">我跟随的人可见</a></li><li><a vindex="2" href="javascript:;">仅自己可见</a></li></ul>'
			}]);
		},
		// 根据生日计算星座
		setConstallation: function() {
			var ye = $('#birthYear'),
				me = $('#birthMonth'),
				de = $('#birthDate'),
				cl = $('#constallation'),
				self = this,
				callback = function() {
					try {
						var mei = me.val(),
							dei = de.val();
						if(mei > 0 && dei > 0) {
							var __c = self.getConstallation(mei, dei);
							cl.html('<option value="'+ __c.n +'">'+ __c.c +'</option>');
						} else {
							cl.html('<option>　</option>');
						}
						cl.next().val(__c.n);
					} catch(e) {}
				};
			callback();
			ye.bind('change', callback);
			me.bind('change', callback);
			de.bind('change', callback);
		},
		// 根据生日获取对应的星座
		getConstallation: function(m, d) {
			if(!m || !d) {
				return {
					c: '',
					n: ''
				};
			}
			var cons = [[321, 420, '白羊座', 1], [421, 521, '金牛座', 2], [522, 621, '双子座', 3], [622, 722, '巨蟹座', 4], [723, 823, '狮子座', 5], [824, 923, '处女座', 6], [924, 1023, '天秤座', 7], [1024, 1122, '天蝎座', 8], [1123, 1221, '射手座', 9], [1222, 1231, '摩羯座', 10], [101, 120, '摩羯座', 10], [121, 219, '水瓶座', 11], [220, 320, '双鱼座', 12]];
			var dd = (function() {
					if(d/10<1) d = '0' + d;
					return parseInt(m + '' + d);
				})(),
				c = '　',
				n = 0;
			for(var i=0;i<cons.length;i++) {
				var item = cons[i];
				if(dd >= item[0] && dd <= item[1]) {
					c = item[2];
					n = item[3];
				}
			}
			return {
				c: c,
				n: n
			};
		},
		// 设置婚姻状况
		setMarry: function() {
			var _id = $('#marryStatus').attr('data-id');
			$('#marryStatus').val(_id);
		},
		// 判断是否激活
		isActive: false,
		checkActive: function() {
			var pel = $('.profile-basic-info'),
				_input = pel.find('input'),
				_select = pel.find('select'),
				_txtarea = pel.find('textarea'),
				_subbt = _input[_input.length - 1],
				self = this;
			// 检测是否激活的逻辑先去掉
			this.isActive = true;
			$(_subbt).removeClass('ui-btn-disabled');
			return;

			$('.profile-basic-info').bind('click', function(e) {
				var el = e.target;
				if(el == _subbt || self.isActive) return;
				var cb = function(index, item) {
					if(el == item) self.isActive = true;
				};
				_input.each(cb);
				_select.each(cb);
				_txtarea.each(cb);
				// console.log(self.isActive);
				// if(self.isActive) {
					// _subbt.className = 'profile-btn-save-set';
					// self.bindSub(_subbt);
				// }
			});
			$('.profile-intimity-menu').bind('click', function(e) {
				if(self.isActive) return;
				self.isActive = true;

				// _subbt.className = 'profile-btn-save-set';
				// self.bindSub(_subbt);
			});
			_input.each(function(index, item) {
				if(index == (_input.length - 1)) return;
				$(item).bind('focus', function(e) {
					self.isActive = true;
				});
			});
			_select.bind('focus', function(e) {
				self.isActive = true;
			});
			_txtarea.bind('focus', function(e) {
				self.isActive = true;
			});
			var __t = setInterval(function() {
				if(self.isActive) {
					clearInterval(__t);
					__t = null;
					_subbt.className = 'ui-btn-w80';
					//self.bindSub(_subbt);
				}
			}, 100);
		},
		// 保存设置按钮的事件绑定
		bindSub: function(el) {
			if(!this.isActive) return false;
			var self = this;
			$(el).bind('mouseover', function(e) {
				this.className = 'profile-btn-save-set-hover';
			}).bind('mouseout', function(e) {
				this.className = 'profile-btn-save-set';
			}).bind('mousedown', function(e) {
				if(!self.isActive) return false;
				this.className = 'profile-btn-save-set-down';
			}).bind('click', function(e) {
				// this.className = 'profile-btn-save-set-send';
			});
		},
		// 检测页面是否有改动
		isChange: false,
		// 是否是提交行为，如果提交不在对页面元素作对比
		isSubmit: false,
		checkData: '',
		initData: function() {
			var pel = $('.profile-basic-info'),
				_input = pel.find('input'),
				_select = pel.find('select'),
				_txtarea = pel.find('textarea'),
				self = this;
			this.checkData = this.getcInputChange(_input, _txtarea);
			_select.each(function(index, item) {
				$(item).bind('change', function(e) {
					if(self.isChange) return;
					self.isChange = true;
				});
			});
			/*
			$(document).bind('click', function(e) {
				var _e = $(e.target);
				if(self.isSubmit) return;
				self.checkChange();
				var __e = (function() {
					if(_e[0].tagName.toLowerCase() == 'a') {
						return _e;
					} else if(_e.parent()[0].tagName.toLowerCase() == 'a') {
						return _e.parent();
					}
					return null;
				})();
				if(self.isChange && __e && __e[0].tagName.toLowerCase() == 'a') {
					var _url = __e.attr('href');
					if(_url.indexOf('/') != -1) {
						$.confirm({
							title: false,
							content: '<div class="profile-win-clew"><div class="boxC"><p style="margin-bottom:0px;">当前资料尚未保存，你确定放弃当前正在编辑的资料？</p></div></div>',
							onConfirm: function() {
								window.location.href = __e.attr('href');
							}
						});
						e.preventDefault();
					}
				}
			});
			*/
			$(document).click(function(event){
				var $target = $(event.target);
				if(self.isSubmit) return;
				self.checkChange();
				if($target.closest('a').length){
					$target = $target.closest('a');
					var _url = $target.attr('href'),_target = $target.attr('target');
					if(self.isChange && _target != '_blank' && !/(?:^javascript)|(?:^#+$)/.test(_url)){
						event.preventDefault();
						$.confirm({
							title: false,
							content: '<div class="profile-win-clew"><div class="boxC"><p style="margin-bottom:0px;">当前资料尚未保存，你确定放弃当前正在编辑的资料？</p></div></div>',
							onConfirm: function() {
								window.location.href = _url;
							}
						});
					}
				}
			});


		},
		
		// 区县信息的缓存
		_location_cache: {
			"0": {}
		},
		// 居住地出生地的设置
		// {
		//		pe: [el, vl],
		//		ce: [el, vl],
		//		le: [el, vl]
		// }
		initPlaceSelect: function(par) {
			if(!par || !ms.area) return;
			var d = ms.area,
				dp = d.province,
				dc = d.city,
				self = this;
			// init province
			function selprovince() {
				var _html = ['<option value="0">选择省份</option>'];
				for(var key in dp) {
					_html.push('<option value="'+ key +'">'+ dp[key] +'</option>');
				}
				par.pe[0].html(_html.join('')).bind('change', function(e) {
					par.ce[0].html(_initcity($(this).val()));
					_initloc("0", function(_html) {
						par.le[0].html(_html).val(par.le[1]);
					});
				});
				var t = setTimeout(function() {
					clearTimeout(t);
					t = null;
					par.pe[0].val(par.pe[1]);
				}, 0);
			}
			// init city
			function _initcity(_pid) {
				var _c = dc[_pid],
					_html = ['<option value="0">选择城市</option>'];
				for(var key in _c) {
					_html.push('<option value="'+ key +'">'+ _c[key] +'</option>');
				}
				return _html.join('');
			}
			function selcity() {
				var _pid = par.pe[0].val();
				par.ce[0].html(_initcity(_pid)).bind('change', function(e) {
					_initloc($(this).val(), function(_html) {
						par.le[0].html(_html).val(par.le[1]);
					});
				});
				var t = setTimeout(function() {
					clearTimeout(t);
					t = null;
					par.ce[0].val(par.ce[1])
				}, 0);
			}
			// init loc
			function _initloc(_cid, cb) {
				var _l = self._location_cache[_cid],
					_html = ['<option value="0">选择区县</option>'],
					_draw = function(data) {
						for(var key in data) {
							_html.push('<option value="'+ key +'">'+ data[key] +'</option>');
						}
						return _html.join('');
					};
				if(_l) {
					if(typeof cb == 'function') cb(_draw(_l));
 				} else {
					$.ajax({
						url: 'http://i.sohu.com/a/profile/service/county.htm',
						data: {
							'cid': _cid
						},
						dataType: 'json',
						success: function(data) {
							if(!data || data.status != 0) return;
							_l = self._location_cache[_cid] = data.data[0];
							if(typeof cb == 'function') cb(_draw(_l));
						}
					});
				}
			}
			function selloc() {
				var _cid = par.ce[0].val();
				_initloc(_cid, function(_html) {
					par.le[0].html(_html);
					var t = setTimeout(function() {
						clearTimeout(t);
						t = null;
						par.le[0].val(par.le[1]);
					}, 0);
				});
			}
			var t = setTimeout(function() {
				clearTimeout(t);
				t = null;
				selprovince();
				var t = setTimeout(function() {
					clearTimeout(t);
					t = null;
					selcity();
					var t = setTimeout(function() {
						clearTimeout(t);
						t = null;
						selloc();
					}, 0);
				}, 0);
			}, 0);
		},

		setPlace: function() {
			var e1 = $('#cprovinceId'),
				e2 = $('#ccityId'),
				e3 = $('#ccountyId'),
				_p = e1.parent(),
				v1 = _p.attr('cprovince'),
				v2 = _p.attr('ccity'),
				v3 = _p.attr('ccounty'),
				ee1 = $('#provinceId'),
				ee2 = $('#cityId'),
				ee3 = $('#countyId'),
				_p2 = ee1.parent(),
				vv1 = _p2.attr('province'),
				vv2 = _p2.attr('city'),
				vv3 = _p2.attr('county');
			this.initPlaceSelect({
				pe: [e1, v1],
				ce: [e2, v2],
				le: [e3, v3]
			});
			this.initPlaceSelect({
				pe: [ee1, vv1],
				ce: [ee2, vv2],
				le: [ee3, vv3]
			});
		},

		// 设置生日
		setBirthday: function(callback) {
			this.initBirthday($('#birthYear'), $('#birthMonth'), $('#birthDate'), callback);
		},
		// 初始化生日的选项
		initBirthday: function(y, m, d, callback) {
			// 生成年(年信息在初始化的时候必须生成，所以放在一个可直接执行的函数中)
			(function() {
				var start = 1900,
					end = new Date().getFullYear(),
					_html = ['<option value="0">选择年</option>'];
				for(var i=end;i>=start;i--) {
					_html.push('<option value="'+ i +'">'+ i +'</option>');
				}
				$(y).html(_html.join(''));
			})();

			// 生成月的函数将被调用
			function showM(_y) {
				var _html = ['<option value="0">选择月</option>'];
				if(!_y || _y == '0') return _html.join('');
				for(var i=1;i<=12;i++) {
					_html.push('<option value="'+ i +'">'+ i +'</option>');
				}
				return _html.join('');
			}
			
			// 根据年月生成对应的日
			function showD(_y, _m) {
				var _html = ['<option value="0">选择日</option>'];
				if(!_m || _m == '0') return _html.join('');
				var isr = (_y%4 == 0 && _y%100 != 0) || (_y%100 == 0 && _y%400 == 0),
					mlist = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
				if(isr) mlist[1] = 29;
				var __m = mlist[_m-1];
				for(var i=1;i<=__m;i++) {
					_html.push('<option value="'+ i +'">'+ i +'</option>');
				}
				return _html.join('');
			}

			// 检查生日选项
			function _check() {
				var _c = function(p) {
					return $(p).val() == '0';
				};
				if((_c(y) && _c(m) && _c(d)) || (!_c(y) && !_c(m) && !_c(d))) {
					$(d).next().next().html('');
					$('#birthday_set_btn').show();
				} else {
					$(d).next().next().html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>请填写完整的生日</em></span>');
					$('#birthday_set_btn').hide();
				}
			}

			$(y).bind('change', function(e) {
				var _v = $(this).val();
				$(m).html(showM(_v));
				$(d).html(showD(_v, 0));
				_check();
			});
			$(m).bind('change', function(e) {
				var _v = $(this).val();
					_yv = $(y).val();
				$(d).html(showD(_yv, _v));
				_check();
			});
			$(d).bind('change', function(e) {
				_check();
			});
			
			var yv = $(y).attr('val'),
				mv = $(m).attr('val'),
				dv = $(d).attr('val'),
				// fix ie6 bug
				_t = setTimeout(function() {
					clearTimeout(_t);
					_t = null;
					$(y).val(yv);
					$(m).html(showM(yv));
					var t1 = setTimeout(function() {
						clearTimeout(t1);
						t1 = null;
						$(m).val(mv);
						$(d).html(showD(yv, mv));
						var t2 = setTimeout(function() {
							clearTimeout(t2);
							t2 = null;
							$(d).val(dv);
							if(typeof callback == 'function') {
								callback();
							}
						}, 0);
					}, 0);
				}, 0);
		},
		getcInputChange: function(input, textarea) {
			var list = [];
			input.each(function(index, item) {
				var c = $(item).attr('checked'),
					v = $(item).attr('value');
				if(c) {
					list.push(c);
				} else {
					list.push(v);
				}
			});
			textarea.each(function(index, item) {
				var v = $(item).attr('value');
				list.push(v);
			});
			return list.join('');
		},
		checkChange: function() {
			if(this.isChange) return;
			var pel = $('.profile-basic-info'),
				_input = pel.find('input'),
				_select = pel.find('select'),
				_txtarea = pel.find('textarea'),
				self = this;
			var list = this.getcInputChange(_input, _txtarea);
			if(list != this.checkData) this.isChange = true;
			return this.isChange;
		},
		// 提交页面
		doSubmit: function() {
			var self = this,
				cpro = $('#cprovinceId'),
				ccou = $('#ccountyId').next(),
				_check = function() {
					var flag = false,
						e = $('.profile-input-error-clew'),
						iss = e.css('display');
					if(iss && iss != 'none') {
						$(window).scrollTop(e.offset().top - 10);
						flag = true;
						return flag;
					}
					if(cpro[0].selectedIndex == 0) {
						$(window).scrollTop(cpro.offset().top - 10);
						ccou.html('<span style="margin-left:0px;" class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>请填写居住地</em></span>');
						flag = true;
						return flag;
					}
					return flag;
				};
			cpro.bind('change', function(e) {
				if(cpro[0].selectedIndex != 0) {
					ccou.html('');
				}
			});
			$('#basic').submit(function() {
				if(_check() || !self.isActive) return false;
				self.isSubmit = true;
				$('#basic :submit').val('正在保存').removeClass('ui-btn-current ui-btn-active').addClass('ui-btn-disabled').attr('disabled', 'true');
			});
		},
		// 提示信息的时间控制
		cTips: function() {
			var e = $('.profile-succeed-clew'),
				e1 = $('.profile-icon-succeed'),
				e2 = $('.profile-icon-failed');
			if(e1.length > 0 && e2.length == 0) {
				try {
					$('p.f12-18').find('a').html($('#nick_input').val());
				} catch (e) {}
			}
			try {
				var t = setTimeout(function() {
					e.slideUp();
				}, 2000);
			} catch(e) {}
		}
	};
	$(document).ready(function() {
		profileBasic.checkInput();
		profileBasic.setBirthday(function() {
			profileBasic.setConstallation();
			profileBasic.initData();
		});
		profileBasic.setPlace();
		profileBasic.setMarry();
		profileBasic.checkActive();
		profileBasic.doSubmit();
		profileBasic.cTips();
	});
})(jQuery,MYSOHU);