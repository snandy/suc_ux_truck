require(
'core::util',
function(util) {
	var window = function() {
		return this;
	}(), document = window.document;
	/**
	 * @class Emote
	 * @description 表情基础类，包含表情的各种信息，以及序列化代码
	 */
	/**
	 * @class EmoteGroup
	 * @description 表情组，用于组织表情的分类
	 * @param options
	 *            可选项，用于定制表情组
	 * @param emotes
	 *            该组的表情列表，一个对象，每个键对应一个表情，其值会被传送到getEmote方法。
	 */
	function EmoteGroup(options, emotes) {
		this.emotes = emotes;
		for ( var k in options)
			this[k] = options[k];
		this.initEmoteReg();
		this.initEmotes();
	}
	EmoteGroup.prototype = {
		/**
		 * @field name
		 * @description 分组名
		 */
		name : 'name',
		/**
		 * @field title
		 * @description 分组标题，用于显示在分组标签上的文字
		 */
		title : 'title',
		/**
		 * @field icon
		 * @description 分组图标，用于显示在分组标签上的表情
		 */
		icon : '',
		/**
		 * @field baseURI
		 * @description 表情URL地址前缀，在不同的分组中指定以区分
		 */
		baseURI : '',
		prefix : '[',
		suffix : ']',
		/**
		 * @field regExp
		 * @description 表情组的正则表达式，在初始化时创建，用于对表情进行选取
		 */
		regExp : null,
		/**
		 * @function initEmoteReg
		 * @description 初始化regExp，需要时进行覆盖
		 */
		initEmoteReg : function() {
			var reg = /([\^\$\(\)\[\{\\\|\.\*\+\?\<\>])/g, repl = '\\$1';
			var buf = [];
			for ( var e in this.emotes) {
				buf.push(e.replace(reg, repl));
			}
			this.regExp = new RegExp(this.prefix.replace(reg, repl) + '(' + buf.join('|') + ')'
			+ this.suffix.replace(reg, repl), 'g');
		},
		/**
		 * @function initEmotes
		 * @description 对表情进行初始化，如序列化等操作。
		 */
		initEmotes : function() {
			for ( var k in this.emotes) {
				var v = this.emotes[k];
				this.emotes[k] = '<img class="emote-' + this.name + '" data-ubb="' + this.name + '.' + k + '" src="'
				+ this.baseURI + v[0] + '.gif"  title="' + v[1] + '"/>';
			}
		}
	};
	var emoteGroups = {
		'base' : new EmoteGroup({
			name : 'base',
			title : '基本',
			baseURI : 'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/'
		}, {
			":)" : [ "smile", "微笑" ],
			"#_#" : [ "flatter", "谄媚" ],
			"8*)" : [ "titter", "偷笑" ],
			":D" : [ "spit", "大笑" ],
			":-)" : [ "shame", "害羞" ],
			":P" : [ "naughty", "调皮" ],
			"B_)" : [ "complacent", "得意" ],
			"B_I" : [ "cool", "耍酷" ],
			"^_*" : [ "lash", "讽刺" ],
			":$" : [ "complaint", "委屈" ],
			":|" : [ "gloomy", "郁闷" ],
			":(" : [ "sorry", "难过" ],
			":.(" : [ "weep", "泪奔" ],
			":_(" : [ "cry", "大哭" ],
			"):(" : [ "detonate", "发火" ],
			":V" : [ "curse", "咒骂" ],
			"*_*" : [ "muzzy", "发呆" ],
			":^" : [ "misunderstand", "不懂" ],
			":?" : [ "haze", "疑惑" ],
			":!" : [ "surprise", "吃惊" ],
			"=:|" : [ "perspire", "流汗" ],
			":%" : [ "embarrassed", "尴尬" ],
			":O" : [ "fright", "惊恐" ],
			":X" : [ "stopper", "闭嘴" ],
			"|-)" : [ "yawn", "犯困" ],
			":Z" : [ "sleep", "睡觉" ],
			":9" : [ "greedy", "馋" ],
			":T" : [ "puke", "吐" ],
			":-*" : [ "whisper", "耳语" ],
			"*_/" : [ "pirate", "海盗" ],
			":#|" : [ "bandage", "重伤" ],
			":69" : [ "hug", "拥抱" ],
			"//shuang" : [ "comfortably", "爽" ],
			"//qiang" : [ "strong", "强" ],
			"//ku" : [ "cool2", "酷" ],
			"//zan" : [ "good", "赞" ],
			"//heart" : [ "heart", "红心" ],
			"//break" : [ "hearted", "心碎" ],
			"//F" : [ "blow", "花开" ],
			"//W" : [ "fade", "花谢" ],
			"//mail" : [ "mail", "邮件" ],
			"//strong" : [ "fine", "手势-棒" ],
			"//weak" : [ "bad", "手势-逊" ],
			"//share" : [ "share", "握手" ],
			"//phone" : [ "phone", "电话" ],
			"//mobile" : [ "mobile", "手机" ],
			"//kiss" : [ "lip", "嘴唇" ],
			"//V" : [ "victory", "V" ],
			"//sun" : [ "sun", "太阳" ],
			"//moon" : [ "moon", "月亮" ],
			"//star" : [ "star", "星星" ],
			"(!)" : [ "bulb", "灯泡" ],
			"//TV" : [ "tv", "电视" ],
			"//clock" : [ "clock", "闹钟" ],
			"//gift" : [ "gift", "礼物" ],
			"//cash" : [ "cash", "现金" ],
			"//coffee" : [ "coffee", "咖啡" ],
			"//rice" : [ "dining", "饭" ],
			"//watermelon" : [ "watermelon", "西瓜" ],
			"//tomato" : [ "tomato", "番茄" ],
			"//pill" : [ "pill", "药丸" ],
			"//pig" : [ "pig", "猪头" ],
			"//football" : [ "football", "足球" ],
			"//shit" : [ "shit", "便便" ]
		}),
		'fox' : new EmoteGroup({
			name : 'fox',
			title : '狐狸',
			baseURI : 'http://js3.pp.sohu.com.cn/ppp/images/emotion/s/',
			prefix : '[{s}'
		}, {
			"//pig" : [ "pig", "猪头" ],
			"//heart" : [ "heart", "红心" ],
			"B_I" : [ "cool", "耍酷" ],
			"snt" : [ "snot", "鼻涕" ],
			"=:|" : [ "perspire", "流汗" ],
			"8*)" : [ "titter", "偷笑" ],
			"elv" : [ "elvis", "猫王" ],
			"nob" : [ "nostbleed", "鼻血" ],
			":D" : [ "spit", "大笑" ],
			"lny" : [ "loney", "坏笑" ],
			":_(" : [ "cry", "大哭" ],
			"rdf" : [ "redflag", "红旗" ],
			":9" : [ "greedy", "馋" ],
			":|" : [ "gloomy", "郁闷" ],
			"//shit" : [ "shit", "便便" ],
			"ctm" : [ "contemn", "蔑视" ],
			"plg" : [ "plunger", "搋子" ],
			":Z" : [ "sleep", "睡觉" ],
			":#|" : [ "bandage", "重伤" ],
			":?" : [ "haze", "疑惑" ],
			"ft" : [ "faint", "晕" ],
			"//zan" : [ "good", "赞" ],
			"epd" : [ "explode", "爆炸" ],
			"//share" : [ "share", "握手" ],
			":$" : [ "complaint", "委屈" ],
			"drk" : [ "drink", "饮料" ],
			"brs" : [ "brushing", "刷牙" ],
			"//rice" : [ "dining", "饭" ],
			"bra" : [ "bra", "胸罩" ],
			"spk" : [ "speaker", "喇叭" ],
			"//clock" : [ "clock", "闹钟" ],
			"xms" : [ "xmas", "圣诞" ],
			"bsk" : [ "basketball", "篮球" ],
			"flw" : [ "floweret", "小花" ],
			"ber" : [ "beer", "啤酒" ],
			"cak" : [ "cake", "蛋糕" ],
			"chr" : [ "cheer", "加油" ],
			"oly" : [ "olympic", "奥运" ],
			"tor" : [ "torch", "火炬" ],
			"up" : [ "up", "顶" ]
		}),
		pafu : new EmoteGroup({
			name : 'pafu',
			baseURI : 'http://js3.pp.sohu.com.cn/ppp/images/emotion/b/',
			prefix : '[{b}'
		}, {
			"hi" : [ "hi", "HI" ],
			"ok" : [ "ok", "OK" ],
			"fco" : [ "faceoff", "变脸" ],
			":T" : [ "puke", "吐" ],
			":D" : [ "spit", "大笑" ],
			"):(" : [ "detonate", "发火" ],
			":!" : [ "surprise", "吃惊" ],
			"bet" : [ "beat", "扁人" ],
			"ft" : [ "faint", "晕" ],
			"gdn" : [ "goodnight", "晚安" ],
			"#_#" : [ "flatter", "谄媚" ],
			"=:|" : [ "perspire", "流汗" ],
			"sof" : [ "sofa", "沙发" ],
			":.(" : [ "weep", "泪奔" ],
			"nob" : [ "nostbleed", "鼻血" ],
			"glw" : [ "gallow", "我吓死你" ],
			"thd" : [ "thunder", "被雷到了" ],
			"pas" : [ "pass", "路过" ],
			":?" : [ "haze", "疑惑" ],
			"mop" : [ "mop", "鬼脸" ],
			"b4" : [ "b4", "鄙视" ],
			"^_*" : [ "lash", "讽刺" ],
			":(" : [ "sorry", "难过" ],
			"up" : [ "up", "顶" ],
			"agi" : [ "agitation", "咱聊聊啊" ],
			"soy" : [ "soysauce", "打酱油" ],
			"stg" : [ "struggle", "努力" ],
			"bj" : [ "beijing", "北京欢迎您" ],
			"cmp" : [ "champion", "冠军" ],
			"bdn" : [ "birdnest", "鸟巢" ],
			"fbi" : [ "feibi", "加油哦" ],
			"skt" : [ "skate", "滑冰" ],
			"wuy" : [ "wuying", "无影手" ],
			"olc" : [ "olymcheer", "奥运加油" ]
		})
	};
	load('/app/emote/d/emote.css');
	var default_target = null;
	var emote = {
		Data : emoteGroups,
		show : function(target, editor, fInsertFunc, arrowLeft) {
			if (!target) {
				if (!default_target) {
					default_target = $('<div class="emotion-list"></div>');
					document.body.appendChild(default_target[0]);
				}
				target = default_target;
			}
			if (target[0].wrapped) {
				target = target[0].wrapped;
				return target.destroy ? target.destroy() : target.show();
			} else {
				target[0].wrapped = target;
			}
			var self = this;
			editor.nodeType || (editor = editor[0]);
			if (!target) {
				target = $('<div class="emotion-list"></div>');
				document.body.appendChild(target[0]);
			}
			this.render("base", target);
			var ctrl = false;
			$(util.ie ? document : window).bind('keydown', mmKey).bind('keyup', mmKey);
			function mmKey(e) {
				if (e.keyCode == 17) {// ctrl
					ctrl = e.type == 'keydown';
				}
			}
			target.css({
				zIndex : 1025
			}).show();
			arrowLeft !== undefined && target.find('.arrow').css('left', arrowLeft + "px").html('');
			$(document).bind('click', clickHandler);
			target.destroy = function() {
				$(document).unbind('click', clickHandler);
				$(util.ie ? document : window).unbind('keydown', mmKey).unbind('keyup', mmKey);
				this.html('').hide();
				this.destroy = null;
				this[0].wrapped = null;
				// console.log('destroy');
				return this;
			};
			// console.log('init');
			return target;
			function clickHandler(e) {// click event
				e.preventDefault();
				var ubb, img = e.target;
				if (img.nodeName === "A" && img.children.length === 1 && img.firstChild.nodeName === "IMG")
					img = img.firstChild;
				if (img.nodeName === 'IMG' && (ubb = img.getAttribute('data-ubb'))) {
					// click on emote img
					var path = ubb.substr(0, ubb.indexOf('.'));
					ubb = '[' + ubb.substr(path.length + 1) + ']';
					if (fInsertFunc)
						fInsertFunc(ubb);
					else if (document.selection) {
						editor.parentNode.focus();
						editor.focus();
						$(editor).trigger("focus");
						setTimeout(function() {
							var sel = document.selection.createRange();
							sel.text = ubb;
						}, 1);
					} else if (editor.selectionStart || editor.selectionStart == "0") {
						editor.focus();
						var startPos = editor.selectionStart, endPos = editor.selectionEnd, scrollTop = editor.scrollTop, oldVal = editor.value;
						editor.value = oldVal.substring(0, startPos) + ubb + oldVal.substring(endPos, oldVal.length);
						editor.selectionStart = editor.selectionEnd = startPos + ubb.length;
					} else {
						editor.focus();
						editor.value += ubb;
					}
					editor.wrapped && editor.wrapped.onChange && editor.wrapped.onChange(editor.value);
					if (!ctrl)
						target.destroy();
					// user click statistic
					if (window.mysohu && mysohu.put_log)
						mysohu.put_log('board_exp');
				} else {
					var node = e.target;
					for ( var node = e.target; node; node = node.parentNode) {
						if (node == target[0])
							return;
					}
					target.destroy();
				}
			}
		},
		render : function(gid, target) {
			var group = emoteGroups[gid];
			if (!group.layout) {
				var arr = [];
				for ( var k in group.emotes) {
					arr.push('<a href="javascript:;">', group.emotes[k], '</a>');
				}
				group.layout = arr.join('');
			}
			target.html('<div class="emotion-head"><span class="arrow"></span></div><div class="emotion-body clearfix">'
			+ group.layout + '</div>');
		},
		parseEmote : function(input) {
			for ( var gid in emoteGroups) {
				var group = emoteGroups[gid];
				input = input.replace(group.regExp, function(match, ubb) {
					return group.emotes[ubb] || match;
				});
			}
			return input;
		},
		parseBlogEmote : function(input) {
			return this.parseEmote(input);
		}
	};
	/**
	 * 构建表情显示框
	 */
	define('app::emote', emote);
	define('plugins::hijacker::emote', function(e) {
		var self = $(e.actionTarget).closest('.emote-handler'), emoteHandler = self.data('EmoteHandler');
		if (!emoteHandler)
			return;
		e.stopPropagation();
		var ctx = emoteHandler.getEmoteContext.apply(self);
		var ret = emote.show(ctx.target, ctx.editor, ctx.insert, ctx.arrowLeft);
		ret && emoteHandler.onEmote && emoteHandler.onEmote.call(self, ret);
	});
});