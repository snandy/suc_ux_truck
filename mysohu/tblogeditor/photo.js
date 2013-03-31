/**
 * 一句话图片发布
 * @author yongzhong
 */

(function($){

    $(function(){

// 当客户端已安装FlashPlayer时弹出提示
if(window.swfobject){
	var playerVersion = swfobject.getFlashPlayerVersion(); // returns a JavaScript object
	if(playerVersion.major > 0){


function fileQueueError(file, errorCode, message) {
	try {
		var imageName = "error.gif";
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
			imageName = "zerobyte.gif";
			document.getElementById('picture_progress_panel_wrapper').style.visibility = "hidden";
			document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
			$('#sentence_submit > span.submit').removeClass('disabled');
			
			$.sentenceNotice({
                type: 'notice',
                icon: 'notice',
                content: '图片文件太小，请检查图片属性。'
            });
			break;
		case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
			imageName = "toobig.gif";

			//document.getElementById('picture_notice_panel_wrapper').style.visibility = "visible";
			document.getElementById('picture_progress_panel_wrapper').style.visibility = "hidden";
			document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
			$('#sentence_submit > span.submit').removeClass('disabled');
			
			$.sentenceNotice({
                type: 'notice',
                icon: 'notice',
                content: '图片过大，请选择小于10M的图片。'
            });
			
			break;
		case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
			document.getElementById('picture_progress_panel_wrapper').style.visibility = "hidden";
			document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
			$('#sentence_submit > span.submit').removeClass('disabled');
			
			$.sentenceNotice({
                type: 'notice',
                icon: 'notice',
                content: '该文件不是支持的格式，请检查。'
            });

		default:
			//alert(message);
			document.getElementById('picture_progress_panel_wrapper').style.visibility = "hidden";
			document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
			$('#sentence_submit > span.submit').removeClass('disabled');
			
			$.sentenceNotice({
                type: 'notice',
                icon: 'error',
                content: '让服务器再飞一会儿，请稍后再试。'
            });

			break;
		}

		//addImage("images/" + imageName);

	} catch (ex) {
		this.debug(ex);
	}

}

function fileDialogComplete(numFilesSelected, numFilesQueued) {
	
	try {
		if (numFilesQueued > 0) {
			
			var that = this;
			
			// token
			$.get('http://i.sohu.com/api/gettoken.jsp?ot=json', function(data){
				
				var json = window["eval"]("(" + data + ")");
				
				if(json.status == 0){
					//分享图片.log($space_config._url);
					that.setPostParams({"token": json.data[0].enToken, "watermark": $space_config._url || ''});
					that.startUpload();
					
				}else{
					//alert(json.statusTxt);
					document.getElementById('picture_progress_panel_wrapper').style.visibility = "hidden";
					document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
					$('#sentence_submit > span.submit').removeClass('disabled');
					
					$.sentenceNotice({
		                type: 'notice',
		                icon: 'error',
		                content: '让服务器再飞一会儿，请稍后再试。'
		            });
				}
				
				
			});
			
		}
	} catch (ex) {
		this.debug(ex);
	}
}

function uploadProgress(file, bytesLoaded) {

	//document.getElementById('picture_notice_panel_wrapper').style.visibility = "hidden";
	document.getElementById('picture_progress_panel_wrapper').style.visibility = "visible";
	document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
	$('#sentence_submit > span.submit').addClass('disabled');

	try {
		var percent = Math.ceil((bytesLoaded / file.size) * 100);

		var progress = new FileProgress(file,  this.customSettings.upload_target);
		progress.setProgress(percent);
		if (percent === 100) {
			progress.setStatus("Creating thumbnail...");
			//progress.toggleCancel(false, this);
		} else {
			progress.setStatus("Uploading...");
			progress.toggleCancel(true, this);
		}
	} catch (ex) {
		this.debug(ex);
	}
}

function uploadSuccess(file, serverData) {

	//document.getElementById('picture_notice_panel_wrapper').style.visibility = "hidden";
	document.getElementById('picture_progress_panel_wrapper').style.visibility = "hidden";
	document.getElementById('picture_thumb_panel_wrapper').style.visibility = "visible";
	$('#sentence_submit > span.submit').removeClass('disabled');


	try {
		var progress = new FileProgress(file,  this.customSettings.upload_target);

		// 图片名称截取，中英文混排
		//console.log($('#picture_thumb_panel_filename').text());
		$('#picture_thumb_panel_filename').text(function(name){
			

			var fn_len = function(s){
				return s.replace(/[^\x00-\xff]/g,"**").length;
			},
			fn_sub = function(s, n){ 
				var r = /[^\x00-\xff]/g; 
				if (fn_len(s) <= n) return s;
				var m = Math.floor(n / 2);
				for(var i = m; i < s.length; i++) { 
					if(fn_len(s.substr(0, i)) >= n) {
						return s.substr(0, i); 
					} 
				} 
				return s;
			};
			

			// filename filter
			var first, last, dot;
			if (fn_len(name) > 20) {
				dot = name.lastIndexOf('.');
				first = fn_sub(name, 15);
				if (dot != -1) {
					last = name.substring(dot, name.length);
				}
				
				name = first + '..' + last;
			}
			
			return name;
		}(file.name));
		$('#onesentencetext').data('pic_tit', file.name);


		var json = window["eval"]("(" + serverData + ")");
        
        // 成功上传后追加预览图片     
        if (json.code == 0) {
			
			// 添加宽度200px缩略图
			addImage(json.data.big);
			
			// 保存图片地址到表单
			$('#onesentencetext').data('pic_url', json.data.origin);
			
			// 设置默认文字
			var $textbox = $("#onesentencetext");
			var textboxDefaultTxt = $textbox.data('textboxDefaultTxt');//在发布框内默认显示的文字
			if($.trim($textbox.val()) == "" || $textbox.val() == textboxDefaultTxt){
				$textbox
				.val('分享图片')	
				.trigger('focus');
			}
			
			// user click statistic
			if(window.mysohu && mysohu.put_log) mysohu.put_log('board_photo');

			
			progress.setStatus("Thumbnail Created.");
			progress.toggleCancel(false);
		} else {
			document.getElementById('picture_progress_panel_wrapper').style.visibility = "hidden";
			document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
			//addImage("images/error.gif");
			//progress.setStatus("Error.");
			progress.toggleCancel(false);
			//alert(json.msg);
			$.sentenceNotice({
                type: 'notice',
                icon: 'error',
                content: '让服务器再飞一会儿，请稍后再试。'
            });
		}


	} catch (ex) {
		this.debug(ex);
	}
}

function uploadComplete(file) {
	try {
		/*  I want the next upload to continue automatically so I'll call startUpload here */
		if (this.getStats().files_queued > 0) {
			this.startUpload();
		} else {
			var progress = new FileProgress(file,  this.customSettings.upload_target);
			progress.setComplete();
			progress.setStatus("All images received.");
			//progress.toggleCancel(false);
		}
	} catch (ex) {
		this.debug(ex);
	}
}

function uploadError(file, errorCode, message) {
	var imageName =  "error.gif";
	var progress;
	//console.log('uploadError');
	try {
		switch (errorCode) {
		case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
			//console.log('uploadError event handle: Cancelled');
			try {
				progress = new FileProgress(file,  this.customSettings.upload_target);
				progress.setCancelled();
				//progress.setStatus("Cancelled");
				progress.toggleCancel(false);

				document.getElementById('picture_progress_panel_wrapper').style.visibility = "hidden";
				document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
				$('#sentence_submit > span.submit').removeClass('disabled');
		
			}
			catch (ex1) {
				this.debug(ex1);
			}
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
			try {
				progress = new FileProgress(file,  this.customSettings.upload_target);
				progress.setCancelled();
				//progress.setStatus("Stopped");
				progress.toggleCancel(true);

				document.getElementById('picture_progress_panel_wrapper').style.visibility = "hidden";
				document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
				$('#sentence_submit > span.submit').removeClass('disabled');
		
			}
			catch (ex2) {
				this.debug(ex2);
			}
		case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
			imageName = "uploadlimit.gif";
			break;
		default:
			//alert('uploadError:' + message + errorCode);
			document.getElementById('picture_progress_panel_wrapper').style.visibility = "hidden";
			document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
			$('#sentence_submit > span.submit').removeClass('disabled');
	
			$.sentenceNotice({
	            type: 'notice',
	            icon: 'error',
	            content: '让服务器再飞一会儿，请稍后再试。'
	        });
            
			break;
		}

		//addImage("images/" + imageName);

	} catch (ex3) {
		this.debug(ex3);
	}

}

function destroyImage(event) {
	document.getElementById('picture_thumb_panel_wrapper').style.visibility = "hidden";
	$('#sentence_submit > span.submit').removeClass('disabled');
	
	// 清除一句话图片数据
	var eThumbPanel = document.getElementById("picture_thumb_panel");
	if(eThumbPanel.firstChild){
		eThumbPanel.removeChild(eThumbPanel.firstChild);
	}
	
	// 重置默认文本
	var $textbox = $("#onesentencetext");
	var textboxDefaultTxt = $textbox.data('textboxDefaultTxt');//在发布框内默认显示的文字
	if($.trim($textbox.val()) == "" || $textbox.val() == '分享图片'){
		$textbox
		.val(textboxDefaultTxt)
		.css("color", "#999999");
	}
	
	//清除url和tit缓存
	$('#onesentencetext').removeData('pic_url');
	$('#onesentencetext').removeData('pic_tit');
}


function addImage(src) {
	var newImg = document.createElement("img");
	newImg.style.width = "200px";
	
	var eThumbPanel = document.getElementById("picture_thumb_panel");
	if(eThumbPanel.firstChild){
		eThumbPanel.replaceChild(newImg, eThumbPanel.firstChild);
	}else{
		eThumbPanel.appendChild(newImg);
	}
	
	if (newImg.filters) {
		try {
			newImg.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 0;
		} catch (e) {
			// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
			newImg.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + 0 + ')';
		}
	} else {
		newImg.style.opacity = 0;
	}

	newImg.onload = function () {
		fadeIn(newImg, 0);
	};
	newImg.src = src;
}

function fadeIn(element, opacity) {
	var reduceOpacityBy = 5;
	var rate = 30;	// 15 fps


	if (opacity < 100) {
		opacity += reduceOpacityBy;
		if (opacity > 100) {
			opacity = 100;
		}

		if (element.filters) {
			try {
				element.filters.item("DXImageTransform.Microsoft.Alpha").opacity = opacity;
			} catch (e) {
				// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
				element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacity + ')';
			}
		} else {
			element.style.opacity = opacity / 100;
		}
	}

	if (opacity < 100) {
		setTimeout(function () {
			fadeIn(element, opacity);
		}, rate);
	}
}



/* ******************************************
 *	FileProgress Object
 *	Control object for displaying file info
 * ****************************************** */

function FileProgress(file, targetID) {
	this.fileProgressID = "divFileProgress";

	this.fileProgressWrapper = document.getElementById(this.fileProgressID);
	if (!this.fileProgressWrapper) {
		this.fileProgressWrapper = document.createElement("div");
		this.fileProgressWrapper.className = "progressWrapper";
		this.fileProgressWrapper.id = this.fileProgressID;

		this.fileProgressElement = document.createElement("div");
		this.fileProgressElement.className = "progressContainer";

		var progressCancel = document.createElement("div");
		progressCancel.className = "progressCancel";
		
		var progressCancelButton = document.createElement("input");
		progressCancelButton.type = "button";
		progressCancelButton.className = "ui-btn-w80 btn-w-gray";
		progressCancelButton.value = "取消上传";
		
		progressCancel.appendChild(progressCancelButton);
		

		var progressText = document.createElement("div");
		progressText.className = "progressName";
		//progressText.appendChild(document.createTextNode(file.name));


		var progressBarWrapper = document.createElement("div");
		progressBarWrapper.className = "progressBarWrapper";


		var progressBar = document.createElement("div");
		progressBar.className = "progressBarInProgress";
		
		progressBarWrapper.appendChild(progressBar);

		var progressStatus = document.createElement("div");
		progressStatus.className = "progressBarStatus";
		progressStatus.innerHTML = "&nbsp;";

		this.fileProgressElement.appendChild(progressText);
		this.fileProgressElement.appendChild(progressBarWrapper);
		this.fileProgressElement.appendChild(progressStatus);
		this.fileProgressElement.appendChild(progressCancel);
		

		this.fileProgressWrapper.appendChild(this.fileProgressElement);

		document.getElementById(targetID).appendChild(this.fileProgressWrapper);
		fadeIn(this.fileProgressWrapper, 0);

	} else {
		this.fileProgressElement = this.fileProgressWrapper.firstChild;
		//this.fileProgressElement.childNodes[0].firstChild.nodeValue = file.name;
	}

	this.height = this.fileProgressWrapper.offsetHeight;

}
FileProgress.prototype.setProgress = function (percentage) {
	this.fileProgressElement.className = "progressContainer green";
	this.fileProgressElement.childNodes[1].firstChild.className = "progressBarInProgress";
	this.fileProgressElement.childNodes[1].firstChild.style.width = percentage + "%";
	this.fileProgressElement.childNodes[2].innerHTML = percentage + "%";
};
FileProgress.prototype.setComplete = function () {
	this.fileProgressElement.className = "progressContainer blue";
	this.fileProgressElement.childNodes[1].firstChild.className = "progressBarComplete";
	this.fileProgressElement.childNodes[1].firstChild.style.width = "";

};
FileProgress.prototype.setError = function () {
	this.fileProgressElement.className = "progressContainer red";
	this.fileProgressElement.childNodes[1].firstChild.className = "progressBarError";
	this.fileProgressElement.childNodes[1].firstChild.style.width = "";

};
FileProgress.prototype.setCancelled = function () {
	this.fileProgressElement.className = "progressContainer";
	this.fileProgressElement.childNodes[1].firstChild.className = "progressBarError";
	this.fileProgressElement.childNodes[1].firstChild.style.width = "";

};
FileProgress.prototype.setStatus = function (status) {
	//this.fileProgressElement.childNodes[2].innerHTML = status;
};

FileProgress.prototype.toggleCancel = function (show, swfuploadInstance) {
	//this.fileProgressElement.childNodes[3].style.visibility = show ? "visible" : "hidden";
	document.getElementById('picture_progress_panel_wrapper').style.visibility = show ? "visible" : "hidden";
	//console.log(show);
	if (swfuploadInstance) {
		var fileID = this.fileProgressID;
		this.fileProgressElement.lastChild.firstChild.onclick = function () {
			//console.dir(swfuploadInstance);
			
			//swfuploadInstance.cancelUpload(fileID); // 此处fileID参数有误，不能正常取消，设置为空值，默认取消序列中的第一个元素。
			swfuploadInstance.cancelUpload();
			return false;
		};
	}
};
        

			        	
        var upload_index = new SWFUpload({
            // Backend Settings
            upload_url: "http://upload.pp.sohu.com/sentenceUpload.do",
            //post_params: {"token": "E1sEOjHk_iRUJw526yiExu7BC5rMAGGV_V7m1qn-X0T2CM2qDX0TNH7opIPq8pLwW9f-3KKz6liDARawMwx6Rx1qcdOQfR9q", "watermark": true},
			//file_post_name : "Filedata",
            
            // File Upload Settings
            file_size_limit : "10 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png;*.bmp;*.tiff",
            file_types_description : "图片文件",
            file_upload_limit : "0",

            // Event Handler Settings - these functions as defined in Handlers.js
            //  The handlers are not part of SWFUpload but are part of my website and control how
            //  my website reacts to the SWFUpload events.
            file_queue_error_handler : fileQueueError,
            file_dialog_complete_handler : fileDialogComplete,
            upload_progress_handler : uploadProgress,
            upload_error_handler : uploadError,
            upload_success_handler : uploadSuccess,
            upload_complete_handler : uploadComplete,

            // Button Settings
            button_image_url : "http://s3.suc.itc.cn/d/nil.gif", // http://js6.pp.sohu.com.cn/i/default/my/img/icon_picture_upload_w45.gif
            button_placeholder_id : "picture_panel_holder",
            button_width: 50,
            button_height: 18,
            button_text : '',
            button_text_style : '',
            button_text_top_padding: 0,
            button_text_left_padding: 0,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,
            button_disabled : false,
            
            
            // Flash Settings
            flash_url : "http://i.sohu.com/asset/swfupload.swf?" + (+new Date),

            custom_settings : {
                upload_target : "picture_progress_panel"
            },
            
            // Debug Settings
            debug: false
        });

 		$('#picture_upload_destroy').click(destroyImage);
 		
 	}
 	// 没有FlashPlayer插件
 	else{
 		$('#picture_panel_handle').click(function(e){
			var wrapper = $('#picture_swfobject_panel_wrapper');
			wrapper.show().bind('click', function(){
				wrapper.hide();
			});
 		});
	}
}
 
	});
})(jQuery);
