/*
成长系统:新用户引导
*/
;
(function($,ms){

var userId = $space_config._xpt,
	ie6 = $.browser.msie && parseFloat($.browser.version) < 7,
	win = window,
	doc = document;

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
function addOption(select,text,value){
	var option = document.createElement('option');
	option.text = text;
	option.value = value;
	select.options.add(option);
}

function buildSelect($select,data,value){
	var option,select = $select[0];
	value = value ? value : ($select.attr('data-default-value') ? $select.attr('data-default-value') : '');
	$select.attr('data-default-value','');
	select.options.length = 1;
	for(var id in data){
		addOption(select,data[id],id);
	}
	$select.val(value);
}

//生日
function getDaysInMonth(year,month){
	return 32 - new Date(year, month, 32).getDate();
}
function birthdayYear($select){
	var now = new Date();
	var value = $select.attr('data-default-value') ? $select.attr('data-default-value') : '';
	$select.attr('data-default-value','');
	$select[0].options.length = 1;
	for(var i = now.getFullYear() ,len = 1900; i >= len ;i -= 1){
		addOption($select[0],i,i);
	}
	$select.val(value);
}
function birthdayMonth($select,year){
	$select[0].options.length = 1;
	if(!year){
		return;
	}
	var value = $select.attr('data-default-value') ? $select.attr('data-default-value') : '';
	$select.attr('data-default-value','');
	for(var i = 1; i <= 12 ;i += 1){
		addOption($select[0],i,i);
	}
	$select.val(value);
}

function birthdayDay($select,year,month){
	$select[0].options.length = 1;
	if(!year || !month){
		return;
	}
	var value = $select.attr('data-default-value') ? $select.attr('data-default-value') : '';
	$select.attr('data-default-value','');
	month -= 1;
	var daysInMonth = getDaysInMonth(year,month);
	for(var i = 1; i <= daysInMonth ;i += 1){
		addOption($select[0],i,i);
	}
	$select.val(value);
}

function workStartYear($select){
	var nowY = (new Date()).getFullYear();
	$select[0].options.length = 1;
	for(var i = 1976; i <= nowY ;i += 1){
		addOption($select[0],i,i);
	}
}
function workEndYear($select,syear){
	var nowY = (new Date()).getFullYear();
	$select[0].options.length = 1;
	if(syear == '' || syear == 0){
		return;
	}
	syear = parseInt(syear,10);
	for(var i = syear; i <= nowY ;i += 1){
		addOption($select[0],i,i);
	}
}
function entranceYear($select){
	birthdayYear($select);
}
var area = ms.area;



//ie6下垂直水平居中
    function ie6Fixed($o,left,top,st){
        $(doc).scrollTop(0);
        $o[0].style.cssText = 'left:'+left+'px;top:'+(top+st)+'px;top:expression(documentElement.scrollTop + ' + top + ' + "px");';
    }
//第一步填写表单
var stepOne = {
	isInited: false,
	focused: false,
	type: '1',
	schoolpop: null,
	sending: false,//正在提交
	init: function($form,type,callback){
		var self = this;

		this.type = type;
		this.$form = $form;
		
		switch(this.type){
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
		
			
		this.schoolpop = new ms.SchoolSearch();
		
		if(!this.isInited){
			var $nick = this.$form.find('[name=nick]');
			var $id = this.$form.find('[name=id]');
			$nick.data('passed',true)
				.blur(function(){
					if(self.checkNick()){
						self.tip('load',$nick);
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

			this.$form.delegate('input[type="text"]','click',function(){
				var $this = $(this);
				if($this.attr('name') == 'nick'){
					self.hint($this,'请填写2-12位以内的中英文字符和数字');
				}else{
					self.tip('hide',$this);
				}
			});
			
			var timeoutId = null;

			this.$form.submit(function(){
				if(self.check() && !self.sending){
					self.sending = true;//正在提交
					var param = self.$form.serialize();
					$.post(self.$form.attr('action'),param,function(results){
						self.sending = false;
						if(timeoutId) clearTimeout(timeoutId);
						if(results.code == 0){
							callback();//提交成功时候调用
						}else{
							var errInput = self.$form.find('[name='+results.data.type+']');
							if(errInput.length){
								self.error(errInput,results.msg);
								errInput.focus();
							}
						}
					},'json');
					//10秒后超时，可以再次提交
					timeoutId = setTimeout(function(){
						self.sending = false;
					},5000);
				}
				return false;
			});
			this.$form.find('div.from-btn input.next').hover(function(){
				$(this).addClass('next-hover');
			},function(){
				$(this).removeClass('next-hover');
			});
			//跳过
			this.$form.find('div.from-btn span.skip-wrapper a')
			.click(function(event){
				event.preventDefault();
				callback();
				//记录用户操作
				$.getJSON('/a/guide/anaylse.htm?type=skip1');
			});
			this.brith();
			this.status();
		}
		
		
		this.isInited = true;
	},
	status: function(){
		var self = this,
			$lis = this.$form.find('.from-status li'),
			type = this.$form.find('input[name="type"]').val();
		$lis.click(function(){
			var $this = $(this);
			if(!$this.hasClass('curr')){
				if($this.hasClass('work')){
					self.work();
				}
				else if($this.hasClass('student')){
					self.school();
				}
				else if($this.hasClass('other')){
					self.other();
				}
				$lis.removeClass('curr');
				$this.addClass('curr');
			}
		});
	},
	brith: function(){
		var $y = this.$form.find('select[name="birthdayYear"]'),
			$m = this.$form.find('select[name="birthdayMonth"]'),
			$d = this.$form.find('select[name="birthdayDay"]');

		birthdayYear($y);
		$y.change(function(){
				birthdayMonth($m,$(this).val());
				birthdayDay($d);
			}).change();
		$m.change(function(){
				birthdayDay($d,$y.val(),$(this).val());
			}).change();

	},
	work: function(){
		var self = this,
			html = [];
		html.push('<li><label><span class="red">*</span>单位名称：</label><div class="element"><input class="text" type="text" name="employer"></div></li>');
		html.push('<li><label>工作时间：</label><div class="element">');
		html.push('<select name="workstartYear"><option value="">请选择</option></select><span>至</span>');
		html.push('<select name="workendYear"><option value="">请选择</option></select>');
		html.push('<input type="checkbox" class="check" name="iscurrent" value="1"><span>目前在这个公司</span>');
		html.push('</div></li>');
		this.$form.find('ul.from-bottom').html(html.join(''));
		this.$form.find('input[name="type"]').val(1);
		this.type = '1';
		
		var $wsy = this.$form.find('select[name="workstartYear"]'),
			$wey = this.$form.find('select[name="workendYear"]'),
			$ck = this.$form.find('input[name="iscurrent"]');

		workStartYear($wsy);
		$wsy.change(function(){
			workEndYear($wey,$wsy.val());
		});
		$ck.click(function(){
			$wey[0].disabled = this.checked;
		});
	},
	school: function(){
		var self = this,
			html = [];

		html.push('<li><label>学校类型：</label><div class="element">');
		html.push('<select class="from-select from-select-school" name="csType"><option value="6">大学</option><option value="4">高中</option><option value="3">初中</option><option value="1">小学</option></select>');
		html.push('</div></li>');

		html.push('<li><label><span class="red">*</span>学校名称：</label><div class="element"><input class="text" type="text" name="csName"><input type="hidden" class="text" name="csId"></div></li>');
		
		html.push('<li><label>入学年份：</label><div class="element">');
		html.push('<select class="from-select from-select-school" name="csy"><option value="">选择年</option></select>');
		html.push('</div></li>');

		this.$form.find('ul.from-bottom').html(html.join(''));
		this.$form.find('input[name="type"]').val(2);
		this.type = '2';
		entranceYear(this.$form.find('select[name="csy"]'));
		
		var $csType = this.$form.find('[name="csType"]');
		var $csName = this.$form.find('[name="csName"]');
		var $csId = this.$form.find('[name="csId"]');
		$csName.attr('readonly','readonly');
		$csName.mousedown(function(){
			self.schoolpop.show({
				maskOpacity: 0,
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
	},
	other: function(){
		var self = this,
			html = [];
		html.push('<li><label>居住地：</label><div class="element">');
		html.push('<select class="from-select" name="provinceIdNow"><option value="">选择省份</option></select>');
		html.push('<select class="from-select" name="cityIdNow"><option value="">选择城市</option></select>');
		html.push('<select class="from-select" name="countyIdNow"><option value="">选择区县</option></select>');
		html.push('</div></li>');
		html.push('<li><label>出生地：</label><div class="element">');
		html.push('<select class="from-select" name="provinceIdb"><option value="">选择省份</option></select>');
		html.push('<select class="from-select" name="cityIdb"><option value="">选择城市</option></select>');
		html.push('<select class="from-select" name="countyIdb"><option value="">选择区县</option></select>');
		html.push('</div></li>');
		this.$form.find('ul.from-bottom').html(html.join(''));
		this.$form.find('input[name="type"]').val(3);
		this.type = '3';
		
		
		var $provinceIdNow = this.$form.find('[name=provinceIdNow]');
		var $cityIdNow = this.$form.find('[name=cityIdNow]').hide();
		var $countyIdNow = this.$form.find('[name=countyIdNow]').hide();
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
				if(win[varname]){
					if(win[varname].status == 0){
						buildSelect($countyIdNow,win[varname].data[0]);
						if($countyIdNow[0].options.length == 1){
							$countyIdNow.hide();
						}else{
							$countyIdNow.show();
						}
					}
					win[varname] = {};
				}
			});
		});
		var $provinceIdb = this.$form.find('[name=provinceIdb]');
		var $cityIdb = this.$form.find('[name=cityIdb]').hide();
		var $countyIdb = this.$form.find('[name=countyIdb]').hide();
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
				if(win[varname]){
					if(win[varname].status == 0){
						buildSelect($countyIdb,win[varname].data[0]);
						if($countyIdb[0].options.length == 1){
							$countyIdb.hide();
						}else{
							$countyIdb.show();
						}
					}
					win[varname] = {};
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
		var self = this,
			re = true,
			$nick = this.$form.find('[name=nick]');

		this.$form.find('input').each(function(){
			self.tip('hide',$(this));
		});

		if(!this.checkNick() || !$nick.data('passed')){
			if(!this.focused){
				$nick.focus();
				this.focused = true;
			}
			re = false;
		}
		
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
	checkBirth: function(){
		var $y = this.$form.find('select[name="birthdayYear"]'),
			$m = this.$form.find('select[name="birthdayMonth"]'),
			$d = this.$form.find('select[name="birthdayDay"]'),
			re = $y.val() == '' ? true : $y.val() && $m.val() && $d.val();
		if(!re){
			this.error($y,'请填写完整的生日');
		}
		return re;
	},
	checkWork: function(){
		var self = this ,re = true;
		var $employer = this.$form.find('[name="employer"]');
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
		return re;
	},
	checkOther: function(){
		var self = this ,re = true;
		return re;
	},
	tip: function(type,$o,text){
		var $p = $o.closest('li');
		if(!$p.find('p').length){
			$p.append('<p></p>');
		}
		if(!$p.find('i.guide-icon-right').length){
			$p.append('<i class="guide-icon-right"></i>');
		}
		$p.find('i.guide-icon-right').hide();
		if($o.attr('name') == 'nick'){
			if(!$p.find('i.guide-icon-load').length){
				$p.append('<i class="guide-icon-load"></i>');
			}
			$p.find('i.guide-icon-load').hide();
		}
		$o.removeClass('err');
		if(type == 'error'){
			$o.addClass('err');
			$p.find('p').addClass('err').html('<em><i class="guide-icon-err">错误</i>'+text+'</em>').show();
		}
		else if(type == 'hint'){
			$p.find('p').removeClass().html('<em>'+text+'</em>').show();
		}
		else if(type == 'hide'){
			$p.find('p').hide();
		}
		else if(type == 'ok'){
			$p.find('p').hide();
			$p.find('i.guide-icon-right').show();
		}
		else if(type == 'load'){
			$p.find('p').hide();
			$p.find('i.guide-icon-load').show();
		}
	},
	hint: function($o,text){
		this.tip('hint',$o,text);
	},
	error: function($o,errText){
		this.tip('error',$o,errText);
	},
	ok: function($o){
		this.tip('ok',$o);
	}
};

//第二步加好友
var stepTwo = {
	sending: false,
	init: function($box,data,callback){
		var self = this,
			followUrl = '/a/app/friend/addattentions.do',
			changeUrl = '/a/guide/search.htm';
		this.$box = $box;
		this.$ul = this.$box.find('ul.follow-list');
		this.build(data);

		this.$box
			.delegate('a.step-two-follow','click',function(){
				var $this = $(this),$li,xpt;
				if($this.closest('li[data-xpt]').length){
					$li = $this.closest('li[data-xpt]')
					xpt = $li.attr('data-xpt');
					$.get(followUrl,{
						'userid':xpt,
						'from_type': 'profile_new_user_guide'
					},function(results){
						if(results.code == 0){
							$li.find('a.step-two-follow').removeClass().addClass('already-attention').html('已跟随');
						}else{
							//$.alert(results.msg);
						}
					},'json');
				}
			})
			.delegate('div.ck-img','click',function(){
				var $this = $(this),
					$li = $this.closest('li');
				$li.toggleClass('follow');
				self.isSelectAll();
			});
		//换一换
		this.$box.find('div.from-btn a.change')
			.click(function(event){
				event.preventDefault();
				//记录用户操作
				$.getJSON('/a/guide/anaylse.htm?type=change');
				
				$.getJSON(changeUrl,{'page': self.nextPage},function(results){
					if(results.code == 0){
						self.build(results.data);
					}
				});
			});
		//跳过
		this.$box.find('div.from-btn span.skip-wrapper a')
			.click(function(event){
				event.preventDefault();
				//记录用户操作
				$.getJSON('/a/guide/anaylse.htm?type=skip2');
				callback();
			});
		//全选
		this.$box.find('div.from-btn input:checkbox').click(function(){
			if(this.checked){
				self.$ul.find('li').addClass('follow');
			}else{
				self.$ul.find('li').removeClass('follow');
			}
		});
		//下一步
		this.$box.find('div.from-btn input.next')
		.hover(function(){$(this).addClass('fl-next-hover');},function(){$(this).removeClass('fl-next-hover');})
		.click(function(){
			//log
			$.getJSON('/a/guide/anaylse.htm?type=next2', function() {
				if(self.sending){
					return;
				}
				var xpts = [];
				self.$ul.find('li.follow').each(function(){
					xpts.push($(this).attr('data-xpt'));
				});
				self.sending = true;
				$.post(followUrl+'?from_type=profile_new_user_guide',{
					'userid': xpts.join(',')
				},function(results){
					self.sending = false;
					callback();
				},'json');	
			});
			
			

		});
	},
	build: function(data){
		this.nextPage = data.page;
		var list = data.list;
		this.$ul.empty();
		for(var i=0;i<list.length;i+=1){
			this.$ul.append(this.line(list[i]));
		}
		this.$ul.find('li').addClass('follow');
		this.$box.find('.from-btn input:checkbox').attr('checked',true);
	},
	line: function(item){
		var $li = $('<li data-xpt="'+item.xpt+'"></li>'),
			html = [];

		html.push('<div class="photo">');
		html.push('<div class="img ck-img" style="cursor:pointer" data-log-click="add_name_click"><img src="'+item.photo+'"><span></span></div>');
		html.push('<div class="button"><a href="javascript:void(0)" class="step-two-follow" data-log-click="add_follow">跟随</a></div>');
		html.push('</div>');

		html.push('<div class="con">');
		html.push('<h2><a href="'+item.blog+'" title="'+item.nick+'" target="_blank" data-log-click="add_name_link">'+cutCjkString(item.nick,20,'',0)+'</a></h2>');
		html.push('<p>'+item.reason+'</p>');
		html.push('<p><i class="'+(item.sex == 1 ? 'w': 'm')+'"></i><span>'+item.province+'</span><span>'+item.city+'</span></p>');
		html.push('<p>跟随者<b>'+item.count+'</b></p>');
		html.push('</div>');
		return $li.html(html.join(''));
	},
	isSelectAll: function(){
		var $ck = this.$box.find('.from-btn input:checkbox');
		if(this.$ul.find('li:not([class~="follow"])').length){
			$ck.attr('checked',false);
		}else{
			$ck.attr('checked',true);
		}
	}
};

var stepThree = {
	init: function(){
		var issuc = window.$space_config && window.$space_config.issuc;
		$.getJSON('/a/guide/anaylse.htm?type=complete3&issuc=' + (issuc ? 'true' : 'false'));
		
		var html = [
		'<div class="guide-big-img-wrapper">',
			'<div class="guide-big-img">',
				'<a href="javascript:void(0)"></a>',
			'</div>',
		'</div>'
		].join('');
		$('body').attr('class','big-img').prepend(html);
		$('#footer').hide();
		setTimeout(function(){
			$('body').click(function(){
				$.getJSON('/a/guide/anaylse.htm?type=next3',function(){
					window.location.reload();
				});
			});
		},0);
	}
};

var newcomer = {
	init: function(){
		//alert('i am newcomer');
		var self = this,
			$body = $('body'),
			$mask = $('<div class="guide-mask"></div>'),
			$box = $('<div class="guide-wrapper"></div>'),
			html = [];

		this.$mask = $mask;
		this.$box = $box;

		$body.append($box);
		$box.hide();
		$('#footer').hide();
		this.loadHTML('/a/guide/tocom.htm',{},function(data){
			$box.show();
			self.adjust();
			stepOne.init(self.$box.find('form').eq(0),'1',function(){
				self.loadFollower();
				self.setFlag();
			});
		});

		this.adjust();
		$(win).bind('resize.newcomer',function(){
			self.adjust();
		});
	},
	adjust: function(){
		return;
		var self = this,
			$body = $('body'),
			dh = $(doc).height(),
			dw = $(win).width(),
			wh = $(win).height(),
			boxw = 690,
			boxh = 560;
		
		var top = (wh - boxh)/2;
		var left = (dw - boxw)/2;
		if(!ie6){
			this.$box.css({
				'left': left >= 0 ? left : 0,
				'top': top < 0 ? 0 : top
			});
		}else{
			ie6Fixed(this.$box,left >= 0 ? left : 0,top < 0 ? 0 : top,$(doc).scrollTop());
		}
		//this.$mask.width(dw).height(wh);
	},
	loadHTML: function(url,param,callback){
		var self = this;
		$.getJSON(url,param,function(results){
			if(results.code == 0){
				self.$box.html(results.data.view);
				callback(results.data);
			}
		})
	},
	loadFollower: function(){
		var self = this;
		this.loadHTML('/a/guide/search.htm',{'firstview':0},function(data){
			stepTwo.init(self.$box,data,function(){
				self.welcome();
			});
		});
	},
	welcome: function(){
		var self = this;
		this.$box.hide();
		stepThree.init();
        //self.nav();
	},
	nav: function(){
        win.location.reload();
	},
	setFlag: function(){
		//第一步完成，将完成标志位值1，当页面刷新时会显示完成提示
		//$.cookie('suc_newcomerguide_ic_' + userId,1,{expires: 7});
		//请求接口，将新用户引导标志位置真
		$.getJSON('/a/guide/updatetip.htm?type=2',function(data){
			if(data.code === 0){
				//取消这个cookie，不再显示进入首页后的新手引导内容
				//$.cookie('suc_newcomerguide_ic_', userId + '|1', {path: "/", domain: "i.sohu.com", expires: 365 * 100});
			}
		});
	}
	
};

//预加载图片
(function(){
	var img = new Image();
	img.src = 'http://s3.suc.itc.cn/i/guide/d/bg_body_img_big03.jpg';
})();


$(function(){
	if(window.$space_config && window.$space_config.issuc === true){
		newcomer.init();
	}else{
		stepThree.init();
	}
	
});


})(jQuery,mysohu);
