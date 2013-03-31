require('core::util', 'core::util::jQuery', function(util, $) {
	function TextBox(em) {
		this[0] = $(em)[0];
		this[0].wrapped = this;
		this.length = 1;

		this.bind('focus', mmFocus);
		this.bind('blur', mmBlur);
		this.bind('keydown', mmKeydown);
		this.bind('keyup', mmKeyup);
		this.oldVal = this[0].value;
	}
	/**
	 * class TextBox extends jQuery
	 */
	util.probe({
		getText : function() {
			var ret = this[0].value;
			return ret === this.oldVal ? '' : ret;
		},
		setText : function(text) {
			this.value = this[0].value = text;
			this.onChange && this.onChange(text);
			return this;
		},
		destroy : function() {
			this.unbind('focus', mmFocus);
			this.unbind('blur', mmBlur);
			this.unbind('keydown', mmKeydown);
			this.unbind('keyup', mmKeyup);
			this[0].wrapped = null;
		},
		moveTo : function(n) {
			var val = this[0].value;
			if (n == -1)
				n = val.length;
			if (this[0].setSelectionRange) {
				this[0].focus();
				this[0].setSelectionRange(n, n);
			} else if (this[0].createTextRange) {
				var range = this[0].createTextRange();
				range.collapse(true);
				range.moveEnd('character', n);
				range.moveStart('character', n);
				range.select();
			}

		}
	}, TextBox.prototype = new $.fn.init());
	function mmFocus() {
		this.style.color = "#000";
		if (this.value === this.wrapped.oldVal) {
			this.value = "";
			this.wrapped.onChange && this.wrapped.onChange("");
		}
		this.wrapped.onFocus && this.wrapped.onFocus();
	}
	function mmBlur() {
		if (this.value === "") {
			this.style.color = "";
			this.value = this.wrapped.oldVal;
		}
		this.wrapped.onBlur && this.wrapped.onBlur();
	}
	function mmKeyup(e) {
		if (e.keyCode == 17) {
			this.ctrl = false;
		} else {
			var newVal = this.value;
			var $ = this.wrapped;
			if ($.value != newVal) {
				$.value = newVal;
				$.onChange && $.onChange(newVal);
			}
		}
		this.wrapped.onKeyup && this.wrapped.onKeyup();
	}
	function mmKeydown(e) {
		if (e.keyCode == 17) {
			this.ctrl = true;
		} else if (e.keyCode == 13 && this.ctrl) {
			this.wrapped.onSend && this.wrapped.onSend();
		}
	}

	define('core::ui::TextBox', TextBox);
});