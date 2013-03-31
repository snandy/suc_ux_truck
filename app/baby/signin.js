/*
 *	签到功能
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var ie6 = $.browser.msie && parseFloat($.browser.version) < 7;

var face = {
	cached: false,//是否缓存了数据
	sign: false,
	sign_count: 0,
	id: '',//当前签到的表情id
	ad: '',
	list: [
		{id:'1',head_desc:'心情1',head_img:'01.png'}
	],
	hash: {},
	imgTagHtml: function(obj,onlyImg){
		var html = '',
			img = 'http://i0.itc.cn/20120227/9d6_d8212af8_bfce_d841_0e60_6179f0b764e7_6.png',
			title = '签到';
		if(obj){
			img = obj.head_img;
			title = obj.head_desc;	
		}
		if(ie6 && !onlyImg){
			html = '<span title="'+title+'" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true,src=\''+img+'\');background:none;"></span>';
		}
		else{
			html = '<img src="'+img+'" title="'+title+'" />';
		}
		return html;
	},
	curObj: function(){
		return this.hash[this.id];
	}
};

function transData(data){
	face.cached = data.sign;//如果签到了，则缓存
	face.list = data.mood;
	face.sign = data.sign;
	face.sign_count = parseInt(data.sign_count || 0,10);
	face.ad = data.text + '&nbsp;<a href="'+data.text_url+'" target="_blank">去看看</a>';
	face.id = data.id;
	
	for(var i=0,len=face.list.length;i<len;i+=1){
		face.hash[face.list[i].id] = face.list[i];
	}

}

var signin = {
	init: function($container){
		var self = this;
		this.$container = $container;
		this.date = new Date();//当前日期

		if(face.cached){
			self._init();
		}else{
			$.getJSON('/a/app/baby/intoSign.ac',function(results){
				if(results.code == 0){
					transData(results.data);
					self._init();
				}
			});
		}
	},
	_init: function(){
		var self = this,
			week = ['周日','周一','周二','周三','周四','周五','周六'],
			now = new Date(),
			html = [
			'<div class="baby-sign'+(face.sign ? ' over':'')+'">',
			'<p class="week">'+week[now.getDay()]+'</p>',
			'<p class="sign"><a href="javascript:void(0)"></a></p>',
			'<p class="sign-count">'+face.sign_count+'天</p>',
			'</div>'
			].join('');

		
		this.$container.html(html);

		//创建弹窗框架
		this.$box = $('<div class="baby-dl-wrapper" style="display:none"></div>');
		this.$box.html([
			'<div class="dl-arrow"></div>',
			'<div class="baby-dl-box"></div>'
		].join(''));

		if(ie6){
			this.$iframe = $('<iframe frameborder="0" tabindex="-1" src="about:blank" style="display:block;cursor:default;opacity:0;filter:alpha(opacity=0);position:absolute;left:0px;top:0px;z-index:-1"></iframe>')
			.appendTo(this.$box);
		}

		this.$container.find('div.baby-sign').append(this.$box);
		this.$container.find('p.sign').bind('click',function(){
			if(face.sign){
				self.mySiDlg();
			}else{
				self.siDlg();
			}
		});
		this.$box.delegate('div.dl-close','click',function(){
			self.hideDlg();
		});
	},
	//对话框,
	_dlg: function(content){
		this.$box.find('div.baby-dl-box').html([
			content,
			'<div class="baby_dl_msg">',
				face.ad,
			'</div>'
		].join(''));
		
		this.$box.show();
		this.adjust();
	},
	adjust: function(){
		if(this.$iframe){
			this.$iframe.width(this.$box.outerWidth()).height(this.$box.outerHeight());
		}
	},
	//签到对话框
	siDlg: function(){
		var self = this;
		var html = [
			'<div class="select-photo-title"><div class="dl-close"></div><div class="text">选择你今天的心情！</div></div>',
			'<div class="facebox"><ul class="clearfix">'
		];

		for(var i=0,len=face.list.length;i<len;i+=1){
			html.push('<li'+(i == 0 ? ' class="selected"' : '')+' data-face-id="'+face.list[i].id+'">'+face.imgTagHtml(face.list[i])+'</li>');
		}

		html.push('</ul></div>');
		html.push('<div class="facebox-button"><a class="button" href="javascript:void(0)"></a></div>');

		this._dlg(html.join(''));

		//绑定事件
		var $lis = this.$box.find('div.facebox li');
		
		$lis
		.hover(function(){
			if(this.className != 'selected'){
				this.className = 'hover';
			}
		},function(){
			if(this.className != 'selected'){
				this.className = '';
			}
		})
		.click(function(){
			var $this = $(this);
			$lis.removeClass();
			this.className = 'selected';
		});
		
		this.$box.find('a.button').bind('click',function(){
			var $selected = self.$box.find('div.facebox li.selected');
			if($selected.length && $selected.attr('data-face-id')){
				$.getJSON('/a/app/baby/addSign.ac',{
					id: $selected.attr('data-face-id')
				},function(results){
					if(results.code == 0){
						face.id = results.data.id;
						face.sign = true;
						face.sign_count += 1;//加一天
						self.$container.find('div.baby-sign').addClass('over').find('p.sign-count').html(face.sign_count+'天');
						self.mySiDlg();
					}else{
						$.alert(results.msg);
					}	
				});
			}
		});
	},
	//本人签到记录
	mySiDlg: function(){
		var self = this;
		
		var html = [
			'<div class="dl_calendar_title"><div class="dl-close"></div>',
				'<div class="text"><div class="face">',face.imgTagHtml(face.curObj()),'</div></div>',
			'</div>',
			'<div class="calendar-wrapper">',
				'<div class="calendar-tab">',
					'<ul class="clearfix">',
						'<li class="curr">',
							'<a class="calendar-select-l" href="javascript:void(0)"></a>',
							'<span class="ba-c-date"></span>',
							'<a class="calendar-select-r" href="javascript:void(0)"></a>',
						'</li>',
						'<li><a class="ba-c-f-list" href="javascript:void(0)">好友签到排行榜</a></li>',
					'</ul>',
				'</div>',
				'<div class="calendar-week">',
					'<ul class="clearfix">',
						'<li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li><li>日</li>',
					'</ul>',
				'</div>',
				'<div class="calendar-item-list"></div>',
			'</div>'
		];

		this._dlg(html.join(''));
		this._drawC();
		this.$box.find('a.calendar-select-l,a.calendar-select-r').bind('click',function(){
			self.date = $(this).data('babyapp-date');
			self._drawC(self.date);
		});
		this.$box.find('a.ba-c-f-list').bind('click',function(){
			self.friendsListDlg();
		});
	},
	//根据日期显示日历
	_drawC: function(date,uid){
		var self = this;
		var delay = (date ? 500 : 0);
		date = date || this.date;
		uid = uid || '';
		var dY = date.getFullYear(),
			dM = date.getMonth(),
			dateString = ms.babyapp.calendarApi.formatDate(date),
			month = ms.babyapp.calendarApi.getMonth({
				drawYear: dY,
				drawMonth: dM
			});
		var dRow,dow,obj,dList = month.dList;
		var html = ['<ul class="clearfix">'];
		for (dRow = 0; dRow < dList.length; dRow+=1) {
			for (dow = 0; dow < 7; dow++) {
				obj = dList[dRow][dow];
				if(obj.date.getMonth() == month.drawMonth){
					html.push('<li data-babyapp-date="'+ms.babyapp.calendarApi.formatDate(obj.date)+'">');
					html.push('<div class="num">'+obj.date.getDate()+'</div>');
					html.push('<div class="img"><div class="con"></div></div>');
					html.push('</li>')
				}else{
					html.push('<li></li>');
				}	
			}
		}
		html.push('</ul>');
		this.$box.find('div.calendar-item-list').html(html.join(''));
		this.$box.find('span.ba-c-date').html(dY+'年'+(dM+1)+'月');
		this.$box.find('a.calendar-select-l').data('babyapp-date',month.prev);
		this.$box.find('a.calendar-select-r').data('babyapp-date',month.next);

		if(delay){
			if(this.toid) clearTimeout(this.toid);
			this.toid = setTimeout(function(){
				self._loadSiInfo(uid,dateString);
			},delay);
		}else{
			this._loadSiInfo(uid,dateString);
		}
		this.adjust();
	},
	//加载签到信息
	_loadSiInfo: function(uid,dateString){
		var self = this;
		if(this.xhr) this.xhr.abort();
		this.xhr = $.getJSON('/a/app/baby/myMonthSign.ac',{
			'date': dateString,
			'uid': uid
		},function(results){
			if(results.code == 0){
				$.each(results.data,function(key,value){
					self.$box.find('li[data-babyapp-date="'+key+'"] > div.img').html(face.imgTagHtml(face.hash[value],true));
				});
			}
		});
	},
	//好友签到排行
	friendsListDlg: function(pageNum,data){
		pageNum = pageNum || 1;
		var self = this,
			dY = this.date.getFullYear(),
			dM = this.date.getMonth();
		var html = [
			'<div class="dl_calendar_title"><div class="dl-close"></div>',
				'<div class="text"><div class="face">',face.imgTagHtml(face.curObj()),'</div></div>',
			'</div>',
			'<div class="calendar-wrapper">',
				'<div class="calendar-tab">',
					'<ul class="clearfix">',
						'<li><a class="ba-c-my" href="javascript:void(0)">'+dY+'年'+(dM+1)+'月</a></li>',
						'<li class="curr">好友签到排行榜</li>',
					'</ul>',
				'</div>',
				'<div class="frd-calendar-wrapper"></div>',
			'</div>'
		];
		this._dlg(html.join(''));

		function draw(_data){
			self.flistData = _data;
			self._drawFlist();
		}
		
		if(!data){
			//这里根据接口返回对应页号的数据
			this._loadFlistData(pageNum,draw);
			
		}else{
			draw(data);
		}

		this.$box.find('div.frd-calendar-wrapper')
		.delegate('a.open','click',function(){
			var $this = $(this),
				index = $this.attr('data-index'),
				obj = self.flistData.list[index];
			self.fsiDlg(obj);
		})
		.delegate('a.up','click',function(){
			self._loadFlistData(parseInt(self.flistData.curPage,10)-1,draw);
		})
		.delegate('a.down','click',function(){
			self._loadFlistData(parseInt(self.flistData.curPage,10)+1,draw);
		});
		this.$box.find('a.ba-c-my').bind('click',function(){
			self.mySiDlg();
		});
	},
	_loadFlistData: function(pageNum,callback){
		$.getJSON('/a/app/baby/friendSignTop.ac',{'page': pageNum},function(results){
			if(results.code == 0){
				callback(results.data);
			}
		});
	},
	_drawFlist: function(){
		var self = this,
			data = this.flistData,
			html = [
			'<table class="frd-calendar">',
				'<thead>',
					'<tr><th class="num">&nbsp;</th><th>好友</th> <th class="month">本月</th><th class="total">总签到</th><th class="open">月历</th></tr>',
				'</thead>',
				'<tbody>'
		];
		var top = 3,obj;
		for(var i=0,len=data.list.length;i<len;i+=1){
			obj = data.list[i];
			html.push('<tr>');
			html.push('<td><span'+ (obj.no <= top ? ' class="top"' : '') +'>'+obj.no+'</span></td>');
			html.push('<td>');
			html.push('<div class="photo"><a href="'+obj.url+'app/baby/" target="_blank" title="'+obj.nick+'"><img src="'+obj.pic+'"></a></div>');
			html.push('<div class="name"><a href="'+obj.url+'app/baby/" target="_blank" title="'+obj.nick+'">'+ms.babyapp.utils.cutCjkString(obj.nick,12,'',0)+'</a></div>');
			html.push('</td>');
			html.push('<td>'+obj.curMonth+'</td>');
			html.push('<td>'+obj.total+'</td>');
			html.push('<td><a class="open" href="javascript:void(0)" data-index="'+i+'"></a></td>');
			html.push('</tr>');
		}
		html.push('</tbody>');
		html.push('</table>');
		html.push('<div class="frd-calendar-page">');
		html.push(parseInt(data.curPage,10) > 1 ? '<a class="up" href="javascript:void(0)"></a>' : '');
		html.push(data.curPage + '/' + data.total);
		html.push(data.curPage == data.total ? '' : '<a class="down" href="javascript:void(0)"></a>');
		html.push('</div>');
		
		this.$box.find('div.frd-calendar-wrapper').html(html.join(''));
		this.adjust();
	},
	//好友的签到信息
	fsiDlg: function(obj){
		var self = this,
			date = this.date,
			html = [
				'<div class="dl_calendar_title">',
					'<div class="dl-close"></div>',
					'<div class="con">',
						'<div class="photo"><img src="'+obj.pic+'"></div>',
						'<div class="intro">',
							'<div class="title">',
								'<a class="return" href="javascript:void(0)">返回</a>',
								'<a href="'+obj.url+'" target="_blank" title="'+obj.nick+'">'+ms.babyapp.utils.cutCjkString(obj.nick,12,'',0)+'</a>签到日历',
							'</div>',
							'<div class="data">排名:'+obj.no+' 本月:'+obj.curMonth+'次 总签到:'+obj.total+'次</div>',
						'</div>',
					'</div>',
				'</div>',
				'<div class="calendar-wrapper">',
					'<div class="calendar-tab">',
						'<ul class="clearfix">',
							'<li class="curr">',
								'<a class="calendar-select-l" href="javascript:void(0)"></a>',
								'<span class="ba-c-date"></span>',
								'<a class="calendar-select-r" href="javascript:void(0)"></a>',
							'</li>',
						'</ul>',
					'</div>',
					'<div class="calendar-week">',
						'<ul class="clearfix">',
							'<li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li><li>日</li>',
						'</ul>',
					'</div>',
					'<div class="calendar-item-list"></div>',
				'</div>'
			];

		this._dlg(html.join(''));
		this._drawC(date,obj.uid);
		this.$box.find('a.calendar-select-l,a.calendar-select-r').bind('click',function(){
			self._drawC($(this).data('babyapp-date'),obj.uid);
		});
		this.$box.find('a.return').bind('click',function(){
			self.friendsListDlg(1,self.flistData);
		});
	},
	hideDlg: function(){
		this.$box.hide();
	}
};

ms.babyapp.signin = signin;


})(jQuery,mysohu);