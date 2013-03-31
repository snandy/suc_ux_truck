;(function($) {

if ($.fn.iPrompt) {
	return;
}

$.fn.iPrompt = function(settings) {
	var defaults = {
		text: null,
		css: { color: "#ccc" },
		preventGray: false,
		refer: "iprompt"
	};

	// give settings to UI elements
	var opts = $.extend(defaults, settings);

	this.isEmpty = function(trim, index) {
		trim = (typeof trim == "boolean") ? trim : false;
		index = parseInt(index) || 0;

		var $target = this.filter("input[type='text'], textarea");
		if ($target.length) {
			if ($target.eq(index).hasClass("i-prompt-gray")) {
				return true;
			}
			else if (trim && $.trim($target.eq(index).val()) == "") {
				return true;
			}
			else if (!trim && $target.eq(index).val() == "") {
				return true;
			}
			else {
				return false;
			}
		}
		else {
			return null;
		}
	};

	this.preventGray = function() {
		opts.preventGray = true;
		return this.filter("input[type='text'].i-prompt, textarea.i-prompt").each(function() {
			$(this).data("iprompt-opts", opts);
		}).end();
	};

	this.removeGray = function() {
		return this.filter("input[type='text'].i-prompt, textarea.i-prompt").each(function() {
			removeGray(this);
		}).end();
	};

	this.addGray = function() {
		return this.filter("input[type='text'].i-prompt, textarea.i-prompt").each(function() {
			addGray(this);
		}).end();
	};

	function removeGray(textbox) {
		var $textbox = $(textbox);
		if ($textbox.hasClass("i-prompt-gray")) {
			textbox.style.cssText = $textbox.data("cssText");
			$textbox.removeClass("i-prompt-gray").val("");
		}
	}

	function addGray(textbox) {
		var $textbox = $(textbox);
		$textbox.css(opts.css).addClass("i-prompt-gray").val(opts.text || $textbox.attr(opts.refer) || "");
	}

	this.filterEmpty = function() {
		return this.filter("input[type='text'].i-prompt, textarea.i-prompt").filter(".i-prompt-gray");
	};

	this.notEmpty = function() {
		return this.filter("input[type='text'].i-prompt, textarea.i-prompt").not(".i-prompt-gray");
	};

	return this.filter("input[type='text'], textarea").each(function() {
		var $this = $(this);
		if ($this.data("iprompt-opts")) {
			opts = $this.data("iprompt-opts");
		}
		else if (settings === false || settings === null) {
			return;
		}
		else {
			$this
			// save options to data cache
			.data("iprompt-opts", opts)
			// add css style properties
			.data("cssText", this.style.cssText)
			.addClass("i-prompt")
			.focus(function() {
				removeGray(this);
			})
			.blur(function(event) {
				window.setTimeout(function() {
					var $this = $(event.target);

					if (opts.preventGray) {
						opts.preventGray = false;
						$this.data("iprompt-opts", opts);
						return;
					}

					if (!$.trim($this.val())) {
						addGray(event.target);
					}
				}, 100);
			})
			.keydown(function(event) {
				if (event.keyCode == 27) {
					$(this).blur();
				}
			})
			.closest("form")
			.submit(function(event) {
				if ($this.hasClass("i-prompt-gray")) {
					$this.removeClass("i-prompt-gray").val("");
				}
			});

			// set input element to default value
			this.value = this.defaultValue;
			if (!$.trim($this.val())) {
				addGray(this);
			}
		}
	}).end();
};
})(jQuery);