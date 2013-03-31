/*
 * 相册上传引导
 * @author yongzhongzhang
 * @refactor kyriosli@sohu-inc.com
 */

require(
'plugins::Template',
'core::util::jQuery',
'core::util::cookie',
'#document',
function(Template, $, cookie) {
	var config = {
		photos_url : '/api/newlist.do',
		photos_warpper : 'div.exhibition-photo',
		size : 4
	};
	var tophoto = {

		templates : {
			item : '{{#data}}<li><div><p><a href="{{{url}}}" title="{{name}}" target="_blank">{{#is_video}}<i class="iMask"><b></b></i>{{/is_video}}</a></p><span><a href="{{{url}}}" target="_blank" ><img src="{{originUrl}}"></a></span></div></li>{{/data}}',
			upload : '<li class="exhibition-add"><div><p><a href="http://i.sohu.com/album/home/photoset/list/"></a></p><span></span></div></li>',
			blank : '<li><div><p><a href="javascript:void(0);"></a></p><span></span></div></li>'
		},

		init : function() {
			$.getJSON(config.photos_url, {
				xpt : $space_config && $space_config._xpt || ''
			}, function(json) {
				var $target = $(config.photos_warpper);
				if (!json) {
					$target.hide();
					return;
				}
				var count = 0, html = '<ul>';

				// 如果数据不为空
				if (json.data) {

					var photos = json.data;

					for(var i = 0; i < photos.length; i++){
						photos[i].is_video = photos[i].type == '1'? true: false;
					}

					html += Template.to_html(tophoto.templates.item, json);
					count += json.data.length;
				}

				// 访问本人展示时显示上传
				if (count < config.size && cookie.isMine) {
					html += tophoto.templates.upload;
					count++;
				}
				if (count == 0) {
					$target.hide();
				} else {
					// 填补占位背景
					for (; count < config.size; count++)
						html += tophoto.templates.blank;
					html += '</ul>';
					$target.html(html);
				}

			});

		},

		helper : ''
	};

	tophoto.init();

});
