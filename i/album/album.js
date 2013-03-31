/**
* UploadPicture.js 
* 功能：i.sohu.com/album 图片上传
* 修改：2011-12-30 重构
*/

;(function($,sohu){
	//成长教学提示
	var popover,
		first = false,
		fired = false;

	var uploadPicture = {
	
		Token:null,
		UserID:null,
		QueueLimit:0,
		Queue:0,
		Info:[],
		Switch:true,
		
		init:function(){
			var _this = this;
			
			//初始化
			_this.initUploadPopup();
		
			if($("#swfuploadmmx").length>0){
				_this.initSWFUpload();//这里第一次初始化
			}
		},
		
		
		//打开展开上传控件
		initUploadPopup:function(){
			var _this = this;
			
			//方案1，点击展开
			$("#chooesuploadbtn").die("click").live("click",function(){ 
				$(this).parent().slideUp(300); 
				_this.OpenUploadPopupAction(); 
			});
			
			//方案2，自动展开
			//从其他页面点击上传照片跳转过来的，from=show的，直接展开
			setTimeout(function(){
				var URL = window.location.href;		
				if(URL.match('from=show')){
					_this.OpenUploadPopupAction(); 
				}
				//成长教学tooltips
				if(!first){
					sohu.guid.exec(function(id){
						var wrap = $('#uploadchoosearea'),
							refer = $('#swfuploadmmx');
						if(id == 8){//id为字符串类型
							popover = new sohu.guid.Popover({
								css: {
						            height:'18px',
						            width:'160px'
								},
								fix: {
									left: 128,
									top: 60
								},
								text: '点击这里，上传一些图片吧！',
								wrap: wrap,
								refer: refer
							});
						}
					});
				}
			},500);
		},
		//展开上传控件的动作
		OpenUploadPopupAction:function(){
			var _this = this;
			var NameSpace = ".uploadPicture";
			
			//*【2012-3-28----2012-4-6 一个礼拜的需求，用户水印设置引导】
			var xpt = $space_config._xpt;
			var isKnowWatermark = $.cookie('isKnow_' + xpt); 
			
			if(isKnowWatermark  ==  null){
			
				setTimeout(function(){
					var pointLocal = $('#publishuploadphoto').offset();
					
					if($('#WatermarkNotice').length  == 0 ){
					
						var watermarkHTML = [];
						watermarkHTML.push('<div id="WatermarkNotice" class="album-watermark-tip" style="z-index:120; position:absolute; top:' +(Math.floor(pointLocal.top) - 125) + 'px;left:' + (Math.floor(pointLocal.left) - 10) + 'px;">');
						watermarkHTML.push('<p>现在上传图片可以加水印了哦，快去试试效果吧！ 还可以设置更多水印效果哦~~</p>');
						watermarkHTML.push('<div class="btn-enter"><a class="btn" id="iSettingWatermark" target="_blank" href="http://i.sohu.com/setting/home/content.htm"></a> <a href="javascript:;" id="iKnowWatermark" class="close">我知道了</a></div>');
						watermarkHTML.push('</div>');
						
						
						$('body').append(watermarkHTML.join(''));
						
					}else{
						$('#WatermarkNotice').css({"top":(Math.floor(pointLocal.top) - 125) +"px","left": (Math.floor(pointLocal.left) - 10)  + "px"});
					}
					
					//$.cookie('isKnow_' + escape(xpt), '1', {"expires": 7, "p                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               ath":"/", "domain":"*.sohu.com" });  
					$('#iKnowWatermark').bind('click',function(){
						$('#WatermarkNotice').remove(); 
						$.cookie('isKnow_' + xpt,'1',{expires:30,path:'/',domain: 'sohu.com'}); 
					}); 
					
					//窗口缩放，调整提示位置
					$(window).bind('resize',function(){
						if($('#WatermarkNotice').length > 0 ){
							var pointLocal = $('#publishuploadphoto').offset();
							$('#WatermarkNotice').css({"top":(Math.floor(pointLocal.top) - 125)+"px" ,"left":(Math.floor(pointLocal.left) - 10)+"px"});
						}
					});
					
					$('#iSettingWatermark').bind('click',function(){
						$('#WatermarkNotice').remove(); 
						//$.cookie('isKnow_' + xpt,'1',{expires:7,path:'/',domain: 'sohu.com'});
					}); 
					
					
				},1200);
			}
			//【2012-3-28----2012-4-6 一个礼拜的需求，用户水印设置引导 - end】
			//*/
			
			
		
			
			//初次打开的时候，给selectedalbum加挂数据标记 给albumaction.js 里的createAlbum方法使用
			$("#selectedalbum").data("Show","Yes");
			
			$("#uploadchoosearea").slideDown(300,function(){
				//火狐浏览器展开完成后初始化flash
				if ($.browser.mozilla) {
					_this.initSWFUpload();
				}
				
			});	

			//取消上传
			$(".closeuploadarea").die('click' + NameSpace).live("click" + NameSpace,function(){
				if(_this.Info.length > 0){
					$.confirm({ 
						icon: "icon-question",
						content: "您还没有发布图片，确定要离开吗？",
						labConfirm: "确认",
						labCancel: "取消",
						onConfirm: function($dialog) { 
							//关闭成长教学提示
							if(popover){
								popover.close();
							}
							
							_this.Info = [];
							$("#swfuploadmmx").prevAll().remove();
							
							$("#chooesupload").slideDown(300);
							$("#uploadchoosearea").slideUp(300);
							_this.Queue = 0;
							return;
						},
						onCancel: function($dialog) {
						
							if ($('#WatermarkNotice').length > 0){
								$('#WatermarkNotice').remove(); 
							}
							return;
						}
					}); 
				}else{
					//关闭成长教学提示
					if(popover){
						popover.close();
					}
					
					$("#chooesupload").slideDown(300);
					$("#uploadchoosearea").slideUp(300);
					_this.Queue = 0;
			
					if ($('#WatermarkNotice').length > 0){
						$('#WatermarkNotice').remove(); 
					}
							
					return;
				}
			});
			
			//选择上传到哪个专辑的事件
			$("#selectedalbum").unbind('change' + NameSpace).bind("change" + NameSpace,function(){
				var AlbumID = $("#selectedalbum option:selected").val(); 
				$("#selectedalbum").data("AlbumID",AlbumID);					
			});
			
			//发布图片，上传图片 publishuploadphoto 绑定事件
			$("#publishuploadphoto").bind("click" + NameSpace,function(){
				//关闭成长教学提示
				if(first){//确定关闭的不是添加图片提示，而是创建专辑提示
					if(popover){
						popover.close();
					}
				}
				
				if(_this.Info.length < _this.Queue){
					$.sentenceNotice({
						type: 'notice',
						delay: 2000,
						icon: 'error',
						content: '图片还没有上传完成，请稍候提交发布'
					}); 
				}else if(_this.Queue == 0){ 
					$.sentenceNotice({
						type: 'notice',
						delay: 2000,
						icon: 'error',
						content: '请选择您要上传的图片'
					});
				}else if($(".upload_error_delete").length > 0){
					$.sentenceNotice({
						type: 'notice',
						delay: 2000,
						icon: 'error',
						content: '请删除上传失败的图片'
					});
				}else{
					//发布照片，开始上传
					if(_this.Switch){
						_this.Switch = false;
						_this.PublishUploadPicture();
					}
				}
			});	
			
			//点击创建新专辑关闭tooltips提示
			$('#createnewalbum').click(function(){
				if(first){//确定关闭的不是添加图片提示，而是创建专辑提示
					if(popover){
						popover.close();
					}
				}
			});
			
			//关闭上传图片面板
			$('#uploadchoosearea a.close').click(function(){
				if(popover){
					if ($('#WatermarkNotice').length > 0){
						$('#WatermarkNotice').remove(); 
					}
					popover.close();
				}
			});
			
			//初次打开的时候，获取页面当前的val				
			var AlbumID = $("#selectedalbum option:selected").val(); 
			$("#selectedalbum").data("AlbumID",AlbumID);
			
		},
		
		//初始化SWFUpload
		initSWFUpload:function(){
			var _this = this;
			
			if(window.swfobject && swfobject.getFlashPlayerVersion().major == 0){
				//没有安装flash
				if(!$('.photo-upload-item-add-flash-tip').length ){
					var fTip = '<div class="photo-upload-item-add-flash-tip">'+
									'<div class="flash-icon"><a  href="#"><img src="http://s3.suc.itc.cn/i/home/d/flash-ico.jpg" /></a></div>'+
									'<div class="flash-txt"><a  href="http://get.adobe.com/cn/flashplayer/">没有安装Flash，点击下载>></a></div>'
								'</div>';
					$("#swfuploadmmx").html(fTip);
				}
				return;
			}
			
		
			//为了可以重复初始化，这里每次填充占位元素
			$('#swfuploadmmx').html('<div class="photo-upload-add" id="uploadphotobtn" style="display:none"></div>');
			
			
			//swfu
			var swfu = new SWFUpload({
					
				debug: false,
				upload_url:  "http://upload.pp.sohu.com/suc/swfUpload.do?_input_encode=UTF-8&_output_encode=UTF-8",   
				
				post_params: {"TIMESTAMP":(new Date).getTime()},

				// File Upload Settings
				file_size_limit : "10 MB",	// 2MB5MBle MLGBD
				file_types : "*.jpg;*.jpeg;*.gif;*.png;*.bmp;*.tiff",
				file_types_description : "图片文件",

				file_upload_limit:0,
				file_queue_limit:0,
				prevent_swf_caching : false,
				preserve_relative_urls : false,

				swfupload_preload_handler : function(){ 
				
				},  
				file_dialog_start_handler : function(){    
					//关闭成长教学上传图片提示
					if(!first){//确定关闭的是添加图片提示
						if(popover){
							popover.close();
						}
						first = true;
					}
					
					var that = this;
					
					$.ajax({
					
						url:'/a/album/upload/gettoken.do',
						type:'POST',
						data:{},
						success:function(result){
							 
							var json = $.parseJSON(result);
							if(!json.code){ 
								_this.Token = json.data.token; 																
							}else{
								alert("file_dialog_complete_handler ERROR"); 
							} 
						} 
					});
										
				}, 
				
				file_queue_error_handler : function(file, errorCode, message){
				
					//console.log("file.name :>>>"+file.name + "___errorCode:>>>" + errorCode + "___message:>>>" + message);
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
								$.sentenceNotice({
									type: 'notice',
									delay: 1000,
									icon: 'error',
									content: '图片文件太小，请检查图片属性。'
								});
								break;
							case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
								$.sentenceNotice({
									type: 'notice',
									delay: 1000,
									icon: 'error',
									content: '图片过大，请选择小于10M的图片。'
								});
								break;
							case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
								$.sentenceNotice({
									type: 'notice',
									delay: 1000,
									icon: 'error',
									content: '该文件不是支持的格式，请检查。'
								});
								break;
							default:
								$.sentenceNotice({
									type: 'notice',
									delay: 1000,
									icon: 'error',
									content: '让服务器再飞一会儿，请稍后再试。'
								});
								break;
						}
					} catch (ex) {
						this.debug(ex);
					}
				
				}, 

				swfupload_load_failed_handler : function(){
				},
				
				//上传开始之前的句柄，设置上传文件名 escape() 编码
				upload_start_handler:function(file){
					//console.log(file.name +"___"+ escape(file.name));
					file.name = escape(file.name);
				},
				
				file_dialog_complete_handler : function(selectNum, queueNum, totalNum){
					swfu.setPostParams({"token":_this.Token});
					swfu.startUpload();
					
					_this.Queue += queueNum;
				},
				
				file_queued_handler :  function(file){
					//当选择好文件，文件选择对话框关闭消失时，如果选择的文件成功加入待上传队列，
					//那么针对每个成功加入的文件都会触发一次该事件（N个文件成功加入队列，就触发N次此事件）。
				
					//alert("album.photoqueue _"+album.photoqueue);
					/*// 放开 一次最多上传60张图片，超出部分请下次上传 的限制
					if(album.photoqueue < 60){
						album.photoqueue += 1;
						
					}else{
						
						$.sentenceNotice({
							type: 'notice',
							delay: 2000,
							icon: 'error',
							content: '一次最多上传60张图片，超出部分请下次上传'
						}); 
						
						return;
					}
					//*/ 
				}, 
				
				
				//upload_progress_handler : uploadProgress,
				upload_progress_handler : function(file, complete, total){
					
					var uploadprogress = (((complete/total)*100)+'').substr(0,2);
					
					if($("#photosize_" + $.md5(file.name)).length == 0){
						var htmlstr = 	'<div id="photosize_' + $.md5(file.name) + '" class="photo-upload-item photo-upload-failure photo-uploading">'+
											'<div class="photo-pic">'+
												'<strong>' + file.name + '</strong>'+
												'<em id="uploadprogresstxt_' + $.md5(file.name) + '">正在上传...</em>'+
												'<a id="upload_error_delete_id_' + $.md5(file.name) + '" class="delete upload_error_delete" href="javascript:;"></a>'+
												'<div class="mask-text">上传进度 <span id="uploadprogress_'+ $.md5(file.name) +'">' + uploadprogress + '</span> % </div>'+
												'<div class="mask"></div>'+
												'</div>'+
											'<p><input type="text" value="点击添加描述" name="" id="addDescription" class="photo_upload_item_description"></p>'+
										'</div>';
											
						$("#swfuploadmmx").before(htmlstr);
					}else{
						
						if(uploadprogress != '10'){ 
							$("#uploadprogress_" + $.md5(file.name)).text(uploadprogress);
						}else{ 
							$("#uploadprogress_" + $.md5(file.name)).text(100);
							$("#uploadprogresstxt_" + $.md5(file.name)).html('上传完成...');
						}
					}
				},
								
				upload_error_handler : function(file, code, message){
					//uploadError(file object, error code, message)
					//无论什么时候，只要上传被终止或者没有成功完成，那么uploadError事件都将被触发。
					//error code参数表示了当前错误的类型，更具体的错误类型可以参见SWFUpload.UPLOAD_ERROR中的定义。3
					//Message参数表示的是错误的描述。File参数表示的是上传失败的文件对象。
					
					if(code == -200 || code == -210 || code == -220 || code == -230 || code == -240 || code == -250 || code == -260){
					
						if($("#photosize_" + $.md5(file.name)).length > 0){
							$("#uploadprogress_" + $.md5(file.name)).text( 0 );
							$("#uploadprogresstxt_" + $.md5(file.name)).html('上传失败，请删除...');
						}
						$("#upload_error_delete_id_"+$.md5(file.name)).click(function(){
							$("#photosize_"+$.md5(file.name)).remove();
							_this.Queue -= 1;
						});
					}					
				},
				
				upload_success_handler :  function(file, data, response){
				
					var json = $.parseJSON(data);
					if(!json.code){
							 var image = json.data.image;
							 var photoid = json.data.key;
							 var userid = json.data.userId;
							 var photoname = json.data.name;
							 
							 //把图片添加到网页中
							 _this.InsertPictureToArea({"filesize":file.size,"image":image,"photoid":photoid,"photoname":photoname,"userid":userid});
							 
							 _this.InfoManager.InsertToInfo({"id":photoid,"op":"","desc":""}); 
							 
							 //上传完一张图片，显示tooltips之后不再显示
							if(!fired){
								sohu.guid.exec(function(id){
									var refer = $('#createnewalbum');
										
									if(id == 8){//id为字符串类型
										popover = new sohu.guid.Popover({
											css: {
									            height:'36px',
									            width:'160px'
											},
											fix: {
												left: 45,
												top: 26
											},
											text: '想把图片上传到默认专辑，还是创建一个新专辑哪！',
											dir: 't',
											refer: refer
										});
										//修改tooltips箭头指向
										fired = true;
									}
								});
							}
					}else{
						if($("#photosize_" + $.md5(file.name)).length > 0){
							$("#uploadprogress_" + $.md5(file.name)).text( 0 );
							$("#uploadprogresstxt_" + $.md5(file.name)).html('上传失败，请删除...');
						}
						
						$("#upload_error_delete_id_"+$.md5(file.name)).click(function(){
							$("#photosize_"+$.md5(file.name)).remove();
							_this.Queue -= 1;
						});
						
					}
				},
				
				//upload_complete_handler : uploadComplete,
				upload_complete_handler : function(file){
						
				},
		 

				// Button Settings
				button_image_url : "http://s3.suc.itc.cn/i/album/d/ico4.gif", 
				button_placeholder_id : "uploadphotobtn",
				button_width:  114,
				button_height: 114,
				button_text : '',
				button_text_style : '',
				button_text_top_padding: 0,
				button_text_left_padding: 0,
				button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
				button_cursor: SWFUpload.CURSOR.HAND,
				
				flash_url : "http://i.sohu.com/asset/swfupload.swf",

				custom_settings : {
				} 
			});
			
		
		},
		
		//把上传图片填充到显示区域
		InsertPictureToArea:function(obj){
			var _this = this;
		
			var HtmlString = [];
				HtmlString.push('<div id="uploadwaiting_' + obj.photoid + '" class="photo-upload-item">');
				HtmlString.push('<div class="photo-pic">');
				HtmlString.push('<strong>' + obj.photoname + '</strong>');
				HtmlString.push('<em>等待上传</em>');
				HtmlString.push('<a id="delete_'+ obj.photoid +'" class="delete" href="javascript:;"></a>');
				HtmlString.push('<div style="display:none;" class="mask-text"><a id="rotate_left" href="javascript:;">左旋转</a> <a id="rotate_right" href="javascript:;">右旋转</a></div>');
				HtmlString.push('<div style="display:none;" class="mask"></div>');
				HtmlString.push('<a  href="javascript:;"><img width="120" height="120" border="0" alt="" src="' + obj.image + '"></a></div>');
				HtmlString.push('<p><input type="text" maxlength="200" value="点击添加描述" id="addDescription_'+obj.photoid +'" class="photo_upload_item_description"></p>');
				HtmlString.push('</div>');
			
			$("#photosize_" + $.md5(obj.photoname)).remove();
			
			$("#swfuploadmmx").before(HtmlString.join(''));
			
			//鼠标移动上去后出现编辑和删除的操作
			$(".photo-upload-item").bind("mouseenter",function(){
				$(this).addClass("photo-upload-hover");
			}).bind("mouseleave",function(){
				$(this).removeClass("photo-upload-hover");
			}); 
			
			//点击添加描述的点击事件
			$("#addDescription_"+obj.photoid).bind("focusin",function(){
				var txt = $(this).val();
				if(txt == '点击添加描述' || $.trim(txt).length == 0){
					$("#addDescription_"+obj.photoid).val('').css({"color":"#666666"});
				} 
			}).bind("focusout",function(){
				var txt = $(this).val();
				if(txt == '点击添加描述' || $.trim(txt).length == 0){
					$("#addDescription_"+obj.photoid).val('点击添加描述').css({"color":"#CCCCCC"});
					
					_this.InfoManager.AddDescToInfo(obj.photoid,'');
				}else{
					//当用户添加了描述后，把描述信息写入到album.info 里面去
					_this.InfoManager.AddDescToInfo(obj.photoid,$("#addDescription_" + obj.photoid).val());
				} 
			}); 
			
			//在上传阶段删除一张照片的操作
			$("#delete_"+obj.photoid).bind("click",function(){
				var id= $(this).attr("id").substr(7);  
				//当用户添加了描述后，把描述信息从album.info 里面删除出去
				_this.InfoManager.DeleteFromInfo(obj.photoid); 
				_this.Queue -= 1;
			}); 
			
			
			//配合2012-3-28号的水印提示的代码，有设置水印提示时，上传多张图片，发布台向下延伸，提示会错位。
			//http://jira.nrcp.sohu.com/browse/SUC-4603
			if($('#WatermarkNotice').length > 0 ){
				var pointLocal = $('#publishuploadphoto').offset();
				$('#WatermarkNotice').css({"top":(Math.floor(pointLocal.top) - 125)+"px" ,"left":(Math.floor(pointLocal.left) - 10)+"px"});
			}
			
		
		},

		//当超过500张的时候
		ReplayPublishPicture:function(){
			var _this = this;
			var ReplayNameSpace = ".Replay";
			$("#publishuploadphoto").bind("click" + ReplayNameSpace,function(){
				//发布照片，开始上传
				if(_this.Switch){
					_this.Switch = false;
					_this.PublishUploadPicture();
				}
			});
		},
		
		//发布上传图片
		PublishUploadPicture:function(){
			var _this = this;
			var parameter = ''; 
			$.each(_this.Info,function(i,n){
				parameter += '{"key":"' + n.id + '","op":"' + n.op + '","desc":"'+ (n.desc+'').replace(/[\\"]/g, '\\$&').replace(/\u0000/g, '\\0') +'"},'; 
			});
			
			var albumID = $("#selectedalbum").data("AlbumID");
			
			$.ajax({
				url:'/a/album/upload/saveimage.do?_input_encode=UTF-8&_output_encode=UTF-8',
				type:'POST',
				data:{"photosetid": albumID  ,"files": _this.Info.length ,"data":"["+parameter.substr(0,(parameter.length-1)) + "]"}, 
				success:function(result){
					var json = $.parseJSON(result);
					if(!json.code){
						$.sentenceNotice({
							type: 'notice',
							delay: 2000,
							icon: 'success',
							content: decodeURI(json.msg)
						});
						
						setTimeout(function(){ 
							window.location.href = json.data.url; 
						},1000);
					}else{
						setTimeout(function(){
							$.sentenceNotice({
								type: 'notice',
								delay: 2000,
								icon: 'error',
								content: json.msg
							});
							
							//发布照片，开始上传
							_this.Switch = true;
							_this.ReplayPublishPicture();
							
						},2000);
					}
				},
				error:function(){
					$.sentenceNotice({
						type: 'notice',
						delay: 1000,
						icon: 'error',
						content: "服务器出错！请稍后重试"
					});
				}
			});
			
		},
		
		//上传的照片的INfo管理
		InfoManager:{
			//把信息插入INFO
			InsertToInfo:function(opt){ 
				uploadPicture.Info.push(opt); 
				
			},
			
			//从INFO中删除信息
			DeleteFromInfo:function(id){
				$.each(uploadPicture.Info,function(i,n){
					if(n.id == id){
						n.op = 'delete';
					}
				});	
				
				$("#uploadwaiting_"+id).fadeOut(500,function(){
					$(this).remove();
				});
					
			},
			
			//把描述信息添加到页面元素里去 .addDescToInfo(id,desc);
			AddDescToInfo:function(id,desc){
				$.each(uploadPicture.Info,function(i,n){
					if(n.id == id){
						n.desc = desc;
					}
				});
			} 			
		}
	}
	
	
	$(document).ready(function(){
		uploadPicture.init();
	});
	
})(jQuery,mysohu);
