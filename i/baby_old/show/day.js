/*
 *	母婴app 前台 天模式
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'babyapp';

var PAGE_NAME = 'dayShow';


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
		this.options.date = $[app].calendar.formatDate($[app].calendar.getDate(this.options.date));
		this.miniCalendar = $[app].miniCalendar({
			appendTo: $this.find('div.calendar-manipulation'),
			date: this.options.date,
			mode: 'day',
			onClick: function(datestring){
				$.appview({
					url: '/baby/calendar_view.php?category=daily&date=' + datestring + '&uid=' + window['_uid'],
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
		
		this.dialog.confirm = $[app].dialog.dayDelete({
			modal: true
		});

		this.noNote();
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
		$this.unbind('.'+app);

		/*
		静态绑定click事件
		*/
		$this.bind('click.'+app,function(event){

			var $target = $(event.target),$div;
			
			//删除
			if($target.closest('.babyapp-content-del').length){
				$div = $target.closest('div[data-babyapp-cid]');
				if($div.length){
					self.dialog.confirm.show(function(){
						self.dialog.confirm.close();
						$[app].deleteNote($div.attr('data-babyapp-cid'),function(data){
							self.deleteNote($div);
						});
					});
				};
			}
			//跳转到指定日期
			else if($target.closest('span[data-babyapp-date]').length){
				$target = $target.closest('span[data-babyapp-date]');
				if(!$target.hasClass('now') && !$target.hasClass('end-now')){
					$.appview({
						url: '/baby/calendar_view.php?category=daily&date=' + $target.attr('data-babyapp-date') + '&uid=' + window['_uid'],
						method: 'get',
						target: '#innerCanvas'
					});
				}
			}
		});


		/*
		静态绑定mouseover事件
		*/
		$this.bind('mouseover.' + app, function(event) {
			var $target = $(event.target);
			
			//显示每个日历项的hover
			if($target.closest('span[data-babyapp-date]').length) {
				$target = $target.closest('span[data-babyapp-date]');
				$[app].within.call($target, event, function() {
					if(!$target.hasClass('now') && !$target.hasClass('end-now')){
						if($target.hasClass('end')){
							$target.addClass('end-hover');
						}else{
							$target.addClass('hover');
						}
					}
				});
			}
			//显示删除按钮
			else if($target.closest('div[data-babyapp-cid]').length) {
				$target = $target.closest('div[data-babyapp-cid]');
				$[app].within.call($target, event, function() {
					$target.find('span.del-icon').removeClass('hidden').show();
				});
			}

		});


		/*
		静态绑定mouseout事件
		*/
		$this.bind('mouseout.' + app, function(event) {
			var $target = $(event.target);
			
			//隐藏每个日历项的hover
			if($target.closest('span[data-babyapp-date]').length) {
				$target = $target.closest('span[data-babyapp-date]');
				$[app].within.call($target, event, function() {
					$target.removeClass('end-hover').removeClass('hover');
				});
			}
			//隐藏删除按钮
			else if($target.closest('div[data-babyapp-cid]').length) {
				$target = $target.closest('div[data-babyapp-cid]');
				$[app].within.call($target, event, function() {
					$target.find('span.del-icon').hide();
				});
			}
		});

		$this.data('baby-page',PAGE_NAME);
		//alert(PAGE_NAME);
	},
	sortNote: function(s){
		this.noNote();
		var $divs = this.$this.find('div.day-data-list > div.list-team');
		$divs.removeClass('list-team-end').addClass('list-team').last().addClass('list-team-end');
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
	createNote: function(text,cid,datetime){
		var $box = this.$this.find('div.day-data-list');
		var $div = $('<div class="list-team"></div>');
		$div.attr('data-babyapp-cid',cid);
		$div.html('<p class="day-text">' + text + '</p><p class="day-text-note"><span class="del-icon hidden"><a class="babyapp-content-del" href="javascript:void(0)">删除</a></span>发表于'+datetime+'</p>');
		$box.prepend($div);
		this.sortNote();
	},
	deleteNote: function($div){
		$div.remove();
		this.sortNote();
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