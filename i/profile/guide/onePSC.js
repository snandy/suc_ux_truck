/*
 *	空间 新用户引导 第一步
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var replaceCJK = /[\u2E80-\u9FFF\uF92C-\uFFE5]/g,
	testCJK    = /[\u2E80-\u9FFF\uF92C-\uFFE5]/;

function cjkLength(strValue){
	return strValue.replace(replaceCJK, "lv").length;
}

function isCjk(strValue){
	return testCJK.test(strValue);
}

function cutCjkString(str,len,suffix,slen){
	suffix = suffix || '';
	slen = slen || suffix.length;
	len -= slen;
	if(cjkLength(str) <= len){
		return str;
	}
	var s = str.split(''),c = 0,tmpA = [];
	for(var i=0;i<s.length;i+=1){
		if(c < len){
			tmpA[tmpA.length] = s[i];
		}
		if(isCjk(s[i])){
			c += 2;
		}else{
			c += 1;
		}
	}
	return tmpA.join('') + suffix;
}

var varname = 'varFriendsappCounty' + parseInt(Math.random() * 100000000);//街道变量名

//创建select项
function buildSelect($select,data,value){
	var option,select = $select[0];
	value = value ? value : ($select.attr('data-default-value') ? $select.attr('data-default-value') : '');
	$select.attr('data-default-value','');
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

var area = MYSOHU.area;

var project = {
	isInited: false,
	focused: false,
	type: '1',
	schoolpop: null,
	init: function(type){
		var self = this;

		this.type = type;
		this.$form = $('form').eq(0);
		
		switch(type){
			case '1':
				this.work();
				break;
			case '2':
				this.school();
				break;
			case '3':
				this.other();
				break;
		}
		
			
		this.schoolpop = new MYSOHU.SchoolSearch();
		
		if(!this.isInited){
			var $nick = this.$form.find('[name=nick]');
			var $id = this.$form.find('[name=id]');
			$nick.data('passed',true)
				.blur(function(){
					if(self.checkNick()){
						$.post('/a/profile/checknick?_input_encode=UTF-8',
							{d:$nick.val(),id: $id.val()}
							,function(data){
							if(data.code == 0){
								$nick.data('passed',true);
								self.ok($nick);
							}else{
								$nick.data('passed',false);
								self.error($nick,data.msg);
							}
						},'json');
					}
				});
			this.$form.submit(function(){
				if(self.check()){
					var param = self.$form.serialize();
					$.post(self.$form.attr('action'),param,function(data){
						if(data.code == 0){
							window.location = data.url;
						}else{
							var errInput = self.$form.find('[name='+data.type+']');
							if(errInput.length){
								self.error(errInput,data.statusText);
								errInput.focus();
							}
						}
					},'json');
				}
				return false;
			});
		}

		this.isInited = true;
	},
	work: function(){
		var self = this;
		var $provinceIdNow = this.$form.find('[name=provinceIdNow]').addClass('city');
		var $cityIdNow = this.$form.find('[name=cityIdNow]').addClass('city').hide();
		var $countyIdNow = this.$form.find('[name=countyIdNow]').addClass('city').hide();
		buildSelect($provinceIdNow,area.province);
		$provinceIdNow.change(function(){
			if($provinceIdNow.val() == '' || $provinceIdNow.val() == 0){
				$cityIdNow.hide();
				$countyIdNow.hide();
			}else{
				$cityIdNow.show();
			}
			self.ok($provinceIdNow);
			buildSelect($cityIdNow,area.city[$provinceIdNow.val()]);
			buildSelect($countyIdNow,{});
			$countyIdNow.hide();
		});
		$cityIdNow.change(function(){
			var cid = $cityIdNow.val();
			if(cid == '' || cid == 0){
				buildSelect($countyIdNow,{});
				$countyIdNow.hide();
				return;
			}
			$.getScript('http://i.sohu.com/a/profile/service/county.htm?cid='+cid+'&vn='+varname,function(){
				if(window[varname]){
					if(window[varname].status == 0){
						buildSelect($countyIdNow,window[varname].data[0]);
						if($countyIdNow[0].options.length == 1){
							$countyIdNow.hide();
						}else{
							$countyIdNow.show();
						}
					}
					window[varname] = {};
				}
			});
		});
		var $gsType = this.$form.find('[name=gsType]');
		var $gsName = this.$form.find('[name=gsName]');
		var $gsId = this.$form.find('[name=gsId]');
		$gsName.attr('readonly','readonly');
		$gsName.mousedown(function(){
			self.schoolpop.show({
				type: $gsType.val(),
				at: $gsName,
				onSelected: function(sName,sId){
					$gsName.val(sName);	
					$gsId.val(sId);
				}
			});
		});
		$gsType.change(function(){
			$gsName.val('');	
			$gsId.val('');
		});
	},
	school: function(){
		var self = this;
		var $csType = this.$form.find('[name=csType]');
		var $csName = this.$form.find('[name=csName]');
		var $csId = this.$form.find('[name=csId]');
		$csName.attr('readonly','readonly');
		$csName.mousedown(function(){
			self.schoolpop.show({
				type: $csType.val(),
				at: $csName,
				onSelected: function(sName,sId){
					$csName.val(sName);	
					$csId.val(sId);
				}
			});
		});
		$csType.change(function(){
			$csName.val('');	
			$csId.val('');
		});

		var $gsType = this.$form.find('[name=gsType]');
		var $gsName = this.$form.find('[name=gsName]');
		var $gsId = this.$form.find('[name=gsId]');
		$gsName.attr('readonly','readonly');
		$gsName.mousedown(function(){
			self.schoolpop.show({
				type: $gsType.val(),
				at: $gsName,
				onSelected: function(sName,sId){
					$gsName.val(sName);	
					$gsId.val(sId);
				}
			});
		});
		$gsType.change(function(){
			$gsName.val('');	
			$gsId.val('');
		});

		var $provinceIdNow = this.$form.find('[name=provinceIdNow]').addClass('city');
		var $cityIdNow = this.$form.find('[name=cityIdNow]').addClass('city').hide();
		var $countyIdNow = this.$form.find('[name=countyIdNow]').addClass('city').hide();
		buildSelect($provinceIdNow,area.province);
		$provinceIdNow.change(function(){
			if($provinceIdNow.val() == '' || $provinceIdNow.val() == 0){
				$cityIdNow.hide();
				$countyIdNow.hide();
			}else{
				$cityIdNow.show();
			}
			buildSelect($cityIdNow,area.city[$provinceIdNow.val()]);
			buildSelect($countyIdNow,{});
			$countyIdNow.hide();
		});
		$cityIdNow.change(function(){
			var cid = $cityIdNow.val();
			if(cid == '' || cid == 0){
				buildSelect($countyIdNow,{});
				$countyIdNow.hide();
				return;
			}
			$.getScript('http://i.sohu.com/a/profile/service/county.htm?cid='+cid+'&vn='+varname,function(){
				if(window[varname]){
					if(window[varname].status == 0){
						buildSelect($countyIdNow,window[varname].data[0]);
						if($countyIdNow[0].options.length == 1){
							$countyIdNow.hide();
						}else{
							$countyIdNow.show();
						}
					}
					window[varname] = {};
				}
			});
		});

	},
	other: function(){
		var self = this;
		var $provinceIdNow = this.$form.find('[name=provinceIdNow]').addClass('city');
		var $cityIdNow = this.$form.find('[name=cityIdNow]').addClass('city').hide();
		var $countyIdNow = this.$form.find('[name=countyIdNow]').addClass('city').hide();
		buildSelect($provinceIdNow,area.province);
		$provinceIdNow.change(function(){
			if($provinceIdNow.val() == '' || $provinceIdNow.val() == 0){
				$cityIdNow.hide();
				$countyIdNow.hide();
			}else{
				$cityIdNow.show();
			}
			self.ok($provinceIdNow);
			buildSelect($cityIdNow,area.city[$provinceIdNow.val()]);
			buildSelect($countyIdNow,{});
			$countyIdNow.hide();
		});
		$cityIdNow.change(function(){
			var cid = $cityIdNow.val();
			if(cid == '' || cid == 0){
				buildSelect($countyIdNow,{});
				$countyIdNow.hide();
				return;
			}
			$.getScript('http://i.sohu.com/a/profile/service/county.htm?cid='+cid+'&vn='+varname,function(){
				if(window[varname]){
					if(window[varname].status == 0){
						buildSelect($countyIdNow,window[varname].data[0]);
						if($countyIdNow[0].options.length == 1){
							$countyIdNow.hide();
						}else{
							$countyIdNow.show();
						}
					}
					window[varname] = {};
				}
			});
		});
		var $provinceIdb = this.$form.find('[name=provinceIdb]').addClass('city');
		var $cityIdb = this.$form.find('[name=cityIdb]').addClass('city').hide();
		var $countyIdb = this.$form.find('[name=countyIdb]').addClass('city').hide();
		buildSelect($provinceIdb,area.province);
		$provinceIdb.change(function(){
			if($provinceIdb.val() == '' || $provinceIdb.val() == 0){
				$cityIdb.hide();
				$countyIdb.hide();
			}else{
				$cityIdb.show();
			}
			buildSelect($cityIdb,area.city[$provinceIdb.val()]);
			buildSelect($countyIdb,{});
			$countyIdb.hide();
		});
		$cityIdb.change(function(){
			var cid = $cityIdb.val();
			if(cid == '' || cid == 0){
				buildSelect($countyIdb,{});
				$countyIdb.hide();
				return;
			}
			$.getScript('http://i.sohu.com/a/profile/service/county.htm?cid='+cid+'&vn='+varname,function(){
				if(window[varname]){
					if(window[varname].status == 0){
						buildSelect($countyIdb,window[varname].data[0]);
						if($countyIdb[0].options.length == 1){
							$countyIdb.hide();
						}else{
							$countyIdb.show();
						}
					}
					window[varname] = {};
				}
			});
		});
	},
	checkNick: function(func){
		var self = this;
		var $nick = this.$form.find('[name=nick]');
		var value = $.trim($nick.val());
		$nick.val(value);
		//var len = cjkLength(value);
		var len = value.length;
		if(value == ''){
			this.error($nick,'请您填写昵称');
			if(!this.focused){
				$nick.focus();
				this.focused = true;
			}
			return false;
		}
		/*
		if(len < 4 || len > 16){
		*/
		if(len < 2 || len > 12){
			this.error($nick,'请填写2-12位以内的中英文字符和数字');//请填写4-16位字符
			if(!this.focused){
				$nick.focus();
				this.focused = true;
			}
			return false;
		}
		return true;
	},
	check: function(){
		this.focused = false;
		var re = true;
		var $nick = this.$form.find('[name=nick]');
		if(!this.checkNick() || !$nick.data('passed')){
			if(!this.focused){
				$nick.focus();
				this.focused = true;
			}
			re = false;
		}
		$('#app-profile-guide span.data-item-clew').hide();
		switch(this.type){
			case '1':
				re = this.checkWork() && re;
				break;
			case '2':
				re = this.checkSchool() && re;
				break;
			case '3':
				re = this.checkOther() && re;
				break;
		}
		return re;
	},
	checkWork: function(){
		var self = this ,re = true;
		var $employer = this.$form.find('[name=employer]');
		var $provinceIdNow = this.$form.find('[name=provinceIdNow]');
		var employerValue = $.trim($employer.val());
		$employer.val(employerValue);
		var employerValueLen = cjkLength(employerValue);

		if(employerValue == ''){
			this.error($employer,'请您填写工作单位');
			if(!this.focused){
				$employer.focus();
				this.focused = true;
			}
			re = false;
		}else if(employerValueLen > 50){
			this.error($employer,'公司名称不能超过50个字符');
			if(!this.focused){
				$employer.focus();
				this.focused = true;
			}
			re = false;
		}
		if($provinceIdNow.val() == ''){
			this.error($provinceIdNow,'请您填写居住城市');
			if(!this.focused){
				$provinceIdNow.focus();
				this.focused = true;
			}
			re = false;
		}
		return re;
	},
	checkSchool: function(){
		var self = this ,re = true;
		var $csy = this.$form.find('[name=csy]');
		var $csName = this.$form.find('[name=csName]');
		var $csId = this.$form.find('[name=csId]');
		
		if($csId.val() == ''){
			this.error($csName,'请您填写学校名称');
			if(!this.focused){
				$csName.focus();
				this.focused = true;
			}
			re = false;
		}
		if($csy.val() == '' || $csy.val() == 0){
			this.error($csy,'请您填写入学时间');
			if(!this.focused){
				$csy.focus();
				this.focused = true;
			}
			re = false;
		}
		return re;
	},
	checkOther: function(){
		var self = this ,re = true;
		var $provinceIdNow = this.$form.find('[name=provinceIdNow]');
		if($provinceIdNow.val() == ''){
			this.error($provinceIdNow,'请您填写居住城市');
			if(!this.focused){
				$provinceIdNow.focus();
				this.focused = true;
			}
			re = false;
		}
		return re;
	},
	error: function($o,errText){
		var $p = $o.parent();
		if(!$p.find('span.data-item-clew').length){
			$p.append('<span class="data-item-clew"></span>');
		}
		$p.find('span.data-item-clew').html('<em>'+errText+'</em>').show();
	},
	ok: function($o){
		var $p = $o.parent();
		$p.find('span.data-item-clew').hide();
	}
};

window['guideStepOne'] = function(type){
	project.init(type);
}

$(function(){
	project.init('1');
});

})(jQuery);