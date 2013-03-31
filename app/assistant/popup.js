load('/app/assistant/d/popup.css');
require('core::util::jQuery', 'core::util', function($, util) {
	var defaults = {
		dir : 'auto',
		arrow : 20,
		content : '',
		autoCollapse : true,
		autoInsert : true
	};
	function Popup(options) {
		if (!this instanceof Popup) {
			return new Popup(options);
		}
		options = this.options = util.probe(defaults, options);
		this[0] = div.cloneNode(true);
		this.$body = this.find('.box');
		this.$arrow = this.find('.arrow');
		this.setContent(options.content);
		options.autoCollapse && setCollapse(this);
		options.className && this.$body.addClass(options.className);
		if (options.handle) {
			options.handle.popup && options.handle.popup.destroy();
			options.handle.popup = this;
			options.autoInsert && this.prependTo(options.handle.$dom);
		}
	}
	Popup.prototype = new $.fn.init();
	Popup.prototype.length = 1;
	Popup.prototype.resize = function(width, height, callback) {
		this.$body.animate({
			width : width,
			height : height
		}, 'fast', 'swing', callback);
		return this;
	};
	Popup.prototype.setArrow = function(dir, margin) {
		this.$arrow[0].className = "arrow arrow-" + dir;
		var hori = dir == "left" || dir == "right";
		this.$arrow.css({
			marginTop : hori ? margin : 0,
			marginLeft : hori ? 0 : margin
		});
		return this;
	};
	Popup.prototype.setContent = function(content) {
		this.$body.html(content);
		var self = this;
		self.autoPos();
		return this;
	};
	Popup.prototype.autoPos = function(pixels) {
		var dir;
		if (this.options.dir == 'auto') {
			if (this.options.handle) {
				var w = this.$body.width(), h = this.$body.height(), pos = this.options.handle.pos;
				var left = pos.left || pos.x - 40 > w, top = pos.top || pos.y + 96 > h;
				dir = !top ? 'bottom' : left ? 'left' : 'right';
			} else {
				dir = 'left';
			}
		} else {
			dir = this.options.dir;
		}
		this.setArrow(dir, this.options.arrow);
		var css = {
			left : '',
			top : '',
			bottom : '',
			right : ''
		};
		css[dir] = (typeof pixels === "undefined") ? '130px' : pixels + "px";
		this.css(css);
		return this;
	};
	Popup.prototype.collapse = function() {
		this.trigger(Popup.Collapse).destroy();
	};
	Popup.prototype.destroy = function() {
		this.remove();
		this.options.handle && this.options.handle.popup === this && (this.options.handle.popup = null);
		this.oncollapse && $(document).unbind('mouseup', this.oncollapse);
	};
	/**
	 * Collapse事件在mousedown时被触发，触发条件为鼠标在当前popup的父元素以外的地方被按下
	 */
	Popup.Collapse = 'i-collapse';
	var div = document.createElement("DIV");
	div.className = "i-assist-popup";
	div.innerHTML = '<div class="arrow"></div><div class="box"></div>';
	function setCollapse($popup) {
		setTimeout(function() {
			$(document).bind('mouseup', $popup.oncollapse = function(e) {
				for ( var current = e.target, parent = $popup[0]; current; current = current.parentNode) {
					if (current === parent)
						return;
				}
				$popup.collapse();
			});
		}, 0);
	}
	define("app::assistant::popup", Popup);
});