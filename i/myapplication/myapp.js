require('i::myapplication::template', 'core::util::jQuery', 'core::util::ajax', 'core::ui::dialog[confirm,error]', 'core::stringUtil', function(TMPL, $, ajax, $dlg, stringUtil) {
	var favorites = $space_config.favorites;
	favorites[favorites.length - 1] || favorites.pop();
	$('.favorites ul').toggle(!!favorites.length).html(TMPL.favorites(favorites));
	$('.favorites ul,.all-application ul').delegate('li', 'mouseenter mouseleave', function(e) {
		$(this).toggleClass('hover', e.type === 'mouseenter');
	}).delegate('.popup.right>a', 'click', function(e) {
		var $target = $(this).closest('li'), id = parseInt($target.attr('data-id'));
		switch (this.children[0].className) {
		case 'icon-downward':
			ajax.postJSON('/a/open/personal/recommend/cancel', {
				id : id
			}, function(ret) {
				if (ret.code == 0) {
					$target.parent().toggle(!!favorites.length);
					var $next = $target.next();
					$target.remove();
					$next.length && $next.css('marginLeft', 107).animate({
						'marginLeft' : 10
					}, 'fast');
					for ( var i = 0, L = favorites.length; i < L; i++) {
						if (favorites[i].id == id) {
							favorites.splice(i, 1);
							break;
						}
					}
					require('myapp::sidebar::redraw', function(f) {
						f();
					});
				} else {
					$dlg.error(ret.msg);
				}
			});
			break;
		case 'icon-upward':
			for ( var i = 0, L = favorites.length; i < L; i++) {
				if (favorites[i].id == id)
					return;
			}
			ajax.postJSON('/a/open/personal/recommend', {
				id : id
			}, function(ret) {
				if (ret.code == 0) {
					var data = {
						app : Boolean($target.attr('data-app')),
						id : id,
						iconMax : $target.attr('data-icon'),
						iconMin : $target.attr('data-icon2'),
						name : $target.attr('data-name'),
						url : $target.attr('data-url')
					};
					data.filtered_name = stringUtil.gbSubstr(data.name, 4);
					favorites.push(data);
					while (favorites.length > 8)
						favorites.shift();
					addFavorite(data);
					require('myapp::sidebar::redraw', function(f) {
						f();
					});
				} else {
					$dlg.error(ret.msg);
				}
			});
			break;
		case 'icon-close':
			$dlg.confirm({
				content : '确认删除' + ($target.attr('data-app') ? '应用' : '网址') + '吗？',
				onConfirm : function() {
					ajax.getJSON('/a/open/personal/cancel?id=' + id, function(ret) {
						if (ret.code != 0) {
							$dlg.error(ret.msg);
							return;
						}
						$target.remove();
						for ( var i = 0, L = favorites.length; i < L; i++) {
							if (favorites[i].id == id) {
								favorites.splice(i, 1);
								$('.favorites li:eq(' + i + ')').remove();
								require('myapp::sidebar::redraw', function(f) {
									f();
								});
								break;
							}
						}
					});
				}
			});
			break;
		}
	});
	define('myapp::addAddr', function(data) {
		$('.all-application ul').prepend(TMPL.myapp_addr(data));
		addFavorite(data);
	});
	function addFavorite(data) {
		var $ul = $('.favorites ul');
		var tmp = $ul.children();
		tmp.length == 8 && tmp.eq(0).remove();
		$ul.show().append(TMPL.favorites(data));
	}
});