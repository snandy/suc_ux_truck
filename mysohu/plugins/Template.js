~function() {
	var regs = {
		zero : /\0/g,
		quots : /'/g,
		dquos : /"/g
	};
	String.prototype.trim || (String.prototype.trim = function() {
		return this.replace(regs.white, '');
	});
	var debug = true;
	var sbuf, stacked;
	var locals = 0;
	var calls = {
		Q : function(S, name) {
			var n = S.length - 1;
			var qObj = arguments.length === 1;
			if (!qObj && !name)
				return S[n];
			for (; n >= 0; n--) {
				var sn = S[n];
				if (typeof sn === 'object' && (qObj || name in sn)) {
					return qObj ? sn : sn[name];
				}
			}
		},
		mkArr : function(S) {
			return S && typeof S === "object" && ("length" in S) ? S : [ S ];
		},
		filter : function() {
			var Rhtmls = /[<>&\"]/g, encodes = {
				'<' : '&lt;',
				'>' : '&gt;',
				'&' : '&amp;',
				'"' : '&quot;'
			};
			return function(s) {
				return 8 < (typeof s).length ? '' : String(s).replace(Rhtmls, function(m) {
					return encodes[m];
				});
			};
		}()
	};
	function makeTemplate(str) {
		if (typeof str === "string") {// simple template
			return makeTemplate({
				self : str
			}).self;
		}
		sbuf = [];
		stacked = [];
		sbuf.push("var ");
		for ( var k in calls) {
			sbuf.push(k, '=calls.', k, ',');
		}
		sbuf.push("self={'_debug':", debug);
		for ( var k in str) {
			sbuf.push(",'", k, "': ");
			locals = 0;
			pushFragment(str[k]);
			if (stacked.length) {
				throw new Error("Template parser: Macros: {{" + stacked.join("}}, {{") + "}} not closed.");
			}
		}
		sbuf.push("};return self;");
		var script = sbuf.join('').replace(regs.zero, '');
		sbuf = stacked = null;
		// console.log(script);
		return new Function("calls", script)(calls);
	}
	function pushFragment(str) {
		sbuf.push('function(obj, funs, stk){var A=[],S=stk||[];funs||(funs=self);S.push(obj);');
		while (str) {
			var index = str.indexOf("{{");// find {{
			if (index == -1) {
				addS(str);
				break;
			}
			index && addS(str.substring(0, index));
			str = str.substring(index + 2);
			index = str.indexOf("}}");
			var name = str.substring(1, index).trim();
			switch (str.charAt(0)) {
			case '{': // push original value
				/**
				 * @example {{{}}} : Stack Top
				 * @example {{{.}}}: Very last object in stack
				 * @example {{{.x}} : x of last object in stack
				 * @example {{{['name']}}} : name of last object in stack
				 * @example {{{(args)}}}: invoke method, with args(S implies
				 *          object stack, A implies output buffer)
				 * @example {{{.x(args)}}}: invoke member method
				 */
				if (str.charAt(index + 2) != '}') {
					debug && console.log('Warning: 缺少模板闭合');
				} else {
					index++;
				}
				addVal(getQString(name));
				break;
			case '#':// push if
				var index2 = str.indexOf("{{", index + 2);
				if (str.substring(index2 + 2, str.indexOf("}}", index2 + 2)) == "/" + name) {
					stacked.push("^" + name);
					sbuf.push("if(" + getQString(name) + "){");
				} else {
					locals++;
					stacked.push("#" + name);
					sbuf.push("var $", locals, "=" + getQString(name) + ";if($", locals, "){$", locals, "=mkArr($", locals,
						");for(var n", locals, "=0,L", locals, "=$", locals, ".length;n", locals, "<L", locals, ";n", locals,
						"++){S.push($", locals, "[n", locals, "]);");
				}
				break;
			case '^':// push if not
				if (!name) {// else
					var tmp = stacked.pop();
					if (tmp.charAt(0) == '#') {
						sbuf.push("S.pop();}");
						locals--;
					} else if (tmp.charAt(0) == '^' || tmp.charAt(0) == '@') {
					} else {
						throw new Error("Template parser: Else macro mismatch.");
					}
					stacked.push('^' + tmp.substr(1));
					sbuf.push('}else{');
				} else {
					stacked.push("^" + name);
					sbuf.push("if(!Q(S,'", name, "')){");
				}
				break;
			case '/':// push end if
				var tmp = stacked.pop();
				if (tmp === "#" + name) {
					sbuf.push("S.pop();}}");
					locals--;
				} else if (tmp === "^" + name || tmp === "@" + name) {
					sbuf.push("}");
				} else {
					throw new Error("Template parser: Endif macro {{/" + name + "}} Mismatch." + (tmp ? " Expected {{/" + tmp
					.substr(1) + "}}" : ""));
				}
				break;
			case '>':
			case '+':// invoke
				addVal("funs['" + name + "'](Q(S,'" + name + "'),funs,S)");
				break;
			case '':
			case '$':
				if (!debug)
					break;
				sbuf.push("console.log('S:', S, ', funs:', funs);");
				break;
			case '@':// array index
				/**
				 * @example {{@}}: get current loop index
				 */
				var tmp = stacked[stacked.length - 1];
				if (!tmp) {
					throw new Error("{{@}} not in loop");
				}
				if (tmp.substr(0, 1) === '#') {
					if (!name) {// push array index
						addVal("n" + locals);
					} else {// push if
						if (name.substr(0, 1) == '^') {// not
							name = name.substr(1);
							sbuf.push('if(n' + locals + '!=' + name + '){');
						} else if (name.substr(0, 1) == '?') {// conditional
							sbuf.push('if(' + name.substr(1).replace(/\bn\b/g, 'n' + locals) + '){');
							name = '?';
						} else {
							sbuf.push('if(n' + locals + '==' + name + '){');
						}
						stacked.push('@' + name);
					}
				}
				break;
			default: // push formatted value
				name = str.substring(0, index);
				addVal("filter(" + getQString(name) + ")");
				break;
			}
			str = str.substring(index + 2);
		}
		sbuf.push("S.pop();if(!stk&&S.length)console.log('Uncleared scope',S);return A.join('');}");
	}
	function getQString(name) {
		return name ? name.charAt(0) == '.' || name.charAt(0) == '[' || name.charAt(0) == '(' ? 'Q(S)' + name : 'Q(S,"' + name + '")' : 'S[S.length-1]';
	}
	function addS(str) {
		addVal(JSON.stringify(str));
	}
	var endOfPush = ");\0";
	function addVal(str) {
		var last = sbuf.length && sbuf[sbuf.length - 1];
		if (last === endOfPush) {
			sbuf[sbuf.length - 1] = ",";
		} else {
			sbuf.push("A.push(");
		}
		sbuf.push(str, endOfPush);
	}
	makeTemplate.to_html = function(str, obj) {
		return makeTemplate({
			self : str
		}).self(obj);
	};
	typeof define != "undefined" && define('plugins::Template', makeTemplate);
	(typeof exports != "undefined" ? exports : this).Template = makeTemplate;
}();