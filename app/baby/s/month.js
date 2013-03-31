/*
 *	母婴app 展示页 月模式
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
				ms.babyapp.loadPage('s',{url:'/a/app/baby/baby_show.ac?category=month&date=' + datestring + '&uid=' + ms[app].getUid()});
			}
		}); 
		$this.find('div.calendar-manipulation-item > a.calendar')
		.click(function(event){
			event.preventDefault();
			self.miniCalendar.show();
		});
		
		
		//清理之前页面可能存在的对话框
		ms[app].dialog.clear();
		this.dialog.official = ms[app].dialog.official({
			modal: false,
			$parent: $this,
			appendTo: $('#main')
		});
		
		this.dialog.user = ms[app].dialog.user({
			modal: false,
			$parent: $this,
			appendTo: $('#main')
		});
		
		
		//设置当天高亮
		var todayDateString = ms[app].calendarApi.formatDate(new Date());
		$this.find('li[data-babyapp-date="'+todayDateString+'"]').addClass('hover babyapp-today');
		

		//统一替换表情
		$this.find('[data-babyapp-ctext]').each(function(){
			var $o = $(this);
			$o.html(mysohu.babyapp.Emot.trans.cut($o.attr('data-babyapp-ctext').replace(/&/g,'&amp;'),8));
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
					homeurl: data.homeurl,
					isPerson: true
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