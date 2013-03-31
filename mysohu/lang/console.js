~function(window, document) {
	var wnd;
	window.console.log = function() {
		if (!wnd)
			return;
		for ( var n = 0, L = arguments.length; n < L; n++) {
			wnd.console.log(arguments[n]);
		}
	};
	document.documentElement.onkeydown = function(e) {
		e || (e = window.event);
		if (e.keyCode != 123)
			return;
		if (wnd) {
			wnd.close();
			wnd = null;
		} else
			activate();
	};
	function activate() {
		wnd = window.open('', 'Console', 'width=600, height=400, toolbar=no, menubar=no, status=no');
		var doc = wnd.document;
		doc
		.write('<html><head><title>Console</title><style type="text/css">body{margin:0;}\nul{border:1px solid #CCC;margin:0 0 0 12px;padding:0}li{list-style:none}textarea{width:600px;height:100px;border:1px solid #DDD}.number{color:green}.boolean,.undefined,.function{color:gray}.string{color:red}.key{color:blue}</style></head><body><ul style="width:600px;margin-left:0;height:300px;overflow-y:scroll"></ul><textarea></textarea></body></html>');
		doc.close();
		var ul = doc.body.children[0], tf = doc.body.children[1];
		doc.documentElement.onkeydown = function(e) {
			e || (e = wnd.event);
			if (e.keyCode == 123) {
				wnd.close();
				wnd = null;
			} else if (e.keyCode == 13) {
				var val = tf.value;
				if (val === "clear") {
					ul.innerHTML = "";
					objects = {};
				} else {
					try {
						wnd.console.log(new Function("return " + val.replace(/^\s+|\s+$/g, ''))(), val);
					} catch (err) {
						wnd.console.log(err, val);
					}
				}
				tf.value = "";
				e.returnValue = false;
				return false;
			}
		};
		var objects = {};
		wnd.console = {
			log : function(data, str) {
				str && str.length > 30 && (str = str.substr(0, 24) + "..." + str.substr(str.length - 3));
				ul.appendChild(getLI(data, str));
			}
		};
		function getLI(data, key) {
			var li = doc.createElement("LI"), str = key ? '<span class="key">' + key + ": </span>" : '';
			switch (typeof data) {
			case 'string':
				str += '"' + data + '"';
				break;
			case 'function':
				str += "[function]";
				break;
			case 'number':
			case 'boolean':
			case 'undefined':
				str += String(data);
				break;
			case 'object':
				if (data == null)
					str += '<i>null</i>';
				else {
					var uid = (Math.random() * 65536 << 0).toString(36), face;
					try {
						face = data.toString();
					} catch (e) {
						try {
							face = Object.prototype.toString.apply(data);
						} catch (e) {
							face = '[object]';
						}
					}
					str += '<a href="javascript:;" uid="' + uid + '">' + face + '</a>';
					objects[uid] = data;
				}
			}
			li.innerHTML = str;
			li.className = typeof data;
			return li;
		}
		ul.onclick = function(e) {
			e || (e = wnd.event);
			var target = e.srcElement;
			if (!target || target.nodeName != 'A')
				return;
			var parent = target.parentNode, sibling = target.nextSibling;
			if (sibling && (sibling.nodeName == "UL")) {// remove
				var as = sibling.getElementsByTagName("A");
				for ( var i = 0, L = as.length; i < L; i++) {
					objects[as[i].getAttribute("uid")] = undefined;
				}
				parent.removeChild(sibling);
			} else {
				var data = objects[target.getAttribute("uid")];
				var ul = doc.createElement("UL");
				for ( var k in data) {
					ul.appendChild(getLI(data[k], k));
				}
				if (sibling) {
					parent.insertBefore(ul, sibling);
				} else {
					parent.appendChild(ul);
				}
			}
		};
		tf.focus();
	}
}(window, document);
