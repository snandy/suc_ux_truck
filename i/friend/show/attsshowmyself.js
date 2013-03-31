/*
 *	空间 好友-跟随前台
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'friendsapp';

var PAGE_NAME = 'attsShowMyself';


var project = {
	$this: null,
	options: {
		
	},
	card: null,//名片
	isInited: false,
	groupPop: null,//分组浮层
	groupHash: {
		total: 0
	},
	init: function($this,options){
		var self = this;
		this.$this = $this;
		$.extend(this.options,options || {});
		
		
		if(!$[app].utils.isUndefined(this.options.total)){
			this.groupHash.total =  this.options.total;
		}
		/*
		执行每次都需要重复绑定的事件
		*/
		
		
		this.getSentence();//回填一句话

		$(window).scrollTop(0);

		/*
		如果当前页面就是本页面，则执行静态绑定
		*/
		if($this.data('friends-page') && $this.data('friends-page') == PAGE_NAME){
			return $this;
		}
		
		/*
		下面是所有静态绑定的事件
		*/
		/*
		首先取消之前页面所有的静态绑定
		*/
		this.initCard();//初始化名片
		$this.unbind('.'+app).undelegate('.'+app);

		/*
		静态绑定click事件，处理取消跟随，设置备注
		*/
		$this
		.bind('click.'+app,function(event){

			var $target = $(event.target),$div,uid,userName,gid;
			
			//取消跟随
			if($target.closest('.app-friends-remove').length){
				$target = $target.closest('.app-friends-remove');
				$div = $target.closest('div[data-friends-xpt]');
				if($div.length){
					userName = $div.find('.user-name a:eq(0)').attr('title');
					$[app].unFollow($div.attr('data-friends-xpt'),userName,
					function(data){
						//取消成功后删除该元素
						$div.slideUp('slow',function(){
							$div.remove();
							if(!$this.find('.friend-item-list > .friend-item').length){
								window.location.reload();
							}
						});
						self.updateCount();
					},
					event);
				};
			}
			//打招呼
			else if($target.closest('.app-friends-poke').length){
				$target = $target.closest('.app-friends-poke');
				$div = $target.closest('div[data-friends-xpt]');
				if($div.length){
					$[app].pokeMe($div.attr('data-friends-xpt'));
				};
			}
		})
		.delegate('div.friend-item','mouseenter.' + app,function(){
			var $target = $(this);
			$target.addClass('active');
			$target.find('.follow-undo').show();
		})
		.delegate('div.friend-item','mouseleave.' + app,function(){
			var $target = $(this);
			$target.removeClass('active');
			$target.find('.follow-undo').hide();
		});

		$this.data('friends-page',PAGE_NAME);
	},
	
	updateCount: function(param){
		var i,len,hash = {};
		this.groupHash.total = parseInt(this.groupHash.total,10) - 1;
		
		var $follow = this.$this.find('div.friend-attention-title > h2 > strong');
		if($follow.length){
			$follow.html($follow.text().replace(/\d+/,this.groupHash.total));
		}
		
		if($.iProfile && $.iProfile.setAttNum){
			$.iProfile.setAttNum(-1);
		}
		
	},
	getSentence: function(){
		var self = this,$divs = this.$this.find('div[data-friends-xpt]');
		var xpts = [];
		$divs.each(function(){
			var $o = $(this);
			if($o.attr('data-friends-xpt') != ''){
				xpts[xpts.length] = $o.attr('data-friends-xpt');
			}
		});
		$[app].sentence(xpts,function(data){
			self.fillSentence(data)
		});
	},
	fillSentence: function(data){
		var ary = data.sentences;
		if($.isArray(ary)){
			for(var i=0,len=ary.length;i<len;i+=1){
				var obj = ary[i];
				var $div = this.$this.find('div[data-friends-xpt="'+obj.xpt+'"]');
				if($div.length){
					$div.find('div.user-feed').html(obj.content);
					$div.find('div.feed-data').html('('+obj.createtime+')');
				}
			}
		}
	},
	findDiv: function(param){
		if(param.xpt){
			return this.$this.find('div[data-friends-xpt="'+param.xpt+'"]');
		}else if(param.friendid){
			return this.$this.find('div[data-friends-friendid="'+param.xpt+'"]');
		}
		return null;
	},
	initCard: function(){
		var self = this;
		
		this.card = new $.iCard({
			bindElement: '#friend-canvas',
			onFollow: function(param){
				
			},
			onUnfollow: function(param){
				var $div = self.findDiv(param);
				$div.slideUp('slow',function(){
					$div.remove();
				});
				self.updateCount();
				self.card.hide(0);
			}
		});
	}

};


$[app][PAGE_NAME+'Boot'] = function(options) {
	var $this = this;
	return $this;
};

$[app][PAGE_NAME+'Load'] = function(options) {
	$[app].onPageLoaded();
	var $this = $('#friend-canvas');
	project.init($this,options);
	return $this;
};


})(jQuery);