/*
 *	babyapp-reg 选择阶段
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'babyapp';

$[app].dialog.clear();

var $phase = $('div.baby-info-phase').eq(0);

$phase.find('dd')
	.hover(function(){
		var $this = $(this);
		if(!$this.hasClass('now')){
			$this.removeClass().addClass('hover');
		}
	},function(){
		var $this = $(this);
		if(!$this.hasClass('now')){
			$this.removeClass();
		}
	})
	.click(function(){
		var $this = $(this);
		var $top = $('div.baby-info-top');
		if(!$this.hasClass('now')){
			$phase.find('dd').removeClass('now');
			$this.removeClass().addClass('now');
			$top.removeClass('baby-amend-top-birth-bg baby-amend-top-pregnancy-bg baby-amend-top-preparative-bg');
			switch($this.attr('data-babyapp-stats')){
				case '1':
					$top.addClass('baby-amend-top-preparative-bg');
					break;
				case '2':
					$top.addClass('baby-amend-top-pregnancy-bg');
					break;
				case '3':
					$top.addClass('baby-amend-top-birth-bg');
					break;
			}
		}
	});

var $submit = $('.baby-info-phase .confirm-button .button span');

$submit
	.removeClass()
	.hover(function(){
		if(this.className != 'disabled'){
			this.className = 'hover';
		}
	},function(){
		if(this.className != 'disabled'){
			this.className = '';
		}
	})
	.mousedown(function(){
		if(this.className != 'disabled'){
			this.className = 'down';
		}
	})
	.mouseup(function(){
		if(this.className != 'disabled'){
			this.className = 'hover';
		}
	})
	.click(function(){
		var stats = $phase.find('dd.now').attr('data-babyapp-stats');
		if(stats){
			$.appview({
				url: '/baby/babyinfo.php?status='+stats,
				method: 'get',
				target: '#innerCanvas'
			});
		}
	});





})(jQuery);