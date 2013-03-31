/*
 *	母婴app 后台 天模式
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'babyapp';

var PAGE_NAME = 'photo';




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
		
		//清理之前页面可能存在的对话框
		ms[app].dialog.clear();

		this.dialog.user = ms[app].dialog.user({
			modal: false,
			$parent: $this,
			appendTo: $('#main')
		});
			
		this.pageList = new ms.babyapp.pager({
			appendTo: $this.find('div.baby-photo-list-page'),
			current: 1,
			max: 1,
			maxShow: 7,
			autoUpdate: false,
			onClick: function(page){
				self.loadPhoto(page);
			}
		});

		this.loadPhoto(1);
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
		.delegate('li[data-babyapp-id]','click.'+app,function(event){
			//显示用户日历项
			var $li = $(this),
				id = $li.attr('data-babyapp-id');
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
					nick: $li.attr('data-babyapp-nick'),
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
								self.deleteNote($li);
							});
						}
					});
					$condialog.css('left',self.$this.offset().left + (self.$this.width() - $condialog.width())/2);
				},function(data){
					$li.find('div.bottom a.score-1').attr('class','score-2');
				});
			});
			
		})
		.delegate('li[data-babyapp-id]','mouseenter.'+app,function(){
			$(this).find('div.bottom').show();
		})
		.delegate('li[data-babyapp-id]','mouseleave.'+app,function(){
			$(this).find('div.bottom').hide();
		})
		.delegate('a.score-1','click.'+app,function(event){
			event.stopPropagation();
			var $a = $(this),
				$li = $a.closest('li[data-babyapp-id]');
			if($li.length){
				ms[app].ajax.vote({id:$li.attr('data-babyapp-id')},function(data){
					$a.attr('class','score-2');
				});
			}
		});

		
		$this.data('baby-page',PAGE_NAME);
	},
	loadPhoto: function(pageNum){
		var self = this;
		this._loading();
		if(this.pageList){
			this.pageList.hide();
		}
		$.getJSON('/a/app/baby/myBabyPic.ac',{page: pageNum,uid: ms[app].getUid()},function(results){
			if(results.code == 0){
				self._build(results.data);
			}else{
				$.alert(results.msg);
			}
		
		});
	},
	_build: function(data){
		var $box = this.$this.find('div.baby-photo-list-wrapper'),
			obj,
			nowTime = new Date().getTime(),
			html = ['<ul class="clearfix">'];
		if(data.feed.length == 0){
			$box.html('<div class="baby-con-tips-wrapper">生活很精彩所以很忙，TA还没有发照片日历</div>');
			return;
		}
		for(var i=0,len=data.feed.length;i<len;i+=1){
			obj = data.feed[i];
			html.push([
			'<li data-babyapp-id="'+obj.mid+'" data-babyapp-nick="'+obj.nick+'">',
				'<div class="img">',
					'<img src="'+obj.img+'">',
				'</div>',
				'<div class="bottom" style="display:none">',
					'<p class="text" title="'+obj.nick+'">'+ms[app].utils.cutCjkString(obj.nick,18,'...',2)+'</p>',
					'<p class="text">'+ms[app].utils.timeago(nowTime,obj.date*1)+'</p>',
					'<a class="'+(obj.vote ? 'score-2':'score-1')+'" href="javascript:void(0)" title="喜欢"></a>',
				'</div>',
			'</li>'
			].join(''));
		}

		html.push('</ul>');

		$box.html(html.join(''));

		if(data.total_page > 1){
			this.pageList.update(data.cur_page,data.total_page);
			this.pageList.show();
		}
	},
	_loading: function(){
		var $box = this.$this.find('div.baby-photo-list-wrapper');
		if(!$box.find('ul').length){
			$box.html('<div class="data-info-list-load"><i class="icon-load"></i>数据加载中</div>');
		}
	},
	deleteNote: function($li){
		$li.remove();
	}

};



ms[app][PAGE_NAME+'Load'] = function(options) {
	var $this = $('#innerCanvas');
	project.init($this,options);
	ms[app].onPageLoaded($this);
	return $this;
};


})(jQuery,mysohu);