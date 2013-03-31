;(function($) {
// cookie 值
function setCookie(name,value,expires,path,domain,secure) {
	document.cookie = name + "=" + escape (value) +
	((expires) ? "; expires=" + expires.toGMTString() : "") +
	((path) ? "; path=" + path : "") +
	((domain) ? "; domain=" + domain : "") + ((secure) ? "; secure" : "");
}

function getCookieVal(offset) {
	var endstr = document.cookie.indexOf (";", offset);
	if (endstr == -1) {
		endstr = document.cookie.length;
	}
	return unescape(document.cookie.substring(offset, endstr));
}

function getCookieByName(name) {
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;
	while (i < clen) {
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg) {
			return getCookieVal(j);
		}
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0) break;
	}
	return "";
}
function deleteCookie(name,path,domain) {
  if (getCookieByName(name)) {
	document.cookie = name + "=" +
	  ((path) ? "; path=" + path : "") +
	  ((domain) ? "; domain=" + domain : "") +
	  "; expires=Thu, 01-Jan-70 00:00:01 GMT";
  }
}



var selEmailInput = "user";
var validObj = {
	user:{
		msg:'4-20位的英文和数字组合,支持"-"及"_"',
		errMsg:'帐号为4-20位的英文和数字组合,支持"-"及"_"',
		emptyMsg: '请输入常用邮箱',
		isExis:false,
		regStr:/^([a-z0-9_-]+){4,20}$/,
		isLegal:false
	},
	passwd:{
		msg:'6-16位,仅限数字、字母和字符,字母区分大小写',
		errMsg:'密码长度不正确，请修改',
		emptyMsg: '请输入密码',
		isExis:true,
		isLegal:false
	},
	nickname:{
		msg:'1-20位的中英文和数字组合,支持"-"及"_"',
		errMsg:'仅支持1-20位中英文字符',
		emptyMsg: '请输入昵称',
		isExis:false,
		regStr:/^([a-z0-9_-]+)@([\da-z\.-]+)\.([a-z\.]{1,20})$/,
		isLegal:false
	},
	vcode:{
		msg:'请正确输入图片中的字母或数字',
		errMsg:'验证码错误，请重新输入',
		emptyMsg: '请输入验证码',
		isExis:false,
		isLegal:false
	},
	agree:{
		msg:'',
		errMsg:'',
		emptyMsg: '',
		isExis:false,
		isLegal:true
	}
};
var fullEmail = "";




/* 注册页面绑定事件 */
function regpageBind(){
	$("#regform").submit(function() {
		return checkLegals();
	});

	$("#agree").click(function(){
		if(this.checked){
			validObj['agree'].isLegal = true;
			$('#agreeTip').hide();
		}else{
			validObj['agree'].isLegal = false;
			$('#agreeTip').show();
		}
	});


	/* 背景颜色变化 */
	$('ul#reg input.sohuField').each(function(){
		$(this).bind('focus',function(){
			$(this).parent('div').parent('li').addClass('focus');
			createMsgWar($(this));
			if($.trim($(this).val()).length == 0 || $.trim($(this).val())=="" || $(this).attr("id")=="vcode"){
				if($(this).attr("id") == 'user'){
					showMyTip($(this),"",validObj[$(this).attr("id")].msg,true);
					var warObj = $('#user').parent('div').parent('li').find('.tip');
				}else{
					showMyTip($(this),"",validObj[$(this).attr("id")].msg,true);
					validObj[$(this).attr("id")].isLegal = false;
				}
			}
		}).bind('blur',function(){
			$(this).parent('div').parent('li').removeClass('focus');
			checkMyState($(this));
		});
	});

	$('#passwd').bind('keyup',function(){
		chkPasswordStrong($(this).val());
	});

	$('.chkPic img,.chkPic a').bind('click',function(event){
		event.preventDefault();
		getVcodeImg();
		//不知道原先为什么要return false
		//为了做点击统计，暂时去掉
		//return false;
	});
	$('#vcode').bind('click focus',function(){
		if($('#chkPicDiv').css('display') == 'none'){
			$('#chkPicDiv').show();
			getVcodeImg();
		}
	});
}

/* 生成包装元素 */
function createMsgWar(obj){
	if(obj.length == 0){return;}
	var exisflag = validObj[obj.attr('id')].isExis;

	var defaultmsg = validObj[obj.attr('id')].msg;
	if(exisflag == false){// 判断是否存在该元素
		// 生成外包装 div
		warObj = $('<div class=tip></div>');
		validObj[obj.attr('id')].isExis = true;
		// 把信息对象添加到dom中，修改成对应的css
		warObj.hide();
		if((obj.attr('id') == 'vcode')||(obj.attr('id') == 'user')||(obj.attr('id') == 'passwd')){
			warObj.appendTo(obj.parent('div').parent('li'));
		}else{
			obj.parent('div').after(warObj);
		}
	}
}

/* 检查状态 （空，合法，非法） */
function checkMyState(obj){
	if($.trim(obj.val()).length == 0 || $.trim(obj.val())==""){
		showMyTip(obj,"","",false);
		validObj[obj.attr('id')].isLegal = false;
		if(obj.attr('id')=='user'){
			hideMyEmail("user");
		}
		if(obj.attr('id') == 'passwd'){
			hidePassword();
		}
	}else{
		checkIsLegal(obj);
	}
	return validObj[obj.attr('id')].isLegal;
}

/*检查空状态，并提示，只在按了提交按钮后提示*/
function checkEmptyOnSubmit(aryList){
	var obj,
		isLegal,
		isFocus = false;
	for(var i=0;i<aryList.length;i+=1){
		obj = $('#'+aryList[i]);
		isLegal = validObj[obj.attr('id')].isLegal;
		if(!isLegal){
			obj.focus();
			break;
		}
	}
}
/* 显示提示信息框事件
	obj 控件对象，根据该对象找到对应的 tip 元素，
	claName  tip元素的class
	str  显示内容
	isShow  是否显示该tip
		eg:  showMyTip($('#user'),'','改mail已经存在，换一个',true);
*/
function showMyTip(obj,clsName,str,isShow){
	var myTip = obj.parent('div').parent('li').find('.tip');

	if(myTip!=null){
		createMsgWar(obj);
	}
	myTip = obj.parent('div').parent('li').find('.tip');
	myTip.attr('class','tip '+clsName);
	if(typeof(str) == "string"){
		myTip.html(clsName !="ok" ? "<span></span>" + str : "");
	}else if(typeof(str) == "object"){
		myTip.text("");
		myTip.append(str);
	}else{

	}

	if(isShow == true){
		myTip.show();
	}else{
		myTip.hide();
	}
	if(clsName == 'error'){
		obj.attr('class','sohuField txtError');
	}else{
		obj.attr('class','sohuField');
	}

}

/* 检查非空情况（合法与非法状态） */
function checkIsLegal(obj){
	var tmpId = obj.attr('id');
	if(tmpId == 'user'){
		checkEmail(obj);
	}else if(tmpId == 'regEmail'){
		checkRegEmail(obj);
	}else if(tmpId == 'passwd'){
		checkPass(obj);
	}else if(tmpId == 'passwdAgain'){
		checkConfirmPass(obj);
	}else if(tmpId == 'nickname'){
		checkNickName(obj);
	}else if(tmpId == 'vcode'){
		checkCode(obj);
	}else if(tmpId == 'agree'){
		checkAgree(obj);
	}
}

/* 校验邮箱  ajax */
function checkEmail(obj){
	//$('#regContr').hide();
	var regString = validObj[obj.attr('id')].regStr;
			obj.val($.trim(obj.val()).toLowerCase());
	if(!regString.test($.trim(obj.val()).toLowerCase())){
		showMyTip(obj,'error',validObj[obj.attr('id')].errMsg,true);
		// 设置标志位
		validObj[obj.attr('id')].isLegal = false;
	}else{
		checkMailAjax(obj,false);
	}
}

function checkMailAjax(obj,isSohu){
	var tmpEmail;
	if(isSohu){
		tmpEmail = obj.val()+'@sohu.com';
	}else{
		tmpEmail = obj.val();
	}
	fullEmail = tmpEmail;
	
	//检验禁止注册的帐号名
	var userName = $('#user').val()
	var banMark=false;
	var banArray = ["admin","sohujia","super","fuck","bitch","sohujia","sohu","sohuadmin","sohujiaadmin"];
	$.each(banArray,function(i,n){
		if(n == userName){
			showMyTip(obj,'','此帐号不允许使用',true);
			hideMyEmail("user");
			//设定isLegal
			validObj[obj.attr("id")].isLegal = false;
			banMark = true;
			return;
		}
	});
	
	if(!banMark){
		showMyTip(obj,'ok','',true);
		hideMyEmail("user");
		//设定isLegal
		validObj[obj.attr("id")].isLegal = true;
		setCookie('regInfosave',tmpEmail);
	}else{
		return;
	}
	
	$.ajax({
		type: "GET",
		url: "/login/checksname",
		data: {'cn': tmpEmail},
		dataType: 'json',
		async:false,
		beforeSend:function(){
			//putDefaultString(obj,'查询中，请稍后……');
			showMyTip(obj,'','查询中，请稍后……',true);
			//设定isLegal
			validObj[obj.attr("id")].isLegal = false;
		},
		success: function(data){
			// code为0用户名未被注册过，1参数错误，2验证码错误，3非法用户名，41 40 用户名存在
			if(data.code == 0){
				showMyTip(obj,'ok','',true);
				hideMyEmail("user");
				//设定isLegal
				validObj[obj.attr("id")].isLegal = true;
				setCookie('regInfosave',tmpEmail);
			}else if(data.code == 41 || data.code == 40){
				showMyTip(obj,'','此帐号太受欢迎，已有人抢注了',true);
				showMyEmail("user");
				//设定isLegal
				validObj[obj.attr("id")].isLegal = false;
			}else{
				showMyTip(obj,'error',data.msg,true);
				hideMyEmail("user");
				validObj[obj.attr("id")].isLegal = false;
			}			
		},error:function(XMLHttpRequest,textStatus,errorThrown){
			showMyTip(obj,'error','服务器忙，请稍后重试',true);
			//设定值
			validObj[obj.attr("id")].isLegal = false;
		}
	});
}
/* 校验注册邮箱用户名 */
function checkRegEmail(obj){
	var regString = validObj[obj.attr('id')].regStr;
	obj.val($.trim(obj.val()).toLowerCase());
	if(!regString.test($.trim(obj.val()))){
		showMyTip(obj,'error',validObj[obj.attr('id')].errMsg,true);

		validObj[obj.attr('id')].isLegal = false;
	}else{
		checkMailAjax(obj,true);
	}
}
/* 校验密码 */
function checkPass(obj){
	if($.trim(obj.val()).length<6||$.trim(obj.val()).length>16){
		showMyTip(obj,'error',validObj[obj.attr("id")].errMsg,true);
		validObj[obj.attr("id")].isLegal = false;
	}else{
				//添加几个简单密码的判断
				var re=/^(.)\1{5,8}$/;
				if(re.test(obj.val())){
					showMyTip(obj,'error','密码不能是相同的数字或字母',true);
		validObj[obj.attr("id")].isLegal = false;
				}else{
					var weakArr=["123456","12345678","qwerty","qwaszx","qazwsx","password","abc123"];
					if($.inArray(obj.val(),weakArr)!=-1){
						showMyTip(obj,'error','密码过于简单，请重新输入',true);
						validObj[obj.attr("id")].isLegal = false;
					}else{
						showMyTip(obj,'ok','',true);
						validObj[obj.attr("id")].isLegal = true;
					}
				}
				//var tmpUsername = $().val().substring(0,obj.val().indexOf("@"));
				if(fullEmail == obj.val()){
					showMyTip(obj,'error','密码不能与帐户相同',true);
		validObj[obj.attr("id")].isLegal = false;
				}
				// 是否与确认密码相同
				if($('#passwdAgain').val() == $('#passwd').val()){
					showMyTip($('#passwdAgain'),'ok','',true);
					validObj["passwdAgain"].isLegal = true;
				}
	}
}
/* 校验确认密码 */
function checkConfirmPass(obj){
	if((obj.val()!= $('#passwd').val())||($.trim(obj.val()).length == 0)){
		showMyTip(obj,'error',validObj[obj.attr("id")].errMsg,true);
		validObj[obj.attr("id")].isLegal = false;
	}else{
		showMyTip(obj,'ok','',true);
		validObj[obj.attr("id")].isLegal = true;
	}
}

function cjkLength(value) {
	var replaceCJK = /[\u2E80-\u9FFF\uF92C-\uFFE5]/g;
	return value.toString().replace(replaceCJK, "lv").replace(/\r/g, "").length;
};


/* 校验昵称 */
function checkNickName(obj){
	var tmpStr = $.trim(obj.val());
	/*
	if(cjkLength($.trim(obj.val())) < 4|| cjkLength($.trim(obj.val())) > 16){
	*/
	
	//console.log('tmpStr::'+tmpStr);
	
	if(tmpStr.length < 1 || tmpStr.length > 20){
		showMyTip(obj,'error',validObj[obj.attr("id")].errMsg,true);
		validObj[obj.attr("id")].isLegal = false;
	}else{

		showMyTip(obj,'','查询中，请稍后……',true);
		validObj[obj.attr("id")].isLegal = false;
		$.ajax({
			url: "/login/checksnick?_input_encode=UTF-8",
			dataType: "json",
			data: {
				d: tmpStr
			},
			success: function(data) {
				if (data.code == 0) {
					showMyTip(obj,'ok','',true);
					validObj[obj.attr("id")].isLegal = true;
					setCookie('nicknamesave',tmpStr);
				}
				else if (data.code > 0) {
					showMyTip(obj,'error',data.msg,true);
					validObj[obj.attr("id")].isLegal = false;
				}
			},
			error: function() {
				showMyTip(obj,'error','服务器忙，请稍后重试',true);
				validObj[obj.attr("id")].isLegal = false;
			}
		});
	}
}

/* 校验验证码 */
function checkCode(obj){
	if((getCookieByName('msg')!="none")&&(getCookieByName('msg')!="")){
		showMyTip(obj,'error',validObj['vcode'].errMsg,true);
		setCookie('msg','none',"","/",".i.sohu.com");
	}
	else if ($.trim(obj.val())) {
		validObj['vcode'].isLegal = true;
		showMyTip(obj,'','',false);
	}
}

/* 校验密码cookie */
function checkpassCode(obj){
	if((getCookieByName('password')!="none")&&(getCookieByName('password')!="")){
		showMyTip(obj,'error',"密码过于简单，请修改",true);
		setCookie('password','none',"","/",".i.sohu.com");
	}else{
		showMyTip(obj,'','',false);
	}
}

/* 刷新验证码 */
function refrashCode(){
	$('codeImg').src = "/login/rand?vcode="+vcode;
}

/* 显示用该邮箱登录区域 */
function showMyEmail(str){
	if($('.correctMail').length == 0){
		var tmpObj = $('<div class=correctMail>');
		$('<span class=emailTip><span class="icon email"></span>该邮箱已注册，你可以：</span>').appendTo(tmpObj);
		var inputObj = $('<input>').attr({'class':'emailBtn',type:'button',value:'立即以此邮箱登录'}).bind('click',function(){
			var redirectUrl = location.search.match(/bru=[^&]*/ig);
			redirectUrl = redirectUrl ? decodeURIComponent($.trim(redirectUrl[0].split("=")[1])) : "";
			redirectUrl = /^https*:\/\/([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+sohu\.com/ig.test(redirectUrl) ?
							redirectUrl :
							"http://i.sohu.com";

			window.location = redirectUrl;
		});
		inputObj.appendTo(tmpObj);
		$('<span>或<a id="reg-change-email" href=javascript:void(0);>换一个邮箱</a></span>').appendTo(tmpObj);
		tmpObj.appendTo($('#'+str).parent('div').parent('li'));
	}else{
		$('.correctMail').show();
	}
}

/* 检验所有输入信息是否合法，如合法把按钮设成可以提交状态，如有不合法的，保持禁提交状态*/
function checkLegals(){
	if(selEmailInput == 'user'){
		checkEmptyOnSubmit(['user','passwd','passwdAgain','nickname','vcode']);
		return validObj['user'].isLegal && validObj['passwd'].isLegal && validObj['passwdAgain'].isLegal &&
				validObj['nickname'].isLegal && validObj['vcode'].isLegal && validObj['agree'].isLegal;
	}else{
		checkEmptyOnSubmit(['regEmail','passwd','passwdAgain','nickname','vcode']);
		return validObj['regEmail'].isLegal && validObj['passwd'].isLegal && validObj['passwdAgain'].isLegal &&
				validObj['nickname'].isLegal && validObj['vcode'].isLegal && validObj['agree'].isLegal;
	}
}

// 进入页面执行的方法
function initPageSet(){
	$('#user').focus();
	$('#user').removeAttr('disabled');
	// hack for browser password autocomplete options.
	window.setTimeout(function() {
		$('#passwd').val('');
		$('#passwdAgain').val('');
	}, 1000);

	// 进入页面状态判断  根据cookie设置vcode 和user
	if($.trim($('#vcode').val())){
		checkCode($('#vcode'));
	}
	if($.trim($('#passwd').val())){
		checkpassCode($('#passwd'));
	}
	if(getCookieByName('regInfosave')!=""){
		$('#user').val(getCookieByName('regInfosave'));
		checkEmail($('#user'));
	}
	if(getCookieByName('nicknamesave')!=""){
		$('#nickname').val(getCookieByName('nicknamesave'));
		checkNickName($('#nickname'));
	}
}

function getVcodeImg(){
	var cur_time = (new Date()).getTime();
	/*
	var getUrl = "/login/vcode.jsp?nocache="+cur_time;//online version
	
	$.ajax({
		type: "GET",
		url: getUrl,
		async:false,
		beforeSend:function(){

		},
		success: function(data){
			$('.chkPic img').attr('src','/login/rand?vcode='+data);
			$('.chkPic img').show();
			$('#vcodeHidden').val(data);
		},error:function(XMLHttpRequest,textStatus,errorThrown){

		}
	});
	*/
	var img_src = "/vcode/register/?nocache="+cur_time;//new vcode test
	$('.chkPic img').attr('src',img_src);
	$('.chkPic img').show();
};

function hideMyEmail(str){
	if($('.correctMail')){
		$('.correctMail').hide();
	}
}


/**
 * 显示密码强弱
 * @return
 */
function chkPasswordStrong(me) {
	//恢复重复输入密码状态
	var csint = checkStrong(me);
	$('.psArea').show();
	if(csint == 1){
		$('.psArea div.ptp').removeClass("medium power").addClass("week");
		$('.psArea em.ptt').text("弱");
	}else if(csint == 2){
		$('.psArea div.ptp').removeClass("week power").addClass("medium");
		$('.psArea em.ptt').text("中");
	}else if(csint == 3){
		$('.psArea div.ptp').removeClass("week medium").addClass("power");
		$('.psArea em.ptt').text("强");
	}else{
		$('.psArea div').removeClass("week medium power");
		$('.psArea em.ptt').text("");
	}
}

//返回密码的强度级别
function checkStrong(passwd){
	var p1= (passwd.search(/[a-zA-Z]/)!=-1) ? 1 : 0;
	var p2= (passwd.search(/[0-9]/)!=-1) ? 1 : 0;
	var p3= (passwd.search(/[_-]/)!=-1) ? 1 : 0;
	var sum = p1+p2+p3;
	if(sum==0||sum==1)return 1;
	else return sum;
}

/* 隐藏密码强度区域 */
function hidePassword(){
	$('.psArea').hide();
	$('.psArea div.ptp').removeClass("medium power");
	$('.psArea em.ptt').text("弱");
}

$(function() {
	regpageBind();
	initPageSet();
	getVcodeImg();
});

$(document).mousedown(function(event) {
	var $target = $(event.target);

	if ($target.is("#reg-change-email")) {
		$(".correctMail").hide().prev().hide();
		if ($("#user").is(":visible")) {
			$("#user").val("").focus();
		}
		else if ($("#regEmail").is(":visible")) {
			$("#regEmail").val("").focus();
		}
	}
	else if ($target.is("#reg-sohu-email")) {
		$('#inputEmailWar').hide();
		$('#regEmailWar').show();
		$('#regEmailTip').show();
		hideMyEmail("user");
		$('#user').attr('disabled',true);
		$('#regEmail').removeAttr("disabled");
		selEmailInput = 'regEmail';
		$('#regEmail').focus();
	}
	else if ($target.is("#reg-use-email")) {
		$('#regEmailWar').hide();
		$('#inputEmailWar').show();
		$('#regEmailTip').hide();
		hideMyEmail("user");
		$('#user').removeAttr("disabled");
		$('#regEmail').attr('disabled',true);
		selEmailInput = 'user';
		$('#user').focus();
	}
});
})(jQuery);