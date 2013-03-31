/*
 *	home proxy方式 个人展示页 跟随列表（自己看自己）
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'friend';

var core = ms.friend;//将friend类缩写成core

var PAGE_NAME = 'attsShowMyself';


var project = {
	$this: null,
	card: null,//名片
	isInited: false,
	init: function($this){
		var self = this;
		this.$this = $this;		
		
		this.getSentence();//回填一句话

		/*
		首先取消之前页面所有的静态绑定
		*/
		this.initCard();//初始化名片
		
		/*
		静态绑定click事件，处理取消跟随，设置备注
		*/
		$this
		//取消跟随
		.delegate('.app-friends-remove','click.'+app,function(event){
			var $target = $(this),
				$div = $target.closest('div[data-friends-xpt]');
			if($div.length){
				var name = $div.find('.user-name a:eq(0)').attr('title');
				var xpt = $div.attr('data-friends-xpt');
				core.unFollow({
					'xpt': xpt,
					'name': name,
					'event': event
				},
				function(data){
					//取消成功后删除该元素
					$div.slideUp('slow',function(){
						$div.remove();
						if(!$this.find('.friend-item-list > .friend-item').length){
							window.location.reload();
						}
					});
					self.updateCount();
					self.card.clearCache();
				});
			}
		})
		//打招呼
		.delegate('.app-friends-poke','click.'+app,function(){
			var $target = $(this),
				$div = $target.closest('div[data-friends-xpt]');
			if($div.length){
				core.pokeMe($div.attr('data-friends-xpt'));
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
	},
	getCount: function(){
		var $follow = this.$this.find('div.friend-search div.follow strong'),
			match = $follow.text().match(/\d+/);
		return match || '';
	},
	setCount: function(n){
		if(n < 0) return;
		var $follow = this.$this.find('div.friend-search div.follow strong');
		if($follow.length){
			$follow.html($follow.text().replace(/\d+/,n));
		}
		$('#ms_num_follow').text(n);
	},
	updateCount: function(param){
		var i,len,hash = {},n = parseInt(this.getCount(),10);
		if(!isNaN(n)){
			this.setCount(n-1);
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
		core.sentence(xpts,function(data){
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

$(function(){
	project.init($('#friend-canvas'));
});

})(jQuery,mysohu);