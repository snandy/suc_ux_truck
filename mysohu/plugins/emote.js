require('core::util::jQuery', 'core::util', function($, util) {

	var emoteReg = null;
	var Data = Emote.Data = {
		base : {
			title : '基本', // tab bar上的标题
			ubb : ':)', // tab bar显示的ubb表情
			alt : '基本表情', // tab bar上的alt
			size : '20', // tab中表情的大小
			type : 1, // 1表示旧的格式，2表示新的格式（静态，不需要预览），3表示新的（动态需要预览）
			data : [ ":)", "#_#", "8*)", ":D", ":-)", ":P", "B_)", "B_I", "^_*", ":$", ":|", ":(", ":.(", ":_(", "):(", ":V", "*_*", ":^", ":?", ":!", "=:|", ":%", ":O", ":X", "|-)", ":Z",
				":9", ":T", ":-*", "*_/", ":#|", ":69", "//shuang", "//qiang", "//ku", "//zan", "//heart", "//break", "//F", "//W", "//mail", "//strong", "//weak", "//share", "//phone",
				"//mobile", "//kiss", "//V", "//sun", "//moon", "//star", "(!)", "//TV", "//clock", "//gift", "//cash", "//coffee", "//rice", "//watermelon", "//tomato", "//pill", "//pig",
				"//football", "//shit" ]
		}
	};
	Emote.Ubbs = {
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
		"T[:.(]" : [ "weep_tab", "泪奔" ],
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
		"//shit" : [ "shit", "便便" ],
		"snt" : [ "snot", "鼻涕" ],
		"elv" : [ "elvis", "猫王" ],
		"nob" : [ "nostbleed", "鼻血" ],
		"lny" : [ "loney", "坏笑" ],
		"rdf" : [ "redflag", "红旗" ],
		"ctm" : [ "contemn", "蔑视" ],
		"plg" : [ "plunger", "搋子" ],
		"ft" : [ "faint", "晕" ],
		"epd" : [ "explode", "爆炸" ],
		"drk" : [ "drink", "饮料" ],
		"brs" : [ "brushing", "刷牙" ],
		"bra" : [ "bra", "胸罩" ],
		"spk" : [ "speaker", "喇叭" ],
		"xms" : [ "xmas", "圣诞" ],
		"bsk" : [ "basketball", "篮球" ],
		"flw" : [ "floweret", "小花" ],
		"ber" : [ "beer", "啤酒" ],
		"cak" : [ "cake", "蛋糕" ],
		"chr" : [ "cheer", "加油" ],
		"oly" : [ "olympic", "奥运" ],
		"tor" : [ "torch", "火炬" ],
		"up" : [ "up", "顶" ],
		"agi" : [ "agitation", "咱聊聊啊" ],
		"b4" : [ "b4", "鄙视" ],
		"bet" : [ "beat", "扁人" ],
		"fco" : [ "faceoff", "变脸" ],
		"glw" : [ "gallow", "我吓死你" ],
		"gdn" : [ "goodnight", "晚安" ],
		"hi" : [ "hi", "HI" ],
		"mop" : [ "mop", "鬼脸" ],
		"ok" : [ "ok", "OK" ],
		"pas" : [ "pass", "路过" ],
		"glw" : [ "gallow", "我吓死你" ],
		"sof" : [ "sofa", "沙发" ],
		"soy" : [ "soysauce", "打酱油" ],
		"stg" : [ "struggle", "努力" ],
		"thd" : [ "thunder", "被雷到了" ],
		"bj" : [ "beijing", "北京欢迎您" ],
		"cmp" : [ "champion", "冠军" ],
		"bdn" : [ "birdnest", "鸟巢" ],
		"fbi" : [ "feibi", "加油哦" ],
		"skt" : [ "skate", "滑冰" ],
		"wuy" : [ "wuying", "无影手" ],
		"olc" : [ "olymcheer", "奥运加油" ]
	};

	// 兼容老博客表情 (狐狸/卡夫)
	var emoteExtend = {
		foxUrl : 'http://js3.pp.sohu.com.cn/ppp/images/emotion/s/',
		pafuUrl : 'http://js3.pp.sohu.com.cn/ppp/images/emotion/b/',
		fox : {
			// 狐狐表情
			"[{s}//pig]" : [ "pig.gif", "猪头" ],
			"[{s}//heart]" : [ "heart.gif", "红心" ],
			"[{s}B_I]" : [ "cool.gif", "耍酷" ],
			"[{s}snt]" : [ "snot.gif", "鼻涕" ],
			"[{s}=:|]" : [ "perspire.gif", "流汗" ],
			"[{s}8*)]" : [ "titter.gif", "偷笑" ],
			"[{s}elv]" : [ "elvis.gif", "猫王" ],
			"[{s}nob]" : [ "nostbleed.gif", "鼻血" ],
			"[{s}:D]" : [ "spit.gif", "大笑" ],
			"[{s}lny]" : [ "loney.gif", "坏笑" ],
			"[{s}:_(]" : [ "cry.gif", "大哭" ],
			"[{s}rdf]" : [ "redflag.gif", "红旗" ],
			"[{s}:9]" : [ "greedy.gif", "馋" ],
			"[{s}:|]" : [ "gloomy.gif", "郁闷" ],
			"[{s}//shit]" : [ "shit.gif", "便便" ],
			"[{s}ctm]" : [ "contemn.gif", "蔑视" ],
			"[{s}plg]" : [ "plunger.gif", "搋子" ],
			"[{s}:Z]" : [ "sleep.gif", "睡觉" ],
			"[{s}:#|]" : [ "bandage.gif", "重伤" ],
			"[{s}:?]" : [ "haze.gif", "疑惑" ],
			"[{s}ft]" : [ "faint.gif", "晕" ],
			"[{s}//zan]" : [ "good.gif", "赞" ],
			"[{s}epd]" : [ "explode.gif", "爆炸" ],
			"[{s}//share]" : [ "share.gif", "握手" ],
			"[{s}:$]" : [ "complaint.gif", "委屈" ],
			"[{s}drk]" : [ "drink.gif", "饮料" ],
			"[{s}brs]" : [ "brushing.gif", "刷牙" ],
			"[{s}//rice]" : [ "dining.gif", "饭" ],
			"[{s}bra]" : [ "bra.gif", "胸罩" ],
			"[{s}spk]" : [ "speaker.gif", "喇叭" ],
			"[{s}//clock]" : [ "clock.gif", "闹钟" ],
			"[{s}xms]" : [ "xmas.gif", "圣诞" ],
			"[{s}bsk]" : [ "basketball.gif", "篮球" ],
			"[{s}flw]" : [ "floweret.gif", "小花" ],
			"[{s}ber]" : [ "beer.gif", "啤酒" ],
			"[{s}cak]" : [ "cake.gif", "蛋糕" ],
			"[{s}chr]" : [ "cheer.gif", "加油" ],
			"[{s}oly]" : [ "olympic.gif", "奥运" ],
			"[{s}tor]" : [ "torch.gif", "火炬" ],
			"[{s}up]" : [ "up.gif", "顶" ]
		},
		pafu : {
			// 柏夫表情
			"[{b}hi]" : [ "hi.gif", "HI" ],
			"[{b}ok]" : [ "ok.gif", "OK" ],
			"[{b}fco]" : [ "faceoff.gif", "变脸" ],
			"[{b}:T]" : [ "puke.gif", "吐" ],
			"[{b}:D]" : [ "spit.gif", "大笑" ],
			"[{b}):(]" : [ "detonate.gif", "发火" ],
			"[{b}:!]" : [ "surprise.gif", "吃惊" ],
			"[{b}bet]" : [ "beat.gif", "扁人" ],
			"[{b}ft]" : [ "faint.gif", "晕" ],
			"[{b}gdn]" : [ "goodnight.gif", "晚安" ],
			"[{b}#_#]" : [ "flatter.gif", "谄媚" ],
			"[{b}=:|]" : [ "perspire.gif", "流汗" ],
			"[{b}sof]" : [ "sofa.gif", "沙发" ],
			"[{b}:.(]" : [ "weep.gif", "泪奔" ],
			"[{b}nob]" : [ "nostbleed.gif", "鼻血" ],
			"[{b}glw]" : [ "gallow.gif", "我吓死你" ],
			"[{b}thd]" : [ "thunder.gif", "被雷到了" ],
			"[{b}pas]" : [ "pass.gif", "路过" ],
			"[{b}:?]" : [ "haze.gif", "疑惑" ],
			"[{b}mop]" : [ "mop.gif", "鬼脸" ],
			"[{b}b4]" : [ "b4.gif", "鄙视" ],
			"[{b}^_*]" : [ "lash.gif", "讽刺" ],
			"[{b}:(]" : [ "sorry.gif", "难过" ],
			"[{b}up]" : [ "up.gif", "顶" ],
			"[{b}agi]" : [ "agitation.gif", "咱聊聊啊" ],
			"[{b}soy]" : [ "soysauce.gif", "打酱油" ],
			"[{b}stg]" : [ "struggle.gif", "努力" ],
			"[{b}bj]" : [ "beijing.gif", "北京欢迎您" ],
			"[{b}cmp]" : [ "champion.gif", "冠军" ],
			"[{b}bdn]" : [ "birdnest.gif", "鸟巢" ],
			"[{b}fbi]" : [ "feibi.gif", "加油哦" ],
			"[{b}skt]" : [ "skate.gif", "滑冰" ],
			"[{b}wuy]" : [ "wuying.gif", "无影手" ],
			"[{b}olc]" : [ "olymcheer.gif", "奥运加油" ]
		},
		parse : function(str) {
			var reg = /(\[[^\[\]]+\])/g, arr = str.match(reg), res = '';
			if (!arr)
				return str;

			for ( var i = 0, l = arr.length; i < l; i++) {
				var mark = arr[i], data, url, imgstr = '';
				if (mark in this.fox) {
					data = this.fox[mark];
					url = this.foxUrl
				} else if (mark in this.pafu) {
					data = this.pafu[mark];
					url = this.pafuUrl;
				}
				imgstr = '<img src="' + url + data[0] + '" title="' + data[1] + '">';
				if (res) {
					res = res.replace(mark, imgstr);
				} else {
					res = str.replace(mark, imgstr);
				}
			}
			return res;
		}
	};
	/**
	 * 表情符转成图片地址
	 * 
	 * @param {Object}
	 *            ubb
	 * @param {Object}
	 *            path
	 */
	Emote._getImg = function(ubb, path) {
		var item = this.Ubbs[ubb];
		return {
			url : this.Config.imgPath + path + '/' + item[0] + '.gif',
			title : item[1]
		};
	};
	Emote.getImg = function(ubb) {
		if (!ubb || ubb.length < 3 || ubb.charAt(0) != '[' || ubb.charAt(ubb.length - 1) != ']')
			return null;
		var start = 1, end = ubb.length - 1, path = 'base';
		if (ubb.charAt(1) == '{') {
			var index = ubb.indexOf('}', 1);
			if (index < 3)
				return null;
			start = index + 1;
			path = ubb.substring(2, index);
		}
		ubb = ubb.substring(start, end);
		return this._getImg(ubb, path);
	};
	Emote.getEmoteReg = function() {
		var tab = null;
		var regBuff = [];
		regBuff.push('(');
		for (tab in Data) {
			var data = Data[tab].data;
			for ( var i = 0; i < data.length; i++) {
				var ubb = data[i];
				ubb = ubb.replace(/\)/g, '\\)').replace(/\(/g, '\\(').replace(/\^/g, '\\^').replace(/\*/g, '\\*').replace(/\$/g, '\\$').replace(/\//g, '\\/').replace(/\#/g, '\\#').replace(
				/\./g, '\\.').replace(/\|/g, '\\|').replace(/\!/g, '\\!').replace(/\?/g, '\\?');
				var str = (tab == 'base') ? '\\[' + ubb + '\\]' : '\\[\\{' + tab + '\\}' + ubb + '\\]';
				regBuff.push(str + '|');
			}
		}
		var reg = regBuff.join('');
		reg = reg.substring(0, reg.length - 1);
		reg += ')';
		reg = new RegExp(reg, "g");
		return reg;
	};
	Emote.parseBlogEmote = function(src) {
		var baseStr = src.replace(emoteReg || (emoteReg = Emote.getEmoteReg()), function(ubb) {
			var obj = Emote.getImg(ubb);
			return obj ? '<img src="' + obj.url + '" title="' + obj.title + '"/>' : ubb;
		});
		var extendStr = emoteExtend.parse(baseStr);
		return extendStr;
	};
	/**
	 * 表情图片基础路径
	 */
	Emote.Config = {
		imgPath : 'http://js3.pp.sohu.com.cn/ppp/images/emotion/'
	};
	function Emote() {
	}

	/**
	 * 显示表情框
	 * 
	 * @param {Object}
	 *            editor 要填入表情的输入框
	 * @param {Function}
	 *            fInsertFunc 插入表情后的回调函数
	 */
	Emote.prototype.init = function(target, editor, fInsertFunc, arrowLeft) {
		if (this.target) {
			target = this.target;
			target.destroy();
			this.target = null;
			return target;
		}
		editor.nodeType || (editor = editor[0]);
		if (!target) {
			target = $('<div class="emotion-list"></div>');
			document.body.appendChild(target[0]);
		}

		this.render("base", target);
		var self = this;
		var ctrl = false;
		$(mysohu.ie ? document : window).bind('keydown', mmKey).bind('keyup', mmKey);
		function mmKey(e) {
			if (e.keyCode == 17) {// ctrl
				ctrl = e.type == 'keydown';
			}
		}

		target.bind('click', clickHandler).css({
			zIndex : 1025
		}).show();
		arrowLeft !== undefined && target.find('.arrow').css('left', arrowLeft + "px").html('');
		target.destroy = function() {
			this.unbind('click', clickHandler).hide();
			$(mysohu.ie ? document : window).unbind('keydown', mmKey).unbind('keyup', mmKey);
			this.html('');
			return this;
		};
		this.target = target;
		return target;

		function clickHandler(e) {
			e.stopPropagation();
			e.preventDefault();
			var ubb, release = !ctrl;
			if (e.target.nodeType === 1 && e.target.nodeName === 'IMG' && (ubb = e.target.getAttribute('data-ubb'))) {
				var path = ubb.substr(0, ubb.indexOf('.'));
				ubb = '[' + ubb.substr(path.length + 1) + ']';
				if (fInsertFunc)
					fInsertFunc(ubb);
				else if (document.selection) {
					editor.parentNode.focus();
					editor.focus();
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
				
				// user click statistic
				if(window.mysohu && mysohu.put_log) mysohu.put_log('board_exp');
				
			} else if (release) {
				var node = e.target;
				while (node) {
					if (node === target[0]) {// inside click
						release = false;
						break;
					}
					node = node.parentNode;
				}
			}
			if (release) {
				target.destroy();
				self.target = null;
			}
		}

	};
	/**
	 * 构建表情显示框
	 */
	Emote.prototype.render = function(path, target) {
		if (!Data[path].layout) {
			var items = Data[path].data;
			var arr = [ '<div class="emotion-head"><span class="arrow"></span></div>', '<div class="emotion-body clearfix">' ];
			for ( var i = 0, L = items.length; i < L; i++) {
				var item = items[i];
				var img = Emote._getImg(item, path);
				arr.push('<a href="javascript:;"><img data-ubb="', path, '.', item, '" src="', img.url, '" alt="', img.title, '" title="', img.title, '"/></a>');
			}
			arr.push('</div>');
			Data[path].layout = arr.join('');
			arr = null;
		}
		target.html(Data[path].layout);
	};
	Emote.show = function() {
		return Emote.prototype.init.apply(Emote.instance || (Emote.instance = new Emote()), arguments);
	};
	define('plugins::emote', Emote);

	define('plugins::hijacker::emote', function(e) {
		var self = $(e.actionTarget).closest('.emote-handler'), emoteHandler = self.data('EmoteHandler');
		if (!emoteHandler)
			return;
		var ctx = emoteHandler.getEmoteContext.apply(self);
		if (ctx.target.emote) {
			ctx.target.destroy();
			ctx.target.emote = false;
			return;
		}
		emoteHandler.emote = Emote.show(ctx.target, ctx.editor, ctx.insert, ctx.arrowLeft);
		emoteHandler.onEmote && emoteHandler.onEmote.call(self, emoteHandler.emote);

	});
	window.Emote = Emote;
});
