/*
 *	中国好声音 英文站 登录 注册
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){

//通用报错函数
var errorSpan = {
	show: function($o,text,hint){
		var $p = $o.parent(),
			$e = $p.find('span.help-block');
		if(!$e.length) $e = $('<span class="help-block"></span>').appendTo($p);
		$e.show().html(text)[!hint ? 'addClass' : 'removeClass']('red');
		$p.find('i.icon-right').hide();
	},
	hide: function($o){
		$o.parent().find('span.help-block,i.icon-right').hide();
	},
	ok: function($o){
		this.hide($o);
		var $p = $o.parent();
		if($p.find('i.icon-right').length){
			$p.find('i.icon-right').show();
			return;
		}
		if($o.next('.help-block').length){
			$('<span class="help-inline"><i class="icon-right"></i></span>').insertBefore($o.next('.help-block'));
		}else{
			$('<span class="help-inline"><i class="icon-right"></i></span>').appendTo($p);
		}
	}

}

//取文本框的值
function getVal($o){
	if($o.val() == $o.attr('placeholder')){
		return '';
	}
	return $o.val();
}


//初始化登陆，依赖 passport.js
function initLogin(){
	var $form = $('#log_in'),
		$email = $form.find('[name="email"]'),
		$pwd = $form.find('[name="password"]'),
		$rem = $form.find('[name="persistentcookie"]');

	$rem.prop('checked',true);

	 // 判断浏览器是否支持cookie
    function checkCookieEnabled() {
        try {
            if (navigator.cookieEnabled == false) {
                return false;
            }
        } catch (e) {}
        return true;
    }

	//错误提示
	function reportMsg(code){
		var msg = '';
        switch (code) {
            case '1':
                msg += 'Input your username please';
                break;
            case '2':
                msg += 'The form of passport is the email address';
                break;
            case '3':
                msg += 'The suffix of user name must be ' + arguments[1];
                break;
            case '4':
                msg += 'Input your password please';
                break;
            case '5':
                var email = PassportSC.strip($email.val());
                if (email.lastIndexOf("@focus.cn") > 0) {
                    msg += 'Invalid username or password!Consulting number:0086-010-58511234';
                } else {
                    msg += 'Invalid username or password';
                }
                break;
            case '6':
                msg += 'Login timeout,please try again later';
                break;
            case '7':
                msg += 'Login failed,please try again later';
                break;
            case '8':
                msg += 'Network failure,logout failed,please try again';
                break;
            case '9':
                msg += 'Logon failed,please try again later';
                break;
            case '10':
                msg += 'Temporarily can not be logon,please try again later';
                break;
            case '11':
                msg += 'Browser Settings incorrectly,please check out our help section';
                break;
            case '12':
                msg += 'A server failure, please try again later';
                break;
            default:
                msg += 'Logon failure,please try again later';
        }

        if(code == 1 || code == 2 || code == 3){
        	errorSpan.show($email,msg);
        }else{
        	errorSpan.show($pwd,msg);
        }
	}

	//登录失败
	function loginFailCall(){
        if (this.intervalCount >= this.maxIntervalCount) {
            reportMsg('6');
            $email.focus();
        } else if (login_status == 'error3' || login_status == 'error2') {
            reportMsg('5');
            $pwd.focus();
        } else if (login_status == 'error5') {
            reportMsg('10');
            $pwd.focus();
        } else if (login_status == 'error13') {
            window.location = "http://passport.sohu.com/web/remind_activate.jsp";
            return;
        } else if (login_status == 'error11') {
            reportMsg('12');
            $pwd.focus();
        } else if (checkCookieEnabled() == false) {
            reportMsg('11');
            $email.focus();
        } else {
            reportMsg('9');
            $pwd.focus();
        }
        $pwd.val('');
	}
	//登录成功
	function loginSuccessCall(){
		window.location.reload(true);
	}

	//登录
	function doLogin(){
		errorSpan.hide($email);
		errorSpan.hide($pwd);
		if (PassportSC.eInterval) return; // 必须判断一下，避免连续两次点击
		login_status = "";
        PassportSC.intervalCount = 0;
        var email = PassportSC.strip(getVal($email));
        var password = PassportSC.strip(getVal($pwd));

        var pc = 0;
        if ($rem.prop('checked') == true) pc = 1;

        if (email == "") {
            reportMsg('1');
            $email.focus();
            return;
        }
       
        if (password == "") {
            reportMsg('4');
            $pwd.val('');
            $pwd.focus();
            return;
        }
        
        PassportSC.loginHandle(email, password, pc, $form[0], $.proxy(loginFailCall,PassportSC), $.proxy(loginSuccessCall,PassportSC));

	}
	$form.submit(function(){
		doLogin();
		return false;
	});
}



//初始化注册
function initRegister(){
	var $form = $('#sign_in'),
		$regEmail = $form.find('[name="regEmail"]'),
		$passwd = $form.find('[name="passwd"]'),
		$passwdAgain = $form.find('[name="passwdAgain"]')
		$nickname = $form.find('[name="nickname"]')
		$vcode = $form.find('[name="vcode"]'),
		$agree = $form.find('[name="agree"]');



	var validObj = {
		regEmail: {
			msg: 'Characters between 4 and 16,begin with the letter,only contain letters,Numbers and underscores',
			errMsg: 'Invalid username,please modify',
			emptyMsg: 'Input the username please',
			isExis: true,
			regStr: /[a-zA-z]{1}[a-zA-z0-9_]{3,15}/,
			isLegal: false
		},
		passwd: {
			msg: 'Password should be set between 6 and 16,which could contain letters,Numbers,special symbols',
			errMsg: 'Password length is not correct,please modify',
			emptyMsg: 'Input the password please',
			isExis: true,
			isLegal: false
		},
		passwdAgain: {
			msg: 'Input the password again',
			errMsg: 'Entered passwords do not match!',
			emptyMsg: 'Please confirm the password again',
			isExis: false,
			isLegal: false
		},
		nickname: {
			msg: 'Input the characters between 2 and 12 please ',
			errMsg: 'Nickname length is wrong，input the characters between 2 and 12 please',
			emptyMsg: 'Input your Nickname please',
			isExis: false,
			isLegal: false
		},
		vcode: {
			msg: 'Input the correct letters or numbers of the picture',
			errMsg: 'Verification code error,please try again',
			emptyMsg: 'Input the verification code please',
			isExis: false,
			isLegal: false
		},
		agree: {
			errMsg: 'Need to agree "Sohu network services protocol" in order to continue to be registered!'
		}
	};

	//初始值
	$regEmail.val('');
	$nickname.val('');
	$vcode.val('');
	$agree.prop('checked',true);

	//检查用户名
	function checkRegEmail(){
		var tmpEmail = $regEmail.val() + '@sohu.com',
			name = $regEmail.attr('name'),
			vo = validObj[name];
		$.ajax({
			type: "GET",
			url: "/login/checkuser",
			data: {
				'cn': tmpEmail
			},
			dataType: 'json',
			beforeSend: function() {
				errorSpan.show($regEmail,'please wait ...',true);
				//设定isLegal
				vo.isLegal = false;
			},
			success: function(data) {
				// code为0用户名未被注册过，1参数错误，2验证码错误，3非法用户名，41 40 用户名存在
				if(data.code == 0) {
					errorSpan.ok($regEmail);
					//设定isLegal
					vo.isLegal = true;
				} else if(data.code == 41 || data.code == 40) {
					errorSpan.show($regEmail,'The email has been registered,Login with it or change a new email');
					//设定isLegal
					vo.isLegal = false;
				} else {
					var enMsg = [
						'',
						'Parameter error',
						'Signature error',
						'Illegal username',
						'Occupied',
						'Unsupported email suffix',
						'Unsupported email suffix',
						'Invalid email format , account only support begin with letters, characters between 4 and 16, consist of Numbers, letters, and underscores'
					];
					errorSpan.show($regEmail,enMsg[data.code]);
					vo.isLegal = false;
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				errorSpan.show($regEmail,'The server is busy, please try again later');
				//设定值
				vo.isLegal = false;
			}
		});
	}

	//检查昵称
	function checkNickname(){
		var tmpStr = $nickname.val(),
			name = $nickname.attr('name'),
			vo = validObj[name];

		if(tmpStr.length < 2 || tmpStr.length > 12) {
			errorSpan.show($nickname,vo.errMsg);
			vo.isLegal = false;
		} else {
			errorSpan.show($nickname,'please wait ...',true);
			vo.isLegal = false;
			$.ajax({
				url: "/login/checknick?_input_encode=UTF-8",
				dataType: "json",
				data: {
					d: tmpStr
				},
				success: function(data) {
					if(data.code == 0) {
						errorSpan.ok($nickname);
						vo.isLegal = true;
					} else if(data.code > 0) {
						var enMsg = [
							'',
							'Null',
							'the characters between 2 and 12',
							'Special illegal characters',
							'Contain the forbidden words',
							'',
							'Occupied'
						];
						errorSpan.show($nickname,enMsg[data.code]);
						vo.isLegal = false;
					}
				},
				error: function() {
					errorSpan.show($nickname,'The server is busy, please try again later');
					vo.isLegal = false;
				}
			});
		}

	}
	//检查密码
	function checkPass() {
		var pwd = $passwd.val(),
			name = $passwd.attr('name'),
			vo = validObj[name],
			fullEmail = $regEmail.val() + '@sohu.com';

		if(pwd.length < 6 || pwd.length > 16) {
			errorSpan.show($passwd,vo.errMsg);
			vo.isLegal = false;
		} else {
			//添加几个简单密码的判断
			var re = /^(.)\1{5,8}$/;
			if(re.test(pwd)) {
				errorSpan.show($passwd,'Password cannot be the same Numbers or letters');
				vo.isLegal = false;
			} else {
				var weakArr = ["123456", "12345678", "qwerty", "qwaszx", "qazwsx", "password", "abc123"];
				if($.inArray(pwd, weakArr) != -1) {
					errorSpan.show($passwd,'Password is too simple,please input again');
					vo.isLegal = false;
				} else {
					errorSpan.ok($passwd);
					vo.isLegal = true;
				}
			}
			
			if(fullEmail == pwd) {
				errorSpan.show($passwd,'Password cannot be the same as the account');
				vo.isLegal = false;
			}
			// 是否与确认密码相同
			if($passwdAgain.val() == pwd) {
				errorSpan.hide($passwdAgain);
				validObj["passwdAgain"].isLegal = true;
			}
		}
	}
	//检查确认密码
	function checkConfirmPass() {
		var pwd = $passwdAgain.val(),
			name = $passwdAgain.attr('name'),
			vo = validObj[name];

		if((pwd != $passwd.val()) || (pwd.length == 0)) {
			errorSpan.show($passwdAgain,vo.errMsg);
			vo.isLegal = false;
		} else {
			errorSpan.ok($passwdAgain);
			vo.isLegal = true;
		}
	}
	//初始化验证码
	function getVcodeImg() {
		var cur_time = (new Date()).getTime();
		var img_src = "/vcode/register/?nocache=" + cur_time; //new vcode test
		$('#vcode_img').attr('src', img_src);
	};

	getVcodeImg();

	$('#vcode_img,#vcode_change').click(function(event){
		event.preventDefault();
		getVcodeImg();
	});

	//检查是否能提交
	function checkElement($elem,ajax){
		$elem.val($.trim(getVal($elem)));
		var name = $elem.attr('name');
		if($elem.val() == ''){
			errorSpan.show($elem,validObj[name].emptyMsg);
			validObj[name].isLegal = false;
		}else{
			switch(name){
				case 'regEmail':
					if(ajax) checkRegEmail();
					break;
				case 'nickname':
					if(ajax) checkNickname();
					break;
				case 'passwd':
					checkPass();
					break;
				case 'passwdAgain':
					checkConfirmPass();
					break;
				case 'vcode':
					//验证码不为空即可
					validObj.vcode.isLegal = true;
					break;
			}
		}

	}
	function checkAll(){
		checkElement($regEmail);
		checkElement($passwd);
		checkElement($passwdAgain);
		checkElement($nickname);
		checkElement($vcode);

		if(!$agree.prop('checked')){
			errorSpan.show($agree,validObj.agree.errMsg);
			return false;
		}else{
			errorSpan.hide($agree);

		}

		return validObj.regEmail.isLegal
			&& validObj.nickname.isLegal
			&& validObj.passwd.isLegal
			&& validObj.passwdAgain.isLegal
			&& validObj.vcode.isLegal;
	}

	$form.find(':text,:password')
	.focus(function(){
		var msg = validObj[this.name].msg;
		if(msg){
			errorSpan.show($(this),msg,true);
		}

	})
	.blur(function(){
		checkElement($(this),true);
	});

	$agree.click(function(){
		if(this.checked){
			errorSpan.hide($agree);
		}else{
			errorSpan.show($agree,validObj.agree.errMsg);
		}
	});

	function doSubmit(){
		if(checkAll()){
			$.post('/login/ajaxreg.do',$form.serialize(),function(results){
				if(results.code == 0){
					window.location.reload(true);
				}else if(results.code == 1){
					switch(results.data.field){
						case 'user':
							$regEmail.focus();
							errorSpan.show($regEmail,validObj.regEmail.errMsg);
							validObj.regEmail.isLegal = false;
							break;
						case 'password':
							$passwd.focus();
							errorSpan.show($passwd,validObj.passwd.errMsg);
							validObj.passwd.isLegal = false;
							break;
						case 'nick':
							$nickname.focus();
							errorSpan.show($nickname,validObj.nickname.errMsg);
							validObj.nickname.isLegal = false;
							break;
						case 'vcode':
							$vcode.focus();
							getVcodeImg();
							errorSpan.show($vcode,validObj.vcode.errMsg);
							validObj.vcode.isLegal = false;
							break;
						default:
							$.alert('Registration failed');
					}
				}else if(results.code == 2){
					$.alert('Registration failed (passport)');
				}
			},'json');

		}

	}

	$form.submit(function(){
		doSubmit();
		return false;
	});
}

$(function(){
	initLogin();
	initRegister();

	var $placeholders = $('input[placeholder]:text');

	if('placeholder' in document.createElement('input')){
		//do nothing
	}else{
		$placeholders
		.focus(function(){
			var $this = $(this);
			if($this.val() == $this.attr('placeholder')){
				$this.val('').removeClass('gray');
			}
		})
		.blur(function(){
			var $this = $(this);
			if($this.val() == ''){
				$this.val($this.attr('placeholder')).addClass('gray');
			}
		})
		.each(function(){
			$this = $(this);
			if($this.val() == ''){
				$this.val($this.attr('placeholder')).addClass('gray');
			}
		});
	}
});


})(jQuery,mysohu);