require('core::util::jQuery', 'core::util[transform,fx]', 'core::ui::dialog::error', 'core::stringUtil', 'app::feed::common', function($, util, $error, stringUtil, COMMON) {
	define('plugins::hijacker::preview_expand', function(e) {
		var preview = e.actionTarget;
		if (preview.mutex)
			return;
		preview.mutex = true;
		var sm = util.getParentByClassName(preview, 'preview-small');
		var sibling = util.getSibling(sm, 'next');
		if (sibling) {
			sibling.toggle();
			return;
		}

		var img = document.createElement("IMG");
		var sched_check = setInterval(function() {
			if (img.width || img.height) {
				clearInterval(sched_check);
				sched_check = 0;
				sched_preview = setTimeout(onSize, 100);
			}
		}, 1), sched_preview;

		img.onload = function() {
			sched_check && clearInterval(sched_check);
			sched_preview && clearTimeout(sched_preview);
			onSize(true);
		};
		function onSize(loaded) {
			preview.mutex = false;
			var w = img.width, h = img.height, previewRatio = preview.height / preview.width, imgRatio = h / w;
			if (w > 450) {
				h = Math.round(h * 450 / w);
				w = 450;
			}
			var $div = $(COMMON.photo_preview({
				album : preview.getAttribute('data-album'),
				isMine : preview.getAttribute('data-mine') == "true",
				pid : 'pv' + util.uuid(),
				src : preview.src,
				ori : preview.getAttribute('data-photo_ori')
			}));
			$div.css({
				'width' : '',
				'height' : h + 30 + "px"
			});

			sm.style.display = "none";
			$div.appendTo(sm.parentNode);

			// 滚动到适当位置显示图片
			var feedTop = $div.position().top - 31, topNow = util.wndTop(), topInt = feedTop - topNow;
			if (topInt >= 0) {
				topInt = feedTop + h + 72 - topNow - document.documentElement.clientHeight;
				if (topInt < 0)
					topInt = 0;
				else if (topInt > feedTop - topNow)
					topInt = feedTop - topNow;
			}
			topInt && window.scrollTo(0, topNow + topInt);

			var $img = $div.find('img');
			if (loaded) {
				onload_replace.call(img);
			}
			w < 450 && $img.css('position', 'relative');
			if (h > 120 && h < 900 && !(topInt && util.ie)) {// 展示动画
				util.fx({
					src : 0,
					dst : 1,
					interval : 10,
					steps : 20,
					fixFrame : false,
					type : 'log',
					self : $img,
					callback : function(n) {
						if (img && loaded) {
							onload_replace.call(img);
							w < 450 && this.css('position', 'relative');
						}
						if (h > 120) {
							var w2 = w * (120 + n * (h - 120)) / h;
							this.css({
								'width' : w2 + "px",
								'height' : w2 * (loaded ? imgRatio : previewRatio) + "px"
							});
						}
						w < 450 && this.css('left', Math.round((450 - w >> 1) * n) + "px");
						topInt > 32 && this.css('marginTop', Math.round((topInt - 32) * (1 - n)) + "px");
					},
					complete : function() {
						$div.css({
							'marginTop' : ''
						});
						this.attr('action', 'preview_shrink');
						if (img && !loaded) {
							img.onload = onload_replace;
						}
					}
				});
				img && (img.onload = function() {
					loaded = true;
					this.onload = this.onerror = null;
				});
			} else {
				$img.css({
					'width' : w + 'px',
					'height' : h + "px"
				});
				w < 450 && $img.css('left', (450 - w >> 1) + "px");
				img && (img.onload = onload_replace);
			}
			function onload_replace() {
				var tmp = $img[0];
				this.id = tmp.id;
				this.setAttribute("action", "preview_shrink");
				tmp.parentNode.replaceChild(this, tmp);
				$img[0] = this;
				this.onload = this.onerror = null;
				img = null;
				$img.css('visibility', '');
			}
		}

		img.onerror = function() {
			preview.mutex = false;
			this.onerror = null;
			clearInterval(sched_check);
			$error('载入图片失败');
		};
		img.style.visibility = "hidden";// 解决IE浏览器因为图片替换引起的缩放动画闪烁问题(4)
		img.src = preview.getAttribute('data-photo_big');

	});

	var no_flash = false;
	require("plugins::swfobject", function(SWFObject) {
		no_flash = SWFObject.getFlashPlayerVersion().major == 0;
	});
	define('plugins::hijacker::video_expand', function(e) {
		var sm = util.getParentByClassName(e.actionTarget, 'preview-small');
		if (!sm) {
			sm = $(e.actionTarget).closest('.hijackdata').find(".preview-small");
			e.actionTarget = sm.find('a.thumb-video')[0];
			sm = sm[0];
		}
		var sibling = util.getSibling(sm, 'next');
		if (!sibling) {
			// no wrapper
			var title = e.actionTarget.getAttribute('data-title');
			if (stringUtil.gbLength(title) > 30)
				title = stringUtil.gbCut(title, 28) + "...";
			var $big = $(no_flash ? COMMON.video_noflash() : COMMON.video_preview({
				flash : e.actionTarget.getAttribute('data-player'),
				title : title,
				link : e.actionTarget.href,
				notIE : !util.ie,
				width : 450,
				height : 320,
				id : 'fl' + util.seed
			}));
			sm.style.display = "none";

			sm.parentNode.appendChild($big[0]);

			var feedTop = $big.position().top - 31;
			var topNow = util.wndTop(), topInt = feedTop - topNow;
			if (topInt >= 0) {
				topInt = feedTop + 392 - topNow - document.documentElement.clientHeight;
				if (topInt < 0)
					topInt = 0;
				else if (topInt > feedTop - topNow)
					topInt = feedTop - topNow;
			}
			if (topInt) {
				util.fx({
					src : topNow,
					dst : topNow + topInt,
					round : true,
					speed : 'fast',
					steps : 8,
					type : 'log',
					callback : function(n) {
						window.scrollTo(0, n);
					}
				});
			}
		} else {
			sibling.parentNode.removeChild(sibling);
			sm.style.display = "";
		}
	});
	define('plugins::hijacker::preview_shrink', function(e) {
		var img = e.actionTarget;
		if (img.nodeName !== "IMG") {
			var pid = img.getAttribute('pid');
			if (pid == null) {// video
				var dom = util.getParentByClassName(img, 'tblog-preview');
				dom.removeChild(dom.children[1]);
				dom.children[0].style.display = "";
				return;
			}
			img = document.getElementById(pid);
		}
		if (!img)
			return;
		var dom = util.getParentByClassName(img, 'tblog-preview');
		dom.removeChild(dom.children[1]);
		dom.children[0].style.display = "";
		var feedTop = $(util.getParentByClassName(dom, 'section')).position().top - 30, scrollTop = util.wndTop();
		if (scrollTop > feedTop)
			window.scrollTo(0, feedTop);
	});
	define('plugins::hijacker::preview_rotleft', preview_rotate);
	define('plugins::hijacker::preview_rotright', preview_rotate);

	function preview_rotate(e) {
		var pic = document.getElementById(e.actionTarget.getAttribute("pid"));
		if (!pic.rotated) {
			pic.originWidth = pic.clientWidth;
			pic.originHeight = pic.clientHeight;
			pic.rotated = true;
			pic.rotate = 0;
		}
		var w = pic.originWidth, h = pic.originHeight;
		var rotate = pic.rotate;
		rotate = pic.rotate = (rotate + (/left/.test(e.action) ? 3 : 1)) % 4;
		var swapped = (rotate === 1 || rotate === 3);
		var zoom = swapped && h > 450 ? 450 / h : 1;
		$(pic).css(util.transform({
			rotate : rotate * Math.PI / 2,
			scalex : zoom,
			scaley : zoom,
			width : w,
			height : h,
			center : true,
			dy : swapped ? (w * zoom - h) / 2 : 0
		}));
		pic.parentNode.parentNode.style.height = swapped ? w * zoom + 30 + "px" : "";
		if (util.ie == 6) {
			var className = pic.parentNode.className;
			pic.parentNode.className = className + " rerender";
			setTimeout(function() {
				pic.parentNode.className = className;
			}, 20);
		}
	}

});