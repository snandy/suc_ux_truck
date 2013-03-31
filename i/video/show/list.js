/*
 *	视频
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var ns = '.video'

var project = {
	$this: null,
	init: function($this){
		var self = this;
		this.$this = $this;
		this.$box = $this.find('.video-pic-box');


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
		/*
		.bind('mouseover' + ns, function(event) {
			var $target = $(event.target);
			if(!self.$box.hasClass('video-list-box') && $target.closest('.video-pic-info').length) {
				$target = $target.closest('.video-pic-info');
				ms.VideoApp.within.call($target, event, function() {
					$target.find('.delete,.edit').show();
					
				});
			}

		})
		.bind('mouseout' + ns, function(event) {
			var $target = $(event.target);
			if($target.closest('.video-pic-info').length) {
				$target = $target.closest('.video-pic-info');
				ms.VideoApp.within.call($target, event, function() {
					$target.find('.delete,.edit').hide();
					
				});
			}

		})
		*/
		.bind('click'+ns, function(event) {
			var $target = $(event.target);
			if($target.closest('.ico-mode-pic').length){
				self.modePic();
				self.setListModeParam(0);
			}
			else if($target.closest('.ico-mode-list').length){
				self.modeList();
				self.setListModeParam(1);
			}
			else if($target.closest('.delete,.video-delete').length){
				event.preventDefault();
				$target = $target.closest('li[data-video-id]');
				ms.VideoApp.delVideo($target.attr('data-video-id'),function(data){
					$target[self.$box.hasClass('video-list-box') ? 'slideUp': 'fadeOut']('fast',function(){
						$target.hide();
						self.$this.find('.total-count > span').html('共'+(self.getCount()-1)+'个视频');
						if(!self.$box.find('li:visible').length){
							window.location.reload();
						}
					});
				});
			}
		});

		this.setListMode();
	},
	setListModeParam: function(v){
		var hash = window.location.hash.replace('#',''),
			params = ms.VideoApp.getParam(hash);
		params['showType'] = v;
		window.location.hash = $.param(params);
		this.updatePageUrl(v);
	},
	getListMode: function(){
		var hash = window.location.hash.replace('#',''),
			params = ms.VideoApp.getParam(hash);
		return  typeof params['showType'] === 'undefined' ? '-1' : params['showType'];
	},
	setListMode: function(){
		var mode = this.getListMode();
		if(mode == 0){
			this.modePic();
		}else if(mode == 1){
			this.modeList();
		}
		this.updatePageUrl(mode);
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
	getCount: function(){
		var txt = this.$this.find('.total-count > span').text();
		return parseInt(txt.match(/\d+/),10) || 0;
	},
	updatePageUrl: function(mode){
		this.$this.find('.ui-pagination a').each(function(){
			if(mode == 0){
				this.href = this.href.replace('showType=1','showType=0');
			}else if(mode == 1){
				this.href = this.href.replace('showType=0','showType=1');
			}
		});
		
	}
};


$(function(){
	
	project.init($('#main .content'));
	ms.VideoApp.fillCount();

});

})(jQuery,MYSOHU);