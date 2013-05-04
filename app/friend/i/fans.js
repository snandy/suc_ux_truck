/*
 *	home proxy方式 好友后台 跟随者管理页
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'friend';

var core = ms.friend;//将friend类缩写成core

var PAGE_NAME = 'fansManage';

var project = {
	$this: null,
	card: null,//名片
	isInited: false,
	init: function($this,hasNick){
		var self = this;
		this.$this = $this;

		this.isSearchMode = !hasNick;//是否为搜索模式，搜索模式下有些代码不需要执行
		
		/*
		执行每次都需要重复绑定的事件
		如suggest初始化
		*/
		
		var findTipText = '请输入用户名';
		var $form = $this.find('div.search form');
		var $nick = $form.find('input[name=nick]');
		
		$form.submit(function(){
			$nick.val($.trim($nick.val()));
			if($nick.val() == '' || $nick.val() == findTipText){
				$nick.val('').focus();
				return false;
			}
			return true;
		});

		$nick
			.iPrompt({text: findTipText,css:{'color':'#999999'}})
			.ajaxSuggest({
				appendTo: '#friend-canvas',
				url: '/a/search/user/friend/sug.do?cb=?&_input_encode=UTF-8',
				dataType: 'jsonp',
				paramName: 'nick',
				extraParams: {
					'type':'fans'
				},
				funFormatResults: function(data){
					var ary,results = [];
					if(data.code == 1){
						if($.isArray(data.data.friends)){
							ary = data.data.friends;
							for(var i=0;i<ary.length;i+=1){
								results[results.length] = {
									data: ary[i].nick,
									value: ary[i].nick
								};
							}
						}
					}
					
					return results;
				},
				funFormatItem: function(value,data,lastValue){
					lastValue = $.trim(lastValue);
					value = core.utils.cutCjkString(value,26,'...',2);
					if(lastValue == ''){
						return value;
					}
					var reg = new RegExp('('+lastValue+')','ig');
					return value.replace(reg,'<strong>$1</strong>');
				},
				onItemSelect: function(data){
					$form.submit();
				}
			});
		
		this.getSentence();//回填一句话
		
		/*
		下面是所有静态绑定的事件
		*/
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
					'from_type':core.fromType.homeFans
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
				};
			}
		});
	}
};


var urlParams = core.getURLParams();

$(function(){
	project.init($('#friend-canvas'),core.utils.isUndefined(urlParams.nick));
});


})(jQuery,mysohu);