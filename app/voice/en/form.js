/*
 *	中国好声音 英文站
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var win = window,
	doc = document,
	ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

//swfupload 大小 368x28

function enAlert(msg){
	$.alert({
		labAccept : "OK",
		content: msg
	});
}

/**********************************************视频上传*************************************/

//新版的上传组件
var _e = function(){}, _ts = function(){};
/*
if(typeof console != 'undefined' ) _e = function( obj, str ){ console.log( '%c%d%o', 'font-style:italic;font-size:10px;' ,str ? str : 'log: ' , obj ); };
if(typeof console != 'undefined' && typeof console.timeStamp != 'undefined' ) _ts = function( str ){ typeof console.timeStamp === 'undefined' ? console.info(str) : console.timeStamp(str); };
*/

var DEF_TYPE = 124;//原创


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
        return "00:00";
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
			this.noFlashText = "your browser doesn't install the Flash Player components, the upload function cannot used normally,please install";
		}
		else{
			this.flashVer = (typeof this.flashVer != 'string' ? this.flashVer.join('') : this.flashVer);
			if(this.getFlashVersion().m < 10){
				this.noFlashText = 'The version of your Flash Player is too old,which cannot use the upload component.<br />Upgrade the Flash Player please,enjoy more functions.';
			}
		}
	},
	close: function(callback){
		var self = this;
		
		if(this.uploadInfo.status == 'uploading'){
			$.confirm({
				title: false,
				labConfirm : "confirm",
				labCancel : "cancel",
				content: '<div style="width:400px;">Are you sure you want to cancel this uploaded video?<br />PS:Support the continuingly upload within 72 hours</div>',
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
						'<div class="input-file init-mode">Choose the video that you want to upload please</div>',
						'<div class="video-upload-title uploading-mode" style="display:none">Uploading:</div>',
						'<div class="video-upload-progress-wrapper uploading-mode" style="display:none">',
							'<p style="width:0%" class="video-upload-progress"></p>',
							'<p class="text">0%</p>',
						'</div>',
						'<div class="input-file-btn"></div>',
						'<div class="tips">The video\'s size should less than '+FILE_SIZE_LIMIT+'M,the format supported: <span title="avi/mpeg/rmvb/wmv/asf/divx/flv/m4v/fli/flc/mp4/3gp/mkv/3g2/mp3/wma">avi /mpeg /rmvb /wmv /flv /mp4 /mp3 /wma...</span></div>',
					'</div>',
					'<div class="video-agreement">',
						'<label><input type="checkbox" checked="checked"></label>',
						'<span>I have read and agreed <a href="http://tv.sohu.com/upload/hdfeedback/index.jsp?46" target="_blank">"The video upload agreement"</a></span>',
					'</div>',
				'</div>',
				'<div class="video-upload-btn-wrapper resume-mode" style="display:none"><a class="btn btn-primary action-resume" href="#">Continue to upload</a></div>',
			'</div>'
		].join('');
		this.$container.html(html);
		this.initUpload();
		
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
			'<div class="video-upload-over">Video is being transcoded and audited,please wait a moment patiently and then you can watch the video you uploaded.</div>'
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
			'<h3 class="title">Video Information</h3>',
			'<div class="video-upload-info-form">',
				'<label><span class="red">*</span>Title<input type="text" class="video-title" value="'+unescape(obj.title)+'"></label>',
				'<div class="video-upload-info-tips-wrapper" style="display:none;">',
					'<div style="left:50px;" class="video-upload-info-tips">',
						'<div class="arrow"></div>',
					'</div>',
				'</div>',
			'</div>',
			'<div class="video-upload-btn-wrapper"><a class="btn btn-primary" href="#">Save</a></div>'
			];
		$box.html(html.join('')).insertAfter(this.$container.find('div.video-post-title-box'));
		
		$box.find('a.btn-primary').bind('click',function(event){
			event.preventDefault();
			//保存
			var $title = $box.find('input.video-title'),
				title = $.trim($title.val()),
				nlen = ms.vocEn.utils.cjkLength(title),
				$error = $box.find('div.video-upload-info-tips-wrapper'),
				$errorContent = $error.find('div.video-upload-info-tips');

			if(nlen == 0){
				$error.show();
				$errorContent.html('<div class="arrow"></div>The title cannot be empty');
				$title.focus();
				return;
			}
			else if(nlen > 60){
				$error.show();
				$errorContent.html('<div class="arrow"></div>The title should be within 60 characters');
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
				'categoriesId': obj.categoriesId,
				'catecode': obj.categoriesId,
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
							content : "Save successfully",
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
							content : 'Save failed,please try again later'
						});
					}
				}else{
					// 因网络等问题导致的请求失败，错误提示
					$.inform({
						icon : 'icon-error',
						delay : 2000,
						easyClose : true,
						content : 'Save failed,please try again later'
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

		$tips.html('Upload rate: <span class="orange">'+obj.speed+'KB/S </span> Uploaded: <span class="orange">'+obj.uploaded+this.uploadInfo.unit+'/'+obj.size+this.uploadInfo.unit+'  </span> Remaining time: <span class="orange">'+obj.time+'</span>');
            
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
					.find('div.video-upload-title').html('Uploading:'+opts.title).end()
					.find('div.tips').html('Upload rate: <span class="orange">--KB/S </span> Uploaded: <span class="orange">--M/--M  </span> Remaining time: <span class="orange">-:-</span>');
				
				

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
					$tips.html('Upload rate: <span class="orange">--KB/S </span> Uploaded: <span class="orange">' + filesize + self.uploadInfo.unit + '/'+filesize+self.uploadInfo.unit+'  </span> Remaining time: <span class="orange">00:00</span>');

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

				enAlert('Server busy,please try again later');
			}
		}).error(function(){
			_ts( 'log: createInfo request error, try again' );

			self.pingback( ['http://msg.video.sohu.com/stat.gif?type=webup&id=undefined'
				,'&step=createinfo&rs=0&version=',self.flashVer,'&userId='
				,PassportSC.cookieHandle(),'&msg=post.err'].join('') );

			self.uploadMode();//重新初始化

			enAlert('Network anomalies,please try again later');
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
				labConfirm : "confirm",
				labCancel : "cancel",
				content: '<div style="width:400px;">Are you sure you want to cancel this uploaded video?<br />PS:Support the continuingly upload within 72 hours</div>',
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
				'time': this.formatTime( timeLeftTxt,true )
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
				.find('a.action-resume').unbind('click').bind('click',function(event){
					event.preventDefault();
					self.getFlash().resumeUpload();
				});
        }else if( opts.status == 'init' ){
            _ts('log: upload Start');
            //判断视频大小是否符合最大限制
            if( opts.size > this.uploadInfo.limit || opts.size <= 0){
                _ts('log: video size beyond.');
				this.initUpload();
				this.$container.find('div.tips').html();
                this.setUploadErrorText('Only size less than '+FILE_SIZE_LIMIT+'M can be support ed,please choose the video file you want to upload again');
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
					labConfirm : "confirm",
					labCancel : "cancel",
					content: '<div style="width:400px;">Are you sure you want to cancel this uploaded video?<br />PS:Support the continuingly upload within 72 hours</div>',
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


var vidioInfo = {
	get: function(vid){
		if(vid == 0 || vid == '') return;
		var self = this;
		$.ajax({
			type: 'GET',
			url: 'http://api.my.tv.sohu.com/video/videoviewinfo2.do?callback=?',
			dataType: 'jsonp',
			scriptCharset: 'utf-8',
			data: {vid:vid},
			success: function(results){
				self.draw(vid,results);
			}
		});
	},
	draw: function(vid,results){
		var previewHTML,name,cover;
		if(results.status == 1){
			previewHTML = '<object width="320" height="240"><param name="movie" value="http://share.vrs.sohu.com/my/v.swf&autoplay=false&id='+vid+'&skinNum=1&topBar=1&xuid="></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><param name="wmode" value="Opaque"></param><embed width="320" height="240"  allowfullscreen="true" allowscriptaccess="always" quality="high" wmode="Opaque" src="http://share.vrs.sohu.com/my/v.swf&autoplay=false&id='+vid+'&skinNum=1&topBar=1&xuid=" type="application/x-shockwave-flash"/></embed></object>';
		}else{
			switch(results.code){
				case 22:
					//转码失败
				case 37:
					//审核删除
					name = 'Unapproved,please upload again';
					//cover = 'http://s3.suc.itc.cn/i/chinavoice/d/image_examine_error.jpg';
					break;
				default:
					name = 'Examine and verifying';
					//cover = 'http://s3.suc.itc.cn/i/chinavoice/d/image_examine.jpg';
			}
			
			previewHTML = '<span><i class="img-video"></i><h3>'+name+'</h3></span>'
		}
		
		$('#enForm [name="voiceId"]').val(vid);
		$('#video_block .cv-video-inner').html(previewHTML);
		$('#video_block a.btn-primary').html('Change');
		form.ok($('#video_block'),true);
	}

};

var uploadDialog = {
	init: function(){
		var self = this;
		this.$mask = $('<div class="modal-backdrop"></div>').appendTo('body').hide();
		this.$box = $('<div class="abs cv-upload hide"></div>').appendTo('body');

		this.$box.delegate('a.close','click',function(event){
			event.preventDefault();
			sohuHD.close($.proxy(self.close,self));
		});

		sohuHD.init(this.$box,{
			onUploadComplete: function(vid){
				vidioInfo.get(vid);
			},
			onCompleteAndSaved: function(vid){
				vidioInfo.get(vid);
				sohuHD.close($.proxy(self.close,self));
			}
		});
	},
	close: function(){
		this.$box.hide();
		this.$mask.hide();
	},
	upload: function(){
		this.$box.show().html('');
		sohuHD.uploadMode();
		this.$mask.show();
		$('body,html').animate({scrollTop: 0},'quick');
	}
};

/**********************************************表单验证*************************************/
var msg = {
	'name': {
		focus: 'Please input the real name for conveniently contact',
		error: 'Input the characters between 2 and 30 please',
		empty: 'Input your real name please'
	},
	'birthday': {
		focus: 'Please select your birthday for conveniently',
		error: 'Please select your birthday for conveniently',
		empty: 'Please select your birthday for conveniently'
	},
	'nationality': {
		focus: 'Input the real information of your nationality please',
		error: 'Input the characters between 2 and 30 please',
		empty: 'Input the real information of your nationality please'
	},
	'email': {
		focus: 'Input the correct email address please',
		error: 'Invalid Email ',
		empty: 'Input the correct email please'
	},
	'profession': {
		focus: 'Input the information of your profession please',
		error: 'Input the characters between 2 and 30 please',
		empty: 'input the information of your profession please'
	},
	'emergencyPhone': {
		focus: 'Input your emergency phone number please',
		error: 'Input the characters between 2 and 30 please',
		empty: 'Input your emergency phone number please'
	},
	'homePhone': {
		focus: 'Input your contact number please',
		error: 'Input the characters between 2 and 30 please',
		empty: 'Input your contact number please'
	},
	'songStyleOther': {
		focus: 'What kind of music genre are you adept at?',
		error: 'the content should be within 1000 characters',
		empty: 'What kind of music genre are you adept at?'
	},
	'tvExperience': {
		focus: 'the content should be within 1000 characters',
		error: 'the content should be within 1000 characters',
		empty: 'Please answer the question'
	},
	'regret': {
		focus: 'the content should be within 1000 characters',
		error: 'the content should be within 1000 characters',
		empty: 'Please answer the question'
	},
	'wish': {
		focus: 'the content should be within 1000 characters',
		error: 'the content should be within 1000 characters',
		empty: 'Please answer the question'
	},
	'description': {
		focus: 'the content should be within 1000 characters',
		error: 'the content should be within 1000 characters',
		empty: 'Please answer the question'
	}
};


var form = {
	init: function(){
		this.$form = $('#enForm');

		this.hideAllAlert();
		
		this.bindEvent();

		//初始化图片上传
		if(this.$form.find('#photo_block a.cv-swf').is(':visible')){
			setTimeout($.proxy(this.initSwfupload,this),0);
		}

		/********************************下面初始化可能找不到对应元素*************************************/

		if(this.$form.find('select[name="year"]').length){
			this.initBirthday();
		}

		//曲风 其他
		var $sso = this.$form.find('textarea[name="songStyleOther"]');
		$sso.prop('disabled',!this.$form.find('input[name="songStyle"][value="11"]').prop('checked'));
		if($sso.prop('disabled')) $sso.addClass('disabled');
		//组合
		var $team2 = this.$form.find('input[name="team"][value="2"]');
		if($team2.length){
			$team2.parent().siblings('span')[$team2.prop('checked') ? 'show' : 'hide']();
			this.initMembers();
		}

	},
	hideAllAlert: function(){
		this.$form.find('.alert').addClass('hide');
	},
	hint: function($o,text){
		$o.closest('div.control-group').find('span.alert').removeClass('alert-error').addClass('alert-info').html(text).removeClass('hide').end().find('i.icon-right').remove();
	},
	error: function($o,text){
		$o.closest('div.control-group').find('span.alert').removeClass('alert-info').addClass('alert-error').html(text).removeClass('hide').end().find('i.icon-right').remove();
	},
	ok: function($o,noIcon){
		var $alert = $o.closest('div.control-group').find('span.alert').addClass('hide');
		
		$o.closest('div.control-group').find('i.icon-right').remove();
		if(!noIcon){
			$alert.before('<i class="icon-right"></i>');
		}
		
	},
	buildSelect: function($select,data,type,value){
		type = type || 'Number';//比较的类型
		value = value ? value : ($select.attr('data-default-value') ? $select.attr('data-default-value') : '');
		$select.attr('data-default-value','');
		var select = $select[0],
			isAry = $.isArray(data);
		if(select.options.length > 0) select.options.length = 1;
		if(!data) return;
		$.each(data,function(k,v){
			var option = document.createElement('option');
			option.text = typeof v == 'object' ? v.text : v;
			option.value = isAry ? (typeof v == 'object' ? v.value : v) : k;
			select.options.add(option);
		});
		$select.val(type == 'Number' ? value*1 : value);
	},
	initMembers: function(){
		var arr = [];
		for(var i = 2; i <= 50 ;i += 1){
			arr.push(i);
		}
		this.buildSelect(this.$form.find('select[name="members"]'),arr);
	},
	initBirthday: function(){
		var self = this;
		//生日
		var $year = this.$form.find('select[name="year"]'),
			$month = this.$form.find('select[name="month"]'),
			$day = this.$form.find('select[name="day"]'),
			limitDate = new Date(),
			limitYear = limitDate.getFullYear(),
			limitMonth = limitDate.getMonth(),
			limitDay = limitDate.getDate();//生日为上限为当天

		function getDaysInMonth(year,month){
			return 32 - new Date(year, month, 32).getDate();
		}

		function birthdayYear(){
			var now = new Date(),
				value = $year.attr('data-default-value') ? $year.attr('data-default-value') : '';

			var arr = [];
			for(var i = limitYear ,len = 1900; i >= len ;i -= 1){
				arr.push(i);
			}

			self.buildSelect($year,arr);
			
		}

		function birthdayMonth(year){
			$month[0].options.length = 1;
			if(!year){
				year = limitYear - 1;
			}

			var arr = [],
				en = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			for(var i = 1; i <= 12 ;i += 1){
				if(year == limitYear && i > (limitMonth+1)){
					break;
				}
				arr.push({
					text : en[i],
					value: i
				});
			}

			self.buildSelect($month,arr);
		}

		function birthdayDay(year,month){
			$day[0].options.length = 1;
			if(!year){
				year = limitYear - 1;
			}
			if(!month){
				return;
			}
			var arr = [];
			month -= 1;
			var daysInMonth = getDaysInMonth(year,month);
			for(var i = 1; i <= daysInMonth ;i += 1){
				if(year == limitYear && month == limitMonth && i > limitDay){
					break;
				}
				arr.push(i);
			}

			self.buildSelect($day,arr);
		}

		birthdayYear();
		birthdayMonth($year.val());
		birthdayDay($month.val(),$month.val());

		$year.change(function(){
			var m = $month.val(),
				d = $day.val();
			birthdayMonth($(this).val());
			$month.val(m);
			birthdayDay($(this).val(),m);
			$day.val(d);
			if(self.checkBirthday()) self.ok($year);
		});
		$month.change(function(){
			var d = $day.val();
			birthdayDay($year.val(),$(this).val());
			$day.val(d);
			if(self.checkBirthday()) self.ok($year);
		});
		$day.change(function(){
			if(self.checkBirthday()) self.ok($year);
		});
	},
	bindEvent: function(){
		var self = this,
			$submit = this.$form.find('.action-submit');
		this.$form
		.delegate('input[name]:text,textarea[name]','focus',function(){
			if(msg[this.name]){
				self.hint($(this),msg[this.name].focus);
			}

		})
		.delegate('input[name]:text,textarea[name]','blur',function(){
			var re = self.check(this);
			if(re.empty){
				if(re.require) self.error($(this),msg[this.name].empty);
				else self.ok($(this),true);
			}
			else if(re.error){
				self.error($(this),msg[this.name].error);
			}
			else {
				self.ok($(this));
			}
		})
		.submit(function(){
			if(!self.checkAll()) return false;

			$submit.addClass('disabled');
			$submit.data('isDisabled',true);

			function enabled(){
				$submit.removeClass('disabled');
				$submit.removeData('isDisabled');
			}

			$.post(this.action+'?_input_encode=UTF-8',$(this).serialize(),function(results){
				if(results.code == 0){
					if(results.msg) {
						location.reload(true);
					}else{
						$.inform({
							icon : 'icon-success',
							delay : 2000,
							easyClose : true,
							content : "Submitted successfully"
						});
					}
				}else{
					enAlert(results.msg);
				}
				enabled();
			},'json');
			//10秒超时，如果还没返回，则重置按钮
			setTimeout(enabled,10000);

			return false;
		});

		//报名形式
		this.$form.find('[name="team"]').click(function(){
			if(this.checked){
				$(this).parent().siblings('span')[this.value == 2 ? 'show' : 'hide']();
			}

		});
		//曲风
		var $sso = this.$form.find('textarea[name="songStyleOther"]');
		this.$form.find('input[name="songStyle"][value="11"]').click(function(){
			self.ok($sso.prop('disabled',!this.checked),true);
			if($sso.prop('disabled')) $sso.addClass('disabled');
			else $sso.removeClass('disabled');
		});
		//上传视频
		$('#video_block').delegate('a.btn-primary','click',function(event){
			event.preventDefault();
			uploadDialog.upload();
		});

		//提交
		$submit.click(function(event){
			event.preventDefault();
			if($submit.data('isDisabled')) return;
			self.$form.submit();
		});
	},
	initSwfupload: function(){
		var self = this,
			$photoBlock = $('#photo_block'),
			$aSwf = $photoBlock.find('a.cv-swf');
		if(this.swfu){
			this.swfu.destroy();
			$aSwf.find('.swfupload').remove();
		}
		$aSwf.html('<i id="voice_photo_upload"></i>');

		this.swfu = new SWFUpload({
            // Backend Settings       
			upload_url: "http://i.sohu.com/a/voice/app/upload-en",
            // File Upload Settings
            file_post_name: "uploadFile",
            file_size_limit : "10 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png;*.bmp",
            file_types_description : "Image files",
            file_upload_limit : "0",

            // Event Handler Settings - these functions as defined in Handlers.js
            //  The handlers are not part of SWFUpload but are part of my website and control how
            //  my website reacts to the SWFUpload events.
            file_queue_error_handler : function(file, errorCode, message){
				try {
					var errorName = "";
					if (errorCode === SWFUpload.errorCode_QUEUE_LIMIT_EXCEEDED) {
						errorName = "You have attempted to queue too many files.";
					}

					if (errorName !== "") {
						//alert(errorName);
						return;
					}

					switch (errorCode) {
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							enAlert('Image file is too small,check the image attributes please');
							break;
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							enAlert('Image size exceeds the maximum limit,select less than 10M please');
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							enAlert('The format of this file is not supported,please check it');
							break;
						default:
							enAlert('The server error,please try again later');
							break;
					}
				} catch (ex) {
					this.debug(ex);
				}
			
			},
            file_dialog_complete_handler : function(numFilesSelected, numFilesQueued){
				var that = this;
				
				try {
					if (numFilesQueued > 0) {
						var file = this.getFile(0);
						self.startUpload();
					}
				} catch (ex) {
					this.debug(ex);
				}
			},
            upload_progress_handler : function(file, bytesLoaded){
				//显示进度
				try {
					var percent = Math.ceil((bytesLoaded / file.size) * 100);
					self.photoUPloadProgress(percent);
				} catch (ex) {
					this.debug(ex);
				}
			},
            upload_error_handler : function(file, errorCode, message){
				enAlert('The server error,please try again later');
			},
            upload_success_handler : function(file, serverData){
				try {
					self.swfu.setButtonDisabled(false);
					var json = win["eval"]("(" + serverData + ")");
					if (json.code == 0) {
						self.photoUploadComplete(json.data);
					}else{
						enAlert(json.msg);
						self.photoUploadError();
					}
				}catch(ex){
					this.debug(ex);
				}
			},

            // Button Settings
            button_image_url : "http://js6.pp.sohu.com.cn/i/default/my/img/nil.gif", // http://js6.pp.sohu.com.cn/i/default/my/img/icon_picture_upload_w45.gif
            button_placeholder_id : 'voice_photo_upload',
            button_width: 368,
            button_height: 28,
            button_text : '',
            button_text_style : '',
            button_text_top_padding: 0,
            button_text_left_padding: 0,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,
            button_disabled : false,
            
            
            // Flash Settings
            flash_url : "http://i.sohu.com/asset/swfupload.swf",
            
            // Debug Settings
            debug: false
        });
	},
	photoUPloadProgress: function(percent){
		
	},
	photoUploadComplete: function(data){
		this.photoViewMode(data.url);
	},
	photoUploadError: function(){
		this.initSwfupload();

	},
	startUpload: function(){
		var self = this;
		if(this.swfu){
			try {
				$.post('/a/voice/app/get-token',function(results){
					if(results.code == 0){
						self.swfu.setPostParams({"token": results.data});
						self.swfu.startUpload();
					}else{
						enAlert('The server error,please try again later');
					}
				},'json');
				
			}catch(ex){
				this.debug(ex);
			}
		}
	},
	photoViewMode: function(url){
		var $photoBlock = $('#photo_block');
		$photoBlock.find('> input:text').hide();
		$photoBlock.find('> span.cv-photo').html('<span class="pic"><img src="'+url+'_w280" /></span>').show();
		this.$form.find('[name="photo"]').val(url);
		$photoBlock.find('a.btn-primary').html('Change');
		this.ok($photoBlock,true);
	},
	isEmpty: function(value){
		if(value == ''){
			return true;
		}
		return false;
	},
	isOutOfRange: function(value,min,max){
		var	len = value.length;

		if(len < min || len > max){
			return true;
		}

		return false;
	},
	checkZipcode: function(value){
		return /^\d{6}$/.test(value);
	},
	checkEmail: function(value){
		//和后端一致的正则
		return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
		/*
		return /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(value);
		*/
	},
	checkPhone: function(value){
		return /^(\d+-?)*\d+$/.test(value);
	},
	checkMobile: function(value){
		return /^\d{11}$/.test(value);
	},
	checkBirthday: function(){
		var $year = this.$form.find('select[name="year"]'),
			$month = this.$form.find('select[name="month"]'),
			$day = this.$form.find('select[name="day"]');

		if($year.val() == 0 || $month.val() == 0 || $day.val() == 0){
			return false;
		}

		return true;

	},
	checkArea: function(){
		var $province = this.$form.find('select[name="provinceId"]'),
			$city = this.$form.find('select[name="cityId"]'),
			$country = this.$form.find('select[name="countyId"]');

		if($province.val() == 0){
			return false;
		}

		return true;

	},
	check: function(ele){
		var $ele = $(ele),
			value = $.trim($ele.val()),
			re = {
				error: false,//是否出错
				empty: false,//是否为空
				require: false//是否必填
			};

		$ele.val(value);

		switch(ele.name){
			case 'name':
			case 'nationality':
			case 'profession':
				re.require = true;
				re.empty = this.isEmpty(value);
				re.error = this.isOutOfRange(value,2,30);
				break;
			case 'songStyleOther':
				re.require = true;
			case 'tvExperience':
			case 'regret':
			case 'wish':
			case 'description':
				re.empty = this.isEmpty(value);
				re.error = this.isOutOfRange(value,0,1000);
				break;
			case 'email':
				re.require = true;
				re.empty = this.isEmpty(value);
				re.error = !this.checkEmail(value);
				break;
			case 'emergencyPhone':
			case 'homePhone':
				re.require = true;
				re.empty = this.isEmpty(value);
				re.error = !this.checkPhone(value);
				break;
		}

		return re;
	},
	checkAll: function(){
		var self = this,
			re = true,
			$firstError;

		//校验所有普通文本框
		this.$form.find('input[name]:text,textarea[name]').each(function(){
			if(!this.disabled){
				var ckRe = self.check(this),b;
				if(ckRe.empty){
					if(ckRe.require){
						self.error($(this),msg[this.name].empty);
						b = false;
					} 
					else{
						self.ok($(this),true);
						b = true;
					} 
				}
				else if(ckRe.error){
					self.error($(this),msg[this.name].error);
					b = false;
				}
				else {
					self.ok($(this));
					b = true;
				}
				re = re && b;
			}
		});


		//没有上传图片
		if(this.$form.find('[name="photo"]').val() == ''){
			this.error($('#photo_block'),'Upload your photo please');
			re = re && false;
		}

		//没有上传视频
		if(this.$form.find('[name="voiceId"]').val() == '' || this.$form.find('[name="voiceId"]').val() == 0){
			this.error($('#video_block'),'Upload your video please');
			re = re && false;
		}


		//没有选择生日
		if(!this.checkBirthday()){
			this.error(this.$form.find('[name="year"]'),msg.birthday.error);
			re = re && false;

		}

		//是否同意了条款
		/*
		if(this.$form.find('[name="agree"]').length){
			if(!this.$form.find('[name="agree"]').prop('checked')){
				re = re && false;
				enAlert('您必须接受《中国好声音 第二季》中的所有内容');

			}
		}
		*/
		$firstError = this.$form.find('span.alert-error:visible');
		if($firstError.length) $('body,html').animate({scrollTop: $firstError.offset().top - 60},'quick');
		return re;
	}

};


$(function(){
	form.init();
	uploadDialog.init();
	vidioInfo.get($('#enForm [name="voiceId"]').val());
});

})(jQuery,mysohu);