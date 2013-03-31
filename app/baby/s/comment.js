/*
 *	母婴app 后台 天模式
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'babyapp';

var PAGE_NAME = 'comment';



var project = {
	$this: null,
	miniCalendar: null,
	options: {
		date: new Date()
	},
	dialog: {
		confirm: null
	},
	init: function($this,options){
		var self = this;
		this.$this = $this;
		$.extend(this.options,options || {});
		/*
		执行每次都需要重复绑定的事件
		如suggest初始化
		*/		

		//清理之前页面可能存在的对话框
		ms[app].dialog.clear();
			
		this.initComment();//初始化评论

		//统一替换表情
		$this.find('[data-babyapp-ctext]').each(function(){
			var $o = $(this);
			$o.html(mysohu.babyapp.Emot.trans.cut($o.attr('data-babyapp-ctext').replace(/&/g,'&amp;')));
		});
		/*
		如果当前页面就是本页面，则执行静态绑定
		*/
		if($this.data('baby-page') && $this.data('baby-page') == PAGE_NAME){
			return $this;
		}
		
		/*
		下面是所有静态绑定的事件
		*/
		/*
		首先取消之前页面所有的静态绑定
		*/
		this.initCard();
		$this.unbind('.'+app).undelegate('.'+app);

		/*
		静态绑定click事件
		*/
		

		
		$this.data('baby-page',PAGE_NAME);
	},
	initComment: function(){
		var self = this;
		require('core::util[cookie]','app::discuss', function(util, Comment){
			var comment = new Comment({
				elem : self.$this.find('div.baby-show-bottom > p.comment')[0],
				dom : self.$this.find('div.baby-show-comment')[0],
				usericon : util.cookie,
				appId : 'baby',
				xpt : ms[app].getXpt(),
				load : {
					page : true
				},
				parentid : self.options.id,
				hideFwd : true,
				onSuccess : function(cmt) {
					if(cmt.commentcount){
						util.refreshCount(this.elem, cmt.commentcount);
					}
				}
			});
		});
	},
	initCard: function(){
		var self = this;
		this.card = new $.iCard({
			bindElement: this.$this
		});
	}

};



ms[app][PAGE_NAME+'Load'] = function(options) {
	var $this = $('#innerCanvas');
	project.init($this,options);
	ms[app].onPageLoaded($this);
	return $this;
};


})(jQuery,mysohu);