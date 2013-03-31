/*
 *	空间 新用户引导 第二步
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var follow = '/a/app/friend/addattentions.do';

var project = {
	init: function(){
		
		$('div.friend-title input:checkbox').click(function(){
			$('div.friend-list li input:checkbox').attr('checked',this.checked);
			if(this.checked){
				$('div.friend-list li').addClass('down');
			}else{
				$('div.friend-list li').removeClass('down');
			}
		});

		$('div.friend-list li')
		.hover(function(){
			var $li = $(this);
			if(!$li.hasClass('down')){
				$li.addClass('hover');
			}
		},
		function(){
			var $li = $(this);
			if(!$li.hasClass('down')){
				$li.removeClass('hover');
			}
		})
		.click(function(event){
			var $li = $(this);
			if($li.hasClass('down')){
				$li.removeClass('down').find('input[type=checkbox]').attr('checked',false);
				$('div.friend-title input:checkbox').attr('checked',false);
			}else{
				$li.addClass('down').find('input[type=checkbox]').attr('checked',true);
			}
			var $target = $(event.target);
			if($target.closest('.app-friends-add').length){
				var xpt = $li.find('input:checkbox').val();
				if(xpt){
					$.get(follow,{
						'userid':xpt,
						'from_type': 'profile_new_user_guide'
					},function(results){
						if(results.code == 0){
							$li.find('h4').html('已跟随');
						}else{
							$.alert(results.msg);
						}
					},'json');
				}
			}
		});

		$('div.attention-btn > input').click(function(){
			var cks = $('div.friend-list li input:checkbox:checked');
			var xpts = [];
			cks.each(function(){
				xpts[xpts.length] = this.value;
			});
			$.post(follow+'?from_type=profile_new_user_guide',{
				'userid':xpts.join(',')
			},function(results){
				window.location = '/guide/swfGuideIcon.htm';
			},'json');
		});
	}
};

$(function(){
	project.init();
});

})(jQuery);