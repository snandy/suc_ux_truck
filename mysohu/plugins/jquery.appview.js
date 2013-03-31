/**
 * appview plugin for load appview structure JSON data.
 * @author yadongzhao
 * @reconstructed by Lewis lv
 */

;(function($) {
if ($.appview != null) {
	return;
}

window.location.hash = window.location.hash;//fix ie 302 reload bug

//将LOADJS和LOADCSS放入闭包内，不在调用原来的全局函数
// type checking functions
function isString(obj) {
	return typeof obj == "string" || Object.prototype.toString.call(obj) === "[object String]";
}

function LOADCSS(urls, charset) {
	var head = document.getElementsByTagName("head")[0];

	// inner function for loading a single css file
	function loadcss(url, charset) {
		var link = document.createElement("link");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		if (charset) {
			link.charset = charset;
		}
		link.setAttribute("href", url);
		head.appendChild(link);
	};

	if (isString(urls)) {
		loadcss(urls, charset);
	}
	else if ($.isArray(urls)) {
		for (var i = 0; i < urls.length; i++) {
			if (isString(urls[i])) {
				loadcss(urls[i], charset);
			}
			else if ($.isArray(urls[i])) {
				loadcss(urls[i][0], urls[i][1]);
			}
		}
	}
}

function LOADJS(urls, callback, charset) {
	var i = 0;
	if (isString(callback)) {
		charset = callback;
		callback = null;
	}

	// callback for js queue loading
	function success() {
		if (i < urls.length) {
			if (isString(urls[i])) {
				loadjs(urls[i], success, charset);
			}
			else if ($.isArray(urls[i])) {
				loadjs(urls[i][0], success, urls[i][1]);
			}

			i++;
		}
		else if ($.isFunction(callback)) {
			callback();
		}
	};

	// inner function for loading a single js file
	function loadjs(url, callback, charset) {
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.async = true;
		if (charset) {
			script.charset = charset;
		}
		script.src = url;

		// Handle Script loading
		var done = false;
		// Attach handlers for all browsers
		script.onload = script.onreadystatechange = function(){
			if ( !done && (!this.readyState ||
					this.readyState == "loaded" || this.readyState == "complete") ) {
				done = true;
				if ($.isFunction(callback)) {
					callback();
				}
				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;
				head.removeChild( script );
			}
		};

		head.appendChild(script);
	};

	// use different way to load a single file or a bundle of files
	if (isString(urls) && urls) {
		loadjs(urls, callback, charset);
	}
	else if ($.isArray(urls) && urls.length) {
		if (isString(urls[i])) {
			loadjs(urls[i], success, charset);
		}
		else if ($.isArray(urls[i])) {
			loadjs(urls[i][0], success, urls[i][1]);
		}

		i++;
	}
	else if ($.isFunction(callback)) {
		callback();
	}
}


// load js and css to current page.
function loadAssets(assets, callback) {
	var arrJS = [], arrCSS = [];
	if ($.isArray(assets)) {
		for (var i = 0; i < assets.length; i++) {
			var asset = assets[i];
			if (asset.type == "javascript") {
				if (asset.src) {
					arrJS.push(asset.src);
				}
				else if (asset.text) {
					$("head").append('<script>' + asset.text + '</script>');
				}
			}
			else if (asset.type == "css") {
				if (asset.src) {
					arrCSS.push(asset.src);
				}
				else if (asset.text) {
					$("head").append('<style>' + assets[i].text + '</style>');
				}
			}
		}

		LOADCSS(arrCSS, "utf-8");
		LOADJS(arrJS, callback, "utf-8");
	}
	else if($.isFunction(callback)){
		callback();
	}
};


// appview plugin for sohu appview standard
$.appview = function(settings) {
	var defaults = {
		url: "",
		autoHash: true,
		target: "",
		param: "",
		method: "get",
		onBoot: null,
		onLoad: null
	};

	var opts = $.extend(defaults, settings);

	var $target = $(opts.target);
	if (opts.url && $target.length) {
		if(typeof opts.param == 'object') {
			opts.param = $.param(opts.param);
		}
		var hash = /\?/.test(opts.url) ? opts.url + (opts.param ? '&' + opts.param : '') : opts.url + (opts.param ? '?' + opts.param : '');
		$.ajax({
			url: opts.url,
			type: opts.method,
			data: opts.param ? opts.param + '&_=' + new Date().getTime() : '_=' + new Date().getTime(),
			dataType: "json",
			success: function(result) {
				if (result.status == 1) {
					if (this.type.toLowerCase() == "get" && (opts.autoHash === true || opts.autoHash === "true")) {
						location.hash = hash;
					}

					var data = result.data;
					if (!data) {
						return;
					}

					// set page title
					if (data.page_title) {
						document.title = data.page_title;
					}

					// 1st, bootload handler
					loadAssets(data.bootload, function() {
						if ($.isFunction(opts.onBoot)) {
							opts.onBoot();
						}

						// 2nd, fill html
						$target.eq(0).html(data.view);

						// 3rd, onload handler
						loadAssets(data.onload, opts.onLoad);
					});
				}
			}
		});
	}

	return $;
};


// listen the document click event to handle the appview call.
$(document).click(function(event) {
	var $target = $(event.target);
	var $anchor = $target.closest("[data-role='appview']");
	if ($anchor.length > 0) {
		var url = $anchor.attr("data-url"),
			autoHash = $anchor.attr("data-autohash"),
			target = $anchor.attr("data-target"),
			param = $anchor.attr("data-param"),
			method = $anchor.attr("data-method");

		if (url && target) {
			$.appview({
				url: url,
				autoHash: autoHash,
				target: target,
				param: param,
				method: method
			});
		}
	}
});

})(jQuery);
