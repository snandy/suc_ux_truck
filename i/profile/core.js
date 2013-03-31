(function($) {
	var appname = 'profileapp';
	$[appname] = {
		// 权限设置相关的菜单
		// objlist: [{
		//	name: 'nameset',
		//	el: nameset,
		//	html: '....'
		// }]
		menulist: {},
		changePrivacy: function(objlist) {
			// var menulist = {};
			var self = this;
			$.each(objlist, function(index, item) {
				var __item = item;
				var __el = item.el;
				var __ishide = item.ishide;
				__el.bind('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					$('.profile-intimity-menu-list').hide();
					if(self.menulist[item.name]) {
						var pos = __el.offset(),
							top = pos.top + __el.height(),
							left = pos.left;
						$(self.menulist[item.name]).show().css({
							top: top + 'px',
							left: left + 'px'
						});
						return false;
					}
					var d = document.createElement('div');
					d.className = 'profile-intimity-menu-list';
					d.style.display = 'none';
					d.innerHTML = item.html;
					$(document.body).append(d);
					self.menulist[item.name] = d;
					var pos = __el.offset(),
						// top = pos.top + __el.height(),
						// 高度暂时写死
						top = pos.top + 20,
						left = pos.left;
					$(d).css({
						top: top + 'px',
						left: left + 'px',
						zIndex: 999999
					}).show();
					var _nel = $(this);
					$(d).find('a').each(function(index, item) {
						$(item).bind('click', function(e) {
							e.preventDefault();
							e.stopPropagation();
							_nel.find('a').html('<i class="global-icon-privacy-12">隐私</i>'+ $(item).html() +'<span class="profile-icon-menu-jt"></span>');
							var v1 = __el.find('input').attr('value'),
								v2 = $(item).attr('vindex');
							_nel.find('input').attr('value', v2);
							$('.profile-intimity-menu-list').hide();
							if(__item.callback) {
								if(v1 == v2) return;
								__item.callback(v2);
							}
							
						});
					});
					if(__ishide) {
						$(d).bind('mouseover', function(e) {
							$(__el).show();
						}).bind('mouseout', function(e) {
							$(__el).hide();
						});
					}
				});
			});
			$(document.body).bind('click', function(e) {
				$('.profile-intimity-menu-list').hide();
			});
		},
		// 重置隐私设置
		resetPrivacy: function(objlist) {
			var self = this;
			$.each(objlist, function(index, item) {
				var __el = item.el,
					__a = $($(self.menulist[item.name]).find('a')[item.privacy]);
				if(!self.menulist[item.name]) return false;
				var txt = __a.html();
				__el.find('a').html('<i class="global-icon-privacy-12">隐私</i>'+ txt +'<span class="profile-icon-menu-jt"></span>');
				__el.find('input').attr('value', __a.attr('vindex'));
			});
		},
		// 删除menulist缓存
		deleteObj: function(name) {
			this.menulist.name = null;
			delete this.menulist.name;
		}
	};
})(jQuery);