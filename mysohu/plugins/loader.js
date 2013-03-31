/*
 * Loader
 */

(function() {
	if (window.LOADCSS) {
		return;
	}

	// type checking functions
	function isFunction(obj) {
		return Object.prototype.toString.call(obj) === "[object Function]";
	}

	function isArray(obj) {
		return Object.prototype.toString.call(obj) === "[object Array]";
	}

	function isString(obj) {
		return typeof obj == "string" || Object.prototype.toString.call(obj) === "[object String]";
	}

	window.LOADCSS = function(urls, charset) {
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
		}
		;

		if (isString(urls)) {
			loadcss(urls, charset);
		} else if (isArray(urls)) {
			for ( var i = 0; i < urls.length; i++) {
				if (isString(urls[i])) {
					loadcss(urls[i], charset);
				} else if (isArray(urls[i])) {
					loadcss(urls[i][0], urls[i][1]);
				}
			}
		}
	};

	window.LOADJS = function(urls, callback, charset) {
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
				} else if (isArray(urls[i])) {
					loadjs(urls[i][0], success, urls[i][1]);
				}

				i++;
			} else if (isFunction(callback)) {
				callback();
			}
		}
		;

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
			script.onload = script.onreadystatechange = function() {
				if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					done = true;
					if (isFunction(callback)) {
						callback();
					}
					// Handle memory leak in IE
					script.onload = script.onreadystatechange = null;
					head.removeChild(script);
				}
			};

			head.appendChild(script);
		}
		;

		// use different way to load a single file or a bundle of files
		if (isString(urls) && urls) {
			loadjs(urls, callback, charset);
		} else if (isArray(urls) && urls.length) {
			if (isString(urls[i])) {
				loadjs(urls[i], success, charset);
			} else if (isArray(urls[i])) {
				loadjs(urls[i][0], success, urls[i][1]);
			}

			i++;
		} else if (isFunction(callback)) {
			callback();
		}
	};
})();