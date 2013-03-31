(function($) {
	var Contact = {
		els: {},
		initEls: function() {
			this.els['contacted'] = $('#contacted');
			this.els['mobile'] = $('#mobile_num');
			this.els['landphone'] = $('#landphone_num');
			this.els['email'] = $('#email_num');
			this.els['website'] = $('#website_num');
			this.els['savebt'] = $('.profile-btn-save-set');
		},
		// 输入框对应的提示信息
		tipInfo: {
			mobile: {msg: ['<span class="profile-input-clew"><em>请输入正确的手机号码</em></span>', '<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>手机号码格式不对</em></span>', '<i class="global-icon-right-12">正确</i>'], func: 'checkMobile'},
			landphone: {msg: ['<span class="profile-input-clew"><em>请输入正确的固定电话</em></span>', '<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>格式请参考010-80000000</em></span>', '<i class="global-icon-right-12">正确</i>'], func: 'checkPhone'},
			email: {msg: ['<span class="profile-input-clew"><em>请输入正确的邮箱地址</em></span>', '<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>邮箱格式不对</em></span>', '<i class="global-icon-right-12">正确</i>'], func: 'checkEmail'},
			website: {msg: ['<span class="profile-input-clew"><em>多项内容用逗号隔开，例如“www.sohu.com,blog.sohu.com”</em></span>', '', '<i class="global-icon-right-12">正确</i>'], func: 'checkSite'}
		},
		// 检查的状态
		checkStatus: true,
		initCheck: function() {
			var self = this;
			for(var key in this.tipInfo) {
				(function(key) {
					var _msg = self.tipInfo[key]['msg'],
						_fun = self.tipInfo[key]['func'];
					self.els[key].bind('focus', function(e) {
						$(this).prev().hide();
						$(this).next().html(_msg[0]);
						$(this).removeClass('profile-input-error');
					}).bind('blur', function(e) {
						var _v = $.trim($(this).val());
						if(_v == '') {
							self._isnull(this);
							self.checkStatus = true;
						} else if(self[_fun](_v)) {
							self._isright(this, _msg);
							self.checkStatus = true;
						} else {
							self._iserror(this, _msg);
							self.checkStatus = false;
						}
					});
				})(key);
			}
		},
		_isnull: function(el) {
			$(el).prev().show();
			$(el).next().html('');
			$(el).removeClass('profile-input-error');
		},
		_iserror: function(el, _msg) {
			$(el).next().html(_msg[1]);
			$(el).addClass('profile-input-error');
		},
		_isright: function(el, _msg) {
			$(el).prev().show();
			$(el).next().html(_msg[2]);
			$(el).removeClass('profile-input-error');
		},
		// 手机号码格式验证
		checkMobile: function() {
			var arg = arguments[0];
			if(!arg) return false;
			// if((/^(?:13\d|15[89])-?\d{5}(\d{3}|\*{3})$/.test($.trim(arg)))) return true;
			// /^[1][3,5,8][0-9]{9}$/
			var regu =/^1[0-9]{10}$/; 
			var re = new RegExp(regu); 
			if(re.test(arg)) { 
				return true; 
			} else { 
				return false; 
			}
		},
		// 固定电话验证
		checkPhone: function() {
			var arg = arguments[0];
			if(!arg) return false;
			if((/^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test($.trim(arg)))) return true;
			return false;
		},
		// 检查邮件地址
		checkEmail: function() {
			var arg = arguments[0];
			if(!arg) return false;
			// if((/^([a-zA-Z0-9_-.])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test($.trim(arg)))) return true;
			// return false;
			var emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/; 
			if(emailReg.test(arg)) {
				return true;
			} else {
				return false;
			} 
		},
		// 检查站点地址
		checkSite: function() {
			var arg = arguments[0];
			return true;
		},
		__menuhtml: '<ul><li><a vindex="0" href="javascript:;">所有人可见</a></li><li><a vindex="1" href="javascript:;">我跟随的人可见</a></li><li><a vindex="2" href="javascript:;">仅自己可见</a></li></ul>',
		bindPrvMenu: function() {
			var mobileset = $('#mobile_set_btn'),
				phoneset = $('#phone_set_btn'),
				emailset = $('#email_set_btn'),
				// imset = $('#im_set_btn_0'),
				_html = this.__menuhtml,
				imsets = $('#im_info').find('.profile-intimity-menu'),
				imsetobj = (function() {
					var a = [];
					$(imsets).each(function(index, item) {
						a.push({
							name: 'imset_' + parseInt(Math.random()*10000),
							el: $(item),
							html: _html
						});
					});
					return a;
				})(),
				para = [{
					name: 'mobileset',
					el: mobileset,
					html: _html
				}, {
					name: 'phoneset',
					el: phoneset,
					html: _html
				}, {
					name: 'emailset',
					el: emailset,
					html: _html
				}].concat(imsetobj);
				
			$['profileapp'].changePrivacy(para);
		},
		___index: 0,
		bindIMInfo: function() {
			var self = this;
			$('#im_info').bind('click', function(e) {
				var el = e.target;
				if($(el).attr('vattr') == 'add') {
					self.___index ++;
					var __id = 'im_set_btn_' + self.___index;
					var _html = '<span class="item-con-sub-item item-con-sub-item-space" style="position:relative;">'
							   +'<div id="'+ __id +'" class="profile-intimity-menu">'
                               +'<span class="profile-intimity-menu-title profile-icon">'
                               +'<input type="hidden" value="0" name="imAccountList[0].privacy">'
                               +'<a href="#"><i class="global-icon-privacy-12">隐私</i>所有人可见<span class="profile-icon-menu-jt"></span></a></span></div>'
                               +'<select class="profile-select w80" name="imAccountList[0].imType">'
                               +'<option value="1">QQ</option>'
                               +'<option value="2">MSN</option>'
                               +'<option value="3">Gtalk</option>'
                               +'<option value="4">Skype</option>'
                               +'<option value="5">网易泡泡</option>'
                               +'<option value="6">新浪UC</option>'
                               +'<option value="7">阿里旺旺</option>'
                               +'</select><input type="hidden" value="" name=""><input type="text" class="profile-textarea w160" value="" name="imAccountList[0].account">'
                               +'<span class="item-con-control"><a href="#" vattr="delete">删除</a><span>&nbsp;|&nbsp;</span><a href="#" vattr="add">添加</a></span></span>';
					// $(this).append(_html);
					// $('.item-con-control').html('<a href="#" vattr="delete">删除</a><span>&nbsp;</span>');
					// 重新写入html结构会导致IE6下的样式问题，因此改为显示影藏的模式
					// IE6 is a mother fuck browser
					var item_con_control = $('#im_info .form-item-con span.item-con-control');
					item_con_control.last().children().each(function(index, item) {
						if(index == 0) {
							$(item).show();
						} else {
							$(item).hide();
						}
					});
					$('#im_info .form-item-con').append($(_html));
					$['profileapp'].changePrivacy([{
						name: __id,
						el: $('#' + __id),
						html: self.__menuhtml
					}]);
					resetInputName();
				}
				if($(el).attr('vattr') == 'delete') {
					function __del_cb() {
						$(el).parent().parent().remove();
						var _el = $('#im_info .item-con-sub-item');
						if(_el.length == 1) {
							// $('.item-con-control').html('<a href="#" vattr="add">添加</a><span>&nbsp;</span>');
							$('.item-con-control').children().each(function(index, item) {
								if(index == 2) $(item).show();
								else $(item).hide();
							});
						} else {
							// var _el_item = $('.item-con-control');
							// $(_el_item[_el_item.length - 1]).html('<a href="#" vattr="delete">删除</a><span>&nbsp;|&nbsp;</span><a href="#" vattr="add">添加</a>');
							$('.item-con-control').last().children().each(function(index, item) {
								$(item).show();
							});
						}
					}
					__del_cb();
					resetInputName();
					/*
					$.confirm({
						title: '提示',
						content: '<div class="profile-win-clew"><div class="boxC"><p style="margin-bottom:0px;">确定要删除这个即时通讯帐号吗？</p></div></div>',
						onConfirm: function() {
							__del_cb();
							resetInputName();
						}
					});
					*/
				}
				function resetInputName() {
					$('#im_info .form-item-con').find('.profile-textarea').each(function(index, item) {
						$(item).attr('name', 'imAccountList['+ index +'].account');
					});
					
					$('#im_info .form-item-con').find('.profile-select').each(function(index, item) {
						$(item).attr('name', 'imAccountList['+ index +'].imType');
					});
					$('#im_info .form-item-con .profile-intimity-menu').find('input').each(function(index, item) {
						$(item).attr('name', 'imAccountList['+ index +'].privacy');
					});
				}
				e.preventDefault();
			});
		},
		bindSubmitBt: function() {
			var self = this;
			this.els['savebt'].bind('click', function(e) {
				if(!self.checkStatus) return;
				self.els['contacted'].submit();
				self.els['savebt'].attr('disabled', 'true').removeClass('ui-btn-current ui-btn-active').addClass('ui-btn-disabled').val('正在保存');
			});
		},
		cksb: function() {
			var str = false;
			$('.profile-textarea').each(function(index, item) {
				if(!$.trim($(item).val()) == '' && !str) str = true;
			});
			return str;
		},
		submitEnd: function() {
			try {
				setTimeout(function() {
					$('.profile-succeed-clew').slideUp();
				}, 2000);
			} catch (e) {}
		}
	};
	$(document).ready(function() {
		Contact.initEls();
		Contact.initCheck();
		Contact.bindPrvMenu();
		Contact.bindIMInfo();
		Contact.bindSubmitBt();
		Contact.submitEnd();
	});
})(jQuery);