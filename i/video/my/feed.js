/*
 *	视频 feed页
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){


$(function(){
	
	ms.VideoApp.sohuHD($('#uploadVideoBox'),{
		onUploadComplete: function(vid){
			//用vid 视频id来处理			
		},
		onCompleteAndSaved: function(vid){
			window.location.href = '/video/home/list.htm#upload=1';
		}
	});

});

})(jQuery,MYSOHU);