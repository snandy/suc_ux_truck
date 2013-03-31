/**
 * @description transform组件，对旋转等变换的封装，应用于图形高级变换。
 */
require('core::util', function(util) {
	/**
	 * @description 矩形变换类
	 */
	function Transform() {
		this.length = 4;
		this[0] = this[3] = 1;
		this[1] = this[2] = 0;
	}
	/**
	 * @description 旋转变换
	 * @param q
	 *            旋转角度(弧度制)
	 * @returns {Transform}
	 */
	Transform.prototype.rotate = function(q) {
		q === undefined && (q = 0);
		var sin = Math.sin(q), cos = Math.cos(q);
		return this.multiply([ cos, sin, -sin, cos ]);
	};
	/**
	 * @description 将另一个transform作用在自己身上
	 * @param q
	 *            旋转角度(弧度制)
	 * @returns {Transform}
	 */
	Transform.prototype.multiply = function(t) {
		var a = this[0] * t[0] + this[1] * t[2], b = this[0] * t[1] + this[1] * t[3], c = this[2] * t[0] + this[3] * t[2], d = this[2] * t[1] + this[3] * t[3];
		this[0] = a;
		this[1] = b;
		this[2] = c;
		this[3] = d;
		return this;
	};
	/**
	 * @description 拉伸
	 * @param scalex
	 *            x方向拉伸倍数
	 * @param scaley
	 *            y 方向拉伸倍数
	 * @returns {Transform}
	 */
	Transform.prototype.scale = function(scalex, scaley) {
		return this.multiply([ scalex === undefined ? 1 : scalex, 0, 0, scaley === undefined ? 1 : scaley ]);
	};
	/**
	 * @description 倾斜
	 * @param skewx
	 *            x方向倾斜
	 * @param skewy
	 *            y方向倾斜
	 * @returns {Transform}
	 */
	Transform.prototype.skew = function(skewx, skewy) {
		return this.multiply([ 1, skewy || 0, skewx || 0, 1 ]);
	};
	/**
	 * @description 将点应用当前变换
	 */
	Transform.prototype.transform = function(x, y) {
		return {
			x : this[0] * x + this[1] * y,
			y : this[2] * x + this[3] * y
		};
	};
	/**
	 * @function bzero
	 * @description 将transform的较小值转换为0
	 */
	Transform.prototype.bzero = function() {
		for ( var n = 0; n < 4; n++) {
			this[n] > -1e-6 && this[n] < 1e-6 && (this[n] = 0);
		}
	};
	Transform.prototype.join = Array.prototype.join;
	var defaults = {
		rotate : 0,
		scalex : 1,
		scaley : 1,
		skewx : 0,
		skewy : 0,
		dx : 0,
		dy : 0,
		center : false
	};
	/**
	 * @description transform方法
	 * @param options.rotate
	 *            旋转角度（弧度制），默认为0
	 * @param options.scalex
	 *            x方向拉伸，默认为1
	 * @param options.scaley
	 *            y方向拉伸，默认为1
	 * @param options.skewx
	 *            x方向倾斜，默认为0
	 * @param options.skewy
	 *            y方向倾斜，默认为0
	 * @param options.dx
	 *            x方向偏移，默认为0
	 * @param options.dy
	 *            y方向偏移
	 * @param options.width
	 *            被变换目标的宽度，用来修正偏移
	 * @param options.height
	 *            被变换目标的高度，用来修正偏移
	 * @param options.center
	 *            是否进行中心变换，默认为false
	 * @return {Object} 一个对象，包含针对当前浏览器的样式键值对
	 */
	define('core::util::transform', function(options) {
		options = util.probe(defaults, options);
		var tf = new Transform();
		if (options.rotate) {
			tf.rotate(options.rotate);
		}
		if (options.scalex != 1 || options.scaley != 1) {
			tf.scale(options.scalex, options.scaley);
		}
		if (options.skewx || options.skewy) {
			tf.skew(options.skewx, options.skewy);
		}
		// 计算顶点变换和中央变换的偏移
		if (!options.center) {
			var curX = options.width / 2, curY = options.height / 2, shift = tf.transform(curX, curY);
			options.dx += shift.x - curX;
			options.dy += shift.y - curY;
		}

		tf.bzero();
		var ret;
		// 判断浏览器
		if (util.ie) { // MSIE
			// MSIE 的DXImageTransform利用坐标轴定界的方式定位，用中心点的位置修正偏移
			var twh = tf.transform(options.width, options.height), t0h = tf.transform(0, options.height), tw0 = tf.transform(options.width, 0);

			options.dx -= (Math.max(twh.x, t0h.x, tw0.x, 0) - Math.min(twh.x, t0h.x, tw0.x, 0) - options.width) / 2;
			options.dy -= (Math.max(twh.y, t0h.y, tw0.y, 0) - Math.min(twh.y, t0h.y, tw0.y, 0) - options.height) / 2;
			ret = {
				filter : [ "progid:DXImageTransform.Microsoft.Matrix(M11=", tf[0], ",M12=", tf[2], ",M21=", tf[1], ",M22=", tf[3], ",SizingMethod='auto expand')" ].join(''),
				marginLeft : options.dx + "px",
				marginTop : options.dy + "px"
			};
		} else if ("MozTransform" in document.body.style) { // firefox
			ret = {
				MozTransform : "matrix(" + tf.join() + "," + options.dx + "px," + options.dy + "px)"
			};
		} else {
			ret = {};
			ret["WebkitTransform" in document.body.style ? "WebkitTransform" : "OTransform" in document.body.style ? "OTransform" : "transform"] = "matrix(" + tf.join() + "," + options.dx
			+ "," + options.dy + ")";
		}
		return ret;
	});
});
