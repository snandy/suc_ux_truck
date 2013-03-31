/*
 *	空间 好友-你可能认识的人 后台
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,window){

var app = 'friendsapp';

var PAGE_NAME = 'may';


var project = {
	$this: null,
	options: {
		type: 1
	},
	card: null,//名片
	isInited: false,
	init: function($this,options){
		var self = this;
		this.$this = $this;
		$.extend(this.options,options || {});



		
		/*
		执行每次都需要重复绑定的事件
		如suggest初始化
		*/
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
		.delegate('div.friend-item','mouseenter.'+app,function(){
			$(this).find('div.refuse').show();
		})
		.delegate('div.friend-item','mouseleave.'+app,function(){
			$(this).find('div.refuse').hide();
		})
		.bind('click.'+app,function(event){

			var $target = $(event.target),$div,uid,userName,gid;
			
			//添加跟随
			if($target.closest('.app-friends-add').length){
				$target = $target.closest('.app-friends-add');
				$div = $target.closest('div[data-friends-xpt]');
				if($div.length){
					$[app].follow(
					{
						'xpt':$div.attr('data-friends-xpt'),
						'from_type':$div.attr('data-from-type') || $[app].fromType.homeMay,
						'recommend_type': $div.attr('data-recommend-type') || ''
					},
					function(data){
						//添加跟随后更改跟随状态
						var html = '';
						//添加跟随 @friendType : 1 双向好友 0 单向好友
						if(data.friendType == '1'){
							//html = '<div class="set-follow"><span class="follow-icon"></span></div>';
							html = '<div class="attention-ok">已跟随</div>';
						}else if(data.friendType == '0'){
							html = '<div class="attention-ok">已跟随</div>';
						}
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
					},
					event);
				};
			}
			//不感兴趣
			else if($target.closest('div.refuse').length){
				event.preventDefault();
				$div = $target.closest('div[data-friends-xpt]');
				if($div.length){
					$.getJSON('/a/search/user/ignore/recommend.do',{
						'xpt':$div.attr('data-friends-xpt'),
						'ignore_type': $div.attr('data-recommend-type') || ''
					}
					,function(results){
						if(results.code == 0){
							$div.slideUp('slow',function(){
								$div.remove();
								if(!$this.find('.friend-item-list > .friend-item').length){
									window.location.href = 'http://i.sohu.com/app/friend/#/a/search/user/search/may.do';
									window.location.reload();
								}
							});
						}
					});
				}
			}
		});

		$this.data('friends-page',PAGE_NAME);			
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


})(jQuery,window);