/*
 *	母婴app 后台 周模式
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'babyapp';

var PAGE_NAME = 'weekMy';

var NOTE_ITEM_MAX_LEN = 4;//日历项最大条数

//分页
var pager = function(settings){
	var defaults = {
		current: 1,
		max:1,
		maxShow: 9,//最大显示的页数 1...3456789...20
		appendTo: '',
		autoUpdate: true,//点击页号时是否自动更新页码状态
		onClick: function(pagenum){}//可以在回调内更新页码
	};
	this.options = $.extend(defaults,settings);
	this.init();
};
pager.prototype = {
	init: function(){
		var that = this;
		this.container = $('<div class="list-pagination"></div>').appendTo($(this.options.appendTo));
		this.container.click(function(event){
			var $target = $(event.target);
			
			//点击了页码
			if($target.closest('[data-pagenum]').length){
				$target = $target.closest('[data-pagenum]');
				if($target.length){
					if(that.options.autoUpdate){
						that.update($target.attr('data-pagenum'));
					}
					if($.isFunction(that.options.onClick)){
						that.options.onClick($target.attr('data-pagenum'));
					}
				}
			}
		});
		this.update(this.options.current);
	},
	update: function(pagenum,max){
		max = max || this.options.max;
		max = max < 1 ? 1 : max;
		pagenum = parseInt(pagenum,10) || 1;
		pagenum = pagenum < 1 ? 1 : pagenum;
		pagenum = pagenum > max ? max : pagenum;
		this.options.current = pagenum;
		this.options.max = max;
		if(max == 1){
			this.container.html('');
			return;
		}

		var len = this.options.maxShow - 2;//减掉第一页和最后一页，中间显示的页码数
		var differ = Math.floor(len/2);//需要把当前页显示在中间，所以求左右增减的数量
		var start = (pagenum - differ) > 2 ? pagenum - differ : 2;//起始页码要大于等于2
		var end = (start + len) < max ? start + len : max;//结束页码为起始页码+len，不能大于max
		//如果结束页码和起始页码数量不够len，则需要从结束往开始补充
		if((end - start) < len){
			start = end - len;
			if(start < 2){
				start = 2;
			}
		}
		var i;
		var html = '<span class="total">共'+max+'页</span>';
		if(pagenum == 1){
			html += '<span class="page-cur">1</span>';
		}else{
			html += '<a href="javascript:void(0)" class="page-prev" data-pagenum="'+(pagenum-1)+'"><span>上一页</span></a>';
			html += '<a href="javascript:void(0)" data-pagenum="1">1</a>';
		}
		if(start > 2 && max > this.options.maxShow){
			html += '<span class="page-break">...</span>';
		}
		for(i = start;i< end;i+=1){
			if(i == pagenum){
				html += '<span class="page-cur">'+i+'</span>';
			}else{
				html += '<a href="javascript:void(0)" data-pagenum="'+i+'">'+i+'</a>';
			}
		}
		if(end < max){
			html += '<span class="page-break">...</span>';
		}
		if(pagenum == max && max != 1){
			html += '<span class="page-cur">'+max+'</span>';
		}else if(max != 1){
			html += '<a href="javascript:void(0)" data-pagenum="'+max+'">'+max+'</a>';
			html += '<a href="javascript:void(0)" class="page-next" data-pagenum="'+(pagenum+1)+'"><span>下一页</span></a>';
		}
		
		this.container.html(html);
	},
	show: function(){
		this.container.show();
	},
	hide: function(){
		this.container.hide();
	}
};

var project = {
	$this: null,
	miniCalendar: null,
	options: {
		date: new Date()
	},
	dialog: {
		official: null,
		user: null,
		input: null,
		confirm: null
	},
	pageList: null,
	init: function($this,options){
		var self = this;
		this.$this = $this;
		$.extend(this.options,options || {});
		/*
		执行每次都需要重复绑定的事件
		如suggest初始化
		*/
		this.miniCalendar = $[app].miniCalendar({
			appendTo: $this.find('div.calendar-manipulation'),
			date: this.options.date,
			mode: 'week',
			onClick: function(datestring){
				$.appview({
					url: '/baby/calendar.php?category=week&date=' + datestring,
					method: 'get',
					target: '#innerCanvas'
				});
			}
		}); 
		$this.find('div.calendar-manipulation > span.calendar > a')
			.click(function(){
				self.miniCalendar.show();
			})
			.mousedown(function(){
				this.className = 'down';
			})
			.mouseup(function(){
				this.className = 'hover';
			});
		$this.find('div.calendar-today > a,div.calendar-manipulation > span.prev-btn > a,div.calendar-manipulation > span.next-btn > a')
			.mousedown(function(){
				this.className = 'down';
			})
			.mouseup(function(){
				this.className = 'hover';
			});
		//清理之前页面可能存在的对话框
		$[app].dialog.clear();
		this.dialog.official = $[app].dialog.official({
			modal: false
		});
		
		this.dialog.user = $[app].dialog.user({
			modal: false
		});
		
		this.dialog.input = $[app].dialog.input({
			modal: true
		});
		this.dialog.confirm = $[app].dialog.monthDelete({
			modal: true
		});
		
		this.pageList = new pager({
			appendTo: 'div.babyapp-page-list',
			current: 1,
			max: 1,
			maxShow: 7,
			autoUpdate: false,
			onClick: function(page){
				self.loadFeedFriendBaby(page);
			}
		});

		this.initFeed();//初始化feed区
		/*
		如果当前页面就是本页面，则执行静态绑定
		*/
		if($this.data('baby-page') && $this.data('baby-page') == PAGE_NAME){
			return $this;
		}
		
		/*
		下面是所有静态绑定的事件
		*/
		/*
		首先取消之前页面所有的静态绑定
		*/
		$this.unbind('.'+app).undelegate('.'+app);

		/*
		静态绑定click事件
		*/
		$this
		.bind('click.'+app,function(event){

			var $target = $(event.target),$li,$p,$detail;
			
			//添加日历项
			if($target.closest('.calendar-data-append-btn').length){
				$li = $target.closest('li[data-babyapp-date]');
				if($li.length){
					if(!$li.hasClass('babyapp-today')){
						$li.addClass('babyapp-nowedit');//当前正在编辑的日历
					}
					self.dialog.input.show(function(text){
						var date = $li.attr('data-babyapp-date');
						$[app].createNote(date,text,function(data){
							self.createNote($li,text,data.id,data.date);
							self.dialog.input.close();
						});
					});
					self.dialog.official.close();
					self.dialog.user.close();
				};
			}
			//显示用户日历项
			else if($target.closest('p.babyapp-user').length && $target.closest('a').length){
				self.dialog.official.close();
				$p = $target.closest('p.babyapp-user')
				$detail = $p.find('span.babyapp-con-detail');
				self.dialog.user.show($detail.html(),$detail.attr('date-babyapp-datetime'),$p.attr('data-babyapp-cid'),function(){
					/*
					var offset = self.dialog.user.getOffset();
					offset.left += 6;
					offset.top += 6;
					offset.width -= 12;
					offset.height -= 12;
					
					self.dialog.confirm.show(offset,function(){
						self.dialog.confirm.close();
						self.dialog.user.close();
						$[app].deleteNote($p.attr('data-babyapp-cid'),function(data){
							self.deleteNote($p);
						});
					});
					*/
					//使用系统默认
					var $condialog = $.confirm({
						title: false,
						content: '确定要删除此条备忘吗？删除之后不可恢复。',
						onConfirm: function(){
							self.dialog.user.close();
							$[app].deleteNote($p.attr('data-babyapp-cid'),function(data){
								self.deleteNote($p);
							});
						}
					});
					$condialog.css('left',self.$this.offset().left + (self.$this.width() - $condialog.width())/2);
				});
			}
			//显示官方日历项
			else if($target.closest('p.babyapp-sohu').length && $target.closest('a').length){
				self.dialog.user.close();
				$p = $target.closest('p.babyapp-sohu')
				$detail = $p.find('span.babyapp-con-detail');
				self.dialog.official.show($detail.attr('date-babyapp-title'),$detail.html(),$detail.attr('date-babyapp-datetime'));
			}
		})
		.delegate('li[data-babyapp-date]','mouseenter.'+app,function(){
			var $target = $(this);
			$target.addClass('hover');
			if($target.hasClass('babyapp-nowedit')){
				$target.removeClass('babyapp-nowedit');
			}else{
				$this.find('li.babyapp-nowedit').removeClass('babyapp-nowedit hover');
			}
		})
		.delegate('li[data-babyapp-date]','mouseleave.'+app,function(){
			var $target = $(this);
			if(!$target.hasClass('babyapp-today') && !$target.hasClass('babyapp-nowedit')){
				$target.removeClass('hover');
			}
		});



		$this.data('baby-page',PAGE_NAME);
		//alert(PAGE_NAME);
	},
	sortNote: function($li){
		var $div = $li.find('div.week-data-list-con');
		//更新日历项的顺序
		var sohuLen = $div.find('p.babyapp-sohu').length;
		var $ps = $div.find('p.babyapp-user');
		var index = $ps.length + sohuLen  - NOTE_ITEM_MAX_LEN;
		if(index > 0){
			$ps.show().filter('p:lt('+index+')').hide();
			this.showMore($li);
		}
		else{
			$ps.show();
			this.hideMore($li);
		};
	},
	createNote: function($li,text,cid,datetime){
		var $div = $li.find('div.week-data-list-con');
		var $p = $('<p class="week-data-list-con-text babyapp-user"></p>');
		$p.attr('data-babyapp-cid',cid);
		$p.html('<span class="data-star-icon2"></span><a href="javascript:void(0)">'+$[app].utils.cutCjkString(text,32,'...',2)+'</a><span class="babyapp-con-detail" style="display: none;" date-babyapp-datetime="'+datetime+'">'+text+'</span>');
		$div.append($p);
		this.sortNote($li);
	},
	deleteNote: function($p){
		var $li = $p.closest('li');
		$p.remove();
		this.sortNote($li);
	},
	showMore: function($li){
		var $more = $li.find('span.calendar-data-more');
		if($more.length){
			$more.show();
		}else{
			$more = $('<span class="calendar-data-more"></span>');
			$more.html('<a href="javascript:void(0);" data-target="#innerCanvas" data-url="/baby/calendar.php?category=daily&date='+$li.attr('data-babyapp-date')+'" data-role="appview">更多</a>').appendTo($li);
		}
	},
	hideMore: function($li){
		var $more = $li.find('span.calendar-data-more');
		if($more.length){
			$more.hide();
		}
	},
	initFeed: function(){
		var self = this;
		var $ererybodySay = this.$this.find('span.babyapp-everybody-say');
		var $friendBaby = this.$this.find('span.babyapp-friend-baby');
		var $refresh = this.$this.find('span.data_info_list_update');
		$ererybodySay.click(function(){
			var $this = $(this);
			if(!$this.hasClass('everybody-say-now')){
				$this.removeClass('everybody-say').addClass('everybody-say-now');
				$friendBaby.removeClass('friend-baby-now').addClass('friend-baby');
				self.loadFeedEverybodySay(true);
			}
		});
		$friendBaby.click(function(){
			var $this = $(this);
			if(!$this.hasClass('friend-baby-now')){
				$this.removeClass('friend-baby').addClass('friend-baby-now');
				$ererybodySay.removeClass('everybody-say-now').addClass('everybody-say');
				self.loadFeedFriendBaby(1,true);
			}
		});
		$refresh.click(function(){
			if($ererybodySay.hasClass('everybody-say-now')){
				self.loadFeedEverybodySay();
			}else if($ererybodySay.hasClass('friend-baby-now')){
				self.loadFeedFriendBaby(1);
			}
		});
		
		this.loadFeedEverybodySay(true);
	},
	loadFeedEverybodySay: function(showLoading){
		var self = this;
		if(this.pageList){
			this.pageList.hide();
		}
		this.feedLoading(showLoading);
		//加载数据
		
		$.getJSON('/baby/baby_feed.php',{type:'1'},function(result){
			if(result.code == 0){
				self.buildFeed(result.data.feed);
			}
		});
		
	},
	loadFeedFriendBaby: function(pagenum,showLoading){
		var self = this;
		
		
		if(showLoading){
			this.pageList.hide();
		}else{
			this.pageList.show();
		}
		this.feedLoading(showLoading);
		//加载数据
		$.getJSON('/baby/baby_feed.php',{type:'2',page:pagenum},function(result){
			if(result.code == 0){
				self.buildFeed(result.data.feed);
				self.pageList.update(result.data.cur_page,result.data.total_page);
				self.pageList.show();
			}
		});
	},
	feedLoading: function(flag){
		if(flag){
			this.$this.find('div.data-info-list-data').html('<div class="data-info-list-load"><span class="icon-load"></span>正在读取数据...</div>');
		}
	},
	buildFeed: function(ary){
		if(!ary){
			return;
		}
		var $box = this.$this.find('div.data-info-list-data'),i,len,$div,html;
		$box.empty();
		for(i = 0,len = ary.length; i<len; i += 1){
			$div = $('<div class="data-info-list-data-item"></div>')
			html = '<div class="data-info-list-data-item-avatar">';
			html += '<a target="_blank" href="'+ary[i]['homeurl']+'app/baby/"><img src="'+ary[i]['image']+'" alt="'+ary[i]['nick']+'"></a>';
			html += '</div>';
			html += '<div class="data-info-list-data-item-text hijackdata" data-appid="baby" data-xpt="'+ary[i]['xpt']+'" data-itemid="'+ary[i]['calendar_id']+'">';
			html += '<p><a target="_blank" href="'+ary[i]['homeurl']+'app/baby/">'+ary[i]['nick']+'['+ary[i]['babyinfo']+']：</a>'+ary[i]['feed_text']+'</p>';
			html += '<div class="day-text-note">';
			html += '<div class="comment"><a href="javascript:void(0)" action="baby.comment">评论</a></div>'
			html += '发表于'+ary[i]['calendar_create_datetime'];
			html += '</div>';
			html += '</div>';
			$div.html(html).appendTo($box);
		}
		$[app].fillCount();
	}

};




$[app][PAGE_NAME+'Boot'] = function(options) {
	var $this = this;
	return $this;
};

$[app][PAGE_NAME+'Load'] = function(options) {
	$[app].onPageLoaded();
	var $this = $('#innerCanvas');
	project.init($this,options);
	return $this;
};


})(jQuery);