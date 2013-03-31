/*
 *	babyapp-reg 选择阶段
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var $canvas = $('#innerCanvas'),
	$submit = $canvas.find('div.baby-btn-114'),
	$lis = $canvas.find('ul.act-select > li'),
	$actTop = $canvas.find('div.act-top'),
	$cur = $lis.filter('.selected');

//清理之前页面可能存在的对话框
ms.babyapp.dialog.clear();


$actTop.attr('class','act-top baby-s' + ($lis.index($cur) + 1));


$lis.find('> div')
.hover(function(){
	var $this = $(this).parent();
	if(!$this.hasClass('selected'))	$this.addClass('hover');
},function(){
	var $this = $(this).parent();
	if(!$this.hasClass('selected')) $this.removeClass('hover');
})
.click(function(){
	var $this = $(this).parent();
	$lis.removeClass();
	$this.removeClass().addClass('selected');
	$actTop.attr('class','act-top baby-s' + ($lis.index($this) + 1));
});

$submit
.hover(function(){
	$(this).addClass('baby-btn-114-hover');
},function(){
	$(this).removeClass('baby-btn-114-hover');
})
.click(function(){
	var $li = $lis.filter('.selected'),
		index = $lis.index($li),
		url = '';
	
	if(index == 0){
		url = '/a/app/baby/forPregnant.ac';
	}
	else if(index == 1){
		url = '/a/app/baby/gravid.ac';
	}
	else if(index == 2){
		url = '/a/app/baby/babyBorn.ac';
	}
	ms.babyapp.loadPage('i',{'url':url});
});


})(jQuery,mysohu);