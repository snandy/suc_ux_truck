/**
* 相册个人展示的代码
* 2011-12-27 从 i/album.js中抽离出来的前台个人展示代码
*/



;(function($,mysohu){


	var albumfront={
		userID:0,
		albumID:0,
		startNum:0,
		photoNum:20,
		pageNum:1,
		photoCount:0,
		beforeData:[],
		afterData:[],
		
		//初始化一些常用的代码
		init:function(){
			this.userID = $("#userID").val();
			this.albumID = $("#albumID").val();
			this.photoCount = $("#photoCount").val();
			this.startNum = 0;
			
			this.initBindEvent();
			
			this.quickModifyAlbum();
			//分页展示隐藏
			$("#photolistpage").hide();
		},		
		
		
		//快速修改专辑名称和专辑描述
		quickModifyAlbum:function(){
			var _this = this;
			
			//专辑名的修改
			$("#AlbumTitle").css({"display":"block"}).bind("mouseenter",function(){
				$("#editAlbumTitleTips").show();
			}).bind("mouseleave",function(){
				$("#editAlbumTitleTips").hide();
			});
			
			var _AlbumName = $("#quickeditTitleInput").val();
			$("#editAlbumTitleTips").bind("click",function(){
				$("#AlbumTitle").hide();
				$("#AlbumTitleEdit").show();
				$("#quickeditTitleInput").show();
				
				$("#saveAlbumTitleTips").unbind("click");
				$("#saveAlbumTitleTips").show().bind("click",function(){
				
					var AlbumName = $("#quickeditTitleInput").val();
					var opt = {"id":_this.albumID,"content":AlbumName,"type":"name"};
					if(_AlbumName != AlbumName){
					
						if(/^\s*$/.test(AlbumName)){ 
							$.sentenceNotice({
								type: 'notice',
								delay: 1000,
								icon: 'error',
								content: '专辑名称不能为空'
							}); 
							$("#quickeditTitleInput").val('').focus();
							return false;
						}else if(AlbumName.replace(/[^\x00-\xff]/g,"aa").length > 40){
							$.sentenceNotice({
								type: 'notice',
								delay: 1000,
								icon: 'error',
								content: '专辑名称长度不能大于40字符'
							});
							$("#quickeditTitleInput").focus();
							return false;
						}else{
							_this.quickModifyAlbumAction(opt);
						}
					}else{
						$("#AlbumTitle").show();
						$("#AlbumTitleEdit").hide();
					}
				
				});
				
				$("#canceAlbumTitleTips").unbind("click");
				$("#canceAlbumTitleTips").show().bind("click",function(){
					$("#AlbumTitle").show();
					$("#AlbumTitleEdit").hide();
				});
			});
			
			
			
			//描述的修改
			$("#AlbumDesc").css({"display":"block"}).bind("mouseenter",function(){
				$("#editAlbumDescribeTips").show();
			}).bind("mouseleave",function(){
				$("#editAlbumDescribeTips").hide();
			});
			var _AlbumDesc = $("#AlbumDescTextarea").val();
			
			$("#editAlbumDescribeTips").bind("click",function(){
				$("#AlbumDesc").hide();
				$("#AlbumDescTextarea").show();
				
				$("#saveAlbumDescribeTips").unbind("click");
				$("#saveAlbumDescribeTips").show().bind("click",function(){
					var AlbumDesc = $("#AlbumDescTextarea").val();
					var opt = {"id":_this.albumID,"content":AlbumDesc,"type":"desc"};
					if(_AlbumDesc != AlbumDesc){
						_this.quickModifyAlbumAction(opt);
					}else{
						$("#AlbumDesc").show();
						$("#AlbumDescTextarea").hide();
						$("#saveAlbumDescribeTips").hide();
						$("#canceAlbumDescribeTips").hide();
					}
				
				});
				$("#canceAlbumDescribeTips").unbind("click");
				$("#canceAlbumDescribeTips").show().bind("click",function(){
					$("#AlbumDesc").show();
					$("#AlbumDescTextarea").hide();
					$("#saveAlbumDescribeTips").hide();
					$("#canceAlbumDescribeTips").hide();
				});
			});
					
		},	
		
		quickModifyAlbumAction:function(opt){
			$.ajax({
				url:'/a/album/photoset/quickedit.do?_input_encode=UTF-8&_output_encode=UTF-8&key=9527',
				type:'POST',
				data:opt,
				success:function(result){
					var json = $.parseJSON(result);
					if(!json.code){
						if(opt.type == 'name'){
							$("#photosettitle").html(opt.content);
							$("#AlbumTitle").show();
							$("#AlbumTitleEdit").hide();
							$("#quickeditTitleInput").hide();
							$("#saveAlbumTitleTips").hide();
							$("#canceAlbumTitleTips").hide();
							
							$("#AlbumDescTextarea").val(opt.content);
						}else{
							$("#AlbumDesc").show();
							$("#AlbumDescTextarea").hide();
							$("#saveAlbumDescribeTips").hide();
							$("#canceAlbumDescribeTips").hide();
							$("#photosetdesc").html(opt.content);
						}
					}
				}
			});
		},
		
			
		//初始化页面的*删除专辑*编辑专辑*创建专辑绑定事件
		initBindEvent:function(){
			var ActionList = $("*[data-action]");
			
			$.each(ActionList,function(i,n){
				var Action = $(n).attr("data-action") || '';
				var AlbumID = $(n).attr("data-albumid") || '';
				var UserID = $(n).attr("data-userid") || '';
				var AlbumPrivilege = $(n).attr("data-privilege") || '';
				var Init = $(n).attr("data-init") || '';
				if(Init == "yes"){				
					$(n).bind("click",function(){
						mysohu.AlbumAction.init(Action,{"AlbumID":AlbumID,"UserID":UserID,"AlbumPrivilege":AlbumPrivilege});
					});
				}
			});
		},
		
		setHash:function(num) {
			window.location.hash = num;
		},
		
		getHash:function() {
			var num = window.location.hash.match(/\d+/);
			return parseInt(num, 10) || -1;
		},
				
		//渲染相册前台展示页照片列表
		RenderAlbumFrontPhotos:function(){
			var _this = this;
			
			if($("#DragsortFrontPhoto").length != 0){ 
				var UserID = albumfront.userID;
				var AlbumID = albumfront.albumID;
				var PhotoNum = albumfront.photoNum;
				var PhotoCount = albumfront.photoCount;
				var PageNum = albumfront.pageNum;
				
				//如果是有页码标记的，则从指定页码开始渲染
				var index = _this.getHash();
				if(index < 0){
					_this.setHash(PageNum);
				}else{
					PageNum = index;
					_this.setHash(PageNum);
				}
				
				var PageCount = Math.ceil(PhotoCount/PhotoNum);
				var RequestCountNum = (PageCount == PageNum )? (PhotoCount - (PhotoNum*(PageCount-1))) : albumfront.photoNum;
				var RequestStartNum = (PageNum-1)*PhotoNum;
				
				
				var paras ={"userid":UserID,"photosetid":AlbumID,"start":RequestStartNum,"count":RequestCountNum,"needurl":true};
				this.RequestAlbumFrontPhotos(paras);
			}
		},
		
		
		
		//请求相册前台展示页照片列表
		RequestAlbumFrontPhotos:function(paras){			
			//当前页码的展示
			if($("#RequestLoading").length == 0){
				$("#DragsortFrontPhoto").before('<div id="RequestLoading" style="width:706px; z-index:200; position:absolute; text-align:center;"><img src="http://s3.suc.itc.cn/i/home/d/icon_feed_loading.gif" /></div>');
			}
			
			$.ajax({
				url:'/a/album/photo/list.do',
				type:'POST',
				data:paras,
				success:function(data){ 
					var json = $.parseJSON(data);
					if(!json.code && json.data != null){
						var total = json.data.total;
						var photos =json.data.photos;
						var HtmlString = [];
						var url = json.data.url;
						
						$.each(photos,function(i,n){  
							var shortdesc = n.descriptionShort;
							var longdesc = n.description;
							if(n.perm ==6){ 
								$("#DragsortFrontPhoto").data("EnableDrag",true);
								
								shortdesc = (shortdesc == "") ? "点击添加描述" : shortdesc;
								longdesc = (longdesc == "") ? "" : longdesc;
								var cssstyle = (shortdesc == "点击添加描述") ? "color:#999999;font-style:italic;" : "";
																
								HtmlString.push('<li style="float:left;"><div id="photobox_'+n.id+'"  class="album-item album-single-pic">');
								HtmlString.push('<div class="album-pic">');
								HtmlString.push('<a class="delete"  data-action="deletePhoto" data-photoid="'+n.id+'"   id="deletephotoid_'+n.id+'" href="javascript:;" ></a>');
								HtmlString.push('<div style="cursor:pointer;" data-photoid="'+ n.id +'" data-action="setAlbumCover" class="mask-text setalbumcover">设为封面</div>');
								HtmlString.push('<div class="mask"></div>');
								HtmlString.push('<a style="cursor:pointer;" href="'+ url +'album/photo/'+n.id+'/view/"><img   border="0" alt="" src="' + n.url150 + '"></a></div>');
								HtmlString.push('<p><span id="hidelongdesc_' + n.id + '" style="display:none;" >' + longdesc + '</span><span id="shortdesclink_'+ n.id +'" data-photoid="'+n.id+'" class="shortdesclink" data-action="editPhotoDesc" href="javascript:;" style="cursor:pointer; width:150px; display:inline-block; border-style:none; font-size:12px; color:#333333; height:20px; line-height:20px; text-align:center;'+cssstyle+'" >' + shortdesc + '</span> <input data-action="editPhotoDescInput" type="text" maxlength="300" class="desclink" style="display:none; width:150px;font-size:12px; background-color:#FFFAAA; border-style:none; cursor:pointer; height:20px; line-height:20px; text-align:center;"  id="desclink_'+ n.id +'" title="'+longdesc+'" value="'+ longdesc +'" /></p>');
								HtmlString.push('</div></li>');
													
							}else{
								HtmlString.push('<li style="float:left;"><div id="photobox_'+n.id+'" class="album-item album-single-pic">');
								HtmlString.push('<div class="album-pic">');
								HtmlString.push('<a  style="cursor:pointer;" href="'+ url +'album/photo/'+n.id+'/view/" ><img   border="0" alt="" src="' + n.url150 + '"></a></div>');
								HtmlString.push('<p><div title="'+longdesc+'" style="cursor:default;text-align:center;">'+shortdesc+'</div></p>');
								HtmlString.push('</div></li>');
							}
						});		
								
						$("#RequestLoading").hide();			
						$("#RequestLoadingMark").remove();
						$("#DragsortFrontPhoto").html(HtmlString.join(''));
						
						
						//给页面添加鼠标移上 和移除的功能
						$(".album-item").bind("mouseenter",function(){
							$(this).addClass("album-hover");						
						}).bind("mouseleave",function(){
							$(this).removeClass("album-hover");
						});
						
						//设置分页
						albumfront.SetPhotosPaging();
						//启动排序
						albumfront.AlbumFrontPhotoSort();
					}else{
						$("#RequestLoading").hide();
						if($("#photolistpage").length>0){
							$("#photolistpage").hide();
						}else if($("#albumphotoslist").length>0){
							$("#albumphotoslist").hide();
						}
					}
				},
				error:function(){
					$.sentenceNotice({
						type: 'notice',
						delay: 2000,
						icon: 'error',
						content: '服务器出错!'
					}); 
					setTimeout(function(){
						$("#RequestLoading").hide();			
						$("#RequestLoadingMark").remove();
					},2000);
				}
			});
			
		
		},
				
		//相册个人展示照片排序事件绑定和初始化
		//AlbumFrontPhotoSort  DragsortFrontPhoto DragsortFrontPhotoItem
		AlbumFrontPhotoSort:function(){
			
			var EnableDrag = $("#DragsortFrontPhoto").data("EnableDrag");
			if(!EnableDrag)
				return;
				
			$("#DragsortFrontPhoto").dragsort({ 
				itemSelector: "li",
				dragSelector: "li", 
				dragBetween: true, 
				dragEnd: albumfront.SavePhotoSort, 
				placeHolderTemplate: '<li class="" style="float:left; background-color:#f2f6fb;" ><div class="" style="margin:7px 0px 0px 14px; border:dashed 1px #ccc; width:152px; height:152px;"> </div></li>' 
			});
			
			albumfront.beforeData = $("#DragsortFrontPhoto li").map(function() { return $(this).children().attr("id").substr(9)}).get();
		
		},
		
		//保存排序结果 SavePhotoSort
		SavePhotoSort:function(){
			var BeforeData = [];
			if(albumfront.beforeData.length != 0){
				BeforeData = albumfront.beforeData;
			}
			
			var afterData = $("#DragsortFrontPhoto li").map(function() { return $(this).children().attr("id").substr(9) }).get();
			var orderMark = [];
			var orderLength = 0;
			var fromID = 0,toID = 0;
			for(var i=0; i<BeforeData.length; i++){
				if(BeforeData[i] != afterData[i]){
					orderMark.push({"i":i,"id":BeforeData[i]});
					orderLength+=1;
				}
			}
			
			if(orderMark[orderLength-1].id == afterData[orderMark[0].i]){
				toID = orderMark[0].id;
				fromID = orderMark[orderMark.length-1].id;
			}else{
				fromID=orderMark[0].id;
				toID=orderMark[orderLength-1].id;
			}
			
			//把新的序列缓存起来
			albumfront.beforeData = afterData;
			
			
			$.ajax({
				url:'/a/album/photo/sort.do',
				type:'POST',
				data:{"from":fromID,"photosetid":albumfront.albumID,"to":toID},
				success:function(result){
					var json= $.parseJSON(result);
					if(json.code){
						$.sentenceNotice({
							type: 'notice',
							delay: 1000,
							icon: 'error',
							content: json.msg
						});
					}
				}
			});
		
		},
		
		//改变页码
		ChangePageNum:function(TargetToPageNum){
			var _this = this;
			albumfront.pageNum = TargetToPageNum;
			$("#RequestLoading").css({"margin":"120px 0 0 0"}).show();
			$("#DragsortFrontPhoto").before('<div id="RequestLoadingMark" style="z-index:199; height:980px; width:708px; position:absolute; /*opacity:0.5; background-color:#FFF;*/ background-color:rgba(255,255,255,0.5);  _filter:alpha(opacity=50);"></div>');
			
			_this.setHash(TargetToPageNum);
			
			this.RenderAlbumFrontPhotos();
			var _height = $("#BackToAlbumList").height() + 200;
			$(window).scrollTop(_height);
		},
				
		//SetPhotosPaging
		//设置分页
		SetPhotosPaging:function(){
			var _this = this;
			
			var PhotoNum = albumfront.photoNum;
			var PhotoCount = albumfront.photoCount;
			var PageNum = _this.getHash(); //albumfront.pageNum;
			var PageCount = Math.ceil(PhotoCount/PhotoNum);
			var PageHtmlStringBuilding = [];
								
			//总图片小于等于页面容纳图片则不显示分页
			if(PhotoNum >= PhotoCount){
				$("#photolistpage").hide();
				$("#PhotoNumTips").html('当前第1-'+PhotoCount+'张');
			}else{
				$("#photolistpage").show();			
				//页码＜等于10页的时候
				if(PageCount <= 10){
					for(var i=1; i <= PageCount; i++){
						PageHtmlStringBuilding.push((PageNum == i) ? '<a class="curt" href="javascript:;">第' + i + '页</a>' : '<a onclick="mysohu.albumfront.ChangePageNum('+i+')" href="javascript:;">第' + i + '页</a>');
					}
					$("#pagepageinstructionlist").html(PageHtmlStringBuilding.join('\n'));
					$("#pageinstruction").html('第'+PageNum+'页');
					
				}else{
					var ShortPageNum = 10;
					var BeginPageNum = 1;
					if(PageNum <= 5){
						BeginPageNum = 1;
						ShortPageNum = 10;
						$("#firstpage").removeClass("txt").addClass("none");
						$("#endpage").removeClass("none").unbind("click").addClass("txt").bind("click", function(){
							mysohu.albumfront.ChangePageNum(PageCount);
						});
					}else if((PageCount-PageNum) <= 5){
						BeginPageNum = (PageCount - 9);
						ShortPageNum = BeginPageNum + 9;
						$("#firstpage").removeClass("none").unbind("click").addClass("txt").bind("click", function(){
							mysohu.albumfront.ChangePageNum(1);
						});
						$("#endpage").removeClass("txt").addClass("none");
					}else if(PageNum > 5 && (PageCount-PageNum) >5){
						BeginPageNum = (PageNum - 4);
						ShortPageNum = BeginPageNum + 9;
						$("#firstpage").removeClass("none").unbind("click").addClass("txt").bind("click", function(){
							mysohu.albumfront.ChangePageNum(1);
						});
						$("#endpage").removeClass("none").unbind("click").addClass("txt").bind("click", function(){
							mysohu.albumfront.ChangePageNum(PageCount);
						});
					}
					
					for(var i=BeginPageNum; i <= ShortPageNum; i++){
						PageHtmlStringBuilding.push((PageNum == i) ? '<a class="curt" href="javascript:;">第' + i + '页</a>' : '<a onclick="mysohu.albumfront.ChangePageNum('+i+')" href="javascript:;">第' + i + '页</a>');
					}
					
					$("#pagepageinstructionlist").html(PageHtmlStringBuilding.join('\n'));
					$("#pageinstruction").html('第'+PageNum+'页');
				}
				
				if(PageNum == PageCount){
					$("#PhotoNumTips").html('当前第'+(((PageNum-1)*PhotoNum)+1) + ' - ' +PhotoCount+'张');
				}else{
					$("#PhotoNumTips").html('当前第'+(((PageNum-1)*PhotoNum)+1) + ' - ' + (((PageNum)*PhotoNum))+'张');
				}
			}
			
			
			$("#previouspage").remove();
			$("#nextpage").remove();
			
			//设置上下一页的样式和点击事件
			if(PageNum == 1){
				$("#firstpage").after('<a href="javascript:void(0);" class="null" id="previouspage">上一页</a>');
				$("#endpage").before('<a id="nextpage" href="javascript:void(0);" class="txt" onclick="mysohu.albumfront.ChangePageNum('+ (PageNum + 1) +')">下一页</a>');
			}else if(PageNum == PageCount){
				$("#firstpage").after('<a id="previouspage" href="javascript:void(0);" class="txt" onclick="mysohu.albumfront.ChangePageNum('+ (PageNum - 1) +')">上一页</a>');
				$("#endpage").before('<a id="nextpage" href="javascript:void(0);" class="null">下一页</a>');
			}else{
				$("#firstpage").after('<a id="previouspage" href="javascript:void(0);" class="txt" onclick="mysohu.albumfront.ChangePageNum('+ (PageNum - 1) +')">上一页</a>');
				$("#endpage").before('<a id="nextpage" href="javascript:void(0);" class="txt" onclick="mysohu.albumfront.ChangePageNum('+ (PageNum + 1) +')">下一页</a>');
			}
			
		},
		
		//初始化个人中心专辑排序 AlbumSort
		initAlbumSort:function(){
			var _this = this;
			$("#AlbumFrontList").dragsort({ 
				itemSelector: "li",
				dragSelector: "li", 
				dragBetween: true, 
				dragEnd: _this.saveAlbumSort, 
				placeHolderTemplate: '<li class="" style=" float:left; background-color:#f2f6fb;" ><div class="" style="border:dashed 1px #ccc; width:168px; height:198px; margin:0px 0px 0px 6px;"> </div></li>' 
			});
			
			albumfront.beforeData = $("#AlbumFrontList li").map(function() { return $(this).children().attr("id").substr(6); }).get();
			
		},
		
		
		//保存图片排序
		saveAlbumSort:function(){
		
			var BeforeData = [];
			if(albumfront.beforeData.length != 0){
				BeforeData = albumfront.beforeData;
			}
			
			var afterData = $("#AlbumFrontList li").map(function() { return $(this).children().attr("id").substr(6) }).get();
			var orderMark = [];
			var orderLength = 0;
			var fromID = 0,toID = 0;
			for(var i=0; i<BeforeData.length; i++){
				if(BeforeData[i] != afterData[i]){
					orderMark.push({"i":i,"id":BeforeData[i]});
					orderLength+=1;
				}
			}
			
			if(orderMark[orderLength-1].id == afterData[orderMark[0].i]){
				toID = orderMark[0].id;
				fromID = orderMark[orderMark.length-1].id;
			}else{
				fromID=orderMark[0].id;
				toID=orderMark[orderLength-1].id;
			}
			
			
			if(orderMark[orderLength-1].id == afterData[orderMark[0].i]){
				toID = orderMark[0].id;
				fromID = orderMark[orderMark.length-1].id;
			}else{
				fromID=orderMark[0].id;
				toID=orderMark[orderLength-1].id;
			}
			
			//把新的序列缓存起来
			albumfront.beforeData = afterData;
			
			$.ajax({
				url:'/a/album/photoset/sort.do',
				type:'POST',
				data:{"from":fromID,"to":toID},
				success:function(result){
					var json= $.parseJSON(result);
					if(json.code){
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
	}
	//albumfront.end
	
	//设置全局
	mysohu.albumfront = albumfront;
	
	$(document).ready(function(){
		//初始化前台页面照片
		albumfront.init();
		
		//渲染前台页面照片
		albumfront.RenderAlbumFrontPhotos();
		
		//初始化相册-个人中心的专辑排序
		
		var EnableDrag = $("#EnableDrag").val();
		if(EnableDrag == 6){
			albumfront.initAlbumSort();
			
			//给页面添加鼠标移上 和移除的功能
			$(".album-item").bind("mouseenter",function(){
				$(this).addClass("album-hover");						
			}).bind("mouseleave",function(){
				$(this).removeClass("album-hover");
			});
		}
		
		//专辑的分页
		if($("#AlbumFrontList").length > 0){
			$("#photolistpage").show();
		}
	});

})(jQuery,MYSOHU);