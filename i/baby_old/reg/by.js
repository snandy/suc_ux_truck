/*
 *	babyapp-reg 备孕阶段注册
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'babyapp';

var $form = $('#babyappRegForm');
var $submit = $form.find('div.button > span');

var sending = false;//是否在提交数据

var tips = {
	error: function($o,text){
		var $p = $o.closest('div');
		$p.find('span.clew').remove();
		$p.append('<span class="clew error"></span>');
		$p.find('span.clew').html('<em>'+text+'</em>');
	},
	hint: function($o,text){
		var $p = $o.closest('div');
		$p.find('span.clew').remove();
		$p.append('<span class="clew"></span>');
		$p.find('span.clew').html('<em>'+text+'</em>');
	},
	clear: function($o){
		$o.closest('div').find('span.clew').remove();
	}
};

//创建select项
function buildSelect(select,data,value){
	value = value ? value : (select.attr('data-default-value') ? select.attr('data-default-value') : '');
	select.attr('data-default-value','');
	var select = select[0];
	select.options.length = 1;
	for(var id in data){
		var option = document.createElement('option');
		option.text = data[id];
		option.value = id;
		if(id == value){
			option.selected = 'selected';
		}
		select.options.add(option);
	}
}



//检查数据是否合法
function validateData(){
	var focusIt = null;
	var validate = true;
	var $month = $form.find('select[name=perpare_month]');
	var $province = $form.find('select[name=baby_province]');
	
	//必填
	if($month.val() == ''){
		tips.error($month,'请选择您的怀孕计划');
		if(!focusIt){
			focusIt = $month;
		}
		validate = false;
	}else{
		tips.clear($month);
	}
	
	if($province.val() == ''){
		tips.error($province,'请选择您所在的城市');
		if(!focusIt){
			focusIt = $province;
		}
		validate = false;
	}else{
		tips.clear($province);
	}
	
	if(focusIt){
		focusIt.focus();
	}
	return validate;
}

//跳转链接
function gotoNext(nextUrl){
	$.appview({
		url: nextUrl,
		method: "get",
		target: "#innerCanvas"
	});
}

//跳转到出错的字段
function focusErrorElement(name,msg){
	var $elem = $form.find('[name='+name+']');
	$elem.focus();
	tips.error($elem,msg);
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
			if(result.data.name){
				focusErrorElement(result.data.name,result.msg);
			}
		}
	},'json');
	$submit.removeClass().addClass('disabled');
}


//init
buildSelect($form.find('select[name=baby_province]'),$[app].utils.area.provinceMap);
$form.find('select[name=baby_province]').change(function(){
	buildSelect($form.find('select[name=baby_city]'),$[app].utils.area.cityMap[$(this).val()]);
}).change();


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
		if(validateData()){
			sendData();
		}
	});


})(jQuery);