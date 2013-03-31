/*
 *	babyapp-dialog
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($){
var app = 'babyapp';

var ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

//用来管理打开的所有弹出窗口
var dialogList = [];
var clearDialog = function(){
	for(var i=0;i<dialogList.length;i+=1){
		dialogList[i].destroy();
	}
	dialogList = [];
};

//弹出窗口的基础类
var BasicDialog = function(settings){
	var defaults = {
		modal: false
	};
	this.options = $.extend(defaults, settings);
};
BasicDialog.prototype = {
	init: function(){
		this.container = this.initDialog();
		if(this.options.modal){
			this._initMask();
		}
		$('body').append(this.container);
		this.container.hide();
	},
	initDialog: function(){
		var $container = $('<div class="calendar-data-apprize-win"></div>');
		var html = '';
		html += '<div class="calendar-data-apprize-win-con">';
		html += '<span title="关闭" class="close-icon"><a href="javascript:void(0)">关闭</a></span>';
		html += '<h2 class="babyapp-title"><span title="搜狐母婴" class="sohu-baby-icon">搜狐母婴</span></h2>';
		html += '<p class="babyapp-content"></p>';
		html += '<h3><span class="babyapp-content-time"></span></h3>';
		html += '</div>';
		return $container.html(html);
	},
	_initMask: function(){
		var templateMask = $('<div class="jquery-dialog-mask jquery-dialog-mask-transparent"></div>').appendTo('body');
		templateMask.hide();
		templateMask.css('zIndex','200');
		this.container.data('mask',templateMask);
	},
	_bindEvent: function(){
		var that = this;
		this.container.click(function(event){
			var $target = $(event.target);
			if($target.closest('.close-icon').length){
				that.close();
			}
		});
		this.bindEvent();
	},
	close: function(){
		this.container.hide();
		if(this.options.modal){
			this.container.data('mask').hide();
			$('#'+this.container.data('mask').data('iShadow')).hide();
		}
	},
	destroy: function(){
		if(this.options.modal){
			this.container.data('mask').removeShadow().remove();
		}
		this.container.remove();
	},
	adjust: function(offset){
		// adjust mask size
		var $body = $(document.body),$window = $(window);
		var $mask = this.container.data("mask");
		if ($mask) {
			if (ieBug) {
				$mask.css("position", "absolute")
				.height(Math.max($body.height(), $window.height()))
				.width(Math.max($body.width(), $window.width()))
				.iShadow({position: "absolute", referPoint: "topleft"});
			}
			else {
				$mask
				.iShadow({position: "fixed", referPoint: "topleft"});
			}
		}
		var box = $('#innerCanvas > div').eq(0);
		var offsetLeft = box.offset().left + (box.width() - this.container.width())/2;
		var offsetTop = $(window).scrollTop() + ($(window).height() - this.container.height())/2;
		
		if(offset){
			offsetLeft = offset.left;
			offsetTop = offset.top;
			this.container.css({
				'width': offset.width,
				'height': offset.height
			});
		}
		this.container.css({
			'left': offsetLeft,
			'top': offsetTop < 30 ? 30 : offsetTop
		});
	},
	bindEvent: function(){

	},
	maskShow: function(){
		if(this.options.modal){
			this.container.data('mask').show();
			$('#'+this.container.data('mask').data('iShadow')).show();
		}
		
	},
	show: function(){
		this.container.show();
		this.adjust();
		this.maskShow();
	},
	getOffset: function(){
		var offset = this.container.offset();
		return {
			left: offset.left,
			top: offset.top,
			width: this.container.width(),
			height: this.container.height()
		}
	}
};

//官方弹窗
var OfficialDialog = function(settings){
	BasicDialog.call(this,settings);
	this.init();
	this._bindEvent();
};
OfficialDialog.prototype = new BasicDialog();
OfficialDialog.prototype.show = function(title,text,datetime){
	this.container.find('h2.babyapp-title').html('<span title="搜狐母婴" class="sohu-baby-icon">搜狐母婴</span>'+title);
	this.container.find('p.babyapp-content').html(text);
	this.container.find('span.babyapp-content-time').html(datetime);
	this.container.show();
	this.adjust();	
};
//用户弹窗
var UserDialog = function(settings){
	BasicDialog.call(this,settings);
	this.onDelete = null;
	this.init();
	this._bindEvent();
};
UserDialog.prototype = new BasicDialog();
UserDialog.prototype.initDialog = function(){
	var $container = $('<div class="calendar-data-info-win"></div>');
	var html = '';
	html += '<div class="calendar-data-info-win-con">';
	html += '<span title="关闭" class="close-icon"><a href="javascript:void(0)">关闭</a></span>';
	html += '<p class="babyapp-content">aa</p>';
	html += '<h3><span class="babyapp-content-time"></span>&nbsp;&nbsp;<span class="comment"><a class="babyapp-content-del" href="javascript:void(0)">删除</a><a class="babyapp-content-comment" href="javascript:void(0)">评论</a></span></h3>';
	html += '<div class="baby-win-comment-wrapper"></div>';
	html += '</div>';
	return $container.html(html);
};
UserDialog.prototype.bindEvent = function(){
	var that = this;
	this.container.find('a.babyapp-content-del').click(function(){
		if($.isFunction(that.onDelete)){
			that.onDelete();
		}
	});
};
UserDialog.prototype.show = function(text,datetime,cid,callback){
	var self = this;
	this.container.find('p.babyapp-content').html(text);
	this.container.find('span.babyapp-content-time').html(datetime);
	this.container.show();
	this.onDelete = callback;
	//初始化评论
	this.container.find('.baby-win-comment-wrapper').empty().append('<div class="baby-comment-wrapper"></div>');
	this.container.find('.babyapp-content-comment').html('评论');
	var $commentBox = this.container.find('.baby-comment-wrapper');
	if(ieBug){
		try{
			//预加载表情和按钮图片
			new Image('http://s3.suc.itc.cn/i/baby_new/d/baby_info_button_bg.gif');
			new Image('http://s3.suc.itc.cn/d/icon_emoticon.gif');
		}catch(e){}
	}
	require('core::util[cookie]','app::discuss', function(util, Comment){
		var comment = new Comment({
			elem : self.container.find('.babyapp-content-comment')[0],
			dom : self.container.find('.baby-comment-wrapper')[0],
			usericon : util.cookie,
			appId : 'baby',
			xpt : $space_config._xpt,
			load : {
				page : true
			},
			parentid : cid,
			hideFwd : true,
			pagesize: 5,
			onSuccess : function(cmt) {
				if(cmt.commentcount){
					util.refreshCount(this.elem, cmt.commentcount);
					//self.adjust();
				}
			}
		});
		comment.data('EmoteHandler').onEmote = function(emote){
			var $btn =  comment.find('span.btn-emot');
			emote.css({
				left : $btn.position().left - 98  + "px",
				top : $btn.position().top + 14 + "px"
			});
			comment.tf.focus();
		};
		self.adjust();
	});
};
//录入框
//textarea文本检查
var regFilter = /[<>]+/i;
var regHTML = /<\/?[^<>]+>/i;
var regScript = /<[\s]*?script[^>]*?>[\s\S]*?<[\s]*?\/[\s]*?script[\s]*?>/i;
var TEXT_MAXLENGTH = 140;

function emptyContentAlert(a){
	var b = [255, 200, 200];
	a.style.backgroundColor = "rgb(" + b[0] + "," + b[1] + "," + b[2] + ")";
	var c = setInterval(function(){
		b[1] += 10;
		b[2] += 10;
		if (b[1] > 255) {
			clearInterval(c);
		}
		a.style.backgroundColor = "rgb(" + b[0] + "," + b[1] + "," +
		b[2] +
		")";
	}, 100);
}
function checkTextarea(edit,textarea,isSubmit){
	var n = edit.data('textLength');
	var text = $.trim(textarea.val().replace(/\r?\n/g, ''));
	var result = {
		status : true,
		reset : false,
		text : ''
	};
	if(isSubmit){
		if($.trim(text) == ''){
			return {
				status : false,
				reset : true,
				text : '请输入内容'
			}
		}
	};
	if(n > TEXT_MAXLENGTH){
		result.status = false;
		result.text = '已超出' + (n-TEXT_MAXLENGTH) + '个字';
	}
	else if(regFilter.test(text) || regHTML.test(text) || regScript.test(text)){
		result.status = false;
		result.text = '请不要输入非法字符';
	};
	return result;
};

var InputDialog = function(settings){
	BasicDialog.call(this,settings);
	this.onSubmit = null;
	this.init();
	this._bindEvent();
};
InputDialog.prototype = new BasicDialog();
InputDialog.prototype.initDialog = function(){
	var $container = $('<div class="calendar-data-input-win"></div>');
	var html = '';
	html += '<div class="calendar-data-input-win-con" style="_left:5px;_top:5px;_margin:0">';
	html += '<span title="关闭" class="close-icon"><a href="javascript:void(0)">关闭</a></span>';
	html += '<div class="calendar-data-input-win-con-title"></div>';
	html += '<textarea></textarea>';
	html += '<div class="emit-box clearfix">'
	html += '<div class="button"><span class="disabled"><a href="javascript:void(0)"><em class="shadow">发&nbsp;表</em><em>发&nbsp;表</em></a></span></div>'
	html += '<div class="emit-text"><span class="error-clew">已超出10个字</span><span class="babyapp-text-counter"><em>0</em>/'+TEXT_MAXLENGTH+'字</span></div>';
	html += '</div>';
	html += '</div>';
	return $container.html(html);
};
InputDialog.prototype.bindEvent = function(){
	var that = this;
	var edit = this.container;
	var tip = this.container.find('span.error-clew').hide();
	var counter = this.container.find('span.babyapp-text-counter');
	var btn = this.container.find('div.button span');
	var textarea = this.container.find('textarea');
	textarea.textbox({
		maxLength: TEXT_MAXLENGTH,
		cjk: true,
		wild: true,
		onInput: function(event,status){
			var n = status.maxLength - status.leftLength;
			if(n > status.maxLength){
				counter.hide();
			}else{
				counter.show().find('em').html(n);
			};
			if(textarea.val().length > 0){
				btn.removeClass('disabled');
			}else{
				btn.removeClass().addClass('disabled');
			}
			edit.data('textLength',n);
			var ct = checkTextarea(edit,textarea);
			if(ct.status){
				tip.hide();
			}else{
				tip.html(ct.text).show();
			};
		}
	});
	btn
	.hover(function(){
		if(this.className != 'disabled'){
			this.className = 'hover';
		}
	},function(){
		if(this.className != 'disabled'){
			this.className = '';
		}
	})
	.mousedown(function(){
		if(this.className != 'disabled'){
			this.className = 'down';
		}
	})
	.mouseup(function(){
		if(this.className != 'disabled'){
			this.className = 'hover';
		}
	})
	.click(function(){
		if(this.className == 'disabled'){
			return;
		}
		var ct = checkTextarea(edit,textarea,true);
		if(ct.status){
			tip.hide();
			if($.isFunction(that.onSubmit)){
				that.onSubmit($.trim(textarea.val().replace(/\r?\n/g, '')));
			}
		}else{
			emptyContentAlert(textarea[0]);
			tip.html(ct.text).show();
			if(ct.reset){
				counter.show().find('em').html('0');
				textarea.val('').focus();
			}
		};
	});
};
InputDialog.prototype.show = function(callback){
	var that = this;
	this.container.show();
	this.adjust();
	this.maskShow();
	this.container.find('span.error-clew').hide();
	this.container.find('span.babyapp-text-counter em').html('0');
	this.container.find('div.button span').removeClass().addClass('disabled');
	this.container.find('textarea').val('').focus();
	this.onSubmit = callback;
	
	
};
//周，月模式的删除确认框
var MonthDeleteConfirmDialog = function(settings){
	BasicDialog.call(this,settings);
	this.onAccept = null;
	this.init();
	this._bindEvent();
};
MonthDeleteConfirmDialog.prototype = new BasicDialog();
MonthDeleteConfirmDialog.prototype.initDialog = function(){
	var $container = $('<div class="calendar-data-info-del-clew-win"></div>');
	var html = '<div class="calendar-data-info-del-clew-win-bg"></div>';
	html += '<div class="calendar-data-info-del-clew-win-con">';
	html += '确定要删除此条备忘吗？删除之后不可恢复';
	html += '<div class="button-box">';
	html += '<div class="button"><span class="babyapp-btn-delete"><a href="javascript:void(0)"><em class="shadow">删除</em><em>删除</em></a></span></div>';
	html += '<div class="button"><span class="babyapp-btn-cancel"><a href="javascript:void(0)"><em class="shadow">取消</em><em>取消</em></a></span></div>'
	html += '</div>'
	html += '</div>';
	return $container.html(html);
};
MonthDeleteConfirmDialog.prototype.bindEvent = function(){
	var that = this;
	var deleteBtn = this.container.find('span.babyapp-btn-delete');
	var cancelBtn = this.container.find('span.babyapp-btn-cancel');
	
	deleteBtn
	.hover(function(){
		this.className = 'hover';
	},function(){
		this.className = '';
	})
	.mousedown(function(){
		this.className = 'down';
	})
	.mouseup(function(){
		this.className = 'hover';
	})
	.click(function(){
		if($.isFunction(that.onAccept)){
			that.onAccept();
		}
	});

	cancelBtn
	.hover(function(){
		this.className = 'hover';
	},function(){
		this.className = '';
	})
	.mousedown(function(){
		this.className = 'down';
	})
	.mouseup(function(){
		this.className = 'hover';
	})
	.click(function(){
		that.close();
	});
};
MonthDeleteConfirmDialog.prototype.show = function(offset,callback){
	this.container.show();
	this.adjust(offset);
	this.maskShow();
	
	this.onAccept = callback;
	
};
//天模式的删除确认框
var DayDeleteConfirmDialog = function(settings){
	BasicDialog.call(this,settings);
	this.onAccept = null;
	this.init();
	this._bindEvent();
};
DayDeleteConfirmDialog.prototype = new BasicDialog();
DayDeleteConfirmDialog.prototype.initDialog = function(){
	var $container = $('<div class="calendar-data-info-del-win"></div>');
	var html = '<div class="calendar-data-info-del-win-bg"></div>';
	html += '<div class="calendar-data-info-del-win-con">';
	html += '<span title="关闭" class="close-icon"><a href="javascript:void(0)">关闭</a></span>';
	html += '确定要删除此条备忘吗？删除之后不可恢复';
	html += '<div class="button-box">';
	html += '<div class="button"><span class="babyapp-btn-delete"><a href="javascript:void(0)"><em class="shadow">删除</em><em>删除</em></a></span></div>';
	html += '<div class="button"><span class="babyapp-btn-cancel"><a href="javascript:void(0)"><em class="shadow">取消</em><em>取消</em></a></span></div>'
	html += '</div>'
	html += '</div>';
	return $container.html(html);
};
DayDeleteConfirmDialog.prototype.bindEvent = MonthDeleteConfirmDialog.prototype.bindEvent;
DayDeleteConfirmDialog.prototype.show = function(callback){
	this.container.show();
	this.adjust();
	this.maskShow();
	
	this.onAccept = callback;
	
};
$[app].dialog = {
	clear: function(){
		clearDialog();
	},
	official: function(settings){
		var d = new OfficialDialog(settings);
		dialogList.push(d);
		return d;
	},
	user: function(settings){
		var d = new UserDialog(settings);
		dialogList.push(d);
		return d;
	},
	input: function(settings){
		var d = new InputDialog(settings);
		dialogList.push(d);
		return d;
	},
	monthDelete: function(settings){
		var d = new MonthDeleteConfirmDialog(settings);
		dialogList.push(d);
		return d;
	},
	dayDelete: function(settings){
		var d = new DayDeleteConfirmDialog(settings);
		dialogList.push(d);
		return d;
	}
};


})(jQuery);