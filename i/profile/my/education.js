(function($,ms) {

var cardInst;

function initCard(){
	cardInst = new $.iCard({
		bindElement: '#canvas',
		onFollow: function(param){
			$a = $('#canvas').find('a[userid="'+param.xpt+'"]').removeClass().addClass('already-attention').html('已跟随');
		},
		onUnfollow: function(param){
			$a = $('#canvas').find('a[userid="'+param.xpt+'"]').removeClass().html('<span class="profile-icon-add"></span>跟随');
		}
	});
}

	var Education = {
		schoolpop: null,
		init: function() {
			this.initReset();
			var self = this,
				sels = $('#sel_school'),
				selp = $('#select_parent'),
				selpc = selp.children();
			/*
			sels.bind('change', function(e) {
				self.sType = $(this).val();
				if($(this).val() != '6') {
					$(selpc[1]).show();
				} else {
					setTimeout(function() {
						$(selpc[1]).hide();
					}, 0);
				}
				$('#school_input').val('');
				$('.profile-input').val('');
				self.getSchoolInfo(self.getSelVal());
				self.removeLetterClass();
			});
			
			(function() {
				if(!ms.area) return;
				self.initProvince(selpc[0], selpc[1]);
			})();
			$(selpc[0]).bind('change', function(e) {
				self.getSchoolInfo(self.getSelVal());
				self.removeLetterClass();
			});
			$(selpc[1]).bind('change', function(e) {
				self.getSchoolInfo(self.getSelVal());
				self.removeLetterClass();
			});
			this.initLetterSort();
			this.initScEvent();
			*/
			this.initBindBTN();
			this.initCssLine();
			this.ieBug = $.browser.msie && parseFloat($.browser.version) < 8;
		},
		initCssLine: function() {
			var el = $('.school-list-item');
			el.each(function(index, item) {
				$(item).removeClass('school-list-end');
				if(index == (el.length - 1)) {
					$(item).addClass('school-list-end');
				}
			});
		},
		// 默认需要重置的学校信息数据
		resetData: {
			type: 6,
			name: '',
			year: 0,
			privacy: 0
		},
		_resetData: function() {
			this.resetData = {
				type: 6,
				name: '',
				year: 0,
				privacy: 0
			};
		},
		// “保存”“取消”按钮的事件绑定
		initBindBTN: function() {
			var self = this;
			$('.profile-btn-save').bind('click', function(e) {
				self.submitData();
			});
			$('.profile-btn-cancel').bind('click', function(e) {
				self.initReset(self.resetData);
			});
			$('.profile-btn-append').bind('click', function(e) {
				self.changeOptionMode('.add-school-item');
				self.initReset();
			});
		},
		// 提交数据
		submitData: function() {
			var sc = $('#sel_school').val(),
				sp = $('#add_set_pre').find('input').val(),
				sn = $('#school_input').val(),
				sy = $('#school_year').val();
			if($.trim(sn) === '') {
				$('#school_input').addClass('profile-input-error').next().html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>请填写学校名称，还是<a href="http://q.sohu.com/forum/21/topic/1504090" target="_blank">没有找到学校？</a></em></span>');
				return;
			}
			if(!this.isModify) {
				var para = {
					schoolid: $('#school_input').attr('schoolid'),
					type: sc,
					name: sn,
					year: sy,
					privacy: sp
				};
			} else {
				var _sid = $('#school_input').attr('schoolid');
				_sid = _sid ? _sid : this.schoolid;
				var para = {
					userschoolid: this.userschoolid,
					schoolid: _sid,
					type: sc,
					name: sn,
					year: sy,
					privacy: sp
				};
			}
			this.addSchool(para, this.isModify);
		},
		// 添加修改学校信息（用同一个接口）
		addSchool: function(para, el, cp) {
			var _url = '/a/profile/service/add_school.htm';
			this.isModify = (function() {
				if(el) {
					_url = '/a/profile/service/update_school.htm';
					return el;
				} else {
					return false;
				}
			})();
			var self = this;
			$.ajax({
				url: _url,
				type: 'post',
				data: para,
				dataType: 'json',
				success: function(res) {
					self.addSchoolCallback(para, res, cp);
				}
			});
		},
		// 当学校信息大于等于15条，则不再显示添加学校的信息
		isShowOptionMode: function() {
			if($('.school-list-item').length >= 15) {
				setTimeout(function(){
					$('.add-school-item').hide();
				},0);
			} else {
				$('.add-school-item').show();
			}
		},
		// 添加学校成功信息
		addSchoolCallback: function(para, res, cp) {
			if(res.code != 0) return false;
			var s = {
				'6': '大学',
				'4': '高中',
				'3': '初中',
				'1': '小学'
			},
			p = {
				'0': '所有人可见',
				'1': '我跟随的人可见',
				'2': '仅自己可见'
			},
			_p = p[para.privacy] ? p[para.privacy] : p[0];
			var _userschoolid = para.userschoolid ? para.userschoolid : res.data;
			var _input = '<input type="hidden" privacy="'+ para.privacy +'" year="'+ para.year +'" schoolname="'+ para.name +'" schooltype="'+ para.type +'" schoolid="'+ para.schoolid +'" userschoolid="'+ _userschoolid +'" />';
			var __year = (para.year == 0) ? '' : '-'+ para.year +'年';
			var __school = s[para.type] ? s[para.type] + ' ' : '';
			var __search_school = 'http://i.sohu.com/searchuser/home/index.htm?_input_encode=UTF-8&type=2&schoolid='+ para.schoolid +'&schooltype='+ para.type;
			__search_school = (para.year && para.year != '0') ? __search_school + '&year=' + para.year : __search_school;
			var html = '<div class="school-list-item">'
					   +_input
                       +'<div class="school-list-item-title clearfix">'
                       +'<div class="profile-intimity-menu" style="display:none">'
                       +'<span class="profile-intimity-menu-title profile-icon">'
					   +'<input type="hidden" value="'+ para.privacy +'" />'
                       +'<a target="_blank" href="#"><i class="global-icon-privacy-12">隐私</i>'+ _p +'<span class="profile-icon-menu-jt"></span></a></span></div>'
                       +'<span class="list-item-title-amend profile-icon" style="display:none">'
                       +'<a href="#" vattr="update"><i class="global-icon-setup-12">设置</i>修改</a></span>'
                       +'<span class="list-item-title-del profile-icon" style="display:none">'
                       +'<a href="#" vattr="del"><i class="global-icon-del-12">删除</i>删除</a></span>'
                       +'<span class="list-item-title-quest profile-icon" style="display:none">'
                       +'<a href="#" vattr="find">找同学<span class="profile-icon-jt-down"></span></a></span>'
                       +'<strong><a vattr="sch" href="'+ __search_school +'" target="_blank">'+ para.name +'</a></strong><span class="date-info">' + __school + __year +'</span></div></div>';
			var el = $(html);
			// $('.add-school-item').append($('.profile-school-info'));
			this.changeOptionMode('.add-school-item');
			if(this.isModify) {
				$(this.isModify).after(el);
				$(this.isModify).remove();
			} else {
				$('.school-list').append(el);
			}
			this.bindScOption(el);
			this.initReset();
			this.resetSchoolLayer();
			this.isModify = false;
			this.initCssLine();
			this.isShowOptionMode();
			if(cp) return;
			this.findFriendsList(el.find('.profile-icon-jt-down').parent(), el);
		},
		// 删除学校
		delSchool: function(userschoolid, el) {
			var self = this;
			$.ajax({
				url: '/a/profile/service/delete_school.htm',
				type: 'post',
				data: {'userschoolid': userschoolid},
				dataType: 'json',
				success: function(res) {
					if(res.code == 0) {
						$(el).remove();
						self.initCssLine();
						self.isShowOptionMode();
					}
				}
			});
		},
		isModify: false,
		// 绑定学校信息元素的事件
		bindScOption: function(el) {
			var self = this;
			$(el).hover(function(e) {
				// $('div.profile-intimity-menu', $(this)).show();
				// $('span.profile-icon', $(this)).show();
				var __el = $($(this).children()[1]).children();
				// 隐私设置，修改，删除，找同学元素列表
				$(__el[0]).show();
				$(__el[1]).show();
				$(__el[2]).show();
				$(__el[3]).show();
			},function(e) {
				// $('div.profile-intimity-menu', $(this)).hide();
				// $('span.profile-icon', $(this)).hide();
				var __el = $($(this).children()[1]).children();
				$(__el[0]).hide();
				$(__el[1]).hide();
				$(__el[2]).hide();
				$(__el[3]).hide();
			}).bind('click', function(e) {
				var _e = $(e.target);
				if(_e.attr('vattr') == 'sch' || _e.attr('vattr') == 'bubble' || _e.parent().attr('vattr') == 'bubble') return;
				if(_e.attr('vattr') == 'update') {
					var va = $($(this).children()[0]),
						schoolname = va.attr('schoolname'),
						schooltype = va.attr('schooltype'),
						year = va.attr('year'),
						privacy = va.attr('privacy'),
						schoolid = va.attr('schoolid'),
						userschoolid = va.attr('userschoolid');
					self.isModify = $(_e).parent().parent().parent();
					var para = {
						type: schooltype,
						name: schoolname,
						year: year,
						privacy: privacy
					};
					
					self.userschoolid = userschoolid;
					self.schoolid = schoolid;
					self.resetData = para;
					self.initReset(para, schoolid);
					self.changeOptionMode(this);
					$(this).find('.school-list-item-con').remove();
					$(this).find('.profile-icon-jt-up').removeClass('profile-icon-jt-up').addClass('profile-icon-jt-down');
				} else if(_e.attr('vattr') == 'del') {
					var __ce = this;
					function __del_cb() {
						var va = $($(__ce).children()[0]),
							userschoolid = va.attr('userschoolid'),
							__el = $(_e).parent().parent().parent();
						self.changeOptionMode('.add-school-item');
						self.initReset();
						self.resetSchoolLayer();
						self.initCssLine();
						self.delSchool(userschoolid, $(__el));
					}
					$.confirm({
						title: false,
						content: '<div class="profile-win-clew"><div class="boxC"><p style="margin-bottom:0px;">确认删除此学校信息？</p></div></div>',
						onConfirm: function() {
							__del_cb();
						}
					});
				} else if(_e.attr('vattr') == 'find' || _e.parent().attr('vattr') == 'find') {
					self.findFriendsList(_e, this);
				} 
				/*
				else if(_e.attr('vattr') == 'attention' || _e.children().attr('vattr') == 'attention') {
					
				}
				*/
				else if(_e.attr('vattr') == 'attentionall') {
					var __a = $(this).find('.list-item-con-data .item-con-data-add a'),
						list = (function() {
							var l = [];
							__a.each(function(index, item) {
								if($(item).hasClass('already-attention')) return;
								l.push($(item).attr('userid'));
							});
							return l;
						})();
					self.addAttention({
						'userid': list.join()
					}, __a);
				}
				e.preventDefault();
			});
			
			// 绑定菜单事件 
			$(el).each(function(index, item) {
				var __el = $($(item).children()[1]).children();
				var _obj = {
					name: 'proset_' + parseInt(Math.random()*100000000),
					el: $(__el[0]),
					html: '<ul><li><a vindex="0" href="javascript:;">所有人可见</a></li><li><a vindex="1" href="javascript:;">我跟随的人可见</a></li><li><a vindex="2" href="javascript:;">仅自己可见</a></li></ul>',
					callback: function(p) {
						var va = $($(item).children()[0]),
							schoolname = va.attr('schoolname'),
							schooltype = va.attr('schooltype'),
							year = va.attr('year'),
							privacy = va.attr('privacy'),
							schoolid = va.attr('schoolid'),
							userschoolid = va.attr('userschoolid');
						var para = {
							userschoolid: userschoolid,
							schoolid: schoolid,
							type: schooltype,
							name: schoolname,
							year: year,
							privacy: p
						};
						self.isModify = $(item);
						self.addSchool(para, self.isModify, true);
					},
					ishide: true
				};
				$['profileapp'].changePrivacy([_obj]);
			});
		},

		// 找同学列表的事件行为单提出来，会被多次调用到
		findFriendsList: function(_e, _this) {
			var __ce = _this,
				self = this;
			var _el = _e.attr('vattr') == 'find' ? _e : 
					  _e.parent().attr('vattr') == 'find' ? _e.parent() : null;
			if(!_el) return;
			var va = $($(_this).children()[0]),
				schooltype = va.attr('schooltype'),
				year = va.attr('year'),
				schoolid = va.attr('schoolid');
			var __e = _el.find('span');
			if(__e.hasClass('profile-icon-jt-down')) {
				var para = {
					schooltype: schooltype,
					schoolid: schoolid
				};
				if(year != 0) para.year = year;
				self.getFriendsBySchool(para, __ce);
				$('.school-list-item .profile-icon-jt-up').each(function(index, item) {
					var ___ce = $(item).parent().parent().parent().parent();
					self.findClose($(item), ___ce);
				});
				if(self.ieBug) {
					var _t = setTimeout(function() {
						clearTimeout(_t);
						_t = null;
						self.findOpen(__e, __ce);
					}, 0);
				} else {
					self.findOpen(__e, __ce);
				}
			} else {
				self.findClose(__e, __ce);
			}
		},
		
		// 
		findOpen: function(__e, e) {
			this.changeOptionMode('.add-school-item');
			__e.removeClass('profile-icon-jt-down').addClass('profile-icon-jt-up');
			$(e).addClass('school-list-item-open').addClass('school-list-end');
			this.initReset();
		},
		findClose: function(__e, e) {
			$(e).find('.school-list-item-con').remove();
			__e.removeClass('profile-icon-jt-up').addClass('profile-icon-jt-down');
			$(e).removeClass('school-list-item-open').removeClass('school-list-end');
		},

		// 根据学校信息获取相同学校的好友
		getFriendsBySchool: function(para, el) {
			var self = this;
			$.ajax({
				url: '/a/search/user/search/school.do?_input_encode=UTF-8',
				type: 'post',
				data: para,
				dataType: 'json',
				success: function(res) {
					self.getFriendsBySchoolCallback(res, el, para);
				}
			});
		},
		getFriendsBySchoolCallback: function(res, el, para) {
			var _n = '', _c = '',self = this;
			if(res.code == 1) {
				_n = res.num > 500 ? '有超过<strong class="red">500</strong>位同学已经在这儿' : '有<strong class="red">'+ res.num +'</strong>位同学已经在这儿';
				_c = '<span class="profile-btn"><input vattr="attentionall" type="button" value="跟随全部" class="profile-btn-attention ui-btn-w80"></span>';
			} else if(res.code == 2) {
				_n = res.msg;
				_c = '';
			}
			var _html = [];
			$.each(res.data, function(index, item) {
				var _blog_url = item.url;
				_html.push('<li>'
					   +'<a vattr="bubble" target="_blank" href="'+ _blog_url +'"><img height="50" width="50" src="'+ item.image +'" data-card-action="xpt='+item.userid+'" data-card-type="isohu" data-card="true"></a>'
					   +'<span class="item-con-data-name"><a vattr="bubble" target="_blank" href="'+ _blog_url +'" title="'+ item.nick +'" data-card-action="xpt='+item.userid+'" data-card-type="isohu" data-card="true">'+ self.cutCjkString(item.nick,8,'',0) +'</a></span>'
					   +'<span class="item-con-data-add profile-icon"><a userid="'+ item.userid +'" vattr="attention" href="#"><span class="profile-icon-add"></span>跟随</a></span>'
					   +'</li>');
			});
			var _view = 'http://i.sohu.com/searchuser/home/index.htm?_input_encode=UTF-8&type=2&schoolid='+ para.schoolid +'&schooltype='+ para.schooltype;
			_view = (para.year && para.year != '0') ? _view + '&year=' + para.year : _view;
			var html = '<div class="school-list-item-con">'
					   +'<div class="list-item-con-title"><a vattr="bubble" target="_blank" href="'+ _view +'">查看全部&gt;&gt;</a>'+ _n +'</div><div class="list-item-con-data clearfix">'
					   +'<ul>'
					   +_html.join('')
					   +'</ul>'
					   +'</div>'
					   +'<div class="list-item-con-btn">'
					   +_c
					   +'</div>'
					   +'</div>';
			try {
				$(el).find('.school-list-item-con').remove();
			} catch (e) {}
			var self = this;
			$(el).append($(html)).find('.item-con-data-add').bind('mousedown', function(e) {
				var _e = $(this).find('a'),
					userid = _e.attr('userid');
				if(!userid) return;
				self.addAttention({
					userid: userid
				}, _e);
			});
		},
		// 添加跟随接口
		addAttention: function(para, el) {
			var self = this;
			//para.from_type = 'school_recommend';
			$.ajax({
				url: '/a/app/friend/addattentions.do?from_type=school_recommend',
				type: 'post',
				data: para,
				dataType: 'json',
				success: function(res) {
					self.addAttentionCallback(res, el, para);
				}
			});
		},
		addAttentionCallback: function(res, el, para) {
			if(res.code != 0){
				$.alert(res.msg);
				return;
			}
			$(el).addClass('already-attention').removeAttr('vattr').html('已跟随');
			if($(el).length > 1) {
				$('input.profile-btn-attention').removeAttr('vattr').attr('disabled', 'true').removeClass('profile-btn-attention').addClass('profile-btn-attention-hover').css({
					'color': '#cdcdcd'
				});
			}
			cardInst.clearCache();
		},
		// 改变添加学校信息的DOM位置
		changeOptionMode: function(el) {
			if(typeof el == 'string') {
				$('.add-school-item-title').show();
				$('.add-school-btn').hide();
				var self = this;
				var _t = setTimeout(function() {
					clearTimeout(_t);
					_t = null;
					self.isModify = false;
					self._resetData();
				}, 0);
			} else {
				$('.add-school-item-title').hide();
				$('.add-school-btn').show();
			}
			if($(el).find('.profile-school-info').length == 0)
				$(el).append($('.profile-school-info'));
			$('.school-list-item-open').removeClass('school-list-item-open').removeClass('school-list-end');
			this.hideLayer();
		},
		// 获取select选择框的信息
		getSelVal: function() {
			/*
			var sels = $('#sel_school'),
				selp = $('#select_parent'),
				selpc = selp.children(),
				v1 = sels.val(),
				v2 = $(selpc[0]).val(),
				v3 = $(selpc[1]).val();
			return v1 == '6' ? {
				stype: v1,
				provid: v2,
				cityid: '0'
			} : {
				stype: v1,
				provid: v2,
				cityid: v3
			};
			*/
		},
		// 
		initPCData: function(el, data) {
			if(!ms.area) return;
			var html = [];
			for(var key in data) {
				html.push('<option value="'+ key +'">'+ data[key] +'</option>');
			}
			$(el).html(html.join(''));
		},
		// 初始化省市的下拉列表
		initProvince: function(pel, cel) {
			if(!ms.area) return;
			var self = this;
			this.initPCData(pel, ms.area.province);
			var v = $(pel).val(),
				cv = ms.area.city[v];
			this.initPCData(cel, cv);
			$(pel).bind('change', function(e) {
				var v = $(this).val(),
					cv = ms.area.city[v];
				self.initPCData(cel, cv);
			});
		},
		isinityear: false,
		initReset: function(par, schoolid) {
			var _par = par ? par : {
				type: 6,
				name: '',
				year: 0,
				privacy: 0
			},
			s = {
				'6': 0,
				'4': 1,
				'3': 2,
				'1': 3
			};
			if(isNaN(parseInt(_par.privacy))) _par.privacy = 0;
			var selsc = $('#sel_school'),
				selye = $('#school_year'),
				sclinput = $('#school_input'),
				aspre = $('#add_set_pre');
			
			// selsc[0].selectedIndex = s[_par.type];
			// selsc.val(s[_par.type]);
			selsc.val(_par.type);
			sclinput.val(_par.name);
			//$('#select_parent').children().first().val('1');
			var _schoolid = schoolid ? schoolid : '0';
			sclinput.attr('schoolid', _schoolid).removeClass('profile-input-error').next().html('');
			if(!this.isinityear) {
				var y = new Date().getFullYear(),
					ys = ['<option value="0">请选择</option>'];
				for(var i=1976;i<=y;i++) {
					ys.push('<option value="'+ i +'">'+ i +'</option>');
				}
				selye.html(ys.join(''));
			}
			var __y = _par.year >= 1976 ? _par.year : 0;
			selye.val(__y);
			var priHash = ['所有人可见','我跟随的人可见','仅自己可见'];
			$['profileapp'].changePrivacy([{
				name: 'aspre',
				el: aspre,
				html: '<ul><li><a vindex="0" href="javascript:;">所有人可见</a></li><li><a vindex="1" href="javascript:;">我跟随的人可见</a></li><li><a vindex="2" href="javascript:;">仅自己可见</a></li></ul>'
			}]);
			aspre.find('a').html('<i class="global-icon-privacy-12">隐私</i>'+ priHash[_par.privacy] +'<span class="profile-icon-menu-jt"></span>');
			aspre.find('input').attr('value', _par.privacy);
			/*
			$['profileapp'].resetPrivacy([{
				name: 'aspre',
				el: aspre,
				privacy: _par.privacy
			}]);
			*/
		},
		focusLetter: null,
		letter: '',
		// 初始化按字母排序
		initLetterSort: function() {
			/*
			var self = this;
			$('.school-name-search-letter-sort').find('a').bind('click', function(e) {
				e.preventDefault();
				if($(this).html() == self.letter) return;
				var par = $.extend({'qindex': $(this).html()}, self.getSelVal());
				self.getSchoolInfo(par, '/a/profile/service/school_qindex.htm');
				self.removeLetterClass();
				self.focusLetter = $(this);
				self.letter = $(this).html();
				$(this).addClass('now');
			});
			*/
		},
		removeLetterClass: function() {
			//if(this.focusLetter) this.focusLetter.removeClass('now');
		},
		// 初始化选择学校信息
		initScEvent: function() {
			var self = this;
			$('.school-name-list').bind('click', function(e) {
				e.preventDefault();
				var el = e.target;
				if(el.nodeName.toLowerCase() == 'a') {
					$('#school_input').attr('value', $(el).attr('title')).removeClass('profile-input-error').next().html('');
					// self.schoolid = $(el).attr('schoolid');
					$('#school_input').attr('schoolid', $(el).attr('schoolid'));
					self.hideLayer();
				}
			});
		},
		userschoolid: null,
		// 学校id
		schoolid: 0,
		// 存储学校类型
		sType: 6,
		initSchoolLayer: function() {
			var elsch = $('#school_input'),
				clsbtn = $('.profile-icon-close'),
				$type = $('#sel_school'),
				self = this;
			this.schoolpop = new ms.SchoolSearch();
			$type.change(function(){
				elsch.val('').removeClass('profile-input-error').next().html('');
				elsch.attr('schoolid', '');
			});
			elsch.bind('focus', function(e) {
				this.blur();
				self.schoolpop.show({
					type: $type.val(),
					at: elsch,
					onSelected: function(sName,sId){
						elsch.val(sName).removeClass('profile-input-error').next().html('');
						elsch.attr('schoolid', sId);
					}
				});
				/*
				self.showLayer();
				var pos = $(this).offset(),
					ph = $(this).box('ih', 'ptb', 'btb');
				$('.school-name-search').css({
					'top': pos.top + ph,
					'left': pos.left,
					'zIndex': 99999999
				});
				var __index = $(window).scrollTop();
				var __t = setInterval(function() {
					if(__index >= pos.top) {
						clearInterval(__t);
						__t = null;
						return false;
					}
					$(window).scrollTop(__index);
					__index += 30;
				}, 13);
				var _type = $('#sel_school').val();
				if(_type != '6') {
					$('#select_parent').children().last().show();
				} else {
					setTimeout(function() {
						$('#select_parent').children().last().hide();
					}, 0);
				}
				self.getSchoolInfo(self.getSelVal());
				*/
			});
			clsbtn.find('a').bind('click', function(e) {
				e.preventDefault();
				self.hideLayer();
			});
		},
		// 重置学校选择信息
		resetSchoolLayer: function() {
			$('input.profile-input').val('');
			/*
			var self = this;
			$('#select_parent').children().each(function(index, item) {
				if(index == 0) $(item).val('1');
				if(index == 1) {
					var cv = ms.area.city['1'];
					self.initPCData($(item), cv);
					$(item).hide();
				}
			});
			this.getSchoolInfo(this.getSelVal());
			*/
		},

		showLayer: function() {
			/*
			$('.school-name-search').show();
			$('#school_year').hide();
			*/
		},
		hideLayer: function() {
			/*
			$('.school-name-search').hide();
			$('#school_year').show();
			*/
		},
		replaceCJK: /[\u2E80-\u9FFF\uF92C-\uFFE5]/g,
		testCJK: /[\u2E80-\u9FFF\uF92C-\uFFE5]/,
		isCjk: function(strValue){
			return this.testCJK.test(strValue);
		},
		cjkLength: function(strValue){
			return strValue.replace(this.replaceCJK, "lv").length;
		},
		cutCjkString: function(str,len,suffix,slen){
			suffix = suffix || '';
			slen = slen || suffix.length;
			len -= slen;
			if(this.cjkLength(str) <= len){
				return str;
			}
			var s = str.split(''),c = 0,tmpA = [];
			for(var i=0;i<s.length;i+=1){
				if(c < len){
					tmpA[tmpA.length] = s[i];
				}
				if(this.isCjk(s[i])){
					c += 2;
				}else{
					c += 1;
				}
			}
			return tmpA.join('') + suffix;
		},
		// 输入框提示
		inputS: function() {
			/*
			var self = this;
			this.notFound = $('<div class="suggest-clew" style="display:none;">请检查输入是否正确或为全称，<br>或者<a target="_blank" href="http://q.sohu.com/forum/21/topic/1504090">联系我们添加此学校</a></div>').appendTo($('div.school-name-search'));
			// http://i.sohu.com/a/profile/service/school_suggestion.htm?stype=6&sugg=武汉工业&provid=0&cityid=0
			$('.profile-input').bind('focus', function() {
				$(this).next().show();
			}).bind('blur', function() {
				$(this).next().hide();
			}).ajaxSuggest({
				appendTo: 'div.school-name-search',
				autoSelectFirst: true,
				useCache: false,
				// url: '/a/search/user/friend/sug.do?cb=?&_input_encode=UTF-8',
				url: '/a/profile/service/school_suggestion.htm?&_input_encode=UTF-8',
				dataType: 'json',
				paramName: 'sugg',
				extraParams: function() {
					var selv = $('#sel_school').val(),
						sels = $('#select_parent').children(),
						sp = $(sels[0]).val(),
						sc = $(sels[1]).val();
					return selv == '6' ? {
						'stype': selv,
						'provid': sp,
						'cityid': '0'
					} : {
						'stype': selv,
						'provid': sp,
						'cityid': sc
					};
				},
				funFormatResults: function(data){
					var ary,results = [];
					if(data.status == 0){
						if($.isArray(data.data)){
							ary = data.data;
							for(var i=0;i<ary.length;i+=1){
								results[results.length] = {
									data: ary[i][0],
									value: ary[i][1]
								};
							}
						}
					}
					if(results.length == 0){
						self.showNotFound();
					}else{
						self.hideNotFound();
					}
					return results;
				},
				funFormatItem: function(value,data,lastValue){
					lastValue = $.trim(lastValue);
					value = self.cutCjkString(value,22,'...',2);
					if(lastValue == ''){
						return value;
					}
					var reg = new RegExp('('+lastValue+')','ig');
					return value.replace(reg,'<strong>$1</strong>');
				},
				onItemSelect: function(data){
					// $form.submit();
					$('#school_input').attr('value', $('.profile-input').attr('value')).removeClass('profile-input-error').next().html('');
					$('#school_input').attr('schoolid', data.data);
					setTimeout(function() {
						self.hideLayer();
					}, 0);
				},
				onFinished: function(){
					if($('.profile-input').val() == ''){
						self.hideNotFound();
					}
				}
			});
			*/
		},
		showNotFound: function(){
			this.notFound.show();
			var $input = $('input.profile-input');
			var offset = $input.offset();
			var parentOffset = this.notFound.offsetParent().offset();
			this.notFound.css({
				zIndex:1,
				width: 181,
				backgroundColor: '#fff',
				height: '36px',
				top: offset.top + $input.outerHeight() - parentOffset.top - 1,
				left: offset.left - parentOffset.left - 1
			});
			if(this.ieBug){
				$('div.school-name-search').find('select.profile-select').hide();
			}
		},
		hideNotFound: function(){
			this.notFound.hide();
			if(this.ieBug){
				$('div.school-name-search').find('select.profile-select').show();
			}
		},
		// 
		showSchoolInfo: function() {
			/*
			var self = this,
				para = (function() {
					if(self.sType == 6) {
						return {
							stype: 6,
							provid: 1
						};
					}
				})();
			this.getSchoolInfo(para);
			*/
		},
		// {
		// 	stype: 6,
		//	provid: 1,
		//	cityid: 1
		// }
		getSchoolInfo: function(para, url) {
			/*
			var self = this,
				_url = url ? url : '/a/profile/service/school_select.htm';
			$.ajax({
				url: _url,
				data: para,
				dataType: 'json',
				success: function(res) {
					if(res.status != 0) return;
					$('.school-name-list').html(self.drawSinfo(res.data));
				}
			});
			*/
		},
		drawSinfo: function(datalist) {
			/*
			var html = [],
				self = this;
			if($.isArray(datalist)) {
				$.each(datalist, function(index, item) {
					html.push('<li><a href="#" schoolid="'+ item[0] +'" title="'+ item[1] +'">'+ self.cutCjkString(item[1],20,'...',2) +'</a></li>');
				});
			}
			return '<ul>'+ html.join('') +'</ul>';
			*/
		},
		initSchoolLayerPos: function() {
			//$(document.body).append($('.school-name-search'));
		}
	};
	$(document).ready(function() {
		Education.init();
		Education.initSchoolLayer();
		//Education.inputS();
		//Education.showSchoolInfo();
		Education.bindScOption('.school-list-item');
		Education.isShowOptionMode();
		//Education.initSchoolLayerPos();
		initCard();
	});
})(jQuery,MYSOHU);