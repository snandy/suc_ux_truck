/*
 *	空间 好友-跟随前台
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'friendsapp';

var PAGE_NAME = 'attsShowOthers';


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
	uid: '',
	init: function($this,options){
		var self = this;
		this.$this = $this;
		$.extend(this.options,options || {});
		
		
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
			//添加跟随
			if($target.closest('.app-friends-add').length){
				$target = $target.closest('.app-friends-add');
				$div = $target.closest('div[data-friends-xpt]');
				if($div.length){
					$[app].follow(
					{
						'xpt':$div.attr('data-friends-xpt'),
						'from_type':$[app].fromType.blogPerson
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
		})
		.delegate('div.friend-item','mouseenter.' + app,function(){
			var $target = $(this);
			$target.addClass('active');
		})
		.delegate('div.friend-item','mouseleave.' + app,function(){
			var $target = $(this);
			$target.removeClass('active');
		});
		

		$this.data('friends-page',PAGE_NAME);
	},
	/*
	取消跟随时，更新 总跟随数 和 该人所属分组 的数字
	@param {
		groups: '1,2,3,4' 取消跟随时，这个人对应的分组都要减1
		gid: '1' 针对单个分组做的操作
		modify: -1 or 1 是做+1 还是做 -1 的操作
		nogroup: xxx 未分组数，由服务器返回
 	}
	*/
	
	updateCount: function(param){
		var i,len,hash = {};
		this.groupHash.total = parseInt(this.groupHash.total,10) - 1;
		
		var $follow = this.$this.find('div.friend-attention-title > h2 > strong');
		if($follow.length){
			$follow.html($follow.text().replace(/\d+/,this.groupHash.total));
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


})(jQuery);