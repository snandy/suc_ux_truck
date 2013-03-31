/*
 *	母婴app 后台 天模式
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'babyapp';

var PAGE_NAME = 'day';



var project = {
	$this: null,
	miniCalendar: null,
	options: {
		date: new Date()
	},
	dialog: {
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
		//this.options.date = ms[app].calendarApi.formatDate(ms[app].calendarApi.getDate(this.options.date));
		this.miniCalendar = ms[app].miniCalendar({
			appendTo: $this.find('div.calendar-manipulation'),
			date: this.options.date,
			mode: 'day',
			onClick: function(datestring){
				ms.babyapp.loadPage('s',{url:'/a/app/baby/baby_show.ac?category=day&date=' + datestring + '&uid=' + ms[app].getUid()});
			}
		});

		$this.find('div.calendar-manipulation-item > a.calendar')
		.click(function(event){
			event.preventDefault();
			self.miniCalendar.show();
		});

		

		//清理之前页面可能存在的对话框
		ms[app].dialog.clear();
		

		
		this.noNote();

		this.commentAndLink();

		//统一替换表情
		$this.find('[data-babyapp-ctext]').each(function(){
			var $o = $(this);
			$o.html(mysohu.babyapp.Emot.trans.cut($o.attr('data-babyapp-ctext').replace(/&/g,'&amp;')));
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
		.delegate('a.babyapp-content-del','click.'+app,function(event){
			//删除
			if(!self.options.isSelf) return;
			var $target = $(this),
				$div = $target.closest('div[data-babyapp-id]');
						
			if($div.length){
				
				//使用系统默认
				var $condialog = $.confirm({
					title: false,
					content: '确定要删除此条备忘吗？删除之后不可恢复。',
					onConfirm: function(){
						ms[app].ajax.del({id:$div.attr('data-babyapp-id')},function(data){
							self.deleteNote($div);
						});
					}
				});
				$condialog.css('left',self.$this.offset().left + (self.$this.width() - $condialog.width())/2);
			};
			
		})
		.delegate('span[data-babyapp-date]','click.'+app,function(){
			var $target = $(this);
			if(!$target.hasClass('now') && !$target.hasClass('end-now')){
				ms.babyapp.loadPage('s',{url:'/a/app/baby/baby_show.ac?category=day&date=' + $target.attr('data-babyapp-date') + '&uid=' + ms[app].getUid()});
			}
		})
		.delegate('span[data-babyapp-date]','mouseenter.'+app,function(){
			var $target = $(this);
			if(!$target.hasClass('now') && !$target.hasClass('end-now')){
				if($target.hasClass('end')){
					$target.addClass('end-hover');
				}else{
					$target.addClass('hover');
				}
			}
		})
		.delegate('span[data-babyapp-date]','mouseleave.'+app,function(){
			var $target = $(this);
			$target.removeClass('end-hover').removeClass('hover');
		})
		.delegate('div.pic-view-small > img','click.'+app,function(){
			var $target = $(this),
				big = $target.attr('data-photo-big');
			$target.parent().removeClass().addClass('pic-view-big').html('<img src="'+big+'" data-photo-small="'+this.src+'" />');
			
		})
		.delegate('div.pic-view-big > img','click.'+app,function(){
			var $target = $(this),
				small = $target.attr('data-photo-small');
			$target.parent().removeClass().addClass('pic-view-small').html('<img src="'+small+'" data-photo-big="'+this.src+'" />');
			
		});

		
		$this.data('baby-page',PAGE_NAME);
	},
	sortNote: function(s){
		this.noNote();
		var $divs = this.$this.find('div.day-data-list > div.list-team');
		$divs.removeClass('list-team-end').addClass('list-team').last().addClass('list-team-end');
	},
	deleteNote: function($div){
		$div.remove();
		this.sortNote();
	},
	noNote: function(){
		var $box = this.$this.find('div.day-data-list'),$div;
		if(!$box.children().length){
			$div = $('<div class="list-team list-team-end babyapp-no-note"></div>');
			$div.html('<p class="day-text">【育儿日历提示】生活很精彩所以很忙，TA今天什么也没写</p><p class="day-text-note"></p>');
			$box.prepend($div);
		}else{
			$box.find('div.babyapp-no-note').remove();
		}
	},
	commentAndLink: function(){
		var ary = [],$cache = {};
		this.$this.find('div[data-babyapp-id]').each(function(){
			var $o = $(this);
			ary.push({
				itemid: $o.attr('data-babyapp-id'),
				xpt: ms[app].getXpt()
			});
			$cache[$o.attr('data-babyapp-id')] = $o;
		});
		ms[app].ajax.fillCount(ary,function(data){
			$.each(data,function(key,value){
				$cache[key]
					.find('a.babyapp-content-comment')
					.text('评论' + (value.commentcount > 0 ? '('+value.commentcount+')' : ''))
					.attr('data-role','appview')
					.attr('data-target','#innerCanvas')
					.attr('data-url','/a/app/baby/comments_show.ac?id='+key+'&uid='+ms[app].getUid())
					.attr('href','javascript:void(0)')
					.removeAttr('target');
			});
		});
	}

};



ms[app][PAGE_NAME+'Load'] = function(options) {
	var $this = $('#innerCanvas');
	project.init($this,options);
	ms[app].onPageLoaded($this);
	return $this;
};


})(jQuery,mysohu);