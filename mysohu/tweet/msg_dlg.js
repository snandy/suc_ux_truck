/*
 * 留言
 * @author yongzhong zhang
 */
;
loadResource("/d/common-remark.css");
require(
'core::util::jQuery',
'core::util::beLogin',
'app::emote',
function($, beLogin, Emote) {
	var $space_config = window.$space_config || {};
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
			link_to: $space_config._url + 'guestbook/index.htm',

			is_working: false,
			on_close: null, // 回复对话框关闭时回调
			manage: '.message-manage', // 留言管理容器 
			wrapper: '.message-remark', // 留言列表容器
			message_post_url: '/a/guestbook/addMessage.htm?_input_encode=UTF-8', // 发布留言地址
			reply_textarea: '.reply-textarea', // 回复对话框中的文本域
			max_words: 400, // 留言最大字数
			
			helper: null
		},
		
		params: {
			receiverPassport: '',
			vcode: ''
		},
		
		timer: null,

		templates: {
			message_dialog:	[
				'<div class="remark-message-wrapper remark-message-dialog">',
				'  	 <div class="remark-message">',
	            '     	<div class="rk-message-con">',
	            '            <div class="rk-message-body">',
	            '            	<div class="post-area">',
	            '                  <div class="textarea-wrapper">',
	            '                      <textarea rows="1" cols="60" class="reply-textarea" name="replytextarea"></textarea>',
	            '                  </div>',
	            '                </div>',
	            '            </div>',
	            '        </div>',
	            '        <div class="rk-message-con">',
	            '            <div class="rk-message-body">',
	            '            	<input type="text" name="securitycode" class="securitycode-text" value="请输入验证码" maxlength="10" ><img class="securitycode-img" src="http://s3.suc.itc.cn/d/nil.gif"><span class="remind-rk-message">请输入图片中的文字，<a class="securitycode-switch" href="javascript:void(0);">看不清验证码？</a></span>',
	            '            </div>',
	            '        </div>',
	            '     </div>',
				'  </div>'
			].join('')
		},
		
		init: function(options){
			$.extend(tweet.sets, options || {});
			
			// 获取被访问用户xpt
			//tweet.params.receiverPassport = (window.$space_config && $space_config._xpt)? $space_config._xpt : '';

			var $edit_box = $(tweet.sets.edit_box),
				$textarea_box = $(tweet.sets.textarea_box, $edit_box),
				$publish_btn = $(tweet.sets.publish_btn, $edit_box);

			
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
				
		textarea_blur: function(event){
			
		},
		
		// 留言对话框加载事件处理
		on_dialog_load: function(){
			var $dialog = this,
				$message_emotes = $('.rk-message-emotion > .emotion-body', $dialog),
				$vcode_img = $('img.securitycode-img', $dialog);
				
			
			// 初始化验证码图片
			tweet.get_vcode($vcode_img);


		},
		
		// 回复对话框发布回复事件处理
		on_dialog_message: function(){
			var $dialog = this,
				$reply_textarea = $(tweet.sets.reply_textarea, $dialog),
				$post_area = $reply_textarea.closest('.post-area'),
				$usercode = $('.securitycode-text', $dialog),
				params = $.extend(tweet.params, {
					content: $reply_textarea.val(),
					usercode: $usercode.val()
				});
			
			// 判断留言内容是否为空
			if($.trim(params.content) == ''){
				tweet.set_status.call($post_area, 'error');
				$.inform({
					icon: "icon-error",
					delay: 3000,
					easyClose: true,
					content: "内容不能为空。",
					onClose: function(){
						$reply_textarea.focus();
					}
				});
			}
			// 验证内容长度
			else if(tweet.string_length($.trim(params.content)) > tweet.sets.max_words){
				tweet.set_status.call($post_area, 'error');
				$.inform({
					icon: "icon-error",
					delay: 3000,
					easyClose: true,
					content: "内容不能超过200个字。",
					onClose: function(){
						$reply_textarea.focus();
					}
				});
			}
			// 验证码是否为空
			else if($.trim(params.usercode) == '' || $.trim(params.usercode) == '请输入验证码'){
				$usercode.addClass('securitycode-text-active');
				$.inform({
					icon: "icon-error",
					delay: 1500,
					easyClose: true,
					content: "验证码不能为空。",
					onClose: function(){
						$usercode.focus();
					}
				});
			
			}
			// 发布回复
			else {
				$.post(tweet.sets.publish_url, params, function(json){
					if(json && parseInt(json.status) === 1){
						// 关闭发布框
						$dialog.close();
						$.inform({
							icon: "icon-success",
							delay: 2000,
							easyClose: true,
							content: json.statusText,
							onClose: function(){
								$reply_textarea.val('');
							}
						});
						
						// 成功发布
						return true;
					}else{
						$.inform({
							icon: "icon-error",
							delay: 3000,
							easyClose: true,
							content: json.statusText,
							onClose: function(){
								$reply_textarea.focus();
							}
						});
					}
				}, 'json');
				
			}
				
			
			return false;
		},

		// 留言发布对话框
		message_dialog: function(params){
			if(beLogin()){
				return;
			}
			
			if(params && params.receiverPassport){
				tweet.params.receiverPassport = params.receiverPassport;
			}else{
				return;
			}
			
			var dlg_tit = '留言';
			
			if(params && params.nick){
				dlg_tit = '给' + params.nick + dlg_tit;
			}
			
			var $dialog = $.dialog({
					id: 'tweet-message',
					title: dlg_tit,
					btns: ["accept", "cancel"],
					defaultBtn: "accept",
					labAccept: "发布",
					contentBtnHelp: true,
					className: "remark-reply-dialog",
					icon: 'icon-notice',
					content: tweet.templates.message_dialog,
					onLoad: tweet.on_dialog_load,
					onBeforeAccept: tweet.on_dialog_message,
					onClose: tweet.sets.on_close
				}),
				$reply_textarea = $(tweet.sets.reply_textarea, $dialog),
				$post_area = $reply_textarea.closest('.post-area'),
				$vcode = $('input.securitycode-text', $dialog),
				$vcode_img = $('img.securitycode-img', $dialog);
			
			// 调整内容窗口
			$dialog
			.adjust()
			.bind('click' + tweet.sets.namespace, function(event){
				var $target = $(event.target);
				
				// 更新验证码
				if($target.closest('img.securitycode-img').length || $target.closest('a.securitycode-switch').length){
					tweet.get_vcode($vcode_img);
				}
				
			});

			//送礼物
			$dialog.find('.btn-gift a').attr('href' ,'http://i.sohu.com/app/score/#/score/sur/virtual.json?nick=' + encodeURIComponent(encodeURIComponent(params.nick)));
			
			$reply_textarea
			.bind('click' + tweet.sets.namespace, function(event){
				tweet.set_status.call($post_area, 'active');
			})
			.bind('focus' + tweet.sets.namespace, function(event){
				tweet.set_status.call($post_area, 'active');
			})
			.bind('blur' + tweet.sets.namespace, function(event){
				tweet.set_status.call($post_area, 'normal');
			})
			.focus();
			
			$vcode
			.bind('focus' + tweet.sets.namespace, function(event){
				$(this).addClass('securitycode-text-active');
				if($.trim($(this).val()) == '请输入验证码'){
					$(this).val('');
				}
				
			})
			.bind('blur' + tweet.sets.namespace, function(event){
				$(this).removeClass('securitycode-text-active');
			});
			
			return $dialog;
		}		
	};
	
	
	
	$(function(){
		mysohu.tweet = tweet;
		tweet.init();
	});
});
