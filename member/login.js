;(function($) {

var cache = {
	
};
 
var ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

//修正ie6下图片不缓存的问题
if(ieBug){
	try{
		document.execCommand("BackgroundImageCache", false, true);
	}catch(e){}
}

var project = {
	nobody: 'http://r1.suc.itc.cn/itoolbar/default/nobody.v.110708.gif',
	changePassport : "http://i.sohu.com/login/sname.do?cb=?",
	lastPP: '',//上次登录帐号
	init: function(){
		var self = this;
		// when you call PassportSC.drawPassport() method,
		// PassportSC object will call below parameters automaticly

		//缓存旧的fillEmailSelect，并覆盖，因为该函数内将suggest弹框的背景写死为白色
		var oldFillEmailSelect = PassportSC.fillEmailSelect;
		PassportSC.fillEmailSelect = function(){
			oldFillEmailSelect.call(this);
			this.dsElement.style.backgroundColor = "#000";
		};
		var oldParseLast = PassportSC.parseLastDomain;
		PassportSC.parseLastDomain =  function (list) {
			oldParseLast.call(this,list);
			var selectList = this.emailPostfix;
			// console.log(this.emailPostfix)
			var j = 0;
			for(var i = 0 ; i <selectList.length ; i++){
				var dValue  = selectList[i];
				var iValue = this.emailInput.value;
				if(dValue.indexOf("@")>0){
					 j++;
				}
			}
			if(j>0){
				var a = this.emailPostfix.splice(0,j+1).reverse();
				var b = this.emailPostfix;
				this.emailPostfix = a.concat(b);
			}
			// console.log(this.emailPostfix)
        };
		PassportSC.showMsg = function(msg){
			if (!this.loginMsg){
				return;
			}
			var $msg = $(this.loginMsg);
			if(msg){
				$msg.show().html(msg);
			}else{
				$msg.hide();
			}
		};
		//如果用户输入帐号系统的sname，那么像帐号系统提交替换passport
		PassportSC.doLogin = function () {
            if (this.eInterval) return; // 必须判断一下，避免连续两次点击
            if (arguments[0]) {
                PassportCardList[index].doLogin();
            }
            login_status = "";
            this.intervalCount = 0;
            this.sElement.innerHTML = "";

            this.email = this.strip(this.emailInput.value);
            var email = this.email;
            var password = this.strip(this.passwdInput.value);

            var pc = 0;
            if (this.pcInput.checked == true) pc = 1;

            if (email == "") {
                this.reportMsg('1');
                this.emailInput.focus();
                return false;
            }
            /*
             * if (email.lastIndexOf('@') == -1) { this.reportMsg('2');
             * this.emailInput.focus(); return false; }
             */
            // 如果autopad不为空，则限制只能输入本域的用户
            if (this.autopad != "") {
                var dpostfix = email.substr(email.lastIndexOf('@') + 1);
                if (this.autopad.lastIndexOf(dpostfix) < 0) {
                    this.reportMsg('3', this.autopad);
                    this.emailInput.focus();
                    this.passwdInput.value = "";
                    return false;
                }
            }
            if (password == "") {
                this.reportMsg('4');
                this.passwdInput.value = "";
                this.passwdInput.focus();
                return false;
            }
            if (this.usePost == 1) {
                return this.doPost();
            }
            var tempThis = this;
            var returnValue = true ; 

            if(email.indexOf("@")<0 && !/([\u4e00-\u9fa5 ])+/.test(email)){
            	$.ajax({
					url: self.changePassport,
					data:{sname:email,_input_encode:"UTF-8"},
					dataType: 'jsonp', 
					async: false
            	}).done(function(result){
					if(result.code == '0'){
						email = result.msg;	
					            // 显示Passport等待状态框，执行后将破坏 document.forms
        				tempThis.drawPassportWait('正在登录搜狐通行证，请稍候...');
         				returnValue = tempThis.loginHandle(email, password, pc, tempThis.sElement, tempThis.loginFailCall.bindFunc(tempThis), tempThis.loginSuccessCall.bindFunc(tempThis));
            		}else{
            			returnValue = tempThis.loginHandle(email, password, pc, tempThis.sElement, tempThis.loginFailCall.bindFunc(tempThis), tempThis.loginSuccessCall.bindFunc(tempThis));
            		}
            	});
            	return false;
            }else{
    	        this.drawPassportWait('正在登录搜狐通行证，请稍候...');
            	return this.loginHandle(email, password, pc, this.sElement, this.loginFailCall.bindFunc(this), this.loginSuccessCall.bindFunc(this));
            }
            


        };
		PassportSC._drawLoginForm = function() {
			var defaultValue = "帐号/邮箱/手机号";
			if (PassportSC.emailPostfix != null && PassportSC.emailPostfix.length > 0) {
				
				var j = 1;
				for(var i = 0 ; i< PassportSC.emailPostfix.length ; i++){
					if(PassportSC.emailPostfix[i].lastIndexOf("@")>=0){
						j = i ;
						break;
					}
				}
				var postfix = PassportSC.emailPostfix[j];
				if (typeof(postfix) == "string" && postfix.indexOf("@") > -1) {
					defaultValue = postfix;
					self.lastPP = postfix;
				}
			}
			this.cElement.innerHTML =
			'<fieldset><legend class="login-form-title" >我的搜狐登录</legend>' + 
				'<div class="login-form-itemwrapper">' +
					'<form method="post" onsubmit="return PassportSC.doLogin();" name="loginform">' +
						'<div id="ppcontid">' +
							'<p class="login-form-item"><span class="login-form-input-before"><input type="text" name="email" id="email" value="'+defaultValue+'" autocomplete="off" disableautocomplete /></span></p>' +
							'<p class="login-form-item"><span class="login-form-inpu"><input type="password" name="password" id="password" autocomplete="off" disableautocomplete /></span></p>' +
							'<div class="error" style="display:none"></div>' +
							'<div class="login-form-submit">' +
								'<div class="login-form-forget-wrapper">' +
									'<label class="login-form-remember">' +
										'<input id="rem" name="persistentcookie" checked="checked" type="checkbox" value="1" data-log-click="login_rber_me" />记住我' +
									'</label>' +
									'<a class="login-form-forget" href="' + this.recoverUrl + '" target="_blank" data-log-click="login_forget_password">忘记密码？</a>' +
								'</div>' +
								'<input name="" type="submit" value="登录" class="login-submit-btn" data-log-click="login_in" />' +
							'</div>' +
						'</div>' +
					'</form>' + 
				'</div>' +
			'</fieldset >';
			$('.login-reg-btn').attr('href',this.registerUrl);
		};

		PassportSC.drawPassportWait = function (str) {
			this.cElement.innerHTML =
			'<div class="login-loading">' +
				'正在登录，请稍候...' +
			'</div>';
		};
		PassportSC._drawPassportCard = function () {

		};
		//如果是畅游用户，则清除cookie，变成未登录状态
		if(nojump){
			$.cookie("ppinf", null, {path: "/", domain: "sohu.com"});
			$.cookie("ppinfo", null, {path: "/", domain: "sohu.com"});
			$.cookie("passport", null, {path: "/", domain: "sohu.com"});
		}
		
		//var redirectUrl = location.search.match(/bru=[^&]*/ig);
		//redirectUrl = redirectUrl ? decodeURIComponent($.trim(redirectUrl[0].split("=")[1])) : "";
		
		var redirectUrl = location.search.match(/bru=([^&]+)/i);
		redirectUrl = redirectUrl ? decodeURIComponent($.trim(redirectUrl[1])) : "";

		redirectUrl = /^https*:\/\/([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+sohu\.com/ig.test(redirectUrl) ? redirectUrl : "http://i.sohu.com";
		PassportSC.appid = 1019;
		PassportSC.registerUrl = "http://i.sohu.com/login/reg.do?bru=" + encodeURIComponent(redirectUrl) + '&source=suc';
		PassportSC.autoRedirectUrl = redirectUrl;
		PassportSC.loginRedirectUrl = redirectUrl;
		PassportSC.drawPassport($("#passportcard")[0]);

		$('#email')
		.focus(function(){
			$(this).parent().attr('class','login-form-input-onfocus');
			if($(this).val() == "帐号/邮箱/手机号"){
				$(this).val("");
			}
			self.setUserInfo(this.value);
		}).blur(function(){
			$(this).parent().attr('class','login-form-input');
			self.setUserInfo(this.value);
		});
		$('#password')
		.focus(function(){

			$(this).parent().attr('class','login-form-input-onfocus');
		}).blur(function(){
			$(this).parent().attr('class','login-form-input');
		});
		this.initUserInfo();
		this.initBg();
	},
	initUserInfo: function(){
		var self = this,
			ajax = 'accountinfo.do?_input_encode=UTF-8',
			$img = $('.login-face-img > img'),
			$name = $('.login-face-user');
		if(!this.lastPP){
			$img.attr('src',this.nobody);
			$name.html('');
			return;	
		}
		$.getJSON(ajax,{
			passport: this.lastPP
		},function(results){
			if(results.code == 0){
				cache[self.lastPP]= {
					icon: results.data.icon,
					nick: results.data.nick
				};
				self.setUserInfo(self.lastPP);
			}
		});
	},
	setUserInfo: function(pp){
		var self = this,
			$img = $('.login-face-img > img'),
			$name = $('.login-face-user');
		$img.unbind('click');
		pp = $.trim(pp) == '' ? this.lastPP : pp;
		if(cache[pp]){
			$img.attr('src',cache[pp].icon).click(function(){
				if(self.lastPP){
					$("#email").val(self.lastPP);
				}
			});
			$name.html(cache[pp].nick);

		}else{
			$img.attr('src',this.nobody);
			$name.html('');
		}
	},
	initBg: function(){
		var self = this;
		this.data = subjects;
		if(!this.data){
			return;
		}
		this.len = this.data.length;
		this.cIndex = this.len - 1;
		this.$bg = $('.login-background-wrapper');
		this.$prev = $('.login-bg-select a.prev');
		this.$next = $('.login-bg-select a.next');
		this.setBtnStatus();

		this.$prev.click(function(){
			var $this = $(this);
			if($this.hasClass('prev-last')){
				return;
			}
			self.cIndex = self.cIndex - 1 >= 0 ? self.cIndex - 1 : 0;
			self.setBg();
		});

		this.$next.click(function(){
			var $this = $(this);
			if($this.hasClass('next-last')){
				return;
			}
			self.cIndex = self.cIndex + 1 <= self.len - 1 ? self.cIndex + 1 : self.len - 1;
			self.setBg();
		});
		
		//好声音隐藏翻页功能
		$('.login-bg-select').hide();
	},
	setBtnStatus: function(){
		if(this.cIndex == this.len - 1){
			this.$next.removeClass().addClass('next-last');
		}else{
			this.$next.removeClass().addClass('next');
		}
		if(this.cIndex == 0){
			this.$prev.removeClass().addClass('prev-last');
		}else{
			this.$prev.removeClass().addClass('prev');
		}
	},
	setBg: function(){
		var self = this,
			url = this.data[this.cIndex];
		this.loadImage(url,function(src){
			self.$bg.animate({
				opacity : .5
			}, 'normal', function() {
				self.$bg
				.css('background-image','url('+src+')')
				.animate({
					opacity : 1
				}, 'normal');
			});
			self.setBtnStatus();
		});
	},
	// 图片预加载
	loadImage : function(src, callback) {
		var img = new Image();
		$(img).load(function() {
			callback(src);
		}).attr('src', src);
	}
};



//好声音
function formatNumber(num){
	var numStr = String(num),
		reAry = [];

	while (numStr.length) {
		var sub = '';
		if(numStr.length > 3){
			sub = numStr.substr(numStr.length - 3);
			numStr = numStr.substr(0,numStr.length - 3);
		}
		else{
			sub = numStr;
			numStr = '';
		}
        reAry.unshift(sub);
       
    }
    return reAry.join(',');
}

function voiceofchinaSearch(){
	var html = [
	'<div class="cv-search-int">',
		'<form method="POST" action="/voice/search/index.htm" id="voc_search" name="voc_search" target="_blank">',
			'<div class="bg-tm"></div>',
			'<input type="text" name="keyword" class="int" placeholder="输入学员姓名，寻找好声音" /><input type="submit" class="btn-cv-search" value="" />',
		'</form>',
	'</div>'
	].join('');

	$('div.login-position-wrapper').prepend(html);

	$('input.btn-cv-search').hover(function(){
		$(this).addClass('btn-cv-search-hover');
	},function(){
		$(this).removeClass('btn-cv-search-hover');
	});

	var $keyword = $('#voc_search > input[name="keyword"]'),
		placeholder = $keyword.attr('placeholder');

	if('placeholder' in document.createElement('input')){
		$keyword.addClass('active');
	}else{
		var $keyword = $('#voc_search > input[name="keyword"]'),
			placeholder = $keyword.attr('placeholder');
		$keyword
		.focus(function(){
			if($keyword.val() == placeholder){
				$keyword.val('');
			}
			$keyword.addClass('active');
		})
		.blur(function(){
			if($keyword.val() == ''){
				$keyword.val(placeholder);
				$keyword.removeClass('active');
			}
		});

		if($keyword.val() == '') $keyword.val(placeholder);
		else $keyword.addClass('active');
	}

	$('#voc_search').submit(function(){
		if($keyword.val() == placeholder) $keyword.val('');
	});

	//参与人数
	$.post('/a/voice/app/get-count',function(results){
		if(results.code == 0){
			var html = [
				'<div class="cv-txt">',
					'目前超过<a href="http://i.sohu.com/voice/search/index.htm" target="_blank">',
					formatNumber(results.data),
					'</a>人参与征集！<a href="http://i.sohu.com/voice/search/index.htm" target="_blank">查看详情</a>',
				'</div>'
			].join('');

			$('div.login-position-wrapper').prepend(html);	
		}
	},'json');
}




$(function() {
	project.init();
	voiceofchinaSearch();
});
})(jQuery);
