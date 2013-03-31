/*
 * Usage: $(selector).iShadow({position: "fixed", referPoint: "topleft"}
 * position: can be "fixed", or "absolute"
 * referPoint: can be "topleft", "topright", "bottomleft", or "bottomright"
 */

;(function($) {

	if($.fn.removeShadow) {
		return;
	}

	var ieBug = /MSIE [6-7]/i.test(navigator.userAgent);
	var defaults = {
		position : "fixed",
		referPoint : "topleft",
		zindex : null
	};
	$.fn.removeShadow = function() {
		return this.each(function() {
			var shadowId = $(this).data("iShadow");
			if(shadowId) {
				$("#" + shadowId).remove();
			}
		});
	};
	$.fn.iShadow = function(opts) {
		if(!ieBug || (!document.getElementsByTagName("select").length && !document.getElementsByTagName("object").length)) {
			return this;
		}

		// merge current settings with defaults
		opts = $.extend(defaults, opts);

		return this.each(function() {
			var $this = $(this), shadowId = $this.data("iShadow"), $iframe, position, iWidth, iHeight, zindex;

			// Create a shadow iframe in the first time. Next time, just get it directly.
			if(shadowId) {
				$iframe = $("#" + shadowId);
			} else {
				zindex = opts.zindex || parseFloat($this.css("zIndex"));
				shadowId = "ishadow-" + new Date().getTime();
				$this.data("iShadow", shadowId);
				$iframe = $('<iframe id="' + shadowId + '" frameborder="0" tabindex="-1" style="position:' + opts.position +
				';z-index:' + zindex + ';display:block;cursor:default;opacity:0;filter:alpha(opacity=0);"></iframe>')
				.insertBefore($this);
				if(opts.position == "fixed") {
					var poses = opts.referPoint.match(/(top|bottom)(left|right)/);
					if(!poses) {
						console.log('iShadow: incorrect reference point!');
						return;
					}
					var opt = {};
					opt[poses[1]] = $this.css(poses[1]);
					opt[poses[2]] = $this.css(poses[2]);
					$iframe.css(opt);

				}
			}

			// adjust the shadow iframe's position
			if(opts.position == "absolute") {
				position = $this.position();
				$iframe.css({
					"left" : position.left + "px",
					"top" : position.top + "px"
				});
			}

			// caculate width and height for the shadow iframe element
			iWidth = $this.width() + (parseInt($this.css("padding-left")) || 0) + (parseInt($this.css("padding-right")) || 0) + (parseInt($this.css("border-left-width")) || 0) + (parseInt($this.css("border-right-width")) || 0);
			iHeight = $this.height() + (parseInt($this.css("padding-top")) || 0) + (parseInt($this.css("padding-bottom")) || 0) + (parseInt($this.css("border-top-width")) || 0) + (parseInt($this.css("border-bottom-width")) || 0);

			$iframe.css({
				"width" : iWidth + "px",
				"height" : iHeight + "px",
				"margin-top" : $this.css("margin-top"),
				"margin-right" : $this.css("margin-right"),
				"margin-bottom" : $this.css("margin-bottom"),
				"margin-left" : $this.css("margin-left")
			});
		});
	};
})(jQuery);
