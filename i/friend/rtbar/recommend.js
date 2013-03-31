/*
 *	个人展示页 特别推荐
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var win = window;

var MAX_LEN = 6;

var replaceCJK = /[^\x00-\xff]/g,
	testCJK    = /[^\x00-\xff]/;

function cjkLength(strValue){
	return strValue.replace(replaceCJK, "lv").length;
}

function isCjk(strValue){
	return testCJK.test(strValue);
}

function cutCjkString(str,len,suffix,slen){
	suffix = suffix || '';
	slen = slen || suffix.length;
	len -= slen;
	if(cjkLength(str) <= len){
		return str;
	}
	var s = str.split(''),c = 0,tmpA = [];
	for(var i=0;i<s.length;i+=1){
		if(c < len){
			tmpA[tmpA.length] = s[i];
		}
		if(isCjk(s[i])){
			c += 2;
		}else{
			c += 1;
		}
	}
	return tmpA.join('') + suffix;
}

function login(){
	if(!$.cookie("ppinf")) {
		$.ppDialog({
			appId: '1019',
			regRedirectUrl: location.href,
			title: '想要查看更多精彩内容，马上登录吧！',
			onLogin: function(userId) {
				location.reload();
			}
		});
		return false;
	}
	return true;
}

/*添加跟随*/
function follow(xpt,callback){
	if(!login()){
		return;
	}
	/*
	xpt是base64后的passport
	*/
	if(xpt){
		$.get('/a/app/friend/friend/add.do',{
			'xpt':xpt,
			'from_type':'blog_recommend'
		},function(results){
			if(results.code == 1 || results.code == -2){
				if($.isFunction(callback)){
					callback(results.data);
				}
			}
		},'json');
	}
};


function noborder($ele){
	//noborder
	if(!$ele.next().length){
		$ele.find('ul').addClass('noborder');
	}
}

var nobody = '木有找到你可能感兴趣的人，快去换一换吧！';

function getXpt(){
	return win.$space_config && win.$space_config._xpt;
}

var myXpt = ($.cookie("sucaccount", {raw: true}) || '').split('|')[0];



var project = {
	inited: false,
	card: null,//名片
	xhr: null,//ajax请求，同时只能有一个请求
	url: '/a/app/friend/recommend/list/' + getXpt() + '/',//请求地址
	init: function(){
		var self = this;
		this.$this = $('#rtbarRecommendBox').hide();
		this.$this.next('div.split-lines').hide();
		if(!this.$this.length){
			return;
		}
		this.getPage();
		//添加跟随
		
		this.$this
		.delegate('.app-friends-add','click',function(event){
			var $target = $(this);
			var $li = $target.closest('li[data-friends-xpt]');
			if($li.length){
				follow($li.attr('data-friends-xpt'),
				function(data){
					$li.find('p.btn-follow-ta').html('<span class="btn-gray-h20 ui-btn-later"><span>已跟随</span></span>');
					
					//弹出设置分组对话框
					if($.iCard && $.iCard.SetGroupsDialog){
						
						$.iCard.SetGroupsDialog.show({
							'friendid': data.friendId,
							'nick': $li.find('div.info-know p.name > a').eq(0).attr('title'),
							'friendType': data.friendType,
							'xpt': $li.attr('data-friends-xpt')
						});
					}
					self.card.clearCache();
				},
				event);
			};
		});
		
		if($.iCard){
			this.card = new $.iCard({
				bindElement: '#rtbarRecommendBox',
				side: 'left',
				params: {
					'type': 'simple',
					'pageid': 16
				},
				onFollow: function(param){
					
					var $li = self.$this.find('[data-friends-xpt="'+param.xpt+'"]');
					if($li.length){
						$li.find('p.btn-follow-ta').html('<span class="btn-gray-h20 ui-btn-later"><span>已跟随</span></span>');
						self.card.hide(1);
					}
					
				},
				onUnfollow: function(param){
					
					var $li = self.$this.find('[data-friends-xpt="'+param.xpt+'"]');
					if($li.length){
						$li.find('p.btn-follow-ta').html('<span class="ui-btn btn-green-h20 app-friends-add"><span><i class="ui-btn-icon"></i>跟随</span></span>');
						self.card.hide(1);
					}
					
				}
			});
		}
		//对外接口，在容器上绑定reload事件，当博主推荐的推荐跟随完毕后调用，刷新状态
		this.$this.data('reload',function(){
			if(self.inited){
				self.getPage();
			}
		});
	},
	getPage: function(){
		var self = this;
		$.getJSON(this.url,function(results){
			if(results.code == 0){
				self.build(results.data);
				self.inited = true;
			}
		});
	},
	build: function(data){
		var self = this,html = [],i,len = data.viewRecommends.length;
		if(!data.viewSelf && len == 0) return;
		html.push('<h3>'+(data.viewSelf && len == 6 ? '<a href="http://i.sohu.com/friend/home/recommend.htm?_input_encode=gbk" class="change">编辑</a>' : '')+(data.viewSelf ? '我':'TA')+'推荐的人</h3>');
		html.push('<ul class="rtbar-com">');
		for(i=0;i<len;i+=1){
			html.push('<li data-friends-xpt="'+data.viewRecommends[i].xpt+'">');
			html.push(this.getLiHTML(data.viewRecommends[i],data.viewSelf));
			html.push('</li>');
		}
		html.push('</ul>');
		
		this.$this.html(html.join('')).show();
		this.$this.next('div.split-lines').show();
		
		if(data.viewSelf) this.addMode();
	},
	getLiHTML: function(data,viewSelf){
		var html = [];
		html.push('<div class="pic-know"><a target="_blank" href="'+data.homeUrl+'" title="'+data.nick+'"><img data-card-action="xpt='+data.xpt+'" data-card-type="isohu" data-card="true" width="34" height="34" src="'+data.icon+'"></a></div>');
		html.push('<div class="info-know">');
		html.push('<p class="name"><a target="_blank" href="'+data.homeUrl+'" title="'+data.nick+'"><em data-card-action="xpt='+data.xpt+'" data-card-type="isohu" data-card="true">'+cutCjkString(data.nick,16,'...',2)+'</em></a></p>');
		
		if(viewSelf){
			html.push('<p class="rtbar-recommend-reason">'+(data.recommendDesc ? data.recommendDesc : '<a href="http://i.sohu.com/friend/home/recommend.htm?_input_encode=gbk">描述我推荐的人</a>')+'</p>');
		}else{
			if(myXpt != data.xpt){
				html.push('<p class="btn-follow-ta">'+(!data.following ? '<span class="ui-btn btn-green-h20 app-friends-add"><span><i class="ui-btn-icon"></i>跟随</span></span>' : '<span class="btn-gray-h20 ui-btn-later"><span>已跟随</span></span>')+'</p>');
			}
			html.push('<p class="rtbar-recommend-reason">'+data.recommendDesc+'</p>');
		}
		html.push('</div>');
		
		return html.join('');
	},
	addMode: function(){
		var liLen = this.$this.find('ul.rtbar-com li').length,
			$btn = this.$this.find('div.rtbar-s-follow-list'),
			text;
		if(liLen == 0) text = '您还未选择推荐的人，点击这里进行选择';
		else text = '点击这里继续选择推荐的人，最多可选择6人';
		if(liLen < 6){
			if($btn.length){ 
				$btn.show();
			}
			else { 
				this.$this.append([
				'<div class="rtbar-s-follow-list clearfix">',
					'<a href="http://i.sohu.com/friend/home/recommend.htm?_input_encode=gbk" class="add"></a>',
					'<div class="rtbar-s-follow-tips">',
						'<div class="arrow"></div>',
						'<p>'+text+'</p>',
					'</div>',
				'</div>'
				].join(''));
			}
		}
	}
};

$(function(){
	project.init();
});

})(jQuery);