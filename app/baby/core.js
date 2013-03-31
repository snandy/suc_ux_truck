/*
 *	babyapp-core
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){
var win = window,
	ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

//修正ie6下图片不缓存的问题
/*
if(ieBug){
	try{
		
		new Image('http://s3.suc.itc.cn/i/baby_new/d/baby_info_button_bg.gif');
		new Image('http://s3.suc.itc.cn/d/icon_emoticon.gif');
		document.execCommand("BackgroundImageCache", false, true);
	}catch(e){}
}
*/
var replaceCJK = /[\u2E80-\u9FFF\uF92C-\uFFE5]/g,
	testCJK    = /[\u2E80-\u9FFF\uF92C-\uFFE5]/;

//用来验证接口的合法性，只有在数组内的才是合法的
var javaApi = {
	idef: '/a/app/baby/calendar.ac',//个人中心默认
	i: [
		'/a/app/baby/babyInfo.ac',//激活
		'/a/app/baby/selectModify.ac',//修改
		'/a/app/baby/forPregnant.ac',//备孕
		'/a/app/baby/gravid.ac',//准妈妈
		'/a/app/baby/babyBorn.ac',//家有儿女
		'/a/app/baby/selectFriends.ac',//加好友
		'/a/app/baby/calendar.ac',//日历
		'/a/app/baby/babyPic.ac',//照片墙
		'/a/app/baby/square.ac'//广场
	],
	sdef: '/a/app/baby/baby_show.ac',//前台展示默认
	s: [
		'/a/app/baby/baby_show.ac',//日，月
		'/a/app/baby/photo_show.ac',//照片墙
		'/a/app/baby/comments_show.ac'//最终页
	]
};

var nick = (function(){
	if($space_config && $space_config._sucNick){
		return $space_config._sucNick;
	}
	else if(win._sucNick){
		return win._sucNick;
	}
	return '';
})();


var ba = {
	nick: nick,
	getUid: function(){
		//return win._uid || '';
		return this.getXpt();
	},
	getXpt: function(){
		return $space_config && $space_config._xpt;
	},
	utils: {
		cjkLength: function(strValue){
			return strValue.replace(replaceCJK, "aa").length;
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
		isString: function(obj){
			return typeof obj == "string" || Object.prototype.toString.call(obj) === "[object String]";
		},
		addZero: function(n){
			n = parseInt(n,10);
			return n < 10 ? '0' + n : n;
		},
		timeago : function(now_time,time) {
			var diff = now_time - time;
			if (diff < 300000)
				return '刚刚';
			if (diff < 3600000)
				return (diff / 60000 << 0) + '分钟前';
			if ((now_time / 86400000 << 0) == (time / 86400000 << 0)) {// 同一天
				var t = new Date(time), hh = t.getHours(), mm = t.getMinutes();
				return '今日 ' + (hh < 10 ? 0 : '') + hh + ':' + (mm < 10 ? 0 : '') + mm;
			} else {
				var t = new Date(time), YY = t.getFullYear(), MM = t.getMonth() + 1, DD = t.getDate(), hh = t.getHours(), mm = t.getMinutes();
				return (YY == new Date(now_time).getFullYear() ? '' : YY + "年") + (MM < 10 ? 0 : '') + MM + "月" + (DD < 10 ? 0 : '') + DD + "日 " + (hh < 10 ? 0 : '') + hh + ':'
				+ (mm < 10 ? 0 : '') + mm;

			}

		},
		addParamsToUrl: function(url,ext){
			var args = {},
				match = null,
				uA = url.split('?');

			ext = ext || {};

			if(uA[1]){
				var reg = /(?:([^&]+)=([^&]+))/g;
				while((match = reg.exec(uA[1]))!==null){
					args[match[1]] = match[2];
				}
			}
			$.extend(args,ext);
			return uA[0] + '?' + $.param(args);
		}
	},
	loadPage: function(from,opts){
		opts = opts || {};
		var pages = javaApi[from],
			url = opts.url;
		if(!url){
			url = win.location.hash.split('#')[1] || '';
		}
		for(var i=0,len=pages.length;i<len;i+=1){
			if(url.indexOf(pages[i]) > -1){
				break;
			}
		}
		if(i == len || !url || (from == 's' && url == '/a/app/baby/comments_show.ac')) url = javaApi[from+'def'];//如果没找到合适的页面，则使用标准的
		
		//ie6下锚点带?会被阶段，所以用一个特殊符号来代替?
		url = url.replace('=^_^=','?').replace(/=%5E_%5E=/i,'?');

		if(from == 'i'){
			opts.url = url;
		}else if(from == 's'){
			opts.url = this.utils.addParamsToUrl(url,{uid: this.getUid()});
		}
		
		

		var defaults = {
			url: url,
			param: "",
			method: "get",
			target: $('#innerCanvas')
		};
		
		$.appview($.extend(defaults,opts));
		
	},
	onPageLoaded: function($box){
		//替换时间显示
		var now = new Date().getTime();
		$box.find('[data-babyapp-ts]').each(function(){
			var $o = $(this);
			$o.html(ba.utils.timeago(now,$o.attr('data-babyapp-ts')*1));
		});
	}
};

/*日历基础函数*/
var calendarApi = {
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
		return date.getFullYear() + '-' + ba.utils.addZero(date.getMonth()+1) + '-' + ba.utils.addZero(date.getDate());
	},
	getDate: function(date){
		if(ba.utils.isString(date) && /\d{4}-\d{1,2}-\d{1,2}/.test(date)){
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
var MiniCalendar = function(settings){
	var defaults = {
		appendTo: '',
		date: new Date(),
		mode: 'week',
		onClick: function(datestring){}
	};
	this.options = $.extend(defaults,settings);
	this.init();
}
MiniCalendar.prototype = {
	init: function(){
		this.container = $('<div class="calendar-window"></div>');
		
		var selectContainer = $('<div class="calendar-switch clearfix"></div>');
		selectContainer.html('<a class="left babyapp-btn-left" href="#"></a><select class="babyapp-select-year"></select><select class="babyapp-select-month"></select><a class="right babyapp-btn-right" href="#"></a>');
		this.container.append(selectContainer);
		
		var titleContainer = $('<div class="calendar-week-title clearfix"></div>');
		titleContainer.html('<ul><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li><li>日</li></ul>');
		this.container.append(titleContainer);
		
		this.calendarContainer = $('<div class="calendar-data clearfix"></div>');
		this.container.append(this.calendarContainer);
		
		this.dateLimit = this.initSelect(calendarApi.getDate(this.options.date));
		this.update(calendarApi.getDate(this.options.date));
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
		this.container.find('a.babyapp-btn-left,a.babyapp-btn-right').click(function(event){
			event.preventDefault();
			var btn = $(this);
			if(!btn.hasClass('left-over') && !btn.hasClass('right-over')){
				that.update(btn.data('babyapp-date'));
			}
		});
		this.container.find('select').change(function(){
			var selYear = that.container.find('select.babyapp-select-year'),selMonth = that.container.find('select.babyapp-select-month');
			var datestring = selYear.val() + '-' + ba.utils.addZero(selMonth.val()) + '-01';
			var date = calendarApi.getDate(datestring);
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
		var month = calendarApi.getMonth({
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
					html += '<li data-babyapp-date="'+calendarApi.formatDate(obj.date)+'"><a href="javascript:void(0)">'+obj.date.getDate()+'</a></li>';
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
		var $btnLeft = this.container.find('a.babyapp-btn-left'),
			$btnRight = this.container.find('a.babyapp-btn-right');

		$btnLeft.data('babyapp-date',month.prev);
		$btnRight.data('babyapp-date',month.next);
		//如果日历到达了边界，则上下按钮变灰
		var drawDate = date.getFullYear() + '-' + ba.utils.addZero(date.getMonth()+1);
		if(this.dateLimit.begin == drawDate){
			$btnLeft.addClass('left-over');
		}else{
			$btnLeft.removeClass('left-over');
		}
		if(this.dateLimit.end == drawDate){
			$btnRight.addClass('right-over');
		}else{
			$btnRight.removeClass('right-over');
		}
		this.highLight(date);
	},
	highLight: function(date){
		var initDate = calendarApi.getDate(this.options.date);
		var initDateString = calendarApi.formatDate(initDate);
		var currentDate =  calendarApi.formatDate(calendarApi.getCurrentDate());
		var week,weekDateList,dow,len,obj,dateString;
		if(date.getFullYear() == initDate.getFullYear() && date.getMonth() == initDate.getMonth()){
			if(this.options.mode == 'week'){
				week = calendarApi.getWeek({
					drawYear: initDate.getFullYear(),
					drawMonth: initDate.getMonth(),
					drawDate: initDate.getDate()
				});
				weekDateList = week.weekDateList;
				for (dow = 0 , len = weekDateList.length; dow < len; dow++) {
					obj = weekDateList[dow];
					dateString = calendarApi.formatDate(obj.date);
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
			$(document).bind('mousedown.MiniCalendar',function(event){
				if(!$(event.target).closest('.calendar-window').length){
					that.hide();
				}
			});
		},1);
	},
	hide: function(){
		this.container.hide();
		$(document).unbind('mousedown.MiniCalendar');
	}
};

function login(){
	if(!$.cookie("ppinf")) {
		if(!$.ppDialog) {
			location.href="http://i.sohu.com";
		}else{
			$.ppDialog({
				appId : '1019',
				regRedirectUrl : location.href,
				title : '想要查看更多精彩内容，马上登录吧！',
				onLogin : function(userId) {
					location.reload();
				}
			});
		}
		return false;
	}
	return true;
}


//ajax接口
var ajax = {
	add: function(params,callback){
		if(!login()){
			return;
		}
		/*
		{
		date: '2012-12-31',
		text: 'hello world',
		pic: 'http://....jpg'
		}
		*/
		params = params || {};
		if(params.date && params.text){
			$.post('/a/app/baby/addCalendar.ac',params,function(results){
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
	},
	get: function(params,callback){
		/*
		{
		id: '用户消息的id',
		aid: '系统推送的id'
		}
		*/
		params = params || {};
		var url = '';
		if(params.aid){
			url = '/a/app/baby/clickAdClendar.ac';
		}
		else if(params.id){
			url = '/a/app/baby/clickBbClendar.ac';
		}
		
		if(url){
			$.getJSON(url,params,function(results){
				if(results.code == 0){
					if($.isFunction(callback)){
						//@id 日历项的id
						callback(results.data);
					}
				}else{
					$.alert(results.msg);
				}
			});
		}
	
	},
	del: function(params,callback){
		if(!login()){
			return;
		}
		/*
		{
		id: '用户消息的id'
		}
		*/
		params = params || {};
		if(params.id){
			$.getJSON('/a/app/baby/delClendar.ac',params,function(results){
				if(results.code == 0){
					if($.isFunction(callback)){
						//@id 日历项的id
						callback(results.data);
					}
				}else{
					$.alert(results.msg);
				}
			});
		}
	},
	fillCount: function(ary,callback){
		//评论转发数
		if(ary && ary.length > 0){
			var ids = [];
			for(var i=0,len=ary.length;i<len;i+=1){
				//ids.push('baby_'+ary[i].itemid+'_0_'+ary[i].xpt);
				ids.push('baby_'+ary[i].itemid);
			}

			$.getJSON('http://cc.i.sohu.com/a/app/counts/get.htm?callback=?',{ids:ids.join(',')},function(data){

				callback(data);
				/*
				$('[data-itemid]').each(function(){
					var $ele = $(this),obj = data[$ele.attr('data-itemid')];
					if(obj){ 
						if(obj.commentcount > 0) $ele.find('[action="comment"],[action="baby.comment"]').html('评论('+obj.commentcount+')');
					}
				});
				*/
			});
		}
	},
	follow: function(params,callback){
		if(!login()){
			return;
		}
		/*
		{
		xpt: '用户xpt'
		}
		*/
		params = params || {};
		if(params.xpt){
			$.getJSON('/a/app/friend/friend/add.do',params,function(results){
				if(results.code == 1 || results.code == -2){
					if($.isFunction(callback)){
						//@id 日历项的id
						callback(results.data);
					}
				}else{
					$.alert(results.msg);
				}
			});
		}
	},
	followAll: function(params,callback){
		if(!login()){
			return;
		}
		/*
		{
		userid: '用户xpt的列表'
		}
		*/
		params = params || {};
		if(params.userid){
			$.post('/a/app/friend/addattentions.do',params,function(results){
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
	},
	vote: function(params,callback){
		if(!login()){
			return;
		}
		/*
		{
		id: '用户消息的id'
		}
		*/
		params = params || {};
		if(params.id){
			$.getJSON('/a/app/baby/likePic.ac',params,function(results){
				if(results.code == 0){
					if($.isFunction(callback)){
						callback(results.data);
					}
				}else{
					$.alert(results.msg);
				}
			});
		}
	}
}





ba.ajax = ajax;

ba.calendarApi = calendarApi;

ba.miniCalendar = function(settings){
	return new MiniCalendar(settings);
}

ms.babyapp = ba;

})(jQuery,mysohu);