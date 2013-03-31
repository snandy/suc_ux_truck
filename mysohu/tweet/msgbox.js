/*
 * 留言回复弹出框
 * @author yongzhongzhang
 */
;
require(
'core::util::jQuery',
'core::ui::ppDialog',
'app::emote',
function($, ppDialog, Emote) {
	if (!!mysohu.msgbox) {
		return;
	}
	var msgbox = {
		sets : {
			namespace : '.msgbox', // 事件命名空间
			is_working : false,
			on_close : null, // 回复对话框关闭时回调
			manage : '.message-manage', // 留言管理容器
			wrapper : '.message-remark', // 留言列表容器
			reply_btn : '.btn-remark-reply', // 回复按钮
			reply_reply_btn : '.btn-reply-reply', // 回复回复按钮
			manage_reply_btn : '.btn-remark-reply-my', // 个人中心回复按钮
			manage_reply_reply_btn : '.btn-reply-reply-my', // 个人中心回复回复按钮
			message_destroy_btn : '.btn-remark-destroy', // 留言删除按钮
			reply_destroy_btn : '.btn-reply-destroy', // 回复删除按钮
			message_post_url : '/a/guestbook/addMessage.htm?_input_encode=UTF-8', // 发布留言地址
			reply_url : '/a/guestbook/addReply.htm?_input_encode=UTF-8', // 发布回复地址
			manage_reply_url : '/a/guestbook/addReply.htm?_input_encode=UTF-8', // 发布回复地址
			message_destroy_url : '/a/guestbook/deleteMessage.htm', // 留言删除地址
			reply_destroy_url : '/a/guestbook/deleteReply.htm', // 回复删除地址
			messages_destroy_url : '/a/guestbook/deleteBatchMessages.htm', // 批量删除留言地址
			vcode_url : '/a/guestbook/vcode.htm', // 获取验证码
			vcode_image_url : '/a/guestbook/rand.htm', // 获取验证码图片
			reply_textarea : '.reply-textarea', // 回复对话框中的文本域
			editor_panel : '#remark_message_panel', // 留言发布框回填容器
			editor_wrapper : '.message-editor', // 留言发布框容器
			max_words : 400, // 留言最大字数

			helper : null
		},
		params : {
			receiverPassport : '',
			vcode : ''
		},
		templates : {

			no_login : [ '<div class="remark-message no-login-panel">', ' 	<div class="rk-message-con">', '    	<div class="rk-message-name">留言：</div>',
				'        <div class="rk-message-body">', '        	<div class="post-area">', '              <div class="textarea-wrapper">',
				'                  <span class="rk-noenter-words">此功能暂时只允许登录用户发表留言，<a class="quick-login" href="javascript:void(0);">立即登录</a>', '                  </span>',
				'              </div>', '            </div>', '        </div>', '        </div>', '   </div>' ].join(''),

			message_editor : [

				'<div class="remark-message message-editor">',
				' 	<div class="rk-message-con">',
				'    	<div class="rk-message-name">留言：</div>',
				'       <div class="rk-message-body">',
				'        <form method="post" action="#" name="addMessage">',
				'        	<div class="post-area">',
				'              <div class="textarea-wrapper">',
				'                  <textarea class="message-textarea" name="content" cols="60" rows="4"></textarea>',
				'              </div>',
				'            </div>',
				'            <div class="rk-message-emotion">',
				'            	<div class="emotion-body clearfix"></div>',
				'            </div>',
				'        </form></div>',
				'    </div>',
				'    <div class="rk-message-con">',
				'    <div class="rk-message-name">验证码：</div>',
				'    <div class="rk-message-body">',
				'        	<span class="btn-rk-message"><input type="submit" value="发表" class="ui-btn-w60 message-post-btn" /></span>',
				'        	<input type="text" class="securitycode-text" name="usercode" maxlength="10" /><img class="securitycode-img" src="http://s3.suc.itc.cn/d/nil.gif" /><span class="remind-rk-message">看不清，<a class="securitycode-switch" href="javascript:void(0);">换一张</a></span>',
				'        </div>', '    </div>', ' </div>' ].join(''),
			reply_dialog : [
				'<div class="remark-message-wrapper remark-message-dialog">',
				'  	 <div class="remark-message">',
				'     	<div class="rk-message-con">',
				'            <div class="rk-message-body">',
				'            	<div class="post-area">',
				'                  <div class="textarea-wrapper">',
				'                      <textarea rows="1" cols="60" class="reply-textarea" name="replytextarea"></textarea>',
				'                  </div>',
				'                </div>',
				'                <div class="rk-message-emotion">',
				'                	<div class="emotion-body clearfix"></div>',
				'                </div>',
				'            </div>',
				'        </div>',
				'        <div class="rk-message-con">',
				'            <div class="rk-message-body">',
				'            	<input type="text" name="securitycode" class="securitycode-text" value="请输入验证码" maxlength="10" ><img class="securitycode-img" src="http://s3.suc.itc.cn/d/nil.gif"><span class="remind-rk-message">请输入图片中的文字，<a class="securitycode-switch" href="javascript:void(0);">看不清验证码？</a></span>',
				'            </div>', '        </div>', '     </div>', '  </div>'

			].join(''),
			manage_reply_dialog : [ '<div class="remark-message-wrapper remark-message-dialog">', '  	 <div class="remark-message">', '     	<div class="rk-message-con">',
				'            <div class="rk-message-body">', '            	<div class="post-area">', '                  <div class="textarea-wrapper">',
				'                      <textarea rows="1" cols="60" class="reply-textarea" name="replytextarea"></textarea>', '                  </div>', '                </div>',
				'                <div class="rk-message-emotion">', '                	<div class="emotion-body clearfix"></div>', '                </div>', '            </div>',
				'        </div>', '     </div>', '  </div>'

			].join('')
		},
		init : function(options) {
			$.extend(msgbox.sets, options || {});

			var $msgbox_manage = $(msgbox.sets.manage), // 留言管理容器
			$msgbox_wrapper = $(msgbox.sets.wrapper), // 留言列表容器
			$editor_panel = $(msgbox.sets.editor_panel), // 留言发布框回填容器
			$editor_wrapper = $(msgbox.sets.editor_wrapper); // 留言发布框容器

			// 获取被访问用户xpt
			msgbox.params.receiverPassport = ($space_config && $space_config._xpt) ? $space_config._xpt : '';

			// 留言管理
			if ($msgbox_manage.length) {
				if (mysohu.is_login()) {
					$msgbox_manage.unbind('click' + msgbox.sets.namespace).bind('click' + msgbox.sets.namespace, function(event) {
						var $target = $(event.target);

						// 全选
						if ($target.closest('a.remark-select-all').length || $target.closest('input.remark-destroy-all').length) {
							msgbox.select_all();
						}

						// 删除选中
						else if ($target.closest('a.remark-destroy-selected').length) {
							msgbox.destroy_selected();
						}

					});
				}
			}

			// 绑定留言列表中交互事件
			if ($msgbox_wrapper.length) {

				if (mysohu.is_login()) {

					$msgbox_wrapper.unbind('click' + msgbox.sets.namespace).bind('click' + msgbox.sets.namespace, function(event) {
						var $target = $(event.target);

						// 回复留言
						if ($target.closest(msgbox.sets.reply_btn).length) {
							var $reply_btn = $target.closest(msgbox.sets.reply_btn), $remark_reply_box = $reply_btn.closest('.remark-reply-box');

							$.extend(msgbox.params, {
								messageId : $remark_reply_box.attr('data-messageid'),
								replyId : null
							});

							msgbox.reply_dialog();
						}

						// 个人中心回复留言
						if ($target.closest(msgbox.sets.manage_reply_btn).length) {
							var $reply_btn = $target.closest(msgbox.sets.manage_reply_btn), $remark_reply_box = $reply_btn.closest('.remark-reply-box');

							$.extend(msgbox.params, {
								messageId : $remark_reply_box.attr('data-messageid'),
								replyId : null
							});

							msgbox.manage_reply_dialog();
						}

						// 删除留言
						else if ($target.closest(msgbox.sets.message_destroy_btn).length) {
							var $message_destroy_btn = $target.closest(msgbox.sets.message_destroy_btn), $remark_reply_box = $message_destroy_btn.closest('.remark-reply-box');

							$.extend(msgbox.params, {
								messageId : $remark_reply_box.attr('data-messageid'),
								replyId : null
							});
							msgbox.message_destroy($target);
						}

						// 回复回复
						else if ($target.closest(msgbox.sets.reply_reply_btn).length) {
							var $reply_btn = $target.closest(msgbox.sets.reply_reply_btn), $remark_reply_box = $reply_btn.closest('li');

							$.extend(msgbox.params, {
								messageId : $remark_reply_box.attr('data-messageid'),
								replyId : $remark_reply_box.attr('data-replyid')
							});

							msgbox.reply_dialog();
						}

						// 个人中心回复回复
						else if ($target.closest(msgbox.sets.manage_reply_reply_btn).length) {
							var $reply_btn = $target.closest(msgbox.sets.manage_reply_reply_btn), $remark_reply_box = $reply_btn.closest('li');

							$.extend(msgbox.params, {
								messageId : $remark_reply_box.attr('data-messageid'),
								replyId : $remark_reply_box.attr('data-replyid')
							});

							msgbox.manage_reply_dialog();
						}

						// 删除回复
						else if ($target.closest(msgbox.sets.reply_destroy_btn).length) {
							var $reply_destroy_btn = $target.closest(msgbox.sets.reply_destroy_btn), $remark_reply_box = $reply_destroy_btn.closest('li');

							$.extend(msgbox.params, {
								messageId : $remark_reply_box.attr('data-messageid'),
								replyId : $remark_reply_box.attr('data-replyid')
							});
							msgbox.reply_destroy($target);
						}

					});

				}

				// 未登录时交互事件绑定
				else {

					$msgbox_wrapper.bind('click' + msgbox.sets.namespace, function(event) {
						var $target = $(event.target);

						// 回复留言
						if ($target.closest(msgbox.sets.reply_btn).length) {
							mysohu.login();
						}

						// 删除留言
						else if ($target.closest(msgbox.sets.message_destroy_btn).length) {
							mysohu.login();
						}

						// 回复回复
						else if ($target.closest(msgbox.sets.reply_reply_btn).length) {
							mysohu.login();
						}

						// 删除回复
						else if ($target.closest(msgbox.sets.reply_destroy_btn).length) {
							mysohu.login();
						}

					});

				}
			}

			// 绘制留言发布框视图
			if ($editor_panel.length) {
				var view_html = '';

				if (mysohu.is_login()) {

					// 填充发布框视图
					view_html = msgbox.templates.message_editor;
					$editor_panel.html(view_html);

					var $message_textarea = $('textarea.message-textarea', $editor_panel), $post_area = $message_textarea.closest('.post-area'), $message_usercode = $(
					'input.securitycode-text', $editor_panel), $message_usercode_img = $('img.securitycode-img', $editor_panel), $message_emotes = $('.rk-message-emotion > .emotion-body',
					$editor_panel);

					// 填充表情
					$message_emotes.html(msgbox.get_emote());

					// 初始化验证码图片
					msgbox.get_vcode($message_usercode_img);

					// 绑定留言发布框中交互事件
					$editor_panel.bind('click' + msgbox.sets.namespace, function(event) {
						var $target = $(event.target);

						// 设置发布框激活状态
						if ($target.closest('.message-textarea').length) {
							msgbox.set_status.call($post_area, 'active');
						}

						// 发布回复
						else if ($target.closest('.message-post-btn').length) {
							var $message_post_btn = $target.closest('.message-post-btn'), params = $.extend(msgbox.params, {
								content : $message_textarea.val(),
								usercode : $message_usercode.val()
							});

							// 判断留言内容是否为空
							if ($.trim(params.content) == '') {
								msgbox.set_status.call($post_area, 'error');
								$.inform({
									icon : "icon-error",
									delay : 3000,
									easyClose : true,
									content : "内容不能为空。",
									onClose : function() {
										$message_textarea.focus();
									}
								});
							}
							// 验证内容长度
							else if (msgbox.string_length($.trim(params.content)) > msgbox.sets.max_words) {
								msgbox.set_status.call($post_area, 'error');
								$.inform({
									icon : "icon-error",
									delay : 3000,
									easyClose : true,
									content : "内容不能超过200个字。",
									onClose : function() {
										$message_textarea.focus();
									}
								});
							}
							// 验证码是否为空
							else if ($.trim(params.usercode) == '') {
								$.inform({
									icon : "icon-error",
									delay : 1500,
									easyClose : true,
									content : "验证码不能为空。",
									onClose : function() {
										$message_usercode.focus();
									}
								});
							}
							// 发布留言
							else {
								$.post(msgbox.sets.message_post_url, params, function(json) {
									if (json && parseInt(json.status) === 1) {
										$.inform({
											icon : "icon-success",
											delay : 3000,
											easyClose : true,
											content : json.statusText,
											onClose : function() {
												$message_textarea.val('');
												document.location.href = $space_config._url + 'guestbook/index.htm';
											}
										});
									} else {
										$.inform({
											icon : "icon-error",
											delay : 3000,
											easyClose : true,
											content : json.statusText,
											onClose : function() {
												$message_textarea.focus();
											}
										});
									}
								}, 'json');

							}
						}

						// 更新验证码
						else if ($target.closest('img.securitycode-img').length || $target.closest('a.securitycode-switch').length) {
							msgbox.get_vcode($message_usercode_img);
						}

						// 输入表情
						else if ($target.closest('div.emotion-body > a')) {
							msgbox.put_emote($message_textarea, $target.closest('div.emotion-body > a'));
						}

					});

					$message_textarea.bind('focus' + msgbox.sets.namespace, function(event) {
						msgbox.set_status.call($post_area, 'active');
					}).bind('blur' + msgbox.sets.namespace, function(event) {
						msgbox.set_status.call($post_area, 'normal');
					});

					$message_usercode.bind('focus' + msgbox.sets.namespace, function(event) {
						$(this).addClass('securitycode-text-active');
					}).bind('blur' + msgbox.sets.namespace, function(event) {
						$(this).removeClass('securitycode-text-active');
					});

				}
				// 未登录状态
				else {
					view_html = msgbox.templates.no_login;
					$editor_panel.html(view_html);

					$editor_panel.bind('click' + msgbox.sets.namespace, function(event) {
						var $target = $(event.target);
						if ($target.closest('.quick-login').length) {
							var $quick_login_btn = $target.closest('.quick-login');
							mysohu.login();
						}
					});
				}
			}

		},

		// 留言全选
		select_all : function() {
			var $msgbox_manage = $(msgbox.sets.manage), $select_all = $('input.remark-destroy-all', $msgbox_manage);
			$checkbox_items = $('div.message-remark input.remark-destroy-item', $msgbox_manage), is_checked = false;

			if ($select_all[0].checked) {
				is_checked = true;
			} else {
				is_checked = false;
			}

			$checkbox_items.each(function(i) {
				this.checked = is_checked;
			});
		},

		// 删除选中留言
		destroy_selected : function() {
			var $msgbox_manage = $(msgbox.sets.manage), $checkbox_items = $('div.message-remark input.remark-destroy-item', $msgbox_manage), items_ids = [], params = {
				messageIdStr : ''
			};

			$checkbox_items.filter(':checked').each(function(i) {
				items_ids.push($(this).attr('value'));
			});

			if (items_ids.length) {
				$.confirm({
					title : false,
					defaultBtn : "cancel",
					content : '是否要删除选中的留言？删除后不可恢复。',
					onConfirm : function(event) {
						params.messageIdStr = items_ids.join(';');

						$.getJSON(msgbox.sets.messages_destroy_url, params, function(json) {
							if (json && parseInt(json.status) === 1) {
								location.reload();
							} else {
								$.inform({
									icon : "icon-error",
									delay : 3000,
									easyClose : true,
									content : json.statusText || '',
									onClose : function() {
									}
								});
							}
						});
					},
					onCancel : function(event) {
						return false;
					}
				});
			} else {
				$.inform({
					icon : "icon-notice",
					delay : 3000,
					easyClose : true,
					content : '您还没有选中任何留言，请选取后再删除！',
					onClose : function() {
					}
				});
			}
		},

		// 留言回复对话框
		reply_dialog : function(params) {
			if (!mysohu.login()) {
				return;
			}

			var $dialog = $.dialog({
				title : "留言 - 回复",
				btns : [ "accept", "cancel" ],
				defaultBtn : "accept",
				labAccept : "回复",
				contentBtnHelp : true,
				className : "remark-reply-dialog",
				icon : 'icon-notice',
				content : msgbox.templates.reply_dialog,
				onLoad : msgbox.on_dialog_load,
				onBeforeAccept : msgbox.on_dialog_reply,
				onClose : msgbox.sets.on_close
			}), $reply_textarea = $(msgbox.sets.reply_textarea, $dialog), $post_area = $reply_textarea.closest('.post-area'), $vcode = $('input.securitycode-text', $dialog), $vcode_img = $(
			'img.securitycode-img', $dialog);

			// 调整内容窗口
			$dialog.adjust().bind('click' + msgbox.sets.namespace, function(event) {
				var $target = $(event.target);

				// 更新验证码
				if ($target.closest('img.securitycode-img').length || $target.closest('a.securitycode-switch').length) {
					msgbox.get_vcode($vcode_img);
				}

				// 输入表情
				else if ($target.closest('div.emotion-body > a')) {
					msgbox.put_emote($reply_textarea, $target.closest('div.emotion-body > a'));
				}

			});

			$reply_textarea.bind('click' + msgbox.sets.namespace, function(event) {
				msgbox.set_status.call($post_area, 'active');
			}).bind('focus' + msgbox.sets.namespace, function(event) {
				msgbox.set_status.call($post_area, 'active');
			}).bind('blur' + msgbox.sets.namespace, function(event) {
				msgbox.set_status.call($post_area, 'normal');
			}).focus();

			$vcode.bind('focus' + msgbox.sets.namespace, function(event) {
				$(this).addClass('securitycode-text-active');
				if ($.trim($(this).val()) == '请输入验证码') {
					$(this).val('');
				}

			}).bind('blur' + msgbox.sets.namespace, function(event) {
				$(this).removeClass('securitycode-text-active');
			});

		},

		// 留言回复对话框
		manage_reply_dialog : function(params) {
			//debugger;
			if (!mysohu.login()) {
				return;
			}

			var $dialog = $.dialog({
				title : "留言 - 回复",
				btns : [ "accept", "cancel" ],
				defaultBtn : "accept",
				labAccept : "回复",
				contentBtnHelp : true,
				className : "remark-reply-dialog",
				icon : 'icon-notice',
				content : msgbox.templates.manage_reply_dialog,
				onBeforeAccept : msgbox.on_manage_dialog_reply,
				onClose : msgbox.sets.on_close
			}), $reply_textarea = $(msgbox.sets.reply_textarea, $dialog), $post_area = $reply_textarea.closest('.post-area'), $message_emotes = $('.rk-message-emotion > .emotion-body',
			$dialog);

			// 填充表情
			$message_emotes.html(msgbox.get_emote());

			// 调整内容窗口
			$dialog.adjust().bind('click' + msgbox.sets.namespace, function(event) {
				var $target = $(event.target);

				// 输入表情
				if ($target.closest('div.emotion-body > a')) {
					msgbox.put_emote($reply_textarea, $target.closest('div.emotion-body > a'));
				}

			});

			$reply_textarea.bind('click' + msgbox.sets.namespace, function(event) {
				msgbox.set_status.call($post_area, 'active');
			}).bind('focus' + msgbox.sets.namespace, function(event) {
				msgbox.set_status.call($post_area, 'active');
			}).bind('blur' + msgbox.sets.namespace, function(event) {
				msgbox.set_status.call($post_area, 'normal');
			}).focus();

		},

		// 删除留言
		message_destroy : function($target) {
			var params = {
				messageId : msgbox.params.messageId,
				xpt : msgbox.params.receiverPassport
			};

			$.confirm({
				title : false,
				defaultBtn : "cancel",
				content : '确认要删除留言？',
				onConfirm : function(event) {
					$.getJSON(msgbox.sets.message_destroy_url, params, function(json) {
						if (json && parseInt(json.status) === 1) {
							location.reload();
						} else {
							$.inform({
								icon : "icon-error",
								delay : 3000,
								easyClose : true,
								content : json.statusText || '',
								onClose : function() {
								}
							});
						}
					});
				},
				onCancel : function(event) {
					return false;
				}
			});
		},
		reply_destroy : function() {

			var params = {
				messageId : msgbox.params.messageId,
				replyId : msgbox.params.replyId,
				xpt : msgbox.params.receiverPassport
			};

			$.confirm({
				title : false,
				defaultBtn : "cancel",
				content : '确认要删除回复？',
				onConfirm : function(event) {
					$.getJSON(msgbox.sets.reply_destroy_url, params, function(json) {
						if (json && parseInt(json.status) === 1) {
							location.reload();
						} else {
							$.inform({
								icon : "icon-error",
								delay : 3000,
								easyClose : true,
								content : json.statusText || '',
								onClose : function() {
								}
							});
						}
					});
				},
				onCancel : function(event) {
					return false;
				}
			});
		},

		// 回复对话框加载事件处理
		on_dialog_load : function() {
			var $dialog = this, $message_emotes = $('.rk-message-emotion > .emotion-body', $dialog), $vcode_img = $('img.securitycode-img', $dialog);

			// 填充表情
			$message_emotes.html(msgbox.get_emote());

			// 初始化验证码图片
			msgbox.get_vcode($vcode_img);

		},

		// 获取表情
		get_emote : function($emote_wrapper) {

			var emotes = Emote.Data.base.emotes, arr = [];
			for ( var k in emotes) {
				arr.push('<a data_ubb="', k, '" data_path="base" href="javascript:;">', emotes[k], '</a>');
			}
			var html = arr.join('');

			if (typeof $emote_wrapper !== 'undefined' && !!$emote_wrapper.length) {
				$emote_wrapper.html(html);
			}

			return html;

		},

		// 向文本编辑器插入表情符号
		put_emote : function($tArea, $icon) {
			var tArea = $tArea[0];
			if ($icon.attr("data_ubb") != null && $icon.attr("data_ubb") != "") {
				var value = "[" + $icon.attr("data_ubb") + "]";
				tArea.focus();

				if (document.selection) {
					var sel = document.selection.createRange();
					document.selection.empty();
					sel.text = value;
				} else if (tArea.selectionStart && typeof tArea.selectionStart === 'number') {
					var cursorPos = startPos = tArea.selectionStart, endPos = tArea.selectionEnd, scrollTop = tArea.scrollTop;

					tArea.value = tArea.value.substring(0, startPos) + value + tArea.value.substring(endPos, tArea.value.length);

					cursorPos += value.length;

					tArea.selectionStart = tArea.selectionEnd = cursorPos;
				} else {
					tArea.value += value;

				}

			}
		},

		// 获取验证码
		get_vcode : function($vcode_img) {
			$.getJSON(msgbox.sets.vcode_url + '?t=' + +new Date, function(json) {
				if (typeof json != 'undefined') {
					msgbox.params.vcode = json.vcode;
					$vcode_img[0].src = '/a/guestbook/rand.htm?vcode=' + json.vcode;
				}
			});
			return msgbox.params.vcode;
		},

		string_length : function(s) {
			return s.replace(/[^\x00-\xff]/g, "**").length;
		},

		string_sub : function(s, n) {
			var r = /[^\x00-\xff]/g;
			if (tweet.string_length(s) <= n) {
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

		// 回复对话框发布回复事件处理
		on_dialog_reply : function() {
			var $dialog = this, $reply_textarea = $(msgbox.sets.reply_textarea, $dialog), $post_area = $reply_textarea.closest('.post-area'), $usercode = $('.securitycode-text', $dialog), params = $
			.extend(msgbox.params, {
				content : $reply_textarea.val(),
				usercode : $usercode.val()
			});

			// 判断留言内容是否为空
			if ($.trim(params.content) == '') {
				msgbox.set_status.call($post_area, 'error');
				$.inform({
					icon : "icon-error",
					delay : 3000,
					easyClose : true,
					content : "内容不能为空。",
					onClose : function() {
						$reply_textarea.focus();
					}
				});
			}
			// 验证内容长度
			else if (msgbox.string_length($.trim(params.content)) > msgbox.sets.max_words) {
				msgbox.set_status.call($post_area, 'error');
				$.inform({
					icon : "icon-error",
					delay : 3000,
					easyClose : true,
					content : "内容不能超过200个字。",
					onClose : function() {
						$reply_textarea.focus();
					}
				});
			}
			// 验证码是否为空
			else if ($.trim(params.usercode) == '' || $.trim(params.usercode) == '请输入验证码') {
				$usercode.addClass('securitycode-text-active');
				$.inform({
					icon : "icon-error",
					delay : 1500,
					easyClose : true,
					content : "验证码不能为空。",
					onClose : function() {
						$usercode.focus();
					}
				});

			}
			// 发布回复
			else {
				$.post(msgbox.sets.reply_url, params, function(json) {
					if (json && parseInt(json.status) === 1) {
						$.inform({
							icon : "icon-success",
							delay : 3000,
							easyClose : true,
							content : json.statusText,
							onClose : function() {
								$reply_textarea.val('');
								location.reload();
							}
						});

						// 成功发布
						return true;
					} else {
						$.inform({
							icon : "icon-error",
							delay : 3000,
							easyClose : true,
							content : json.statusText,
							onClose : function() {
								$reply_textarea.focus();
							}
						});
					}
				}, 'json');

			}

			return false;
		},

		// 个人中心回复对话框发布回复事件处理
		on_manage_dialog_reply : function() {
			var $dialog = this, $reply_textarea = $(msgbox.sets.reply_textarea, $dialog), $post_area = $reply_textarea.closest('.post-area'), params = $.extend(msgbox.params, {
				content : $reply_textarea.val()
			});

			// 判断留言内容是否为空
			if ($.trim(params.content) == '') {
				msgbox.set_status.call($post_area, 'error');
				$.inform({
					icon : "icon-error",
					delay : 3000,
					easyClose : true,
					content : "内容不能为空。",
					onClose : function() {
						$reply_textarea.focus();
					}
				});
			}
			// 验证内容长度
			else if (msgbox.string_length($.trim(params.content)) > msgbox.sets.max_words) {
				msgbox.set_status.call($post_area, 'error');
				$.inform({
					icon : "icon-error",
					delay : 3000,
					easyClose : true,
					content : "内容不能超过200个字。",
					onClose : function() {
						$reply_textarea.focus();
					}
				});
			}
			// 发布回复
			else {
				$.post(msgbox.sets.manage_reply_url, params, function(json) {
					if (json && parseInt(json.status) === 1) {
						$.inform({
							icon : "icon-success",
							delay : 3000,
							easyClose : true,
							content : json.statusText,
							onClose : function() {
								location.reload();
							}
						});

						// 成功发布
						return true;
					} else {
						$.inform({
							icon : "icon-error",
							delay : 3000,
							easyClose : true,
							content : json.statusText,
							onClose : function() {
								$reply_textarea.focus();
							}
						});
					}
				}, 'json');

			}

			return false;
		},

		// 设置发布框状态
		set_status : function(status) {
			var $this = this;
			if ($this.length) {
				$this.removeClass('post-area-active post-area-disabled post-area-error');
				switch (status) {
				case 'active':
					$this.addClass('post-area-active');
					break;
				case 'disabled':
					$this.addClass('post-area-disabled');
					break;
				case 'error':
					$this.addClass('post-area-error');
					break;
				default: // normal
					break;
				}
			}
		}
	};

	mysohu.msgbox = msgbox;

	$(function() {

		mysohu.msgbox.init();
	});
});