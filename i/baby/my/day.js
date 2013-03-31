/*
 *	母婴app 后台 天模式
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'babyapp';

var PAGE_NAME = 'dayMy';

//textarea文本检查
var regFilter = /[<>]+/i;
var regHTML = /<\/?[^<>]+>/i;
var regScript = /<[\s]*?script[^>]*?>[\s\S]*?<[\s]*?\/[\s]*?script[\s]*?>/i;
var TEXT_MAXLENGTH = 140;

function emptyContentAlert(a){
	var b = [255, 200, 200];
	a.style.backgroundColor = "rgb(" + b[0] + "," + b[1] + "," + b[2] + ")";
	var c = setInterval(function(){
		b[1] += 10;
		b[2] += 10;
		if (b[1] > 255) {
			clearInterval(c);
		}
		a.style.backgroundColor = "rgb(" + b[0] + "," + b[1] + "," +
		b[2] +
		")";
	}, 100);
}
function checkTextarea(edit,textarea,isSubmit){
	var n = edit.data('textLength');
	var text = $.trim(textarea.val().replace(/\r?\n/g, ''));
	var result = {
		status : true,
		reset : false,
		text : ''
	};
	if(isSubmit){
		if($.trim(text) == ''){
			return {
				status : false,
				reset : true,
				text : '请输入内容'
			}
		}
	};
	if(n > TEXT_MAXLENGTH){
		result.status = false;
		result.text = '已超出' + (n-TEXT_MAXLENGTH) + '个字';
	}
	else if(regFilter.test(text) || regHTML.test(text) || regScript.test(text)){
		result.status = false;
		result.text = '请不要输入非法字符';
	};
	return result;
};

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
					url: '/baby/calendar.php?category=daily&date=' + datestring,
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

		this.initInputBox();
		
		this.noNote();

		$[app].fillCount();
			
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

			var $target = $(event.target),$div;
			
			//删除
			if($target.closest('.babyapp-content-del').length){
				$div = $target.closest('div[data-babyapp-cid]');
				if($div.length){
					/*
					self.dialog.confirm.show(function(){
						self.dialog.confirm.close();
						$[app].deleteNote($div.attr('data-babyapp-cid'),function(data){
							self.deleteNote($div);
						});
					});
					*/
					//使用系统默认
					var $condialog = $.confirm({
						title: false,
						content: '确定要删除此条备忘吗？删除之后不可恢复。',
						onConfirm: function(){
							$[app].deleteNote($div.attr('data-babyapp-cid'),function(data){
								self.deleteNote($div);
							});
						}
					});
					$condialog.css('left',self.$this.offset().left + (self.$this.width() - $condialog.width())/2);
				};
			}
			//跳转到指定日期
			else if($target.closest('span[data-babyapp-date]').length){
				$target = $target.closest('span[data-babyapp-date]');
				if(!$target.hasClass('now') && !$target.hasClass('end-now')){
					$.appview({
						url: '/baby/calendar.php?category=daily&date=' + $target.attr('data-babyapp-date'),
						method: 'get',
						target: '#innerCanvas'
					});
				}
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
		});

		
		$this.data('baby-page',PAGE_NAME);
	},
	sortNote: function(s){
		this.noNote();
		var $divs = this.$this.find('div.day-data-list > div.list-team');
		$divs.removeClass('list-team-end').addClass('list-team').last().addClass('list-team-end');
	},
	createNote: function(text,cid,datetime){
		var $box = this.$this.find('div.day-data-list');
		var $div = $('<div class="list-team hijackdata"></div>');
		$div.attr('data-babyapp-cid',cid);
		$div.attr('data-itemid',cid);
		$div.attr('data-appid','baby');
		$div.attr('data-xpt',$space_config._xpt);
		$div.html('<p class="day-text">' + text + '</p><p class="day-text-note"><span class="comment"><a href="javascript:void(0)" class="babyapp-content-del">删除</a><a href="javascript:void(0)" action="baby.comment">评论</a></span>发表于'+datetime+'</p>');
		$box.prepend($div);
		this.sortNote();
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
	initInputBox: function(){
		var self = this;
		var edit = this.$this.find('div.babyapp-inputbox');
		var tip = edit.find('span.error-clew').hide();
		var counter = edit.find('span.babyapp-text-counter');
		var btn = edit.find('div.button span');
		var textarea = edit.find('textarea');
		textarea.textbox({
			maxLength: TEXT_MAXLENGTH,
			cjk: true,
			wild: true,
			onInput: function(event,status){
				var n = status.maxLength - status.leftLength;
				if(n > status.maxLength){
					counter.hide();
				}else{
					counter.show().find('em').html(n);
				};
				if(textarea.val().length > 0){
					btn.removeClass('disabled');
				}else{
					btn.removeClass().addClass('disabled');
				}
				edit.data('textLength',n);
				var ct = checkTextarea(edit,textarea);
				if(ct.status){
					tip.hide();
				}else{
					tip.html(ct.text).show();
				};
			}
		});
		btn
		.hover(function(){
			if(this.className != 'disabled'){
				this.className = 'hover';
			}
		},function(){
			if(this.className != 'disabled'){
				this.className = '';
			}
		})
		.mousedown(function(){
			if(this.className != 'disabled'){
				this.className = 'down';
			}
		})
		.mouseup(function(){
			if(this.className != 'disabled'){
				this.className = 'hover';
			}
		})
		.click(function(){
			if(this.className == 'disabled'){
				return;
			}
			var ct = checkTextarea(edit,textarea,true);
			var text = $.trim(textarea.val().replace(/\r?\n/g, ''));
			if(ct.status){
				tip.hide();
				$[app].createNote(self.options.date,text,function(data){
					self.createNote(text,data.id,data.date);
					textarea.val('');
					counter.find('em').html('0');
					btn.removeClass().addClass('disabled');
				});
			}else{
				emptyContentAlert(textarea[0]);
				tip.html(ct.text).show();
				if(ct.reset){
					counter.show().find('em').html('0');
					textarea.val('').focus();
				}
			};
		});
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