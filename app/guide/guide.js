/**
 * 成长系统js
 */
;(function($,ms){
    var win = window,
        doc = document,
        ie6 = $.browser.msie && parseFloat($.browser.version) < 7,
        xpt = $space_config._xpt,
        cookiename = 'suc_newcomerguide_ic_';//新用户引导标志位，值为 xpt|1

    //ie6下垂直水平居中
    function ie6Fixed($o,left,top,st){
        $(doc).scrollTop(0);
        $o[0].style.cssText = 'left:'+left+'px;top:'+(top+st)+'px;top:expression(documentElement.scrollTop + ' + top + ' + "px");';
    }

    //第三步，欢迎页
    var welcome = {
        init: function(callback){
            var self = this;
            this.$mask = $('<div class="quest-mask when-guide-over-remove"></div>');
            this.$box = $('<div class="guide-over when-guide-over-remove"></div>');

            this.$box.html(['<a class="close" href="javascript:void(0)"></a>','<a class="btn-over" href="javascript:void(0)"></a>'].join(''));

            $('body').append(this.$mask).append(this.$box);

            this.$box.find('a').bind('click',function(){
				//log
				$.getJSON('/a/guide/anaylse.htm?type=complete3', function() {
					self.$box.hide();
					$(win).unbind('resize.newcomercomplete');
					callback();
				});
               
            });

            this.adjust();
            $(win).bind('resize.newcomercomplete',function(){
                self.adjust();
            });
            //$.cookie('suc_newcomerguide_ic_' + userId,null);
        },
        adjust: function(){
            var self = this,
                $body = $('body'),
                dh = $(doc).height(),
                dw = $(win).width(),
                wh = $(win).height(),
                boxw = 750,
                boxh = 511;

            var top = (wh - boxh)/2;
            var left = (dw - boxw)/2;
            if(!ie6){
                this.$box.css({
                    'left': left >= 0 ? left : 0,
                    'top': top < 0 ? 0 : top
                });
            }else{
                ie6Fixed(this.$box,left >= 0 ? left : 0,top < 0 ? 0 : top,$(doc).scrollTop());
            }
            this.$mask.width(dw).height(wh);
        }
    };

    function getCookie(){
        var value = $.cookie(cookiename);
        if(!value) return false;
        var arr = value.split('|');
        if(arr[0] == xpt){
            return arr[1];
        }
        return false;
    }
	
	function gotoIndexNow(){
		$.getJSON('/a/guide/anaylse.htm?type=experience', function() {
			win.location.reload();
		});
	}

    function init(){
        if(getCookie() == 1){
            //需要继续用户引导
            (function(){
            	//隐藏助手
            	function hideAssistant(){
            		if(!mysohu.assistant){
            			setTimeout(hideAssistant,1);
            		}else{
            			mysohu.assistant.$dom.hide();
            		}
            	};
            	hideAssistant();
            	
                loadResource('/i/guide/d/guide.css');
                welcome.init(function(){
                	//隐藏用户助手
                    stepThree.init(function(){
						//显示奇遇
						stepFour.init(function(){
							win.location.reload();
						});
						foxHint.init(gotoIndexNow);
                    });
					foxHint.init(gotoIndexNow);
                });
            })();
            //清除旧的cookie
    		$.cookie(cookiename, null, {path: "/", domain: "i.sohu.com"});
        }
    };
	//左下角的护理
	var foxHint = {
		init: function(callback){
			var self = this;
			this.callback = callback || function(){};

			if(this.$box){
				this.$box.show();
				return;
			}
			this.$box = $('<div class="guide-fox-tips-wrapper when-guide-over-remove"></div>');

			var html = [
				'<div class="fox-bg"></div>',
				'<div class="guide-fox-tips">',
					'<div class="arrow"></div>',
					'<div class="guide-fox-tips-con">',
						'欢迎来到我的搜狐世界！在这里 用多种方式记录你的兴趣，用鼠 标摸摸看吧！',
					'</div>',
					'<div class="btn-wrapper">',
						'<div class="btn"><span class="ui-btn btn-green-h20"><span class="foxhint-action">立即体验</span></span></div>',
						'<a href="javascript:void(0);" class="foxhint-action">我知道了</a>',
					'</div>',
				'</div>'
			];
            this.$box.html(html.join('')).appendTo('body');
			
			this.$box.find('.foxhint-action').click(function(){
				self.close();
			}); 

		},
		close: function(){
			this.callback();
		}
	};
    //第四步，导航条提示
    var stepThree = {
        init: function(callback){
            var self = this,
                html = [],
                list = ['mini-blog','blog','photo','video','comment'],
                link = {
                    'home': 'http://i.sohu.com/',
                    'mini-blog': 'http://i.sohu.com/app/mblog/',
                    'blog': 'http://i.sohu.com/blog/home/entry/index.htm',
                    'photo': 'http://i.sohu.com/album/home/latest/',
                    'video': 'http://i.sohu.com/video/home/newestList.htm',
                    'comment': 'http://i.sohu.com/scomment/home/all/'
                };
            this.callback = callback || function(){};
            this.$box = $('<div class="guide-submit-wrapper when-guide-over-remove"></div>');

            html.push('<ul class="guide-submit-nav-list">');
            html.push('<li class="home"></li>');
            for(var i=0,len = list.length;i<len;i+=1){
                html.push('<li class="'+list[i]+'">');
                html.push('<div class="border-box" style="display:none"></div><div style="display:none" class="fox-tips-wrapper"><span class="fox"></span><span class="fox-tips"></span><span class="close"></span><a class="tips-btn" href="'+link[list[i]]+'"></a><a class="'+(i == len - 1 ? 'tips-btn-goon' : 'tips-btn-goon')+'" href="javascript:void(0)"></a></div>');
                html.push('</li>')
            }
            html.push('</ul>');
            
           
            
            this.$box.html(html.join('')).appendTo('body');
            

            this.$box.find('li').bind('click',function(event){
                var cn = this.className,
                    $target = $(event.target);
                if(link[cn]){
                    win.location.href = link[cn];
                }
            });

            var $lis = this.$box.find('li:gt(0)');
            $lis.mouseenter(function(){
                $lis.find('> div').hide();
                self.showTip($(this));
            });
            /*
             $lis.find('> div').hover(function(){
             $(this).find('.close').show();
             },function(){
             $(this).find('.close').hide();
             });
             */
            $lis
                .find('.close').click(function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    self.close(true);
                })
                .end()
                .find('.tips-btn-goon,.tips-btn-over').click(function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    var $li = $(this).closest('li').next();
                    if($li.length){
                        $lis.find('> div').hide();
                        self.showTip($li);
                    }else{
                        self.close();
                    }
                });
			       
			$(win).bind('resize.newcomerst',function(){
                welcome.adjust();
            });
			//log
			this.$box.find('.tips-btn').click(function(event) {
				event.preventDefault();
                event.stopPropagation();
			
				var a = this;
				$.getJSON('/a/guide/anaylse.htm?type=experience', function() {
					location.href = a.href;
				});
			});

            this.pos();
            this.showTip($lis.eq(0));
            $(win).scrollTop(0);
        },
        showTip: function($li){
            $li.find('> div').show();
        },
        hideTip: function($li){
            $li.find('> div').hide();
        },
        pos: function(){
            var offset = $('#menuItems').offset();
            this.$box.css({
                left: offset.left,
                top: offset.top
            });
        },
        close: function(isReload){
			var self = this;
			//log
			$.getJSON('/a/guide/anaylse.htm?type=experience', function() {
				self.$box.hide();
				$(win).unbind('resize.newcomerst');
				if(isReload){
					win.location.reload();
				}else{
					self.callback();
				}
			});
        }
    };

	//第五步 奇遇提示
	var stepFour = {
		init: function(callback){
			var self = this;
			this.$box = $('<div class="guide-qy-warpper when-guide-over-remove"></div>').html('<a class="qy" href="#"></a><a class="over" href="#"></a>');

			var $qiyu = $('#feed_nav_box ul.tabs-menu li:eq(1)');
			if($qiyu.length){
				this.$box.appendTo('body');
				var offset = $qiyu.offset();
				this.$box
				.css({
					'left': offset.left - 5,
					'top': offset.top - 5
				})
				.delegate('a','click',function(event){
					event.preventDefault();
					event.stopPropagation();
					$qiyu.find('a').click();
					self.close();
					closeAll();
				});
			}else{
				//没有找到奇遇，执行后面的功能
				if($.isFunction(callback)) callback();
			}
		},
		qiyu: function(){
			var $qiyu = $('#feed_nav_box ul.tabs-menu li:eq(1)');
			if($qiyu.length){
				$qiyu.find('a').click();
				this.close();
				closeAll();
			}
		},
		close: function(){
			this.$box.hide();
		}
	};

	function closeAll(){
		//包含这个样式的都是要移除的
		$('.when-guide-over-remove').remove();
	}

    $(function(){
    	//不显示这些内容，取消初始化
        //init();
    });
})(jQuery,mysohu);
