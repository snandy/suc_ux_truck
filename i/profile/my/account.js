/*
 *	档案 空间信息
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var replaceCJK = /[\u2E80-\u9FFF\uF92C-\uFFE5]/g,
	testCJK    = /[\u2E80-\u9FFF\uF92C-\uFFE5]/;

var regFilter = /[<>]+/i;
var regHTML = /<\/?[^<>]+>/i;
var regScript = /<[\s]*?script[^>]*?>[\s\S]*?<[\s]*?\/[\s]*?script[\s]*?>/i;

function cjkLength(strValue){
	return strValue.replace(replaceCJK, "lv").length;
}

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
function showLoading($o){
	clearTipAndError($o);
	var $parent = $o.parent();
	$('<span class="profile-icon"><span class="profile-icon-loading"></span></span>').insertAfter($parent.find(':last-child').prev());
}
function showOk($o){
	clearTipAndError($o);
	var $parent = $o.parent();
	$('<i class="global-icon-right-12">正确</i>').insertAfter($parent.find(':last-child').prev());
}
function clearTipAndError($o){
	if($o.is('input') || $o.is('textarea')){
		$o.removeClass('profile-input-error');
	}
	$o.parent().find('.profile-input-clew,.profile-input-error-clew,.profile-icon,.global-icon-right-12').remove();
}

var domainIsOk = true ,ajaxText = '' ,ajaxData ,isSubmit = false;

var checkForm = {
	ckName: function($form){
		var $o = $form.find('[name=domain]');
		var regx = /^[A-Za-z]+[A-Za-z0-9]*$/;
		var text = $o.val();
		clearTipAndError($o);
		if(text == ''){
			domainIsOk = true;
			return true;
		}
		if(!regx.test(text)){
			showError($o,'仅支持4-16位以英文开头的英文与数字组合');
			return false;
		}else if(cjkLength(text) < 4){
			showError($o,'请填写4位以上的字符');
			return false;
		}else if(cjkLength(text) > 16){
			showError($o,'请不要超过16位字符');
			return false;
		}
		function setResult(result){
			if(result.code == 0){
				domainIsOk = true;
				showOk($o);
			}else{
				domainIsOk = false;
				showError($o,result.msg);
			}
			return domainIsOk;
		}
		if(ajaxText == text){
			return setResult(ajaxData);
		}else{
			ajaxText = text;//记录请求的文本
			domainIsOk = false;//
			showLoading($o);
			$.getJSON('/a/profile/service/checkdomain.htm',{'d':text},function(result){
				ajaxData = result;
				//console.log('isSubmit'+isSubmit);
				if(setResult(result) && isSubmit){
					setTimeout(function(){
						//console.log('timeout submit');
						//alert('timeout submit');
						$form.submit()
					},10);
				}
				isSubmit = false;
			});
		}
		return false;
	},
	ckSpaceName: function($form){
		var $o = $form.find('[name=spaceName]');
		clearTipAndError($o);
		var text = $.trim($o.val());
		$o.val(text);
		if(text == ''){
			return true;
		}
		if(regFilter.test(text) || regHTML.test(text) || regScript.test(text)){
			showError($o,'含有不合适字符');
			return false;
		}
		if(cjkLength(text) > 64){
			showError($o,'请不要超过32个字');
			return false;
		}
		showOk($o);
		return true;
	},
	ckSpaceDesc: function($form){
		var $o = $form.find('[name=spaceDesc]');
		clearTipAndError($o);
		var text = $.trim($o.val());
		$o.val(text);
		if(text == ''){
			return true;
		}
		if(regFilter.test(text) || regHTML.test(text) || regScript.test(text)){
			showError($o,'含有不合适字符');
			return false;
		}
		if(cjkLength(text) > 200){
			showError($o,'请不要超过100个字');
			return false;
		}
		showOk($o);
		return true;
	},
	check: function($form){
		//验证收获人姓名
		var domainVal = $.trim($form.find('[name=domain]').val());
		var spaceNameVal = $.trim($form.find('[name=spaceName]').val());
		var spaceDescVal = $.trim($form.find('[name=spaceDesc]').val());
		if(domainVal == '' && spaceNameVal == '' && spaceDescVal == ''){
			//return false;
		}
		return domainIsOk && this.ckSpaceName($form) && this.ckSpaceDesc($form);
	}
};





$(function(){
	var $form = $('#account');
	
	$form
	.find('[name]')
	.focus(function(){
		var $o = $(this),text = '';
		switch($o.attr('name')){
			case 'domain':
				text = '设定后不可改。仅支持4-16位以英文开头的英文与数字组合';
				break;
			case 'spaceName':
				text = '请不要超过32个字';
				break;
			case 'spaceDesc':
				text = '请不要超过100个字';
				break;
		}
		if(text && !$o.val()){
			showTip($o,text);
		}
	})
	.blur(function(event){
		var $o = $(this)
		switch($o.attr('name')){
			case 'domain':
				checkForm.ckName($form);
				break;
			case 'spaceName':
				checkForm.ckSpaceName($form);
				break;
			case 'spaceDesc':
				checkForm.ckSpaceDesc($form);
				break;
		}
	});
	
	
	var $submit = $form.find(':submit');

	$submit
	.hover(function(){
		$submit.removeClass().addClass('profile-btn-save-set-hover');
	},function(){
		$submit.removeClass().addClass('profile-btn-save-set');
	})
	.mousedown(function(){
		isSubmit = true;
		$submit.removeClass().addClass('profile-btn-save-set-down');
	})
	.mouseup(function(){
		$submit.removeClass().addClass('profile-btn-save-set-hover');
	});
	
	$form.submit(function(){
		if(checkForm.check($form)){
			// update by fjc (2011-07-05)
			$submit.val('正在保存').removeClass().addClass('profile-btn-save-set-disabled').attr('disabled', 'true');
			return true;
		}else{
			return false;
		}
	});
});


})(jQuery);