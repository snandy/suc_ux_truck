/*
 *	home proxy方式 好友后台的core
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){


/*每次页面初始化时先执行的代码
$[app].onPageLoaded = function(){
	this.destroyUnFollowDialog();
}
*/


if(ms.friend) return;

var win = window,doc = document;

var replaceCJK = /[\u2E80-\u9FFF\uF92C-\uFFE5]/g,
	testCJK    = /[\u2E80-\u9FFF\uF92C-\uFFE5]/;

function login(loginCallback){
	if(!$.cookie("ppinf")) {
		if(!$.ppDialog) {
			win.location.href="http://i.sohu.com";
		}else{
			$.ppDialog({
				appId: '1019',
				regRedirectUrl: location.href,
				title: '想要查看更多精彩内容，马上登录吧！',
				onLogin: function(userId) {
					if($.isFunction(loginCallback)) loginCallback(userId);
					else win.location.reload();
				}
			});
		}
		return false;
	}
	return true;
}

// 取消跟随确认框 
var confirm = function(settings) {
	var defaults = {
		icon: "",
		title: "",
		content: "",
		labConfirm: "确定",
		labCancel: "取消",
		onConfirm: null,
		onCancel: null,
		onBeforeCancel: null,
		onBeforeClose: null
	};

	// give settings to UI elements
	var opts = $.extend(defaults, settings);

	// for icon class define.
	var content = $.isPlainObject(settings) ? opts.content : settings;
	if (opts.icon) {
		content = '<div class="' + opts.icon + '"></div><div class="dialog-content">' + content + '</div>';
	}

	return $.dialog({
		className: "jquery-confirm",
		btns: ["accept", "cancel"],
		labAccept: opts.labConfirm,
		labCancel: opts.labCancel,
		title: opts.title,
		content: content,
		fixed: false,
		modal: false,
		scrollIntoView: false,
		onAccept: opts.onConfirm,
		onCancel: opts.onCancel,
		onBeforeCancel: opts.onBeforeCancel,
		onBeforeClose: opts.onBeforeClose
	});
};

var unFollowDialog = null;//取消跟随对话框
var unFollowDialogSliding = false;//取消跟随对话框是否在动画过程中

var core = {
	utils: {
		cjkLength: function(strValue){
			return strValue.replace(replaceCJK, "lv").length;
		},
		isCjk: function(strValue){
			return testCJK.test(strValue);
		},
		cutString: function(str,len,suffix,slen){
			suffix = suffix || '';
			slen = slen || suffix.length;
			if(str.length > len){
				str = str.substr(0,len - slen) + suffix;
			}
			return str;
		},
		cutCjkString: function(str,len,suffix,slen){
			suffix = suffix || '';
			slen = slen || suffix.length;
			len -= slen;
			if(this.cjkLength(str) <= len){
				return str;
			}
			var s = str.split(''),c = 0,tmpA = [];
			for(var i=0;i<s.length;i+=1){
				if(c < len){
					tmpA[tmpA.length] = s[i];
				}
				if(this.isCjk(s[i])){
					c += 2;
				}else{
					c += 1;
				}
			}
			return tmpA.join('') + suffix;
		},
		isUndefined: function(value){
			return typeof value == 'undefined';
		}
	},
	fromType: {
		blogPerson: 'blog_person_show',//博客个人展示页
		seach: 'friend_seach',//找人
		seachNobody: 'seach_nobody_may_interest',//找人无结果可能感兴趣的人
		guest: 'guest_recent',//最近访客
		homeFans: 'friend_home_fans_list',//后台粉丝列表
		homeMay: 'friend_home_may_konw'//后台可能认识的人
	},
	ajaxUrls: {
		follow: '/a/app/friend/friend/add.do',//添加跟随
		unFollow: '/a/app/friend/friend/delete.do',//取消跟随
		createGroup: '/a/app/friend/group/add.do?_input_encode=UTF-8',//新建分组
		delGroup: '/a/app/friend/group/delete.do',//删除分组
		updateGroup: '/a/app/friend/group/update.do?_input_encode=UTF-8',//修改分组
		addMapping: '/a/app/friend/friend/addmapping.do',//添加好友进分组
		delMapping: '/a/app/friend/friend/delmapping.do',//从分组删除好友
		desc: '/a/app/friend/friend/update.do?_input_encode=UTF-8',//修改和添加备注
		sentence: '/a/app/mblog/getSentence.htm',//微博
		addRecommend: '/a/app/friend/recommend/add.do',//增加推荐
		removeRecommend: '/a/app/friend/recommend/delete.do',//移除推荐
		ignore: '/a/search/user/ignore/recommend.do'//不感兴趣
	},
	errorInform: function(msg){
		$.inform({
			icon : 'icon-error',
			delay : 2000,
			easyClose : true,
			content : msg
		});
	},
	getURLParams: function(){
		var args = {},
			match = null,
			uA = win.location.search.split('?');

		if(uA[1]){
			var reg = /(?:([^&]+)=([^&]+))/g;
			while((match = reg.exec(uA[1])) !== null){
				args[match[1]] = match[2];
			}
		}
		return args;
	},
	//跟随
	follow: function(params,callback,loginCallback){
		if(!login(loginCallback)){
			return;
		}
		var self = this;
		params = $.extend({
			'xpt':'',
			'from_type': ''
		},params);
		var xpt = params.xpt;
		/*
		xpt是base64后的passport
		*/
		if(xpt){
			$.getJSON(this.ajaxUrls.follow,params,function(results){
				if(results.code == 1 || results.code == -2){
					if($.isFunction(callback)){
						//@friendType : 1 双向好友 0 单向好友
						callback(results.data);
					}
				}else{
					self.errorInform(results.msg);
				}
			});
		}
	},
	//取消跟随
	unFollow: function(params,callback,loginCallback){
		if(!login(loginCallback) || unFollowDialogSliding){
			return;
		}
		if(unFollowDialog){
			unFollowDialog.destroy();
		}
		var self = this,
			xpt = params.xpt,
			uname = params.name,
			event = params.event;

		var content = '<div class="follow-undo-window">'
					+'<h2>确定不再跟随'+uname+'？</h2>'
					+'<p>取消跟随，将不再接收TA的新鲜事。</p>'
					+'</div>';
		var $target = $(event.target);
		var offset = $target.offset();
		var flag = true;
		var $dialog = confirm({
			title: false,
			content: content ,
			onConfirm: function() {
				$.post(self.ajaxUrls.unFollow,{
					'xpt':xpt
				},function(results){
					if(results.code == 1){
						if($.isFunction(callback)){
							//@friendType : 1 单向好友 2 没有关系
							callback(results.data);
						}
					}else{
						self.errorInform(results.msg);
					}
					
				},'json');
				return false;
			},
			onBeforeCancel: function(){
				this.hide('slide',{'direction':'down'},function(){
					$dialog.close();
				});
				return false;
			}
		});
		var topPx = offset.top - $dialog.outerHeight();
		var leftPx = offset.left + ($target.outerWidth() - $dialog.outerWidth())/2;
		if(topPx < 0){
			topPx = 0;
		}
		var ww = $(win).width();
		if((leftPx + $dialog.outerWidth()) > ww){
			leftPx = ww - $dialog.outerWidth() - 10;
		}
		unFollowDialogSliding = true;
		$dialog.css({
			top: topPx,
			left: leftPx
		})
		.show('slide',{'direction':'down'},function(){
			unFollowDialogSliding = false;	
		});
		unFollowDialog = $dialog;
	},
	//打招呼
	pokeMe: function(xpt){
		if(!login()){
			return;
		}
		if(xpt){
			var url = "http://poke.blog.sohu.com/pop/poking.do?xpt="+xpt;
			win.open(url,"_blank","width=630,height=470");
		}
	},
	//创建分组
	createGroup: function(gname,callback){
		if(!login()){
			return;
		}
		var self = this;
		gname = $.trim(gname);
		if(gname){
			$.post(this.ajaxUrls.createGroup,{
				'gname':gname
			},function(results){
				if(results.code == 1){
					if($.isFunction(callback)){
						//@gid 分组id 
						//@gname 分组名称
						callback(results.data);
					}
				}else{
					self.errorInform(results.msg);
				}
			},'json');
		}
	},
	//删除分组
	delGroup: function(gid,callback){
		if(!login()){
			return;
		}
		var self = this;
		if(gid){
			$.post(this.ajaxUrls.delGroup,{
				'gid':gid
			},function(results){
				if(results.code == 1){
					if($.isFunction(callback)){
						callback(results.data);
					}
				}else{
					self.errorInform(results.msg);
				}
			},'json');
		}
	},
	//修改分组
	updateGroup: function(params,callback){
		if(!login()){
			return;
		}
		var self = this,
			gid = params.gid,
			gname = params.gname;

		if(gid && gname){
			$.post(this.ajaxUrls.updateGroup,{
				'gid':gid,
				'gname':gname
			},function(results){
				if(results.code == 1){
					if($.isFunction(callback)){
						//@gid 分组id 
						//@gname 分组名称
						callback(results.data);
					}
				}else{
					self.errorInform(results.msg);
				}
			},'json');
		}
	},
	//添加好友进分组
	addMapping: function(params,callback){
		if(!login()){
			return;
		}
		var self = this,
			xpt = params.xpt,
			groupid = params.groupid;

		if(xpt && groupid){
			$.post(this.ajaxUrls.addMapping,{
				'xpt':xpt,
				'groupid':groupid
			},function(results){
				if(results.code == 1){
					if($.isFunction(callback)){
						//@gid 分组id
						//@gname 分组名称
						//@noGroupCount 未分组数
						callback(results.data);
					}
				}else{
					self.errorInform(results.msg);
				}
			},'json');
		}
	},
	//从分组移除好友
	delMapping: function(params,callback){
		if(!login()){
			return;
		}
		var self = this,
			friendid = params.friendid,
			groupid = params.groupid;

		if(friendid && groupid){
			$.post(this.ajaxUrls.delMapping,{
				'friendid':friendid,
				'groupid':groupid
			},function(results){
				if(results.code == 1){
					if($.isFunction(callback)){
						//@noGroupCount 未分组数
						callback(results.data);
					}
				}else{
					self.errorInform(results.msg);
				}
			},'json');
		}
	},
	//设置备注
	setDesc: function(params,callback){
		if(!login()){
			return;
		}
		var self = this,
			friendid = params.friendid,
			desc = params.desc;

		if(friendid){
			$.post(this.ajaxUrls.desc,{
				'friendid':friendid,
				'desc':desc
			},function(results){
				if(results.code == 1){
					if($.isFunction(callback)){
						//@desc
						callback(results.data);
					}
				}else{
					self.errorInform(results.msg);
				}
			},'json');
		}
	},
	//增加推荐
	addRecommend: function(xpt,callback){
		if(!login()){
			return;
		}
		var self = this;
		if(xpt){
			$.getJSON(this.ajaxUrls.addRecommend,{
				'xpts':xpt,
				'isUpdate':false
			},function(results){
				if(results.code == 0){
					if($.isFunction(callback)){
						//@desc
						callback(results.data);
					}
				}else{
					self.errorInform(results.msg);
				}
			});
		}
	},
	//取消推荐
	removeRecommend: function(xpt,callback){
		if(!login()){
			return;
		}
		var self = this;
		if(xpt){
			$.getJSON(this.ajaxUrls.removeRecommend,{
				'xpt':xpt
			},function(results){
				if(results.code == 0){
					if($.isFunction(callback)){
						//@desc
						callback(results.data);
					}
				}else{
					self.errorInform(results.msg);
				}
			});
		}
	},
	//最新一条feed
	sentence: function(xptsArray,callback){
		var xpts = xptsArray.join('|');
		if(xpts){
			$.post(this.ajaxUrls.sentence,{
				'xpts':xpts
			},function(results){
				if(results.status == 0){
					if($.isFunction(callback)){
						//@desc
						callback(results.data);
					}
				}
			},'json');
		}
	},
	//不感兴趣
	ignore: function(params,callback){
		if(!login()){
			return;
		}
		var self = this;

		if(params.xpt){
			$.getJSON(this.ajaxUrls.ignore,params,function(results){
				if(results.code == 0){
					if($.isFunction(callback)){
						//@desc
						callback(results.data);
					}
				}else{
					self.errorInform(results.msg);
				}
			});
		}
	}
};

ms.friend = core;

})(jQuery,mysohu);