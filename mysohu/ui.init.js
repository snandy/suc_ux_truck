/*
 * mysohu v1.0 
 * 按钮，分页行为初始化 */

;(function($) {

$(function(){

//begin

//用于closest方式的mouseover和mouseout事件
function within(event, callback) {
	var $this = this;
	var parent = event.relatedTarget;
	var el = $this.get(0);
	try {
		while (parent && parent !== el) {
			parent = parent.parentNode;
		}
		if (parent !== el) {
			callback();
		}
	} catch(e) {}
};

var ns = '.mysohu',
	btnSelector = '.ui-btn,.ui-btn-w60,.ui-btn-w80,.ui-btn-w100';

$(document)
.delegate(btnSelector, 'mouseenter' + ns, function(event){
	var $target = $(this);
	if(!$target.hasClass('ui-btn-disabled')){
		$target.removeClass('ui-btn-current').addClass('ui-btn-active');
	}
})
.delegate('span.page-num', 'mouseenter' + ns, function(event){
	$(this).addClass('page-num-active').find('>p').show();
})
.delegate(btnSelector, 'mouseleave' + ns, function(event){
	var $target = $(this);
	if(!$target.hasClass('ui-btn-disabled')){
		$target.removeClass('ui-btn-current ui-btn-active');
	}
})
.delegate('span.page-num', 'mouseleave' + ns, function(event){
	$(this).removeClass('page-num-active').find('>p').hide();
});


// IE中清除虚线轮廓
$('.tabs-menu li>a').bind('focus' + ns, function(e){
	this.blur();
});
//end
});
		
})(jQuery);
