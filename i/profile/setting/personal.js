/*
* 系统设置
*
*/
;(function($,ms) {

var locationHref = window.location.href;

function showTip($o,text){
	clearTipAndError($o);
	var $parent = $o.parent();
	$('<span class="profile-input-clew"><em>'+text+'</em></span>').insertAfter($parent.find(':last-child').prev());
}

function showError($o,text){
	clearTipAndError($o);
	if($o.is('input') || $o.is('textarea')){
		$o.addClass('profile-input-error');
	}
	var $parent = $o.parent();
	$('<span class="profile-input-error-clew"><em><i class="global-icon-error-12">错误</i>'+text+'</em></span>').insertAfter($parent.find(':last-child').prev());
}

function clearTipAndError($o){
	if($o.is('input') || $o.is('textarea')){
		$o.removeClass('profile-input-error');
	}
	$o.parent().find('.profile-input-clew,.profile-input-error-clew,.profile-icon,.global-icon-right-12').remove();
}

function checkDomain($o){
	var regx = /^[A-Za-z]+[A-Za-z0-9]*$/,
		text = $o.val();
	if(!regx.test(text)){
		showError($o,'仅支持4-16位以英文开头的英文与数字组合');
		return false;
	}else if(text.length < 4){
		showError($o,'请填写4位以上的字符');
		return false;
	}else if(text.length > 16){
		showError($o,'请不要超过16位字符');
		return false;
	}
	return true;
}

function sendDomain($form){
	var url = '/a/setting/domain/set',
		$domain = $form.find('[name=domain]'),
		domain = $domain.val();
	
	$form.find(':submit').val('正在保存').removeClass('ui-btn-current ui-btn-active').addClass('ui-btn-disabled').attr('disabled', true);

	$.getJSON(url,{
		'domain': domain
	},function(results){
		if(results.code == 0){
			//成功
			window.location.href = locationHref;
		}else{
			//失败
			showError($domain,results.msg);
		}
		$form.find(':submit').val('保存设置').removeClass('ui-btn-disabled').attr('disabled', false);
	});
	
}

$(function(){

var $form = $('#setting_form');
var $domain = $form.find('[name=domain]');
clearTipAndError($domain);
$domain.focus(function(){
	showTip($domain,'设定后不可改。仅支持4-16位以英文开头的英文与数字组合');
	this.select();
});


$form.submit(function(){
	if(checkDomain($domain)){
		sendDomain($form);
	}

	return false;
});

});




})(jQuery,MYSOHU);