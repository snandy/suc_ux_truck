/*
 *	档案 标签页
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var replaceCJK = /[^\x00-\xff]/g,
	testCJK    = /[^\x00-\xff]/;

var regFilter = /[<>]+/i;
var regHTML = /<\/?[^<>]+>/i;
var regScript = /<[\s]*?script[^>]*?>[\s\S]*?<[\s]*?\/[\s]*?script[\s]*?>/i;
var TAG_MAX_NUMBER = 10;
var TEXT_MAX_LENGTH = 14;

function cjkLength(strValue){
	return strValue.replace(replaceCJK, "lv").length;
}
function formatTag(tag){
	return $.trim(tag.replace(/\s+/g,''));
}
function checkInput(tag){
	var result = {
		status : true,
		reset : false,
		text : ''
	};
	var n = cjkLength(tag);
	
	if($.trim(tag) == ''){
		return {
			status : false,
			reset : true,
			text : '请输入1-14位字符长度的标签' 
		}
	}
	
	if(n > TEXT_MAX_LENGTH){
		result.status = false;
		result.text = '不能超过14个字符或7个汉字';
	}
	else if(regFilter.test(tag) || regHTML.test(tag) || regScript.test(tag)){
		result.status = false;
		result.text = '含有不合适字符';
	};
	if(myTag.hasTag(formatTag(tag))){
		result.status = false;
		result.text = '你已经添加了这个标签';
	}
	return result;
};

function within(event, callback){
	var $this = this;
	var relatedTarget = event.relatedTarget;
	var el = $this.get(0);
	if(!$.contains(el,relatedTarget) && el !== relatedTarget){
		callback();
	}
}

var initText = '<div title="从右侧选择喜欢的标签，或者在框里输入您想要的标签帖上" class="append-label-box-init-text">从右侧选择喜欢的标签，或者在框里输入您想要的标签帖上</div>';

var myTag = {
	cache : [],
	hasTag: function(tag){
		return $.inArray(tag,this.cache) != -1;
	},
	addTag: function(tag){
		if(!this.hasTag(tag)){
			this.cache.push(tag);
		}
	},
	delTag: function(tag){
		var index = $.inArray(tag,this.cache);
		if(index != -1){
			this.cache.splice(index,1);
		}
	}
}

var pid = 1;
var pageReverse = {};//用来保存当前显示的推荐内容是正还是反


function alertDialog(text){
	var $content = '<div class="profile-win-clew"><div class="boxG"><p>'+text+'</p></div></div>';
	$.alert({
		content: $content
	});
}

var project = {
	init: function(){
		var self = this;
		//初始化tag缓存
		$('div.append-label-box')
		.click(function(event){
			var $target = $(event.target),$o;
			if($target.closest('span.profile-icon-label-clear').length){
				$target = $target.closest('span.profile-icon-label-clear');
				$o = $target.closest('li');
				self.delTag($o,$o.attr('data-profile-tag'));
			}
		})
		.delegate('li','mouseenter',function(){
			$(this).addClass('hover');
		})
		.delegate('li','mouseleave',function(){
			$(this).removeClass('hover');
		})
		.find('li').each(function(){
			var $this = $(this);
			myTag.addTag($this.attr('data-profile-tag'));
		});
		

		this.$tagTitle = $('div.append-label > .label-box-title:first');
		if(myTag.cache.length == 0){
			this.$tagTitle.css('visibility','hidden');
			//$('div.append-label-box').html(initText);
		}

		//右侧热词静态事件
		$('div.interest-label-box')
		.click(function(event){
			var $target = $(event.target);
			//
			if($target.closest('li').length){
				$target = $target.closest('li');
				self.addTag($target.attr('data-profile-tag'));
			}
		})
		.delegate('li','mouseenter',function(){
			var $target = $(this);
			if(!$target.hasClass('confirm')){
				$target.addClass('hover');
			}
		})
		.delegate('li','mouseleave',function(){
			var $target = $(this);
			if(!$target.hasClass('confirm')){
				$target.removeClass('hover');
			}
		});

		//右侧文本框
		var $btn = $('div.label-box-input :button');
		var $text = $('div.label-box-input :text');
		var $error = $('div.label-box-input span.profile-input-up-error-clew');
		
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

		$text
		.bind(_eventName_,function(){
			
			if(this.value.length > 0){
				$btn.removeClass().addClass('profile-btn-paste');
			}else{
				$btn.removeClass().addClass('profile-btn-paste-disabled');
			}
			$error.hide();
		})
		.focus(function(){
			$error.hide();
		});
		$btn
		.hover(function(){
			if(!$btn.hasClass('profile-btn-paste-disabled')){
				$btn.removeClass().addClass('profile-btn-paste-hover');
			}
		},function(){
			if(!$btn.hasClass('profile-btn-paste-disabled')){
				$btn.removeClass().addClass('profile-btn-paste');
			}
		})
		.mousedown(function(){
			if(!$btn.hasClass('profile-btn-paste-disabled')){
				$btn.removeClass().addClass('profile-btn-paste-down');
			}
		})
		.mouseup(function(){
			if(!$btn.hasClass('profile-btn-paste-disabled')){
				$btn.removeClass().addClass('profile-btn-paste-hover');
			}
		})
		.click(function(){
			if(!$btn.hasClass('profile-btn-paste-disabled')){
				var cki = checkInput($text.val());
				if(cki.status){
					//提交
					self.addTag($text.val());
					$text.val('');
					$error.hide();
					$btn.removeClass().addClass('profile-btn-paste-disabled');
				}else{
					if(cki.reset){
						$text.val('').focus();
						$btn.removeClass().addClass('profile-btn-paste-disabled');
					}
					self.showErrorTip(cki.text);
					$('body').one('mousedown',function(){
						$error.hide();
					});
				}
			}
		});
		//换一换
		$('div.interest-label > div.label-box-title a').click(function(event){
			self.changeTag();
			event.preventDefault();
		});

		this.darkSelected();
		
	},
	addTag: function(tag){
		var self = this;
		tag = formatTag(tag);
		
		if(!myTag.hasTag(tag)){
			if(myTag.cache.length == 10){
				alertDialog('你的标签数量已经达到上限。<br>请先删掉不需要标签。');
				return;
			}
			$.post('/a/profile/tag/save.htm?_input_encode=UTF-8',{'tagName':tag},function(result){
				if(result.status == 0){
					self.appendTag(result.tagName);
				}else{
					self.showErrorTip(result.statusText);
				}
			},'json');
		}
		
	},
	appendTag: function(tag){
		tag = formatTag(tag);
		var $li = $('<li data-profile-tag="'+tag+'"></li>');
		$li.html(tag+'<span class="append-label-box-hover">'+tag+'<span class="profile-icon"><span class="profile-icon-label-clear" title="删除标签"></span></span></span>');
		
		var $box = $('div.append-label-box');
		if(!$box.find('ul').length){
			$box.empty();
			$box.html('<ul></ul>');
		}
		$box.find('ul').prepend($li);
		myTag.addTag(tag);
		this.darkSelected();
		this.$tagTitle.css('visibility','visible');
	},
	delTag: function($o,tag){
		var self = this;
		tag = formatTag(tag);
		if(myTag.hasTag(tag)){
			$.post('/a/profile/tag/delete.htm?_input_encode=UTF-8',{'tagName':tag},function(result){
				if(result.status == 0){
					self.removeTag($o,tag);
				}
			},'json');
		}
	},
	removeTag: function($o,tag){
		
		$o.remove();
		myTag.delTag(tag);
		if(myTag.cache.length == 0){
			this.$tagTitle.css('visibility','hidden');
			$('div.append-label-box').html(initText);
		}
		this.darkSelected();
	},
	darkSelected: function(){
		var self = this;
		$('div.interest-label-box li').each(function(){
			var $this = $(this),tag = formatTag($this.attr('data-profile-tag'));;
			if(myTag.hasTag(tag)){
				$this.removeClass().addClass('confirm');
			}else{
				$this.removeClass('confirm');
			}
		});
	},
	changeTag: function(){
		var self = this;
		$.getJSON('/a/profile/tag/change.htm',{'pid':pid},function(result){
			if(result.status == 0){
				if(typeof pageReverse['p'+pid] == 'undefined'){
					pageReverse['p'+pid] = 0;
				}
				pageReverse['p'+pid] += 1;
				if(!(pageReverse['p'+pid] % 2 == 0)){
					result.data = result.data.reverse();
				}
				self.buildInterestTag(result.data);
				pid = result.nextPid;
			}
		});
	},
	buildInterestTag: function(data){
		var $box = $('div.interest-label-box ul'),i,len,$li,tag;
		$box.empty();
		for(i=0,len=data.length;i<len;i+=1){
			tag = formatTag(data[i]);
			$li = $('<li data-profile-tag="'+tag+'">'+tag+'</li>');
			$box.append($li);
		}
		this.darkSelected();
	},
	showErrorTip: function(msg){
		var $error = $('div.label-box-input span.profile-input-up-error-clew');
		$error.removeClass('hidden').html('<em><i class="global-icon-error-12">错误</i>'+msg+'</em>').show();
	}
};

$(function(){
	project.init();
});


})(jQuery);