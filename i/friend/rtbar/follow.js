/*
 *	空间 首页 他关注的人
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var ajaxurl = '/a/app/friend/person/attentions/frag.do';

function getXpt(){
	return window['_xpt'] || (window.$space_config ? $space_config._xpt : '');
}

function getURL(){
	return window.$space_config ? $space_config._url : '';
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
		this.$this = $('#rtbarFollowBox');
		if(!this.$this.length){
			return;
		}
		this.getPage();
		if($.iCard){
			this.card = new $.iCard({
				bindElement: '#rtbarFollowBox',
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
		html.push('<a class="change" href="'+getURL()+'friend/index.htm">更多&gt;&gt;</a>');
		if(data.more){
			html.push('我跟随的人');
		}else{
			html.push('TA跟随的人');
		}
		html.push('</h3>');
		html.push('<ul class="rtbar-com">');
		for(i=0;i<len;i+=1){
			html.push('<li>');
			html.push(this.getLiHTML(data.list[i]));
			html.push('</li>');
		}
		if(len == 0){
			if(data.more){
				html.push('<span class="visitors-txt">你还没有跟随任何人</span>');
			}else{
				html.push('<span class="visitors-txt">TA还没有跟随任何人</span>');
			}
		}
		html.push('</ul>');
		this.$this.html(html.join(''));		
		noborder(this.$this);
	},
	getLiHTML: function(data){
		return '<a href="'+data.blog+'" target="_blank" title=""><img src="'+data.photo+'" width="40" height="40" data-card-action="xpt='+data.xpt+'&type=simple&pageid=81" data-card-type="isohu" data-card="true" /></a>';
	}
};

$(function(){
	project.init();
});

})(jQuery);