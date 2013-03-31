/*
 *	母婴app 后台 月模式
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'babyapp';

var PAGE_NAME = 'monthMy';


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
		this.miniCalendar = $[app].miniCalendar({
			appendTo: $this.find('div.calendar-manipulation'),
			date: this.options.date,
			mode: 'month',
			onClick: function(datestring){
				$.appview({
					url: '/baby/calendar.php?category=month&date=' + datestring,
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
						});
						self.dialog.input.close();
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
	createNote: function($li,text,cid,datetime){
		var $div = $li.find('div.month-data-list-con');
		var $p = $('<p class="month-data-list-con-text babyapp-user"></p>');
		$p.attr('data-babyapp-cid',cid);
		$p.html('<span class="data-star-icon2"></span><a href="javascript:void(0)">'+$[app].utils.cutCjkString(text,10,'...',2)+'</a><span class="babyapp-con-detail" style="display: none;" date-babyapp-datetime="'+datetime+'">'+text+'</span>');
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