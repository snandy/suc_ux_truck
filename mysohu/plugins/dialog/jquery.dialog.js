~function($, window, document) {
	// if already load dialog, return directly
	if ($.dialog) {
		return;
	}
	var $window = $(window), $document = $(document), $body;
	var ieBug = $.browser.msie && parseFloat($.browser.version) < 7;
	// jQuery doesn't support a is string judgement, so I made it by myself.
	function isString(obj) {
		return typeof obj == "string" || Object.prototype.toString.call(obj) === "[object String]";
	}
	// dialog list to manage the dialogs.
	var dialogList = {
		entry : [],
		remove : function($dialog) {
			for ( var arr = this.entry, i = 0, L = arr.length; i < L; i++) {
				if (arr[i] === $dialog) {
					arr.splice(i, 1);
					break;
				}
			}
			return $dialog;
		},
		each : function(callback, __args) {
			__args = Array.prototype.slice.call(arguments, 1);
			for ( var arr = this.entry, i = 0, L = arr.length; i < L; i++) {
				callback.apply(arr[i], __args);
			}
		},
		last : function() {
			return this.entry[this.entry.length - 1];
		}
	};
	// manage the window resize event.
	$window.resize(function() {
		var timer;
		return function() {
			timer && clearTimeout(timer);
			timer = setTimeout(onTimeout, 100);
		};
		function onTimeout() {
			timer = 0;
			dialogList.each(dlgFuns.resize, false);
		}
	}());
	// manage the window scroll event for ie6.
	ieBug && $window.scroll(function() {
		var timer;
		return function() {
			dialogList.each(dlgFuns.ieFixedHide);
			timer && clearTimeout(timer);
			timer = setTimeout(onTimeout, 100);
		}
		function onTimeout() {
			dialogList.each(dlgFuns.ieFixedPos);
		}
	}());
	// handle escape key to close dialog one by one.
	$document.keydown(function(event) {
		if (event.keyCode == 27) {// ESC
			dialogList.last().close("cancel", event);
		}
	});
	function NOP() {
	}
	function DialogConfig(setting) {
		$.extend(this, setting);
	}
	DialogConfig.prototype = {
		id : "",
		className : "", // 自定义样式
		tip : false, // 是否为提示
		direction : "up", // tip类型凸角的方向
		title : "",
		content : "", // 对话框内容，支持html格式
		labClose : null,
		titleClose : "关闭",
		btns : [],
		defaultBtn : "",
		labAccept : "确定",
		labCancel : "取消",
		top : null,
		left : null,
		zindex : null,
		fixed : true,
		scrollIntoView : true,
		contentWidth : null,
		contentHeight : null,
		contentBtnHelp : false,
		modal : true,
		onLoad : null,
		onBeforeAccept : null,
		onAccept : null,
		onBeforeCancel : null,
		onCancel : null,
		onBeforeClose : null,
		onClose : null,
		mapButtons : {
			accept : 'labAccept',
			cancel : 'labCancel'
		}
	};
	var initializing;
	function Dialog(setting) {
		if (!(this instanceof Dialog)) {
			return new Dialog(setting);
		}
		$body || ($body = $(document.body));
		initializing = true;
		this.options = new DialogConfig(setting);
		this.drawLayout();
		this.data('i-dialog', this);
		dialogList.entry.push(this);
		this.adjust(false);
		this.delegate('.dialog-button-close', 'mouseover mouseout', this.event.handler);
		this.bind("click accept cancel", this.event.handler);
		initializing = false;
	}
	var dlgFuns = Dialog.prototype = $
	.extend(new $.fn.init(), {
		options : null,
		event : {
			handler : function(e) {
				dlgFuns.event[e.type].call(this, e);
			},
			mouseover : function(e) {
				$(this).addClass("dialog-button-close-hover");
			},
			mouseout : function(e) {
				$(this).removeClass("dialog-button-close-hover");
			},
			click : function(event) {
				var $dialog = dlgFuns.toDialog(this), opts = $dialog.options;
				var $target = $(event.target), $btnAccept = $target.closest(".dialog-button-accept"), $btnCancel = $target
				.closest(".dialog-button-cancel");
				if ($btnAccept.length && $btnAccept.attr("data-disabled") != "true") {
					event.state = "accept";
					$.isFunction(opts.onBeforeAccept) && opts.onBeforeAccept.call($dialog, event) === false || $target
					.trigger("accept");
				} else if ($btnCancel.length && $btnCancel.attr("data-disabled") != "true") {
					event.state = "cancel";
					$.isFunction(opts.onBeforeCancel) && opts.onBeforeCancel.call($dialog, event) === false || $dialog
					.trigger("cancel");
				} else if ($target.is("div.dialog-button-close")) {
					$dialog.close("cancel");
				}
			},
			accept : function() {
				dlgFuns.toDialog(this).close("accept");
			},
			cancel : function() {
				dlgFuns.toDialog(this).close("cancel");
			}
		},
		toDialog : function(node) {
			return $(node).data('i-dialog');
		},
		drawLayout : function() {
			var opts = this.options;
			$.fn.init.call(this, this.drawDialog(opts));
			opts.modal && this.data('mask', $(this.drawMask(opts)).appendTo(document.body));
			this.appendTo(document.body);
			if (opts.content && (opts.content.nodeName || opts.content.jquery)) {
				// is node or jquery wrapped node
				var $node = $(opts.content);
				this.find('.dialog-content-container').append($node);
				this.data("dialog.history", {
					el : $node[0],
					html : $node.html(),
					parent : $node.parent()[0],
					display : $node.css("display"),
					position : $node.css("position")
				});
				$node.show();
			} else {
				this.find('.dialog-content-container').html(opts.content);
			}
		},
		drawButtons : function(opts) {
			var btns = opts.btns, L = btns.length;
			if (L) {
				var buf = [ '<div class="dialog-button-container">' ];
				if (opts.id === 'whisper' || opts.id === 'tweet-message')
					buf
					.push('<div class="btn-gift"><i class="icon-gift"></i><a href="javascript:;" target="_blank">送个礼物</a></div>');
				for ( var i = 0; i < L; i++) {
					buf.push('<button class="dialog-button-', btns[i], '">', opts[opts.mapButtons[btns[i]]], '</button>');
				}
				buf.push('</div>');
				return buf.join('');
			} else
				return '';
		},
		drawMask : function(opts) {
			var cls = [
					'jquery-dialog-mask',
					$("div.jquery-dialog-mask").length ? 'jquery-dialog-mask-transparent' : 'jquery-dialog-mask-color' ];
			opts.className && cls.push(opts.className + '-mask');
			return '<div' + (opts.id ? ' id="' + opts.id + '-mask" class="' : ' class="') + cls.join(' ') + '"' + '></div>';
		},
		drawDialog : function(opts) {
			var tmplBtns = this.drawButtons(opts);
			var cls = [ 'jquery-dialog', !opts.fixed || ieBug ? 'dialog-outer-absolute' : 'dialog-outer-fixed' ];
			opts.tip && cls.push('jquery-tip');
			opts.className && cls.push(opts.className);
			var buf = [ '<div style="top: -10000px; left: -10000px;" class="', cls.join(' '), '"' ];
			opts.id && buf.push(' id="' + opts.id + '"');
			buf.push('>');
			// draw tips arrow
			opts.tip && buf.push('<div class="dialog-tip-arrow dialog-tip-arrow-', opts.direction.toLowerCase(), '"></div>');
			// draw top container
			buf.push('<div class="dialog-top-container"><div class="dialog-top-border"></div></div>');
			// draw middle container
			buf
			.push('<div class="dialog-middle-container"><div class="dialog-left-border"></div><div class="dialog-inner-container">');
			// draw title
			opts.title === false || buf
			.push('<div class="dialog-title-container"><div class="dialog-title">', opts.title, '</div><div tabindex="0" class="dialog-button-close" title="', opts.titleClose, '">', (opts.labClose || ''), '</div></div>')
			// draw content
			buf
			.push('<div class="dialog-content-container"></div>', tmplBtns, '</div><div class="dialog-right-border"></div></div>');
			// draw bottom
			buf.push('<div class="dialog-bottom-container"><div class="dialog-bottom-border"></div></div>');
			// done
			buf.push('</div>');
			return buf.join('');
		},
		destroy : function() {
			dialogList.remove(this);
			var opts = this.options;
			// remove mask from dom
			if (opts.modal) {
				this.data("mask").removeShadow().remove();
			}
			// restore content node.
			var data = this.data("dialog.history");
			if (data && data.el) {
				var $node = $(data.el).css({
					"display" : data.display,
					"position" : data.position
				});
				if (data.parent) {
					$node.html(data.html).appendTo(data.parent);
				}
				this.removeData("dialog.history");
			}
			// remove dialog from dom.
			this.remove();
		},
		close : function(state, event) {
			var opts = this.options;
			event && (event.state = state);
			if ($.isFunction(opts.onBeforeClose) && opts.onBeforeClose.call($dialog, event) === false) {
				return false;
			}
			// call destroy method
			this.destroy();
			if ($.isFunction(opts.onClose)) {
				opts.onClose(event);
			}
			if (state == "accept") {
				if ($.isFunction(opts.onAccept)) {
					opts.onAccept(event);
				}
			} else if (state == "cancel") {
				if ($.isFunction(opts.onCancel)) {
					opts.onCancel(event);
				}
			}
			return true;
		},
		adjust : function() {
			// adjust mask size
			var opts = this.options;
			var $mask = this.data("mask");
			if ($mask) {
				if (ieBug) {
					$mask.css("position", "absolute").height(Math.max($body.boxHeight(), $window.height())).width(Math
					.max($body.boxWidth(), $window.width())).iShadow({
						position : "absolute",
						referPoint : "topleft"
					});
				} else {
					$mask.iShadow({
						position : "fixed",
						referPoint : "topleft"
					});
				}
			}
			var $contentContainer = $("div.dialog-content-container", this);
			if ((typeof arguments[0] == "undefined") || initializing || $contentContainer.boxWidth() > $window.width() - $
			.scrollbarWidth()) {
				if (!initializing) {
					$contentContainer.css({
						height : "auto"
					});
				}
				var $leftBorder = $("div.dialog-left-border", this);
				var $rightBorder = $("div.dialog-right-border", this);
				var $topBorder = $("div.dialog-top-border", this);
				var $bottomBorder = $("div.dialog-bottom-border", this);
				// var $topLeftCorner = $("div.dialog-top-left-corner", this);
				// var $topRightCorner = $("div.dialog-top-right-corner", this);
				// var $bottomLeftCorner = $("div.dialog-bottom-left-corner",
				// this);
				// var $bottomRightCorner = $("div.dialog-bottom-right-corner",
				// this);
				var $topContainer = $("div.dialog-top-container", this);
				var $midderContainer = $("div.dialog-middle-container", this);
				var $bottomContainer = $("div.dialog-bottom-container", this);
				var $innerContainer = $("div.dialog-inner-container", this);
				var $titleContainer = $("div.dialog-title-container", this);
				var $title = $("div.dialog-title", this);
				var $buttonClose = $("div.dialog-button-close", this);
				var $buttonContainer = $("div.dialog-button-container", this);
				// give the content a width or height define.
				var contentWidth = Math.max((parseInt(opts.contentWidth) || Math.min($contentContainer.boxWidth(), $window
				.width() - $.scrollbarWidth())), opts.btns.length * 80);
				$contentContainer.boxWidth(contentWidth);
				var contentHeight = (parseInt(opts.contentHeight) || $contentContainer.boxHeight());
				$contentContainer.boxHeight(contentHeight);
				// translate buttons inside content to iButton default style.
				if (opts.contentBtnHelp && $.fn.iButton) {
					$("input[type='button'], button", $contentContainer).iButton();
				}
				// set the title-container and button-container are sync with
				// content width
				var contentBoxWidth = $contentContainer.boxWidth();
				$titleContainer.boxWidth(contentBoxWidth);
				$buttonContainer.boxWidth(contentBoxWidth);
				// adjust title and button layout.
				$title.boxWidth($titleContainer.width() - $buttonClose.boxWidth());
				if (initializing && $.fn.iButton) {
					$("input[type='button'], button", $buttonContainer).iButton();
				}
				// set the top-border and bottom-border width.
				var innerContainerBoxWidth = contentBoxWidth + $innerContainer.box("lr");
				$innerContainer.boxWidth(innerContainerBoxWidth);
				// $topBorder.boxWidth(innerContainerBoxWidth);
				// $bottomBorder.boxWidth(innerContainerBoxWidth);
				// set the left-border and right-border height.
				var innerContainerBoxHeight = $innerContainer.box("tb") + $contentContainer.boxHeight() + $titleContainer
				.boxHeight() + $buttonContainer.boxHeight();
				$leftBorder.boxHeight(innerContainerBoxHeight);
				$rightBorder.boxHeight(innerContainerBoxHeight);
				$midderContainer.height(innerContainerBoxHeight)
				.width($leftBorder.boxWidth() + $innerContainer.boxWidth() + $rightBorder.boxWidth());
				$topBorder.boxWidth($midderContainer.boxWidth());
				$bottomBorder.boxWidth($midderContainer.boxWidth());
				// give the top-c, middle-c and bottom-c a fixed width and
				// height.
				// $topContainer.width($topLeftCorner.boxWidth() +
				// $topBorder.boxWidth() + $topRightCorner.boxWidth());
				$topContainer.width($topBorder.boxWidth());
				// $bottomContainer.width($bottomLeftCorner.boxWidth() +
				// $bottomBorder.boxWidth() +
				// $bottomRightCorner.boxWidth());
				$bottomContainer.width($bottomBorder.boxWidth());
				// give the dialog a fixed width
				this.width($midderContainer.boxWidth());
			}
			if (opts.fixed || initializing) {
				// fix ie6 layout issue to make dialog reflow.
				this.css({
					"top" : "1px",
					"left" : "1px"
				});
				// calculate the top and left position
				var top = (parseInt(opts.top) || parseInt(($window.height() - this.boxHeight()) / 2));
				var left = (parseInt(opts.left) || parseInt(($window.width() - this.boxWidth()) / 2));
				this.css({
					"top" : top + "px",
					"left" : left + "px"
				});
				this.ieFixedPos();
			}
			if (opts.zindex && typeof opts.zindex === 'number') {
				this.css('zIndex', opts.zindex);
			}
			if (initializing && !opts.fixed && opts.scrollIntoView) {
				this.scrollIntoView();
			}
			// give default button focus
			if (initializing) {
				if (opts.defaultBtn == "accept") {
					$(".dialog-button-accept", $buttonContainer).eq(0).focus();
				} else if (opts.defaultBtn == "cancel") {
					$(".dialog-button-cancel", $buttonContainer).eq(0).focus();
				}
			}
			return this;
		},
		scrollIntoView : function() {
			var pos = this.position(), scrollTop = $window.scrollTop(), scrollLeft = $window.scrollLeft();
			if (((pos.top < scrollTop) || (pos.top > $window.height() + scrollTop)) || ((pos.left < scrollLeft) || (pos.left > $window
			.width() + scrollLeft))) {
				this[0].scrollIntoView();
			}
		},
		ieFixedPos : ieBug ? function() {
			var opts = this.options;
			if (opts.fixed) {
				var top = (parseInt(opts.top) || parseInt(($window.height() - this.boxHeight()) / 2));
				var left = (parseInt(opts.left) || parseInt(($window.width() - this.boxWidth()) / 2));
				this.css({
					"top" : top + $window.scrollTop() + "px",
					"left" : left + $window.scrollLeft() + "px"
				});
			}
			return this;
		} : NOP,
		ieFixedHide : ieBug ? function() {
			this.options.fixed && this.css({
				"top" : "-10000px",
				"left" : "-10000px"
			});
			return this;
		} : NOP
	});
	$.dialog = Dialog;
	/* the jquery inform dialog */
	$.inform = function(settings) {
		var defaults = {
			icon : false,
			title : false,
			content : "",
			delay : 2000,
			easyClose : true,
			onClose : null
		};
		// give settings to UI elements
		var opts = $.extend(defaults, settings);
		// for icon class define.
		var content = $.isPlainObject(settings) ? opts.content : settings;
		if (typeof opts.icon == 'string') {
			content = '<div class="dialog-icon ' + opts.icon + '"></div><div class="dialog-content has-icon">' + content + '</div>';
		}
		var $dialog = new Dialog({
			className : "jquery-inform",
			title : false,
			content : content,
			onClose : opts.onClose,
			contentWidth : opts.contentWidth
		});
		// bind close handler.
		var timer;
		if (opts.delay > 0) {
			timer = window.setTimeout(close, opts.delay);
		}
		if (opts.easyClose) {
			$document.bind("mousedown", close);
		}
		// close by timeout or click event.
		function close() {
			try {
				$dialog.close();
			} catch (e) {
			}
			window.clearTimeout(timer);
			if (opts.easyClose) {
				$document.unbind("mousedown", close);
			}
		}
		return $dialog;
	};
	/* the jquery confirm dialog */
	$.alert = function(settings) {
		var defaults = {
			btns : [ "accept" ],
			defaultBtn : "accept",
			icon : false,
			title : false,
			content : "",
			labClose : "确定",
			onClose : null
		};
		var opts = $.extend(defaults, $.isPlainObject(settings) ? settings : {
			content : settings
		});
		opts.className = opts.className ? opts.className + " jquery-alert" : "jquery-alert";
		// for icon class define.
		if (opts.icon) {
			opts.content = '<div class="' + opts.icon + '"></div><div class="dialog-content">' + opts.content + '</div>';
		}
		return new Dialog(opts);
	};
	/* the jquery confirm dialog */
	$.confirm = function(settings) {
		var defaults = {
			icon : false,
			title : false,
			content : "",
			labConfirm : "确定",
			labCancel : "取消",
			btns : [ "accept", "cancel" ],
			defaultBtn : "accept",
			onConfirm : null,
			onCancel : null
		};
		var opts = $.extend(defaults, $.isPlainObject(settings) ? settings : {
			content : settings
		});
		opts.className = opts.className ? opts.className + " jquery-confirm" : "jquery-confirm";
		// for icon class define.
		if (opts.icon) {
			opts.content = '<div class="' + opts.icon + '"></div><div class="dialog-content">' + opts.content + '</div>';
		}
		opts.labAccept = opts.labConfirm;
		opts.onAccept = opts.onConfirm;
		return new Dialog(opts);
	};
	/* the jquery inform dialog */
	$.notice = $.sentenceNotice = function(settings) {
		var defaults = {
			type : 'dialog', // 提示框样式 dialog|confirm|notice
			className : "sentence-notice-dialog",
			icon : "", // icon样式 success|notice|error
			title : "提示",
			content : "",
			btns : [ 'accept' ],
			labAccept : '确定',
			delay : -1,
			easyClose : false,
			onClose : null
		};
		// give settings to UI elements
		var opts = $.extend(defaults, settings);
		// for icon class define.
		var content = $.isPlainObject(settings) ? opts.content : settings;
		switch (opts.type) {
		case 'notice':
			opts.className = "sentence-dialog-notice";
			opts.btns = [];
			// opts.delay = 2000;
			opts.easyClose = true;
			break;
		case 'confirm':
			opts.className = "sentence-dialog-confirm";
			opts.btns = [];
			opts.easyClose = true;
			break;
		case 'dialog':
			opts.className = "sentence-dialog";
			break;
		default:
			break;
		}
		if (opts.icon) {
			content = '<div class="sentence-notice-box"><div class="notice-box-wrapper"><span class="notice-icon ' + opts.icon + '"></span><div class="notice-content has-icon">' + content + '</div></div></div>';
		} else {
			content = '<div class="sentence-notice-box"><div class="notice-box-wrapper"><div class="notice-content">' + content + '</div></div></div>';
		}
		var $dialog = new Dialog({
			className : opts.className,
			title : false,
			content : content,
			onClose : opts.onClose,
			btns : opts.btns,
			labAccept : opts.labAccept,
			easyClose : opts.easyClose
		});
		// bind close handler.
		var timer;
		if (opts.delay > 0) {
			timer = window.setTimeout(close, opts.delay);
		}
		if (opts.easyClose) {
			$document.bind("mousedown", close);
		}
		// close by timeout or click event.
		function close() {
			try {
				$dialog.close();
			} catch (e) {
			}
			window.clearTimeout(timer);
			if (opts.easyClose) {
				$document.unbind("mousedown", close);
			}
		}
		return $dialog;
	};
	$.notice.success = function(content, delay) {
		return $.notice({
			type : "notice",
			icon : "success",
			content : content,
			delay : delay || 1100
		});
	};
	$.notice.error = function(content, delay) {
		return $.notice({
			type : "notice",
			icon : "error",
			content : content,
			delay : delay || 1100
		});
	};
}(jQuery, window, document);
