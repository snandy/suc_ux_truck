/*
 *	视频
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){

if(ms.VideoApp){
	return;
}

var doc = document,
	win = window;

var replaceCJK = /[^\x00-\xff]/g,
	testCJK    = /[^\x00-\xff]/;

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

//修正ie下，页面包含flash会让锚点追加到页面title的问题
var pageTitle = doc.title.split('#')[0];
if($.browser.msie){
	doc.attachEvent('onpropertychange', function (evt) {
		evt = evt || win.event;
		if(evt.propertyName === 'title' && doc.title !== pageTitle) {
			setTimeout(function () {
			   doc.title = pageTitle;
			}, 1);
		}
	});
}


ms.VideoApp = {
	category: [
		{id: 1, title: '资讯', hotTag: ['拍客' ,'国内' ,'国际' ,'社会' ,'独家']},
		{id: 2, title: '搞笑', hotTag: ['美女搞笑' ,'童趣无敌' ,'动物趣闻' ,'2011最搞笑合集' ,'相声小品']},
        {id: 3, title: '综艺', hotTag: ['快乐大本营' ,'非诚勿扰' ,'韩国综艺' ,'日本综艺' ,'达人秀']},
        {id: 4, title: '电影', hotTag: ['美国大片' ,'小电影' ,'爱情动作片' ,'热映大片' ,'喜剧']},
        {id: 5, title: '音乐', hotTag: ['演唱会' ,'新歌速递' ,'影视主题曲' ,'老歌' ,'MV']},
        {id: 6, title: '游戏', hotTag: ['单机' ,'原创游戏' ,'网游' ,'电竞' ,'游戏美女']},
        {id: 7, title: '动漫', hotTag: ['最新动漫' ,'最热动漫' ,'2011好看的动漫' ,'经典动漫' ,'日本动漫']},
        {id: 8, title: '原创', hotTag: ['网络红人' ,'原创恶搞' ,'翻唱' ,'自拍' ,'模仿']},
        {id: 9, title: '广告', hotTag: ['禁播广告' ,'创意广告' ,'搞笑广告' ,'最感人的广告' ,'国外广告']},
        {id: 10, title: '体育', hotTag: ['WWE' ,'篮球' ,'天下足球' ,'英超' ,'NBA']},
        {id: 11, title: '科教', hotTag: ['口语' ,'百家讲坛' ,'乔布斯' ,'新概念英语' ,'公开课']},
        {id: 12, title: '汽车', hotTag: ['车模' ,'车展现场' ,'跑车' ,'评测' ,'豪华车']},
        //{id: 13, title: '生活', hotTag: ['广场舞' ,'宠物' ,'环保' ,'生活妙招' ,'家居']},
        //{id: 14, title: '母婴', hotTag: ['怀孕手册' ,'早期胎教' ,'儿童疾病' ,'妈咪健康' ,'幼儿饮食']},
        {id: 13, title: '宠物', hotTag: ['宠物']},
        {id: 14, title: '军事', hotTag: ['军事']},
        {id: 15, title: '旅游', hotTag: ['各地美食' ,'户外探险' ,'购物' ,'各地风光' ,'旅游攻略']},
        {id: 16, title: '其他', hotTag: ['恶搞' ,'自拍' ,'偷拍' ,'八卦' ,'热门']},
        {id: 19, title: '八卦', hotTag: ['娱乐新闻' ,'明星访谈' ,'颁奖典礼' ,'爆料' ,'偷拍']},
        {id: 20, title: '美女', hotTag: ['自拍' ,'写真' ,'雷人' ,'爱情' ,'感动']},
        {id: 21, title: '时尚', hotTag: ['养生' ,'瑜伽' ,'两性情感' ,'美容' ,'瘦身修身']},
		{id: 17, title: '纪录片', hotTag : ['国家地理' ,'动物世界' ,'Discovery' ,'演讲' ,'探索发现']},
        {id: 22, title: '电视剧', hotTag: ['经典港剧TVB' ,'美剧' ,'韩剧' ,'热播电视剧' ,'2011最热电视剧']}
	],
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
		}
	},
	getParam: function(param){
		var ary = param.split('&');
		var obj = {},index,key,value;
		for(var i=0;i<ary.length;i+=1){
			if(ary[i] != ''){
				index = ary[i].indexOf('=');
				key = ary[i].substring(0,index);
				value = ary[i].substring(index+1);
				obj[key] = value;
			}
		}
		return obj;
	}
};


var isIE = $.browser.msie,
	swfUrl = 'http://js1.my.tv.sohu.com.cn/ppp/mv/swf_v_2010071314/miniuploader.swf';


var ajaxUrls = {
	del: '/a/boke/videinfo.jhtml'
};

ms.VideoApp.delVideo = function(vid,callback){
	if(!login()){
		return;
	}
	if(vid){

		$.confirm({
			title: false,
			content: '确定要删除这个视频吗？',
			onConfirm: function(){
				$.post(ajaxUrls.del,{
					'm':'delete',
					'id':vid
				},function(results){
					if(results.status == 1){
						if($.isFunction(callback)){
							callback(results.data);
						}
                        //用户删除视频后同步发视频任务
                        $.getJSON('http://i.sohu.com/a/video/deleteVideoSuccess.htm?videoId=' + vid);
					}else{
						$.alert(results.msg);
					}
				},'json');
			}
		});
		
	}
}


ms.VideoApp.fillCount = function(){
	var ids = [],vids = [],xpt = win.$space_config && win.$space_config._xpt;
	$('[data-itemid]').each(function(){
		ids[ids.length] = 'video_' + $(this).attr('data-itemid');//+'_0_'+xpt;
	});
	$('[data-video-id]').each(function(){
		vids[vids.length] = $(this).attr('data-video-id');
	});
	//评论转发数
	if(ids.length > 0){
		$.getJSON('http://cc.i.sohu.com/a/app/counts/get.htm?callback=?',{ids:ids.join(',')},function(data){
			$('[data-itemid]').each(function(){
				var $ele = $(this),obj = data[$ele.attr('data-itemid')];
				if(obj){ 
					if(obj.spreadcount > 0) $ele.find('[action="forward"]').html('转发('+obj.spreadcount+')');
					if(obj.commentcount > 0) $ele.find('[action="app::discuss::discuss"]').html('评论('+obj.commentcount+')');
					$ele.find('.reply > a').html(obj.commentcount);
				}
			});
		});
	}
	//播放数
	if(vids.length > 0){
		$.getJSON('/a/video/playcount.htm',{videoIds:vids.join(',')},function(data){
			if(data.code == 0){
				$.each(data.data,function(i,obj){
					$('[data-video-id="'+obj.videoId+'"]').find('.video-playcount').html(obj.playCount);
				});
			}
		});
	}
}

ms.VideoApp.getCateInfo = function(callback){
	var jsonp = 'http://api.my.tv.sohu.com/video/getCateInfo.do?vname=_cateListObj&t=' + (+new Date());
	if(win._cateListObj){
		callback(win._cateListObj.data.list);
		return;
	}
	$.ajax({
		type: 'GET',
		url: jsonp,
		dataType: 'script',
		scriptCharset: 'utf-8',
		success: function(){
			if(win._cateListObj) callback(win._cateListObj.data.list);
		}
	});
};


//新版的上传组件
var _e = function(){}, _ts = function(){};
/*
if(typeof console != 'undefined' ) _e = function( obj, str ){ console.log( '%c%d%o', 'font-style:italic;font-size:10px;' ,str ? str : 'log: ' , obj ); };
if(typeof console != 'undefined' && typeof console.timeStamp != 'undefined' ) _ts = function( str ){ typeof console.timeStamp === 'undefined' ? console.info(str) : console.timeStamp(str); };
*/

var DEF_TYPE = 124;//原创

var CategoriesPop = function($btn,catecode){
	var self = this;
	var type = catecode || DEF_TYPE;
	//var cateList = ms.VideoApp.category;
	
	var hash = {},$ul;

	
	
	function init(cateList){
		$ul = $('<ul class="video-upload-type" style="display:none"></ul>'),html = [];

		for(var i=0,len=cateList.length;i<len;i+=1){
			if(cateList[i].attr != 'normal' || cateList[i].upload == 1) continue;
			html.push('<li data-categories="'+cateList[i].id+'"><a href="javascript:void(0);">'+cateList[i].title+'</a></li>');
			hash[cateList[i].id] = cateList[i];
		}
		$ul.html(html.join('')).appendTo('body');
		$btn.bind('click.categoriespop',function(event){
			if($ul.is(':visible')) return;
			$ul.show().css({
				left: $btn.offset().left - ($ul.outerWidth() - $btn.innerWidth()) + 2,
				top:  $btn.offset().top + $btn.height()
			});
			setTimeout(function(){
				$(doc).bind('click',hidePop);
			},0);
		});
		$ul.find('li').bind('click',function(event){
			event.preventDefault();
			self.setType($(this).attr('data-categories'));
		});
		self.setType(type);
	}
	
	function hidePop(event){
		var $target = $(event.target);
		if($target[0] !== $btn[0] && !$.contains($btn[0],$target[0])){
			$(doc).unbind('click',hidePop);
			self.hide();
		}
	}
	
	this.isContain = function($o){
		return $o.closest('ul.video-upload-type').length;
	}
	this.hide = function(){
		$ul.hide();
	}
	this.getType = function(){
		return type;
	}
	this.setType = function(t){
		if(!hash[t]) t = DEF_TYPE;
		type = t;
		$btn.text(hash[type].title);
		$ul.find('li').removeClass('curr').filter('[data-categories="'+t+'"]').addClass('curr');
	}
	this.destroy = function(){
		$ul.remove();
		self = null;
	}
	ms.VideoApp.getCateInfo(init);
}

var FILE_SIZE_LIMIT = 500;//500M

var sohuHD = {
	//工具函数
	pingback: function(url){
        var tmp = new Image();
        var timespam = new Date().getTime();
        if(url.indexOf('?') >-1 ){
            tmp.src = [url,'&_=',timespam].join('');
        }
        else{
            tmp.src = [url,'?_=',timespam].join('');
        }
        tmp = timespam = null;
    },
	formatTime: function(sec,type){
        if(sec>0){
            var t=[];
            var m=Math.floor(sec/60),s=sec-m*60;
            if(type){
                t.push( m/10>=1 ? m+':' : '0'+m+':' );
                t.push( s/10>=1 ? s : '0'+s );
            }else{
                t.push( m/10>=1 ? m+'分' : '0'+m+'分' );
                t.push( s/10>=1 ? s+'秒' : '0'+s+'秒' );
            }
            return t.join('');
        }
        return "00分00秒";
    },
	strSub: function (str,n,d,dd){
		/* str:传入string
		 * n: length limit
		 * d: 是否加省略号, 默认不加
		 */
        var r =/[^\x00-\xff]/g;
        d = d || false;
        dd = dd || '...';
        if(n > 0 && str.replace(r, "mm").length > n){
            var m = Math.floor(n/2);
            for(var i=m; i<str.length; i++){
                if(str.substr(0, i).replace(r, "mm").length>=n){
                    return str.substr(0, i) + (d ? dd : "");
                }
            }
        }
        return str;
    },
	getFlashVersion: function(){
		var ver, major;
        if (doc.all) {
            var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (swf) {
                ver = swf.GetVariable("$version");
                major = parseInt(ver.split(" ")[1].split(",")[0]);
            }
        } else {
            if (navigator.plugins && navigator.plugins.length > 0) {
                var swf = navigator.plugins["Shockwave Flash"];
                if (swf) {
                    var ver = swf.description.split(" ");
                    for (var i = 0; i < ver.length; ++i) {
                        if ( isNaN( parseInt(ver[i]) ) ) {
                            continue;
                        }
                        major = parseInt(ver[i]);
                    }
                }
            }
        }
        return {
            'm': major
            ,'ver': ver
        };
	},
	isIE: $.browser.msie,
	getFlash: function(){
		return this.isIE ? $('#sohuHDUploader_ob')[0] : $('#sohuHDUploader_em')[0];
	},
	uploadInfo: {},
	init: function($container,opts){
		this.$container = $container;
		this.options = $.extend({},opts || {});
		this.buttonModeHtml = $container.html();
		this.flashVer = this.getFlashVersion().ver;
		
		if(typeof this.flashVer === 'undefined'){
			this.noFlashText = '您的浏览器未安装 Flash Player 组件，无法正常使用上传功能，请安装。';
		}
		else{
			this.flashVer = (typeof this.flashVer != 'string' ? this.flashVer.join('') : this.flashVer);
			if(this.getFlashVersion().m < 10){
				this.noFlashText = '您的 Flash Player 版本过低，无法使用上传组件。<br />请升级 Flash Player 享受更多功能。';
			}
		}
	},
	buttonMode: function(){
		var self = this;
		
		if(this.uploadInfo.status == 'uploading'){
			$.confirm({
				title: false,
				content: '您确认要取消本视频的上传吗？<br />提示：支持72小时内续传。',
				onConfirm: function() {
					self.pingback( ['http://msg.video.sohu.com/stat.gif?type=webup&id='
						,self.uploadInfo.vid,'&step=cancel&rs=1&version='
						,self.flashVer,'&userId=',PassportSC.cookieHandle()].join('') );

					self.getFlash().deleteUpload();
					self.$container.html(self.buttonModeHtml);
					self.removePageLeaveConfirm();
				}
			});
			return;
		}
		
		this.$container.html(this.buttonModeHtml);
	},
	flMouseOver: function(){},
	flMouseOut: function(){},
	uploadMode: function(){
		this.isSuccessed = false;//没有完成

		if(this.noFlashText){
			this.noFlash();
			return;
		}
		var self = this;
		var html = [
			'<div class="video-post-box">',
				'<div class="video-post-title-box">',
					'<a class="close" href="javascript:void(0);"></a>',
					'<div class="post-upload-form">',
						'<div class="input-file init-mode">请选择你要上传的视频</div>',
						'<div class="video-upload-title uploading-mode" style="display:none">正在上传：阿达阿达阿达</div>',
						'<div class="video-upload-progress-wrapper uploading-mode" style="display:none">',
							'<p style="width:0%" class="video-upload-progress"></p>',
							'<p class="text">0%</p>',
						'</div>',
						'<div class="input-file-btn"></div>',
						'<div class="tips">上传视频须小于'+FILE_SIZE_LIMIT+'M，格式支持：<span title="avi/mpeg/rmvb/wmv/asf/divx/flv/m4v/fli/flc/mp4/3gp/mkv/3g2">avi /mpeg /rmvb /wmv /flv /mp4...</span></div>',
					'</div>',
					'<div class="video-agreement">',
						'<label><input type="checkbox" checked="checked">',
						'<span>我已阅读并同意<a href="http://tv.sohu.com/upload/hdfeedback/index.jsp?46" target="_blank">《视频上传协议》</a></span></label>',
					'</div>',
				'</div>',
				'<div class="video-upload-btn-wrapper resume-mode" style="display:none"><span class="ui-btn btn-blue-h32"><span>继续上传</span></span></div>',
			'</div>'
		].join('');
		this.$container.html(html);
		this.initUpload();
		if(this.catePop){
			this.catePop.destroy();
			this.catePop = null;
		}
		this.$container.find('input:checkbox').click(function(){
			self.$container.find('div.input-file-btn').attr('class',this.checked ? 'input-file-btn' : 'input-file-btn disabled');
		});
	},
	noFlash: function(){
		var html = [
		'<div class="video-post-box">',
			'<div class="video-post-title-box">',
				'<a class="close" href="javascript:void(0);"></a>',
				'<div class="post-upload-form">',
					'<div class="upload-progress-bar">',
						'<div class="pupload-progress-bar-tip">',
							'<div class="flash-icon">',
								'<a href="http://www.adobe.com/go/getflashplayer" target="_blank"><img src="http://s3.suc.itc.cn/i/home/d/flash-ico.jpg"></a>',
							'</div>',
							'<div class="flash-txt">',
								'<a href="http://www.adobe.com/go/getflashplayer" target="_blank">'+this.noFlashText+'</a>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
		].join('');

		this.$container.html(html);
	},
	successMode: function(postUploadSuccessRequest){
		var html = [
			'<a class="close" href="javascript:void(0);"></a>',
			'<div class="video-upload-over">视频正在转码和审核中，稍等片刻就能观看了！</div>'
		].join('');

		this.$container.find('div.video-post-title-box').html(html).end().find('div.resume-mode').hide();

		if(postUploadSuccessRequest){
			$.getJSON('/a/video/uploadSuccess.htm',{'videoId': this.uploadInfo.vid});
		}
		this.removePageLeaveConfirm();
		if($.isFunction(this.options.onUploadComplete)){
			this.options.onUploadComplete(this.uploadInfo.vid,postUploadSuccessRequest);
		}
		this.isSuccessed = true;
	},
	insertInfoForm: function(obj){
		/*
		obj = {
			title: 标题,
			categoriesId: 分类,
			tag: 标签,
			introduction: 简介,
			plevel: 0 所有人可见  3仅自己可看
		}
		*/
		var self = this;
		var $box = $('<div class="video-upload-info"></div>'),
			html = [
			'<h3 class="title">请填写视频信息</h3>',
			'<div class="video-upload-info-form">',
				'<label><span class="red">*</span>标题<input type="text" class="video-title" value="'+unescape(obj.title)+'"></label>',
				'<label><span class="red">*</span>分类<div class="video-type-wrapper"></div></label>',
				'<div class="video-upload-info-tips-wrapper" style="display:none;">',
					'<div style="left:50px;" class="video-upload-info-tips">',
						'<div class="arrow"></div>',
					'</div>',
				'</div>',
			'</div>',
			'<div class="video-upload-btn-wrapper"><span class="ui-btn"><span>保存</span></span></div>'
			];
		$box.html(html.join('')).insertAfter(this.$container.find('div.video-post-title-box'));
		this.catePop = new CategoriesPop($box.find('div.video-type-wrapper'),obj.categoriesId);
		//this.catePop.setType(obj.categoriesId);
		
		$box.find('span.ui-btn').bind('click',function(){
			//保存
			var $title = $box.find('input.video-title'),
				title = $.trim($title.val()),
				nlen = ms.VideoApp.utils.cjkLength(title),
				categoriesId = self.catePop.getType(),
				$error = $box.find('div.video-upload-info-tips-wrapper'),
				$errorContent = $error.find('div.video-upload-info-tips');

			if(nlen == 0){
				$error.show();
				$errorContent.html('<div class="arrow"></div>标题不能为空');
				$title.focus();
				return;
			}
			else if(nlen > 60){
				$error.show();
				$errorContent.html('<div class="arrow"></div>标题超出字数限制，标题长度最大为30个字');
				$title.focus();
				return;
			}
			else{
				$error.hide();
			}
			
			var param = {
				'm': 'updateInfo',
				'id': self.uploadInfo.vid,
				'title': escape(title),
				'tag': obj.tag,
				'categoriesId': categoriesId,
				'catecode': categoriesId,
				'introduction': obj.introduction
			};
			
			$.post('/a/boke/videinfo.jhtml',param,function(data){
				// data 值为空
				if( data ){
					// status == 1是服务端保存成功
					if( data.status==1 ){
						// 成功提示
						$.inform({
							icon : 'icon-success',
							delay : 2000,
							easyClose : true,
							content : "保存成功",
							onClose: function(){
								if(self.isSuccessed && $.isFunction(self.options.onCompleteAndSaved)){
									self.options.onCompleteAndSaved(self.uploadInfo.vid);
								}
							}
						});
					}else{
						// 错误提示
						$.inform({
							icon : 'icon-error',
							delay : 2000,
							easyClose : true,
							content : '保存失败，请稍后再试'
						});
					}
				}else{
					// 因网络等问题导致的请求失败，错误提示
					$.inform({
						icon : 'icon-error',
						delay : 2000,
						easyClose : true,
						content : '保存失败，请稍后再试'
					});
				}
			},'json');

		});
	},
	initUpload: function(){
		 _ts('log: initUpload');
		this.uploadInfo = {};//将信息初始化
		this.uploadInfo.init = false;
        // skinNun 控制flash皮肤，mouseOver 和 mouseOut 传全局JS函数名，是实现浮动在 flash 下面的元素产生 hover 效果，详细看Demo
		var swf = 'http://tv.sohu.com/upload/20110516space/skin/swf/FileUpload.swf?skinNum=2&mouseOver=sohuHD.flMouseOver&mouseOut=sohuHD.flMouseOut&_=20120308';
		var flashHtml = [
		'<object width="106" height="32" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" name="sohuHDUploader_ob" id="sohuHDUploader_ob">',
		'<param value="always" name="allowScriptAccess" />',
		'<param value="',swf,'" name="movie" />',
		'<param value="high" name="quality" />',
		'<param value="false" name="allowFullScreen" />',
		'<param value="transparent" name="wmode" />',
		'<param value="" name="flashvars" />',
		'<embed width="106" height="32" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" wmode="transparent" allowfullscreen="false" allowscriptaccess="always" quality="high" flashvars="" src="',swf,'" name="sohuHDUploader_em" id="sohuHDUploader_em">',
		'</object>'].join('');
		this.$container.find('div.input-file-btn').html('<div class="flash-btn">'+flashHtml+'</div>');
	},
	removeFlash: function(){
		this.$container.find('div.input-file-btn').html('');
	},
	setUploadInfo: function(obj){
		var $progress = this.$container.find('div.video-upload-progress-wrapper p.video-upload-progress'),
			$progressText = this.$container.find('div.video-upload-progress-wrapper  p.text'),
			$tips = this.$container.find('div.tips');

		$progress.width(obj.percent + '%');
		$progressText.text(obj.percent + '%');

		$tips.html('速度：<span class="orange">'+obj.speed+'KB/S </span> 已上传：<span class="orange">'+obj.uploaded+this.uploadInfo.unit+'/'+obj.size+this.uploadInfo.unit+'  </span> 剩余时间：<span class="orange">'+obj.time+'</span>');
            
	},
	setUploadErrorText: function(text){
		var $tips = this.$container.find('div.tips');
		$tips.html('<span class="red">'+text+'</span>');
	},
	pushData: function(opts){
		var self = this;

		if( this.uploadInfo.init ) return false;

		//? 这里的分类改成什么
		var vInfo = {
			title: escape(this.strSub(opts.title.replace(/\.[^.]+$/,''), 60)),
			categoriesId: DEF_TYPE,
			tag: escape(this.strSub(opts.title, 20)),
			introduction: escape(opts.title),
			plevel: 0 //所有人可见
		};
		this.$container.find('div.video-agreement').hide();
		var params = [
			'm=add',
			'outType=3',
			'uploadFrom=32', //NOTE 第三方来源
			'title=' + vInfo.title,
			'categoriesId=' + vInfo.categoriesId,//新建时候默认是原创
			'catecode=' + vInfo.categoriesId,//新版分类
			'tag=' + vInfo.tag,
			'introduction=' + vInfo.introduction,
			'videosize=' + opts.size
		];

		var _upload = '_upload' + new Date().getTime();
		
		$.getScript('http://my.tv.sohu.com/v.jhtml?'+params.join('&')+'&var='+_upload, function(){
			var data = win[_upload];
			if(data && data.status==1){
				_ts( 'log: createInfo success' );
				self.uploadInfo.init = true;
				self.uploadInfo.vid = data.id;
				
				//获取到了数据,显示修改区域
				
				self.$container
					.find('.uploading-mode').show().end()
					.find('.init-mode').hide().end()
					.find('div.input-file-btn').attr('class','input-file-btn cancel').end()
					.find('div.video-upload-title').html('正在上传：'+opts.title).end()
					.find('div.tips').html('速度：<span class="orange">计算中KB/S </span> 已上传：<span class="orange">--M/--M  </span> 剩余时间：<span class="orange">计算中</span>');
				
				

				self.pingback( ['http://msg.video.sohu.com/stat.gif?type=webup&id='
					,self.uploadInfo.vid,'&step=createinfo&rs=1&version='
					,self.flashVer,'&userId=',PassportSC.cookieHandle(),'&meg=interface.uploadFun.is.'
					,( typeof self.getFlash().uploadFun == 'undefined' ? 'undefined' : 'ready' )].join('') );

				self.uploadInfo.startTime = new Date().getTime();

				//离开页面提示，利用系统原生的
				self.pageLeaveConfirm();

				// videostatus < 20 是未上传成功
				if( data.videostatus < 20 ){
					//isOld == true 断点续传
					if( data.isold ){
						var _tmp = '_tmp'+new Date().getTime();
						$.getScript( [data.vto,'?type=3&outType=3&id=',data.id,'&varname=',_tmp].join(''), function(){
							self.getFlash().uploadFun({
								vid: data.id,
								vto: data.vto,
								isold: data.isold, //true
								partNo: (win[_tmp]).partNo.split(',')
							});
						});
					}else{
						self.getFlash().uploadFun({
							vid: data.id,
							vto: data.vto,
							isold: data.isold
						});
					}
				}else{
					//NOTE:该视频已上传成功，给出提示或者假上传等
					//下面是个简单的假上传，可以考虑做的更精细
					var $progress = self.$container.find('div.video-upload-progress-wrapper p.video-upload-progress'),
						$progressText = self.$container.find('div.video-upload-progress-wrapper  p.text'),
						$tips = self.$container.find('div.tips');

					var unit = 1024 * 1024;
					if(self.uploadInfo.unit == 'K'){
						unit = 1024;
					}
					
					self.removeFlash();//假上传，所以将flash移除
					$progressText.text( '100%' );
					var filesize = Math.ceil( opts.size / unit );
					$tips.html('速度：<span class="orange">--KB/S </span> 已上传：<span class="orange">' + filesize + self.uploadInfo.unit + '/'+filesize+self.uploadInfo.unit+'  </span> 剩余时间：<span class="orange">00分00秒</span>');

					$progress.animate({
						'width': '100%' 
					}, 2000, 'linear', function(){
						self.successMode(false);
					});
				}
		
				if( data.isold ){
					// 如果该视频是断点续传，那么服务器端不会保存请求 vid 时提交的数据，返回上次的数据（包括title tag等）
					vInfo.title = escape(data.title);
					vInfo.categoriesId = String(data.categoriesId || data.catecode).substring(0,3);//新分类可能是6位数，前3位为实际分类id
					vInfo.tag = escape(data.tag);
					vInfo.introduction = escape(data.introduction);
					vInfo.plevel = data.plevel;
				}

				self.insertInfoForm(vInfo);

			}else{
				_ts( 'log: createInfo fail.' );

				self.pingback( ['http://msg.video.sohu.com/stat.gif?type=webup&id=undefined'
					,'&step=createinfo&rs=0&version=',self.flashVer,'&userId='
					,PassportSC.cookieHandle(),'&msg=response.status!=1'].join('') );

				self.uploadMode();//重新初始化

				$.alert('服务器忙，请稍后再试。');
			}
		}).error(function(){
			_ts( 'log: createInfo request error, try again' );

			self.pingback( ['http://msg.video.sohu.com/stat.gif?type=webup&id=undefined'
				,'&step=createinfo&rs=0&version=',self.flashVer,'&userId='
				,PassportSC.cookieHandle(),'&msg=post.err'].join('') );

			self.uploadMode();//重新初始化

			$.alert('网络异常，请稍后再试。');
		});
	},
	// 供 flash 上传插件使用的接口，函数名写死
    // Flash API
    // FlashDOM.deleteUpload : 取消上传，通知 flash 取消上传、释放内存、初始化操作
    // FlashDOM.resumeUpload : 点击取消时，flash 会暂定上传，等待用户确认操作，如果用户继续上传，调用次接口，恢复上传。
    //                          上传失败时，也需要调用此接口恢复上传
    // FlashDOM.uploadFun : 请求 vid 成功之后，调用此接口，开始上传
    // FlashDOM.xhr : 通过 flash 来实现跨域 POST
    //              FlashDom.xhr({
    //                  url ： 
    //                  ,data : {}
    //                  ,callback : //回调函数名
    //              });
	uploader: function(opts){
		var self = this;
		this.uploadInfo = opts = $.extend({
            cancel : false,
			stop : false,
			init : false,
			limit : FILE_SIZE_LIMIT * 1024 * 1024
        }, this.uploadInfo, opts);

		//取消上传
        if( this.uploadInfo.cancel ){
            this.uploadInfo.cancel = false;
			$.confirm({
				title: false,
				content: '您确认要取消本视频的上传吗？<br />提示：支持72小时内续传。',
				onConfirm: function() {
					self.pingback( ['http://msg.video.sohu.com/stat.gif?type=webup&id='
						,self.uploadInfo.vid,'&step=cancel&rs=1&version='
						,self.flashVer,'&userId=',PassportSC.cookieHandle()].join('') );

					self.getFlash().deleteUpload();
					self.uploadMode();//重新初始化
					self.removePageLeaveConfirm();
				},
				onCancel: function(){
					 self.getFlash().resumeUpload();
				}
			});
            return false;
        }
		 // Flash 调用 JS 的 4 种状态：init, uploading, success, resume
        if( opts.status == 'uploading' ){
            _ts('log: uploading');

            // 上传进度，速度，剩余时间
            var percent = Math.floor( opts.uploaded / opts.size * 100 );
            var speedTxt =  opts.size / ( new Date().getTime() - opts.startTime );
            var timeLeftTxt = Math.ceil( ( opts.size - opts.uploaded ) / speedTxt / 1000 ); 
			var unit = 1024 * 1024;
			if(this.uploadInfo.unit == 'K'){
				unit = 1024;
			}

            // 更新上传进度等信息
			this.setUploadInfo({
				'percent': percent,
				'uploaded': Math.floor( opts.uploaded / unit ),
				'size': Math.ceil( opts.size / unit ),
				'speed': Math.round( speedTxt ),
				'time': this.formatTime( timeLeftTxt )
			});
            

            // 如果是续传, remove err class
            if( this.uploadInfo.hasError ){
                this.$container
					.find('div.video-upload-progress-wrapper p.video-upload-progress2').attr('class','video-upload-progress').end()
					.find('div.resume-mode').hide();
                //隐藏错误提示
                this.uploadInfo.hasError = false;
            }

            // 这是统计用的代码
            if( this.uploadInfo.stop ){
                this.uploadInfo.stop = false;
                setTimeout(function(){
                    self.pingback( ['http://msg.video.sohu.com/stat.gif?type=webup&id='
                            ,self.uploadInfo.vid,'&step=stop&rs=0&version='
                            ,self.flashVer,'&userId=',PassportSC.cookieHandle()].join('') );
                }, 1000);
            }
			
        }else if( opts.status == 'resume' ){
            _ts('log: upload error.');
            this.uploadInfo.hasError = true;
			// 因网络等原因可能造成上传终止，可以把进度条变灰、添加适当文字提示等等
            this.$container
				.find('div.video-upload-progress-wrapper p.video-upload-progress').attr('class','video-upload-progress2').end()
				.find('div.resume-mode').show()
				.find('span.ui-btn').unbind('click').bind('click',function(){
					self.getFlash().resumeUpload();
				});
        }else if( opts.status == 'init' ){
            _ts('log: upload Start');
            //判断视频大小是否符合最大限制
            if( opts.size > this.uploadInfo.limit || opts.size <= 0){
                _ts('log: video size beyond.');
				this.initUpload();
				this.$container.find('div.tips').html();
                this.setUploadErrorText('仅支持'+FILE_SIZE_LIMIT+'M以下的视频，请重新选择你希望上传的视频文件');
            }else{
				if(opts.size >= 1024*1024){
					this.uploadInfo.unit = 'M';
				}else{
					this.uploadInfo.unit = 'K';
				}
                this.pushData(opts);
            }
        }else if( opts.status == 'success' ){
            _ts('upload success');
            this.successMode(true);
            
        }
	},
	pageLeaveConfirm: function(){
		var self = this;
		/*
		win.onbeforeunload = function (e) {
			e = e || window.event;
			self.uploadInfo.stop = true;

			self.pingback( ['http://msg.video.sohu.com/stat.gif?type=webup&id='
					,self.uploadInfo.vid,'&step=stop&rs=1&version='
					,self.flashVer,'&userId=',PassportSC.cookieHandle()].join('') );

			// For IE and Firefox prior to version 4
			if (e) {
				e.returnValue = '视频还未上传完毕，是否放弃上传？';
			}
			// For Safari
			return '视频还未上传完毕，是否放弃上传？';
		};
		*/
		$(doc).delegate('a','click.sohuhd',function(event){
			var $target = $(this),
				_url = $target.attr('href'),
				_target = $target.attr('target');

			if(self.uploadInfo.status == 'uploading' && _target != '_blank' && !/(?:^javascript)|(?:^#+$)/.test(_url)){
				event.preventDefault();
				$.confirm({
					title: false,
					content: '您确认要取消本视频的上传吗？<br />提示：支持72小时内续传。',
					onConfirm: function() {
						self.uploadInfo.stop = true;

						self.pingback( ['http://msg.video.sohu.com/stat.gif?type=webup&id='
								,self.uploadInfo.vid,'&step=stop&rs=1&version='
								,self.flashVer,'&userId=',PassportSC.cookieHandle()].join('') );

						win.location.href = _url;
					}
				});
			}
		});
	},
	removePageLeaveConfirm: function(){
		//win.onbeforeunload = function (e) {};
		$(doc).undelegate('a','click.sohuhd');
	}

};

ms.VideoApp.sohuHD = function($container,opts){
	sohuHD.init($container,opts);
	$container
	.delegate('a.upload-video-btn','click',function(event){
		sohuHD.uploadMode();
	})
	.delegate('a.close','click',function(event){
		event.preventDefault();
		sohuHD.buttonMode();
	});
	return sohuHD;
}


win.sohuHD = sohuHD;

})(jQuery,mysohu);