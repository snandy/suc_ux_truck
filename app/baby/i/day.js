/*
 *	母婴app 后台 天模式
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'babyapp';

var PAGE_NAME = 'day';

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

function checkTextarea(n,text,isSubmit){
	text = $.trim(text.replace(/\r?\n/g, ''));
	var result = {
		status : true,
		reset : false,
		text : ''
	};
	if(isSubmit){
		if(text == ''){
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
		//this.options.date = ms[app].calendarApi.formatDate(ms[app].calendarApi.getDate(this.options.date));
		this.miniCalendar = ms[app].miniCalendar({
			appendTo: $this.find('div.calendar-manipulation'),
			date: this.options.date,
			mode: 'day',
			onClick: function(datestring){
				ms.babyapp.loadPage('i',{url:'/a/app/baby/calendar.ac?category=day&date=' + datestring});
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
		

		this.initInputBox();
		
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
				ms.babyapp.loadPage('i',{url:'/a/app/baby/calendar.ac?category=day&date=' + $target.attr('data-babyapp-date')});
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
	createNote: function(text,id,datetime,pic){
		var $box = this.$this.find('div.day-data-list');
		var $div = $('<div class="list-team"></div>');
		$div.attr('data-babyapp-id',id);
		$div.attr('data-itemid',id);
		$div.attr('data-appid','baby');
		$div.attr('data-xpt',$space_config._xpt);
		var now = new Date().getTime();
		var html = [
		'<p class="day-text">' + text + '</p>',

		pic && pic.small && pic.big ? '<div class="pic-view"><div class="pic-view-small"><img data-photo-big="'+pic.big+'" src="'+pic.small+'"></div></div>' : '',

		'<p class="day-text-note">',
			'<span class="comment">',
				'<a href="javascript:void(0)" class="babyapp-content-del">删除</a>\n',
				'<a target="_blank" href="'+this.options.homeurl+'app/baby/#/a/app/baby/comments_show.ac=^_^=id=' + id+'" class="babyapp-content-comment">评论</a>',
			'</span>',
			'发表于'+ms[app].utils.timeago(now,datetime*1),
		'</p>'
		];
		$div.html(html.join(''));
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
		var self = this,
			$edit = this.$this.find('div.day-con').eq(0),
			$tip = $edit.find('span.error-clew').hide(),
			$counter = $edit.find('span.babyapp-text-counter'),
			$btn = $edit.find('div.baby-btn'),
			$textarea = $edit.find('textarea'),
			$emotBtn = $edit.find('div.pub-faces a'),
			$picBtn = $edit.find('div.insert-picture a'),
			$container = this.$this.find('div.calendar-data-day'),
			uploading = false;

		$counter.html('<em>0</em>/'+TEXT_MAXLENGTH+'字');

		function check(){
			var n = Math.round(ms.babyapp.utils.cjkLength($textarea.val().replace(/\r?\n/g, "")) / 2);
			if(n > TEXT_MAXLENGTH){
				$counter.hide();
			}else{
				$counter.show().find('em').html(n);
			};

			if($textarea.val().length > 0){
				if(!uploading) $btn.removeClass('baby-btn-99-disabled');
			}else{
				$btn.addClass('baby-btn-99-disabled');
			}
			return n;
		}

		var _eventName_ = (function(){
			var evtname = '';
			if($.browser.msie){
				if(parseInt($.browser.version,10) > 8){
					evtname = 'input keyup';
				}else{
					evtname = 'propertychange';
				}
			}else{
				evtname = 'input';
			}
			return evtname;
		})();


		$textarea.bind(_eventName_, function(event){
			var n = check();
			var ct = checkTextarea(n,$textarea.val());
			if(ct.status){
				$tip.hide();
			}else{
				$tip.html(ct.text).show();
			};
		});


		$btn
		.hover(function(){
			if(!$btn.hasClass('baby-btn-99-disabled')){
				$btn.addClass('baby-btn-99-hover');
			}
		},function(){
			if(!$btn.hasClass('baby-btn-99-disabled')){
				$btn.removeClass('baby-btn-99-hover');
			}
		})
		.click(function(){

			if($btn.hasClass('baby-btn-99-disabled')){
				return;
			}
			var text = $.trim($textarea.val().replace(/\r?\n/g, '')),
				pic = self.pupload.getData(),
				n = Math.round(ms.babyapp.utils.cjkLength(text) / 2),
				ct = checkTextarea(n,text,true);

			
			if(ct.status){
				$tip.hide();
				var params = {
					date: self.options.date,
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
					self.createNote(mysohu.babyapp.Emot.trans.cut(data.text),data.id,data.date,pic);
					$textarea.val('');
					$counter.find('em').html('0');
					$btn.removeClass('baby-btn-99-hover').addClass('baby-btn-99-disabled');
					self.pupload.clearData();
					self.pupload.hide();
				});
			}else{
				emptyContentAlert(textarea[0]);
				$tip.html(ct.text).show();
				if(ct.reset){
					$counter.show().find('em').html('0');
					$textarea.val('').focus();
				}
			};

		});

		//表情
		var emot = new ms.babyapp.Emot({'textarea':$textarea,'appendTo':$container,'css':{top:259,left:-20},'onInsert':function(){
			var n = check();
			var ct = checkTextarea(n,$textarea.val());
			if(ct.status){
				$tip.hide();
			}else{
				$tip.html(ct.text).show();
			};
		}});

		$emotBtn.bind('click',function(){
			emot.show();
		});
		

		//图片上传 
		this.pupload = ms.babyapp.photoUpload({
			'appendTo':$container,
			'btn':$picBtn,
			'css':{top: 259,left: 25},
			'onUpload': function(){
				//按钮变灰
				uploading = true;
				$btn.addClass('baby-btn-99-disabled');
			},
			'onUploadComplete': function(results){
				uploading = false;
				if($textarea.val() == '') $textarea.val('分享图片');
				if($textarea.val().length > 0){
					$btn.removeClass('baby-btn-99-disabled');
				}
			},
			'onDelete': function(){
				if($textarea.val() == '分享图片') $textarea.val('');
			}
			
		});

		this.pupload.draw();
	},
	commentAndLink: function(){
		var self = this,ary = [],$cache = {};
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
					.attr('href',self.options.homeurl+'app/baby/#/a/app/baby/comments_show.ac=^_^=id=' + key);
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