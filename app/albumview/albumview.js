require('core::util[fx,ajax,cookie,beLogin,transform]', 'core::util::jQuery', 'core::stringUtil',
'core::ui::dialog[success,error]', 'app::widgets::template', 'core::ui::TextBox', function(util, $, stringUtil, $dialog,
plugins, TextBox) {
	var defaults = {
		chars : 300,
		postURL : '/a/app/discuss/save.htm?_input_encode=UTF-8',
		ff : /Gecko\/\d+/.test(navigator.userAgent)
	};
	var self = null, $wnd = $(window);
	function AlbumView() {
	}
	var discussFuns = {
		activated : false,
		trim : function() {
			if (!this.activated)
				return;
			this.activated = false;
			this.blur();
			this[0].className = "";
			self.find('.discuss-count').hide();
		},
		onFocus : function() {
			this[0].className = 'focused';
			self.find('.discuss-count').show();
			this.activated = true;
		},
		onBlur : function() {
			if (!this.activated)
				return;
			if (!this.getText()) {
				this.activated = false;
				this[0].className = "";
				self.find('.discuss-count').hide();
			}
		},
		onChange : function(content) {
			var len = stringUtil.gbLength(content);
			self.discuss.css('borderColor', len > defaults.chars ? 'red' : '');
			self.find('.discuss-count').html((len > defaults.chars ? '<span>' + len + "</span>" : len) + "/" + defaults.chars);
		},
		onSend : function() {
			if (this.posting || util.beLogin(this))
				return;
			var content = this.getText(), len = stringUtil.gbLength(content);
			if (len == 0 || len > defaults.chars) {
				util.fx.highlight(self.discuss, function() {
					self.discuss.css('backgroundColor', "").focus();
					self.discuss.onChange(self.discuss.getText());
				});
				self.find('.discuss-count').html(len ? "内容过长" : "请输入内容");
			} else {
				this.posting = true;
				var curr = self.photos[self.currentIndex];
				util.ajax.postJSON(defaults.postURL, {
					content : content,
					appid : 'photo',
					itemid : curr.id,
					discusstype : self.find('.discuss-more input')[0].checked ? 1 : 0,
					type : 7,
					orixpt : self.xpt
				}, function(ret) {
					self.discuss.posting = false;
					if (ret.code == 0) {
						self.discuss.setText('').trim();
						$dialog.success('发表成功');
						curr.forwards = ret.comment.spreadcount;
						curr.comments = ret.comment.commentcount;
						self.refreshCount();
					} else if (ret.code == 4) {
						$dialog.error('请不要发表含有不适当内容的评论 。');
					} else {
						$dialog.error('保存评论失败：' + ret.msg);
					}
				});
			}
		}
	};
	util.probe({
		init : function() {
			this[0] = $(plugins.albumview())[0];
			this.length = 1;
			this.bind('click', this.mmClick);
			$wnd.bind('resize', this.mmResize);
			$(document.documentElement).bind('keyup', this.mmKeyUp).bind('keydown', this.mmKeyDown).bind(
			defaults.ff ? 'DOMMouseScroll' : 'mousewheel', this.mmWheel);
			document.body.appendChild(this[0]);
			this.mmResize();
			this.discuss = new TextBox(this.find('textarea'));
			util.probe(discussFuns, this.discuss);
		},
		readData : function() {
			// 两个接口取图片列表：根据图片id和根据相册id。
			util.ajax.postJSON(this.photoid ? '/a/album/photo/view.do' : '/a/album/photo/list.do', this.photoid ? {
				photoid : this.photoid,
				xpt : this.xpt
			} : {
				photosetid : this.albumid,
				xpt : this.xpt
			}, function(ret) {
				if (ret.code != 0) {
					self = null;
					$dialog.error(ret.msg);
					return;
				}
				self.init();
				var url = self.ulink + "album/photo/";
				var photos = self.photos = ret.data.photos;
				for ( var n = 0, L = photos.length; n < L; n++) {
					photos[n].urlShow = url + photos[n].id + "/view/";
				}
				// 显示图片
				self.showPhoto(ret.data.current_photo_index || 0);
				self.refreshCount();
			}, function() {
				$dialog.error('网络错误，请稍后再试');
				self = null;
			});
		},
		refreshCount : function() {
			var photos = this.photos, photo = photos[this.currentIndex];
			if (photo.count) {
				if (typeof photo.count === "object") {
					var fwd = photo.count.fwd, cmt = photo.count.cmt;
					this.find('.func a.cmt .func-float').css('display', cmt ? '' : 'none').html(cmt > 99 ? 99 : cmt);
					this.find('.func a.fwd .func-float').css('display', fwd ? '' : 'none').html(fwd > 99 ? 99 : fwd);
					this.find('.func a.cmt .num').html(cmt ? '(' + cmt + ')' : '');
					this.find('.func a.fwd .num').html(fwd ? '(' + fwd + ')' : '');
					this.find('.discuss-more a').css('display', cmt ? '' : 'none').find('span').html(cmt);
				}
			} else {
				var toGet = [], arr = [];
				for ( var i = (this.currentIndex / 20 << 0) * 20, end = Math.min(i + 20, photos.length); i < end; i++) {
					toGet.push(photo = photos[i]);
					photo.count = true;
					arr.push('photo_' + photo.id + '_0_' + self.xpt);
				}
				// 批量获取转发、评论数
				util.ajax.jsonp('http://cc.i.sohu.com/a/app/counts/get.htm?ids=' + arr.join(), function(ret) {
					for ( var n = 0, L = toGet.length; n < L; n++) {
						var photon = toGet[n], retn = ret[photon.id];
						photon.count = {
							fwd : retn ? retn.spreadcount > 99 ? '99+' : retn.spreadcount : 0,
							cmt : retn ? retn.commentcount > 99 ? '99+' : retn.commentcount : 0
						};
					}
					// 更新当前数量
					self.refreshCount();
				}, false, 'cb');
			}
		},
		destroy : function() {
			this.unbind('click', this.mmClick);
			this.discuss.destroy();
			$wnd.unbind('resize', this.mmResize);
			$(document.documentElement).unbind('keyup', this.mmKeyUp).unbind('keydown', this.mmKeyDown).unbind(
			defaults.ff ? 'DOMMouseScroll' : 'mousewheel', this.mmWheel);
			self = null;
			document.body.removeChild(this[0]);
		},
		mmWheel : function(e) {
			// 禁用滚轮默认事件
			if (e.target != self.discuss[0])
				e.preventDefault();
		},
		mmKeyUp : function(e) {
			if ($.find('.jquery-dialog').length)
				return;
			if (e.target === self.discuss[0]) {
				if (e.keyCode == 27)
					self.discuss.trim();
			} else if (e.keyCode === 37) {// 左箭头
				var n = self.currentIndex - 1;
				n < 0 && (n += self.photos.length);
				self.showPhoto(n);
			} else if (e.keyCode == 39 || e.keyCode == 32) {// 右箭头、空格
				self.showPhoto((self.currentIndex + 1) % self.photos.length);
			} else if (e.keyCode == 27) {// Esc
				self.destroy();
			}
		},
		mmKeyDown : function(e) {
			if (e.target.nodeName !== "TEXTAREA" && e.keyCode == 32) {
				// 防止空格键使得滚轮下滚
				e.preventDefault();
			}
		},
		mmResize : function(e) {
			var h = $wnd.height();
			self.find('.albumview-nav').css({
				'marginTop' : (h >> 1) - 148 + "px",
				'height' : (h >> 1) - (util.ie == 6 ? 48 : 34) + "px"
			});
			self.find('.albumview-body').css('height', h - 84 + "px");
			self.photos && self.resize();
		},
		mmClick : function(e) {
			var target = e.target, $target = $(target), className = target.className;
			var $clickHandler = $target.closest('.clickHandler'), action = $clickHandler.attr('action');
			if (!action) {
				if (className == "albumview-close" || target.nodeName == "DIV" && !/^(?:albumview-discuss)$/.test(className)) {
					self.destroy();
					e.preventDefault();
				}
				return;
			}
			e.stopPropagation();
			e.preventDefault();
			switch (action) {
			case 'roleft':
			case 'roright':
				self.rotate = (self.rotate + (action == "roleft" ? 3 : 1)) & 3;
				self.resize();
				break;
			case 'show':
				var n = $clickHandler.attr("data-index");
				if (n == 'next')
					n = (self.currentIndex + 1) % self.photos.length;
				else if (n == 'prev') {
					n = self.currentIndex - 1;
					n < 0 && (n += self.photos.length);
				}
				self.showPhoto(parseInt(n));
				break;
			case 'forward':
				require('plugins::hijacker::Forward', function(Forward) {
					if (util.beLogin())
						return;
					var photo = self.photos[self.currentIndex], $data = self.$data;
					var isFwd = self.$data.attr('data-from') == 'forward';
					var options = {
						usericon : util.cookie,
						appId : 'photo',
						itemid : photo.id,
						xpt : self.xpt,
						origin : {
							unick : $data.attr(isFwd ? 'data-oriunick' : 'data-unick')
						},
						data : {
							appId : 'photo',
							photo : true,
							content : photo.description,
							ulink : self.ulink,
							unick : $data.attr(isFwd ? 'data-oriunick' : 'data-unick')
						}
					};
					new Forward(options);
				});
				break;
			case 'discuss':
				self.discuss.focus();
				break;
			case 'discuss.post':
				self.discuss.onSend();
				break;
			}
			return;
		},
		resize : function() {
			var W = $wnd.width(), H = $wnd.height() - (this.noDesc ? 142 : 158), w = this.imgWidth, h = this.imgHeight;// 可展示区域宽高
			var swapped = (this.rotate & 1) == 1; // 是否交换宽高
			var zoom = Math.min(1, 868 / (swapped ? h : w), H / (swapped ? w : h));// 缩放
			if (zoom < 1) {
				w = Math.round(w * zoom);
				h = Math.round(h * zoom);
			}
			this.find('.albumview-wrapper.pic img').css(w > h ? 'width' : 'height', (w > h ? w : h) + "px");
			this.find('.albumview-wrapper.pic').css('padding',
			(h > 280 ? '0 ' : (280 - h >> 1) + "px ") + (w > 280 ? '0' : (280 - w >> 1) + "px"));
			w < 280 && (w = 280);
			h < 280 && (h = 280);
			this.find('.albumview-wrapper.pic').css(util.transform({
				rotate : this.rotate * Math.PI / 2,
				width : w,
				height : h,
				center : true,
				dx : (W - w >> 1),
				dy : (H - h >> 1) + 2
			}));
			var funtop = (H - (swapped ? w : h) >> 1) + 2;
			w > 832 && funtop < 30 && (funtop = 30);
			this.find('.albumview-wrapper.func').css({
				'left' : (W + (swapped ? h : w) >> 1) + 8 + "px",
				'top' : funtop + "px"
			});
			this.find('.albumview-wrapper.origin').css({
				'left' : (W + (swapped ? h : w) >> 1) + -16 + "px",
				'top' : (H + (swapped ? w : h) >> 1) - 74 + "px"
			});
			this.find('.albumview-wrapper.desc').css({
				'left' : (W - 950 >> 1) + "px",
				'top' : (H + (swapped ? w : h) >> 1) + 3 + "px"
			});
		},
		showPhoto : function(n) {
			var range = util.range(0, this.photos.length - 1, n, 11), a = range[0], b = range[1];
			for ( var i = a, html = []; i <= b; i++) {
				var photo = this.photos[i];
				html.push('<a href="javascript:;" class="albumview-small clickHandler" action="show" title="',
				photo.description, '" data-index="', i, '">', i == n ? '<i></i>' : '', '<img src="', photo.url150, '" /></a>');
			}
			this.find('.albumview-preview').html(html.join(''));
			this.currentIndex = n;
			this.rotate = 0;
			photo = this.photos[n];
			this.find('.albumview-wrapper.origin a')[0].href = photo.urlShow;
			this.refreshCount();
			this.find('.albumview-count span').html('第' + (n + 1) + '张( 共' + this.photos.length + '张 )');
			this.find('.albumview-wrapper.pic a').html('<img src="' + photo.url930 + '"/>')[0].href = photo.urlOld
			|| photo.url930;
			this.find('.albumview-desc span').html(stringUtil.gbCut(photo.description, 60));
			this.find('.albumview-discuss .discuss-more a')[0].href = photo.urlShow + '#comment';
			var imgSize = /^(\d+)x(\d+)$/.exec(photo.dim);
			this.imgWidth = parseInt(imgSize[1]);
			this.imgHeight = parseInt(imgSize[2]);// 图片宽高
			this.noDesc = !photo.description;
			this.resize();
			this.discuss.trim();
		}
	}, AlbumView.prototype = new $.fn.init());
	define('app::albumview', function(e) {
		if (self) {
			return;
		}
		loadResource('/app/albumview/d/albumview.css');
		self = new AlbumView();
		var $data = $(util.getParentByClassName(e.actionTarget, 'hijackdata'));
		self.$data = $data;
		self.photoid = e.actionTarget.getAttribute('data-photoid');
		if (!self.photoid) { // 没有photoid，出现在专辑转发
			self.albumid = e.actionTarget.parentNode.getAttribute('data-albumid');
		}
		self.ulink = $data.attr('data-oriulink') || $data.attr('data-ulink');
		self.xpt = $data.attr('data-orixpt') || $data.attr('data-xpt');
		self.readData();
	});
});