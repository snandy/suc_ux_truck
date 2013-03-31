/*
 *	备孕
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var $canvas = $('#innerCanvas'),
	$form = $('#babyapp_forPregnant'),
	action = '/a/app/baby/saveForPregnantInfo.ac',
	sending = false,
	toid;


var $submit = $form.find('div.baby-btn-196'),
	$beiyunTime = $form.find('select[name="beiyunTime"]'),
	$provinceId = $form.find('select[name="provinceId"]'),
	$cityId = $form.find('select[name="cityId"]');

if($beiyunTime.attr('data-default-value')){
	$beiyunTime.val($beiyunTime.attr('data-default-value'));
	$beiyunTime.attr('data-default-value','');
}


function validateData(){
	var focusIt = null;
	var validate = true;
	
	//必填
	if($beiyunTime.val() == ''){
		ms.babyapp.reg.errorTip($beiyunTime,'请选择您的怀孕计划');
		if(!focusIt){
			focusIt = $beiyunTime;
		}
		validate = false;
	}else{
		ms.babyapp.reg.clearTip($beiyunTime);
	}
	
	if($provinceId.val() == ''){
		ms.babyapp.reg.errorTip($provinceId,'请选择您所在的城市');
		if(!focusIt){
			focusIt = $provinceId;
		}
		validate = false;
	}else{
		ms.babyapp.reg.clearTip($provinceId);
	}
	
	if(focusIt){
		focusIt.focus();
	}
	return validate;
}

function sendData(){
	sending = true;
	var param = $form.serialize();
	
	$.post(action,param,function(result){
		if(result.code == 0){
			ms.babyapp.loadPage('i',{url:result.data.next});
		}else{
			sending = false;
			if(toid) clearTimeout(toid);
			if(result.data.name){
				ms.babyapp.reg.errorTip($form.find('[name="'+result.data.name+'"]').eq(0),result.msg);
			}
		}
	},'json');
	//5秒延迟，超过5秒没返回，可以再次提交
	toid = setTimeout(function(){
		sending = false;
	},5000);
}

ms.babyapp.reg.buildSelect($provinceId,ms.area.province);
$provinceId.change(function(){
	ms.babyapp.reg.buildSelect($cityId,ms.area.city[$(this).val()]);
}).change();

ms.babyapp.reg.tip($beiyunTime,'备孕即您计划怀孕的时段');

$form.submit(function(){
	if(sending){
		return false;
	}
	if(validateData()){
		sendData();
	}
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
	if(validateData()){
		sendData();
	}
});



})(jQuery,mysohu);