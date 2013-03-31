require('app::emote', function(Emote) {
	var regNick = /@([-_a-zA-Z0-9\u4e00-\u9fa5]+)(\.[a-zA-Z]{2,})?/g
		, reg_sname = /\@(\{"[^"]+":\s*"[^"]*",\s*"[^"]+":\s*"[^"]*"})/g
	  , regThin = /[\x00-\x7f]/g
	  , regHtml = /[<>"]/g
	  , htmlReplaces = [
			"lt",
			"gt",
			"quot" ];
	var exports = {
		/**
		 * 计算字符串长度，将非宽字符计算为半个字符
		 * 
		 * @param str
		 * @returns
		 */
		gbLength : function(str) {
			return typeof str === "string" ? str.length + str.replace(regThin, '').length + 1 >> 1 : 0;
		},
		/**
		 * 获取字符串的指定长度的子串，将非宽字符计算为半个字符
		 * 
		 * @param str
		 * @param length
		 * @returns
		 */
		gbSubstr : function(str, length) {
			if (typeof str !== "string")
				return str;
			length += length;
			for ( var n = 0, L = str.length; n < L && length > 0; n++) {
				length -= str.charCodeAt(n) > 127 ? 2 : 1;
			}
			return str.substr(0, n);
		},
		/**
		 * 切割指定字符串的指定长度子串，如果长度超过指定长度，则丢弃末尾两个字符并附加...
		 * 
		 * @param str
		 * @param length
		 * @returns
		 */
		gbCut : function(str, length) {
			if (typeof str !== "string" || str.length <= length || exports.gbLength(str) <= length)
				return str;
			var ret = exports.gbSubstr(str, length - 2);
			return ret + '<span title="' + exports.filter_html(str.substr(ret.length)) + '">...</span>';
		},
		/**
		 * 切割字符串，并丢弃末尾的未终结的转义、
		 * 
		 * @param str
		 * @param length
		 * @returns
		 */
		safeCut : function(str, length) {
			if (!str || exports.gbLength(str) < length)
				return str;
			// 切割时多保留两个字符
			str = exports.gbSubstr(str, length + 2);
			// 已终结的转义，此时认为多于2个字符被最终转义为0.5或1个字符，故返回当前字符串
			if (/&(?:#[\da-f]{4}|[a-z]{1,6});$/i.test(str))
				return str;
			// 未终结的转义，丢弃
			if (/&(?:#[\da-f]{1,4}|[a-z]{1,6})$/i.test(str))
				return str.substr(0, str.lastIndexOf('&'));
			// 未终结的超链接，丢弃
			if (/\bhttp:\/\/[0-9a-f#?&-_\.]*$/i.test(str))
				return str.substr(0, str.lastIndexOf('http://'));
			// 未终结的@昵称，丢弃
			if (/@[-_a-zA-Z0-9\u4e00-\u9fa5]+$/.test(str))
				return str.substr(0, str.lastIndexOf('@'));
			return str.substr(0, str.length - 1);
		},
		filter_html : function(str) {
			return str.replace(/&(#\d{2,4};|\w{2,4};)?/g, function(match, code) {
				return code ? match : '&amp;';
			}).replace(regHtml, function(m) {
				return "&" + htmlReplaces['<>"'.indexOf(m)] + ";";
			});
		},
		filter_all : function(content, tblog) {
			content = exports.filter_lt(content);
			content = exports.filter_link(content);
			content = exports.filter_atname(content);
			tblog && (content = exports.filter_topic(content));
			content = exports.filter_emote(content);
			return content;
		},
		/**
		 * 过滤左尖括号，从而禁止html编码
		 * 
		 * @param content
		 * @returns
		 */
		filter_lt : function(content) {
			return content && content.replace(/<(\/)?(\w+)\b/ig, '&lt;$1$2');
		},
		/**
		 * 过滤表情
		 * 
		 * @param content
		 * @returns {Boolean}
		 */
		filter_emote : function(content) {
			return content && Emote.parseEmote(content);
		},
		/**
		 * 过滤超链接
		 * 
		 * @param content
		 * @returns
		 */
		filter_link : function(content) {
			if (typeof content === 'string') {
				content = content
				.replace(/\bhttp:\/\/[\-A-Z0-9+&#\/%?=~_|!:,.;]*[A-Z0-9+&#\/%=~_|]/ig, '<a href="$&" target="_blank">$&</a>');
			}
			return content;
		},
		filter_atname : function(content) {
			//filter sname
			var acc_obj
				, sname
				, snick
				, html = []

			content =  typeof content === 'string' ? content.replace(regNick, function(match, n, p) {
				if (p && !/[\u4e00-\u9fa5]/.test(n))// 邮箱
					return match;
				return [
						'<a target="_blank" href="http://i.sohu.com/nick/',
						encodeURIComponent(n),
						'" data-card="true" data-card-action="nick=' + n + '"',
						'>@',
						n,
						'</a>',
						p || '' ].join('');
			}) : content;

			content = typeof content === 'string' ? content.replace(reg_sname, function(match, json) {
				acc_obj = JSON.parse(json)
				sname = acc_obj.sname
				snick = acc_obj.snick

				if(sname == ''){
					html = ['@' + snick]
				}
				else{
					html = [
						'<a target="_blank" href="http://i.sohu.com/u/',
						encodeURIComponent(sname),
						'" data-card="true" data-card-action="sname=' + sname + '">',
						'@' + snick,
						'</a>'
					]
				}
				return html.join('')
			}) : content;
		
			return content;
		},

		filter_topic : function(content) {
			if (typeof content === 'string') {
				content = content
				.replace(/(?!=&)#([^#]+)#/g, function(word, sub) {
					return '<a href="/a/app/mblog/mytopic.htm?_input_encode=UTF-8&_output_encode=UTF-8&topic=' + encodeURIComponent(sub) + '&from=tblog" target="_blank">#' + sub + '#</a>';
				});
			}
			return content;
		}
	};
	define('core::stringUtil', exports);
});
