require(
'core::util::jQuery',
'app::assistant::popup',
function($, Popup) {
	var pic_base = "http://s3.suc.itc.cn/app/assistant/", pic_default = pic_base + 'default.png';
	define(
	'app::assistant::picture',
	function(assistant, aid) {
		var msie6 = /MSIE 6/.test(navigator.userAgent);
		$('#wrapper_' + aid).parent().html('').css({
			cursor : "pointer",
			width : "98px",
			height : "106px",
			background : msie6 ? '' : 'url("' + pic_default + '") no-repeat 0 0',
			filter : msie6 ? "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + pic_default + "')" : ''
		});
		assistant.initPosition();
		var popup = new Popup({
			handle : assistant,
			autoCollapse : false,
			dir : "bottom",
			className : "dot"
		});
		popup.autoPos({
			left : 30
		});
		assistant.$dom
		.bind(
		'mouseover',
		function() {
			popup.destroy();
			popup = new Popup(
			{
				handle : assistant,
				className : 'no-flash',
				content : '<div style="text-align:center"><a target="_blank" href="http://get.adobe.com/cn/flashplayer/"><img src="http://s3.suc.itc.cn/i/home/d/flash-ico.jpg" style="width: 80px"></a></div><div><a href="http://get.adobe.com/cn/flashplayer/" target="_blank">您还没有安装Flash，点击下载，立即体验搜狐助手全部功能！</a></div>'
			});
			popup.autoPos();
		});

	});
});