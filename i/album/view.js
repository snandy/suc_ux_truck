/*
 *	图片最终页
 *  code by bobotieyang@sohu-inc.com
 */
;
(function(window, location, $, ms) {
	var $wnd = $(window), xpt = window._xpt || window.$space_config && $space_config._xpt || '';
	var attrName = "data-photoslider-index";
	var TEXT = {
		add : '点击添加描述',
		mod : '点击修改描述'
	};
	var defaults = {
		data : {},
		range : 4, // 前后显示的范围
		frameRate : 24, // 每秒移动的帧数
		speed : 13, // 每帧移动的像素数
		itemWidth : 88, // 每个li的宽度
		onChange : null
	// 当切换图片时调用
	};
	var isLatest = /\/latest\//.test(location.href);
	function PhotoSlider(options) {
		this.options = $.extend(defaults, options);
		this.data = this.options.data;
		this.cIndex = parseInt(this.data.current_absolute_photo_index);
		this.len = this.data.total;
		this.sliding = false; // 当前是否在播放动画
		Array.prototype.push.apply(this.photos = new Array(
		this.data.current_absolute_photo_index - this.data.current_relative_photo_index), this.data.list_photo);
		this.init();
	}
	PhotoSlider.prototype = {
		init : function() {
			if (!isLatest) {
				var id = this.getHash(), reg = /photo\/(\d+)\/view/, m = location.href.match(reg);
				if (id && m && id !== m[1]) {
					ms.setLocation(location.href.replace(reg, 'photo/' + id + '/view'));
					return;
				}
			}
			var self = this;
			this.photoTool = $('.photo-tools');
			this.$list = $('.list-pic');
			this.$ul = this.$list.find('.cont ul');
			this.$bigDiv = $('.big-pic');
			this.$big = $('#big-pic');
			this.$pContent = $('.photo-content');
			this.$desc = this.$pContent.find('p span');
			this.$input = this.$pContent.find('p input');
			this.$count = $('span.numlook');
			this.$index = $('.photo-title-box .photo-name strong');
			this.$list.find('.pre .img-wrap').html('<a href="' + this.data.prev_photoset.url + '">' + this
			.fillIcon(this.data.prev_photoset.cover) + '</a>');
			this.$list.find('.next .img-wrap').html('<a href="' + this.data.next_photoset.url + '">' + this
			.fillIcon(this.data.next_photoset.cover) + '</a>');
			this.setOrigin(this.photos[this.cIndex]);
			// 设置初始图片
			var replayIndex = this.cIndex;
			if (replayIndex == this.len - 1) {
				replayIndex = 0;
			}
			// 下张图集
			var tmpHtml = '<div id="endSelClose"></div><div class="bg"></div><div class="E_Cont"></div>';
			this.$nextPhotoset = $('<div id="endSelect"></div>').html(tmpHtml).insertAfter('.photo_next').hide();
			this.nextPhotosetHTML = '<p>您已经浏览完所有图片</p><p><a id="rePlayBut" href="javascript://">重新播放</a><a id="nextPicsBut" href="' + this.data.next_photoset.url + '">查看下一个专辑</a></p>';
			this.prevPhotosetHTML = '<p>当前已是第一张图片</p><p><a id="nextPicsBut" href="' + this.data.prev_photoset.url + '">查看上一个专辑</a></p>';
			this.initList();
			this.initBtns();
			// 动画相关
			this.timeout = null;
			this.interval = null;
			this.intervalDelay = Math.floor(1000 / this.options.frameRate);
			this.clearDesc();
		},
		fillIcon : function(imgSrc) {
			return '<img src="' + imgSrc + '" style="border:0;width:68px;height:68px" />';
		},
		clearDesc : function() {
			// 未登陆或非自己博客不显示“点击添加描述”
			if (!ms.is_mine() && this.$desc.text() === TEXT.add) {
				this.$desc.text('　');
				this.$desc.css('cursor', 'default');
			}
		},
		setOrigin : function(item) {
			var target = $('.photo-slider-original');
			if (item.urlOld)
				target.attr('href', item.urlOld);
			else
				target.hide();
		},
		initList : function() {
			this.$mask = $('<div class="mask-box"></div>').insertBefore(this.$ul);
			// 设置初始的位置
			this.$index.html(this.cIndex + 1);
			this.setPhotoInfo(this.cIndex);
		},
		initBtns : function() {
			var self = this;
			var preBnt = '.pre-bnt', nextBnt = '.next-bnt', click = 'click', blur = 'blur', mouseenter = 'mouseenter', mouseleave = 'mouseleave', mousedown = 'mousedown', mouseup = 'mouseup', preBntHover = 'pre-bnt-hover', nextBntHover = 'next-bnt-hover';
			// 图片工具栏：设置封面/左旋/右旋/删除
			this.photoTool.delegate('.rotation-left', click, function(event) {
				event.preventDefault();
				self.$big.find('img,canvas').rotateLeft();
				self.setBoxHeight();
			}).delegate('.rotation-right', click, function(event) {
				event.preventDefault();
				self.$big.find('img,canvas').rotateRight();
				self.setBoxHeight();
			}).delegate('.photo-slider-cover', click, function(event) {
				event.preventDefault();
				if (ms.login()) {
					$.post('/a/album/photo/cover.do', {
						photosetid : self.data.cur_photoset,
						coverid : self.photos[self.cIndex].id
					}, function(results) {
						if (results.code == 0) {
							$.inform({
								icon : 'icon-success',
								delay : 1000,
								easyClose : true,
								content : "封面修改成功"
							});
						}
					}, 'json');
				}
			}).delegate('.photo-slider-del', click, function(event) {
				var tipsText = (window.album_data.cur_photoset_type == 4) ? '删除该图片会导致微博不能正常显示，继续删除？' : '确定要删除当前图片吗？';
				event.preventDefault();
				if (ms.login()) {
					$.confirm({
						title : false,
						content : tipsText,
						onConfirm : function() {
							$.post('/a/album/photo/delete.do', {
								photoid : self.photos[self.cIndex].id
							}, function(results) {
								if (results.code == 0) {
									var nextIndexID = self.getHash();
									if (nextIndexID == self.len) {
										location.href = $space_config._url + 'album/index.htm';
									} else {
										location.href = $space_config._url + 'album/photo/' + nextIndexID + '/view/';
									}
								}
							}, 'json');
						}
					});
				}
			});
			// 前一张/后一张/关闭/重新播放
			this.$bigDiv.delegate('.photo_prev', click, function() {
				self.prePhoto();
			}).delegate('.photo_next', click, function() {
				self.nextPhoto();
			}).delegate('#endSelClose', click, function() {
				self.$nextPhotoset.fadeOut('normal');
			}).delegate('#rePlayBut', click, function() {
				self.$nextPhotoset.hide();
				self.setPhotoInfo(0);
			});
			// 左右箭头/小图片
			this.$list.delegate(preBnt, mouseenter, function() {
				if (!self.isStart().px || !self.isStart().index) {
					$(this).addClass(preBntHover);
				}
			}).delegate(preBnt, mouseleave, function() {
				$(this).removeClass(preBntHover);
			}).delegate(preBnt, mousedown, function() {
				self.timeout = setTimeout(function() {
					self.moveRight();
				}, 300);
			}).delegate(preBnt, mouseup, function() {
				clearTimeout(self.timeout);
				clearInterval(self.interval);
				self.goRight();
			}).delegate(nextBnt, mouseenter, function() {
				if (!self.isEnd().px || !self.isEnd().index) {
					$(this).addClass(nextBntHover);
				}
			}).delegate(nextBnt, mouseleave, function() {
				$(this).removeClass(nextBntHover);
			}).delegate(nextBnt, mousedown, function() {
				self.timeout = setTimeout(function() {
					self.moveLeft();
				}, 300);
			}).delegate(nextBnt, mouseup, function() {
				clearTimeout(self.timeout);
				clearInterval(self.interval);
				self.goLeft();
			}).delegate('li', click, function() {
				self.getCurrentItem().removeClass('on');
				// Converted into number
				self.cIndex = $(this).attr(attrName) - 0;
				self.setPhotoInfo(self.cIndex);
			});
			// 只有是自己的图片库才允许编辑图片描述
			if (ms.is_mine()) {
				self.$desc.attr('title', TEXT.mod);
				this.$pContent.delegate('p span', click, function() {
					var $input = self.$input;
					$input.show();
					$input.focus();
					$input.val('');
					self.$desc.hide();
					$input.val($input.data('desc'));
				}).delegate('p input', blur, function() {
					var $input = self.$input, val = $input.val(), cIndex = self.cIndex, data = {
						photoid : self.photos[cIndex].id,
						desc : val
					}, url = '/a/album/photo/edit.do?_input_encode=UTF-8&_output_encode=UTF-8';
					$input.hide();
					if ($input.data('desc') != val) {
						self.$desc.text('正在提交...').show();
						$.post(url, data, function(data) {
							if (data.code == 0) {
								self.$desc.html(val == '' ? TEXT.add : val);
								$input.data('desc', val);
								// 更新数据
								self.photos[cIndex].desc = val;
							} else {
								self.$desc.html($input.data('desc'));
								$.sentenceNotice({
									type : 'notice',
									delay : 1000,
									icon : 'error',
									content : data.msg
								});
							}
						}, 'json');
					} else {
						self.$desc.show();
					}
				});
			}
			// 键盘支持
			$(document).keydown(function(event) {
				if (!$(event.target).closest('input,textarea').length) {
					switch (event.keyCode) {
					case 37:
						// left
						self.prePhoto();
						break;
					case 32:
						// space
						event.preventDefault();
					case 39:
						// right
						self.nextPhoto();
						break;
					}
				}
			});
		},
		isStart : function() {
			var left = this.ulLeft(), $li = this.$ul.children().first(), index = parseInt($li.attr(attrName), 10);
			return {
				'px' : left >= 0, // 坐标边界
				'index' : index == 0
			// 数组边界
			};
		},
		isEnd : function() {
			var left = this.ulLeft(), $li = this.$ul.children().last(), index = parseInt($li.attr(attrName));
			return {
				'px' : Math.abs(left) >= this.$ul.width() - this.$ul.parent().width(),
				'index' : index == this.len - 1
			};
		},
		ulLeft : function() {
			return parseInt(this.$ul.css('left'));
		},
		getCurrentItem : function(index) {
			index = index || this.cIndex;
			return this.$ul.find('[data-photoslider-index="' + index + '"]');
		},
		moving : function() {
			this.$mask.hide();
			this.getCurrentItem().addClass('on');
		},
		// 连续向左移动
		moveLeft : function() {
			var self = this;
			this.sliding = true;
			this.moving();
			this.interval = setInterval(function() {
				var left = self.ulLeft(), $li = self.$ul.children().last(), index = parseInt($li.attr(attrName), 10);
				// 如果到了结尾
				if (self.isEnd().px) {
					// 没到最后一条则补充缩略图
					if (index != this.len - 1) {
						self.appendThumb(3);
					} else {
						self.$ul.css('left', -(self.$ul.width() - self.$ul.parent().width()));
					}
					clearInterval(self.interval);
					return;
				}
				self.$ul.css('left', left - self.options.speed);
				// console.log(left);
			}, this.intervalDelay);
		},
		// 连续向右移动
		moveRight : function() {
			var self = this;
			this.sliding = true;
			this.moving();
			this.interval = setInterval(function() {
				var left = self.ulLeft(), $li = self.$ul.children().first(), index = parseInt($li.attr(attrName), 10);
				// 如果到了开头
				if (self.isStart().px) {
					// 没到第一条则补充缩略图
					if (index != 0) {
						self.prependThumb(3);
					} else {
						self.$ul.css('left', 0);
					}
					clearInterval(self.interval);
					return;
				}
				self.$ul.css('left', left + self.options.speed);
			}, this.intervalDelay);
		},
		// 单击向左
		goLeft : function() {
			var self = this, left = this.ulLeft(), width = Math.abs(left) + this.$ul.parent().width(), end, $li = this.$ul
			.children().last(), index = parseInt($li.attr(attrName));
			if (this.isEnd().px) {
				if (index != this.len - 1) {
					this.appendThumb(3);
					left = this.ulLeft();
					width = Math.abs(left) + this.$ul.parent().width();
				} else {
					this.sliding = false;
					return;
				}
			}
			if (width % this.options.itemWidth == 0 && this.sliding) {
				this.sliding = false;
				return;
			}
			end = -(Math.ceil(width / this.options.itemWidth) * this.options.itemWidth - this.$ul.parent().width());
			if (!this.sliding) {
				end -= this.options.itemWidth;
			}
			if (Math.abs(end) >= this.$ul.width() - this.$ul.parent().width()) {
				end = -(this.$ul.width() - this.$ul.parent().width());
			}
			this.sliding = true;
			this.moving();
			this.$ul.animate({
				'left' : end
			}, 'fast', function() {
				self.sliding = false;
			});
		},
		// 单击向右
		goRight : function() {
			var self = this, left = this.ulLeft(), width = Math.abs(left) + this.$ul.parent().width(), end, $li = this.$ul
			.children().first(), index = parseInt($li.attr(attrName), 10);
			if (this.isStart().px) {
				if (index != 0) {
					this.prependThumb(3);
					left = this.ulLeft();
					width = Math.abs(left) + this.$ul.parent().width();
				} else {
					this.sliding = false;
					return;
				}
			}
			if (width % this.options.itemWidth == 0 && this.sliding) {
				this.sliding = false;
				return;
			}
			end = -(Math.floor(width / this.options.itemWidth) * this.options.itemWidth - this.$ul.parent().width());
			if (!this.sliding) {
				end += this.options.itemWidth;
			}
			if (end >= 0) {
				end = 0;
			}
			this.sliding = true;
			this.moving();
			this.$ul.animate({
				'left' : end
			}, 'fast', function() {
				self.sliding = false;
			});
		},
		prePhoto : function() {
			var $preItem;
			if (!(this.cIndex == 0)) {
				if (this.$nextPhotoset.is(':visible')) {
					this.$nextPhotoset.fadeOut('normal');
				}
				this.getCurrentItem().removeClass('on');
				this.cIndex -= 1;
				this.setPhotoInfo(this.cIndex);
			} else {
				this.$nextPhotoset.find('.E_Cont').html(this.prevPhotosetHTML);
				this.$nextPhotoset.css({
					left : (this.$big.width() - this.$nextPhotoset.width()) / 2,
					top : (this.$big.height() - this.$nextPhotoset.height()) / 2
				}).fadeIn('normal');
			}
		},
		nextPhoto : function() {
			var nextItem;
			if (!(this.cIndex == this.len - 1)) {
				if (this.$nextPhotoset.is(':visible')) {
					this.$nextPhotoset.fadeOut('normal');
				}
				this.getCurrentItem().removeClass('on');
				this.cIndex += 1;
				this.setPhotoInfo(this.cIndex);
			} else {
				this.$nextPhotoset.find('.E_Cont').html(this.nextPhotosetHTML);
				this.$nextPhotoset.css({
					left : (this.$big.width() - this.$nextPhotoset.width()) / 2,
					top : (this.$big.height() - this.$nextPhotoset.height()) / 2
				}).fadeIn('normal');
			}
		},
		setBoxHeight : function() {
			var $img = this.$big.find('img,canvas'), width = $img.width(), height = $img.height() || 250;
			this.$big.css('text-align', 'left').height(height);
			$img.css({
				'margin-left' : ($img.parent().width() - width) / 2
			});
		},
		setPhotoInfo : function(n) {
			this.cIndex = n;
			var self = this, $img = this.$big.find('img,canvas');
			// 追加按钮
			var children = this.$ul[0].children;
			if (children.length) {
				var left = parseInt(children[0].getAttribute(attrName)), right = parseInt(children[children.length - 1]
				.getAttribute(attrName));
				if (n < left - 7 || n > right + 7)
					this.$ul.html('').css('left', 0);
			}
			if (children.length) {
				this.prependThumb(left - n + 4);
				this.appendThumb(n + 5 - right);
			} else {
				this.prependThumb(Math.max(3, n + 7 - this.len), n - 1);
				this.appendThumb(Math.max(4, 8 - n), n);
			}
			this.loadData(n, function(item) {
				self.loadImage(item.url930, function($insertImg) {
					// 执行回调时要判断是否加载是为当前选择的图片
					if (n == self.cIndex) {
						$img.animate({
							opacity : .5
						}, 'normal', function() {
							$insertImg.css('opacity', .5);
							self.$big.empty().append($insertImg);
							$insertImg.animate({
								opacity : 1
							}, 'normal');
							self.setBoxHeight();
						});
						resizeSeaLevel();
					}
				});
				var desc = item.desc || item.description;
				if (desc == undefined || desc == '') {
					self.$desc.html(TEXT.add)
					self.$input.data('desc', '');
				} else {
					self.$desc.html(desc);
					self.$input.data('desc', self.$desc.html());
				}
				self.setOrigin(item);
				$('.feed-timestamp').html(item.uploadDate);
				if ($.isFunction(self.options.onChange)) {
					self.options.onChange(item);
				}
			});
			this.$index.html(this.cIndex + 1);
			isLatest || this.setHash(this.photos[this.cIndex].id);
			this.sliding = true;
			for ( var i = 0, L = children.length; i < L; i++) {
				if (children[i].getAttribute(attrName) == n)
					break;
			}
			this.$mask.css('left', (i < 4 ? i : i > L - 4 ? i + 7 - L : 3) * this.options.itemWidth + 7 + "px").show();
			this.$ul.stop().animate({
				'left' : (i < 4 ? 0 : i > L - 4 ? L - 7 : i - 3) * -this.options.itemWidth
			}, 'slow', function() {
				self.sliding = false;
			});
			this.clearDesc();
		},
		// 图片预加载
		loadImage : function(src, callback) {
			var $img = $('<img>');
			$img.load(function() {
				callback($img);
			}).attr('src', src);
		},
		// 追加新的缩略图
		appendThumb : function(count, last) {
			if (count < 0)
				return;
			var children = this.$ul[0].children;
			arguments.length == 1 && (last = parseInt(children[children.length - 1].getAttribute(attrName)) + 1);
			for ( var i = 0; i < count && i + last < this.len; i++) {
				this.$ul
				.append('<li data-photoslider-index="' + (i + last) + '"><div class="img-wrap"><a href="javascript:void(0);"></a></div></li>');
				this.fetchIcon(children[children.length - 1]);
			}
			if (children.length > 24) {
				var $toRemove = $(children[children.length - 24]).prevAll().remove();
				this.$ul.css('left', this.ulLeft() + $toRemove.length * this.options.itemWidth + "px");
			}
			this.$ul.width(children.length * this.options.itemWidth);
		},
		prependThumb : function(count, first) {
			if (count < 0)
				return;
			var children = this.$ul[0].children;
			arguments.length == 1 && (first = parseInt(children[0].getAttribute(attrName)) - 1);
			for ( var i = 0; i < count && first - i >= 0; i++) {
				this.$ul
				.prepend('<li data-photoslider-index="' + (first - i) + '"><div class="img-wrap"><a href="javascript:void(0);"></a></div></li>')
				.css('left');
				this.fetchIcon(children[0]);
			}
			if (children.length > 24) {
				$(children[24]).nextAll().remove();
			}
			this.$ul.width(children.length * this.options.itemWidth)
			.css('left', this.ulLeft() - i * this.options.itemWidth + "px");
		},
		fetchIcon : function(li) {
			var index = li.getAttribute(attrName);
			this.loadData(index, function(item) {
				li.getElementsByTagName("A")[0].innerHTML = PhotoSlider.prototype.fillIcon(item.url150);
			});
		},
		loadData : function(index, callback, needurl) {
			index = parseInt(index);
			var item = this.photos[index];
			if (item) {
				if (typeof item === "string") {
					this.photos[index] = [ callback ];
				} else if ($.isArray(item)) {
					item.push(callback);
				} else {
					callback(item);
				}
				return;
			}
			this.photos[index] = [ callback ];
			for ( var a = index - 1; a >= 0 && a >= index - 15; a--) {
				if (this.photos[a]) {
					a++;
					break;
				}
				this.photos[a] = 'loading';
			}
			a == -1 && a++;
			for ( var b = index + 1; b < this.len && b < a + 20; b++) {
				if (this.photos[b]) {
					break;
				}
				this.photos[b] = 'loading';
			}
			var self = this;
			$.getJSON('/a/album/photo/list.do', {
				photosetid : this.data.cur_photoset,
				xpt : xpt,
				start : a,
				count : b - a,
				needurl : needurl || ''
			}, function(ret) {
				if (ret.code) {
					return;
				}
				var data = ret.data;
				self.len = data.total;
				for ( var i = a; i < b; i++) {
					var old = self.photos[i], item = data.photos[i - a];
					self.photos[i] = item;
					if ($.isArray(old)) {
						for ( var n = 0; n < old.length; n++) {
							old[n](item);
						}
					}
				}
			});
		},
		setHash : function(num) {
			location.hash = num;
		},
		getHash : function() {
			var num = location.hash.match(/#(\d+)/);
			return num && num[1];
		}
	};
	function resizeSeaLevel() {
		setTimeout(function() {
			var a = $('#main').position().top + 15, b = $('.list-pic').position().top + 105;
			var A = $wnd.scrollTop() + 30, B = A + $wnd.height() - 30;
			var toMove = A > a || b - a > B - A ? a - A : b > B ? b - B : 0;
			var target = A - 30 + toMove;
			toMove && function sched() {
				toMove = toMove > 10 ? toMove - 10 : toMove < -10 ? toMove + 10 : 0;
				window.scrollTo(0, target - toMove);
				toMove && setTimeout(sched, 5);
			}();
		}, 600);
	}
	require('app::discuss', 'plugins::hijacker', 'core::util[cookie]', function(Comment, hijacker, util) {
		hijacker.hijackthis('.hijackthis');
		var currentPic = window.album_data.list_photo[window.album_data.current_relative_photo_index];
		var comment = new Comment({
			elem : $('.commentnum')[0],
			dom : $('.album-remark')[0],
			usericon : util.cookie,
			appId : 'photo',
			xpt : $space_config._xpt,
			load : {
				page : true
			},
			pagesize : 20,
			extra : function() {
				this.tf.setText('');
			},
			parentid : currentPic.id,
			onSuccess : function(cmt) {
				util.refreshCount(this.elem, cmt.commentcount);
				util.refreshCount(util.getSibling(this.elem, 'previous'), cmt.spreadcount);
			}
		});
		var pid = 0, count = 0, trigger = function() {
			count++;
			if (count === 6) {
				pid = clearInterval(pid);
				comment.init({
					parentid : currentPic.id
				});
			}
		};
		define('plugins::hijacker::albumview.forward', function(e) {
			require('plugins::hijacker::Forward', function(Forward) {
				new Forward({
					elem : e.actionTarget,
					usericon : util.cookie,
					operatortype : 3,
					appId : 'photo',
					itemid : currentPic.id,
					xpt : window._xpt,
					origin : {
						unick : window._sucNick
					},
					data : {
						photo : true,
						appId : 'photo',
						ulink : $space_config._url,
						unick : window._sucNick,
						content : currentPic.desc,
						itemid : currentPic.id
					}
				});
			});
		});
		new PhotoSlider({
			data : window.album_data,
			onChange : function(item) {
				showPhotoViews(item.id);
				// 这里可以做评论的切换，最好加一个timeout延迟加载，防止连续切换图片时的多次无意义请求
				currentPic = item;
				count = 0;
				pid || (pid = setInterval(trigger, 100));
			}
		});
	});
	function showPhotoViews(id) {
		$.ajax({
			url : 'http://cc.i.sohu.com/hits/photo/' + id + '/jsonp/',
			type : 'GET',
			dataType : 'jsonp',
			jsonp : 'jsonp',
			success : function(count) {
				$(".numlook").html('浏览量(' + count + ')');
			}
		});
	}
})(this, this.location, jQuery, MYSOHU);
