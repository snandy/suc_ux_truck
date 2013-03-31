/*
 *	视频
 *  code by bobotieyang@sohu-inc.com
 */
/*
 * 初始化视频最终页中视频的位置
 *
 */
function resizeSeaLevel() {
		   var _height = $("#header").height() + 40;
		   var _windowtop = $(window).scrollTop();
		   var _xiaobaotao_rourou;
		   setTimeout(function() {
					if (_windowtop < _height) {
							 var _interval = setInterval(function() {
									   _windowtop += 20;
									   if (_windowtop < _height) {
												$(window).scrollTop(_windowtop);
									   } else {
												clearInterval(_interval);
									   }
							 }, 5);
					} else if (_windowtop > _height) {
							 var _interval = setInterval(function() {
									   _windowtop -= 20;
									   if (_windowtop > _height) {
												$(window).scrollTop(_windowtop - 10);
									   } else {
												clearInterval(_interval);
									   }
							 }, 5);
					}
		   }, 600);
 }

;
(function($,ms){


$(function(){
	resizeSeaLevel();
	
	ms.VideoApp.fillCount();
	
	//查看原文
	var $_down = $('i.video-icon-down').attr('title','查看全部'),
		$_up = $('i.video-icon-up').attr('title','收起');
	
	$('.video-info').click(function(event){
		var $target = $(event.target);
		if($target.closest('.delete,.video-delete').length){
			event.preventDefault();
			$target = $target.closest('[data-video-id]');
			ms.VideoApp.delVideo($target.attr('data-video-id'),function(data){
				window.location.href = 'http://i.sohu.com/video/home/list.htm';
			});
		}
		else if($target.closest('i.video-icon-down').length){
			$_down.parent().hide();
			$_up.parent().show();
		}
		else if($target.closest('i.video-icon-up').length){
			$_up.parent().hide();
			$_down.parent().show();
		}
	});

});

})(jQuery,MYSOHU);