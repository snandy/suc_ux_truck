require('core::util::jQuery', function($) {

	function Select(dom, options, value) {
		if (!dom)
			return;
		if (!dom.nodeType && dom.length == 1) {
			dom = dom[0];
		}
		if (dom.nodeType != 1 || dom.nodeName != "A") {
			var tmp = document.createElement("A");
			dom.parentNode.replaceChild(tmp, dom);
			dom = tmp;
		}
		this[0] = dom;
		this.options = options || (options = {});
		if (!value) {
			for ( var k in options) {
				value = k;
				break;
			}
		}
		this.value = value;
		this.addClass("i-select").html(options[value]);
		var arr = [ '<div class="i-select-options">' ];
		for ( var k in options) {
			arr.push('<a href="javascript:;" data="', k, '">', options[k], '</a>');
		}
		arr.push('</div>');

		this.$div = $(arr.join(''));
		this[0].parentNode.insertBefore(this.$div[0], this[0]);

		this.initEvents();
	}

	Select.prototype = new $.fn.init();
	Select.prototype.length = 1;
	Select.prototype.initEvents = function() {
		var self = this;
		var activ = false;
		var expire = 0;
		this.click(function(e) {
			if (activ) {
			} else {
				if (new Date() - expire < 500)
					return;
				toggle();
				self.$div.css({
					marginLeft : '',
					marginTop : ''
				});
				var pos = self.position(), pos2 = self.$div.position();
				self.$div.css({
					marginLeft : pos.left - pos2.left + "px",
					marginTop : pos.top - pos2.top + 23 + "px"
				});
				$(document).bind('mousedown', mmDown);
			}
		});

		function toggle() {
			self[activ ? "removeClass" : "addClass"]("active");
			self.$div.css('display', activ ? '' : 'inline-block');
			activ = !activ;
		}
		function mmDown(e) {
			$(document).unbind('mousedown', mmDown);
			toggle();
			expire = new Date().getTime();
			var target = e.target;
			if (target.nodeName == "A" & target.parentNode == self.$div[0]) {
				self.value = target.getAttribute("data");
				self.html(self.options[self.value]);
				self.trigger(Select.CHANGE, self.value);
			}

		}
	};
	Select.prototype.destroy = function() {
		this.unbind('click').unbind(Select.CHANGE);
	};
	Select.prototype.setValue = function(value) {
		if (!value in this.options)
			return;
		this.value = value;
		this.html(this.options[value]);
	};

	Select.CHANGE = "i-select-change";

	define('core::ui::Select', Select);
});