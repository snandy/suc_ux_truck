;(function($,sohu){
	//================================
	/*var data = {
		showType:0,
		bonus:0,
		changeBonus:0,
		msg:''
	};	
	mysohu.task.reward({
		type:data.showType,
		a:data.bonus,
		b:data.changeBonus,
		msg:data.msg,
		fn:function(){
		}
	});*/
	//================================
	
	//助手作为一个全局对象存在
	var win = window,
		doc = document,
		ie6 = $.browser.msie && parseFloat($.browser.version) < 7;
	var inited = false,
		base = 'http://s3.suc.itc.cn/app/goldanimation/',
		version = '20120105',
		aid = (new Date()).getTime(),
		bid = 'ga_box_'+aid,
		fid = 'ga_flash_'+aid,
		toid = null;
	
	/**
	 * 金币flash动画
	 * 获得金币动画
	 * ga.plus(原始值,增加值)  最后显示结果是 原始值+增加值
	 * 失去金币动画
	 * ga.minus(原始值,减少值) 最后显示结果是 原始值-减少值
	 */
	var ga = {
		_init: function(){
			if(this.$box) return;
			if(toid) clearTimeout(toid);
			var self = this;
			this.$box = $('<div class="goldanimation-wrapper"></div>').appendTo('body').hide().html('<div class="goldanimation-wrapper-flash"></div><a href="#" class="goldanimation-wrapper-close" title="关闭"></a>');
			this.$box.find('.goldanimation-wrapper-close').bind('click',function(event){
				event.preventDefault();
				self.hide();
			});
		},
		hide: function(delay){
			if(!this.$box) return;
			if(toid) clearTimeout(toid);
			var self = this;
			if(delay){
				toid = setTimeout(function(){
					self.$box.remove();
					self.$box = null;
				},delay);
			}else{
				this.$box.remove();
				this.$box = null;
			}
		},
		flPlayOver: function(){
			this.hide(200);
		},
		plus: function(startnum,plusnum){
			this._init();
			if(this._insertFlash('addition.v'+version+'.swf',462,265,startnum,plusnum)){
				this.$box.show();
				this.adjust(462,265);
				this.$box.find('.goldanimation-wrapper-close').css({
					'top':16,
					'right':9
				});
			}else{
				this.$box.hide();
			}
		},
		minus: function(startnum,minusnum){
			this._init();
			if(this._insertFlash('subtraction.v'+version+'.swf',477,313,startnum,minusnum)){
				this.$box.show();
				this.adjust(477,313);
				this.$box.find('.goldanimation-wrapper-close').css({
					'top':35,
					'right':19
				});
			}else{
				this.$box.hide();
			}
		},
		adjust: function(w,h){
			var $w = $(win),
				l = $w.scrollLeft() + ($w.width() - w)/2,
				t = $w.scrollTop() + ($w.height() - h)/2;
			this.$box.css({
				'width':w,
				'height':h,
				'left':l < 0 ? 0 : l,
				'top':t < 30 ? 30 : t
			});
			
		},
		_insertFlash: function(f,w,h,startnum,changenum){
			this.$box.find('.goldanimation-wrapper-flash').html('<span id="'+bid+'"></span>');
			if(win.sohuFlash){
				//频道页，加载了http://www.sohu.com/sohuflash_1.js
				var sf = new sohuFlash(base+f,fid,w,h,'9');
				sf.addParam('allowscriptaccess','always');
				sf.addParam('wmode','transparent');
				sf.addParam('quality', 'high');
				sf.addVariable('startnum',startnum);
				sf.addVariable('changenum',changenum);
				sf.write(bid);
				return true;
			}
			else if(win.swfobject && win.swfobject.embedSWF){
				//我的搜狐swfobject2.2
				var soParams = {
					flashvars: {
						'startnum': startnum,
						'changenum': changenum
					},
					param: {
						'quality': 'high',
						'wmode': 'transparent',
						'allowscriptaccess': 'always'
					},
					attributes: {
						'id': fid,
						'name': fid
					}
				};
				swfobject.embedSWF(base+f, bid, w, h, '9.0.0','http://s3.suc.itc.cn/mysohu/plugins/swfobject/expressInstall.swf',soParams.flashvars,soParams.param,soParams.attributes);
				return true;
			}
			return false;
		}
	};
	
	win.MS_goldanimation = ga;//作为全局变量存在
	
	/**
	 * @desc 做任务领取奖励
	 */
	sohu.gold = {
		reward:function(options){
			var opt = $.extend({
				type:0,
				a:0,
				b:0,
				msg:'',
				fn:function(){
				}
			},options || {}),a,b,msg,fn,delay = 5000;
			a = opt.a - opt.b;
			b = opt.b;
			msg = opt.msg ? opt.msg + '成功，' : '';
			fn = opt.fn;
			switch(opt.type){
				case 0:
					//没有加金币提示信息
					fn && setTimeout(function(){
						fn();
					},500);
					break;
				case 1:
					//文字版增加金币
					$.inform({
						icon: 'icon-success',
						delay: 1000,
						easyClose: true,
						content: msg + '恭喜您获得' + b +'枚金币<img width="16" height="16" src="http://s3.suc.itc.cn/d/icon_gold.gif" />。',
						onClose:function(){
							fn && fn();
						}
					});
					break;
				case 2:
					//文字版减少金币
					$.inform({
						icon: 'icon-notice',
						delay: 1000,
						easyClose: true,
						content: msg + '您失去' + b +'枚金币<img width="16" height="16" src="http://s3.suc.itc.cn/d/icon_gold.gif" />。',
						onClose:function(){
							fn && fn();
						}
					});
					break;
				case 3:
					//flash动画版增加金币
					ga.plus(a,b);
					fn && setTimeout(function(){
						fn();
					},delay);
					break;
				case 4:
					//flash动画版减少金币
					ga.minus(a,b);
					fn && setTimeout(function(){
						fn();
					},delay);
					break;
				default:
					break;
			};
		}
	};
})(jQuery,mysohu);