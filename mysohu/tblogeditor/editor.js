/**
 * 一句话发布
 * 
 * @author yongzhong & dazhao@sohu-inc.com
 */
(function($) {
	
	$(function() {
		var maxLength = 2000;
		
		var $sentenceBox = $('.sentence-box');
		// 文本内容最大中文长度
		var $textbox = $("#onesentencetext");
		// 输入框
		var textcount = $sentenceBox.find('.txt-number-now');
		// 显示剩余字数的容器
		var texttotal = $sentenceBox.find('.txt-number-total');
		// 显示总字数的容器
		var sendBtn = $("#sentence_submit");
		// 发送按钮
		var replaceCJK = /[^\x00-\xff]/g;
		var textboxDefaultTxt = '发个微博、分享你身边的精彩！';
		// $textbox.val();//在发布框内默认显示的文字
		var picuploadDefaultTxt = '分享图片';
		
		// 一句话容器
		var $sentencePostArea = $sentenceBox.find('.post-area');
		// 一句话内容输入框
		var $txtNumber = $sentenceBox.find('.post-btns .txt-number');
		// 输入字数容器
		var $txtError = $sentenceBox.find('.post-btns .txt-error');
		// 请输入内容错误提示
		var $publish_btn = $sentenceBox.find('.post-btns .btn-submit');
		// 发布按钮容器
		var $videoPanelWrapper = $('#video_panel_wrapper');
		// 视频面板
		var $videoInput = $sentenceBox.find('.video-input');
		// 视频地址输入文本框
		var $videoSubmit = $sentenceBox.find('i.submit');
		// 视频确定按钮
		var $videoError = $sentenceBox.find('.video-error');
		// 视频发布错误提示
		var userid = Base64.encode(PassportSC.cookieHandle());
		
		var isCtrl = false;

		// 设置字数上限
		texttotal.text(maxLength);
		
		// 选择表情事件绑定
		$sentenceBox.delegate('#emotion_panel_handle', 'click', function() {
			if ($sentenceBox.hasClass('sentence-box-disabled')) {
				return false;
			}
			var options = {
				'position' : 'absolute',
				'left' : $(this).parent().offset().left - 12 + "px",
				'top' : $(this).parent().offset().top + 15 + "px"
			};
			require('app::emote', function(emote) {
				emote.show(null, $textbox[0]).css(options);
			});
			return false;
		});
		// 插入点名按钮
		$sentenceBox.delegate('#at_panel_handle', 'click', function() {
			$textbox.focus().textbox().insertText('@');
		});
		// 插入视频按钮
		$sentenceBox.delegate('#video_panel_handle', 'click', function() {
			var insertPic = $sentenceBox.find('.insert-picture');
			$videoError.hide();
			$videoPanelWrapper.show();
			$videoPanelWrapper.parent().css('zIndex', parseInt(insertPic.css('zIndex'), 10) + 1);
			$videoInput.val('http://').select();
		});
		// 关闭插入视频面板
		$sentenceBox.delegate('#video_upload_destroy', 'click', function() {
			$videoPanelWrapper.hide();
		});
		// 视频确定按钮
		$sentenceBox.delegate('.insert-video-box .btn-submit', 'click', function() {
			var videoURL = $videoInput.val();
			if (videoURL.replace(/\s/g, '') === '') {
				$videoError.html('<span>视频地址不能为空</span>').show();
			} else {
				$videoInput.addClass('video-input-sending').attr('disabled', true);
				$videoSubmit.addClass('sending').attr('disabled', true);
				$.getJSON('/a/app/mblog/parse.htm', {
					url : videoURL,
					_ : new Date().getTime()
				}, function(data) {
					if (data && !data.code) {
						var content = '';
						content += data.data.title || '';
						content = content && content + ' ';
						content += data.data.flash || '';
						$textbox.focus().textbox().insertPos('end').textbox().insertText(' ' + content + ' ');
						textcount.text(getLength());
						$videoPanelWrapper.hide();
					} else {
						$videoError.html('<span>你输入的内容无法识别</span>，<a href="javascript:void(0);">作为普通链接发布</a>').show();
					}
					$videoInput.removeClass('video-input-sending').attr('disabled', false);
					$videoSubmit.removeClass('sending').attr('disabled', false);
				});
			}
		});
		// 作为普通链接发布
		$sentenceBox.delegate('.insert-video-box .video-error a', 'click', function() {
			$textbox.focus().textbox().insertText(' ' + $videoInput.val() + ' ');
			textcount.text(getLength());
			$videoPanelWrapper.hide();
		});
		// 关闭视频面板
		$(document).bind('click', function(ev) {
			if ( !$.contains($sentenceBox.find('.insert-video')[0], ev.target) ) {
				$videoPanelWrapper.hide();
			}
		});
		// Ctrl + Enter
		$sentenceBox.delegate('#onesentencetext', 'keydown keyup', function(ev) {
			if (ev.type === 'keydown') {
				if (ev.keyCode == 17) {
					isCtrl = true;
				}
				if (isCtrl && ev.keyCode == 13) {
					sendBtn.click();
				}
			}
			if (ev.type === 'keyup' && ev.keyCode == 17) {
				isCtrl = false;
			}
		});
		
		$sentenceBox.delegate('#sentence_post_area', 'mouseenter mouseleave', function() {
			$(this).toggleClass('post-area-hover');
		});
		
		$textbox.data('textboxDefaultTxt', textboxDefaultTxt);
		var apiArr = {
			oneSentence : "/a/app/mblog/save.htm?_input_encode=UTF-8"
		};

		if ($textbox != null) {
			require('plugins::at', function($at) {
				$at.init.apply($textbox);
			});
			$textbox.bind("blur", blurHandler);
			$textbox.bind("paste", pasteHandler);
			$textbox.bind("cut", cutHandler);
			$textbox.bind("keyup", keyupHandler);
			$textbox.bind("focus", focusHandler);
			sendBtn.bind("click", sendBlogHandler);
		}
		// 设置缓存一句话缓存
		textbosDefaultTxtInit(textboxDefaultTxt);
		function keyupHandler(event) {
			$txtNumber.show();
			$txtError.hide();
			textcount.text(getLength());
			if (getLength() > maxLength) {
				textcount.addClass('txt-number-now-error');
			} else {
				textcount.removeClass('txt-number-now-error');
			}
		}

		function pasteHandler(event) {
			$txtNumber.show();
			$txtError.hide();
			textcount.text(getLength());
			if (getLength() > maxLength) {
				textcount.addClass('txt-number-now-error');
			} else {
				textcount.removeClass('txt-number-now-error');
			}
		}

		function cutHandler(event) {
			$txtNumber.show();
			$txtError.hide();
			textcount.text(getLength());
			if (getLength() > maxLength) {
				textcount.addClass('txt-number-now-error');
			} else {
				textcount.removeClass('txt-number-now-error');
			}
		}

		function textbosDefaultTxtInit(txt) {
			if ($.cookie('suc_composer_text_' + userid)) {
				$textbox.val(decodeURIComponent($.cookie('suc_composer_text_' + userid)));
				textcount.text(getLength());
			} else {
				$textbox.val(textboxDefaultTxt);
				textcount.text(0);
			}
		}

		/**
		 * 发送一句话功能
		 */
		function sendBlogHandler(e) {
			if (sendBtn.find(".submit").hasClass("disabled")) {
				return;
			}
			if ($.trim($textbox.val()) == "" || $textbox.val() == textboxDefaultTxt) {
				emptyContentAlert($textbox[0]);
				$txtNumber.hide();
				$txtError.show();
				// 为空，不提交
				return false;
			}
			if (getLength() <= maxLength) {
				// 防止在提交过程中重复发布
				var $btnSend = $('span.submit', e.currentTarget);
				if ($sentenceBox.hasClass('sentence-box-disabled')) {
					return false;
				} else {
					$sentenceBox.addClass('sentence-box-disabled');
					$textbox.css({
						backgroundColor : '#F1F1F1',
						color : '#999'
					});
					$textbox.attr('disabled', true);
				}
				
				var type = 0;
				var url = '';
				var content = $textbox.val();
				var sPicURL = $textbox.data('pic_url');
				var sPicTit = $textbox.data('pic_tit');
				if (sPicURL) {
					type = 1;
					url = sPicURL;
				}
				var parame = {
					content : content,
					type : type,
					from : 'sentence',
					url : url
				};
				$.ajax({
					type : "POST",
					url : apiArr.oneSentence,
					data : parame,
					dataType : "json",
					success : function(data) {
						if (data && !data.code) {
							require('core::timeUtil', function(timeUtil) {
								timeUtil.setServerTime(data.sentence.now);
							});
							$sentenceBox.removeClass('sentence-box-disabled');
							$textbox.css({
								backgroundColor : '#fff',
								color : '#999'
							});
							$textbox.attr('disabled', false);
							$textbox.val(textboxDefaultTxt);
							textcount.text(0);
							$textbox.animate({
								height : '36px'
							}, "fast", function() {
								$sentencePostArea.removeClass('post-area-active');
							});
							$textbox.trigger('blur');
							$('#post_state').removeClass("failure").css('height', 36).addClass("success").fadeIn('fast', function() {
								setTimeout(function() {
									$('#post_state').fadeOut(500);
								}, 1000);
							});
							require('core::util::channel', function(channel) {
								channel.broadcast('feed', 'push', data.sentence);
							});
							// remove pic cache
							$textbox.removeData('pic_url');
							$('#picture_thumb_panel_wrapper').css('visibility', "hidden");
							if ($.clearAtCache) {
								$.clearAtCache();
							}
							
							
						} else if (data.code == 4) {
							$.notice.error('请不要发表含有不适当内容的微博。 ');
							$sentenceBox.removeClass('sentence-box-disabled');
							$textbox.css({
								backgroundColor : '#fff',
								color : '#000'
							});
							$textbox.attr('disabled', false);
						} else {
							$.notice.error(data.msg);
							$sentenceBox.removeClass('sentence-box-disabled');
							$textbox.css({
								backgroundColor : '#fff',
								color : '#000'
							});
							$textbox.attr('disabled', false);
						}
					},
					error : function() {
						$.sentenceNotice({
							type : 'dialog',
							icon : 'error',
							content : '让服务器再飞一会儿，请稍后再试。'
						});
						$sentenceBox.removeClass('sentence-box-disabled');
						$textbox.css({
							backgroundColor : '#fff',
							color : '#999'
						});
						$textbox.attr('disabled', false);
						$textbox.val(textboxDefaultTxt);
						textcount.text(0);
						$textbox.animate({
							height : '36px'
						}, "fast", function() {
							$sentencePostArea.removeClass('post-area-active');
						});
					}
				});
			} else {
				emptyContentAlert($textbox[0]);
				$.sentenceNotice({
					type : 'notice',
					icon : 'notice',
					delay : 2000,
					content : '超出2000字，微博未成功发布，请减少字数重发。'
				});
			}
			// 阻止事件冒泡
			return false;
		}

		/**
		 * 焦点离开事件
		 */
		function blurHandler(e) {
			if ($textbox.val() == "") {
				if ($textbox.data('pic_url')) {
					$textbox.val(picuploadDefaultTxt);
				} else {
					$textbox.val(textboxDefaultTxt).css("color", "#999999");
				}
			}
			$sentencePostArea.removeClass('post-area-active');
			e.preventDefault();
			e.stopPropagation();
		}

		/**
		 * 聚焦事件
		 */
		function focusHandler(e) {
			if ($textbox.val() == textboxDefaultTxt || $textbox.val() == picuploadDefaultTxt) {
				if ($textbox.val() == textboxDefaultTxt) {
					$textbox.val("");
					textcount.text(0);
				}
			}
			if (parseInt($textbox.css('height')) < 54) {
				$textbox.animate({
					height : '54px'
				}, "fast", function() {
					if ($.browser.safari && $textbox.css("display") != "none") {
						var tArea = $textbox[0];
						if (document.selection) {
							var sel = document.selection.createRange();
							document.selection.empty();
							sel.text = $textbox.val();
						} else {
							if (tArea.setSelectionRange) {
								// debugger;
								var start = tArea.selectionStart;
								var end = tArea.selectionEnd;
								var str1 = tArea.value.substring(0, start);
								var str2 = tArea.value.substring(end);
								var v = str1, len = v.length;
								tArea.value = v + str2;
								tArea.setSelectionRange(len, len);
								tArea.focus();
							} else {
								tArea.value += value;
							}
						}
					}
					$textbox[0].focus();
					$sentencePostArea.addClass('post-area-active');
				});
			} else {
				$sentencePostArea.addClass('post-area-active');
			}
			$textbox.css("color", "#000000");
			e.preventDefault();
			e.stopPropagation();
		}

		/**
		 * 返回输入的剩余字数
		 */
		function getLeftLength() {
			return Math.round((maxLength * 2 - $textbox[0].value.replace(/\r/g, "").replace(replaceCJK, "lv").length) / 2);
		}

		/**
		 * 返回已经输入的字数
		 */
		function getLength() {
			return Math.ceil(($textbox[0].value.replace(/\r/g, "").replace(replaceCJK, "lv").length) / 2);
		}

		function emptyContentAlert(a) {
			var b = [ 255, 200, 200 ];
			a.style.backgroundColor = "rgb(" + b[0] + "," + b[1] + "," + b[2] + ")";
			var c = setInterval(function() {
				b[1] += 10;
				b[2] += 10;
				if (b[1] > 255) {
					clearInterval(c);
				}
				a.style.backgroundColor = "rgb(" + b[0] + "," + b[1] + "," + b[2] + ")";
			}, 100);
		}

	});
})(jQuery);
