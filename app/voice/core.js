/*
 *	中国好声音
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){
var win = window,
	ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

var replaceCJK = /[^\x00-\xff]/g,
	testCJK    = /[^\x00-\xff]/;

//中国好声音应用的命名空间
var voiceofchina = {
	utils: {
		cjkLength: function(strValue){
			return strValue.replace(replaceCJK, "lv").length;
		},
		isCjk: function(strValue){
			return testCJK.test(strValue);
		},
		cutString: function(str,len,suffix,slen){
			suffix = suffix || '';
			slen = slen || suffix.length;
			if(str.length > len){
				str = str.substr(0,len - slen) + suffix;
			}
			return str;
		},
		cutCjkString: function(str,len,suffix,slen){
			suffix = suffix || '';
			slen = slen || suffix.length;
			len -= slen;
			if(this.cjkLength(str) <= len){
				return str;
			}
			var s = str.split(''),c = 0,tmpA = [];
			for(var i=0;i<s.length;i+=1){
				if(c < len){
					tmpA[tmpA.length] = s[i];
				}
				if(this.isCjk(s[i])){
					c += 2;
				}else{
					c += 1;
				}
			}
			return tmpA.join('') + suffix;
		}
	}

};

voiceofchina.regMobilephoneDlg = function(callback){
	// create a dialog
	var $dialog = $.dialog({
		title: false,
		content: '<div title="关闭" class="dialog-button-close" tabindex="0"></div><div class="login-from"></div>',
		contentWidth: 400,
		contentHeight: 200
	});

	var html = [
	'<h4 class="c-title">请输入手机号码，支持喜爱的选手，验证后每天可支持3次</h4>',
	'<div class="error"></div>',
	'<div class="cell">',
		'<label class="lab" for="mobile-id">手机号码</label>',
		'<span class="border"><input type="text" class="mobile"></span>',
		'<i class="img-ok" style="display:none"></i>',
	'</div>',
	'<div class="cell">',
		'<label for="verification" class="lab">验证码</label>',
		'<span class="border"><input type="text" class="verification"></span>',
		'<span class="border no-border"><input type="button" value="免费获取验证码" class="btn-verification"></span>',
	'</div>',
	'<div class="cell">',
		'<label class="lab"></label>',
		'<input class="submit" type="button" value="提交" />',
	'</div>'
	].join('');

	var $loginForm = $dialog.find('div.login-from');
	$loginForm.html(html);
	$("input.submit", $dialog).iButton();

	//获取元素
	var $mobile = $loginForm.find('input.mobile'),
		$verification = $loginForm.find('input.verification'),
		$btnVerification = $loginForm.find('input.btn-verification'),
		$submit = $loginForm.find('.submit');
	//检验
	function errorMsg(text,noicon){
		$loginForm.find('div.error').html(text ? ((!noicon ? '<i class="img-error"></i> ' : '') + text) : '');
	}

	function checkMobile(){
		//检查手机号
		if(/^\d{11}$/.test($mobile.val())){
			errorMsg('');
			$loginForm.find('i.img-ok').show();
			return true;
		}else{
			errorMsg('请填写11位手机号码');
			$loginForm.find('i.img-ok').hide();
			return false;
		}
	}
	//绑定事件
	var gcbTid;
	function disableGetCodeButton(){
		var time = 60;
		
		//$btnVerification.data('isDisabled',true);
		$btnVerification.addClass('disabled').prop('disabled',true).val('重新获取('+(time--)+'秒)');
		$mobile.prop('disabled',true);

		gcbTid = setInterval(function(){
			if(time > 0){
				$btnVerification.addClass('disabled').prop('disabled',true).val('重新获取('+(time--)+'秒)');
			}else{
				enableGetCodeButton();
			}
		},1000);
	}
	function enableGetCodeButton(){
		if(gcbTid){
			clearInterval(gcbTid);
			gcbTid = null;
		}
		$btnVerification.removeClass('disabled').prop('disabled',false).val('免费获取验证码');
		//$btnVerification.removeData('isDisabled');
		$mobile.prop('disabled',false);
	}
	$mobile.blur(checkMobile);
	$btnVerification.click(function(){
		if(checkMobile()){
			disableGetCodeButton();
			$.post('/a/voice/vote/message',{phone: $mobile.val()},function(results){
				if(results.code == 0){
					errorMsg('验证码已发送至您的手机',true);
					$verification.focus();
				}else{
					errorMsg(results.msg);
					enableGetCodeButton();
				}
			},'json');
		}
	});
	$submit.click(function(){
		if(!checkMobile()){
			return;
		}
		if(!/^\d{6}$/.test($verification.val())){
			errorMsg('您输入的验证码有误，请检查后重新填写');
			return;
		}
		errorMsg('');
		$.post('/a/voice/vote/check-message',{phone: $mobile.val(),message: $verification.val()},function(results){
			if(results.code == 0){
				enableGetCodeButton();
				$dialog.close();
				if($.isFunction(callback)) callback();
			}else{
				errorMsg(results.msg);
			}
		},'json');
	});
	$mobile.focus();
};

function login(callback){
	if(!$.cookie("ppinf")) {
		if(!$.ppDialog) {
			location.href="http://i.sohu.com";
		}else{
			$.ppDialog({
				appId : '1019',
				regRedirectUrl : location.href,
				title : '想要查看更多精彩内容，马上登录吧！',
				onLogin : function(userId) {
					//location.reload();
					if($.isFunction(callback)) callback();
				}
			});
		}
		return false;
	}
	return true;
}

voiceofchina.vote = {
	postVote: function(uid,callback, is_check){
        var tag = is_check? 1: 0;

        $.ajax({
            type: 'GET',
            url: 'http://poll.hd.sohu.com/poll/w/spYQNq0GELTeDL3h.jsonp?i=' + uid + '&a=' + tag + '&callback=?',
            dataType: 'jsonp',
            scriptCharset: 'UTF-8',
            success: function(json){
                callback(json);
            },
            error: function(jqXHR, textStatus, errorThrown) {
            }
        });
    },
    _doVote: function(uid,callback){
        var self = this;
        /*
        this.postVote(uid,function(json){
        	//奇葩接口
        	//读取是否有资格投票时，要根据返回的408错误码
        	//在分析message节点
        	//呵呵
            if(json.status == '408'){
                if(/^601/.test(json.message)){
                    self.postVote(uid,function(json){
                        if(json.status == '200'){
                            callback(json);
                        }
                    }, true);
                }else{
                    $.inform({
                        icon: 'icon-error',
                        delay: 3000,
                        easyClose: true,
                        content: '很抱歉，您今天已经投了3票，明天再来继续支持喜欢的选手',
                        onClose: function(){}
                    }); 
                }
            }else{
                //error
            }
        });
		*/
		//新接口
		$.ajax({
            type: 'GET',
            url: 'http://voice.tv.sohu.com/vote/add.jsonp?callback=?',
            data: {
            	itemId: uid
            },
            dataType: 'jsonp',
            scriptCharset: 'UTF-8',
            success: function(json){
            	if(json.status == 200){
            		callback(json);
            	}
            	else {
            		var errorMsg = '';
            		if(json.status == 408){
            			errorMsg = '很抱歉，您今天已经投了3票，明天再来继续支持喜欢的选手';
            		}
            		else{
            			errorMsg = '投票失败，请稍后再试（' + json.status + '）';
            		}

            		$.inform({
                        icon: 'icon-error',
                        delay: 3000,
                        easyClose: true,
                        content: errorMsg
                    });
            	}
            }
        });
    },
    doVote: function(uid,callback){
    	var self = this;
    	function doIt(){
    		$.post('/a/voice/vote/check-band',function(results){
	    		if(results.code == 0){
	    			self._doVote(uid,callback);
	    		}else{
	    			voiceofchina.regMobilephoneDlg(function(){
	    				self._doVote(uid,callback);
	    			});
	    		}
	    	},'json');
    	}
    	if(!login(doIt)){
    		return;
    	}
    	doIt();
    }
};

voiceofchina.share = function(channel,title,url){
	title = encodeURIComponent(title);
	url = encodeURIComponent(url);
	switch (channel) {
		case 'qqzone':
			var sharetring='http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title='+title+'&url='+url+'&desc=&summary='+title+'&site=';  
			window.open(sharetring,'转发到QQ空间',''); 
			break;

		case 'sinaweibo':
			var sharetring='http://v.t.sina.com.cn/share/share.php?title='+title+'&url='+url+'&content=utf-8';   
			window.open(sharetring,'转发到新浪微博',''); 
			break;

		case 'renren':
			var sharetring='http://widget.renren.com/dialog/share?resourceUrl='+url+'&srcUrl='+url+'&title='+title+'&description='+title;  
			window.open(sharetring,'转发到人人','');
			break;

		case 'douban':
			var sharetring='http://www.douban.com/recommend/?url='+url+'&title='+title;
			window.open(sharetring,'转发到豆瓣','');
			break;

		case 'qqweibo':
			var sharetring = 'http://v.t.qq.com/share/share.php?title='+title+'&url='+url; 
			window.open(sharetring,'转发到腾讯微博','');
			break;
		default:
	}
}


ms.voiceofchina = voiceofchina;

})(jQuery,mysohu);