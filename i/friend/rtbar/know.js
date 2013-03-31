/*
 *	空间 首页 你可能认识的人
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var ajaxurl = '/a/search/user/search/indexmay.do';


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
		if(!$.ppDialog) {
			location.href="http://i.sohu.com";
		}else{
			$.ppDialog({
				appId : '1019',
				regRedirectUrl : location.href,
				title : '想要查看更多精彩内容，马上登录吧！',
				onLogin : function(userId) {
					location.reload();
				}
			});
		}
		return false;
	}
	return true;
}

/*添加跟随*/
function follow(xpt,rtype,callback){
	if(!login()){
		return;
	}
	/*
	xpt是base64后的passport
	*/
	if(xpt){
		$.get('/a/app/friend/friend/add.do',{
			'xpt':xpt,
			'recommend_type': rtype,
			'from_type':'home_may_interest'
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

var nobody = '暂时木有感兴趣的人了，明天再来看看吧！';

var project = {
	inited: false,
	cache: [],//缓存
	card: null,//名片
	replaceList: [],//可能同时需要替换多个
	xhr: null,//ajax请求，同时只能有一个请求
	url: ajaxurl,//请求地址
	curpage : 0,//当前页号
	init: function(){
		var self = this;
		this.$this = $('#rtbarKnowBox');
		if(!this.$this.length){
			return;
		}
		this.getPage();
		this.$this
		//换一换
		.delegate('.change','click',function(event){
			self.getPage();
		})
		//添加跟随
		.delegate('.app-friends-add','click',function(event){
			var $target = $(this);
			var $li = $target.closest('li[data-friends-xpt]');
			if($li.length){
				follow($li.attr('data-friends-xpt'),$li.attr('data-recommend-type'),
				function(data){
					$li.find('p.btn-follow-ta').html('<span class="btn-gray-h20 ui-btn-later"><span>已跟随</span></span>');
					self.replaceList.push($li);
					self.loadCache();
					//弹出设置分组对话框
					if($.iCard && $.iCard.SetGroupsDialog){
						
						$.iCard.SetGroupsDialog.show({
							'friendid': data.friendId,
							'nick': $li.find('div.info-know p.name > a').eq(0).attr('title'),
							'friendType': data.friendType,
							'xpt': $li.attr('data-friends-xpt')
						});
					}
				},
				event);
			};
		})
		//不敢兴趣
		.delegate('span.disinclination > a','click',function(event){
			var $target = $(this);
			var $li = $target.closest('li[data-friends-xpt]');
			if($li.length){
				$.getJSON('/a/search/user/ignore/recommend.do',{
					'xpt':$li.attr('data-friends-xpt'),
					'ignore_type':$li.attr('data-recommend-type')
				},function(results){
					if(results.code == 0){
						self.replaceList.push($li);
						self.loadCache();
					}
				});
			}
		})
		.delegate('li','mouseenter',function(event){
			$(this).find('span.disinclination').show();
		})
		.delegate('li','mouseleave',function(event){
			$(this).find('span.disinclination').hide();
		})
		.delegate('p.mutual-friend > a','click',function(event){
			var $target = $(this);
			self.toogleMutualfriend($target);
		});
		
		if($.iCard){
			this.card = new $.iCard({
				bindElement: '#rtbarKnowBox',
				side: 'left',
				onFollow: function(param){
					var $li = self.$this.find('[data-friends-xpt="'+param.xpt+'"]');
					if($li.length){
						$li.find('p.btn-follow-ta').html('<span class="btn-gray-h20 ui-btn-later"><span>已跟随</span></span>');
						self.replaceList.push($li);
						self.loadCache();
						self.card.hide(1);
					}
				}
			});
		}
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
		var self = this,html = [],i,len,viewTotalUrl = data.isAllHot ? '/searchuser/home/may.htm?type=4&from_type=friend_hot_recommend' : '/searchuser/home/may.htm?from_type=view_all_type';
		html.push('<h3><a href="javascript:void(0);" class="change">换一换</a>你可能感兴趣的人</h3>');
		html.push('<ul class="rtbar-com">');
		for(i=0,len=data.list.length;i<len;i+=1){
			html.push('<li data-friends-xpt="'+data.list[i].xpt+'" data-recommend-type="'+data.list[i].recommendType+'">');
			html.push(this.getLiHTML(data.list[i]));
			html.push('</li>');
		}
		if(len == 0){
			html.push('<span class="visitors-txt">'+nobody+'</span>');
		}
		html.push('<li><p class="stat-all"><a href="' + viewTotalUrl + '"><em>查看全部 &gt;&gt;</em></a><p></li>');
		html.push('</ul>');
		if(this.inited){
			this.$this.find('ul').fadeOut('fast',function(){
				self.$this.html(html.join(''));
				self.toogleMutualfriend(self.$this.find('p.mutual-friend > a').eq(0));
			});
		}else{
			if(len == 0){
				this.hideThis();
				return;
			}
			this.$this.html(html.join(''));
			this.toogleMutualfriend(this.$this.find('p.mutual-friend > a').eq(0));
		}
		this.cache = [];
		this.replaceList = [];
		this.url = ajaxurl + '?page=' + data.curpage;
		this.curpage = data.curpage;
	},
	getLiHTML: function(data){
		var html = [];
		html.push('<div class="pic-know"><a target="_blank" href="'+data.blog+'" title="'+data.nick+'"><img data-card-action="xpt='+data.xpt+'&type=normal&pageid=15" data-card-type="isohu" data-card="true" width="34" height="34" src="'+data.photo+'"></a></div>');
		html.push('<div class="info-know">');
		html.push('<p class="name"><a target="_blank" href="'+data.blog+'" title="'+data.nick+'"><em data-card-action="xpt='+data.xpt+'&type=normal&pageid=15" data-card-type="isohu" data-card="true">'+cutCjkString(data.nick,16,'...',2)+'</em></a>'+( data.isAuthStatus ? '<i class="authentication-min" title="我的搜狐认证"></i>' : '' )+'</p>');
		html.push('<p class="btn-follow-ta"><span class="disinclination" style="display:none"><a href="javascript:void(0)">不感兴趣</a></span><span class="ui-btn btn-green-h20 app-friends-add"><span><i class="ui-btn-icon"></i>跟随</span></span></p>');
		
		var type = parseInt(data.recommendType,10), reason = '',listTemplate = '';
		
		switch(type){
			//共同互相跟随
			case 0:
				reason = '共同互相跟随的人';
				listTemplate = '与我互相跟随的人中：{{linkList}}等{{totalCount}}人与TA互相跟随';
				break;
			//间接跟随
			case 1:
				reason = '间接跟随人';
				listTemplate = '我跟随的人中：{{linkList}}等{{totalCount}}人也跟随了TA';
				break;
			case 2:
				reason = '可能是你的同学';
				break;
			case 3:
				reason = '可能是你的同事';
				break;
			case 4:
				reason = '相同标签';
				break;
			case 5:
				reason = '可能在你附近';
				break;
			case 6:
				reason = data.reason;
				break;
			default:
				reason = data.reason;
		}
		if(type == 0 || type == 1){
			var totalCount = parseInt(data.totalCount,10);
			html.push('<p class="mutual-friend"><a href="javascript:void(0);"><span>'+(totalCount >= 100 ? '99+' : totalCount)+'个'+reason+'</span><i class="down"></i></a></p>');
			html.push('</div>');
			//共同好友
			html.push('<div class="info-know-box" style="display:none"><p class="info-know-trigon"><i class="up-trigon"></i></p><div>');
			var aHtml = [],len = data.recommendElements.length;
			
			len = len > 2 ? 2 : len;

			for(var i=0;i<len;i+=1){
				aHtml.push('<a href="'+data.recommendElements[i].homeUrl+'" target="_blank" data-card-action="nick='+data.recommendElements[i].nick+'&type=normal&pageid=15" data-card-type="isohu" data-card="true">'+data.recommendElements[i].nick+'</a>');
			}
			
			html.push(listTemplate.replace('{{linkList}}',aHtml.join('、')).replace('{{totalCount}}',totalCount));
			html.push('</div></div>');
		}else{
			html.push('<p><span title="'+reason+'">'+reason+'</span></p>');
			html.push('</div>');
		}
		
		
		return html.join('');
	},
	getParam: function(url){
		var param = url.split('?')[1];
		var ary = param.split('&');
		var obj = {},index,key,value;
		for(var i=0;i<ary.length;i+=1){
			index = ary[i].indexOf('=');
			key = ary[i].substring(0,index);
			value = ary[i].substring(index+1);
			obj[key] = value;
		}
		return obj;
	},
	loadCache: function(delay){
		var self = this;
		delay = delay || 1000;
		if(this.xhr){
			this.xhr.abort();
			this.xhr = null;
		}
		if(this.cache.length == 0){
			var xpts = [];
			this.$this.find('li[data-friends-xpt]').each(function(){
				xpts.push($(this).attr('data-friends-xpt'));
			});
			this.xhr = $.post(ajaxurl,{
				page: this.curpage,
				xpts: xpts.join(';')
			},function(results){
				if(results.code == 0 && self.xhr){
					self.url = ajaxurl + '?page=' + results.data.curpage;
					self.curpage = results.data.curpage;
					self.cache = results.data.list;
					self.replaceUser(delay);
				}else{
					self.replaceUser(delay);
				}
				self.xhr = null;
			},'json');
		}else{
			self.replaceUser(delay);
		}
	},
	replaceUser: function(delay){
		var $user,data,$li,html;
		while(this.replaceList.length > 0){
			$user = this.replaceList.shift();
			//如果有缓存数据
			if(this.cache.length > 0){
				data = this.cache.shift();
				$li = $('<li data-friends-xpt="'+data.xpt+'" data-recommend-type="'+data.recommendType+'"></li>');
				html = this.getLiHTML(data);
				$li.html(html).hide();
				setTimeout((function($_user,$_li){
					return function(){
						$_user.replaceWith($_li);
						$_li.fadeIn('slow');
					}
				})($user,$li),delay);
			}
			//没有缓存数据，单纯删除节点
			else{
				$user.remove();
				this.nobodyHint();
			}
			//end
		}
	},
	nobodyHint: function(){
		//'<span class="visitors-txt">'+nobody+'</span>'
		if(this.$this.find('li[data-friends-xpt]').length == 0){
			this.getPage();
		}
	},
	toogleMutualfriend: function($a){
		if(!$a.length) return;
		var $info = $a.closest('li',this.$this).find('div.info-know-box'),
			$i = $a.find('i');
		if($i.hasClass('up')){
			$info.hide();
			$i.attr('class','down');
		}else if($i.hasClass('down')){
			/*
			var $infos = this.$this.find('div.info-know-box'),
				$is = this.$this.find('p.mutual-friend > a > i');
			$infos.hide();
			$is.attr('class','down');
			*/
			$info.show();
			$i.attr('class','up');
		}
	},
	hideThis: function(){
		this.$this.hide().prev('div.split-lines').hide();
	}
};

$(function(){
	project.init();
});

})(jQuery);
