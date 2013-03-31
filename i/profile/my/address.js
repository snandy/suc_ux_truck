/*
 *	档案 收货地址
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var replaceCJK = /[\u2E80-\u9FFF\uF92C-\uFFE5]/g,
	testCJK    = /[\u2E80-\u9FFF\uF92C-\uFFE5]/;

var regFilter = /[<>]+/i;
var regHTML = /<\/?[^<>]+>/i;
var regScript = /<[\s]*?script[^>]*?>[\s\S]*?<[\s]*?\/[\s]*?script[\s]*?>/i;

var inited = false;

function cjkLength(strValue){
	return strValue.replace(replaceCJK, "lv").length;
}

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

//身份证
function checkdBasicDate(y,m,d){
	y = parseInt(y,10);
	m = parseInt(m,10);
	d = parseInt(d,10);
	var today = new Date();

	if(y<=1700||y>=today.getFullYear()){
		return false;
	}
	if(m<1||m>12){
		return false;
	}
	if(m==1||m==3||m==5||m==7||m==8||m==10||m==12){
		if(d<1||d>31){
			return false;
		}
	}else{
		if(m==4||m==6||m==9||m==11){
			if(d<1||d>30){
				return false;
			}
		}else{
			if(m==2){
				if(y%4==0){
					if(d<1||d>29){
						return false;
					}
				}else{
					if(d<1||d>28){
						return false;
					}
				}
			}
		}
	}
	return true;
}
function checkPersonlaIDValid(date){
	var id18=/^\d{17}[X0-9]$/;
	var id15=/^\d{15}$/;
	if(date!=null&&(id18.test(date)||id15.test(date))){
		var y,m,d;
		if(date.length==15){
			y="19"+date.substr(6,2);
			m=date.substr(8,2);
			d=date.substr(10,2)
		}else{
			if(date.length==18){
				y=date.substr(6,4);
				m=date.substr(10,2);
				d=date.substr(12,2)
			}
		}
		return checkdBasicDate(y,m,d)
	}
	return false
}

function showTip($o,text){
	clearTipAndError($o);
	var $parent = $o.parent();
	$parent.find('.profile-input-clew,.profile-input-error-clew').remove();
	$('<span class="profile-input-clew"><em>'+text+'</em></span>').insertAfter($o);
}

function showError($o,text,doFocus){
	clearTipAndError($o);
	if($o.is('input') || $o.is('textarea')){
		$o.addClass('profile-input-error');
		if(doFocus){
			$o.focus();
		}
	}
	var $parent = $o.parent();
	$parent.find('.profile-input-clew,.profile-input-error-clew').remove();
	$('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>'+text+'</em></span>').insertAfter($o);
	
}

function showOk($o){
	clearTipAndError($o);
	var $parent = $o.parent();
	$('<i class="global-icon-right-12">正确</i>').insertAfter($o);
}

function clearTipAndError($o){
	if($o.is('input') || $o.is('textarea')){
		$o.removeClass('profile-input-error');
	}
	$o.parent().find('.profile-input-clew,.profile-input-error-clew,.profile-icon,.global-icon-right-12').remove();
}

var checkForm = {
	ckName: function($form,doFocus){
		var $o = $form.find('[name=name]');
		var regx = /^(?:(?:[A-Za-z]+)|(?:[\u2E80-\u9FFF\uF92C-\uFFE5]+))$/;
		var text = $o.val();
		clearTipAndError($o);
		if(text == '' || !regx.test(text) || (cjkLength(text) < 4) || (cjkLength(text) > 20)){
			showError($o,'请输入真实的收货人姓名',doFocus);
			return false;
		}
		showOk($o);
		return true;
	},
	ckCardnum: function($form,doFocus){
		var type = $form.find('[name=cardtype]').val();
		var $o = $form.find('[name=cardnum]');
		var regx = /^[A-Za-z0-9]{3,20}$/;
		var text = $o.val();
		clearTipAndError($o);
		if(type == '1'){
			//身份证
			if(!checkPersonlaIDValid(text)){
				showError($o,'请输入正确的证件号码',doFocus);
				return false;
			}
		}else{
			if(!regx.test(text)){
				showError($o,'请输入正确的证件号码',doFocus);
				return false;
			}
		}
		showOk($o);
		return true;
	},
	ckArea: function($form,doFocus){
		var $p = $form.find('[name=province]');
		var $c = $form.find('[name=city]');
		clearTipAndError($c);
		if($p.val() == ''){
			showError($c,'请选择省份');
			return false;
		}else if($c.val() == ''){
			showError($c,'请选择城市');
			return false;
		}
		showOk($c);
		return true;
	},
	ckFullAddress: function($form,doFocus){
		var $o = $form.find('[name=fulladdress]');
		var len = cjkLength($o.val());
		var text = $.trim($o.val());
		clearTipAndError($o);
		if(text == ''){
			$o.val('');
			showError($o,'请输入详细地址',doFocus);
			return false;
		}else if(len < 10 || len > 120){
			showError($o,'请输入5-60个字的详细地址',doFocus);
			return false;
		}else if(regFilter.test(text) || regHTML.test(text) || regScript.test(text)){
			showError($o,'含有不合适字符',doFocus);
			return false;
		}
		showOk($o);
		return true;
	},
	ckZipcode: function($form,doFocus){
		var area = $form.find('[name=province]').val();
		var $o = $form.find('[name=zipcode]');
		var regx = /^\d{6}$/;
		clearTipAndError($o);
		if(area == '24' || area == '33' || area == '34' || area == '35'){
			return true;
		}
		if($.trim($o.val()) == ''){
			$o.val('');
			showError($o,'请输入邮政编码',doFocus);
			return false;
		}else if(!regx.test($o.val())){
			showError($o,'请输入6位邮政编码',doFocus);
			return false;
		}
		showOk($o);
		return true;
	},
	ckMobile: function($form,doFocus){
		var $o = $form.find('[name=mobile]');
		var regx = /^\d{0,15}$/;
		clearTipAndError($o);
		if($o.val() == ''){
			return true;
		}
		if($o.val() != '' && !regx.test($o.val())){
			showError($o,'手机号码格式不对',doFocus);
			return false;
		}
		showOk($o);
		return true;
	},
	check: function($form){
		//验证收获人姓名
		return this.ckName($form,true) && this.ckCardnum($form,true) && this.ckArea($form) && this.ckFullAddress($form,true) && this.ckZipcode($form,true) && this.ckMobile($form,true);
	}
};





$(function(){
	var $form = $('#address');
	buildSelect($form.find('[name=province]'),ms.area.province);
	$form.find('[name=province]').change(function(){
		buildSelect($form.find('[name=city]'),ms.area.city[$(this).val()]);
		if(inited){
			checkForm.ckArea($form);
		}
	}).change();
	
	$form.find('[name=city]').change(function(){
		if(inited){
			checkForm.ckArea($form);
		}
	});

	$form.find('[name=cardtype]').change(function(){
		checkForm.ckCardnum($form);
	});

	$form
	.find('[name]')
	.focus(function(){
		var $o = $(this),text = '';
		switch($o.attr('name')){
			case 'name':
				text = '请填写真实姓名，方便我们联系你。你的资料不会透露给任何人';
				break;
			case 'cardnum':
				text = '请填写真实的证件号码';
				break;
			case 'fulladdress':
				text = '请填写详细街道名、小区名等，60字以内';
				break;
			case 'zipcode':
				text = '大陆以外地区可不填写';
				break;
			case 'mobile':
				text = '请填写手机号码';
				break;
			case 'landphone':
				text = '格式请参考010-80000000';
				break;

		}
		if(text && !$o.val()){
			showTip($o,text);
		}
	})
	.blur(function(){
		var $o = $(this)
		switch($o.attr('name')){
			case 'name':
				checkForm.ckName($form);
				break;
			case 'cardnum':
				checkForm.ckCardnum($form);
				break;
			case 'fulladdress':
				checkForm.ckFullAddress($form);
				break;
			case 'zipcode':
				checkForm.ckZipcode($form);
				break;
			case 'mobile':
				checkForm.ckMobile($form);
				break;
			case 'landphone':
				clearTipAndError($o);
				break;

		}
	});

	var $submit = $form.find(':submit');
	/*
	$submit
	.hover(function(){
		$submit.removeClass().addClass('profile-btn-save-set-hover');
	},function(){
		$submit.removeClass().addClass('profile-btn-save-set');
	})
	.mousedown(function(){
		$submit.removeClass().addClass('profile-btn-save-set-down');
	})
	.mouseup(function(){
		$submit.removeClass().addClass('profile-btn-save-set-hover');
	});
	*/
	$form.submit(function(){
		var $mobile = $form.find('[name=mobile]');
		var $phone = $form.find('[name=landphone]');
		if(checkForm.check($form)){
			if($.trim($mobile.val()) == '' && $.trim($phone.val()) == ''){
				$.alert({
					content: '<div class="profile-win-clew"><div class="boxH"><p>手机号码与固定电话需选填一项</p></div></div>',
					onClose: function(){
						$mobile.focus();
					}
				});
				return false;
			}
		}else{
			return false;
		}
		// update by fjc (2011-07-05)
		$submit.val('正在保存').removeClass('ui-btn-current ui-btn-active').addClass('ui-btn-disabled').attr('disabled', 'true');
	});
	
	setTimeout(function(){
		$('div.user-me-head').next('.profile-succeed-clew').slideUp('normal');
	},3000);

	inited = true;
});


})(jQuery,MYSOHU);