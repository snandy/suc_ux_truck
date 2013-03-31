/*
 *	准妈妈
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var $canvas = $('#innerCanvas'),
	$form = $('#babyapp_gravid'),
	action = '/a/app/baby/saveGravidInfo.ac',
	sending = false,
	toid;

var $submit = $form.find('div.baby-btn-196'),
	$year = $form.find('select[name="year"]'),
	$month = $form.find('select[name="month"]'),
	$day = $form.find('select[name="day"]'),
	$provinceId = $form.find('select[name="provinceId"]'),
	$cityId = $form.find('select[name="cityId"]');


//预产期计算
var start = new Date();//下限是当前日期
var end = new Date(start.getFullYear(),start.getMonth() + 10,1);//上限是十个月后
function getDaysInMonth(year,month){
	return 32 - new Date(year, month, 32).getDate();
}

function dueDateYear(){
	var arr = [];
	for(var i = end.getFullYear() ,len = start.getFullYear(); i >= len ;i -= 1){
		arr.push(i);
	}
	ms.babyapp.reg.buildSelect($year,arr);
}

function dueDateMonth(year){
	$month[0].options.length = 1;
	if(!year){
		return;
	}
	var sMonth,eMonth,arr = [];
	if(year == start.getFullYear()){
		sMonth = start.getMonth() + 1;
		eMonth = 12;
	}
	else if(year == end.getFullYear()){
		sMonth = 1;
		eMonth = end.getMonth() + 1;
	}
	else{
		sMonth = 1;
		eMonth = 12;
	}
	
	for(var i = sMonth; i <= eMonth ;i += 1){
		arr.push(i);
	}
	ms.babyapp.reg.buildSelect($month,arr);
}

function dueDateDay(year,month){
	$day[0].options.length = 1;
	if(!year || !month){
		return;
	}
	
	var sDay,arr = [];
	month -= 1;
	var daysInMonth = getDaysInMonth(year,month);
	if(year == start.getFullYear() && month == start.getMonth()){
		sDay = start.getDate();
	}else{
		sDay = 1;
	}
	
	for(var i = sDay; i <= daysInMonth ;i += 1){
		arr.push(i);
	}

	ms.babyapp.reg.buildSelect($day,arr);
}


function validateData(){
	var focusIt = null;
	var validate = true;
	
	//必填
	if($year.val() == '' || $month.val() == '' || $day.val() == ''){
		ms.babyapp.reg.errorTip($year,'请选择您的预产日期');
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

dueDateYear();
$year.change(function(){
	dueDateMonth($(this).val());
	dueDateDay();
}).change();
$month.change(function(){
	dueDateDay($year.val(),$(this).val());
}).change();


ms.babyapp.reg.buildSelect($provinceId,ms.area.province);

$provinceId.change(function(){
	ms.babyapp.reg.buildSelect($cityId,ms.area.city[$(this).val()]);
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