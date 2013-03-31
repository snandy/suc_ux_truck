/*
 *	空间 首页 最近访客
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var ajaxurl = 'http://stat.i.sohu.com/guest/frag/recents.do?callback=?';

function getXpt(){
	return window['_xpt'] || (window.$space_config ? $space_config._xpt : '');
}

function noborder($ele){
	//noborder
	if(!$ele.next().length){
		$ele.find('ul').addClass('noborder');
	}
}

var project = {
	card: null,//名片
	xhr: null,//ajax请求，同时只能有一个请求
	init: function(){
		var self = this;
		this.$this = $('#rtbarGuestBox');
		if(!this.$this.length){
			return;
		}
		this.getPage();
		if($.iCard){
			this.card = new $.iCard({
				bindElement: '#rtbarGuestBox',
				side:'left'
			});
		}
	},
	getPage: function(){
		var self = this,xpt = getXpt();
		$.getJSON(ajaxurl,{'xpt':xpt},function(results){
			if(results.code == 0){
				self.build(results.data);
				self.inited = true;
			}
		});
	},
	build: function(data){
		var self = this,html = [],i,len = data.list.length > 8 ? 8 : data.list.length;
		html.push('<h3>');
		if(data.more){
			html.push('<a class="change" href="http://i.sohu.com/guest/home/recentlist.htm">更多&gt;&gt;</a>');
		}
		html.push('最近访客</h3>');
		html.push('<ul class="rtbar-com">');
		for(i=0;i<len;i+=1){
			html.push('<li>');
			html.push(this.getLiHTML(data.list[i]));
			html.push('</li>');
		}
		if(len == 0){
			if(data.more){
				html.push('<span class="visitors-txt">还没有人访问过你，先去拜访一下别人吧，他们也会回访你的！</span>');
			}else{
				html.push('<span class="visitors-txt">还没有人访问过TA</span>');
			}
		}
		html.push('</ul>');
		this.$this.html(html.join(''));
		noborder(this.$this);
	},
	getLiHTML: function(data){
		return '<a href="'+data.blog+'" target="_blank" title="'+data.nick+'"><img src="'+data.photo+'" width="40" height="40" data-card-action="xpt='+data.xpt+'&type=simple&pageid=51" data-card-type="isohu" data-card="true" /></a>';
	}
};

$(function(){
	project.init();
});

})(jQuery);