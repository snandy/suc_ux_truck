/*
 *	添加跟随
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var $canvas = $('#innerCanvas'),
	$form = $('#babyapp_addfriends'),
	action = '/a/app/baby/addFriends.ac',
	sending = false,
	toid;

var $submit = $form.find('div.baby-btn-196');


function sendData(){
	sending = true;
	var param = $form.serialize();
	
	$.post(action,param,function(result){
		if(result.code == 0){
			ms.babyapp.loadPage('i',{url:result.data.next});
		}else{
			sending = false;
			if(toid) clearTimeout(toid);
		}
	},'json');
	//5秒延迟，超过5秒没返回，可以再次提交
	toid = setTimeout(function(){
		sending = false;
	},5000);
}


$form.find(':checkbox').attr('checked',true);

$form.find('div.act-add-title :checkbox').click(function(){
	var $this = $(this);
	var cks = $this.closest('div.act-add-title').next('div.act-add-list-wrapper').find(':checkbox');
	if(this.checked){
		cks.attr('checked',this.checked);
	}else{
		cks.attr('checked',this.checked);
	}
});

$form.find('div.act-add-list-wrapper :checkbox').click(function(){
	var $this = $(this);
	var $list = $this.closest('div.act-add-list-wrapper');
	var cksChecked = $list.find(':checkbox:checked');
	var cks = $list.find(':checkbox');
	var ckAll = $list.prev('div.act-add-title').find(':checkbox');
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
.hover(function(){
	if(!sending){
		$(this).addClass('baby-btn-196-hover');
	}
},function(){
	$(this).removeClass('baby-btn-196-hover');
})
.click(function(){
	if(sending){
		return false;
	}
	sendData();
});


})(jQuery,mysohu);