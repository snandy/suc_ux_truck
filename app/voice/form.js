/*
 *	中国好声音-报名表单
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){
var win = window,
	ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

//swfupload 大小 337x28


var msg = {
	'name': {
		focus: '请填写真实姓名，方便我们联系您',
		error: '请填写2-30位以内的字符',
		empty: '请填写真实姓名'
	},
	'identityNumber': {
		focus: '请填写正确的证件号码',
		error: '请填写正确的证件号码',
		empty: '请填写证件号码'
	},
	'birthday': {
		focus: '请选择您的生日，方便我们了解您的年龄',
		error: '请选择您的生日，方便我们了解您的年龄',
		empty: '请选择您的生日，方便我们了解您的年龄'
	},
	'nationality': {
		focus: '请填写真实的国籍信息',
		error: '请填写2-30位以内的字符',
		empty: '请填写国籍信息'
	},
	'ethnic': {
		focus: '请填写真实的民族信息',
		error: '请填写1-30位以内的字符',
		empty: '请填写民族信息'
	},
	'area': {
		focus: '请选择您的所在地区',
		error: '请选择您的所在地区',
		empty: '请选择您的所在地区'
	},
	'address': {
		focus: '请填写详细街道名小区名等',
		error: '请填写2-120位以内的字符',
		empty: '请填写详细地址'
	},
	'zipcode': {
		focus: '请填写邮政编码',
		error: '请输入6位邮政编码',
		empty: '请填写邮政编码'
	},
	'email': {
		focus: '请填写正确的邮箱地址',
		error: '邮件格式错误',
		empty: '请填写邮箱地址'
	},
	'familyMembers': {
		focus: '请填写家庭成员信息，如:爸爸、妈妈',
		error: '请填写2-120位以内的字符',
		empty: '请填写家庭成员信息'
	},
	'graduateSchool': {
		focus: '请填写学校名称',
		error: '请填写2-120位以内的字符',
		empty: '请填写学校名称'
	},
	'profession': {
		focus: '请填写职业信息',
		error: '请填写2-30位以内的字符',
		empty: '请填写职业信息'
	},
	'qq': {
		focus: '请填写正确的QQ号码',
		error: '请填写有效账号',
		empty: '请填写QQ号码'
	},
	'phoneview': {
		focus: '请填写有效的手机号码，方便我们联系您',
		error: '请输入正确的手机号码',
		error2: '该手机号已被其他帐号绑定过，请绑定其他手机号码',
		empty: '请填写手机号码'
	},
	'phoneagain': {
		focus: '请再次输入手机号码',
		error: '请输入正确的手机号码',
		error2: '两次输入的手机号码不一致',
		empty: '请再次输入手机号码'
	},
	'message': {
		focus: '请填写您收到的验证码',
		error: '验证码错误，请重新填写',
		empty: '请进行手机号验证'
	},
	'emergencyPhone': {
		focus: '请填写紧急联系电话，如:010-62728888, 13800008888',
		error: '请填写2-30位以内的数字',
		empty: '请填写紧急联系电话'
	},
	'homePhone': {
		focus: '请填写家庭电话，如:010-62728888, 13800008888',
		error: '请填写2-30位以内的数字',
		empty: '请填写家庭电话'
	},
	'songStyle': {
		empty: '至少勾选一项'
	},
	'songStyleOther': {
		focus: '请填写您擅长的曲风',
		error: '请填写300字以内',
		empty: '请填写您擅长的曲风'
	},
	'tvExperience': {
		focus: '请填写300以内的答案',
		error: '请填写300字以内',
		empty: '请填写答案'
	},
	'regret': {
		focus: '请填写300以内的答案',
		error: '请填写300字以内',
		empty: '请填写答案'
	},
	'wish': {
		focus: '请填写300以内的答案',
		error: '请填写300字以内',
		empty: '请填写答案'
	},
	'description': {
		focus: '请填写300以内的答案',
		error: '请填写300字以内',
		empty: '请填写答案'
	},
	'auditionCity': {
		error: '至多勾选两项',
		empty: '至少勾选一项'
	}

};


var form = {
	init: function(){
		this.$form = $('#formBasic');

		this.hideAllAlert();
		
		this.bindEvent();

		//初始化图片上传
		if(this.$form.find('a.cv-swf').is(':visible')){
			setTimeout($.proxy(this.initSwfupload,this),0);
		}

		/********************************下面初始化可能找不到对应元素*************************************/

		if(this.$form.find('select[name="year"]').length){
			this.initBirthday();
		}
		if(this.$form.find('select[name="provinceId"]').length){
			this.initArea();
		}

		//曲风 其他
		this.$form.find('textarea[name="songStyleOther"]').prop('disabled',!this.$form.find('input[name="songStyle"][value="11"]').prop('checked'));
		//组合
		var $team2 = this.$form.find('input[name="team"][value="2"]');
		if($team2.length){
			$team2.parent().siblings('span')[$team2.prop('checked') ? 'show' : 'hide']();
			this.initMembers();
		}
		
		//赛区，只能选择2个
		if(this.$form.find('[name="auditionCity"]:checked').length >= 2){
			this.$form.find('[name="auditionCity"]').not(':checked').prop('disabled',true);
		}


	},
	hideAllAlert: function(){
		this.$form.find('.alert').hide();
	},
	hint: function($o,text){
		$o.closest('div.form-item').find('span.alert').removeClass('alert-error').addClass('alert-info').html(text).show().end().find('i.icon-right').parent().remove();
	},
	error: function($o,text){
		$o.closest('div.form-item').find('span.alert').removeClass('alert-info').addClass('alert-error').html(text).show().end().find('i.icon-right').parent().remove();
	},
	ok: function($o,noIcon){
		var $alert = $o.closest('div.form-item').find('span.alert').hide();
		$o.closest('div.form-item').find('i.icon-right').parent().remove();
		if(!noIcon){
			$alert.before('<span class="pull-left"><i class="icon-right"></i></span>');
		}
	},
	buildSelect: function($select,data,type,value){
		type = type || 'Number';//比较的类型
		value = value ? value : ($select.attr('data-default-value') ? $select.attr('data-default-value') : '');
		$select.attr('data-default-value','');
		var select = $select[0],
			isAry = $.isArray(data);;
		if(select.options.length > 0) select.options.length = 1;
		if(!data) return;
		$.each(data,function(k,v){
			var option = document.createElement('option');
			option.text = v;
			option.value = isAry ? v : k;
			select.options.add(option);
		});
		$select.val(type == 'Number' ? value*1 : value);
	},
	initMembers: function(){
		var arr = [];
		for(var i = 2; i <= 50 ;i += 1){
			arr.push(i);
		}
		this.buildSelect(this.$form.find('select[name="members"]'),arr);
	},
	initBirthday: function(){
		var self = this;
		//生日
		var $year = this.$form.find('select[name="year"]'),
			$month = this.$form.find('select[name="month"]'),
			$day = this.$form.find('select[name="day"]'),
			limitDate = new Date(),
			limitYear = limitDate.getFullYear(),
			limitMonth = limitDate.getMonth(),
			limitDay = limitDate.getDate();//生日为上限为当天

		function getDaysInMonth(year,month){
			return 32 - new Date(year, month, 32).getDate();
		}

		function birthdayYear(){
			var now = new Date(),
				value = $year.attr('data-default-value') ? $year.attr('data-default-value') : '';

			var arr = [];
			for(var i = limitYear ,len = 1900; i >= len ;i -= 1){
				arr.push(i);
			}

			self.buildSelect($year,arr);
			
		}

		function birthdayMonth(year){
			
			$month[0].options.length = 1;
			if(!year){
				return;
			}
			var arr = [];
			for(var i = 1; i <= 12 ;i += 1){
				if(year == limitYear && i > (limitMonth+1)){
					break;
				}
				arr.push(i);
			}

			self.buildSelect($month,arr);
		}

		function birthdayDay(year,month){
			
			$day[0].options.length = 1;
			if(!year || !month){
				return;
			}
			var arr = [];
			month -= 1;
			var daysInMonth = getDaysInMonth(year,month);
			for(var i = 1; i <= daysInMonth ;i += 1){
				if(year == limitYear && month == limitMonth && i > limitDay){
					break;
				}
				arr.push(i);
			}

			self.buildSelect($day,arr);
		}

		birthdayYear();
		$year.change(function(){
			birthdayMonth($(this).val());
			birthdayDay();
		}).change();
		$month.change(function(){
			birthdayDay($year.val(),$(this).val());
		}).change();
	},
	initArea: function(){
		var self = this;

		var $province = this.$form.find('select[name="provinceId"]'),
			$city = this.$form.find('select[name="cityId"]'),
			$country = this.$form.find('select[name="countyId"]'),
			init = false;

		this.buildSelect($province,ms.area.province);
		$province.change(function(){
			self.buildSelect($city,ms.area.city[$province.val()]);
			if(init) self.buildSelect($country,{},-1);
		}).change();
		$city.change(function(){
			var cid = $city.val();
			if(cid == '' || cid == 0){
				self.buildSelect($country,{},-1);
				return;
			}
			$.getJSON('http://i.sohu.com/a/profile/service/county.htm',{'cid':cid},function(result){
				if(result.status == 0){
					self.buildSelect($country,result.data[0]);
				}
			});
		}).change();

		init = true;

	},
	bindEvent: function(){
		var self = this,
			$submit = this.$form.find('.action-submit');
		this.$form
		.delegate('input[name]:text,textarea[name]','focus',function(){
			if(msg[this.name]){
				self.hint($(this),msg[this.name].focus);
			}

		})
		.delegate('input[name]:text,textarea[name]','blur',function(){
			var re = self.check(this);
			if(re.empty){
				if(re.require) self.error($(this),msg[this.name].empty);
				else self.ok($(this),true);
			}
			else if(re.error){
				self.error($(this),msg[this.name].error);
			}
			else {
				self.ok($(this),'phoneagain,message'.indexOf(this.name) > -1);
				if(this.name == 'identityNumber' && re.birthday){
					self.autoInputBirthday(re.birthday);
				}
			}
		})
		.submit(function(){
			if(!self.checkAll()) return false;

			$submit.addClass('disabled');
			$submit.data('isDisabled',true);

			function enabled(){
				$submit.removeClass('disabled');
				$submit.removeData('isDisabled');
			}

			$.post(this.action+'?_input_encode=UTF-8',$(this).serialize(),function(results){
				if(results.code == 0){
					if(results.msg) {
						location.href = results.msg;
					}else{
						$.inform({
							icon : 'icon-success',
							delay : 2000,
							easyClose : true,
							content : "提交成功"
						});
					}
				}else{
					$.alert(results.msg);
				}
				enabled();
			},'json');
			//10秒超时，如果还没返回，则重置按钮
			setTimeout(enabled,10000);

			return false;
		});

		//报名形式
		this.$form.find('[name="team"]').click(function(){
			if(this.checked){
				$(this).parent().siblings('span')[this.value == 2 ? 'show' : 'hide']();
			}

		});
		//曲风
		this.$form.find('input[name="songStyle"][value="11"]').click(function(){
			self.ok(self.$form.find('textarea[name="songStyleOther"]').prop('disabled',!this.checked),true);
		});
		//赛区
		this.$form.find('[name="auditionCity"]').click(function(){
			if(self.$form.find('[name="auditionCity"]:checked').length >= 2){
				self.$form.find('[name="auditionCity"]').not(':checked').prop('disabled',true);
			}else{
				self.$form.find('[name="auditionCity"]').prop('disabled',false);
			}
		})

		//获取验证码
		this.$form.delegate('.action-getcode','click',function(){
			if($(this).data('isDisabled')) return;
			self.getCode();
		})
		//验证
		.delegate('.action-checkcode','click',$.proxy(this.checkCode,this));


		//提交
		$submit.click(function(){
			if($submit.data('isDisabled')) return;
			self.$form.submit();
		});
	},
	initSwfupload: function(){
		var self = this,
			$aSwf = this.$form.find('a.cv-swf');
		if(this.swfu){
			this.swfu.destroy();
			$aSwf.find('.swfupload').remove();
		}
		$aSwf.html('<i id="voice_photo_upload"></i>');
		$aSwf.next(':text').val('');

		this.swfu = new SWFUpload({
            // Backend Settings       
			upload_url: "http://i.sohu.com/a/voice/app/upload",
            // File Upload Settings
            file_post_name: "uploadFile",
            file_size_limit : "10 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png;*.bmp",
            file_types_description : "图片文件",
            file_upload_limit : "0",

            // Event Handler Settings - these functions as defined in Handlers.js
            //  The handlers are not part of SWFUpload but are part of my website and control how
            //  my website reacts to the SWFUpload events.
            file_queue_error_handler : function(file, errorCode, message){
				try {
					var errorName = "";
					if (errorCode === SWFUpload.errorCode_QUEUE_LIMIT_EXCEEDED) {
						errorName = "You have attempted to queue too many files.";
					}

					if (errorName !== "") {
						//alert(errorName);
						return;
					}

					switch (errorCode) {
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							$.alert('图片文件太小，请检查图片属性。');
							break;
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							$.alert('图片过大，请选择小于10M的图片。');
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							$.alert('该文件不是支持的格式，请检查。');
							break;
						default:
							$.alert('让服务器再飞一会儿，请稍后再试。');
							break;
					}
				} catch (ex) {
					this.debug(ex);
				}
			
			},
            file_dialog_complete_handler : function(numFilesSelected, numFilesQueued){
				var that = this;
				
				try {
					if (numFilesQueued > 0) {
						var file = this.getFile(0);
						$aSwf.next(':text').val(file.name);
						self.startUpload();
					}
				} catch (ex) {
					this.debug(ex);
				}
			},
            upload_progress_handler : function(file, bytesLoaded){
				//显示进度
				try {
					var percent = Math.ceil((bytesLoaded / file.size) * 100);
					self.photoUPloadProgress(percent);
				} catch (ex) {
					this.debug(ex);
				}
			},
            upload_error_handler : function(file, errorCode, message){
				$.alert('让服务器再飞一会儿，请稍后再试。');
			},
            upload_success_handler : function(file, serverData){
				try {
					self.swfu.setButtonDisabled(false);
					var json = win["eval"]("(" + serverData + ")");
					if (json.code == 0) {
						self.photoUploadComplete(json.data);
					}else{
						$.alert(json.msg);
						self.photoUploadError();
					}
				}catch(ex){
					this.debug(ex);
				}
			},

            // Button Settings
            button_image_url : "http://js6.pp.sohu.com.cn/i/default/my/img/nil.gif", // http://js6.pp.sohu.com.cn/i/default/my/img/icon_picture_upload_w45.gif
            button_placeholder_id : 'voice_photo_upload',
            button_width: 337,
            button_height: 28,
            button_text : '',
            button_text_style : '',
            button_text_top_padding: 0,
            button_text_left_padding: 0,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,
            button_disabled : false,
            
            
            // Flash Settings
            flash_url : "http://i.sohu.com/asset/swfupload.swf",
            
            // Debug Settings
            debug: false
        });
	},
	photoUPloadProgress: function(percent){
		
	},
	photoUploadComplete: function(data){
		this.photoViewMode(data.url);
	},
	photoUploadError: function(){
		this.initSwfupload();

	},
	startUpload: function(){
		var self = this;
		if(this.swfu){
			try {
				$.post('/a/voice/app/get-token',function(results){
					if(results.code == 0){
						self.swfu.setPostParams({"token": results.data});
						self.swfu.startUpload();
					}else{
						$.alert('让服务器再飞一会儿，请稍后再试。');
					}
				},'json');
				
			}catch(ex){
				this.debug(ex);
			}
		}
	},
	photoViewMode: function(url){
		this.$form.find('span.cv-file > input:text').hide();
		this.$form.find('span.cv-file > span.cv-photo').html('<img src="'+url+'_w280" />').show();
		this.$form.find('[name="photo"]').val(url);
		this.$form.find('span.cv-file > input:button').val('更换图片');
		this.ok(this.$form.find('a.cv-swf'),true);
	},
	checkMobileWhenGetCode: function(){
		var $mobile = this.$form.find('[name="phoneview"]'),
			$mobileAgain = this.$form.find('[name="phoneagain"]');

		if($mobile.prop('disabled')) return true;

		if(this.isEmpty($mobile.val())){
			this.error($mobile,msg['phoneview'].empty);
			return false;
		}
		else if(!this.checkMobile($mobile.val())){
			this.error($mobile,msg['phoneview'].error);
			return false;
		}
		else{
			this.ok($mobile);
		}

		if(this.isEmpty($mobileAgain.val())){
			this.error($mobileAgain,msg['phoneagain'].empty);
			return false;
		}
		else if(!this.checkMobile($mobileAgain.val())){
			this.error($mobileAgain,msg['phoneagain'].error);
			return false;
		}
		else{
			this.ok($mobileAgain,true);
		}

		if($mobile.val() != $mobileAgain.val()){
			this.error($mobileAgain,msg['phoneagain'].error2);
			return false;
		}

		return true;
	},
	getCode: function(){
		var self = this;
		if(this.checkMobileWhenGetCode()){
			var $mobile = this.$form.find('[name="phoneview"]'),
				$mobileAgain = this.$form.find('[name="phoneagain"]'),
				$code = this.$form.find('[name="message"]');

			//如果没有禁用，说明是第一次获取验证码
			if(!$mobile.prop('disabled')){
				$mobile.prop('disabled',true);
				$mobileAgain.closest('div.form-item').hide();
				$code.closest('div.form-item').show();
			}
			this.disableGetCodeButton();
			$.post('/a/voice/app/message',{phone: $mobile.val()},function(results){
				if(results.code != 0){
					$.alert(results.msg);
					$mobile.prop('disabled',false);
					$mobileAgain.closest('div.form-item').show();
					$code.closest('div.form-item').hide();
					self.enableGetCodeButton();
				}
			},'json');

		}
	},
	disableGetCodeButton: function(){
		var self = this,time = 60,$btns = this.$form.find('.action-getcode');
		
		$btns.data('isDisabled',true);
		$btns.addClass('disabled').html('重新获取验证码('+(time--)+')');

		this.gcbTid = setInterval(function(){
			if(time > 0){
				$btns.addClass('disabled').html('重新获取验证码('+(time--)+')');
			}else{
				self.enableGetCodeButton();
			}
		},1000);
	},
	enableGetCodeButton: function(){
		var $btns = this.$form.find('.action-getcode');
		if(this.gcbTid){
			clearInterval(this.gcbTid);
			this.gcbTid = null;
		}
		$btns.removeClass('disabled').html('重新获取验证码');
		$btns.removeData('isDisabled');
	},
	checkCode: function(){
		var self = this,
			mobile = this.$form.find('[name="phoneview"]').val(),
			$code = this.$form.find('[name="message"]');
		if($code.val() == ''){
			this.error($code,'请进行手机号验证');
		}
		else if(!/^\d{6}$/.test($code.val())){
			this.error($code,'验证码错误，请重新填写');
		}
		else {
			$.post('/a/voice/app/check-message',{
				phone: mobile,
				message: $code.val()
			},function(results){
				if(results.code == 0){
					$code.closest('div.form-item').hide();
					self.$form.find('[name="mobile"]').val(mobile);
				}else{
					$.alert(results.msg);
				}

			},'json')
		}
	},
	isEmpty: function(value){
		if(value == ''){
			return true;
		}
		return false;
	},
	isOutOfRange: function(value,min,max){
		var	len = value.length;

		if(len < min || len > max){
			return true;
		}

		return false;
	},
	checkZipcode: function(value){
		return /^\d{6}$/.test(value);
	},
	checkEmail: function(value){
		//和后端一致的正则
		return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
		/*
		return /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(value);
		*/
	},
	checkPhone: function(value){
		return /^(\d+-?)*\d+$/.test(value);
	},
	checkMobile: function(value){
		return /^\d{11}$/.test(value);
	},
	checkIdentityNumber: function(value){
		//110228 19820221 2116
		var regx = /^\d{6}(\d{4})(\d{2})(\d{2})\d{3}[0-9xX]$/,
			match = value.match(regx);

		if(match){
			return {
				year: match[1],
				month: match[2]*1,
				date: match[3]*1
			}
		}
		return false;
	},
	//根据身份证匹配，自动填充生日
	autoInputBirthday: function(date){
		var $year = this.$form.find('select[name="year"]'),
			$month = this.$form.find('select[name="month"]'),
			$day = this.$form.find('select[name="day"]');
		
		if($year.val() == 0 && $month.val() == 0 && $day.val() == 0){
			$year.val(date.year).change();
			$month.val(date.month).change();
			$day.val(date.date);
		}
	},
	checkBirthday: function(){
		var $year = this.$form.find('select[name="year"]'),
			$month = this.$form.find('select[name="month"]'),
			$day = this.$form.find('select[name="day"]');

		if($year.val() == 0 || $month.val() == 0 || $day.val() == 0){
			return false;
		}

		return true;

	},
	checkArea: function(){
		var $province = this.$form.find('select[name="provinceId"]'),
			$city = this.$form.find('select[name="cityId"]'),
			$country = this.$form.find('select[name="countyId"]');

		if($province.val() == 0){
			return false;
		}

		return true;

	},
	check: function(ele){
		var $ele = $(ele),
			value = $.trim($ele.val()),
			re = {
				error: false,//是否出错
				empty: false,//是否为空
				require: false//是否必填
			};

		$ele.val(value);

		switch(ele.name){
			case 'name':
				re.require = true;
			case 'nationality':
			case 'profession':
				re.empty = this.isEmpty(value);
				re.error = this.isOutOfRange(value,2,30);
				break;
			case 'ethnic':
				re.empty = this.isEmpty(value);
				re.error = this.isOutOfRange(value,1,30);
				break;
			case 'address':
			case 'familyMembers':
			case 'graduateSchool':
				re.empty = this.isEmpty(value);
				re.error = this.isOutOfRange(value,2,120);
				break;
			case 'songStyleOther':
				re.require = true;
			case 'tvExperience':
			case 'regret':
			case 'wish':
			case 'description':
				re.empty = this.isEmpty(value);
				re.error = this.isOutOfRange(value,0,300);
				break;
			case 'identityNumber':
				var idMatch = this.checkIdentityNumber(value);
				re.empty = this.isEmpty(value);
				re.error = !idMatch;
				re.birthday = idMatch;//如果匹配出生日了
				break;
			case 'zipcode':
				re.empty = this.isEmpty(value);
				re.error = !this.checkZipcode(value);
				break;
			case 'qq':
				re.empty = this.isEmpty(value);
				re.error = re.empty;
				break;
			case 'email':
				re.empty = this.isEmpty(value);
				re.error = !this.checkEmail(value);
				break;
			case 'emergencyPhone':
			case 'homePhone':
				re.empty = this.isEmpty(value);
				re.error = !this.checkPhone(value);
				break;
			case 'phoneview':
			case 'phoneagain':
				re.empty = this.isEmpty(value);
				re.error = !this.checkMobile(value);
				re.require = true;
				break;
			case 'message':
				re.empty = this.isEmpty(value);
				re.error = !/^\d{6}$/.test(value);
				re.require = true;
				break;

		}

		return re;
	},
	checkAll: function(){
		var self = this,
			re = true,
			$firstError;

		//校验所有普通文本框
		this.$form.find('input[name]:text,textarea[name]').each(function(){
			if(!this.disabled){
				var ckRe = self.check(this),b;
				if(ckRe.empty){
					if(ckRe.require){
						self.error($(this),msg[this.name].empty);
						b = false;
					} 
					else{
						self.ok($(this),true);
						b = true;
					} 
				}
				else if(ckRe.error){
					self.error($(this),msg[this.name].error);
					b = false;
				}
				else {
					self.ok($(this));
					b = true;
				}
				re = re && b;
			}
		});

		//校验生日
		/*
		var $year = this.$form.find('select[name="year"]')
		if(!this.checkBirthday()){
			this.error($year,msg['birthday'].error);
			re = re && false;
		}else{
			this.ok($year);
		}
		*/
		//校验出生地
		/*
		var $province = this.$form.find('select[name="provinceId"]');
		if(!this.checkArea()){
			this.error($province,msg['area'].error);
			re = re && false;
		}else{
			this.ok($province)
		}
		*/
		//没有验证手机号
		if(this.$form.find('[name="mobile"]').val() == ''){
			var $getcodeBtn = this.$form.find('.action-getcode:visible');
			if($getcodeBtn.length && this.checkMobileWhenGetCode()){
				this.error($getcodeBtn,'请进行手机号验证');
				re = re && false;
			}
		}

		//没有上传图片
		if(this.$form.find('[name="photo"]').val() == ''){
			this.error(this.$form.find('a.cv-swf'),'请上传照片');
			re = re && false;
		}

		//曲风
		/*
		if(this.$form.find('[name="songStyle"]:checked').length == 0){
			this.error(this.$form.find('[name="songStyle"]').eq(0),'至少勾选一项');
			re = re && false;
		}else{
			this.ok(this.$form.find('[name="songStyle"]').eq(0),true);
		}
		*/
		//赛区
		/*
		if(this.$form.find('[name="auditionCity"]:checked').length == 0){
			this.error(this.$form.find('[name="auditionCity"]').eq(0),'至少勾选一项');
			re = re && false;
		}else{
			this.ok(this.$form.find('[name="auditionCity"]').eq(0),true);
		}
		*/

		//是否同意了条款
		if(this.$form.find('[name="agree"]').length){
			if(!this.$form.find('[name="agree"]').prop('checked')){
				re = re && false;
				$.alert('您必须接受《中国好声音 第二季》中的所有内容');

			}
		}
	
		$firstError = this.$form.find('span.alert-error:visible');
		if($firstError.length) $('body,html').animate({scrollTop: $firstError.offset().top - 60},'quick');
		return re;
	}

};


$(function(){

	form.init();

});

})(jQuery,mysohu);