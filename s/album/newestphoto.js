/**
* 相册个人展示的 最新图片 代码
* 2011-12-28  newestphoto.js
*/



;(function($,mysohu){


	var newestphoto={
				
		////最新照片-个人展示页面 AlbumFrontNewsPhoto 
		AlbumFrontNewsPhotos:function(){	
			if($("#RequestLoading").length == 0){
				$("#AlbumFrontNewsPhoto").before('<div id="RequestLoading" style="width:706px; z-index:200; position:absolute; text-align:center;"><img src="http://s3.suc.itc.cn/i/home/d/icon_feed_loading.gif" /></div>');
			}
			
			var xpt = $space_config._xpt; 
			var userID = $("#userID").val();			
			var paras = {"xpt":xpt,"userid":userID,"start":"0","count":"80"};
			$.ajax({
				url:'/a/album/photo/latest.do',
				type:'POST',
				data:paras,
				success:function(result){
					var json = $.parseJSON(result);
					var url = json.data.url;
					var NewestPhotoHtml = [];
					if(!json.code && json.data != null){
						//console.log("json.data.count: "+json.data.count +"____ json.data.total:"+json.data.total);
						$.each(json.data.photos,function(i,n){
							var shortdesc = n.descriptionShort;
							var longdesc = n.description;
							var updatetime=(n.uploadDate).substr(0,10);
						
							if(n.perm ==6){ 
								$("#AlbumFrontNewsPhoto").data("EnableDrag",true);
								
								shortdesc = (shortdesc == "") ? "" : shortdesc;
								longdesc = (longdesc == "") ? "" : longdesc;
								var cssstyle = (shortdesc == "") ? "color:#999999;font-style:italic;" : "";
							
								NewestPhotoHtml.push('<div id="photobox_'+n.id+'" class="album-item album-single-pic">');
								NewestPhotoHtml.push('<div class="album-pic">');
								NewestPhotoHtml.push('<a class="delete" style="display:none;" data-action="deleteAlbum"  id="photoid_'+n.id+'" href="javascript:;" ></a>');
								NewestPhotoHtml.push('<div style="cursor:pointer;" id="photoid_'+n.id+'"  class="mask-text setalbumcover"><a target="_blank" class="newPictureAlbum" href="'+url+'album/photoset/'+n.photosetId+'/photos/" title="'+ n.photosetName+'">专辑：'+(n.photosetName).substr(0,8)+'</a></div>');
								NewestPhotoHtml.push('<div class="mask"></div>');
								NewestPhotoHtml.push('<a href="'+n.urlAlbum+'" ><img  border="0" alt="" src="' + n.url150 + '"></a></div>');
								NewestPhotoHtml.push('<p><span type="text" maxlength="200" class="desclink" style="border-style:none; font-size:12px; color:#333333; height:20px; line-height:20px; text-align:center;'+cssstyle+'" title="'+longdesc+'">'+shortdesc+'</span></p>');
								NewestPhotoHtml.push('<p><span class="pictureuploadtime">'+updatetime+'</span></p>');
								NewestPhotoHtml.push('</div>');	
							
							}else{ 
								NewestPhotoHtml.push('<div id="photobox_'+n.id+'" class="album-item album-single-pic">');
								NewestPhotoHtml.push('<div class="album-pic">');
								NewestPhotoHtml.push('<div style="cursor:pointer;" id="photoid_'+n.id+'"  class="mask-text setalbumcover"><a target="_blank" class="newPictureAlbum" href="'+url+'album/photoset/'+n.photosetId+'/photos/" title="'+ n.photosetName+'">专辑：'+(n.photosetName).substr(0,8)+'</a></div>');
								NewestPhotoHtml.push('<div class="mask"></div>');
								NewestPhotoHtml.push('<a href="'+n.urlAlbum+'" ><img   border="0" alt="" src="' + n.url150 + '"></a></div>');
								NewestPhotoHtml.push('<p><div class="picturedesc" title="'+ longdesc +'" >'+ shortdesc +'</div></p>');
								NewestPhotoHtml.push('<p><span class="pictureuploadtime">'+updatetime+'</span></p>');
								NewestPhotoHtml.push('</div>');									
							}
							
							$("#RequestLoading").hide();
						});
						
						$("#AlbumFrontNewsPhoto").html(NewestPhotoHtml.join(''));
					}else if(json.code == 1){
						//自己看自己的图片
						NewestPhotoHtml.push('<div class="photo-status photo-status-1"><div class="empty-pic"></div><div class="empty-words">');
						NewestPhotoHtml.push(json.msg);
						NewestPhotoHtml.push('</div><a href="http://i.sohu.com/album/home/latest/?from=show" class="btn"></a></div>');
						$("#AlbumFrontNewsPhoto").html(NewestPhotoHtml.join(''));
					}else if(json.code == 2){
						//别人看自己，并且没有图片
						NewestPhotoHtml.push('<div class="photo-status photo-status-2"><div class="empty-pic"></div><div class="empty-words">');
						NewestPhotoHtml.push(json.msg);
						NewestPhotoHtml.push('</div></div>');
						$("#AlbumFrontNewsPhoto").html(NewestPhotoHtml.join(''));
					}
					
					$('.total-count').html('<span style="color:#000000;">最近的'+json.data.count+'张图片</span>');
					$("#RequestLoading").hide();	
					
					//鼠标移动上去显示专辑名称
					$(".album-item").live("mouseenter",function(){
						$(this).addClass("album-hover");
					}).bind("mouseleave",function(){
						$(this).removeClass("album-hover");
					});
				}
			});
		}
	}
	
	
	$(document).ready(function(){
		//最新图片列表页
		newestphoto.AlbumFrontNewsPhotos();
	});
})(jQuery,MYSOHU);