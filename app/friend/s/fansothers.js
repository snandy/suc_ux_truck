/*
 *	home proxy方式 个人展示页 跟随者列表（看别人）
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'friendsapp';

var core = ms.friend;//将friend类缩写成core

var PAGE_NAME = 'fansShowOthers';

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
		.delegate('div.friend-item','mouseenter.' + app,function(){
			var $target = $(this);
			$target.addClass('active');
		})
		.delegate('div.friend-item','mouseleave.' + app,function(){
			var $target = $(this);
			$target.removeClass('active');
		});
		
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