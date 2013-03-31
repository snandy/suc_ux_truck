/*
 *	babyapp-reg 家有儿女阶段注册
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'babyapp';

var $form = $('#babyappRegForm');
var $submit = $form.find('div.button > span');
var sending = false;//是否在提交数据
var is1970 = false;

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

//生日
function getDaysInMonth(year,month){
	return 32 - new Date(year, month, 32).getDate();
}
function birthdayYear(){
	var now = new Date();
	var select = $form.find('select[name=baby_birthday_year]');
	var value = select.attr('data-default-value') ? select.attr('data-default-value') : '';
	select.attr('data-default-value','');
	if(value == 1970){
		is1970 = true;
	}
	select[0].options.length = 1;
	for(var i = now.getFullYear() ,len = 2000; i >= len ;i -= 1){
		var option = document.createElement('option');
		if(i == 2000){
			option.text = "2000年及以前";
		}else{
			option.text = i;
		}
		option.value = i;
		if(i == value && !is1970){
			option.selected = 'selected';
		}
		select[0].options.add(option);
	}
	
}
function birthdayMonth(year){
	var select = $form.find('select[name=baby_birthday_month]');
	select[0].options.length = 1;
	if(!year){
		return;
	}
	var value = select.attr('data-default-value') ? select.attr('data-default-value') : '';
	select.attr('data-default-value','');
	for(var i = 1; i <= 12 ;i += 1){
		var option = document.createElement('option');
		option.text = i;
		option.value = i;
		if(i == value && !is1970){
			option.selected = 'selected';
		}
		select[0].options.add(option);
	}
	
}

function birthdayDay(year,month){
	var select = $form.find('select[name=baby_birthday_date]');
	select[0].options.length = 1;
	if(!year || !month){
		return;
	}
	var value = select.attr('data-default-value') ? select.attr('data-default-value') : '';
	select.attr('data-default-value','');
	month -= 1;
	var daysInMonth = getDaysInMonth(year,month);
	for(var i = 1; i <= daysInMonth ;i += 1){
		var option = document.createElement('option');
		option.text = i;
		option.value = i;
		if(i == value && !is1970){
			option.selected = 'selected';
		}
		select[0].options.add(option);
	}
}



//检查数据是否合法
function validateData(){
	var focusIt = null;
	var validate = true;
	var $name = $form.find('input[name=baby_name]');
	var $gender = $form.find('input[name=baby_gender]');
	var $year = $form.find('select[name=baby_birthday_year]');
	var $month = $form.find('select[name=baby_birthday_month]');
	var $day = $form.find('select[name=baby_birthday_date]');
	var $province = $form.find('select[name=baby_province]');
	
	//必填
	if($name.val() == ''){
		tips.error($name,'请填写4-10位字符，限中英文字符');
		if(!focusIt){
			focusIt = $name;
		}
		validate = false;
	}
	else if($[app].utils.cjkLength($name.val()) < 4 || $[app].utils.cjkLength($name.val()) > 10){
		tips.error($name,'填写有误，限4-10位字符');
		if(!focusIt){
			focusIt = $name;
		}
		validate = false;
	}
	else if(!/^[a-z\u4E00-\u9FA5]+$/i.test($name.val())){
		tips.error($name,'填写有误，限中英文字符');
		if(!focusIt){
			focusIt = $name;
		}
		validate = false;
	}else{
		tips.clear($name);
	}
	
	if(!$gender.filter(':checked')[0]){
		tips.error($gender.eq(0),'请选择宝宝性别');
		if(!focusIt){
			focusIt = $gender.eq(0);
		}
		validate = false;
	}else{
		tips.clear($gender.eq(0));
	}

	if($year.val() == '' || $month.val() == '' || $day.val() == ''){
		tips.error($year,'请选择宝宝出生日期');
		if(!focusIt){
			focusIt = $year;
		}
		validate = false;
	}else{
		tips.clear($year);
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
	//选填
	var $height = $form.find('input[name=baby_born_height]');
	if($height.val() != ''){
		if(!/^\d+\.?\d?$/.test($height.val())){
			tips.error($height,'限数字（1位小数）');
			if(!focusIt){
				focusIt = $height;
			}
			validate = false;
		}else{
			var hn = parseFloat($height.val(),10);
			if(hn < 10 || hn > 80){
				tips.error($height,'新生宝宝身长范围10~80cm，平均参考值48.2-52.8cm');
				if(!focusIt){
					focusIt = $height;
				}
				validate = false;
			}else{
				tips.clear($height);
			}
		}
	}else{
		tips.clear($height);
	}
	
	var $weight = $form.find('input[name=baby_born_weight]');
	if($weight.val() != ''){
		if(!/^\d+\.?\d?$/.test($weight.val())){
			tips.error($weight,'限数字（1位小数）');
			if(!focusIt){
				focusIt = $weight;
			}
			validate = false;
		}else{
			var wn = parseFloat($weight.val(),10);
			if(wn < 1 || wn > 10){
				tips.error($weight,'新生宝宝体重范围1~10kg，平均参考值2.9-3.8kg');
				if(!focusIt){
					focusIt = $weight;
				}
				validate = false;
			}else{
				tips.clear($weight);
			}
		}
	}else{
		tips.clear($weight);
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
birthdayYear();
$form.find('select[name=baby_birthday_year]').change(function(){
		birthdayMonth($(this).val());
		birthdayDay();
	}).change();
$form.find('select[name=baby_birthday_month]').change(function(){
		birthdayDay($form.find('select[name=baby_birthday_year]').val(),$(this).val());
	}).change();
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