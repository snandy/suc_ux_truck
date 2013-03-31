;(function($) {

// if already load ppDialog, return directly
if ($.ppDialog) {
	return;
}


// the ppDialog plugin
$.ppDialog = function(settings) {
	var defaults = {
		title: "登录",
		appId: 1019,
		regRedirectUrl: "",
		onLogin: null,
		onAfterLogin: null
		
	};

	// give settings to UI elements
	var opts = $.extend(defaults, settings);
	var hasPostedForm = false;

	// when you call PassportSC.drawPassport() method,
	// PassportSC object will call below parameters automaticly
	// isSetFocus(auto focus), showEmailInputTip(show email tip)

	//重置drawPassportNew,为多卡片调用
	function drawPassportNew(element,appid){
			if (typeof(element) != "object")
			{
				return;
			}
			var pBaseClass = new Function();
			pBaseClass.prototype = PassportSC;
			var cardCount = PassportCardList.length;
			var PassportSN = new pBaseClass();
			/*设置登录成功后的回调函数*/
			PassportSN.appid=appid;
			PassportSN.curCardIndex=cardCount;
			/*设置以后的卡片默认不setFocus*/
			PassportSN.isSetFocus=false;
			PassportCardList[cardCount]=PassportSN;
			drawPassportNewInit(cardCount,element);	
			
			return;
	}

	/*
	 * 根据当前页面地址返回标识：
	 * 我的搜狐(i.sohu.com含toolbar)            mysohu
	 * 博客(blog.sohu.com含toolbar)	              blog
	 * 相册(pp.sohu.com不含toolbar)	               album
	 * 问答(wenda.sohu.com 含toolbar)	           wenda
	 * 狐首toolbar	                             index
	 * 圈子(q.sohu.com,new.q.sohu.com含toolbar)	quanzi
	 * 频道页toolbar	                          pindao
	 * 弹窗	                                    window
	 * 金币商城(gift.sohu.com,含toolbar)	        gift
	 * 小游戏(youxi.sohu.com,含toolbar)	         youxi
	 */
	function get_location_token(){
		var token = ''
			, hostname = location.hostname;

		if(/(^i|\.i)\.sohu\.com/.test(hostname)){
			token = 'mysohu';
		}
		else if(/(^blog|\.blog)\.sohu\.com/.test(hostname)){
			token = 'blog';
		}
		else if(/(^pp|\.pp)\.sohu\.com/.test(hostname)){
			token = 'album';
		}
		else if(/(^wenda|\.wenda)\.sohu\.com/.test(hostname)){
			token = 'wenda';
		}
		else if(/(^q|\.q)\.sohu\.com/.test(hostname)){
			token = 'quanzi';
		}
		else if(/(^gift|\.gift)\.sohu\.com/.test(hostname)){
			token = 'gift';
		}
		else if(/(^youxi|\.youxi)\.sohu\.com/.test(hostname)){
			token = 'youxi';
		}

		return token;
	}

	function socialLoginURL(provider){
		return 'https://passport.sohu.com/openlogin/request.action?provider='+provider+'&appid=1019&ru=' + encodeURIComponent(location.href);
	}
	
	//多卡片回调
	function drawPassportNewInit(cardCount,element){
		if(cardCount == null) return;
		var PSCInstance = PassportCardList[cardCount];
		PSCInstance.appid = opts.appId;
		PSCInstance.loginRedirectUrl = "";
		PSCInstance.autoredirecturl = "";
		PSCInstance._drawLoginForm = function() {
			$(this.cElement).html([
			'<form class="login-form" method="post" name="loginform">',
				'<div class="login login-pass">',
					'<div class="left">',
						'<h4>请输入您的搜狐通行证信息</h4>',
						'<div class="error"></div>',
						'<div class="loginFrom">',
							'<label class="uname" for="passport-id"><span class="lab">帐号</span><input id="passport-id" type="text" name="email" placeholder="昵称/邮箱/手机号" autocomplete="off" disableautocomplete /></label>',
							'<label class="upass" for="passport-pwd"><span class="lab">密码</span><input id="passport-pwd" type="password" name="password" /></label>',
							'<label class="ucookie" for="passport-cookie"><span class="lab"></span><input id="passport-cookie" type="checkbox" name="persistentcookie" value="1" ' + PSCInstance.defualtRemPwd + ' />记住登录状态</label>',
							'<a class="link-fpswd" href="' + this.recoverUrl + '" target="_blank">忘记密码？</a>',
						'</div>',
						'<div class="btns">',
							'<span class="lab"></span>',
							'<div class="btn">',
								'<input class="passport-login" type="button" value="登录" />',
								'<input type="submit" style="position:absolute;left:-1000px;top:-1000px;" />',
							'</div>',
							'<a class="link-register" href="http://i.sohu.com/login/reg.do?source=' + get_location_token() + (opts.regRedirectUrl ? ('&bru=' + encodeURIComponent(opts.regRedirectUrl)) : '') + '" target="_blank">立即注册</a>',
						'</div>',
					'</div>',
					'<div class="right">' ,
						'<h4>使用合作网站帐号登录</h4>' ,
						'<div class="cooperation">' ,
							'<a class="btn-account" href="'+socialLoginURL('qq')+'" target="_blank"><i class="img-qq"></i>QQ帐号</a>' ,
							'<a class="btn-account" href="'+socialLoginURL('sina')+'" target="_blank"><i class="img-sina"></i>微博帐号</a>' ,
							'<a class="btn-account" href="'+socialLoginURL('taobao')+'" target="_blank"><i class="img-taobao"></i>淘宝帐号</a>' ,
							'<a class="btn-account" href="'+socialLoginURL('renren')+'" target="_blank"><i class="img-ren"></i>人人帐号</a>' ,
							//'<a class="btn-account"><i class="img-sohu"></i>搜狐帐号</a>' ,
						'</div>' ,
					'</div>' ,
				'</div>' ,
			'</form>'].join('')
			);

			$("button, input[type='button']", $dialog).iButton();
			$("#passport-id", $dialog)[0].focus(); // 登录名获取焦点
			$("form", $dialog).submit(function() {
				hasPostedForm = true;
				return PSCInstance.doLogin();
			});
		};
		PSCInstance.drawPassportWait = function(str) {
			$(this.cElement).html(
				'<div class="login loading">' +
					'<div class="loadTxt">正在登录，请稍候...</div>' +
				'</div>'
			);
		};
		
		PSCInstance.drawPassportCard = function() {
			this.successCalledFunc();
		};
		
		PSCInstance.successCalledFunc = function() {
			if ($dialog) {
				$dialog.close();
			}

			if (hasPostedForm && $.isFunction(opts.onLogin)) {
				opts.onLogin(this.cookie.userid);
			}

			if ($.isFunction(opts.onAfterLogin)) {
				opts.onAfterLogin(this.cookie.userid);
			}
		};
		PSCInstance.drawPassport(element);
	}

	// create a passport dialog
	var $dialog = $.dialog({
		className: "pp-dialog",
		content: '<div class="login-panel"></div>',
		contentWidth: 575,
		contentHeight: 220
	})
	.delegate('.passport-login', 'click', function() {
		$(".login-form", $dialog[0]).submit();
	});

	// trigger the passport function process.
	drawPassportNew($("div.login-panel", $dialog)[0],opts.appId);
	//PassportSC.drawPassport($("div.login-panel", $dialog)[0]);
};
})(jQuery);


/*
 * 页内登录
 * @author yongzhong zhang
 */
;(function($) {
	
if(window['mysohu']){
	
	
	// 页内登录对话框
	mysohu.login = function(callback){
		if(!mysohu.is_login()) {
			$.ppDialog({
				appId: '1019',
				regRedirectUrl: location.href,
				title: '想要查看更多精彩内容，马上登录吧！',
				onLogin: function(userId) {
					if($.isFunction(callback)){
						callback();
					}else{
						location.reload();
					}
				}
			});
			return false;
		}
		return true;
	};
	
	
	
}

})(jQuery);

