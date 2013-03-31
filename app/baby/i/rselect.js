/*
 *	babyapp-reg 选择阶段
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var $canvas = $('#innerCanvas');


$canvas.find('ul.act-select > li > div')
.hover(function(){
	var $this = $(this);
	$this.parent().addClass('hover');
},function(){
	var $this = $(this);
	$this.parent().removeClass('hover');
})
.click(function(){
	var $this = $(this);
	//备孕
	if($this.hasClass('con-s1')){
		ms.babyapp.loadPage('i',{url:'/a/app/baby/forPregnant.ac'});
	}
	//准妈妈
	else if($this.hasClass('con-s2')){
		ms.babyapp.loadPage('i',{url:'/a/app/baby/gravid.ac'});
	}
	//家有儿女
	else if($this.hasClass('con-s3')){
		ms.babyapp.loadPage('i',{url:'/a/app/baby/babyBorn.ac'});
	}
});




})(jQuery,mysohu);