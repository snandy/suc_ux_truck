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



	var defAddressText = '请填写街道信息';
	var els = {};
	var Work = {
		init: function() {
			this.initReset();
			this.initBindBTN();
			this.initCssLine();
			this.ieBug = $.browser.msie && parseFloat($.browser.version) < 8;
		},
		initEls: function() {
			els['comname']     = $('#com_name');
			els['comnameset']  = $('#com_name_set');
			els['jobstart']    = $('#job_start');
			els['jobend']      = $('#job_end');
			els['jobcurrent']  = $('#job_current');
			els['jobaddrprv']  = $('#job_addr_prv');
			els['jobaddrcity'] = $('#job_addr_city');
			els['jobdesc']     = $('#job_desc');
			els['selcareer']   = $('#sel_career');
			els['seljob']      = $('#sel_job');
			els['seljobname']  = $('#sel_jobname');
			els['jobsave']     = $('#job_save');
			els['jobcancel']   = $('#job_cancel');
			els['joblist'] = $('.job-list');
		},
		// 初始化最后一条css下划线
		initCssLine: function() {
			var el = $('.job-list-item');
			el.each(function(index, item) {
				$(item).removeClass('job-list-end');
				if(index == (el.length - 1)) {
					$(item).addClass('job-list-end');
				}
			});
		},
		// 初始化页面的下拉选框
		initSel: function() {
			var _job_end = this._job_end;
			(function() {
				var y = new Date().getFullYear(),
					html = ['<option value="0">请选择</option>'];
				for(var i=1976;i<=y;i++) {
					html.push('<option value="'+ i +'">'+ i +'</option>');
				}
				els.jobstart.html(html.join('')).bind('change', function(e) {
					var _v = $(this).val();
					els.jobend.html(_job_end(_v));
				});
			})();
			/*
			function _job_end(_y) {
				var y = new Date().getFullYear(),
					html = ['<option value="">请选择</option>'];
				if(!_y) return html.join('');
				for(var i=_y;i<=y;i++) {
					html.push('<option value="'+ i +'">'+ i +'</option>');
				}
				return html.join('');
			}
			*/
			initProvince(els.jobaddrprv, els.jobaddrcity);
			// 
			function initPCData(el, data, p) {
				if(!ms.area) return;
				if(p) {
					var _h = '<option value="0">省/直辖市</option>';
				} else {
					var _h = '<option value="0">选择城市</option>';
				}
				var html = [_h];
				for(var key in data) {
					html.push('<option value="'+ key +'" title="'+ data[key] +'">'+ data[key] +'</option>');
				}
				$(el).html(html.join(''));
			}
			// 初始化省
			function initProvince(pel, cel) {
				if(!ms.area) return;
				var self = this;
				initPCData(pel, ms.area.province, true);
				var v = $(pel).val();
					cv = ms.area.city[v];
				initPCData(cel, cv);
				$(pel).bind('change', function(e) {
					var v = $(this).val(),
						cv = ms.area.city[v];
					initPCData(cel, cv);
				});
			}
			// 选择行业类别
			(function() {
				if(!$.iJob) return;
				var data = $.iJob.data.industry,
					html = ['<option value="0">选择行业类别</option>'];
				$.each(data, function(key, value) {
					html.push('<option value="'+ key +'" title="'+ value +'">'+ value +'</option>');
				});
				els.selcareer.html(html.join(''));
			})();
			// 选择职位
			(function() {
				if(!$.iJob) return;
				var data = $.iJob.data.category,
					html = ['<option value="0">选择职位类别</option>'];
				$.each(data, function(key, value) {
					html.push('<option value="'+ key +'" title="'+ value +'">'+ value +'</option>');
				});
				els.seljob.html(html.join('')).bind('change', function(e) {
					var _v = $(this).val();
					els.seljobname.html(showjobname(_v));
				});
			})();
			// 根据职位类别生成职位名称
			function showjobname(id) {
				if(!$.iJob) return '';
				var data = $.iJob.data.name[id],
					html = ['<option value="0">选择职位名称</option>'];
				if(id == 0) return html.join('');
				$.each(data, function(key, value) {
					html.push('<option value="'+ key +'" title="'+ value +'">'+ value +'</option>');
				});
				return html.join('');
			}
			var self = this;
			els['jobcurrent'].bind('click', function() {
				els['jobend'][0].disabled = this.checked;
			});
		},
		_job_end: function(_y,_end) {
			_end = _end || '';
			var y = new Date().getFullYear(),
				html = ['<option value="">请选择</option>'];
			if(!_y || _y == 0) return html.join('');
			for(var i=_y;i<=y;i++) {
				html.push('<option value="'+ i +'"'+ (i == _end ? ' selected="selected"' : '')+'>'+ i +'</option>');
			}
			return html.join('');
		},
		// “保存”“取消”按钮的事件绑定
		initBindBTN: function() {
			var self = this;
			els['jobsave'].bind('click', function() {
				self.submitData();
			});
			els['jobcancel'].bind('click', function(e) {
				self.initReset(self.resetData);
			});
			$('.profile-btn-append').bind('click', function(e) {
				self.changeOptionMode('.add-job-item');
				self.initReset();
			});
			els['comname'].bind('focus', function(e) {
				$(this).removeClass('profile-input-error').next().html('<span class="profile-input-clew"><em>请填写公司名称，不要超过25个字</em></span>');
				els['comnameset'].hide();
			}).bind('blur', function(e) {
				self.checkWorkName(this);
			});
		},
		cklen: function(str) {
			var index = 0;
			for(var i=0;i<str.length;i++) {
				if(str.charCodeAt(i) > 255) {
					index += 2;
				} else {
					index ++;
				}
			}
			return index;
		},
		checkWorkName: function(el) {
			var _v = $(el).val();
			if($.trim(_v) == '') {
				$(el).addClass('profile-input-error').next().html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>请填写完整公司名称</em></span>');
			} else if(this.cklen(_v) > 50) {
				$(el).addClass('profile-input-error').next().html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>请不要超过25个字</em></span>');
			} else {
				$(el).removeClass('profile-input-error').next().html('<i class="global-icon-right-12">正确</i>');
				els['comnameset'].show();
			}
		},
		// 提交数据
		submitData: function() {
			var para = this.getVal();
			if($.trim(para.employer) == '') {
				els['comname'].addClass('profile-input-error').next().html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>请填写完整公司名称</em></span>');
				els['comnameset'].hide();
				return;
			} else if($('.profile-input-error-clew').length > 0) {
				return;
			} else {
				els['comname'].removeClass('profile-input-error').next().html('');
				els['comnameset'].show();
			}
			if($('.profile-input-error-clew').length > 0) return;
			if(this.isModify) {
				para.workid = this.workid;
			}
			this.addWork(para, this.isModify);
		},
		// 默认的数据
		resetData: {
			address: '',
			career: 0,
			cityid: 0,
			employer: '',
			endyear: 0,
			occupation: 0,
			privacy: 0,
			provinceid: 0,
			startyear: 0,
			subcareer: 0,
			current: 0
		},
		// 重置默认数据
		_resetData: function() {
			this.resetData = {
				address: '',
				career: 0,
				cityid: 0,
				employer: '',
				endyear: 0,
				occupation: 0,
				privacy: 0,
				provinceid: 0,
				startyear: 0,
				subcareer: 0,
				current: 0
			};
		},
		// 获取提交的数据接口
		getVal: function() {
			/*
			employer（必须）： 公司名字
			privacy：    隐私
			address：   工作地址
			provinceid： 省份id
			cityid：        城市id
			startyear：   入职年份
			startmonth： 入职月份
			endyear：    离职年份
			endmonth：  离职月份
			occupation:  行业id
			career： 职位信息id
			subcareer：职位具体信息id
			*/
			var addressDesc = $.trim(els['jobdesc'].val());

			var para = {
				employer: els['comname'].val(),
				privacy: els['comnameset'].find('input').val(),
				address: addressDesc == defAddressText ? '' : addressDesc,
				provinceid: els['jobaddrprv'].val(),
				cityid: els['jobaddrcity'].val(),
				startyear: els['jobstart'].val(),
				endyear: els['jobend'].val(),
				occupation: els['selcareer'].val(),
				career: els['seljob'].val(),
				subcareer: els['seljobname'].val(),
				current: 0
			};
			if(els['jobcurrent'].attr('checked')) {
				para.current = 1;
				delete para.endyear;
			}
			return para;
		},
		isModify: false,
		isShowOptionMode: function() {
			if($('.job-list-item').length >= 15) {
				setTimeout(function(){
					$('.add-job-item').hide();
				},0);
			} else {
				$('.add-job-item').show();
			}
		},
		// 添加接口
		addWork: function(para, el, cp) {
			if(!para) return false;
			var _url = '/a/profile/service/add_work.htm?_input_encode=UTF-8';
			this.isModify = (function() {
				if(el) {
					_url = '/a/profile/service/update_work.htm?_input_encode=UTF-8';
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
					self.addWorkCallback(para, res, cp);
				}
			});
		},
		addWorkCallback: function(para, res, cp) {
			if(res.code == 1) {
				els['comname'].next().html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>单位名称含有不合适字符</em></span>');
				els['comnameset'].hide();
				$(window).scrollTop(els['comname'].offset().top - 10);
				return;
			}
			if(res.code != 0) return false;
			var p = {
				'0': '所有人可见',
				'1': '我跟随的人可见',
				'2': '仅自己可见'
			};
			var _workid = para.workid ? para.workid : res.data;
			var _input = '<input type="hidden" workid="'+ _workid +'" employer="'+ para.employer +'" address="'+ para.address +'" provinceid="'+ para.provinceid +'" cityid="'+ para.cityid +'" startyear="'+ para.startyear +'" endyear="'+ para.endyear +'" occupation="'+ para.occupation +'" career="'+ para.career +'" subcareer="'+ para.subcareer +'" current="'+ para.current +'" />';
			// var _end = para.current == '1' ? '至今' : para.endyear;
			var _time = (function() {
				if(para.startyear != '0' && para.endyear != '0' && para.current != '1') {
					return para.startyear + '-' + para.endyear;
				} else if(para.startyear != '0' && para.current == '1') {
					return para.startyear + '-至今';
				} else if((!para.startyear || para.startyear == '0') && (!para.endyear || para.endyear == '0') && para.current == '1') {
					return '目前';
				} else if(para.startyear != '0' && (!para.endyear || para.endyear == '0') && para.current != '1') {
					return para.startyear + '-';
				} else {
					return '';
				}
			})();
			
			// (para.startyear && para.startyear !=0 && _end) ? para.startyear +'-'+ _end : '';
			var html = '<div class="job-list-item">'
					   + _input
                       +'<div class="job-list-item-title clearfix">'
                       +'<div class="profile-intimity-menu" style="display:none;">'
                       +'<span class="profile-intimity-menu-title profile-icon">'
					   +'<input type="hidden" value="'+ para.privacy +'" />'
                       +'<a href="#"><i class="global-icon-privacy-12">隐私</i>'
                       + p[para.privacy] + '<span class="profile-icon-menu-jt"></span></a></span></div>'
                       +'<span class="list-item-title-amend profile-icon" style="display:none;">'
                       +'<a vattr="update" href="#"><i class="global-icon-setup-12">设置</i>修改</a></span>'
                       +'<span class="list-item-title-del profile-icon" style="display:none;">'
                       +'<a vattr="del" href="#"><i class="global-icon-del-12">删除</i>删除</a></span>'
                       +'<span class="list-item-title-quest profile-icon" style="display:none;">'
                       +'<a vattr="find" href="#">找同事<span class="profile-icon-jt-down"></span></a></span>'
                       +'<strong><a vattr="sch" target="_blank" href="http://i.sohu.com/searchuser/home/index.htm?_input_encode=UTF-8&type=4&employer='+ encodeURIComponent(para.employer) +'">'+ para.employer +'</a></strong><span class="date-info">'
                       +_time +'</span></div></div>';
			var el = $(html);
			this.changeOptionMode('.add-job-item');
			if(this.isModify) {
				$(this.isModify).after(el);
				$(this.isModify).remove();
			} else {
				els['joblist'].append(el);
			}
			this.bindWkOption(el);
			this.initReset();
			this.isModify = false;
			this.initCssLine();
			this.isShowOptionMode();
			if(cp) return;
			this.findFriendsList(el.find('.profile-icon-jt-down').parent(), el);
		},
		// 删除学校
		delWork: function(workid, el) {
			var self = this;
			$.ajax({
				url: '/a/profile/service/delete_work.htm',
				type: 'post',
				data: {'workid': workid},
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
		workid: null,
		// 绑定学校信息元素的事件
		bindWkOption: function(el) {
			var self = this;
			$(el).hover(function(e) {
				var __el = $($(this).children()[1]).children();
				$(__el[0]).show();
				$(__el[1]).show();
				$(__el[2]).show();
				$(__el[3]).show();
			},function(e) {
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
						employer = va.attr('employer'),
						privacy = va.attr('privacy'),
						subcareer = va.attr('subcareer'),
						career = va.attr('career'),
						occupation = va.attr('occupation'),
						endyear = va.attr('endyear'),
						startyear = va.attr('startyear'),
						cityid = va.attr('cityid'),
						provinceid = va.attr('provinceid'),
						address = va.attr('address'),
						workid = va.attr('workid'),
						current = va.attr('current');
					self.isModify = $(_e).parent().parent().parent();
					var para = {
						workid: workid,
						employer: employer,
						privacy: privacy,
						address: address,
						provinceid: provinceid,
						cityid: cityid,
						startyear: startyear,
						endyear: endyear,
						occupation: occupation,
						career: career,
						subcareer: subcareer,
						current: current,
						_input_encode: 'UTF-8'
					};
					self.workid = workid;
					self.resetData = para;
					self.initReset(para);
					self.changeOptionMode(this);
					$(this).find('.job-list-item-con').remove();
					$(this).find('.profile-icon-jt-up').removeClass('profile-icon-jt-up').addClass('profile-icon-jt-down');
				} else if(_e.attr('vattr') == 'del') {
					var __ce = this;
					function __del_cb() {
						var va = $($(__ce).children()[0]),
							workid = va.attr('workid'),
							__el = $(_e).parent().parent().parent();
						self.changeOptionMode('.add-job-item');
						self.delWork(workid, $(__el));
					}
					$.confirm({
						title: false,
						content: '<div class="profile-win-clew"><div class="boxC"><p style="margin-bottom:0px;">确认删除此工作信息？</p></div></div>',
						onConfirm: function() {
							__del_cb();
						}
					});
				} else if(_e.attr('vattr') == 'find' || _e.parent().attr('vattr') == 'find') {
					self.findFriendsList(_e, this);
				} 
				/*
				else if(_e.attr('vattr') == 'attention' || _e.children().attr('vattr') == 'attention') {
					var userid = _e.attr('userid');
					if(!userid) return;
					self.addAttention({
						userid: userid
					}, _e);
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
				if(_e.attr('type') != 'checkbox') e.preventDefault();
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
							employer = va.attr('employer'),
							privacy = va.attr('privacy'),
							subcareer = va.attr('subcareer'),
							career = va.attr('career'),
							occupation = va.attr('occupation'),
							endyear = va.attr('endyear'),
							startyear = va.attr('startyear'),
							cityid = va.attr('cityid'),
							provinceid = va.attr('provinceid'),
							address = va.attr('address'),
							workid = va.attr('workid'),
							current = va.attr('current');
						var para = {
							workid: workid,
							employer: employer,
							privacy: p,
							address: address,
							provinceid: provinceid,
							cityid: cityid,
							startyear: startyear,
							endyear: endyear,
							occupation: occupation,
							career: career,
							subcareer: subcareer,
							current: current,
							_input_encode: 'UTF-8'
						};
						self.isModify = $(item);
						self.addWork(para, self.isModify, true);
					},
					ishide: true
				};
				$['profileapp'].changePrivacy([_obj]);
			});
		},

		//
		findFriendsList: function(_e, _this) {
			var __ce = _this,
				self = this;
			var _el = _e.attr('vattr') == 'find' ? _e : 
					  _e.parent().attr('vattr') == 'find' ? _e.parent() : null;
			if(!_el) return;
			var va = $($(_this).children()[0]),
				employer = va.attr('employer');
			var __e = _el.find('span');
			if(__e.hasClass('profile-icon-jt-down')) {
				var para = {
					employer: employer
				};
				self.getFriendsByJob(para, __ce);
				$('.job-list-item .profile-icon-jt-up').each(function(index, item) {
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
			this.changeOptionMode('.add-job-item');
			__e.removeClass('profile-icon-jt-down').addClass('profile-icon-jt-up');
			$(e).addClass('job-list-item-open').addClass('job-list-end');
			this.initReset();
		},
		findClose: function(__e, e) {
			$(e).find('.job-list-item-con').remove();
			__e.removeClass('profile-icon-jt-up').addClass('profile-icon-jt-down');
			$(e).removeClass('job-list-item-open').removeClass('job-list-end');
		},

		// 根据学校信息获取相同学校的好友
		getFriendsByJob: function(para, el) {
			var self = this;
			$.ajax({
				url: '/a/search/user/search/workmate.do?_input_encode=UTF-8',
				type: 'post',
				data: para,
				dataType: 'json',
				success: function(res) {
					self.getFriendsByJobCallback(res, el, para);
				}
			});
		},
		getFriendsByJobCallback: function(res, el, para) {
			var _n = '', _c = '',self = this;
			if(res.code == 1) {
				_n = res.num > 500 ? '有超过<strong class="red">500</strong>位同事已经在这儿' : '有<strong class="red">'+ res.num +'</strong>位同事已经在这儿';
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
					   +'<span class="item-con-data-add profile-icon" style="background-color:white;"><a userid="'+ item.userid +'" vattr="attention" href="#"><span class="profile-icon-add"></span>跟随</a></span>'
					   +'</li>');
			});
			var html = '<div class="job-list-item-con">'
					   +'<div class="list-item-con-title"><a vattr="bubble" target="_blank" href="http://i.sohu.com/searchuser/home/index.htm?_input_encode=UTF-8&type=4&employer='+ encodeURIComponent(para.employer) +'">查看全部&gt;&gt;</a>'+ _n +'</div><div class="list-item-con-data clearfix">'
					   +'<ul>'
					   +_html.join('')
					   +'</ul>'
					   +'</div>'
					   +'<div class="list-item-con-btn">'
					   +_c
					   +'</div>'
					   +'</div>';
			try {
				$(el).find('.job-list-item-con').remove();
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
		// 添加跟随接口
		addAttention: function(para, el) {
			var self = this;
			//para.from_type = 'workmate_recommend';
			$.ajax({
				url: '/a/app/friend/addattentions.do?from_type=workmate_recommend',
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
				$('.add-job-item-title').show();
				$('.add-job-btn').hide();
				var self = this;
				var t = setTimeout(function() {
					clearTimeout(t);
					t = null;
					self.isModify = false;
					self._resetData();
				}, 13);
			} else {
				$('.add-job-item-title').hide();
				$('.add-job-btn').show();
			}
			if($(el).find('.profile-job-info').length == 0)
				$(el).append($('.profile-job-info'));
			$('.job-list-item-open').removeClass('job-list-item-open').removeClass('job-list-end');
		},
		initReset: function(par) {
			var _par = par ? par : {
				address: '',
				career: 0,
				cityid: 0,
				employer: '',
				endyear: 0,
				occupation: 0,
				privacy: 0,
				provinceid: 0,
				startyear: 0,
				subcareer: 0,
				current: 0
			};
			if(isNaN(parseInt(_par.privacy))) _par.privacy = 0;
			els['comname'].val(_par.employer);
			els['jobstart'].val(_par.startyear);
			els['jobend'].html(this._job_end(_par.startyear,_par.endyear));
			// els['jobend'].val(_par.endyear);
			els['jobaddrprv'].val(_par.provinceid).change();
			//els['jobaddrcity'].val(_par.cityid);
			if(_par.address != '' && _par.address != defAddressText){
				els['jobdesc'].val(_par.address).css('color','#333333');
			}else{
				els['jobdesc'].val(defAddressText).css('color','#aaa');
			}
			els['selcareer'].val(_par.occupation);
			els['seljob'].val(_par.career).change();
			//els['seljobname'].val(_par.subcareer);
			els['comname'].next().html('');
			els['jobdesc'].next().html('');
			if(_par.current == 1) {
				els['jobcurrent'].attr('checked', 'true');
				els['jobend'].attr('disabled', 'true');
			} else {
				els['jobcurrent'].removeAttr('checked');
				els['jobend'].removeAttr('disabled');
			}
			var comname_set = $('#com_name_set');
			var priHash = ['所有人可见','我跟随的人可见','仅自己可见'];
			$['profileapp'].changePrivacy([{
				name: 'comname_set',
				el: comname_set,
				html: '<ul><li><a vindex="0" href="javascript:;">所有人可见</a></li><li><a vindex="1" href="javascript:;">我跟随的人可见</a></li><li><a vindex="2" href="javascript:;">仅自己可见</a></li></ul>'
			}]);
			comname_set.find('a').html('<i class="global-icon-privacy-12">隐私</i>'+ priHash[_par.privacy] +'<span class="profile-icon-menu-jt"></span>');
			comname_set.find('input').attr('value', _par.privacy);
			
			//ie6下如果不这么做会报运行时错误
			setTimeout(function(){
				els['jobaddrcity'].val(_par.cityid);//城市
				els['seljobname'].val(_par.subcareer);//职位名称
			},0);
			/*
			$['profileapp'].resetPrivacy([{
				name: 'comname_set',
				el: comname_set,
				privacy: _par.privacy
			}]);
			*/
		},
		// 街道信息预填值
		prevInput: function() {
			var self = this;
			els['jobdesc'].val(defAddressText).css({
				'color': '#aaa'
			}).bind('focus', function(e) {
				var $this = $(this);
				if($.trim($this.val()) == defAddressText){
					$this.val('');
				}
				$this.css({
					'color': '#333333'
				});
				$this.next().html('<span class="profile-input-clew"><em>请填写详细街道名，不要超过40个字</em></span>');
			}).bind('blur', function(e) {
				var $this = $(this),value = $this.val();
				if($.trim(value) == '') {
					$this.val(defAddressText).css({
						'color': '#aaa'
					}).next().html('');
				}
				else if(self.cklen(value) > 80) {
					$this.next().html('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>请不要超过40个字</em></span>');
				} 
				else {
					$this.next().html('<i class="global-icon-right-12">正确</i>');
				}
			});
		}
	};
	$(document).ready(function() {
		Work.initEls();
		Work.init();
		Work.initSel();
		Work.bindWkOption('.job-list-item');
		Work.isShowOptionMode();
		Work.prevInput();
		initCard();
	});
})(jQuery,MYSOHU);