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

//用来管理打开的所有弹出窗口
var dialogList = [];
var clearDialog = function(){
	for(var i=0;i<dialogList.length;i+=1){
		dialogList[i].destroy();
	}
	dialogList = [];
};

function emptyFunc(){
	//nothing
}

//弹出窗口的基础类
var BasicDialog = function(settings){
	var defaults = {
		modal: false
	};
	this.options = $.extend(defaults, settings);
};
BasicDialog.prototype = {
	init: function(){
		this.$container = this.initDialog();
		if(!this.options.$parent) this.options.$parent = $('#innerCanvas div.app-wrapper');
		if(!this.options.appendTo) this.options.appendTo = $('#canvas');
		if(this.options.modal){
			this._initMask();
		}
		this.$container.appendTo(this.options.appendTo);
		this.$container.hide();
	},
	initDialog: function(){
		var $container = $('<div class="baby-calendar-open-wrapper"></div>'),
			html = [
			'<div class="baby-calendar-open">',
				'<div class="baby-calendar-apprise">',
					'<span class="close-icon" title="关闭"><a href="javascript:void(0)"></a></span>',
					'<h2 class="babyapp-title"></h2>',
					'<div class="babyapp-content"></div>',
					'<span class="babyapp-content-time"></span>',
				'</div>',
			'</div>'
			].join('');
		
		return $container.html(html);
	},
	_initMask: function(){
		this.$mask = $('<div class="baby-mask" style="z-index:1"></div>').appendTo('body');
		this.$mask.hide();
	},
	_bindEvent: function(){
		var self = this;
		this.$container.delegate('.close-icon','click',function(event){
			event.preventDefault();
			self.close();
		});
		this.bindEvent();
	},
	close: function(){
		this.$container.hide();
		if(this.options.modal){
			this.$mask.hide();
		}
	},
	destroy: function(){
		if(this.options.modal){
			this.$mask.remove();
		}
		this.$container.remove();
	},
	adjust: function(offset){
		// adjust mask size
		var $win = $(win),
			ww = $win.width(),
			wh = $win.height();

		if (this.$mask) {
			this.$mask.width(ww).height(wh);
		}

		var poffset = this.options.$parent.offset();
		var offsetLeft = poffset.left + (this.options.$parent.width() - this.$container.width())/2;
		var offsetTop = $win.scrollTop() + (wh - this.$container.height())/2;
		
		if(offset){
			offsetLeft = offset.left;
			offsetTop = offset.top;
			this.$container.css({
				'width': offset.width,
				'height': offset.height
			});
		}
		this.$container.css({
			'left': offsetLeft,
			'top': offsetTop < 30 ? 30 : offsetTop
		});
	},
	bindEvent: function(){
		//会被覆盖掉的方法
	},
	maskShow: function(){
		if(this.options.modal){
			this.$mask.show();
		}
	},
	show: function(){
		this.$container.show();
		this.adjust();
		this.maskShow();
	},
	getOffset: function(){
		var offset = this.$container.offset();
		return {
			left: offset.left,
			top: offset.top,
			width: this.$container.width(),
			height: this.$container.height()
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
OfficialDialog.prototype.show = function(obj){
	var nowTime = new Date().getTime();
	this.$container.find('h2.babyapp-title').html('<span title="搜狐母婴" class="sohu-baby-icon"></span>'+obj.title);
	this.$container.find('div.babyapp-content').html(obj.text);
	this.$container.find('span.babyapp-content-time').html(ms[app].utils.timeago(nowTime,obj.datetime*1));
	BasicDialog.prototype.show.call(this);
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
	var $container = $('<div class="baby-calendar-open-wrapper"></div>'),
		html = [
		'<div class="baby-calendar-open">',
			'<div class="close-icon"><a href="javascript:void(0)"></a></div>',
			'<div class="calendar-title"><h1></h1><div class="score"><a href="javascript:void(0)"></a><span></span></div></div>',
			'<div class="calendar-con">',
				'<div class="pic"></div>',
				'<div class="text"></div>',
				'<div class="bottom">',
					'<div class="del"><a href="javascript:void(0)">删除</a></div>',
					'<div class="comment"><a href="#" target="_blank">评论</a></div>',
					'<div class="time"></div>',
				'</div>',
			'</div>',
		'</div>'
		].join('');

	return $container.html(html);
};
UserDialog.prototype.bindEvent = function(){
	var self = this;
	this.$container.find('div.del > a').bind('click',function(){
		if($.isFunction(self.onDelete)){
			self.onDelete();
		}
	});
	this.$container.find('div.score').hide().delegate('a.vote-btn','click',function(){
		var $a = $(this);
		if($a.hasClass('end') || !self.mid) return;
		ms.babyapp.ajax.vote({id:self.mid},function(data){
			$a.addClass('end').next().html(data.vote_sum);
			if($.isFunction(self.onVote)){
				self.onVote(data);
			}
		});
	});
};
UserDialog.prototype.show = function(obj,onDelete,onVote){
	//pic,text,datetime,cid
	var self = this,
		nowTime = new Date().getTime(),
		nick = obj.nick,
		$pic = this.$container.find('div.pic'),
		isSelf = obj.isSelf,
		$del = this.$container.find('div.del'),
		$comment = this.$container.find('div.comment > a').text('评论'),
		$score = this.$container.find('div.score');

	
	if(obj.pic){
		$pic.html('<img src="'+obj.pic+'" />').show();
		$score.show().html('<a class="vote-btn'+(obj.vote ? ' end' : '')+'" href="javascript:void(0)" title="喜欢"></a><span>'+obj.voteCount+'</span>');
		if(obj.id){
			this.mid = obj.id;
			this.voteCount = parseInt(obj.voteCount,10);
		}
	}else{
		$pic.html('').hide();
		$score.hide();
	}
	if(!nick){
		nick = ms.babyapp.nick;
	}

	if(isSelf){
		$del.show();
	}else{
		$del.hide();
	}

	this.$container.find('div.calendar-title > h1').html('<a href="'+obj.homeurl+'app/baby/" target="_blank">'+nick+'</a>');
	this.$container.find('div.text').html(mysohu.babyapp.Emot.trans.cut(obj.text));
	this.$container.find('div.time').html(ms[app].utils.timeago(nowTime,obj.datetime*1));
	BasicDialog.prototype.show.call(this);

	this.onDelete = onDelete || emptyFunc;
	this.onVote = onVote || emptyFunc;
	
	if(obj.isPerson){
		$comment.attr('data-role','appview').attr('data-target','#innerCanvas')
				.attr('data-url','/a/app/baby/comments_show.ac?id='+obj.id+'&uid='+ms[app].getUid())
				.attr('href','javascript:void(0)').removeAttr('target');
	}else{
		$comment.attr('href',obj.homeurl+'app/baby/#/a/app/baby/comments_show.ac=^_^=id=' + obj.id);
	}
	//加载评论数
	ms[app].ajax.fillCount([{itemid: obj.id,xpt: obj.xpt}],function(data){
		$comment.text('评论' + (data[obj.id].commentcount > 0 ? '('+data[obj.id].commentcount+')' : ''));
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

function checkTextarea(n,text,isSubmit){
	text = $.trim(text.replace(/\r?\n/g, ''));
	var result = {
		status : true,
		reset : false,
		text : ''
	};
	if(isSubmit){
		if(text == ''){
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
	var $container = $('<div class="baby-win-bg"></div>'),
		html = [
		'<div class="baby-win-wrapper">',
			'<span title="关闭" class="close-icon"><a href="javascript:void(0)"></a></span>',
			'<div class="calendar-data-input-win-con-title"></div>',
			'<textarea></textarea>',
			'<div class="post-action">',
				'<div class="post-options">',
					'<div class="pub-faces">',
						'<div class="clearfix"><a href="javascript:void(0);">',
							'<span class="btn-emot"></span><i class="text">表情</i>',
						'</a></div>',
					'</div>',
					'<div class="insert-picture">',
						'<div class="clearfix">',
							'<a href="javascript:void(0);">',
								'<span class="btn-insert-picture"></span><i class="text">图片</i>',
							'</a>',
						'</div>',
					'</div>',
				'</div>',
				'<div class="post-btns">',
					'<div class="button">',
						'<div class="baby-btn baby-btn-99 baby-btn-99-disabled">发表</div>',
					'</div>',
					'<div class="emit-text">',
						'<span class="error-clew" style="display:none">已超出1个字</span>',
						'<span class="babyapp-text-counter"><em>0</em>/'+TEXT_MAXLENGTH+'字</span>',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
		].join('');
	
	return $container.html(html);
};
InputDialog.prototype.bindEvent = function(){
	var self = this,
		$edit = this.$container,
		$tip = this.$container.find('span.error-clew'),
		$counter = this.$container.find('span.babyapp-text-counter'),
		$btn = this.$container.find('div.baby-btn'),
		$textarea = this.$container.find('textarea'),
		$emotBtn = this.$container.find('div.pub-faces a'),
		$picBtn = this.$container.find('div.insert-picture a'),
		uploading = false;

	function check(){
		var n = Math.round(ms.babyapp.utils.cjkLength($textarea.val().replace(/\r?\n/g, "")) / 2);
		if(n > TEXT_MAXLENGTH){
			$counter.hide();
		}else{
			$counter.show().find('em').html(n);
		};

		if($textarea.val().length > 0){
			if(!uploading) $btn.removeClass('baby-btn-99-disabled');
		}else{
			$btn.addClass('baby-btn-99-disabled');
		}
		return n;
	}
	var _eventName_ = (function(){
		var evtname = '';
		if($.browser.msie){
			if(parseInt($.browser.version,10) > 8){
				evtname = 'input keyup';
			}else{
				evtname = 'propertychange';
			}
		}else{
			evtname = 'input';
		}
		return evtname;
	})();

	$textarea.bind(_eventName_, function(event){
		var n = check();
		var ct = checkTextarea(n,$textarea.val());
		if(ct.status){
			$tip.hide();
		}else{
			$tip.html(ct.text).show();
		};
	});

	
	$btn
	.hover(function(){
		if(!$btn.hasClass('baby-btn-99-disabled')){
			$btn.addClass('baby-btn-99-hover');
		}
	},function(){
		if(!$btn.hasClass('baby-btn-99-disabled')){
			$btn.removeClass('baby-btn-99-hover');
		}
	})
	.click(function(){
		if($btn.hasClass('baby-btn-99-disabled')){
			return;
		}
		var n = Math.round(ms.babyapp.utils.cjkLength($textarea.val().replace(/\r?\n/g, "")) / 2);
		var ct = checkTextarea(n,$textarea.val(),true);
		if(ct.status){
			$tip.hide();
			if($.isFunction(self.onSubmit)){
				self.onSubmit($.trim($textarea.val().replace(/\r?\n/g, '')),self.pupload.getData());
			}
		}else{
			emptyContentAlert($textarea[0]);
			$tip.html(ct.text).show();
			if(ct.reset){
				$counter.show().find('em').html('0');
				$textarea.val('').focus();
			}
		};
	});
	//表情
	var emot = new ms.babyapp.Emot({'textarea':$textarea,'appendTo':this.$container,'onInsert':function(){
		var n = check();
		var ct = checkTextarea(n,$textarea.val());
		if(ct.status){
			$tip.hide();
		}else{
			$tip.html(ct.text).show();
		};
	}});

	$emotBtn.bind('click',function(){
		emot.show();
	});

	//图片上传 
	this.pupload = ms.babyapp.photoUpload({
		'appendTo':this.$container,
		'btn':$picBtn,
		'css':{top: 220,left: 35},
		'onUpload': function(){
			//按钮变灰
			uploading = true;
			$btn.addClass('baby-btn-99-disabled');
		},
		'onUploadComplete': function(results){
			uploading = false;
			if($textarea.val() == '') $textarea.val('分享图片');
			if($textarea.val().length > 0){
				$btn.removeClass('baby-btn-99-disabled');
			}
		},
		'onDelete': function(){
			if($textarea.val() == '分享图片') $textarea.val('');
		}
		
	});
};
InputDialog.prototype.show = function(callback){
	var self = this;
	
	this.$container.find('span.error-clew').hide();
	this.$container.find('span.babyapp-text-counter em').html('0');
	this.$container.find('div.baby-btn').removeClass('baby-btn-99-hover').addClass('baby-btn-99-disabled');
	this.$container.find('textarea').val('').focus();
	BasicDialog.prototype.show.call(this);
	this.onSubmit = callback;
	
	if(ieBug){
		setTimeout(function(){
			self.pupload.draw();
		},200);
	}else{
		this.pupload.draw();
	}
	
};




//暴露的接口
ms.babyapp.dialog = {
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
	}
};


})(jQuery,mysohu);