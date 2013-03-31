require('core::util::jQuery', 'core::util::fx', '#document', function($, fx) {

	var handle = $('<a id="back_top" title="返回页面顶部"></a>');

	var $wnd = $(window);
	var disabled = false;
	var wndWidth, wndHeight;

	var shown = false;

	function backTop() {
		disabled = true;
		handle.fadeOut();
		fx({
			src : $wnd.scrollTop(),
			dst : 0,
			type : "log",
			fixFrame : false,
			steps : 12,
			speed : "fast",
			round : true,
			callback : function(n) {
				window.scrollTo(0, n);
			},
			complete : function() {
				disabled = false;
			}
		});
	}
	;
	function onScroll() {
		if (disabled)
			return;
		var scrollTop = $wnd.scrollTop();
		if (shown && scrollTop < wndHeight / 1.67) {
			handle.fadeOut();
			shown = false;
		} else if (!shown && scrollTop >= wndHeight / 1.67) {
			handle.fadeIn();
			shown = true;
		}
	}
	function onResize() {
		wndWidth = $wnd.width();
		wndHeight = $wnd.height();
		var right = Math.floor(wndWidth / 2 - 530);
		handle.css("right", right > 0 ? right + "px" : 0);
		onScroll();
	}

	handle.init = function() {
		document.body.appendChild(handle[0]);
		handle.click(backTop);
		$wnd.bind("resize", onResize);
		$wnd.bind("scroll", onScroll);
		handle.focus(function() {
			this.blur();
		});
		onResize();
	};
	handle.init();
});
