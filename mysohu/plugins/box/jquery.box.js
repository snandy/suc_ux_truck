;(function($) {

if ($.fn.box) {
	return;
}

// sum the layout box style definitions.
function plus() {
	var value = 0, fnName;
	for (var i = 0; i < arguments.length; i++) {
		fnName = $.trim(arguments[i]);

		if (this[fnName]) {
			value += this[fnName]();
		}
	}

	return value;
};


$.fn.box = function() {
	var $this = this.eq(0);
	var map = {
		"ih": function() {
			delete this["ih"];
			return $this.height();
		},
		"iw": function() {
			delete this["iw"];
			return $this.width();
		},
		"oh": function() {
			delete this["oh"];
			return plus.call(this, "ih", "mt", "mb", "bt", "bb", "pt", "pb");
		},
		"ow": function() {
			delete this["ow"];
			return plus.call(this, "iw", "ml", "mr", "bl", "br", "pl", "pr");
		},
		"ml": function() {
			delete this["ml"];
			return (parseInt($this.css("margin-left")) || 0);
		},
		"mr": function() {
			delete this["mr"];
			return (parseInt($this.css("margin-right")) || 0);
		},
		"mt": function() {
			delete this["mt"];
			return (parseInt($this.css("margin-top")) || 0);
		},
		"mb": function() {
			delete this["mb"];
			return (parseInt($this.css("margin-bottom")) || 0);
		},
		"bl": function() {
			delete this["bl"];
			return (parseInt($this.css("border-left-width")) || 0);
		},
		"br": function() {
			delete this["br"];
			return (parseInt($this.css("border-right-width")) || 0);
		},
		"bt": function() {
			delete this["bt"];
			return (parseInt($this.css("border-top-width")) || 0);
		},
		"bb": function() {
			delete this["bb"];
			return (parseInt($this.css("border-bottom-width")) || 0);
		},
		"pl": function() {
			delete this["pl"];
			return (parseInt($this.css("padding-left")) || 0);
		},
		"pr": function() {
			delete this["pr"];
			return (parseInt($this.css("padding-right")) || 0);
		},
		"pt": function() {
			delete this["pt"];
			return (parseInt($this.css("padding-top")) || 0);
		},
		"pb": function() {
			delete this["pb"];
			return (parseInt($this.css("padding-bottom")) || 0);
		},
		"mlr": function() {
			delete this["mlr"];
			return plus.call(this, "ml", "mr");
		},
		"mtb": function() {
			delete this["mtb"];
			return plus.call(this, "mt", "mb");
		},
		"blr": function() {
			delete this["blr"];
			return plus.call(this, "bl", "br");
		},
		"btb": function() {
			delete this["btb"];
			return plus.call(this, "bt", "bb");
		},
		"plr": function() {
			delete this["plr"];
			return plus.call(this, "pl", "pr");
		},
		"ptb": function() {
			delete this["ptb"];
			return plus.call(this, "pt", "pb");
		},
		"l": function() {
			delete this["l"];
			return plus.call(this, "ml", "bl", "pl");
		},
		"r": function() {
			delete this["r"];
			return plus.call(this, "mr", "br", "pr");
		},
		"t": function() {
			delete this["t"];
			return plus.call(this, "mt", "bt", "pt");
		},
		"b": function() {
			delete this["b"];
			return plus.call(this, "mb", "bb", "pb");
		},
		"lr": function() {
			delete this["lr"];
			return plus.call(this, "ml", "mr", "bl", "br", "pl", "pr");
		},
		"tb": function() {
			delete this["tb"];
			return plus.call(this, "mt", "mb", "bt", "bb", "pt", "pb");
		}
	};

	return plus.apply(map, arguments);
};


$.fn.boxWidth = function(width) {
	if (typeof width == "undefined") {
		return this.is(":visible") ? this.box("ow") : 0;
	}
	else {
		return this.each(function() {
			var $this = $(this);
			$this.width(width - $this.box("lr"))
		});
	}
};


$.fn.boxHeight = function(height) {
	if (typeof height == "undefined") {
		return this.is(":visible") ? this.box("oh") : 0;
	}
	else {
		return this.each(function() {
			var $this = $(this);
			$this.height(height - $this.box("tb"))
		});
	}
};

})(jQuery);