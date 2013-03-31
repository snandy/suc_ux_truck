/**
 * 成长系统:成长教学
 */
;(function($,sohu){
	/**
	 * @example
	 * 1.通过var popover = new mysohu.guid.Popover({css:{},text:''});的方式创建一个Popover的实例，
	 * 可以调用popover.close();方式关闭(销毁)tooltips
	 * 2.通过mysohu.guid.exec(fn);方法将回调函数添加到domReady之后函数执行队列
	 */
	var guid = (function(){
	    /**
	     * @param {} settings
	     * @desc 用户向导统一提示类
	     */
	    function Popover(settings){
	        this.__oTips__ = null;
	        this.init(settings);
	    };
		
		Popover.prototype.init = function(settings){
	        settings = $.extend(true,{},{
	            css:{
	            	left:'200px',
	                top:'100px',
	                width:'220px',
	                height:'45px',
	                position:'absolute',
	                'z-index':200,
	                display:'none'
	            },
	            fix: {
	            	left: 0,
	            	top: 0
	            },
	            text:'点击这里，更换一个头像吧！',
	            dir:'l',
	            refer: null,
	            wrap: null
	        },settings);
	        var _defaultHtml = [],
	        	_self = this,
	        	prop,
	        	style = [],
	        	fix,
	        	left,
	        	top,
	        	refer,
	        	wrap;
	        _defaultHtml.push('<div class="arrow-' + settings.dir + '"></div>');
	        _defaultHtml.push('<a href="javascript:void(0);" class="tips-close"></a>');
	        _defaultHtml.push('<div class="tips-con">')
	        _defaultHtml.push(settings.text);
	        _defaultHtml.push('</div></div>');
	
	        this.__oTips__ = $('<div/>');
	        this.__oTips__.addClass('gloab-arrowtips').html(_defaultHtml.join(''));
	        
	        $(document.body).append(this.__oTips__);
	        
	        //close事件
	        this.__oTips__.find('.tips-close').click(function(){
	            _self.__oTips__.fadeOut(500,function(){
		    		_self.__oTips__.remove();
		    	});
	        });
	        
	        refer = settings.refer;//参照元素
	        wrap = settings.wrap;//最外层容器元素
	        fix = settings.fix;
	        
			function deferred() {
				if(wrap && !wrap.is(':visible')) {
					setTimeout(deferred, 10);
				}else{
					//计算tooltips显示位置
			        if(refer) {
			        	left = refer.offset().left + fix.left;
		        		top = refer.offset().top + fix.top;
			        	
			        	settings.css.left = left + 'px';
			        	settings.css.top = top + 'px';
			        }
			        
			       	for(prop in settings.css){
			       		style.push(prop + ':' + settings.css[prop]);
			       	}
			       	style = style.join(';');
			       	_self.__oTips__.attr('style', style);
			       	_self.__oTips__.fadeIn(500);
				}
			}
			
			//控制提醒覆层显示位置
			deferred();
	        
			//函数节流
			function throttle(fn, delay) {
				var timer, context = this;
				return function(){
					var args = arguments;
					clearTimeout(timer);
					timer = setTimeout(function(){
						fn.apply(context, args);
					},delay);
				};
			}
			
			//窗口大小改变时候，调整提示覆层位置
			$(window).unbind('resize.popover').bind('resize.popover', throttle(function() {
				if(refer) {
		        	left = refer.offset().left + fix.left;
		        	top = refer.offset().top + fix.top;
		        	
	        		_self.__oTips__.css({left: left, top: top});
		        }
			}, 10));
		}
		
	    Popover.prototype.close = function(){
	    	var _self = this;
	    	this.__oTips__.fadeOut(500,function(){
	    		_self.__oTips__.remove();
	    	});
	    };
	
	    /**
	     * @param {} fn
	     * @desc 执行回调函数
	     */
	    function exec(fn){
	    	var search = window.location.search,
	    		regexp = /eduid=([^&]+)/,
				match = search.match(regexp),
				id;
			if(match){
				id = match[1];
				 if(fn){
		            //添加回调函数到domReady之后函数执行队列
		            $(function(){
		                fn(id);
		            });
		        }
			}
	    };
	
	    return {
	        Popover:Popover,
	        exec:exec
	    };
	})();
	sohu.guid = guid;
	
	//新手教学
	sohu.guid.exec(function(id){//id为字符串类型
		var popover,
			options;
		if(id == 6){//点击立刻发布微博，光标自动插入发布框内
			setTimeout(function(){
				$('#onesentencetext').focus();
			},500);
		}else if(id == 7){//博客发布框提示信息
			//点击撰写博客后显示提示
			$('#writeblog').click(function(){
				var wrap = $('#blogeditorbox'),
					refer = $('.be-footer .blog-editor-spread');
				options = {
					css: {
			            height:'36px',
			            width:'140px'
					},
					fix: {
						left: 30,
						top: -15
					},
					text: '想要更大的博客编辑界面吗，就点这里！',
					wrap: wrap,
					refer: refer
				};
				popover = new sohu.guid.Popover(options);
			});
			//展开微博发布框后隐藏提示
			$('.blog-editor-spread').click(function(){
				if(popover)
					popover.close();
			});
		}
	});
})(jQuery,mysohu);