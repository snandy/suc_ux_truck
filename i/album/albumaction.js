
/**
* mysohu.项目.相册模块.action动作.AlbumAction 相关的
* 2011-12-19 15:36 分机:6224
*/
;(function($,mysohu){

	//AlbumAction 相册的事件
	var AlbumAction = {
		AlbumDialogPopup:{},
		
		init:function(action,parameters){
			if(action == 'setAlbumCover'){
				this.setAlbumCoverByPhotoId(parameters.AlbumID,parameters.PhotoID);
			}else if(action == 'deletePhoto'){
				this.deletePhotoById(parameters.AlbumID,parameters.PhotoID,parameters.TypeID);
			}else if(action == 'editPhotoDesc'){
				this.editPhotoDescription(parameters.AlbumID,parameters.PhotoID);
			}else if(action == 'editAlbum'){
				this.editAlbum(parameters.AlbumID,parameters.AlbumPrivilege);
			}else if(action == 'deleteAlbum'){
				this.deleteAlbum(parameters.AlbumID);
			}else if(action == 'createAlbum'){
				this.createAlbum(parameters.AlbumID);
			}else if(action == 'validatePassword'){
				this.validatePassword(parameters.AlbumID,parameters.UserID);
			}
		
		},
		
		//验证访问加密相册的密码 validatePassword
		validatePassword:function(AlbumID,UserID){
			var HtmlString = [];
			
			HtmlString.push('<div style="width:305px;" class="dialog-ablum-box">');
			HtmlString.push('<div class="dialog-ablum-form-box dialog-ablum-form-box2 clearfix">');
			HtmlString.push('<ul>');
			HtmlString.push('<li class="rows clearfix">');
			HtmlString.push('<h3>此专辑设置了访问密码</h3>');
			HtmlString.push('</li>');
			HtmlString.push('<li class="rows clearfix">');
			HtmlString.push('<span class="title">请输入6位密码</span>');
			HtmlString.push('<span class="form-box"><input id="passwordinput" maxlength="6"  value="" type="password" style="width:166px" class="form-input"></span>');
			HtmlString.push('</li>');
			HtmlString.push('</ul>');
			HtmlString.push('</div>');
			HtmlString.push('</div>');
					
			$.dialog({
				className: '',
				btns: ['accept', 'cancel'],
				labAccept: '确定',
				labCancel: '取消',
				title: '验证密码',
				content: HtmlString.join(''),
				fixed: true,
				modal: true,
				scrollIntoView: true,
				onBeforeAccept: function(){
					var Password = $("#passwordinput").val(); 
					if(/^\d{6}$/.test(Password)){
						$.ajax({
							url:'/a/album/photoset/checkpass.do',
							type:'POST',
							data:{"userid":UserID,"photosetid":AlbumID,"privilegekey":Password},
							success:function(result){
								var json = $.parseJSON(result);
								if(!json.code){		
									$.sentenceNotice({
										type: 'notice',
										delay: 500,
										icon: 'success',
										content: json.msg
									});	 
									setTimeout(function(){ 
										window.location.href = json.data.url;
									},500); 
								}else{	
									$.sentenceNotice({
										type: 'notice',
										delay: 1000,
										icon: 'error',
										content: json.msg
									});	
									$("#passwordinput").val('').focus(); 
									return false;
								}  
							}
						}); 
						return false;
					}else{
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'error',
							content: '请输入6位数字密码'
						});	
						$("#passwordinput").val('').focus(); 
						return false;
					}
				}
			}); 
			$("#passwordinput").focus(); 
		},
		

		//创建专辑
		createAlbum:function(){
			var _this = this;
			var privilege = 0;
			var DialogHtml = [];
			DialogHtml.push('<div class=""><div style="width:463px;" class="dialog-ablum-box">');
			DialogHtml.push('<div class="dialog-ablum-form-box clearfix"><ul>');
			DialogHtml.push('<li class="rows clearfix">');
			DialogHtml.push('<span class="title">专辑名称</span>');
			DialogHtml.push('<span class="form-box"><input maxlength="40" id="albumname" type="text" class="form-input"></span>');
			DialogHtml.push('</li>');
			DialogHtml.push('<li class="rows clearfix">');
			DialogHtml.push('<span class="title">描述</span>');
			DialogHtml.push('<span class="form-box"><textarea id="albumdescription" maxlength="300" style="height:35px" class="form-input"></textarea></span>');
			DialogHtml.push('</li>');
			DialogHtml.push('<li class="rows clearfix">');
			DialogHtml.push('<span class="title title1">隐私设置</span>');
			DialogHtml.push('<span class="form-box"><select id="albumprivacy" class="form-select">');
			DialogHtml.push('<option value="0">所有人都可以浏览</option>');
			DialogHtml.push('<option value="2">只有本人可以浏览</option>');
			DialogHtml.push('<option value="1">需要密码进行浏览</option>');
			DialogHtml.push('</select></span></li>');
			DialogHtml.push('<li id="albumpassword" class="rows clearfix">');
			DialogHtml.push('<span class="title">请输入6位密码</span>');
			DialogHtml.push('<span class="form-box"><input id="albumpasswordinput" type="password" class="form-input"></span>');
			DialogHtml.push('</li>');
			DialogHtml.push('<li id="albumpasswordagain" class="rows clearfix">');
			DialogHtml.push('<span class="title">再次输入密码</span>');
			DialogHtml.push('<span class="form-box"><input id="albumpasswordagaininput" type="password" class="form-input"></span>');
			DialogHtml.push('</li></ul></div></div></div>');
			
			$("#albumpassword").hide();
			$("#albumpasswordagain").hide();
			
			AlbumDialogPopup = $.dialog({
				className: '',
				btns: ['accept', 'cancel'],
				labAccept: '创建',
				labCancel: '取消',
				title: '创建专辑',
				content: DialogHtml.join(''),
				fixed: true,
				modal: true,
				scrollIntoView: true,
				onBeforeAccept: function(){
					var albumname = $("#albumname").val();
					var albumdescription = $("#albumdescription").val().replace(/([^>])\n/g, "$1\n");
					var albumpassword = $("#albumpasswordinput").val();
					var albumpasswordagaininput = $("#albumpasswordagaininput").val();
					
					//专辑名称检测
					if(/^\s*$/.test(albumname)){ 
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'error',
							content: '专辑名称不能为空'
						}); 
						$("#albumname").val('').focus();
						return false;
					}else if(albumname.replace(/[^\x00-\xff]/g,"aa").length > 40){
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'error',
							content: '专辑名称长度不能超过40字符'
						});
						$("#albumname").focus();
						return false;
					}
					
					//专辑描述的检测
					if(albumdescription.replace(/[^\x00-\xff]/g,"aa").length > 400){
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'error',
							content: '专辑描述长度不能超过400字符'
						});
						$("#albumdescription").focus();
						return false;
					}
					
					if(privilege == 1){
						if(!/^\d{6}$/.test(albumpassword)){					
							$.sentenceNotice({
								type: 'notice',
								delay: 1000,
								icon: 'error',
								content: '请输入6位数字密码'
							});
							return false;
						}else if(albumpassword != albumpasswordagaininput){		
							$.sentenceNotice({
								type: 'notice',
								delay: 1000,
								icon: 'error',
								content: '您两次输入的密码不匹配。'
							});
							return false;
						}else{
							var obj = {"name":albumname,"desc":albumdescription,"privilege":privilege,"privilegekey":albumpassword};
							_this.createAlbumAction(obj);
							return false;
						} 
					
					}else{
						var obj = {"name":albumname,"desc":albumdescription,"privilege":privilege,"privilegekey":albumpassword};
						_this.createAlbumAction(obj);
						return false;
					}
				}
			});
			
			$("#albumname").focus();
			$("#albumpassword").hide();
			$("#albumpasswordagain").hide();
		
			$("#albumprivacy").live("change",function(){
				privilege = $("#albumprivacy option:selected").val();
				if(privilege == '1'){
					$("#albumpassword").show();						
					$("#albumpasswordagain").show(); 
				}else{												
					$("#albumpassword").hide();
					$("#albumpasswordagain").hide(); 
				}
				AlbumDialogPopup.adjust();					
			});
			AlbumDialogPopup.adjust();	
		},
		
		//创建专辑的Action parameters
		createAlbumAction:function(obj){
			$.ajax({
				url:'/a/album/addphotoset.do?_input_encode=UTF-8&_output_encode=UTF-8',
				data:obj,
				type:'POST',
				success:function(result){
					var json = $.parseJSON(result);
					if(!json.code){						
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'success',
							content: json.msg
						});
						
					
						setTimeout(function(){
							var isShow = $("#selectedalbum").data("Show");
							//如果这个相册上传窗口是展开的，那么
							//把这个新建的专辑插入到select选中的里面去，并且更新全局的albumid
							if(isShow == "Yes"){
								$("#selectedalbum").prepend('<option value="'+json.data.id+'">'+json.data.name+'</option>');
								$("#selectedalbum").val(json.data.id);
										
								//把新建的专辑的id、设置为albumid
								$("#selectedalbum").data("AlbumID",json.data.id);
							}else{
								window.location.href = window.location.href;
							}
						},800);
						
			
						
						AlbumDialogPopup.close();
						
					}else{					
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'error',
							content: json.msg
						});	
						return false;
					}						
				}
			});
		},
		
		//编辑专辑信息
		editAlbum:function(AlbumID,AlbumPrivilege){
			
			var _this = this;
			var newAlbumPrivilege;			
			$.ajax({
				url:'/a/album/photosetdetail.do',
				data:{"photosetid":AlbumID},
				type:'POST',
				success:function(result){
					var json = $.parseJSON(result);				
					var password=json.password;
					var privilege=json.data.privilege;
					newAlbumPrivilege = privilege;
											
					var selectedstr = '';
					
					var password ='' 
					if(json.data.privilege == 1){
						password = json.data.password;//undefined
					};
					var pswdisplay = (privilege == 1) ? 'display:block' : 'display:none';
					
					if(privilege == 0){
						selectedstr = '<option value="0" selected="selected">所有人都可以浏览</option><option value="2">只有本人可以浏览</option><option value="1">需要密码进行浏览</option>';
					}else if(privilege == 1){
						selectedstr = '<option value="0">所有人都可以浏览</option><option value="2">只有本人可以浏览</option><option  selected="selected" value="1">需要密码进行浏览</option>';
					}else if(privilege == 2){
						selectedstr = '<option value="0">所有人都可以浏览</option><option  selected="selected" value="2">只有本人可以浏览</option><option value="1">需要密码进行浏览</option>';
					}
					
					if(!json.code){				
						var HtmlString = [];
						HtmlString.push('<div style="width:463px;" class="dialog-ablum-box">');
						HtmlString.push('<div class="dialog-ablum-form-box dialog-ablum-form-box1 clearfix">');
						HtmlString.push('<a  href="javascript:;"><img border="0" alt="" class="ablum-t" src="' + json.data.cover + '"></a>');
						HtmlString.push('<ul>');
						HtmlString.push('<li class="rows clearfix">');
						HtmlString.push('<span class="title">专辑名称</span>');
						HtmlString.push('<span class="form-box"><input id="editalbumname" maxlength="40" type="text" value="' + json.data.name + '" class="form-input"></span>');
						HtmlString.push('</li>');
						HtmlString.push('<li class="rows clearfix">');
						HtmlString.push('<span class="title">描述</span>');
						HtmlString.push('<span class="form-box"><textarea id="editalbumdesc"  maxlength="300"  style="height:35px" class="form-input">' + json.data.desc + '</textarea></span>');
						HtmlString.push('</li>');
						HtmlString.push('<li class="rows clearfix">');
						HtmlString.push('<span class="title title1">隐私设置</span>');
						HtmlString.push('<span class="form-box"><select id="selectedprivilege" class="form-select">'+ selectedstr+ '</select></span>');
						HtmlString.push('</li>');
						HtmlString.push('<li id="pswdisplay" style="'+pswdisplay+'" class="rows clearfix">');
						HtmlString.push('<span class="title">密码</span>');
						HtmlString.push('<span class="form-box"><input id="editalbumpassword" maxlength="6" type="password" value="'+ password +'" class="form-input"></span>');
						HtmlString.push('</li>');
						HtmlString.push('<li class="rows clearfix"  style="'+pswdisplay+'" >');
						HtmlString.push('<span class="title title1"></span>');
						HtmlString.push('<span class="form-box">请输入6位数字密码</span>');
						HtmlString.push('</li>');
						HtmlString.push('</ul>'); 
						HtmlString.push('</div>'); 
						HtmlString.push('</div>');
						var editAlbumDialog = $.dialog({
							className: '',
							btns: ['accept', 'cancel'],
							labAccept: '确定',
							labCancel: '取消',
							title: '编辑专辑',
							content: HtmlString.join(''),
							fixed: true,
							modal: true,
							scrollIntoView: true,
							onBeforeAccept: function(){
								
								//提交修改专辑 
								var editalbumname = $("#editalbumname").val() || "";
								var editalbumdesc = $("#editalbumdesc").val() || "";
								var privilege = newAlbumPrivilege;
								var editalbumpassword = $("#editalbumpassword").val() || "";
									
								if(/^\s*$/.test(editalbumname)){ 
									$.sentenceNotice({
										type: 'notice',
										delay: 1000,
										icon: 'error',
										content: '专辑名称不能为空'
									}); 
									$("#editalbumname").val('').focus();
									return false;
								}else if(editalbumname.replace(/[^\x00-\xff]/g,"aa").length > 40){
									$.sentenceNotice({
										type: 'notice',
										delay: 1000,
										icon: 'error',
										content: '专辑名称长度不能大于40字符'
									});
									$("#editalbumname").focus();
									return false;
								}else if(editalbumdesc.replace(/[^\x00-\xff]/g,"aa").length > 400){
									$.sentenceNotice({
										type: 'notice',
										delay: 1000,
										icon: 'error',
										content: '专辑描述长度不能超过400字符'
									});
									$("#editalbumdesc").focus();
									return false;
								}
								
								if(newAlbumPrivilege == 1){ // !/^\d{6}$/.test(albumpassword)
									if(/^\s*$/.test(editalbumpassword)){
										$.sentenceNotice({
											type: 'notice',
											delay: 1000,
											icon: 'error',
											content: '密码不能为空,请输入6位数字密码'
										}); 
										$("#editalbumpassword").val('').focus();
										return false;
									}else if(!/^\d{6}$/.test(editalbumpassword)){
										$.sentenceNotice({
											type: 'notice',
											delay: 1000,
											icon: 'error',
											content: '请输入6位数字密码'
										}); 
										$("#editalbumpassword").val('').focus();
										return false;										
									}									
								}
								
								var opt = {"id":AlbumID,"name":editalbumname,"desc":editalbumdesc,"privilege":newAlbumPrivilege,"privilegekey":editalbumpassword};
								_this.editAlbumAction(opt);
							}
						});
						
						//绑定隐私设置的选择 selectedprivilege
						
						$("#selectedprivilege").bind("change",function(){
							newAlbumPrivilege = $("#selectedprivilege option:selected").val()
							if(newAlbumPrivilege == 1){
								$("#pswdisplay").show();
								editAlbumDialog.adjust();
							}else{
								$("#pswdisplay").hide();
								editAlbumDialog.adjust();
							}
							
						});	
					
						editAlbumDialog.adjust();
						
					}						
				}			
			});	
			
		},
		
		//提交编辑专辑的动作 editphotoset quickedit
		editAlbumAction:function(opt){
			$.ajax({
				url:'/a/album/editphotoset.do?_input_encode=UTF-8&_output_encode=UTF-8',
				data:opt,
				type:'POST',
				success:function(result){
					var json = $.parseJSON(result);
					if(!json.code){
						//专辑修改成功后，更新专辑显示							
						$("#album_"+opt.id).find("p").find("a").html(json.data.shortname + "(" + json.data.count + ")");
					
						//专辑修改成功后，自动刷新页面	
						setTimeout(function(){
							$.sentenceNotice({
								type: 'notice',
								delay: 800,
								icon: 'success',
								content: json.msg
							});
							
							window.location.reload();
						},800);
												
					}else{
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'error',
							content: json.msg
						});	
						return false;
					}
				}
			});
		
		},
		
		//设置专辑图片为封面
		setAlbumCoverByPhotoId:function(AlbumID,PhotoID){
			var _this = this;
			_this.setAlbumCoverAction(AlbumID,PhotoID,function(CoverURL){
				if($("#backcover").length > 0){
					$("#backcover").attr("src",CoverURL);
				}else if($("#frontcover").length > 0){
					$("#frontcover").attr("src",CoverURL);
				}	
			});
		},
		
		//快速编辑图片描述  editPhotoDescriptionAction
		editPhotoDescription:function(AlbumID,PhotoID){
			var _this = this;
			$("#shortdesclink_"+PhotoID).hide();
			setTimeout(function(){
				$("#desclink_"+PhotoID).show().focus();
			},200);
			
			$("#desclink_"+PhotoID).focusout(function(){
				var Description = $("#desclink_" + PhotoID).val();
				_this.editPhotoDescriptionAction(PhotoID,Description);
			});			
		},
		
		//提交对图片描述的修改
		submitPhotoDescription:function(PhotoID){
			var _this = this;
			$("#desclink_"+PhotoID).focusout();
		
			var Description = $("#desclink_" + PhotoID).val();
			_this.editPhotoDescriptionAction(PhotoID,Description);
			
		},
		
		//根据ID删除专辑内的照片 
		deletePhotoById:function(AlbumID,PhotoID,TypeID){
			var _this = this;
			var tipsText = '确认删除吗？此操作不恢复！';
			if(TypeID == 4){
				tipsText = '删除该图片会导致微博不能正常显示，继续删除？'
			}
			
			$.confirm({ 
				icon: "icon-question",
				content: tipsText,
				labConfirm: "确认",
				labCancel: "取消",
				onConfirm: function($dialog) { 
				
					//删除照片 deletePhotoAction 动作执行
					_this.deletePhotoAction(PhotoID,function(PhotoID,coverurl){
						$("#photobox_"+PhotoID).fadeOut(500);
						
						//如果新的封面地址和原封面地址不同，则以新的替换											
						if(coverurl != null){
							$("#backcover").attr("src",coverurl);
						}
						
						//专辑显示页码的回填
						if($(".total-count").length>0){
							var htmlString =  $(".total-count").html();
							var numlist = htmlString.match(/\d*/g);
							
							var numarray = [];
							$.each(numlist,function(i,n){
								if(n != ''){
									numarray.push(n);
								}
							});
							
							//删完一整页的时候
							if(numarray[0] == numarray[1]){
								var num = window.location.hash.match(/\d+/);
								var index =  parseInt(num, 10) || -1;
								
								if(index == 1){
									//window.location.reload();
								}else{
									window.location.hash = (index - 1);
									setTimeout(function(){
										window.location.reload();
									},500);
								}
								
								$("#PhotoNumTips").html('当前专辑没有图片');
								$("#photoCounter").html('');
								
							}else{
							
								$("#PhotoNumTips").html('当前第'+ numarray[0] +'-'+ (numarray[1] - 1) +'张');
								$("#photoCounter").html('共' + (numarray[2] - 1) + '张图片');
							}
							
						}
					}); 
				}
			}); 
		},
		
		//删除照片的动作
		deletePhotoAction:function(PhotoID,Callback){
			$.ajax({
				url:'/a/album/photo/delete.do',
				type:'POST',
				data:{"photoid":PhotoID},
				success:function(result){ 
					var json = $.parseJSON(result);
					if(!json.code){
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'success',
							content: json.msg
						});
						var CoverURL = (json.data != null) ? json.data.coverUrl : null;
						if(typeof Callback != 'undefined'){
							Callback(PhotoID,CoverURL);
						}
					}else{
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'error',
							content: json.msg
						});
					} 
				},
				error:function(){  } 
			});
		},
		
				
		//把一张图片设为封面   a/album/photo/cover.do  photoManager.setAlbumCover
		setAlbumCoverAction:function(AlbumID,PhotoID,Callback){
			$.ajax({
				url:'/a/album/photo/cover.do',
				type:'POST',
				data:{"photosetid":AlbumID,"coverid":PhotoID},
				success:function(result){ 
					var json = $.parseJSON(result);
					if(!json.code){
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'success',
							content: json.msg
						});
						
						if(typeof Callback != 'undefined'){
							Callback(json.data.coverUrl);
						}
						
					}else{
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'error',
							content: json.msg
						});						
					} 
				},
				error:function(){  } 
			}); 
		},
	
		//快速修改照片描述
		editPhotoDescriptionAction:function(PhotoID,Description){
			var oldDescText = $("#hidelongdesc_"+PhotoID).text();
			if(oldDescText == Description){
				//没有任何修改，显示span，隐藏input
				$("#shortdesclink_"+PhotoID).show();
				$("#desclink_"+PhotoID).hide();
				return;
			}else{
				//修改成功后，显示span，隐藏input
				$("#shortdesclink_"+PhotoID).show().text('正在提交...');
				$("#desclink_"+PhotoID).hide();
			}
			
			$.ajax({
				url:'/a/album/photo/edit.do?_input_encode=UTF-8&_output_encode=UTF-8',
				data:{"photoid":PhotoID,"desc":Description},
				type:'POST',
				success:function(result){
					var json = $.parseJSON(result);
					
					if(!json.code){
						setTimeout(function(){				
							if(!/^\s*$/.test(json.data.desc)){
								$("#shortdesclink_"+PhotoID).html(json.data.shortdesc).css({"color":"#333333","font-style":"normal","background-color":"#fff"});
								$("#hidelongdesc_"+PhotoID).html(json.data.desc);
							}else{
								$("#shortdesclink_"+PhotoID).html('点击添加描述').css({"color":"#333333","background-color":"#fff"});
								$("#hidelongdesc_"+PhotoID).html('');
							}
							//修改成功后，显示span，隐藏input
							$("#shortdesclink_"+PhotoID).show();
							$("#desclink_"+PhotoID).hide();
						
						},600);
					}else{
						setTimeout(function(){
							$.sentenceNotice({
								type: 'notice',
								delay: 1000,
								icon: 'error',
								content: json.msg
							});
						},200);
					}
				}
			});
		},
		
		//删除专辑 deleteAlbum
		deleteAlbum:function(AlbumID){	
			//取专辑的信息，弹窗，用户确认是否删除
			
			$.ajax({
				url:'/a/album/photosetdetail.do',
				data:{"photosetid":AlbumID},
				type:'POST',
				success:function(result){
					var json = $.parseJSON(result);
					var password=json.password;
					var privilege=json.privilege;
					
					var HtmlString = [];
					HtmlString.push('<div class=""><div style="width:463px;" class="dialog-ablum-box">');
					HtmlString.push('<div class="dialog-ablum-form-box dialog-ablum-form-box1 clearfix">');
					HtmlString.push('<a  href="javascript:;"><img border="0" alt="" class="ablum-t" src="' + json.data.cover + '"></a>');
					HtmlString.push('<ul><li class="rows clearfix">');
					HtmlString.push('<p>你确定要删除专辑《'+ json.data.name +'》吗？</p>');
					HtmlString.push('<strong>删除后图片将不可恢复！</strong>');
					HtmlString.push('</li></ul></div></div></div>');

					$.dialog({
						className: '',
						btns: ['accept', 'cancel'],
						labAccept: '确定',
						labCancel: '取消',
						title: '删除专辑',
						content: HtmlString.join(''),
						fixed: true,
						modal: true,
						scrollIntoView: true,
						onBeforeAccept: function(){
							$.ajax({
								url:'/a/album/delphotoset.do',
								data:{"id":AlbumID},
								type:'POST',
								success:function(result){
									var json = $.parseJSON(result);
									if(!json.code){					
										$.sentenceNotice({
											type: 'notice',
											delay: 1000,
											icon: 'success',
											content: json.msg
										});	
										$("#album_"+AlbumID).fadeOut(500);
										
										if($("#albumnum").length >0){
											var albumnum = parseInt($("#albumnum").html()) - 1;
											$("#albumnum").html(albumnum);
										}
										
										window.location.href = 'http://i.sohu.com/album/home/photoset/list/';
										
									}else{				
										$.sentenceNotice({
											type: 'notice',
											delay: 1000,
											icon: 'error',
											content: json.msg
										});										
									}
								}			
							});
						}
					});
				}
			});
		}	
	}
	mysohu.AlbumAction = AlbumAction;
})(jQuery,MYSOHU);



