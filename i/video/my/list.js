/*
 *	视频
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var doc = document;
var win = window;
var ns = '.video'
var pageTitle = doc.title.split('#')[0];
var project = {
	$this: null,
	init: function($this,upload){
		var self = this;
		this.$this = $this;
		this.upload = upload;
		this.$box = $this.find('.video-pic-box');
		
		this.setUploadMode();

		if(!this.$box.length){
			return false;
		}

		$this.find('.video-pic-info').each(function(){
			$(this).find('.delete,.edit').hide();
		});

		$this
		.delegate('.video-pic-info','mouseenter' + ns,function(){
			var $target = $(this);
			if(!self.$box.hasClass('video-list-box')){
				$target.find('.delete,.edit').show();
			}
		})
		.delegate('.video-pic-info','mouseleave' + ns,function(){
			var $target = $(this);
			$target.find('.delete,.edit').hide();
		})
		.delegate('.ico-mode-pic','click' + ns,function(){
			self.modePic();
			self.setListModeParam(0);
		})
		.delegate('.ico-mode-list','click' + ns,function(){
			self.modeList();
			self.setListModeParam(1);
		})
		.delegate('.delete,.video-delete','click' + ns,function(event){
			var $target = $(this);
			event.preventDefault();
			$target = $target.closest('li[data-video-id]');
			ms.VideoApp.delVideo($target.attr('data-video-id'),function(data){
				$target[self.$box.hasClass('video-list-box') ? 'slideUp': 'fadeOut']('fast',function(){
					$target.hide();
					self.updateCount(-1);
					if(!self.$box.find('li:visible').length){
						win.location.reload();
					}
				});
			});
		})
		.delegate('a.upload-btn','click' + ns,function(){
			$(win).scrollTop(0);
			if($this.find('a.upload-video-btn').length){
				self.upload.uploadMode();
			}
		});

		this.setListMode();
		return true;
	},
	setListModeParam: function(v){
		var hash = win.location.hash.replace('#',''),
			params = ms.VideoApp.getParam(hash);
		params['showType'] = v;
		win.location.hash = $.param(params);
		this.updatePageUrl(v);
	},
	updateCount: function(n){
		this.$this.find('.total-count > span').html('共'+(this.getCount()+n)+'个视频');
	},
	getCount: function(){
		var txt = this.$this.find('.total-count > span').text();
		return parseInt(txt.match(/\d+/),10) || 0;
	},
	getParam: function(){
		var hash = win.location.hash.replace('#',''),
			params = ms.VideoApp.getParam(hash);
		return  params;
	},
	setListMode: function(){
		var params = this.getParam(),
			listMode = (typeof params['showType'] === 'undefined' ? '-1' : params['showType']);
		if(listMode == 0){
			this.modePic();
		}else if(listMode == 1){
			this.modeList();
		}
		this.updatePageUrl(listMode);
		doc.title = pageTitle;
	},
	setUploadMode: function(){
		var params = this.getParam(),
			uploadMode = (typeof params['upload'] === 'undefined' ? '0' : params['upload']);
		if(uploadMode == 1){
			this.upload.uploadMode();
		}
		doc.title = pageTitle;
	},
	modePic: function(){
		this.$box.removeClass('video-list-box');
		this.$this.find('.ico-mode-list').removeClass('ico-mode-list-active');
		this.$this.find('.ico-mode-pic').addClass('ico-mode-pic-active');
	},
	modeList: function(){
		this.$box.addClass('video-list-box');
		this.$this.find('.ico-mode-pic').removeClass('ico-mode-pic-active');
		this.$this.find('.ico-mode-list').addClass('ico-mode-list-active');
	},
	updatePageUrl: function(mode){
		this.$this.find('.ui-pagination a').each(function(){
			if(mode == 0){
				this.href = this.href.replace('showType=1','showType=0');
			}else if(mode == 1){
				this.href = this.href.replace('showType=0','showType=1');
			}
		});
		
	},
	addNewVideo: function(data){
		var uploadData = data.showUploadDate.replace(/(\d+)-(\d+)-(\d+)/,'$1年$2月$3日');
		var template = [];
		template.push('<div class="video-pic-info">');
		template.push('<a class="delete" href="#" style="display: none;"></a>');
		//template.push('<a class="edit" href="/video/get/info.htm?videoId='+data.id+'" style="display: none;"></a>');
		//template.push('<a class="play-btn" href="#"></a>');
		//template.push('<div class="mask-text">'+data.showVideoTime+'</div>');
		//template.push('<div class="mask"></div>');
		template.push('<img width="160" height="120" border="0" alt="" src="'+data.imageUrl+'" />');
		template.push('</div>');
		template.push('<div class="video-text-info">');
		template.push('<h5>'+data.videoTitle+'</h5>');
		template.push('<p class="text">简介：'+data.desc+'</p>');
		template.push('<p class="tip">播放：0　<span class="reply">评论：0</span></p>');
		template.push('<div class="mod-foot">');
		template.push('<div class="item-info"><span class="feed-timestamp">上传时间：'+uploadData+'</span></div>');
		template.push('<div class="item-behavior"><span class="feed-set">');
		//template.push('<a href="/video/get/info.htm?videoId='+data.id+'">编辑</a>');
		template.push('<a class="video-delete" href="javascript:void(0)">删除</a>');
		//template.push('<a href="javascript:void(0)">转发(0)</a>');
		//template.push('<a href="#">评论(0)</a></span>');
		template.push('</div>');
		template.push('</div>');
		template.push('</div>');
		
		var $ul = this.$box.find('ul');
		$('<li data-video-id="'+data.id+'" class="cols"></li>').html(template.join('')).prependTo($ul);
		if($ul.children().length > 9){
			$ul.children(':gt(8)').remove();
		}
		this.updateCount(1);
	}
};


$(function(){
	var flag;
	
	function getPageNum(){
		var page = win.location.href.match(/currentPage=(\d+)/);
		if(page){
			return parseInt(page[1],10);
		}
		return 1;
	}
	
	var upload = ms.VideoApp.sohuHD($('#uploadVideoBox'),{
		onCompleteAndSaved: function(vid){
			//用vid 视频id来处理
			win.location.href = '/video/home/list.htm#upload=1';
			win.location.reload();
			/*
			var page = getPageNum();
			if(page > 1 || !flag){
				if(page == 1){
					window.location.reload();
				}else{
					window.location.href = '/video/home/list.htm#upload=1';
				}
			}else{
				$.getJSON('/a/video/get/upload/info.htm',{'videoId':vid},function(results){
					if(results.code == 0){
						project.addNewVideo(results.data);
					}
				});
			}
			*/
		}
	});
	


	flag = project.init($('#canvas .content'),upload);

	ms.VideoApp.fillCount();
});

})(jQuery,MYSOHU);