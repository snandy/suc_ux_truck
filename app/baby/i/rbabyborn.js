/*
 *	家有儿女
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var $canvas = $('#innerCanvas'),
	$form = $('#babyapp_babyBorn'),
	action = '/a/app/baby/saveBabyBornInfo.ac',
	sending = false,
	toid;

var $submit = $form.find('div.baby-btn-196'),
	$babyName = $form.find('input[name="babyName"]'),
	$babyBornHeight = $form.find('input[name="babyBornHeight"]'),
	$babyBornWeight = $form.find('input[name="babyBornWeight"]'),
	$year = $form.find('select[name="year"]'),
	$month = $form.find('select[name="month"]'),
	$day = $form.find('select[name="day"]'),
	$provinceId = $form.find('select[name="provinceId"]'),
	$cityId = $form.find('select[name="cityId"]');






//生日
var limitDate = new Date(),
	limitYear = limitDate.getFullYear(),
	limitMonth = limitDate.getMonth(),
	limitDay = limitDate.getDate();//生日为上限为当天
function getDaysInMonth(year,month){
	return 32 - new Date(year, month, 32).getDate();
}
function birthdayYear(){
	var now = new Date(),
		value = $year.attr('data-default-value') ? $year.attr('data-default-value') : '';

	$year.attr('data-default-value','');
	
	$year[0].options.length = 1;
	for(var i = now.getFullYear() ,len = 2000; i >= len ;i -= 1){
		var option = document.createElement('option');
		if(i == 2000){
			option.text = "2000年及以前";
		}else{
			option.text = i;
		}
		option.value = i;
		$year[0].options.add(option);
	}
	$year.val(value);
	
}

function birthdayMonth(year){
	
	$month[0].options.length = 1;
	if(!year){
		return;
	}
	var arr = [];
	for(var i = 1; i <= 12 ;i += 1){
		if(year == limitYear && i > (limitMonth+1)){
			break;
		}
		arr.push(i);
	}

	ms.babyapp.reg.buildSelect($month,arr);
}

function birthdayDay(year,month){
	
	$day[0].options.length = 1;
	if(!year || !month){
		return;
	}
	var arr = [];
	month -= 1;
	var daysInMonth = getDaysInMonth(year,month);
	for(var i = 1; i <= daysInMonth ;i += 1){
		if(year == limitYear && month == limitMonth && i > limitDay){
			break;
		}
		arr.push(i);
	}

	ms.babyapp.reg.buildSelect($day,arr);
}

//检查数据是否合法
function validateData(){
	var focusIt = null;
	var validate = true;
	
	var $gender = $form.find('input[name="babyGender"]');
	
	
	//必填
	var name = $.trim($babyName.val());
	$babyName.val(name);

	if(name == ''){
		ms.babyapp.reg.errorTip($babyName,'请填写4-10位字符，限中英文字符');
		if(!focusIt){
			focusIt = $babyName;
		}
		validate = false;
	}
	else if(ms.babyapp.utils.cjkLength(name) < 4 || ms.babyapp.utils.cjkLength(name) > 10){
		ms.babyapp.reg.errorTip($babyName,'填写有误，限4-10位字符');
		if(!focusIt){
			focusIt = $babyName;
		}
		validate = false;
	}
	else if(!/^[a-z\u4E00-\u9FA5]+$/i.test(name)){
		ms.babyapp.reg.errorTip($babyName,'填写有误，限中英文字符');
		if(!focusIt){
			focusIt = $babyName;
		}
		validate = false;
	}else{
		ms.babyapp.reg.clearTip($babyName);
	}
	
	if(!$gender.filter(':checked').length){
		ms.babyapp.reg.errorTip($gender.eq(0),'请选择宝宝性别');
		if(!focusIt){
			focusIt = $gender.eq(0);
		}
		validate = false;
	}else{
		ms.babyapp.reg.clearTip($gender.eq(0));
	}

	if($year.val() == '' || $month.val() == '' || $day.val() == ''){
		ms.babyapp.reg.errorTip($year,'请选择宝宝出生日期');
		if(!focusIt){
			focusIt = $year;
		}
		validate = false;
	}else{
		ms.babyapp.reg.clearTip($year);
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
	//选填
	var height = $.trim($babyBornHeight.val());
	$babyBornHeight.val(height);
	if(height != ''){
		if(!/^\d+\.?\d?$/.test(height)){
			ms.babyapp.reg.errorTip($babyBornHeight,'限数字（1位小数）');
			if(!focusIt){
				focusIt = $babyBornHeight;
			}
			validate = false;
		}else{
			var hn = parseFloat(height,10);
			if(hn < 1 || hn > 200){
				ms.babyapp.reg.errorTip($babyBornHeight,'不在正常数值范围内');
				if(!focusIt){
					focusIt = $babyBornHeight;
				}
				validate = false;
			}else{
				ms.babyapp.reg.clearTip($babyBornHeight);
			}
		}
	}else{
		ms.babyapp.reg.clearTip($babyBornHeight);
	}
	
	var weight = $.trim($babyBornWeight.val());
	$babyBornWeight.val(weight);
	if(weight != ''){
		if(!/^\d+\.?\d?$/.test(weight)){
			ms.babyapp.reg.errorTip($babyBornWeight,'限数字（1位小数）');
			if(!focusIt){
				focusIt = $babyBornWeight;
			}
			validate = false;
		}else{
			var wn = parseFloat(weight,10);
			if(wn < 1 || wn > 100){
				ms.babyapp.reg.errorTip($babyBornWeight,'不在正常数值范围内');
				if(!focusIt){
					focusIt = $babyBornWeight;
				}
				validate = false;
			}else{
				ms.babyapp.reg.clearTip($babyBornWeight);
			}
		}
	}else{
		ms.babyapp.reg.clearTip($babyBornWeight);
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

birthdayYear();
$year.change(function(){
	birthdayMonth($(this).val());
	birthdayDay();
}).change();
$month.change(function(){
	birthdayDay($year.val(),$(this).val());
}).change();


ms.babyapp.reg.buildSelect($provinceId,ms.area.province);

$provinceId.change(function(){
	ms.babyapp.reg.buildSelect($cityId,ms.area.city[$(this).val()]);
}).change();

ms.babyapp.reg.tip($babyName,'请填写4-10位字符，限中英文字符');
ms.babyapp.reg.tip($babyBornHeight,'限数字（1位小数），允许范围1~200cm');
ms.babyapp.reg.tip($babyBornWeight,'限数字（1位小数），允许范围1~100kg');

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