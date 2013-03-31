require('i::myapplication::template', 'core::util::jQuery', 'core::util::ajax', 'core::ui::dialog[error]', 'core::stringUtil', '#document', function(TMPL, $, ajax, $dlg, stringUtil) {
	var sidebar_list = $('.expand-user-app ul:eq(0)');
	var favorites = $space_config.favorites;
	if (!favorites) {
		// 异步读取
		ajax.getJSON('http://i.sohu.com/a/open/personal/list', function(ret) {
			var arr = ret.data || [], L = arr.length;
			favorites = new Array(L);
			for ( var i = 0; i < L; i++) {
				var obj = arr[i];
				favorites[i] = {
					name : obj.name,
					filtered_name : stringUtil.gbSubstr(obj.name, 4),
					id : obj.id,
					iconMin : obj.iconMin,
					iconMax : obj.iconMax,
					url : obj.url,
					app : !obj.shortcut
				};
			}
			console.log(favorites);
			// 绘制
			drawSidebar();
		});
	} else {
		// 直接绘制
		favorites[favorites.length - 1] || favorites.pop();
		for ( var i = 0, L = favorites.length; i < L; i++) {
			var obj = favorites[i];
			obj.filtered_name = stringUtil.gbSubstr(obj.name, 4);
		}
		drawSidebar();
	}
	$space_config._currentApp == 'myapp' && $('.all-application i.add-myadrs').parent().click(click);
	define('myapp::sidebar::redraw', redraw);
	for ( var COUNT = 42, icons = Array(COUNT), i = 0; i < COUNT; i++) {
		icons[i] = (i > 99 ? '' : i > 9 ? '0' : '00') + i;
	}
	function redraw() {
		var html = TMPL.left_addr(favorites);
		if (favorites.length < 8) {
			html += TMPL.left_more();
		}
		sidebar_list.html(html);
	}
	function drawSidebar() {
		redraw();
		sidebar_list.delegate('li.i-add', 'mouseenter mouseleave', function(e) {
			this.className = e.type === 'mouseenter' ? "i-add hover" : "i-add";
		}).delegate('a.i-addurl', 'click', click);
	}
	function click(e) {
		var dialog = $dlg({
			title : '添加自定义网址',
			btns : [ "accept", "cancel" ],
			labAccept : "添加",
			content : TMPL.dlg(icons),
			onBeforeAccept : function() {
				var url = $url.val(), match = url && url.match(/https?:\/\/([^\/]+)/);
				if (!match) {
					$dlg.error(url ? '网址格式不正确' : '网址不能为空');
					$url.focus();
					return false;
				}
				var name = $name.val();
				if (!name) {
					$dlg.error('名称不能为空');
					$name.focus();
					return false;
				}
				var icon = dialog.find('.active img').attr('src');
				ajax.postJSON('/a/open/personal/url/add?_input_encode=UTF-8', {
					siteUrl : url,
					siteName : name,
					iconMin : icon,
					iconMax : icon.replace(/\d+\.\w+$/, '75.jpg')
				}, function(ret) {
					if (ret.code == 0) {
						dialog.close();
						var data = ret.data;
						data = {
							id : data.id,
							url : data.siteUrl,
							iconMin : data.icon_min,
							iconMax : data.icon_max,
							name : data.siteName,
							filtered_name : stringUtil.gbSubstr(data.siteName, 4)
						};
						var btnAdd = sidebar_list.children().last();
						favorites.push(data);
						if (favorites.length <= 7) {
							$(TMPL.left_addr(data)).insertBefore(btnAdd);
						} else {
							if (favorites.length == 8)
								btnAdd.remove();
							else {
								sidebar_list.children().eq(0).remove();
								favorites.shift();
							}
							sidebar_list.append(TMPL.left_addr(data));
						}
						if ($space_config._currentApp == 'myapp') {
							require('myapp::addAddr', function(f) {
								f(data);
							});
						}
					} else {
						$dlg.error(ret.msg);
					}
				}, function() {
					$dlg.error('保存失败，请稍后再试');
				});
				return false;
			}
		});
		var $url = dialog.find('input'), $name = $url.eq(1);
		$url.length = $url[1] = 1;
		$url.focus().val('http://').bind('change', function(e) {
			var match = this.value.match(/https?:\/\/(?:www\.)?([^\/]*?)\.(?:com|com\.cn|net|cn|org)/);
			match && (!$name.val() || $name.val() === $name.attr('auto-complete')) && $name.val(match[1])
			.attr('auto-complete', match[1]);
		});
		dialog.find('ul.rtbar-com').delegate('li', 'click', function(e) {
			if (e.currentTarget.className != "active") {
				dialog.find('.active').removeClass(e.currentTarget.className = 'active');
			}
		});
	}
});