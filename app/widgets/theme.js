/**
 * @description 主题系统相关的代码，包括更换主题、主题管理等功能
 */
require('core::util::jQuery', 'core::util[ajax,cookie,beLogin,channel]', 'app::widgets::template', 'plugins::swfupload',
function($, util, WIDGETS, SWFUpload) {
	/**
	 * @description 数据句柄
	 */
	var theme = {
		"saved" : $space_config._themeExtra ? {// TODO
			id : $space_config._theme || 'default',
			custom : Boolean($space_config._themeExtra.custom),
			url : $space_config._themeExtra.url,
			repeat : $space_config._themeExtra.repeat || 'no-repeat',
			position : $space_config._themeExtra.position || 'left'
		} : {
			id : $space_config._theme || 'default'
		},
		"current" : function() {
			return this.themes[this.weared.id];
		},
		"getTheme" : function(id) {
			return this.themes[id];
		},
		shown : false,
		themes : {},
		/**
		 * 初始化皮肤列表
		 * 
		 * @param groups
		 */
		"init" : function(groups) {
			var themes = this.themes;
			this.groups = groups;
			for ( var k in groups) {
				var group = groups[k];
				var arr = [], n = 0;
				for ( var id in group) {
					arr.push(themes[id] = group[id] = {
						id : id,
						n : n++,
						title : group[id],
						group : group
					});
				}
				group.themes = arr;
				group.width = arr.length * 160;
				group.title = k;
				if (!this.customGroup) {
					group.isCustom = true;
					this.customGroup = group;
				}
			}
		},
		/**
		 * 显示/隐藏换肤bar
		 * 
		 * @param show
		 * @returns theme
		 */
		"show" : function(show) {
			if (show === this.shown)
				return this;
			this.shown = show;
			this.$dom || this.render();
			$('.skin-dummy').css('display', show ? "block" : "none");
			var wndTop = util.wndTop();
			window.scrollTo(0, show ? wndTop + 175 : wndTop > 175 ? wndTop - 175 : 0);
			document.body.style.backgroundPosition = this.weared.custom ? this.weared.position + (show ? " 205px" : "  30px")
			: "";
			if (show) {
				this.$dom.show();
				$('#skin_sprite').hide();
				this.$dom.animate({
					opacity : 1,
					marginTop : 0
				}, 300, 'swing', function() {
					util.ie && (this.style.filter = "");
				});
			} else {
				this.$dom.animate({
					opacity : 0,
					marginTop : -80
				}, 500, 'swing', function() {
					$('#skin_sprite').show();
					this.style.display = "none";
				});
			}
			return this;
		},
		/**
		 * 绘制换肤bar
		 */
		"render" : function() {
			var arr = [];
			for ( var k in this.groups) {
				arr.push(this.groups[k]);
			}
			var $dom = this.$dom = $(WIDGETS.theme(arr));
			$dom.appendTo(document.body);
			$dom.$prev = $dom.find('a.prev');
			$dom.$next = $dom.find('a.next');
			$dom.icons = $dom.find('.icons')[0];
			$dom.click(this.mmClick);
			this.render = null;
		},
		"isModified" : function() {
			var keys = [ 'id', 'custom', 'url', 'position', 'repeat' ];
			for ( var k in this.saved) {
				if (this.saved[k] != this.weared[k])
					return true;
			}
			return false;
		},
		"mmClick" : function(e) {
			var self = theme, current = e.target, action = null, parent = self.$dom[0];
			while (!(action = current.getAttribute("action"))) {
				if (current === parent)
					return;
				current = current.parentNode;
			}
			var preventDefault = true;
			switch (action) {
			case "save":
				self.show(false);
				if (self.isModified()) {
					self.save();
				}
				break;
			case "cancel":
				self.show(false);
				if (self.isModified()) {
					self.wear();
				}
				break;
			case "show-group":
				var title = current.getAttribute("title"), group = self.groups[title], current = self.current();
				if (group != self.currentGroup) {
					self.drawGroup(group);
					if (current.group == group)
						self.setCurrent(current.id).scrollTo(
						group.isCustom ? 0 : util.range(0, group.themes.length - 1, current.n, 6)[0]);
					else
						self.scrollTo(0);
				}
				break;
			case "wear-skin":
				var id = current.getAttribute("theme");
				self.setCurrent(id);
				self.wear({
					custom : false,
					id : id
				});
				break;
			case "next":
				self.scrollTo(Math.min(self.scroll + 6, self.currentGroup.themes.length - 6), true);
				break;
			case "prev":
				self.scrollTo(Math.max(self.scroll - 6, 0), true);
				break;
			case "reset-bg":
				self.wear({
					custom : current.children[0].checked
				});
				preventDefault = false;
				break;
			case "custom-color":
				var id = current.getAttribute("data-color");
				if (id != self.weared.id) {
					self.$dom.find('.color-list .active').removeClass("active");
					current.className = "active";
					self.wear({
						id : id
					});
				}
				break;
			}
			preventDefault && e.preventDefault();
		},
		/**
		 * 将主题列表焦点到指定的主题
		 * 
		 * @param param
		 *            主题信息
		 */
		"focus" : function(param) {
			if (param.custom) {
				this.drawGroup(this.customGroup).scrollTo(0);
			} else {
				var t = this.themes[param.id];
				this.drawGroup(t.group).setCurrent(param.id).scrollTo(util.range(0, t.group.themes.length - 1, t.n, 6)[0]);
			}
		},
		/**
		 * 绘制指定分组的皮肤列表
		 * 
		 * @param group
		 *            分组
		 * @returns theme
		 */
		"drawGroup" : function(group) {
			if (group == this.currentGroup) {
				if (group.isCustom) {
					this.toggleBg(Boolean(this.weared.url), this.weared);
				}
				return this;
			}
			this.$dom.find('.groups span.focused').removeClass("focused");
			this.$dom.find('.groups span[title="' + group.title + '"]').addClass("focused");
			if (group.isCustom) {
				var bg = this.weared.url, idx = bg && bg.lastIndexOf('.');
				bg = bg ? 'url(' + bg.substr(0, idx) + '_s' + bg.substr(idx) + ')' : 'none';
				this.$dom.find('.icons').html(WIDGETS.theme_custom({
					weared : this.weared,
					bg_sm : bg,
					colors : group.themes
				}));
				if (this.current().group !== group) {
					this.wear({
						id : group.themes[0].id
					});
				}
				this.$dom.find('.color-list a')[this.current().n].className = "active";
				var self = this;
				require("core::ui::Select", function(Select) {
					self.selPos = new Select(self.$dom.find('#i_select_Position'), {
						left : "左对齐",
						center : "居中",
						right : "右对齐"
					}, self.weared.position).bind(Select.CHANGE, function(e, pos) {
						self.wear({
							position : pos
						});
					});
					self.selRep = new Select(self.$dom.find('#i_select_Repeat'), {
						'no-repeat' : "不平铺",
						'repeat-x' : "横向平铺",
						'repeat-y' : "纵向平铺",
						'repeat' : "平铺"
					}, self.weared.repeat).bind(Select.CHANGE, function(e, rep) {
						self.wear({
							repeat : rep
						});
					});
				});
				this.initUpload();
			} else {
				if (this.swfu) {
					this.swfu.destroy();
					this.selPos.destroy();
					this.selRep.destroy();
					this.swfu = this.selPos = this.selRep = undefined;
				}
				this.$dom.find('.icons').html(WIDGETS.theme_list(group));
			}
			this.currentGroup = group;
			return this;
		},
		/**
		 * 设置当前主题
		 * 
		 * @param id
		 * @returns theme
		 */
		"setCurrent" : function(id) {
			var $old = this.$dom.find('.icons .skin.current'), $new = this.$dom.find('.icons .skin[theme="' + id + '"]');
			if ($old[0] != $new[0]) {
				$old.removeClass("current");
				$new.addClass("current");
			}
			return this;
		},
		/**
		 * 将主题列表滚动到指定偏移位置
		 * 
		 * @param scroll
		 * @param fx
		 *            是否动画
		 * @returns this
		 */
		"scrollTo" : function(scroll, fx) {
			var count = this.currentGroup.themes.length;
			if (!fx) {
				this.$dom.$prev.css('display', scroll === 0 ? "none" : "");
				this.$dom.$next.css('display', scroll >= count - 6 ? "none" : "");
				this.scroll = scroll;
				this.$dom.icons.scrollLeft = scroll * 160;
			} else {
				this.$dom.$prev[scroll === 0 ? "hide" : "show"]();
				this.$dom.$next[scroll >= count - 6 ? "hide" : "show"]();
				util.fx({
					src : this.scroll * 160,
					dst : scroll * 160,
					self : this.$dom.icons,
					speed : util.ie ? "fastest" : "fast",
					type : "log",
					steps : 32,
					round : true,
					callback : function(n) {
						this.scrollLeft = n;
					}
				});
				this.scroll = scroll;
			}
			return this;
		},
		/**
		 * 设置当前页面主题
		 * 
		 * @param param
		 */
		"wear" : function(param) {
			param || (param = this.saved);
			for ( var k in param) {
				this.weared[k] = param[k];
			}
			var isCustom = this.weared.custom;
			$(document.body).css({
				backgroundRepeat : isCustom ? this.weared.repeat : '',
				backgroundPosition : this.shown ? (isCustom ? this.weared.position || 'left' : "center") + " 205px" : "",
				backgroundImage : isCustom ? this.weared.url ? "url('" + this.weared.url + "')" : 'none' : ''
			});
			var target = '/themes/' + this.weared.id + '/style.css';
			var link = document.getElementById('theme_style');
			if (link) {
				var url = load.repos.s3.getURL([ target ]);
				(link.href != url) && (link.href = url);
			} else {
				loadResource({
					id : "theme_style"
				}, target);
			}
			document.body.className = this.weared.id;
		},
		"error" : function(msg) {
			require('core::ui::dialog::error', function($error) {
				$error(msg || '让服务器再飞一会儿，请稍后再试。', 1800);
			});
		},
		/**
		 * 保存主题
		 * 
		 * @param param
		 */
		"save" : function(param) {
			param || (param = this.weared);
			for ( var k in param) {
				this.saved[k] = param[k];
			}
			util.ajax.getJSON('/a/setting/theme/set?' + util.toQueryString({
				custom : this.saved.custom,
				theme : this.saved.id,
				position : {
					'left' : 1,
					'center' : 2,
					'right' : 3
				}[this.saved.position] || 1,
				repeat : {
					'no-repeat' : 1,
					'repeat-x' : 2,
					'repeat-y' : 3,
					'repeat' : 4
				}[this.saved.repeat] || 1,
				url : this.saved.url
			}), function(ret) {
				if (ret.code != 0) {
					theme.error("保存主题失败");
				} else {
					util.channel.broadcast('theme', 'wear', param);
				}
			});
		},
		"initUpload" : function() {// TODO:SWFUpload
			var self = this;
			require("plugins::swfupload", function(SWFUpload) {
				self.swfu && self.swfu.destroy();
				self.swfu = new SWFUpload({
					// Backend Settings
					upload_url : "http://upload.pp.sohu.com/suc/backgroundUpload.do",
					// File Upload Settings
					file_size_limit : "3 MB",
					file_types : "*.jpg;*.jpeg;*.gif;*.png",
					file_types_description : "图片文件",
					file_upload_limit : "0",
					file_queue_error_handler : function(file, errorCode, message) {
						switch (errorCode) {
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							self.error('图片文件太小，请检查图片属性。');
							break;
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							self.error('图片过大，请选择小于3MB的图片。');
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							self.error('该文件不是支持的格式，请检查。');
							break;
						default:
							self.error();
							break;
						}
					},
					file_dialog_complete_handler : function(numFilesSelected, numFilesQueued) {
						if (numFilesQueued > 0) {
							selected = true;
							ready();
						}
					},
					upload_start_handler : function() {
						theme.showUploading(true);
					},
					upload_progress_handler : function(file, progress, total) {
						theme.showUploading(progress / total);
					},
					upload_error_handler : function(file, errorCode, message) {
						theme.error();
						theme.showUploading(false);
					},
					upload_success_handler : function(file, serverData) {
						theme.showUploading(false);
						theme.setUploaded(JSON.parse(serverData));
					},
					// Button Settings
					button_placeholder_id : 'theme_bg-upload',
					button_image_url : 'http://js6.pp.sohu.com.cn/i/default/my/img/nil.gif',
					button_width : 120,
					button_height : 90,
					button_window_mode : SWFUpload.WINDOW_MODE.TRANSPARENT,
					button_cursor : SWFUpload.CURSOR.HAND,
					button_action : SWFUpload.BUTTON_ACTION.SELECT_FILE,
					// Flash Settings
					flash_url : "http://i.sohu.com/asset/swfupload.swf",
					// Debug Settings
					debug : false
				});
			});
			var token, selected;
			util.ajax.getJSON('/api/gettoken.jsp?ot=json', function(json) {
				if (json.status == 0) {
					token = json.data[0].enToken;
					ready();
				} else {
					self.error();
				}
			});
			function ready() {
				if (token && selected) {
					self.swfu.setPostParams({
						"token" : token,
						"watermark" : ''
					});
					self.swfu.startUpload();
				}
			}
		},
		"showUploading" : function(val) {
			if (val === true) {
				this.toggleBg(false);
				this.$dom.find('.bg_setting').addClass("uploading");
			} else if (val === false) {
				this.$dom.find('.bg_setting').removeClass("uploading");
			} else if (typeof val == "number" && val < 1) {
				val = val * 5 << 0;
				this.$dom.find('.progress').css('backgroundPosition', val * 12 - 60 + "px -126px");
			}
		},
		setUploaded : function(ret) {
			// console.log(ret);
			if (ret.code != 0) {
				this.error();
				return;
			}
			theme.wear({
				custom : true,
				url : ret.data.image[0]
			});
			theme.toggleBg(true, theme.weared);
		},
		"toggleBg" : function(bg, param) {
			if (bg) {
				this.$dom.find('.bg_setting').removeClass("no-bg");
				var bg = param.url, idx = bg && bg.lastIndexOf('.');
				bg = bg ? 'url(' + bg.substr(0, idx) + '_s' + bg.substr(idx) + ')' : 'none';
				this.$dom.find('.icons .bg-upload').css('background', bg + " center center");
				this.selPos && this.selPos.setValue(param.position);
				this.selRep && this.selRep.setValue(param.repeat);
				this.$dom.find('.color-list .active').removeClass("active");
				if (/^color\d+$/.test(param.id))
					this.$dom.find('.color-list a[data-color="' + param.id + '"]').addClass("active");
				this.$dom.find('input')[0].checked = param.custom;
			} else {
				this.$dom.find('.bg_setting').addClass("no-bg");
				this.$dom.find('.icons .bg-upload').css('background', '');
			}
		}
	};
	theme.weared = util.probe(theme.saved);
	util.channel.listenOther('theme', 'wear', function(e) {
		if (util.cookie.isMine) {
			theme.wear(e.data);
		}
	});
	theme.init({
		"自定义模板" : {
			color01 : "浅灰",
			color02 : "淡蓝",
			color03 : "浅绿",
			color04 : "紫",
			color05 : "粉红",
			color06 : "黑"
		},
		"经典版" : {
			"default" : "经典版",
			t01001 : "粉红爱情",
			t01002 : "秋风摆柳",
			t01003 : "蓝色韵律",
			t01004 : "绿色生命",
			t01005 : "飘飞思绪",
			t01006 : "绯色花飘"
		},
		"艺术版" : {
			t02001 : "金色梦幻",
			t02002 : "抽象艺术",
			t02003 : "蓝天彩虹",
			t02004 : "怀旧纪念",
			t02005 : "现代水彩",
			t02006 : "情侣金鱼",
			t09001 : "霓虹闪烁"
		},
		"场景版" : {
			t03008 : " 禅之海",
			t03007 : "阿凡达",
			t03001 : "云中城堡",
			t03002 : "海洋畅想",
			t03004 : "沙滩漫步",
			t03005 : "七彩热气球",
			t03006 : "夏日律动",
			t03003 : "午后咖啡",
			t03009 : "气壮山河",
			t03010 : "丰收盛宴",
			t03011 : "原野之花",
			t03012 : "蓝海银帆"
		},
		"水墨版" : {
			t04001 : "南山寒钓",
			t04002 : "江上渔家",
			t04003 : "阡陌山村"
		},
		"节日版" : {
			t05001 : "中秋月圆",
			t05002 : "欢乐万圣",
			t05003 : "圣诞花絮"
		},
		"可爱版" : {
			t06001 : "飞天小猪",
			t06002 : "蓝天小兔",
			t06003 : "沙滩海星",
			t06004 : "两小无猜",
			t06005 : "圣诞雪人",
			t06006 : "夏日雪糕",
			t06007 : "七彩世界",
			t06008 : "飞翔的信",
			t06009 : "卡通世界",
			t06010 : "动物聚会"
		},
		"心情版" : {
			t07001 : "秋之境",
			t07002 : "梦境之花",
			t07003 : "艳阳风铃",
			t07004 : "草莓餐桌",
			t07005 : "时尚女郎",
			t07006 : "趴窗狗狗",
			t07007 : "雨中女孩",
			t07008 : "悠长回忆",
			t07009 : "孤独话亭"
		},
		"桌面版" : {
			t08001 : "魔兽猎影",
			t08002 : "冰封武士",
			t09002 : "暗影星际"
		},
		"中国好声音" : {
			t10001 : "中国好声音"
		}
	});
	define("app::widgets::theme", theme);
});
/**
 * @description 皮肤上下文初始化相关代码
 */
require('core::util::jQuery', 'core::util[fx,cookie]', 'app::widgets::theme', 'core::ui::dialog::confirm', '#document',
function($, util, theme, $confirm, document) {
	var $btn = $('<div id="skin_sprite" data-logid="top_skin"></div>');
	document.body.appendChild($btn[0]);
	$btn.bind('mouseover', onSprite).bind('mouseout', onSprite).click(function() {
		// sprite on click
		activate(theme.weared);
	});
	if (!util.cookie.isMine) {
		if (util.ie === 6)
			$btn.css("filter",
			"progid:DXImageTransform.Microsoft.AlphaImageLoader(src='http://s3.suc.itc.cn/themes/d/sprite4.png')");
		else
			$btn.css("backgroundPosition", "0 -64px");
	}
	define("plugins::hijacker::theme.wear", function(e) {
		var target = e.actionTarget;
		var param = {
			id : target.getAttribute("data-themeid"),
			custom : target.getAttribute("data-custom") == "true"
		};
		if (param.custom) {
			param.position = target.getAttribute("data-position");
			param.repeat = target.getAttribute("data-repeat");
			param.url = target.getAttribute("data-url");
		}
		theme.wear(param);
		activate(param);
	});
	document.body.insertBefore($('<div class="skin-dummy"></div>')[0], document.body.firstChild);
	function activate(param) {
		if (util.beLogin()) {
			return;
		}
		if (util.cookie.isMine) {
			theme.show(true).focus(param);
		} else {
			var hint = param.custom || /^color/.test(param.id) ? _sucNick + '”的自定义主题(' + theme.getTheme(param.id).title + '色)'
			: theme.themes[param.id].title + '”';
			$confirm({
				content : "使用“" + hint + "作为您的主题吗？",
				onConfirm : function() {
					theme.save(param);
				},
				onCancel : function() {
					if (theme.isModified()) {
						theme.wear(theme.saved);
					}
				}
			});
		}
	}
	function onSprite(evt) {
		var inc = (evt.type === "mouseover");
		$btn[0].title = util.cookie.isMine ? '更换主题' : theme.weared.custom || /^color/.test(theme.weared.id) ? "使用" + _sucNick
		+ "的自定义主题(" + theme.current().title + "色)" : '使用主题“' + theme.current().title + "”";
		util.fx({
			steps : 3,
			src : inc ? 0 : 3,
			dst : inc ? 3 : 0,
			callback : util.ie === 6 ? (function(z) {
				util.cookie.isMine || (z += 4);
				$btn.css("filter",
				"progid:DXImageTransform.Microsoft.AlphaImageLoader(src='http://s3.suc.itc.cn/themes/d/sprite" + z + ".png')");
			}) : (function(z) {
				$btn.css("backgroundPosition", (z * -56) + "px " + (util.cookie.isMine ? "0" : "-64px"));
			})
		});
	}
});
