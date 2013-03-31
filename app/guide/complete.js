/*
成长系统:新用户引导
*/

;
(function($,ms){

var ie6 = $.browser.msie && parseFloat($.browser.version) < 7,
	boxw = 690,
	boxh = 560,
	win = window,
	doc = document,
	userId = $space_config._xpt;


//ie6下垂直水平居中
function ie6Fixed($o,left,top,st){
	$(doc).scrollTop(0);
	$o[0].style.cssText = 'left:'+left+'px;top:'+(top+st)+'px;top:expression(documentElement.scrollTop + ' + top + ' + "px");';
}

var complete = {
	init: function(){
		var self = this;
		this.$box = $('<div class="guide-over"></div>');
		
		this.$box.html(['<a class="close" href="javascript:void(0)"></a>','<a class="btn-help" href="#" target="_blank"></a>','<a class="btn-quest" href="http://i.sohu.com/task/home/listall.htm" target="_blank"></a>','<a class="btn-over" href="javascript:void(0)"></a>'].join(''));

		$('body').append(this.$box);
		
		this.$box.find('a').bind('click',function(){
			self.$box.hide();
			$(win).unbind('resize.newcomercomplete');
		});

		this.adjust();
		$(win).bind('resize.newcomercomplete',function(){
			self.adjust();
		});
		$.cookie('suc_newcomerguide_ic_' + userId,null);
	},
	adjust: function(){
		var self = this,
			$body = $('body'),
			dh = $(doc).height(),
			dw = $(win).width(),
			wh = $(win).height();
		
		var top = (wh - boxh)/2;
		var left = (dw - boxw)/2;
		if(!ie6){
			this.$box.css({
				'left': left >= 0 ? left : 0,
				'top': top < 0 ? 0 : top
			});
		}else{
			ie6Fixed(this.$box,left >= 0 ? left : 0,top < 0 ? 0 : top,$(doc).scrollTop());
		}
	}
};


$(function(){
	complete.init();
});


})(jQuery,mysohu);