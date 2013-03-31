/*
* 系统设置
*
*/
;
(function($,ms){

if(ms.SystemSetting){
	return;
}

ms.SystemSetting = {};//设置系统

var PrivacyMenu = function(opts){
	var defaults = {
		appendTo: 'body'
	};
	this.options = $.extend(defaults,opts || {});
	this.onSelectItem = function(n,v){
		//empty function
	};
	this.menulist = {};//用来存储选项对照
	this.init();
};
PrivacyMenu.prototype = {
	init: function(){
		var self = this;
		this.$container = $('<div class="profile-intimity-menu-list"></div>').appendTo($(this.options.appendTo)).hide();
		
		this.$container.click(function(event){
			var $target = $(event.target);
			if($target.closest('a[data-value]').length){
				$target = $target.closest('a[data-value]');
				self.onSelectItem($target.text(),$target.attr('data-value'));
			}
		});
		$(document).click(function(event){
			self.hide();
		});
	},
	build: function(items){
		var html = '<ul>';
		for(var i=0;i< items.length;i+=1){
			html += '<li><a href="javascript:void(0)" data-value="'+items[i].v+'">'+items[i].n+'</a></li>';
		}
		html += '</ul>';
		this.$container.html(html);
	},
	show: function(params){
		if($.isFunction(params.onSelectItem)){
			this.onSelectItem = params.onSelectItem;
		}
		if(!this.menulist[params.menu]){
			return;
		}
		this.build(this.menulist[params.menu]);
		this.adjust(params.at);
	},
	hide: function(){
		this.$container.hide();
	},
	adjust: function(at){
		this.$container.show();
		var offset = at.offset();
		this.$container.css({
			left: offset.left,
			top: offset.top + at.outerHeight()
		});
	},
	isVisible: function(){
		return this.$container.is(':visible');
	},
	addMenu: function(name,menu){
		this.menulist[name] = menu;
	}
};

ms.SystemSetting.PrivacyMenu = PrivacyMenu;



})(jQuery,MYSOHU);