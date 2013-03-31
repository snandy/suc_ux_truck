/*
 *	friendsapp-core
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($){
var app = 'friendsapp';

if($[app]) {
	alert('$.' + app + ' has been defined');
	return false;
};

$[app] = {};

$[app].settings = {
	
};

//初始化
function getAppUrl(url){
	var aUrl = url.split('#');
	if(aUrl.length > 1){
		return aUrl[1];
	}
	return '';
};

var replaceCJK = /[\u2E80-\u9FFF\uF92C-\uFFE5]/g,
	testCJK    = /[\u2E80-\u9FFF\uF92C-\uFFE5]/;

$[app].utils = {
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
};

$[app].fromType = {
	blogPerson: 'blog_person_show',//博客个人展示页
	seach: 'friend_seach',//找人
	seachNobody: 'seach_nobody_may_interest',//找人无结果可能感兴趣的人
	guest: 'guest_recent',//最近访客
	homeFans: 'friend_home_fans_list',//后台粉丝列表
	homeMay: 'friend_home_may_konw'//后台可能认识的人
};

$[app].init = function(config,autoHash) {
	var $this = this;
	if($[app].utils.isUndefined(autoHash)){
		autoHash = true;
	}
	$.extend($[app].settings, config);
	
	//通过url hash确定当前页面
	var currentPage = $[app].settings.defaultPage;
	var currentUrl = '';
	var url = location.href.split('#');
	if(url.length > 1) {
		url = url[1];
		$.each($[app].settings.pages, function(page, rest) {
			var re = new RegExp('^' + rest, 'ig');
			if(re.test(url)) {
				currentPage = page;
				currentUrl = url;
				return false;
			}
		});
	};
	if(currentUrl){
		$[app].pageview.call($this, currentPage, {'url': currentUrl,'autoHash':autoHash});
	}else{
		$[app].pageview.call($this, currentPage,{'autoHash':autoHash});
	}
	
	return $this;
};

/*前台页初始化*/
function formatShowUrl(url){
	var regx = /^xpt=/ig;
	var params = url.split('?')[1];
	var re = [];
	if(params){
		var p = params.split('&');
		for(var i=0;i<p.length;i+=1){
			if(!regx.test(p[i])){
				re[re.length] = p[i];
			}
		}
	}
	re[re.length] = 'xpt='+ getXpt();
	return re.join('&');
}
function getXpt(){
	return window['_xpt'] || (window.$space_config ? $space_config._xpt : '');
}


$[app].initShow = function(config,autoHash) {
	var $this = this;
	if($[app].utils.isUndefined(autoHash)){
		autoHash = true;
	}
	$.extend($[app].settings, config);
	
	//通过url hash确定当前页面
	var currentPage = $[app].settings.defaultPage;
	var currentUrl = '';
	var url = location.href.split('#');
	if(url.length > 1) {
		url = url[1];
		$.each($[app].settings.pages, function(page, rest) {
			var re = new RegExp('^' + rest, 'ig');
			if(re.test(url)) {
				currentPage = page;
				currentUrl = url;
				return false;
			}
		});
	};
	if(currentUrl){
		$[app].pageview.call($this, currentPage, {'param': formatShowUrl(currentUrl) ,'autoHash':autoHash});
	}else{
		$[app].pageview.call($this, currentPage,{'param':{'xpt':getXpt()},'autoHash':autoHash});
	}
	
	return $this;
};

//页面显示
$[app].pageview = function(page, settings, options) {
	var $this = this;
	if(!arguments[1]) {
		var settings = {};
	}
	if(!arguments[2]) {
		var options = {};
	}
	
	var defaults = {
		url: $[app].settings.pages[page],
		param: "",
		method: "get",
		target: $this
	};
	
	var opts = $.extend(defaults, settings);
	opts.url = opts.url.replace('=^_^=','?').replace(/=%5E_%5E=/i,'?');
	$.appview(opts);
};


//用于closest方式的mouseover和mouseout事件
$[app].within = function(event, callback) {
	var $this = this;
	var parent = event.relatedTarget;
	var el = $this.get(0);
	try {
		while (parent && parent !== el) {
			parent = parent.parentNode;
		}
		if (parent !== el) {
			callback();
		}
	} catch(e) {}
};

var ajaxUrls = {
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
	removeRecommend: '/a/app/friend/recommend/delete.do'//移除推荐
};


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
$[app].follow = function(params,callback){
	if(!login()){
		return;
	}
	params = $.extend({
		'xpt':'',
		'from_type': ''
	},params);
	var xpt = params.xpt;
	/*
	xpt是base64后的passport
	*/
	if(xpt){
		$.get(ajaxUrls.follow,params,function(results){
			if(results.code == 1 || results.code == -2){
				if($.isFunction(callback)){
					//@friendType : 1 双向好友 0 单向好友
					callback(results.data);
				}
			}else{
				$.alert(results.msg);
			}
		},'json');
	}
};

var unFollowDialog = null;
var unFollowDialogSliding = false;

$[app].destroyUnFollowDialog = function(){
	if(unFollowDialog){
		unFollowDialog.destroy();
	}
}

/* 取消跟随确认框 */
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





/*取消跟随*/
$[app].unFollow = function(xpt,uname,callback,event){
	if(!login() || unFollowDialogSliding){
		return;
	}
	if(unFollowDialog){
		unFollowDialog.destroy();
	}
	/*
	xpt是base64后的passport
	*/
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
			$.post(ajaxUrls.unFollow,{
				'xpt':xpt
			},function(results){
				if(results.code == 1){
					if($.isFunction(callback)){
						//@friendType : 1 单向好友 2 没有关系
						callback(results.data);
					}
				}else{
					$.alert(results.msg);
				}
				
			},'json');

			
			return false;
		},
		onBeforeCancel: function(){
			this.hide('slide',{'direction':'down'},function(){
				$dialog.close();
			});
			return false;
			/*
			if (flag) {
				flag = false;
				this.hide('slide',{'direction':'down'},function(){
					$dialog.close();
				});
				return false;
			};*/
		}
	});
	var topPx = offset.top - $dialog.outerHeight();
	var leftPx = offset.left + ($target.outerWidth() - $dialog.outerWidth())/2;
	if(topPx < 0){
		topPx = 0;
	}
	if((leftPx + $dialog.outerWidth()) > $(window).width()){
		leftPx = $(window).width() - $dialog.outerWidth() - 10;
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
};


/*打招呼*/
$[app].pokeMe = function(xpt){
	if(!login()){
		return;
	}
	if(xpt){
		var url = "http://poke.blog.sohu.com/pop/poking.do?xpt="+xpt;
		window.open(url,"_blank","width=630,height=470");
	}
}


/*新建分组*/
$[app].createGroup = function(gname,callback){
	if(!login()){
		return;
	}
	gname = $.trim(gname);
	if(gname){
		$.post(ajaxUrls.createGroup,{
			'gname':gname
		},function(results){
			if(results.code == 1){
				if($.isFunction(callback)){
					//@gid 分组id 
					//@gname 分组名称
					callback(results.data);
				}
			}else{
				$.alert(results.msg);
			}
		},'json');
	}
};


/*删除分组*/
$[app].delGroup = function(gid,callback){
	if(!login()){
		return;
	}
	if(gid){
		$.post(ajaxUrls.delGroup,{
			'gid':gid
		},function(results){
			if(results.code == 1){
				if($.isFunction(callback)){
					callback(results.data);
				}
			}else{
				$.alert(results.msg);
			}
		},'json');
	}
};

/*修改分组*/
$[app].updateGroup = function(gid,gname,callback){
	if(!login()){
		return;
	}
	if(gid && gname){
		$.post(ajaxUrls.updateGroup,{
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
				$.alert(results.msg);
			}
		},'json');
	}
};

/*添加好友进分组*/
$[app].addMapping = function(xpt,groupid,callback){
	if(!login()){
		return;
	}
	if(xpt && groupid){
		$.post(ajaxUrls.addMapping,{
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
				$.alert(results.msg);
			}
		},'json');
	}
};


/*从分组删除好友*/
$[app].delMapping = function(friendid,groupid,callback){
	if(!login()){
		return;
	}
	if(friendid && groupid){
		$.post(ajaxUrls.delMapping,{
			'friendid':friendid,
			'groupid':groupid
		},function(results){
			if(results.code == 1){
				if($.isFunction(callback)){
					//@noGroupCount 未分组数
					callback(results.data);
				}
			}else{
				$.alert(results.msg);
			}
		},'json');
	}
};

/*设置备注*/
$[app].setDesc = function(friendid,desc,callback){
	if(!login()){
		return;
	}
	if(friendid){
		$.post(ajaxUrls.desc,{
			'friendid':friendid,
			'desc':desc
		},function(results){
			if(results.code == 1){
				if($.isFunction(callback)){
					//@desc
					callback(results.data);
				}
			}else{
				$.alert(results.msg);
			}
		},'json');
	}
};

/*增加推荐*/
$[app].addRecommend = function(xpt,callback){
	if(!login()){
		return;
	}
	if(xpt){
		$.getJSON(ajaxUrls.addRecommend,{
			'xpts':xpt,
			'isUpdate':false
		},function(results){
			if(results.code == 0){
				if($.isFunction(callback)){
					//@desc
					callback(results.data);
				}
			}else{
				$.alert(results.msg);
			}
		},'json');
	}
};

/*增加推荐*/
$[app].removeRecommend = function(xpt,callback){
	if(!login()){
		return;
	}
	if(xpt){
		$.getJSON(ajaxUrls.removeRecommend,{
			'xpt':xpt
		},function(results){
			if(results.code == 0){
				if($.isFunction(callback)){
					//@desc
					callback(results.data);
				}
			}else{
				$.alert(results.msg);
			}
		},'json');
	}
};

/*使用appview方式提交表单*/
$[app].pageviewSearch = {
	init: function($form,options){
		var defaults = {
			url: $form.attr('action'),
			method: 'post',
			target: '',
			onBeforeSubmit: null,
			serialize: null
		};
		var settings = $.extend(defaults,options);
		this.bind.call($form,settings);
		
	},
	bind: function(settings){
		var $form = this;
		this.submit(function(){
			if(!login()){
				return false;
			}
			if($.isFunction(settings.onBeforeSubmit) && settings.onBeforeSubmit.call($form) == false){
				return false;
			}
			
			var param;
			if($.isFunction(settings.serialize)){
				param = settings.serialize.call($form);
			}else{
				param = $form.serialize();
			}
			if(settings.url.indexOf('?') !== -1){
				settings.url += '&_input_encode=UTF-8';
			}else{
				settings.url += '?_input_encode=UTF-8';
			}
			$.appview({
				url: settings.url,
				method: settings.method,
				param: param,
				target: settings.target
			});
			return false;
		});
	}
};


/*一句话回填*/
$[app].sentence = function(xptsArray,callback){
	var xpts = xptsArray.join('|');
	if(xpts){
		$.post(ajaxUrls.sentence,{
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
}

/*每次页面初始化时先执行的代码*/
$[app].onPageLoaded = function(){
	this.destroyUnFollowDialog();
}


})(jQuery);