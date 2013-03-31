/*
 *	babyapp-core
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,MYSOHU){
var app = 'babyapp';

var ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

//修正ie6下图片不缓存的问题
if(ieBug){
	try{
		//预加载表情和按钮图片
		new Image('http://s3.suc.itc.cn/i/baby_new/d/baby_info_button_bg.gif');
		new Image('http://s3.suc.itc.cn/d/icon_emoticon.gif');
		document.execCommand("BackgroundImageCache", false, true);
	}catch(e){}
}

if($[app]) {
	alert('$.' + app + ' has been defined');
	return false;
};

$[app] = {};

$[app].settings = {
	
};

//初始化
function getAppUrl(url){
	var aUrl = url.split('#');
	if(aUrl.length > 1){
		return aUrl[1];
	}
	return '';
};

var replaceCJK = /[\u2E80-\u9FFF\uF92C-\uFFE5]/g,
	testCJK    = /[\u2E80-\u9FFF\uF92C-\uFFE5]/;

// jQuery doesn't support a is string judgement, so I made it by myself.
function isString(obj) {
	return typeof obj == "string" || Object.prototype.toString.call(obj) === "[object String]";
};

function addZero(n){
	n = parseInt(n,10);
	return n < 10 ? '0' + n : n;
};


$[app].utils = {
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
	},
	isUndefined: function(value){
		return typeof value == 'undefined';
	},
	isString: isString
};

if(MYSOHU.area){
	$[app].utils.area = {
		provinceMap: MYSOHU.area.province,
		cityMap: MYSOHU.area.city
	}
}


$[app].init = function(config,autoHash) {
	var $this = this;
	if($[app].utils.isUndefined(autoHash)){
		autoHash = true;
	}
	$.extend($[app].settings, config);
	
	//通过url hash确定当前页面
	var currentPage = $[app].settings.defaultPage;
	var currentUrl = '';
	var url = location.href.split('#');
	if(url.length > 1) {
		url = url[1];
		$.each($[app].settings.pages, function(page, rest) {
			var re = new RegExp('^' + rest, 'ig');
			if(re.test(url)) {
				currentPage = page;
				currentUrl = url;
				return false;
			}
		});
	};
	if(currentUrl){
		$[app].pageview.call($this, currentPage, {'url': currentUrl,'autoHash':autoHash});
	}else{
		$[app].pageview.call($this, currentPage,{'autoHash':autoHash});
	}
	
	return $this;
};

/*前台页初始化*/
function formatShowUrl(url){
	var regx = /^uid=/ig;
	var params = url.split('?')[1];
	var re = [];
	if(params){
		var p = params.split('&');
		for(var i=0;i<p.length;i+=1){
			if(!regx.test(p[i])){
				re[re.length] = p[i];
			}
		}
	}
	re[re.length] = 'uid='+ getUid();
	return re.join('&');
}

function getUid(){
	return window['_uid'] || (window.$space_config ? $space_config._uid : '');
}

$[app].initShow = function(config,autoHash) {
	var $this = this;
	if($[app].utils.isUndefined(autoHash)){
		autoHash = true;
	}
	$.extend($[app].settings, config);
	
	//通过url hash确定当前页面
	var currentPage = $[app].settings.defaultPage;
	var currentUrl = '';
	var url = location.href.split('#');
	if(url.length > 1) {
		url = url[1];
		$.each($[app].settings.pages, function(page, rest) {
			var re = new RegExp('^' + rest, 'ig');
			if(re.test(url)) {
				currentPage = page;
				currentUrl = url;
				return false;
			}
		});
	};
	if(currentUrl){
		$[app].pageview.call($this, currentPage, {'param': formatShowUrl(currentUrl) ,'autoHash':autoHash});
	}else{
		$[app].pageview.call($this, currentPage,{'param':{'uid':getUid()},'autoHash':autoHash});
	}
	
	return $this;
};

//页面显示
$[app].pageview = function(page, settings, options) {
	var $this = this;
	if(!arguments[1]) {
		var settings = {};
	}
	if(!arguments[2]) {
		var options = {};
	}
	
	var defaults = {
		url: $[app].settings.pages[page],
		param: "",
		method: "get",
		target: $this
	};
	
	var opts = $.extend(defaults, settings);
	
	$.appview(opts);
};


//用于closest方式的mouseover和mouseout事件
$[app].within = function(event, callback) {
	var $this = this;
	var parent = event.relatedTarget;
	var el = $this.get(0);
	try {
		while (parent && parent !== el) {
			parent = parent.parentNode;
		}
		if (parent !== el) {
			callback();
		}
	} catch(e) {}
};

var ajaxUrls = {
	createNote: '/baby/calendar_do.php',//新建日历项
	deleteNote: '/baby/calendar_do.php'//删除日历项
};


function login(){
	if(!$.cookie("ppinf")) {
		$.ppDialog({
			appId: '1019',
			regRedirectUrl: location.href,
			title: '想要查看更多精彩内容，马上登录吧！',
			onLogin: function(userId) {
				location.reload();
			}
		});
		return false;
	}
	return true;
}

/*添加日历项*/
$[app].createNote = function(date,content,callback){
	if(!login()){
		return;
	}
	/*
	xpt是base64后的passport
	*/
	if(date && content){
		$.post(ajaxUrls.createNote,{
			'action':'create',
			'date':date,
			'content':content
		},function(results){
			if(results.code == 0){
				if($.isFunction(callback)){
					//@id 日历项的id
					callback(results.data);
				}
			}else{
				$.alert(results.msg);
			}
		},'json');
	}
};

/*删除日历项*/
$[app].deleteNote = function(cid,callback){
	if(!login()){
		return;
	}
	/*
	xpt是base64后的passport
	*/
	if(cid){
		$.post(ajaxUrls.deleteNote,{
			'action':'delete',
			'calendar_id':cid
		},function(results){
			if(results.code == 0){
				if($.isFunction(callback)){
					//@
					callback(results.data);
				}
			}else{
				$.alert(results.msg);
			}
		},'json');
	}
};


/*每次页面初始化时先执行的代码*/
$[app].onPageLoaded = function(){
	
}

/*页面跳转*/
$[app].gotoAppview = function(url,target){
	$.appview({
		url: url,
		method: 'get',
		target: target
	});
}


/*日历基础函数*/
var calendar = {
	/*
		month: 0 - 11
	*/
	_getDaysInMonth: function(year, month) {
		return 32 - new Date(year, month, 32).getDate();
	},
	_getFirstDayOfMonth: function(year, month) {
		return new Date(year, month, 1).getDay();
	},
	/* Handle switch to/from daylight saving.
	Hours may be non-zero on daylight saving cut-over:
	> 12 when midnight changeover, but then cannot generate
	midnight datetime, so jump to 1AM, otherwise reset.
	@param  date  (Date) the date to check
	@return  (Date) the corrected date */
	_daylightSavingAdjust: function(date) {
		if (!date) return null;
		date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
		return date;
	},
	formatDate: function(date){
		return date.getFullYear() + '-' + addZero(date.getMonth()+1) + '-' + addZero(date.getDate());
	},
	getDate: function(date){
		if(isString(date) && /\d{4}-\d{1,2}-\d{1,2}/.test(date)){
			var ary = date.split('-');
			return new Date(ary[0],parseInt(ary[1],10)-1,parseInt(ary[2],10));
		};
		return date;
	},
	getCurrentDate: function(datestring){
		var date,y,m,d;
		date = new Date();
		y = date.getFullYear();
		m = date.getMonth();
		d = date.getDate();
		
		return this._daylightSavingAdjust(new Date(y,m,d));
	},
	/*
		inst = {
			drawYear: 2011,
			drawMonth: 0 - 11
		}
	*/
	getMonth: function(inst){
		var opts = {
			drawYear: new Date().getFullYear(),
			drawMonth: new Date().getMonth()
		};
		$.extend(opts,inst);
		var dList = [];
		var drawYear = opts.drawYear;
		var drawMonth = opts.drawMonth;
		var firstDay = 1;//一星期的第一天从星期几开始，这里设置成星期一
		var stepMonths = 1;
		var currentDate = this.getCurrentDate();
		var daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
		var leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
		var numRows = Math.ceil((leadDays + daysInMonth) / 7);// calculate the number of rows to generate
		var printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
		for (var dRow = 0; dRow < numRows; dRow++) {
			dList[dRow] = [];
			for (var dow = 0; dow < 7; dow++) {
				dList[dRow][dow] = {
					date: new Date(printDate),
					string: this.formatDate(printDate),
					week: printDate.getDay(),
					weekOfMonth: dRow
				};
				printDate.setDate(printDate.getDate() + 1);
				printDate = this._daylightSavingAdjust(printDate);
			};
		};
		return {
			'drawYear': drawYear,
			'drawMonth': drawMonth,
			'currentDate': currentDate,
			'dList': dList,
			'prev': this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)),
			'next': this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1))
		};
	},
	getWeek: function(inst){
		var opts = {
			drawYear: new Date().getFullYear(),
			drawMonth: new Date().getMonth(),
			drawDate: new Date().getDate()
		};
		$.extend(opts,inst);
		var stepDate = 1;
		var month = this.getMonth(opts);
		var currentDate = month.currentDate;
		var dList = month.dList;
		var drawDateString = this.formatDate(new Date(opts.drawYear,opts.drawMonth,opts.drawDate));
		var weekDateList;
		for (var dRow = 0; dRow < dList.length; dRow++) {
			for (var dow = 0; dow < 7; dow++) {
				if(dList[dRow][dow].string == drawDateString){
					weekDateList = dList[dRow];
					break;
				};
			};
			if(weekDateList){
				break;
			};
		};
		var firstDate = new Date(weekDateList[0].date);
		var lastDate = new Date(weekDateList[6].date);
		return {
			'drawYear': opts.drawYear,
			'drawMonth': opts.drawMonth,
			'drawDate': opts.drawDate,
			'currentDate': currentDate,
			'weekDateList': weekDateList,
			'prev': this._daylightSavingAdjust(new Date(firstDate.setDate(firstDate.getDate() - stepDate))),
			'next': this._daylightSavingAdjust(new Date(lastDate.setDate(lastDate.getDate() + stepDate)))
		};
	}
};
/*弹出日历*/
var miniCalendar = function(settings){
	var defaults = {
		appendTo: '',
		date: new Date(),
		mode: 'week',
		onClick: function(datestring){}
	};
	this.options = $.extend(defaults,settings);
	this.init();
}
miniCalendar.prototype = {
	init: function(){
		this.container = $('<div class="calendar-window"></div>');
		
		var selectContainer = $('<div class="calendar-switch clearfix"></div>');
		selectContainer.html('<span class="jt_left babyapp-btn-left"></span><select class="babyapp-select-year"></select><select class="babyapp-select-month"></select><span class="jt_right babyapp-btn-right"></span>');
		this.container.append(selectContainer);
		
		var titleContainer = $('<div class="calendar-week-title clearfix"></div>');
		titleContainer.html('<ul><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li><li>日</li></ul>');
		this.container.append(titleContainer);
		
		this.calendarContainer = $('<div class="calendar-data"></div>');
		this.container.append(this.calendarContainer);
		
		this.dateLimit = this.initSelect(calendar.getDate(this.options.date));
		this.update(calendar.getDate(this.options.date));
		this.container.appendTo($(this.options.appendTo));
		this.bindEvent();
		this.hide();
	},
	initSelect: function(date){
		var i,opt,selYear = this.container.find('select.babyapp-select-year'),selMonth = this.container.find('select.babyapp-select-month');
		var nowYear = new Date().getFullYear() + 2;
		var startYear = 2000;
		if(date.getFullYear() < startYear){
			startYear = date.getFullYear();
		}
		if(date.getFullYear() > nowYear){
			nowYear = date.getFullYear();
		}
		selYear[0].options.length = 0;
		selMonth[0].options.length = 0;
		for(i = nowYear; i >= startYear ;i -=1){
			opt = document.createElement('option');
			opt.text = i + '年';
			opt.value = i;
			selYear[0].options.add(opt);
		}
		for(i = 1; i <= 12 ;i +=1){
			opt = document.createElement('option');
			opt.text = i + '月';
			opt.value = i;
			selMonth[0].options.add(opt);
		}
		return {
			begin: startYear+'-01',
			end: nowYear+'-12'
		};
	},
	bindEvent: function(){
		var that = this;
		this.container.find('span.babyapp-btn-left,span.babyapp-btn-right').click(function(){
			var btn = $(this);
			if(!btn.hasClass('jt_left_no') && !btn.hasClass('jt_right_no')){
				that.update(btn.data('babyapp-date'));
			}
		}).hover(function(){
			var btn = $(this);
			if(btn.hasClass('jt_left')){
				btn.removeClass('jt_left').addClass('jt_left_hover');
			}
			if(btn.hasClass('jt_right')){
				btn.removeClass('jt_right').addClass('jt_right_hover');
			}
		},function(){
			var btn = $(this);
			if(btn.hasClass('jt_left_hover')){
				btn.removeClass('jt_left_hover').addClass('jt_left');
			}
			if(btn.hasClass('jt_right_hover')){
				btn.removeClass('jt_right_hover').addClass('jt_right');
			}
		});
		this.container.find('select').change(function(){
			var selYear = that.container.find('select.babyapp-select-year'),selMonth = that.container.find('select.babyapp-select-month');
			var datestring = selYear.val() + '-' + addZero(selMonth.val()) + '-01';
			var date = calendar.getDate(datestring);
			that.update(date);
		});
		this.calendarContainer.click(function(event){
			var $target = $(event.target),datestring;
			if($target.closest('[data-babyapp-date]').length){
				datestring = $target.closest('[data-babyapp-date]').attr('data-babyapp-date');
				//这里执行appview请求
				if($.isFunction(that.options.onClick)){
					that.options.onClick(datestring);
				}
			}
		});
	},
	update: function(date){
		var month = calendar.getMonth({
			drawYear: date.getFullYear(),
			drawMonth: date.getMonth()
		});
		var currentDate = month.currentDate;
		var dRow,dow,obj,dList = month.dList;
		var html = '<ul>';
		for (dRow = 0; dRow < dList.length; dRow+=1) {
			for (dow = 0; dow < 7; dow++) {
				obj = dList[dRow][dow];
				if(obj.date.getMonth() == month.drawMonth){
					html += '<li data-babyapp-date="'+calendar.formatDate(obj.date)+'"><a href="javascript:void(0)">'+obj.date.getDate()+'</a></li>';
				}else{
					html += '<li></li>';
				}	
			}
		}
		html += '</ul>';
		this.calendarContainer.html(html);
		//更新select
		var selYear = this.container.find('select.babyapp-select-year'),selMonth = this.container.find('select.babyapp-select-month');
		selYear.val(date.getFullYear());
		selMonth.val(date.getMonth()+1);
		//上下月按钮
		this.container.find('span.babyapp-btn-left').data('babyapp-date',month.prev);
		this.container.find('span.babyapp-btn-right').data('babyapp-date',month.next);
		//如果日历到达了边界，则上下按钮变灰
		var drawDate = date.getFullYear() + '-' + addZero(date.getMonth()+1);
		if(this.dateLimit.begin == drawDate){
			this.container.find('span.babyapp-btn-left').removeClass('jt_left').addClass('jt_left_no');
		}else{
			this.container.find('span.babyapp-btn-left').removeClass('jt_left_no').addClass('jt_left');
		}
		if(this.dateLimit.end == drawDate){
			this.container.find('span.babyapp-btn-right').removeClass('jt_right').addClass('jt_right_no');
		}else{
			this.container.find('span.babyapp-btn-right').removeClass('jt_right_no').addClass('jt_right');
		}
		this.highLight(date);
	},
	highLight: function(date){
		var initDate = calendar.getDate(this.options.date);
		var initDateString = calendar.formatDate(initDate);
		var currentDate =  calendar.formatDate(calendar.getCurrentDate());
		var week,weekDateList,dow,len,obj,dateString;
		if(date.getFullYear() == initDate.getFullYear() && date.getMonth() == initDate.getMonth()){
			if(this.options.mode == 'week'){
				week = calendar.getWeek({
					drawYear: initDate.getFullYear(),
					drawMonth: initDate.getMonth(),
					drawDate: initDate.getDate()
				});
				weekDateList = week.weekDateList;
				for (dow = 0 , len = weekDateList.length; dow < len; dow++) {
					obj = weekDateList[dow];
					dateString = calendar.formatDate(obj.date);
					this.calendarContainer.find('[data-babyapp-date='+dateString+']').addClass('week');
				}
			}else if(this.options.mode == 'day'){
				this.calendarContainer.find('[data-babyapp-date='+initDateString+']').addClass('week');
			}else if(this.options.mode == 'month'){
				this.calendarContainer.find('[data-babyapp-date]').addClass('week');
			}
		}
		this.calendarContainer.find('[data-babyapp-date='+currentDate+']').removeClass().addClass('today');
	},
	show: function(){
		var that = this;
		this.container.show();
		setTimeout(function(){
			$(document).bind('mousedown.miniCalendar',function(event){
				if(!$(event.target).closest('.calendar-window').length){
					that.hide();
				}
			});
		},1);
	},
	hide: function(){
		this.container.hide();
		$(document).unbind('mousedown.miniCalendar');
	}
};


$[app].calendar = calendar;

$[app].miniCalendar = function(settings){
	return new miniCalendar(settings);
}


$[app].fillCount = function(){
	var ids = [];
	$('[data-itemid]').each(function(){
		ids[ids.length] = 'baby_' + $(this).attr('data-itemid');
	});
	//评论转发数
	if(ids.length > 0){
		$.getJSON('/a/app/mblog/getCounts.htm',{ids:ids.join(',')},function(data){
			$('[data-itemid]').each(function(){
				var $ele = $(this),obj = data[$ele.attr('data-itemid')];
				if(obj){ 
					if(obj.commentcount > 0) $ele.find('[action="comment"],[action="baby.comment"]').html('评论('+obj.commentcount+')');
				}
			});
		});
	}
}

})(jQuery,MYSOHU);