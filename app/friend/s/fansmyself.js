/*
 *	home proxy方式 个人展示页 跟随者列表（自己看自己）
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'friendsapp';

var core = ms.friend;//将friend类缩写成core

var PAGE_NAME = 'fansShowMyself';

var project = {
	$this: null,
	card: null,//名片
	isInited: false,
	init: function($this){
		var self = this;
		this.$this = $this;

		this.getSentence();//回填一句话
		
		this.initCard();//初始化名片
		
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
					//取消成功后更改跟随状态
					var html = '';
					//取消跟随 @friendType : 1 单向好友 2 没有关系
					if(data.friendType == '1'){
						$div.find('div.set-action').html('<div class="set-attention"><a class="app-friends-add" href="javascript:void(0)">跟随</a></div>');
					}else if(data.friendType == '2'){
						//这里的情况只会发生在页面长时打开，在取消跟随时对方已经先取消了对你的跟随，这时双方都没有关系，移除该用户
						$div.slideUp('slow',function(){
							$div.remove();
						});
					};
					self.updateCount(-1);
					self.card.clearCache();
				});
			}
		})
		//添加跟随
		.delegate('.app-friends-add','click.'+app,function(){
			var $target = $(this),
				$div = $target.closest('div[data-friends-xpt]');
			if($div.length){
				core.follow(
				{
					'xpt':$div.attr('data-friends-xpt'),
					'from_type':core.fromType.blogPerson
				},
				function(data){
					//添加跟随后更改跟随状态
					var html = '';
					//添加跟随 @friendType : 1 双向好友 0 单向好友
					if(data.friendType == '1'){
						html = '<i class="global-icon-eachOtherFriend-16">互粉</i>';
							
					}else if(data.friendType == '0'){
						html = '<span class="follow-icon follow-icon-clear"></span>';
					}
					html += '<span class="follow-undo">'
						 + '<a class="app-friends-remove" href="javascript:void(0)">取消跟随 </a>'
						 //+ '<a class="app-friends-poke" href="javascript:void(0);">打招呼</a>'
						 + '</span>';
					$div.find('div.set-action').html('<div class="set-follow">'+html+'</div>');
					self.updateCount(1);
					self.card.clearCache();
					//弹出设置分组对话框
					if($.iCard && $.iCard.SetGroupsDialog){
						$.iCard.SetGroupsDialog.show({
							'friendid': data.friendId,
							'nick': $div.find('div.user-name > a').eq(0).text(),
							'friendType': data.friendType,
							'xpt': $div.attr('data-friends-xpt')
						});
					}
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
	updateCount: function(n){
		var $follow = $('#ms_num_follow'),
			count = parseInt($follow.text().match(/\d+/),10);
		if(!isNaN(count)){
			var nn = count + n;
			if(nn >= 0) $follow.text(nn);
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
				var $div = self.findDiv(param);
				var html = '';
				//添加跟随 @friendType : 1 双向好友 0 单向好友
				if(param.friendType == '1'){
					html = '<i class="global-icon-eachOtherFriend-16">互粉</i>';
						
				}else if(param.friendType == '0'){
					html = '<span class="follow-icon follow-icon-clear"></span>';
				}
				html += '<span class="follow-undo">'
					 + '<a class="app-friends-remove" href="javascript:void(0)">取消跟随 </a>'
					 //+ '<a class="app-friends-poke" href="javascript:void(0);">打招呼</a>'
					 + '</span>';
				$div.find('div.set-action').html('<div class="set-follow">'+html+'</div>');
				self.updateCount(1);
			},
			onUnfollow: function(param){
				var $div = self.findDiv(param);
				if(param.friendType == '1'){
					$div.find('div.set-action').html('<div class="set-attention"><a class="app-friends-add" href="javascript:void(0)">跟随</a></div>');
				}else if(param.friendType == '2'){
					//这里的情况只会发生在页面长时打开，在取消跟随时对方已经先取消了对你的跟随，这时双方都没有关系，移除该用户
					$div.slideUp('slow',function(){
						$div.remove();
					});
				}
				self.updateCount(-1);
			}
		});
	}
};


$(function(){
	project.init($('#friend-canvas'));
});


})(jQuery,mysohu);