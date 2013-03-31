/*
 *	home proxy方式 好友后台 邀请好友
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'friend';

var PAGE_NAME = 'quest';


var project = {
	$this: null,
	card: null,//名片
	isInited: false,
	init: function($this){
		var self = this;
		this.$this = $this;
		
		this.initCard();//初始化名片
		
		/*
		站内邀请
		*/
		this.insideInit();
		
		//站外邀请
	},
	insideInit: function(){
		var self,
			$inviteInside = $('#invite_inside'),
			$insideNick = $inviteInside.find('div.invite-search input:text'),
			$insideBtn = $inviteInside.find('div.invite-search button'),
			defText = '输入昵称';

		$inviteInside
		.delegate('a.invite-user-btn','click',function(event){
			var $btn = $(this),
				$li = $btn.closest('li'),
				xpt = $li.attr('data-xpt'),
				nick = $li.attr('data-nick');

			event.preventDefault();
			if(!$btn.hasClass('already')){
				$.iCard.InviteFollowDialog.show({
					'nick': nick,
					'xpt': xpt,
					'fromType': 'may_interestat_me'
				},function(){
					$btn.addClass('already').html('已完成');
				});
			}
		});

		$insideNick
		.val(defText)
		.bind('focus',function(){
			$insideNick.addClass('hover');
			if($insideNick.val() == defText){
				$insideNick.val('');
			}
		})
		.bind('blur',function(){
			if($insideNick.val() == '' || $insideNick.val() == defText){
				$insideNick.val(defText).removeClass('hover');
			}
		})
		.bind('keypress',function(event){
			if(event.keyCode == 13){
				event.preventDefault();
				$insideNick.blur();
				$insideBtn.click();
			}
		});
		
		var sending = false,sendingId = null;

		$insideBtn
		.hover(function(){
			$insideBtn.addClass('hover');
		},function(){
			$insideBtn.removeClass('hover');
		})
		.bind('click',function(){
			var nick = $.trim($insideNick.val());
			if(sending || nick == defText || nick == ''){
				return;
			}
			sending = true;
			$.getJSON('/a/app/friend/quest/check/nick.do?_input_encode=UTF-8',{'nick':nick},function(results){
				if(results.code == 0){
					$.iCard.InviteFollowDialog.show({
						'noCheck': true,//不检测，直接弹出对话框
						'nick': results.data.nick,
						'xpt': results.data.xpt,
						'fromType': 'find_by_nick',
						'autoFollow': results.data.isAllowFollow || false
					});
				}else{
					$.inform({
						icon : 'icon-error',
						delay : 3000,
						easyClose : true,
						content : results.msg
					});
					$insideNick.focus();
				}
				if(sendingId){
					clearTimeout(sendingId);
				}
				sending = false;
			});
			sendingId = setTimeout(function(){
				sending = false;
			},5000);
		});
	},
	initCard: function(){
		var self = this;
		this.card = new $.iCard({
			bindElement: '#friend-canvas'
		});
	}
};


$(function(){
	project.init($('#friend-canvas'));
});


})(jQuery,mysohu);