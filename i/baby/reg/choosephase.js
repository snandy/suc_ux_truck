/*
 *	babyapp-reg 选择阶段
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var $phase = $('div.baby-info-phase').eq(0);
$phase.find('dd').hover(function(){
	this.className = 'hover';
},function(){
	this.className = '';
});



})(jQuery);