/*
 *	中国好声音-报名表单
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){
var win = window,
	doc = document,
	ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

//分页
var Pager = function(settings){
	var defaults = {
		container: null,
		current: 1,
		max:1,
		maxShow: 9,//最大显示的页数 1...3456789...20
		appendTo: '',
		autoUpdate: true,//点击页号时是否自动更新页码状态
		onClick: function(pagenum){}//可以在回调内更新页码
	};
	this.options = $.extend(defaults,settings);
	this.init();
};
Pager.prototype = {
	init: function(){
		var that = this;
		this.container = this.options.container ? this.options.container : $('<div class="list-pagination"></div>').appendTo($(this.options.appendTo));
		this.container.click(function(event){
			var $target = $(event.target);
			
			//点击了页码
			if($target.closest('[data-pagenum]').length){
				$target = $target.closest('[data-pagenum]');
				if($target.length){
					if(that.options.autoUpdate){
						that.update($target.attr('data-pagenum'));
					}
					if($.isFunction(that.options.onClick)){
						that.options.onClick($target.attr('data-pagenum'));
					}
				}
			}
		});
		this.update(this.options.current);
	},
	update: function(pagenum,max){
		max = parseInt(max,10) || this.options.max;
		max = max < 1 ? 1 : max;
		pagenum = parseInt(pagenum,10) || 1;
		pagenum = pagenum < 1 ? 1 : pagenum;
		pagenum = pagenum > max ? max : pagenum;
		this.options.current = pagenum;
		this.options.max = max;
		if(max == 1){
			this.container.html('');
			return;
		}

		var len = this.options.maxShow - 2;//减掉第一页和最后一页，中间显示的页码数
		var differ = Math.floor(len/2);//需要把当前页显示在中间，所以求左右增减的数量
		var start = (pagenum - differ) > 2 ? pagenum - differ : 2;//起始页码要大于等于2
		var end = (start + len) < max ? start + len : max;//结束页码为起始页码+len，不能大于max
		//如果结束页码和起始页码数量不够len，则需要从结束往开始补充
		if((end - start) < len){
			start = end - len;
			if(start < 2){
				start = 2;
			}
		}
		var i;
		var html = '';
		if(pagenum == 1){
			html += '<span class="page-cur">1</span>';
		}else{
			html += '<a href="javascript:void(0)" class="page-prev" data-pagenum="'+(pagenum-1)+'"><span>上一页</span></a>';
			html += '<a href="javascript:void(0)" data-pagenum="1">1</a>';
		}
		if(start > 2 && max > this.options.maxShow){
			html += '<span class="page-break">...</span>';
		}
		for(i = start;i< end;i+=1){
			if(i == pagenum){
				html += '<span class="page-cur">'+i+'</span>';
			}else{
				html += '<a href="javascript:void(0)" data-pagenum="'+i+'">'+i+'</a>';
			}
		}
		if(end < max){
			html += '<span class="page-break">...</span>';
		}
		if(pagenum == max && max != 1){
			html += '<span class="page-cur">'+max+'</span>';
		}else if(max != 1){
			html += '<a href="javascript:void(0)" data-pagenum="'+max+'">'+max+'</a>';
			html += '<a href="javascript:void(0)" class="page-next" data-pagenum="'+(pagenum+1)+'"><span>下一页</span></a>';
		}
		
		this.container.html(html);
	},
	show: function(){
		this.container.show();
	},
	hide: function(){
		this.container.hide();
	}
};


function showSubmitButtonInView(){
	var top = $('.action-submit').offset().top - $(win).height() + $('.action-submit').outerHeight() + 10;
	$('body,html').animate({scrollTop: top},'quick');
}

var vidioInfo = {
	get: function(vid,type){
		if(vid == 0 || vid == '') return;
		var self = this;
		$.ajax({
			type: 'GET',
			url: 'http://api.my.tv.sohu.com/video/videoviewinfo2.do?callback=?',
			dataType: 'jsonp',
			scriptCharset: 'utf-8',
			data: {vid:vid},
			success: function(results){
				self.draw(vid,results,type);
			}
		});
	},
	draw: function(vid,results,type){
		var previewHTML,name,cover,
			typeCn = type == 'noVoiceId' ? '清唱视频' : '伴唱视频';
		if(results.status == 1){
			previewHTML = '<object width="320" height="240"><param name="movie" value="http://share.vrs.sohu.com/my/v.swf&autoplay=false&id='+vid+'&skinNum=1&topBar=1&xuid="></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><param name="wmode" value="Opaque"></param><embed width="320" height="240"  allowfullscreen="true" allowscriptaccess="always" quality="high" wmode="Opaque" src="http://share.vrs.sohu.com/my/v.swf&autoplay=false&id='+vid+'&skinNum=1&topBar=1&xuid=" type="application/x-shockwave-flash"/></embed></object>';
		}else{
			switch(results.code){
				case 22:
					//转码失败
				case 37:
					//审核删除
					name = '审核未通过，请重新上传';
					cover = 'http://s3.suc.itc.cn/i/chinavoice/d/image_examine_error.jpg';
					break;
				default:
					name = '审核中';
					cover = 'http://s3.suc.itc.cn/i/chinavoice/d/image_examine.jpg';
			}
			
			//'<div class="popup txt">'+ms.voiceofchina.utils.cutCjkString(name,30,'...')+'('+typeCn+')</div><img src="'+cover+'" alt="'+name+'" title="'+name+'" />'
			previewHTML = '<img src="'+cover+'" alt="'+name+'" title="'+name+'" />';
		}

		var $o = $('li[data-video-type="'+type+'"]');

		$o.find('div.cv-video-inner').html(previewHTML);
		$o.attr('data-video-id',vid);

		var $btns = $o.find('> div.btns > span');
		if($btns.length){
			if(!$btns.data('cacheHTML')) $btns.data('cacheHTML',$btns.html());
			$btns.html('<input type="button" value="更换视频" class="btn btn-primary btn-small action-modify">');
		}
	}

}



var videoSelector = {
	init: function(){
		var self = this;
		this.$box = $('<div class="popup cv-upload hide"></div>');
		var html = [
			'<div class="video-post-box">',
				'<div class="video-post-title-box">',
					'<a class="close" href="javascript:void(0);"></a>',
					'<div class="cv-video-choice clearfix"></div>',
					'<div class="pagination t-center"></div>',
					'<div class="t-center btn-boxs">',
						'<input type="button" class="ui-btn-w80 btn-w-gray action-close" value="关闭">',
					'</div>',
				'</div>',
			'</div>'
		].join('');

		this.$mask = $('<div class="modal-backdrop"></div>').appendTo('body').hide();
		this.$box.html(html).appendTo('body');

		this.pager  = new Pager({
			container: this.$box.find('div.pagination'),
			maxShow: 7,
			onClick: $.proxy(this.loadData,this)
		});

		this.$box
		.delegate('a[data-vid]','click',function(event){
			event.preventDefault();
			vidioInfo.get($(this).attr('data-vid'),self.type);
			showSubmitButtonInView();
			self.hide();
		})
		.delegate('.close,.action-close','click',function(){
			self.hide();
		})
		.delegate('.action-upload-now','click',function(){
			self.hide();
			uploadDialog.upload(self.type);
		});
	},
	hide: function(){
		this.$box.hide();
		this.$mask.hide();
	},
	noVideo: function(){
		this.$box.find('div.cv-video-choice').html('<div class="alert t-center">您还没有上传过任何视频内容，<a href="javascript:void(0)" class="action-upload-now">立即上传</a></div>');
	},
	loadData: function(page){
		var self = this,userid = $('div.app-body').attr('data-userid');

		if(userid == '' || userid == 0){
			this.noVideo();

			return;
		}

		$.ajax({
			type: 'GET',
			url: 'http://api.my.tv.sohu.com/video/list.do?callback=?',
			dataType: 'jsonp',
			scriptCharset: 'utf-8',
			data: {
				pageno: page,
				pagesize: 8,
				vtype: 5,
				userid: userid
			},
			success: function(results){
				self.build(results.data);
			}
		});
	},
	build: function(data){
		if(!data || data.list.length == 0){
			this.noVideo();
			return;
		}
		var html = [];
		for(var i = 0 ;i < data.list.length ;i += 1){
			html.push('<li><div class="video"><a href="#" data-vid="'+data.list[i].id+'"><i class="iMask"><b></b></i><img src="'+data.list[i].smallCover+'"></a></div><p class="txt">'+data.list[i].title+'</p></li>')
		}

		this.$box.find('div.cv-video-choice').html('<ul class="cv-video-list">'+html.join('')+'</ul>');

		this.pager.update(data.number,Math.ceil(data.count/data.size));

	},
	select: function(type){
		this.type = type;
		this.$box.show();
		this.$mask.show();
		this.loadData();

		$('body,html').animate({scrollTop: 0},'quick');
	}

};


/**********************************************视频上传*************************************/

//获取视频分类
function getCateInfo(callback){
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
}

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
	getCateInfo(init);
};

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
	close: function(callback){
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
					self.uploadMode();//重新初始化
					self.removePageLeaveConfirm();
					if($.isFunction(callback)) callback();
				}
			});
			return;
		}
		
		if($.isFunction(callback)) callback();
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
						'<div class="tips">上传视频须小于'+FILE_SIZE_LIMIT+'M，格式支持：<span title="avi/mpeg/rmvb/wmv/asf/divx/flv/m4v/fli/flc/mp4/3gp/mkv/3g2/mp3/wma">avi /mpeg /rmvb /wmv /flv /mp4 /mp3 /wma...</span></div>',
					'</div>',
					'<div class="video-agreement">',
						'<label><input type="checkbox" checked="checked"></label>',
						'<span>我已阅读并同意<a href="http://tv.sohu.com/upload/hdfeedback/index.jsp?46" target="_blank">《视频上传协议》</a></span>',
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
				nlen = ms.voiceofchina.utils.cjkLength(title),
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
				'introduction': obj.introduction,
				'actLabel': 60
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
        //http://tv.sohu.com/upload/20110516space/skin/swf/FileUpload.swf
		var swf = 'http://tv.sohu.com/upload/static/space/skin/swf/FileUpload.swf?skinNum=2&mouseOver=sohuHD.flMouseOver&mouseOut=sohuHD.flMouseOut&_=20130228';
		
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
			'uploadFrom=9000', //NOTE 第三方来源
			'title=' + vInfo.title,
			'categoriesId=' + vInfo.categoriesId,//新建时候默认是原创
			'catecode=' + vInfo.categoriesId,//新版分类
			'tag=' + vInfo.tag,
			'introduction=' + vInfo.introduction,
			'videosize=' + opts.size,
			'actLabel=60'//中国好声音来源
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

win.sohuHD = sohuHD;

var uploadDialog = {
	init: function(){
		var self = this;
		this.$mask = $('<div class="modal-backdrop"></div>').appendTo('body').hide();
		this.$box = $('<div class="popup cv-upload hide"></div>').appendTo('body');

		this.$box.delegate('a.close','click',function(event){
			event.preventDefault();
			sohuHD.close($.proxy(self.close,self));
		});

		sohuHD.init(this.$box,{
			onUploadComplete: function(vid){
				vidioInfo.get(vid,self.type);
				showSubmitButtonInView();
			},
			onCompleteAndSaved: function(vid){
				vidioInfo.get(vid,self.type);
				sohuHD.close($.proxy(self.close,self));
				showSubmitButtonInView();
			}
		});
	},
	close: function(){
		this.$box.hide();
		this.$mask.hide();
	},
	upload: function(type){
		this.type = type;
		this.$box.show().html('');
		sohuHD.uploadMode();
		this.$mask.show();
		$('body,html').animate({scrollTop: 0},'quick');
	}
};


$(function(){
	videoSelector.init();
	uploadDialog.init();

	$('div.app-body')
	.delegate('.action-upload','click',function(event){
		event.preventDefault();
		var type = $(this).closest('[data-video-type]').attr('data-video-type');
		uploadDialog.upload(type);
	})
	.delegate('.action-select','click',function(event){
		event.preventDefault();
		var type = $(this).closest('[data-video-type]').attr('data-video-type');
		videoSelector.select(type);
	})
	.delegate('.action-modify','click',function(event){
		var $btns = $(this).parent();
		$btns.html($btns.data('cacheHTML'));
	});

	$('.action-submit').click(function(event){
		event.preventDefault();
		var $this = $(this),
			noVoiceId = $('li[data-video-type="noVoiceId"]').attr('data-video-id'),
			withVoiceId = $('li[data-video-type="withVoiceId"]').attr('data-video-id');

		if(noVoiceId == 0 && withVoiceId == 0){
			$('body,html').animate({scrollTop: $('div.profile-video').offset().top - 60},'quick');
			return;
		}
		$.post('/a/voice/user/save-voice',{
			'noVoiceId': noVoiceId,
			'withVoiceId': withVoiceId,
			'isUpdate': $this.attr('data-isupdate')
		},function(results){
			if(results.code == 0){
				if(results.msg) {
					location.href = results.msg;
				}else{
					$.inform({
						icon : 'icon-success',
						delay : 2000,
						easyClose : true,
						content : "提交成功"
					});
				}
			}else{
				$.alert(results.msg);
			}
		},'json');
	});

	$('.action-skip').click(function(event){
		event.preventDefault();
		var skipUrl = $(this).attr('href'),
			noVoiceId = $('li[data-video-type="noVoiceId"]').attr('data-video-id'),
			withVoiceId = $('li[data-video-type="withVoiceId"]').attr('data-video-id');

		if(noVoiceId != 0 || withVoiceId != 0){
			$.confirm({
				title: false,
				content: '当前已选择的参赛视频尚未提交，你确定放弃吗？',
				onConfirm: function() {
					location.href = skipUrl;
				}
			});
		}else{
			location.href = skipUrl;
		}
	});

	(function(){
		var noVoiceId = $('li[data-video-type="noVoiceId"]').attr('data-video-id'),
			withVoiceId = $('li[data-video-type="withVoiceId"]').attr('data-video-id');

		vidioInfo.get(noVoiceId,'noVoiceId');
		vidioInfo.get(withVoiceId,'withVoiceId');
	})();

});

})(jQuery,mysohu);