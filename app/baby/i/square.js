/*
 *	母婴app 后台 育儿广场
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'babyapp';

var PAGE_NAME = 'square';

var start = new Date();//下限是当前日期
var end = new Date(start.getFullYear(),start.getMonth() + 10,1);//上限是十个月后

var starPage = '',
	findPage = '';

var project = {
	$this: null,
	lastParams: {},
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

		//初始化签到
		ms[app].signin.init($this.find('div.baby-sign-box'));


		$this.find('div.find-box ul.baby-hall-follow-list,div.star-box ul.baby-hall-follow-list').after('<div class="baby-hall-follow-text" style="display:none;height:108px;">抱歉，没有符合条件的用户或已全部被跟随</div>');
		
		this.$year = $('#baby_birth_year').width(65);
		this.$month = $('#baby_birth_month').width(65);
		this.$prov = $('#baby_prov').width(90);
		this.$city = $('#baby_city').width(116);
		
		this.$changeFind = $this.find('div.find-box a.change');
		this.$changeStar = $this.find('div.star-box a.change');
		
		this.initTab();
		this.birth();
		this.initArea();
		this.loadFriends();
		this.loadStars();
			
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
		.delegate('div.baby-hall-follow-button > a','click.'+app,function(event){
			//单个跟随
			var $a = $(this),
				$o = $a.closest('[data-friends-xpt]');
			if($o.length && !$a.hasClass('already-attention')){
				ms[app].ajax.follow({
					xpt: $o.attr('data-friends-xpt'),
					'from_type': 'baby'
				},function(data){
					$a.addClass('already-attention').text('已跟随');
					self.card.clearCache();
				});
			};

		})
		.delegate('div.find-box div.baby-hall-followall-button > a','click.'+app,function(event){
			//找朋友跟随所有
			event.preventDefault();
			var xpts = [],
				$ul_ = self.$this.find('div.find-box ul.baby-hall-follow-list');
			$ul_.find('> li[data-friends-xpt]').each(function(){
				var $li_ = $(this);
				if(!self.isAlreadyFollowed($li_)){
					xpts.push($li_.attr('data-friends-xpt'));
				}
			});
			if(xpts.length > 0){
				ms[app].ajax.followAll({
					userid: xpts.join(','),
					'from_type': 'baby'
				},function(data){
					$ul_.find('div.baby-hall-follow-button > a').addClass('already-attention').text('已跟随');
					/*
					setTimeout(function(){
						self.loadFriends(self.lastParams);
					},1000);
					*/
				});
			}
		})
		.delegate('div.star-box div.baby-hall-followall-button > a','click.'+app,function(event){
			//日历明星跟随所有
			event.preventDefault();
			var xpts = [],
				$ul_ = self.$this.find('div.star-box ul.baby-hall-follow-list');
			$ul_.find('> li[data-friends-xpt]').each(function(){
				var $li_ = $(this);
				if(!self.isAlreadyFollowed($li_)){
					xpts.push($li_.attr('data-friends-xpt'));
				}
			});
			if(xpts.length > 0){
				ms[app].ajax.followAll({
					userid: xpts.join(','),
					'from_type': 'baby'
				},function(data){
					$ul_.find('div.baby-hall-follow-button > a').addClass('already-attention').text('已跟随');
					/*
					setTimeout(function(){
						self.loadStars({c:1});
					},1000);
					*/
				});
			}
		})
		.delegate('div.find-box a.change','click.'+app,function(event){
			//找朋友换一换
			event.preventDefault();
			self.loadFriends($.extend(self.lastParams,{page:findPage}));
		})
		.delegate('div.star-box a.change','click.'+app,function(event){
			//日历明星换一换
			event.preventDefault();
			self.loadStars({c:1,page:starPage});
		});
		$this.data('baby-page',PAGE_NAME);
	},
	loadFriends: function(params){
		var self = this,
			$ul = this.$this.find('div.find-box ul.baby-hall-follow-list');
		params = params || {};
		$.getJSON('/a/app/baby/square_interface.ac',params,function(results){
			if(results.code != 0){
				return;
			}
			findPage = results.page;
			$ul.parent().find('a.change').css('visibility',parseInt(results.maxPage,10) > 1 ? 'visible' : 'hidden');
			var data = results.data;
			if(data.length == 0){
				$ul.next('div.baby-hall-follow-text').show().next('div.baby-hall-followall-button').css('visibility','hidden');
				$ul.empty().hide();
				return;
			}
			self.lastParams = params;
			self._build($ul,data);
		});

		if(params.status || params.y || params.m){
			this.$prov.val('');
			this.$city.val('');
		}
		else if(params.p || params.c){
			this.$year.val('');
			this.$month.val('');
		}
	},
	loadStars: function(params){
		var self = this,
			$ul = this.$this.find('div.star-box ul.baby-hall-follow-list');
		params = params || {};
		$.getJSON('/a/app/baby/calendar_star.ac',params,function(results){
			if(results.code != 0){
				return;
			}
			starPage = results.page;
			var data = results.data;
			if(data.length == 0){
				$ul.next('div.baby-hall-follow-text').show().next('div.baby-hall-followall-button').css('visibility','hidden');
				$ul.empty().hide();
				$ul.parent().find('a.change').css('visibility','hidden');
				return;
			}
			$ul.parent().find('a.change').css('visibility','visible');
			self._build($ul,data);
		});
	},
	_build: function($ul,data){
		$ul.next('div.baby-hall-follow-text').hide().next('div.baby-hall-followall-button').css('visibility','visible');
		var $li,obj,html = [];
		for(var i=0;i<data.length;i+=1){
			obj = data[i];
			html.push('<li data-friends-xpt="'+obj.xpt+'">');
			html.push('<div class="photo"><a href="'+obj.homeurl+'app/baby/" target="_blank" title="'+obj.nick+'"><img src="'+obj.image+'" data-card="true" data-card-type="isohu" data-card-action="xpt='+obj.xpt+'"></a></div>');
			html.push('<h4><a href="'+obj.homeurl+'app/baby/" target="_blank" title="'+obj.nick+'"  data-card="true" data-card-type="isohu" data-card-action="xpt='+obj.xpt+'">'+ms[app].utils.cutCjkString(obj.nick,8,'',0)+'</a></h4>');
			html.push('<div class="baby-hall-follow-button">');
			if(obj.isFriend){
				html.push('<a href="javascript:void(0)" class="already-attention">已跟随</a>');
			}else{
				html.push('<a href="javascript:void(0)">跟随</a>');
			}	
			html.push('</div>');
			html.push('</li>');
		}
		$ul.show().animate({'opacity':0.5},'fast',function(){
			$ul.html(html.join('')).animate({'opacity':1},'normal');
		});
	},
	initTab: function(){
		var self = this,
			$ul = this.$this.find('.baby-hall-filter-nav'),
			$wrapper = $ul.next('.baby-hall-filter-select-wrapper');
		$ul.find('li').click(function(event){
			event.preventDefault();
			var $this = $(this),
				index = $ul.find('li').index($this);
			if($this.hasClass('now') && index != 2){
				return;
			}
			$ul.find('li').removeClass('now');
			$this.addClass('now');
			
			switch(index){
				case 0:
					//已有宝宝
					self.birth();
					$wrapper.find('select').val('');
					$wrapper.css('visibility','visible');
					break;
				case 1:
					//准妈妈
					self.due();
					$wrapper.find('select').val('');
					$wrapper.css('visibility','visible');
					break;
				case 2:
					//备孕中
					$wrapper.css('visibility','hidden');
					self.loadFriends({
						status: 1
					});
					break;
			}
			
		});
	},
	birth: function(){
		this.initYear();
		this.initMonth();
	},
	initYear: function(){
		var self = this,
			now = new Date(),
			$select = this.$year;
		$select[0].options.length = 1;
		for(var i = now.getFullYear() ,len = 2000; i >= len ;i -= 1){
			var option = document.createElement('option');
			if(i == 2000){
				option.text = "2000年及以前";
			}else{
				option.text = i;
			}
			option.value = i;
			$select[0].options.add(option);
		}
		this.$year.unbind('change').change(function(){
			self.onDateChange();	
		});
		
	},
	initMonth: function(){
		var self = this,
			arr = [];
		for(var i = 1; i <= 12 ;i += 1){
			arr.push(i);
		}
		ms.babyapp.reg.buildSelect(this.$month,arr);
		this.$month.unbind('change').change(function(){
			self.onDateChange();
		});
	},
	due: function(){
		var self = this;
		this.initDueYear();
		this.$year.unbind('change').change(function(){
			self.initDueMonth($(this).val());
		}).change();
		this.$month.unbind('change').change(function(){
			self.onDateChange();
		});
	},
	initDueYear: function(){
		var self = this,
			arr = [];
		for(var i = end.getFullYear() ,len = start.getFullYear(); i >= len ;i -= 1){
			arr.push(i);
		}
		ms.babyapp.reg.buildSelect(this.$year,arr);
	},
	initDueMonth: function(year){
		var self = this;
		
		if(!year){
			return;
		}
		var sMonth,eMonth,arr = [];
		if(year == start.getFullYear()){
			sMonth = start.getMonth() + 1;
			eMonth = 12;
		}
		else if(year == end.getFullYear()){
			sMonth = 1;
			eMonth = end.getMonth() + 1;
		}
		else{
			sMonth = 1;
			eMonth = 12;
		}
		
		for(var i = sMonth; i <= eMonth ;i += 1){
			arr.push(i);
		}
		ms.babyapp.reg.buildSelect(this.$month,arr);
		
	},
	initArea: function(){
		var self = this;
		ms.babyapp.reg.buildSelect(this.$prov,ms.area.province);
		this.$prov.change(function(){
			ms.babyapp.reg.buildSelect(self.$city,ms.area.city[$(this).val()]);
		}).change();
		this.$city.change(function(){
			var prov = self.$prov.val(),
				city = self.$city.val();
			if(prov != '' && city != ''){
				self.loadFriends({
					'p': prov,
					'c': city
				});
				self.$year.val('');
				self.$month.val('');
			}
		});
	},
	onDateChange: function(){
		var self = this,
			year = this.$year.val(),
			month = this.$month.val(),
			status = this.getStatus();

		if(year != '' && month != '' && status != 1){
			this.loadFriends({
				'status': status,
				'y': year,
				'm': month
			});
			this.$prov.val('');
			this.$city.val('');
		}
	},
	getStatus: function(){
		var $ul = this.$this.find('.baby-hall-filter-nav'),
			$now = $ul.find('li.now');
		switch($ul.find('li').index($now)){
			case 0:
				//已有宝宝
				return 3;
			case 1:
				//准妈妈
				return 2;
			case 2:
				//备孕中
				return 1;
		}
	},
	isAlreadyFollowed: function($o){
		return $o.find('.baby-hall-follow-button > a').hasClass('already-attention');
	},
	initCard: function(){
		var self = this;
		this.card = new $.iCard({
			bindElement: this.$this,
			onFollow: function(param){
				self.$this.find('li[data-friends-xpt="'+param.xpt+'"] div.baby-hall-follow-button > a').removeClass().addClass('already-attention').html('已跟随');
			},
			onUnfollow: function(param){
				self.$this.find('li[data-friends-xpt="'+param.xpt+'"] div.baby-hall-follow-button > a').removeClass().html('跟随');
			}
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