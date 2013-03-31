/*
 *	新用户引导 头像页Flash回调
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,window){

window.iAvatarSaveOkHandler = function(){
	//成功回调
	window.location.href = "http://i.sohu.com";
};

window.iAvatarErrorHandler = function(msg){
	//错误回调
};



})(jQuery,window);