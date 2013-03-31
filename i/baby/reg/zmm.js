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

//预产期计算
var start = new Date();//下限是当前日期
var end = new Date(start.getFullYear(),start.getMonth() + 10,1);//上限是十个月后
function getDaysInMonth(year,month){
	return 32 - new Date(year, month, 32).getDate();
}
function dueDateYear(){
	var select = $form.find('select[name=expected_born_year]');
	var value = select.attr('data-default-value') ? select.attr('data-default-value') : '';
	select.attr('data-default-value','');
	if(value == 1970){
		is1970 = true;
	}
	select[0].options.length = 1;
	for(var i = end.getFullYear() ,len = start.getFullYear(); i >= len ;i -= 1){
		var option = document.createElement('option');
		option.text = i;
		option.value = i;
		if(i == value && !is1970){
			option.selected = 'selected';
		}
		select[0].options.add(option);
	}
	
}
function dueDateMonth(year){
	var select = $form.find('select[name=expected_born_month]');
	select[0].options.length = 1;
	if(!year){
		return;
	}
	var value = select.attr('data-default-value') ? select.attr('data-default-value') : '';
	select.attr('data-default-value','');
	var sMonth,eMonth;
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
		var option = document.createElement('option');
		option.text = i;
		option.value = i;
		if(i == value && !is1970){
			option.selected = 'selected';
		}
		select[0].options.add(option);
	}
	
}

function dueDateDay(year,month){
	var select = $form.find('select[name=expected_born_date]');
	select[0].options.length = 1;
	if(!year || !month){
		return;
	}
	var value = select.attr('data-default-value') ? select.attr('data-default-value') : '';
	select.attr('data-default-value','');
	var sDay;
	month -= 1;
	var daysInMonth = getDaysInMonth(year,month);
	if(year == start.getFullYear() && month == start.getMonth()){
		sDay = start.getDate();
	}else{
		sDay = 1;
	}
	
	for(var i = sDay; i <= daysInMonth ;i += 1){
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

	var $year = $form.find('select[name=expected_born_year]');
	var $month = $form.find('select[name=expected_born_month]');
	var $day = $form.find('select[name=expected_born_date]');
	var $province = $form.find('select[name=baby_province]');
	
	//必填
	if($year.val() == '' || $month.val() == '' || $day.val() == ''){
		tips.error($year,'请选择您的预产日期');
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
dueDateYear();
$form.find('select[name=expected_born_year]').change(function(){
		dueDateMonth($(this).val());
		dueDateDay();
	}).change();
$form.find('select[name=expected_born_month]').change(function(){
		dueDateDay($form.find('select[name=expected_born_year]').val(),$(this).val());
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