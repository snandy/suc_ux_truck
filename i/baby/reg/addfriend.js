/*
 *	babyapp-reg 准妈妈阶段注册
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'babyapp';

var $form = $('#babyappRegForm');
var $submit = $form.find('div.button > span');
var sending = false;//是否在提交数据


//跳转链接
function gotoNext(nextUrl){
	$.appview({
		url: nextUrl,
		method: "get",
		target: "#innerCanvas"
	});
}


//发送数据
function sendData(){
	sending = true;
	var param = $form.serialize();
	
	$.post($form.attr('action'),param,function(result){
		if(result.code == 0){
			gotoNext(result.data.next);
		}else{
			sending = false;
			$submit.removeClass();
		}
	},'json');
	
	$submit.removeClass().addClass('disabled');
}


//init

$form.find(':checkbox').attr('checked',true);

$form.find('div.team-title :checkbox').click(function(){
	var $this = $(this);
	var cks = $this.closest('div.team-title').next('.team-list').find(':checkbox');
	if(this.checked){
		cks.attr('checked',this.checked);
	}else{
		cks.attr('checked',this.checked);
	}
});

$form.find('div.team-list :checkbox').click(function(){
	var $this = $(this);
	var $list = $this.closest('div.team-list');
	var cksChecked = $list.find(':checkbox:checked');
	var cks = $list.find(':checkbox');
	var ckAll = $list.prev('.team-title').find(':checkbox');
	if(cksChecked.length == cks.length){
		ckAll.attr('checked',true);
	}else{
		ckAll.attr('checked',false);
	}
});

$form.submit(function(){
	if(sending){
		return false;
	}
	sendData();
	return false;
});

$submit
	.removeClass()
	.hover(function(){
		if(this.className != 'disabled'){
			this.className = 'hover';
		}
	},function(){
		if(this.className != 'disabled'){
			this.className = '';
		}
	})
	.mousedown(function(){
		if(this.className != 'disabled'){
			this.className = 'down';
		}
	})
	.mouseup(function(){
		if(this.className != 'disabled'){
			this.className = 'hover';
		}
	})
	.click(function(){
		if(sending){
			return false;
		}
		sendData();
	});


})(jQuery);