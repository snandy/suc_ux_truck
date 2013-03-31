/*
 *	母婴app 后台 周模式
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'babyapp';

var PAGE_NAME = 'week';

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
	pageList: null,
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
			mode: 'week',
			onClick: function(datestring){
				ms.babyapp.loadPage('i',{url:'/a/app/baby/calendar.ac?date=' + datestring});
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

		
		this.pageList = new ms.babyapp.pager({
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
		
		this.initKnow();//初始化可能感兴趣的宝宝
		
		//统一替换表情
		$this.find('[data-babyapp-ctext]').each(function(){
			var $o = $(this);
			$o.html(mysohu.babyapp.Emot.trans.cut($o.attr('data-babyapp-ctext').replace(/&/g,'&amp;'),32));
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
		this.initCard();
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
						self.createNote($li,mysohu.babyapp.Emot.trans.cut(data.text,32),data.id,pic);
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
				id = $p.attr('data-babyapp-id');
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
								self.$this.find('div.data-info-list-data div[data-babyapp-id="'+id+'"]').remove();
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
	createNote: function($li,text,id,pic){
		var $div = $li.find('div.week-data-list-con');
		var $p = $('<p class="week-data-list-con-text babyapp-user" data-babyapp-id="'+id+'"></p>');
		$p.html('<span class="data-star-icon2"></span>'+(pic ? '<span class="data-pic-icon"></span>' : '')+'<a href="javascript:void(0)">'+text+'</a>');
		$div.append($p);
		this.sortNote($li);
	},
	deleteNote: function($p){
		if(!$p.length) return;
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
	},
	initFeed: function(){
		var self = this;
		var $ererybodySay = this.$this.find('span.babyapp-everybody-say');
		var $friendBaby = this.$this.find('span.babyapp-friend-baby');
		var $refresh = this.$this.find('span.data_info_list_update');
		var $box = this.$this.find('div.data-info-list-data');
		$box.delegate('span.pic-icon','click',function(event){
			var $div = $(this).closest('div[data-babyapp-id]');
			if($div.length){
				var id = $div.attr('data-babyapp-id');
				self.dialog.official.close();
				//这里后续写成读取接口返回内容的方式
				ms[app].ajax.get({'id':id},function(data){
					self.dialog.user.show({
						id: id,
						xpt: data.xpt,
						pic: data.pic,
						text: data.content,
						datetime: data.date,
						vote: data.vote,
						voteCount: data.vote_sum,
						nick: $div.attr('data-babyapp-nick'),
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
									$div.remove();
									self.deleteNote(self.$this.find('p[data-babyapp-id="'+id+'"]'));
								});
							}
						});
						$condialog.css('left',self.$this.offset().left + (self.$this.width() - $condialog.width())/2);
					});
				});
			}
		});
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
			}else if($friendBaby.hasClass('friend-baby-now')){
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
		
		$.getJSON('/a/app/baby/babyFeed.ac',function(result){
			if(result.code == 0){
				self.buildFeed(result.data.feed);
			}else{
				self.buildFeed();
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
		$.getJSON('/a/app/baby/babyFeed.ac',{type:'2',page:pagenum},function(result){
			if(result.code == 0){
				self.buildFeed(result.data.feed);
				self.pageList.update(result.data.cur_page,result.data.total_page);
				self.pageList.show();
			}else{
				self.buildFeed();
			}
		});
	},
	feedLoading: function(flag){
		if(flag){
			this.$this.find('div.data-info-list-data').html('<div class="data-info-list-load"><span class="icon-load"></span>正在读取数据...</div>');
		}
	},
	buildFeed: function(ary){
		var $box = this.$this.find('div.data-info-list-data'),i,len,$div,html = [],now = new Date().getTime();
		if(!ary){
			$box.html('<div class="baby-con-tips-wrapper">生活很精彩所以很忙，好友们今天什么也没写</div>');
			return;
		}
		for(i = 0,len = ary.length; i<len; i += 1){
			html.push('<div class="data-info-list-data-item clearfix" data-babyapp-id="'+ary[i]['calendar_id']+'" data-babyapp-nick="'+ary[i]['nick']+'">');

			html.push('<div class="data-info-list-data-item-avatar">');
			html.push('<a target="_blank" href="'+ary[i]['homeurl']+'app/baby/"><img src="'+ary[i]['image']+'" alt="'+ary[i]['nick']+'" data-card="true" data-card-type="isohu" data-card-action="xpt='+ary[i]['xpt']+'"></a>');
			html.push('</div>');

			html.push('<div class="data-info-list-data-item-text hijackdata" data-appid="baby" data-xpt="'+ary[i]['xpt']+'" data-itemid="'+ary[i]['calendar_id']+'">');
			html.push('<p><a target="_blank" href="'+ary[i]['homeurl']+'app/baby/">'+ary[i]['nick']+'['+ary[i]['babyinfo']+']：</a>'+(ary[i]['pic'] ? '<span class="pic-icon"></span>' : '')+ms[app].Emot.trans.cut(ary[i]['feed_text'])+'</p>');
			html.push('<div class="day-text-note">');

			html.push('<div class="comment"><a href="javascript:void(0)" action="baby.comment">评论</a></div>');
			html.push('发表于'+ms[app].utils.timeago(now,ary[i]['calendar_create_datetime']*1));
			html.push('</div>');

			html.push('</div>');
			html.push('</div>');
		}
		$box.html(html.join(''));
		var ary = [],$cache = {};
		$box.find('[data-itemid]').each(function(){
			var $o = $(this);
			ary.push({
				itemid: $o.attr('data-itemid'),
				xpt: $o.attr('data-xpt')
			});
			$cache[$o.attr('data-itemid')] = $o;
		});
		ms[app].ajax.fillCount(ary,function(data){
			$.each(data,function(key,value){
				$cache[key].find('a[action="baby.comment"]').text('评论' + (value.commentcount > 0 ? '('+value.commentcount+')' : ''));
			});
		});
	},
	initCard: function(){
		var self = this;
		this.card = new $.iCard({
			bindElement: this.$this,
			onFollow: function(param){
				self.$this.find('li[data-friends-xpt="'+param.xpt+'"] > p.button > a').removeClass().addClass('already-attention').html('已跟随');
			},
			onUnfollow: function(param){
				self.$this.find('li[data-friends-xpt="'+param.xpt+'"] > p.button > a').removeClass().html('跟随');
			}
		});
	},
	initKnow: function(){
		var self = this;
		this.$this.find('li[data-friends-xpt] > p.button').bind('click',function(){
			var $target = $(this),
				xpt = $target.closest('li').attr('data-friends-xpt');

			ms[app].ajax.follow({
				'xpt':xpt,
				'from_type': 'baby'
			},function(data){
				$target.find('>a').addClass('already-attention').html('已跟随');
				self.card.clearCache();
			});

		});
	}

};



//mysohu.babyapp.weekLoad({date:'2012-02-16'});


ms[app][PAGE_NAME+'Load'] = function(options) {
	var $this = $('#innerCanvas');
	project.init($this,options);
	ms[app].onPageLoaded($this);
	return $this;
};


})(jQuery,mysohu);