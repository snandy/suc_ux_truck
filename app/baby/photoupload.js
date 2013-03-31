/*
 *	babyapp-dialog
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){
var app = 'babyapp';

var win = window,
	doc = document,
	ieBug = $.browser.msie && parseFloat($.browser.version) < 7;


var instanceId = 1;

/*
opts {
	css: {
		left:,
		top::
	},
	appendTo: 浮动层添加到哪里,
	btn: 按钮的位置,
	onUpload: function(){} 开始上传时执行
	onUploadComplete: function(data){} 上传完毕
	onDelete: function(){} 当删除图片
}
*/

var PhotoUpload = function(opts){
	this.insId = instanceId++;
	this.data = null;
	this.opts = opts || {};
	this.init();
}
PhotoUpload.prototype = {
	init: function(){
		var self = this;
		//初始化弹出窗的容器
		this.$container = $('<div class="baby-face-dl-wrapper" style="display:none"></div>').css(this.opts.css);
		var html = [
		'<div class="dl-arrow"></div>',
		'<div class="baby-face-dl-box"></div>'	
		].join('');
		this.$container.html(html).appendTo(this.opts.appendTo);

		this.$box = this.$container.find('div.baby-face-dl-box');

		this.hasFlashPlayer = (win.swfobject && swfobject.getFlashPlayerVersion().major == 0);

		if(this.hasFlashPlayer){
			this.$box.html(this._noFlash());
			this.opts.btn.bind('click',function(){
				self.show(true);
			});
		}
	},
	_initSwfUpload: function(){
		var self = this;
		if(this.swfu){
			this.swfu.destroy();
			this.opts.btn.find('.swfupload').remove();
		}
		this.opts.btn.prepend($('<i id="baby_photo_upload_'+this.insId+'"></i>'));
		this.swfu = new SWFUpload({
            // Backend Settings       
			upload_url: "http://upload.pp.sohu.com/uploadService.do",            
            // File Upload Settings
            file_size_limit : "10 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png;*.bmp",
            file_types_description : "图片文件",
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
							$.alert('图片文件太小，请检查图片属性。');
							break;
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							$.alert('图片过大，请选择小于10M的图片。');
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							$.alert('该文件不是支持的格式，请检查。');
							break;
						default:
							$.alert('让服务器再飞一会儿，请稍后再试。');
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
						// token
						$.getJSON('/api/gettoken.jsp?ot=json',function(json){
							if(json.status == 0){
								
								that.setPostParams({"ptype": 5, "bsize": 450, "token": json.data[0].enToken, "watermark": ''});
								that.startUpload();
								self._startUpload();
								if($.isFunction(self.opts.onUpload)) self.opts.onUpload();
								
							}else{
								$.alert('让服务器再飞一会儿，请稍后再试。');
							}
						});
					}
				} catch (ex) {
					this.debug(ex);
				}
			},
            upload_progress_handler : function(file, bytesLoaded){
				//显示进度
				try {
					var percent = Math.ceil((bytesLoaded / file.size) * 100);
					self._progress(percent);
				} catch (ex) {
					this.debug(ex);
				}
			},
            upload_error_handler : function(file, errorCode, message){
				$.alert('让服务器再飞一会儿，请稍后再试。');
			},
            upload_success_handler : function(file, serverData){
				try {
					self.swfu.setButtonDisabled(false);
					var json = win["eval"]("(" + serverData + ")");
					if (json.code == 0) {
						self._uploadComplete(json.data);
					}else{
						$.alert(json.msg);
						self.clearData();
						self.hide();
					}
					if($.isFunction(self.opts.onUploadComplete)) self.opts.onUploadComplete(json);
				}catch(ex){
					this.debug(ex);
				}
			},

            // Button Settings
            button_image_url : "http://js6.pp.sohu.com.cn/i/default/my/img/nil.gif", // http://js6.pp.sohu.com.cn/i/default/my/img/icon_picture_upload_w45.gif
            button_placeholder_id : 'baby_photo_upload_'+self.insId,
            button_width: 40,
            button_height: 20,
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
	_startUpload: function(){
		var self = this;
		var html = [
		'<div class="upload-loading">',
			'<div class="progressWrapper">',
				'<div class="progressContainer blue">',
					'<div class="progressName"></div>',
					'<div class="progressBarWrapper">',
						'<div style="width:0%;" class="progressBarComplete"></div>',
					'</div>',
					'<div class="progressBarStatus">0%</div>',
					'<div class="progressCancel">',
						'<input type="button" value="取消上传">',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
		].join('');
		this.$box.html(html);
		this.$box.find('input').bind('click',function(){
			self.swfu.cancelUpload();
			self.swfu.setButtonDisabled(false);
			self.data = null;
			self.hide();
		});
		this.show();
		this.swfu.setButtonDisabled(true);
	},
	_progress: function(percent){
		this.$box.find('div.progressBarComplete').css('width',percent+'%').end().find('div.progressBarStatus').html(percent+'%');
	},
	_uploadComplete: function(data){
		this.data = data;
		var self = this;
		var html = [
		'<div class="confirm-function-text">',
			'<a href="javascript:void(0);">删除</a>',
		'</div>',
		'<div class="confirm-picture-preview">',
			'<img src="'+this.getData().small+'" />',
		'</div>',
		'<div class="confirm-picture-readme"><span></span></div>'
		].join('');
		this.$box.html(html);
		this.$box.find('div.confirm-function-text > a').bind('click',function(){
			self.data = null;
			self.hide();
			if($.isFunction(self.opts.onDelete)) self.opts.onDelete();
		});

	},
	_noFlash: function(){
		var html = [
		'<div class="panel-container-flash-tip">',
			'<div class="flash-icon">',
				'<a href="http://www.adobe.com/go/getflashplayer" target="_blank"><img src="http://s3.suc.itc.cn/i/home/d/flash-ico.jpg"></a>',
			'</div>',
			'<div class="flash-txt">',
				'<a href="http://www.adobe.com/go/getflashplayer" target="_blank">没有安装Flash，点击下载&gt;&gt;</a>',
			'</div>',
		'</div>'
		].join('');

		return html;
	},
	draw: function(){
		if(this.hasFlashPlayer){
			return;
		}
		this.data = null;
		this.hide();
		this._initSwfUpload();
	},
	show: function(easyHide){
		if(this.$container.is(':visible')){
			return;
		}
		this.$container.show();
		var self = this;
		if(easyHide){
			setTimeout(function(){
				self.easyHide = true;
				$(doc).bind('click.babyappupload',function(){
					self.hide();
				});
			},0);
		}
	},
	hide: function(){
		if(!this.$container.is(':visible')){
			return;
		}
		this.$container.hide();
		if(this.easyHide){
			this.easyHide = false;
			$(doc).unbind('click.babyappupload');
		}
	},
	getData: function(){
		if(this.data){
			return {
				small: this.data.thumb,
				big: this.data.big,
				origin: this.data.origin,
				id: this.data.photoId
			}
		}else{
			return null;
		}
			
	},
	clearData: function(){
		this.data = null;
	}
};




//暴露的接口
ms.babyapp.photoUpload = function(opts){
	return new PhotoUpload(opts);
}


})(jQuery,mysohu);