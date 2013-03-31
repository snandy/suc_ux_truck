/*
 *	babyapp-dialog
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){
var app = 'babyapp';

var win = window,
	doc = document,
	ieBug = $.browser.msie && parseFloat($.browser.version) < 7;


//分页
var pager = function(settings){
	var defaults = {
		current: 1,
		max:1,
		maxShow: 9,//最大显示的页数 1...3456789...20
		appendTo: '',
		autoUpdate: true,//点击页号时是否自动更新页码状态
		onClick: function(pagenum){}//可以在回调内更新页码
	};
	this.options = $.extend(defaults,settings);
	this.init();
};
pager.prototype = {
	init: function(){
		var that = this;
		this.container = $('<div class="list-pagination"></div>').appendTo($(this.options.appendTo));
		this.container.click(function(event){
			var $target = $(event.target);
			
			//点击了页码
			if($target.closest('[data-pagenum]').length){
				$target = $target.closest('[data-pagenum]');
				if($target.length){
					if(that.options.autoUpdate){
						that.update($target.attr('data-pagenum'));
					}
					if($.isFunction(that.options.onClick)){
						that.options.onClick($target.attr('data-pagenum'));
					}
				}
			}
		});
		this.update(this.options.current);
	},
	update: function(pagenum,max){
		max = parseInt(max,10) || this.options.max;
		max = max < 1 ? 1 : max;
		pagenum = parseInt(pagenum,10) || 1;
		pagenum = pagenum < 1 ? 1 : pagenum;
		pagenum = pagenum > max ? max : pagenum;
		this.options.current = pagenum;
		this.options.max = max;
		if(max == 1){
			this.container.html('');
			return;
		}

		var len = this.options.maxShow - 2;//减掉第一页和最后一页，中间显示的页码数
		var differ = Math.floor(len/2);//需要把当前页显示在中间，所以求左右增减的数量
		var start = (pagenum - differ) > 2 ? pagenum - differ : 2;//起始页码要大于等于2
		var end = (start + len) < max ? start + len : max;//结束页码为起始页码+len，不能大于max
		//如果结束页码和起始页码数量不够len，则需要从结束往开始补充
		if((end - start) < len){
			start = end - len;
			if(start < 2){
				start = 2;
			}
		}
		var i;
		var html = '<span class="total">共'+max+'页</span>';
		if(pagenum == 1){
			html += '<span class="page-cur">1</span>';
		}else{
			html += '<a href="javascript:void(0)" class="page-prev" data-pagenum="'+(pagenum-1)+'"><span>上一页</span></a>';
			html += '<a href="javascript:void(0)" data-pagenum="1">1</a>';
		}
		if(start > 2 && max > this.options.maxShow){
			html += '<span class="page-break">...</span>';
		}
		for(i = start;i< end;i+=1){
			if(i == pagenum){
				html += '<span class="page-cur">'+i+'</span>';
			}else{
				html += '<a href="javascript:void(0)" data-pagenum="'+i+'">'+i+'</a>';
			}
		}
		if(end < max){
			html += '<span class="page-break">...</span>';
		}
		if(pagenum == max && max != 1){
			html += '<span class="page-cur">'+max+'</span>';
		}else if(max != 1){
			html += '<a href="javascript:void(0)" data-pagenum="'+max+'">'+max+'</a>';
			html += '<a href="javascript:void(0)" class="page-next" data-pagenum="'+(pagenum+1)+'"><span>下一页</span></a>';
		}
		
		this.container.html(html);
	},
	show: function(){
		this.container.show();
	},
	hide: function(){
		this.container.hide();
	}
};




//暴露的接口
ms.babyapp.pager = pager;


})(jQuery,mysohu);