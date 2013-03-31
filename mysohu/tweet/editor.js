/*
 * 留言
 * @author yongzhong zhang
 */
;(function($){
	
	
	var tweet = {
		sets: {
			namespace: '.tweet',
			edit_box: '#tweet_editor_box',
			leavemsg_wrapper: '.main-leavemsg-place',
			publish_wrapper: '.publish-wrapper',
			textarea_box: '.main-leavemsg',
			vcode: 'input.securitycode-text',
			vcode_img: 'img.securitycode-img',
			vcode_link: 'a.securitycode-switch',
			publish_btn: '.leavemsg-btn',
			line_height: 20,
			default_text: '对他说点什么',
			is_working: false,
			publish_url: '/a/guestbook/addMessage.htm?_input_encode=UTF-8',
			vcode_url: '/a/guestbook/vcode.htm', // 获取验证码
			vcode_image_url: '/a/guestbook/rand.htm', // 获取验证码图片
			default_height: 18,
			line_height: 18,
			min_height: 72,
			max_height: 180,
			link_to: $space_config._url + 'guestbook/index.htm'

		},
		
		params: {
			receiverPassport: '',
			vcode: ''
		},
		
		timer: null,

		init: function(options){
			$.extend(tweet.sets, options || {});
			
			// 获取被访问用户xpt
			tweet.params.receiverPassport = ($space_config && $space_config._xpt)? $space_config._xpt : '';

			var $edit_box = $(tweet.sets.edit_box),
				$textarea_box = $(tweet.sets.textarea_box, $edit_box),
				$publish_btn = $(tweet.sets.publish_btn, $edit_box);


			$('body')
			.bind('focusin' + tweet.sets.namespace, tweet.leavemsg_handler)
			.bind('click' + tweet.sets.namespace, tweet.leavemsg_handler);
			
			if($textarea_box.val() == ''){
				$textarea_box.val(tweet.sets.default_text);
			}
			
			$textarea_box
			.bind('keyup' + tweet.sets.namespace, tweet.height_adjust);
			
			$publish_btn
			.bind('mouseenter' + tweet.sets.namespace, function(){
				$(this).addClass('leavemsg-btn-hover');
			})
			.bind('mouseleave' + tweet.sets.namespace, function(){
				$(this).removeClass('leavemsg-btn-hover');
			});
			
		},
		
		height_adjust: function(type){

			type = type || 'expand'; // expand|collapse

			var $edit_box = $(tweet.sets.edit_box),
				$textarea_box = $(tweet.sets.textarea_box, $edit_box),
				$duplicate_box = null;
			
			if(!$('#leavemsg_textarea_duplicate').length){
				$('body').append('<div id="leavemsg_textarea_duplicate" style="display: none;"></div>');
			}

			$duplicate_box = $('#leavemsg_textarea_duplicate');

			var pre_text = $textarea_box.val();
			
			pre_text = pre_text.replace(/\&/g, '&amp;');
			pre_text = pre_text.replace(/\</g, '&lt;');
			pre_text = pre_text.replace(/\>/g, '&gt;');
			
			pre_text = pre_text.replace(/\n/g, '<br/> ');
			pre_text = pre_text.replace(/\s/g, '<i> </i>');

			$duplicate_box.html(pre_text);
				
			var h = $duplicate_box.height();
			
			h = (h < tweet.sets.max_height)? h : tweet.sets.max_height;
			
			$textarea_box.height((h > tweet.sets.min_height)? h : tweet.sets.min_height);

			if(type === 'collapse'){
				$textarea_box.height(tweet.sets.default_height);
			}
			
		},
		
		string_length: function(s) {
			return s.replace(/[^\x00-\xff]/g, "**").length;
		},
		
		string_sub: function(s, n) {
			var r = /[^\x00-\xff]/g;
			if (tweet.string_length(s) <= n){
				return s;
			}
			var m = Math.floor(n / 2);
			for ( var i = m; i < s.length; i++) {
				if (tweet.string_length(s.substr(0, i)) >= n) {
					return s.substr(0, i);
				}
			}
			return s;
		},
		
		login: function(){
			if(!$.cookie("ppinf")) {
				$.ppDialog({
					appId: '1019',
					regRedirectUrl: location.href,
					title: '想要查看更多精彩内容，马上登录吧！',
					onLogin: function(userId) {
						location.reload();
					}
				});
				return false;
			}
			return true;
		},

        // 获取验证码
		get_vcode: function($vcode_img){
			$.getJSON(tweet.sets.vcode_url + '?t=' + +new Date, function(json){
				if(typeof json != 'undefined'){
					tweet.params.vcode = json.vcode;
					$vcode_img[0].src = '/a/guestbook/rand.htm?vcode=' + json.vcode;
				}
			}, 'json');
			return tweet.params.vcode;
		},
		
		publish: function(event){
			if(!tweet.login()){
				return;
			}

			var $publish_btn = $(event.target);
				$edit_box = $(tweet.sets.edit_box),
				$publish_wrapper = $(tweet.sets.publish_wrapper, $edit_box),
				$textarea_box = $(tweet.sets.textarea_box, $publish_wrapper),
				$usercode = $(tweet.sets.vcode, $publish_wrapper);
				
			tweet.is_working = true;
			tweet.set_status.call($publish_wrapper, 'disabled');
				
			var params = $.extend(tweet.params, {
					content: $textarea_box.val(),
					usercode: $usercode.val()
				});
			
			// 判断留言内容是否为空
			if($.trim(params.content) == '' || $.trim(params.content) == tweet.sets.default_text){
				tweet.set_status.call($publish_wrapper, 'error');
				$.inform({
					icon: "icon-error",
					delay: 1500,
					easyClose: true,
					content: "内容不能为空。",
					onClose: function(){
						$textarea_box.focus();
						tweet.is_working = false;
					}
				});
			}
			// 验证内容长度
			else if(tweet.string_length($.trim(params.content)) > 400){
				tweet.set_status.call($publish_wrapper, 'error');
				$.inform({
					icon: "icon-error",
					delay: 1500,
					easyClose: true,
					content: "内容不能超过200个字。",
					onClose: function(){
						$textarea_box.focus();
						tweet.is_working = false;
					}
				});
			}
			// 验证码是否为空
			else if($.trim(params.usercode) == '' || $.trim(params.usercode) == ''){
				$usercode.addClass('securitycode-text-active');
				$.inform({
					icon: "icon-error",
					delay: 1500,
					easyClose: true,
					content: "验证码不能为空。",
					onClose: function(){
						$usercode.focus();
						tweet.is_working = false;
					}
				});
			}
			else{
				$.post(tweet.sets.publish_url, params, function(json){
					if(json && parseInt(json.status) === 1){
						$.inform({
							icon: "icon-success",
							delay: 1000,
							easyClose: true,
							content: json.statusText,
							onClose: function(){
								tweet.set_status.call($publish_wrapper, 'normal');
								$textarea_box.val('');
								tweet.is_working = false;
								document.location.href = tweet.sets.link_to;
							}
						});
					}else{
						$.inform({
							icon: "icon-error",
							delay: 1000,
							easyClose: true,
							content: json.statusText,
							onClose: function(){
								$textarea_box.focus();
								tweet.is_working = false;
							}
						});
					}
				}, 'json');
			}
			
		},
		
		set_status: function(status){
			var $this = this;
			if($this.length){
				$this.removeClass('leavemsg-active leavemsg-disabled leavemsg-error');
				switch(status){
					case 'active':
						$this.addClass('leavemsg-active');
						break;
					case 'disabled':
						$this.addClass('leavemsg-disabled');
						break;
					case 'error':
						$this.addClass('leavemsg-error');
						break;
					default: // normal
						break;
				}
			}
		},
		
		leavemsg_handler: function(event){
			var $target = $(event.target);
			var $edit_box = $(tweet.sets.edit_box),
				$leavemsg_wrapper = $(tweet.sets.leavemsg_wrapper, $edit_box),
				$publish_wrapper = $(tweet.sets.publish_wrapper, $edit_box),
				$textarea_box = $(tweet.sets.textarea_box, $publish_wrapper),
				$publish_btn = $(tweet.sets.publish_btn, $edit_box),
				$vcode = $(tweet.sets.vcode, $publish_wrapper),
				$vcode_img = $(tweet.sets.vcode_img, $publish_wrapper);

				if($target.closest(tweet.sets.publish_wrapper).length || $target.closest(tweet.sets.publish_btn).length){
					
					if(!$publish_wrapper.hasClass('leavemsg-active')){
						if($textarea_box.val() == '' || $textarea_box.val() == tweet.sets.default_text){
							$textarea_box.val('');
						}
						
						// 初始化验证码图片
						if(tweet.params.vcode == ''){
							tweet.get_vcode($vcode_img);
						}
						
						// 设置激活状态
						tweet.set_status.call($publish_wrapper, 'active');
						
						// 根据内容调整高度
						tweet.height_adjust('expand');
					}
				}else{
					
					if($publish_wrapper.hasClass('leavemsg-active')){
						if($textarea_box.val() == ''){
							$textarea_box.val(tweet.sets.default_text);
						}
						tweet.height_adjust('collapse');
						tweet.set_status.call($publish_wrapper, 'normal');
					}
				}
				
				if($target.closest(tweet.sets.vcode).length){
					$vcode.addClass('securitycode-text-active');
				}else{
					$vcode.removeClass('securitycode-text-active');
				}
				
				if(event.type == 'click'){
					// 快速留言提交
					if($target.closest(tweet.sets.publish_btn).length){
						tweet.publish.call(event.target, event);
					}
					// 更新验证码
					else if($target.closest(tweet.sets.vcode_img).length || $target.closest(tweet.sets.vcode_link).length){
						tweet.get_vcode($vcode_img);
					}
					
				}
				
		},
		
		textarea_blur: function(event){}
	};
	
	
	
	$(function(){
		
		tweet.init();
	});
})(jQuery);
