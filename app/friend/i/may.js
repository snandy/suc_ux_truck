/*
 *	home proxy方式 好友后台 可能感兴趣的人
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'friend';

var core = ms.friend;//将friend类缩写成core

var win = window;

var PAGE_NAME = 'may';


var project = {
	$this: null,
	card: null,//名片
	isInited: false,
	init: function($this){
		var self = this;
		this.$this = $this;
		
		/*
		首先取消之前页面所有的静态绑定
		*/
		this.initCard();//初始化名片

		/*
		静态绑定click事件，处理取消跟随，设置备注
		*/
		$this
		.delegate('div.friend-item','mouseenter.'+app,function(){
			$(this).find('div.refuse').show();
		})
		.delegate('div.friend-item','mouseleave.'+app,function(){
			$(this).find('div.refuse').hide();
		})
		//添加跟随
		.delegate('.app-friends-add','click.'+app,function(){
			var $target = $(this),
				$div = $target.closest('div[data-friends-xpt]');
			if($div.length){
				core.follow(
				{
					'xpt':$div.attr('data-friends-xpt'),
					'from_type':$div.attr('data-from-type') || core.fromType.homeMay,
					'recommend_type': $div.attr('data-recommend-type') || ''
				},
				function(data){
					//添加跟随后更改跟随状态
					var html = '';
					//添加跟随 @friendType : 1 双向好友 0 单向好友
					html = '<div class="attention-ok">已跟随</div>';
					$div.find('div.set-action').html(html);
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
			};
		})
		//不感兴趣
		.delegate('div.refuse','click.'+app,function(event){
			event.preventDefault();

			var $target = $(this),
				$div = $target.closest('div[data-friends-xpt]');
			
			if($div.length){
				core.ignore({
					'xpt':$div.attr('data-friends-xpt'),
					'ignore_type': $div.attr('data-recommend-type') || ''
				},function(data){
					$div.slideUp('slow',function(){
						$div.remove();
						if(!$this.find('.friend-item-list > .friend-item').length){
							win.location.href = 'http://i.sohu.com/searchuser/home/may.htm';
						}
					});
				});
			}
	
		});
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
				$div.find('div.set-action').html('<div class="attention-ok">已跟随</div>');	
			},
			onUnfollow: function(param){
				var $div = self.findDiv(param);
				$div.find('div.set-action').html('<div class="set-attention"><a class="app-friends-add" href="javascript:void(0)">跟随</a></div>');
			}
		});
	}
};


$(function(){
	project.init($('#friend-canvas'));
});

})(jQuery,mysohu);