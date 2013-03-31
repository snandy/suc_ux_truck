/*
 *	母婴app 后台 月模式
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'babyapp';

var PAGE_NAME = 'month';


var NOTE_ITEM_MAX_LEN = 4;//日历项最大条数

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
	init: function($this,options){
		var self = this;
		this.$this = $this;
		$.extend(this.options,options || {});
		/*
		执行每次都需要重复绑定的事件
		如suggest初始化
		*/
		this.miniCalendar = ms[app].miniCalendar({
			appendTo: $this.find('div.calendar-manipulation'),
			date: this.options.date,
			mode: 'month',
			onClick: function(datestring){
				ms.babyapp.loadPage('i',{url:'/a/app/baby/calendar.ac?category=month&date=' + datestring});
			}
		}); 
		$this.find('div.calendar-manipulation-item > a.calendar')
		.click(function(event){
			event.preventDefault();
			self.miniCalendar.show();
		});
		
		//初始化签到
		ms[app].signin.init($this.find('div.baby-sign-box'));
		
		//清理之前页面可能存在的对话框
		ms[app].dialog.clear();
		this.dialog.official = ms[app].dialog.official({
			modal: false
		});
		
		this.dialog.user = ms[app].dialog.user({
			modal: false
		});
		
		
		this.dialog.input = ms[app].dialog.input({
			modal: true
		});
		
		//设置当天高亮
		var todayDateString = ms[app].calendarApi.formatDate(new Date());
		$this.find('li[data-babyapp-date="'+todayDateString+'"]').addClass('hover babyapp-today');
		

		//统一替换表情
		$this.find('[data-babyapp-ctext]').each(function(){
			var $o = $(this);
			$o.html(mysohu.babyapp.Emot.trans.cut($o.attr('data-babyapp-ctext').replace(/&/g,'&amp;'),10));
		});
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
		$.iCard.destroyInstance(this.$this);
		$this.unbind('.'+app).undelegate('.'+app);

		/*
		静态绑定click事件
		*/
		$this
		.delegate('span.calendar-data-append-btn','click.'+app,function(event){
			//添加日历项
			var $span = $(this),
				$li = $span.closest('li[data-babyapp-date]');
			if($li.length){
				if(!$li.hasClass('babyapp-today')){
					$li.addClass('babyapp-nowedit');//当前正在编辑的日历
				}
				self.dialog.input.show(function(text,pic){
					var params = {
						num: 0,
						date: $li.attr('data-babyapp-date'),
						text: text
					};
					if(pic){
						$.extend(params,{
							img: pic.origin,//原图
							imgbig: pic.big,//大图
							imgmid: pic.small,//小图
							imgid: pic.id//图片id
						});
					}
					ms[app].ajax.add(params,function(data){
						self.createNote($li,mysohu.babyapp.Emot.trans.cut(data.text,10),data.id,pic);
					});
					self.dialog.input.close();
				});
				self.dialog.official.close();
				self.dialog.user.close();
			}
		
		})
		.delegate('p[data-babyapp-aid]','click.'+app,function(event){
			//显示官方日历项
			var $p = $(this);
			self.dialog.user.close();
			//这里后续写成读取接口返回内容的方式
			ms[app].ajax.get({'aid':$p.attr('data-babyapp-aid')},function(data){
				self.dialog.official.show({
					title: data.title,
					text: data.content,
					datetime: data.date
				});
			});
			
		})
		.delegate('p[data-babyapp-id]','click.'+app,function(event){
			//显示用户日历项
			var $p = $(this),
				id = $p.attr('data-babyapp-id');;
			self.dialog.official.close();
			//这里后续写成读取接口返回内容的方式
			ms[app].ajax.get({'id':id},function(data){
				self.dialog.user.show({
					id: id,
					xpt: ms[app].getXpt(),
					pic: data.pic,
					text: data.content,
					datetime: data.date,
					vote: data.vote,
					voteCount: data.vote_sum,
					isSelf: data.isSelf,
					homeurl: data.homeurl
				},function(){
					//使用系统默认
					var $condialog = $.confirm({
						title: false,
						content: '确定要删除此条备忘吗？删除之后不可恢复。',
						onConfirm: function(){
							self.dialog.user.close();
							ms[app].ajax.del({id:id},function(data){
								self.deleteNote($p);
							});
						}
					});
					$condialog.css('left',self.$this.offset().left + (self.$this.width() - $condialog.width())/2);
				});
			});
			
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
		var $div = $li.find('div.month-data-list-con');
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
	createNote: function($li,text,id,pic){
		var $div = $li.find('div.month-data-list-con');
		var $p = $('<p class="month-data-list-con-text babyapp-user" data-babyapp-id="'+id+'"></p>');
		$p.html('<span class="data-star-icon2"></span>'+(pic ? '<span class="data-pic-icon"></span>' : '')+'<a href="javascript:void(0)">'+text+'</a>');
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
			$more.html('<a href="javascript:void(0);" data-target="#innerCanvas" data-url="/a/app/baby/calendar.ac?category=day&date='+$li.attr('data-babyapp-date')+'" data-role="appview">更多</a>').appendTo($li);
		}
	},
	hideMore: function($li){
		var $more = $li.find('span.calendar-data-more');
		if($more.length){
			$more.hide();
		}
	}

};


//mysohu.babyapp.monthLoad({date:'2012-02-16'});

ms[app][PAGE_NAME+'Load'] = function(options) {
	var $this = $('#innerCanvas');
	project.init($this,options);
	ms[app].onPageLoaded($this);
	return $this;
};


})(jQuery,mysohu);