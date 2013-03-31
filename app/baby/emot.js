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


var emotList = [
	{ubb:':)',title:'微笑',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/smile.gif'},
	{ubb:'#_#',title:'谄媚',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/flatter.gif'},
	{ubb:'8*)',title:'偷笑',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/titter.gif'},
	{ubb:':D',title:'大笑',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/spit.gif'},
	{ubb:':-)',title:'害羞',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/shame.gif'},
	{ubb:':P',title:'调皮',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/naughty.gif'},
	{ubb:'B_)',title:'得意',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/complacent.gif'},
	{ubb:'B_I',title:'耍酷',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/cool.gif'},
	{ubb:'^_*',title:'讽刺',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/lash.gif'},
	{ubb:':$',title:'委屈',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/complaint.gif'},
	{ubb:':|',title:'郁闷',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/gloomy.gif'},
	{ubb:':(',title:'难过',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/sorry.gif'},
	{ubb:':.(',title:'泪奔',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/weep.gif'},
	{ubb:':_(',title:'大哭',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/cry.gif'},
	{ubb:'):(',title:'发火',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/detonate.gif'},
	{ubb:':V',title:'咒骂',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/curse.gif'},
	{ubb:'*_*',title:'发呆',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/muzzy.gif'},
	{ubb:':^',title:'不懂',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/misunderstand.gif'},
	{ubb:':?',title:'疑惑',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/haze.gif'},
	{ubb:':!',title:'吃惊',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/surprise.gif'},
	{ubb:'=:|',title:'流汗',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/perspire.gif'},
	{ubb:':%',title:'尴尬',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/embarrassed.gif'},
	{ubb:':O',title:'惊恐',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/fright.gif'},
	{ubb:':X',title:'闭嘴',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/stopper.gif'},
	{ubb:'|-)',title:'犯困',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/yawn.gif'},
	{ubb:':Z',title:'睡觉',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/sleep.gif'},
	{ubb:':9',title:'馋',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/greedy.gif'},
	{ubb:':T',title:'吐',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/puke.gif'},
	{ubb:':-*',title:'耳语',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/whisper.gif'},
	{ubb:'*_/',title:'海盗',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/pirate.gif'},
	{ubb:':#|',title:'重伤',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/bandage.gif'},
	{ubb:':69',title:'拥抱',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/hug.gif'},
	{ubb:'//shuang',title:'爽',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/comfortably.gif'},
	{ubb:'//qiang',title:'强',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/strong.gif'},
	{ubb:'//ku',title:'酷',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/cool2.gif'},
	{ubb:'//zan',title:'赞',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/good.gif'},
	{ubb:'//heart',title:'红心',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/heart.gif'},
	{ubb:'//break',title:'心碎',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/hearted.gif'},
	{ubb:'//F',title:'花开',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/blow.gif'},
	{ubb:'//W',title:'花谢',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/fade.gif'},
	{ubb:'//mail',title:'邮件',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/mail.gif'},
	{ubb:'//strong',title:'手势-棒',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/fine.gif'},
	{ubb:'//weak',title:'手势-逊',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/bad.gif'},
	{ubb:'//share',title:'握手',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/share.gif'},
	{ubb:'//phone',title:'电话',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/phone.gif'},
	{ubb:'//mobile',title:'手机',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/mobile.gif'},
	{ubb:'//kiss',title:'嘴唇',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/lip.gif'},
	{ubb:'//V',title:'V',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/victory.gif'},
	{ubb:'//sun',title:'太阳',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/sun.gif'},
	{ubb:'//moon',title:'月亮',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/moon.gif'},
	{ubb:'//star',title:'星星',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/star.gif'},
	{ubb:'(!)',title:'灯泡',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/bulb.gif'},
	{ubb:'//TV',title:'电视',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/tv.gif'},
	{ubb:'//clock',title:'闹钟',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/clock.gif'},
	{ubb:'//gift',title:'礼物',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/gift.gif'},
	{ubb:'//cash',title:'现金',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/cash.gif'},
	{ubb:'//coffee',title:'咖啡',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/coffee.gif'},
	{ubb:'//rice',title:'饭',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/dining.gif'},
	{ubb:'//watermelon',title:'西瓜',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/watermelon.gif'},
	{ubb:'//tomato',title:'番茄',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/tomato.gif'},
	{ubb:'//pill',title:'药丸',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/pill.gif'},
	{ubb:'//pig',title:'猪头',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/pig.gif'},
	{ubb:'//football',title:'足球',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/football.gif'},
	{ubb:'//shit',title:'便便',url:'http://js3.pp.sohu.com.cn/ppp/images/emotion/base/shit.gif'}
];


var Emot = function(opts){
	this.opts = opts || {};
	this.$textarea = opts.textarea;
	this.init(opts.css || {top: 220,left: -20});
}
Emot.prototype = {
	init: function(css){
		this.$emot = $('<div style="display:none;z-index:601;" class="baby-face-dl-wrapper">').css(css);
		var	self = this,
			html = [
			'<div class="dl-arrow"></div>',	
			'<div class="baby-face-dl-box">',
				'<ul class="emot">'
			];

		for(var i=0;i<emotList.length;i+=1){
			html.push('<li data-ubb="'+emotList[i].ubb+'" data-title="'+emotList[i].title+'" data-src="'+emotList[i].url+'"><a href="javascript:void(0)" title="'+emotList[i].title+'"><img src="'+emotList[i].url+'" /></a></li>');
		}

		html.push('</ul></div>');
		this.$emot.html(html.join('')).appendTo(this.opts.appendTo);

		this.$emot.delegate('li[data-ubb]','click',function(){
			self.insert($(this).attr('data-ubb'));
		});

	},
	insert: function(ubb){
		var textarea = this.$textarea[0];
		
		ubb = '[' + ubb + ']';

		if (doc.selection) {
			
			textarea.focus();
			setTimeout(function() {
				var sel = doc.selection.createRange();
				sel.text = ubb;
			}, 0);

		} else if (textarea.selectionStart || textarea.selectionStart == "0") {
			textarea.focus();
			var startPos = textarea.selectionStart,
				endPos = textarea.selectionEnd, 
				scrollTop = textarea.scrollTop, 
				oldVal = textarea.value;
			textarea.value = oldVal.substring(0, startPos) + ubb + oldVal.substring(endPos, oldVal.length);
			textarea.selectionStart = textarea.selectionEnd = startPos + ubb.length;
		} else {
			textarea.focus();
			textarea.value += ubb;
		}
		if($.isFunction(this.opts.onInsert)){
			this.opts.onInsert();
		}
	},
	show: function(){
		if(this.$emot.is(':visible')){
			return;
		}
		this.$emot.show();
		var self = this;
		setTimeout(function(){
		$(doc).bind('click.babyappemot',function(){
			self.hide();
		});
		},0);
	},
	hide: function(){
		if(!this.$emot.is(':visible')){
			return;
		}
		this.$emot.hide();
		$(doc).unbind('click.babyappemot');
	},
	toggle: function(){
		this.$emot.toggle();
	}
};


Emot.trans = {
	hash: null,//用来存储表情的对照
	//获取表情图片
	getImg: function(face){
		var ubb = face.replace('[','').replace(']','');
		if(this.hash[ubb]){
			return '<img src="' + this.hash[ubb].url + '" alt="'+this.hash[ubb].title+'" title="'+this.hash[ubb].title+'" />';
		}else{
			return face;
		}
	},
	//截字
	cut: function(str,cutLen){
		//如果表情对照为空，则初始化表情对照，即   ubb : 表情数据
		if(!this.hash){
			this.hash = (function(){
				var obj = {}
				for(var i =0;i< emotList.length;i+=1){
					obj[emotList[i].ubb] = emotList[i];

				}
				return obj;
			})();
		}
		var tempStr = str;
		//console.log('源文字：',tempStr);
		var reg = /\[[^\[\]]+\]/ig;//正则表达式，用来匹配出所有的表情符号
		var match = tempStr.match(reg);//通过字符串的match方法匹配出所有表情符号 [xxx]
		
		if(match){
			//利用循环将每个位置上的表情替换为 `编号
			for(var i=0,len=match.length;i<len;i+=1){
				tempStr = tempStr.replace(match[i],'`'+i);
			}
			//console.log('没有截取：',tempStr);
			//执行截取，这里可以进行按中文2字符，英文1字符的截取，demo没有这么做
			if(cutLen){
				tempStr = ms.babyapp.utils.cutCjkString(tempStr,cutLen,'...',2);
			}
			//console.log('截取：',tempStr);
			//再次循环将之前编号的表情替换回实际的img标签
			for(i=0;i<len;i+=1){
				tempStr = tempStr.replace('`'+i,this.getImg(match[i]));
			}
			//console.log('替换图片：',tempStr);
			//去掉没有被替换成表情的`编号
			tempStr = tempStr.replace(/`\d*/g,'');
			//console.log('去掉截断为一半的表情：',tempStr);
		}else if(cutLen){
			tempStr = ms.babyapp.utils.cutCjkString(tempStr,cutLen,'...',2);
		}
		//最后返回截取后的字符串
		//console.log('返回：',tempStr);
		return tempStr;
	}
};




//暴露的接口
ms.babyapp.Emot =  Emot;


})(jQuery,mysohu);