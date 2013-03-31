/*
* @Class BlogEditor
* @date 2011/8/1
* @author bobotieyang
* @需要加载jquery.dialog.js swfupload.js
* var be = new $.BlogEditor({
		textarea: '#editor',//文本框选择器，不可为多个元素，display不能是none
		mode: 'full',//simple为简单模式，full为全部模式
		comment: true,//是否显示评论权限控制
		footer: true//是否显示底部工具条，包含显示源代码按钮
  });
  be.htmlText());//取得格式化后的html代码
  be.commentValue());//取得评论权限
*/
;(function($,window,undefined){

if ($.BlogEditor) {
	return;
}

function within(event, callback){
	var $this = this;
	var parent = event.relatedTarget;
	var el = $this.get(0);
	try {
		while (parent && parent !== el) {
			parent = parent.parentNode;
		}
		if (parent !== el) {
			callback();
		}
	} catch(e) {}
}

var instanceId = 0;

var xCount=0,
	browerVer=$.browser.version,
	isIE=$.browser.msie,
	isMozilla=$.browser.mozilla,
	isSafari=$.browser.safari,
	isOpera=$.browser.opera,
	isIE6 = $.browser.msie && parseFloat($.browser.version) < 7;

var btns = {
	bold: {
		title: '粗体',
		className: 'be-bold'
	},
	italic: {
		title: '斜体',
		className: 'be-italic'
	},
	underline: {
		title: '下划线',
		className: 'be-underline'
	},
	fontcolor : {
		title: '字体颜色',
		className: 'be-color'
	},
	backcolor: {
		title: '背景颜色',
		className: 'be-bgcolor'
	},
	link: {
		title: '超链接',
		className: 'be-link'
	},
	justifyleft: {
		title: '左对齐',
		className: 'be-justifyleft'
	},
	justifycenter: {
		title: '居中',
		className: 'be-justifycenter'
	},
	justifyright: {
		title: '右对齐',
		className: 'be-justifyright'
	},
	photo: {
		title: '插入图片',
		className: 'be-photo',
		disabledTitle: '提示：因为缺少必要的组件，上传图片功能不可用'
	},
	ol: {
		title: '数字列表',
		className: 'be-ol'
	},
	ul: {
		title: '符号列表',
		className: 'be-ul'
	},
	indent: {
		title: '增大缩进',
		className: 'be-indent'
	},
	outdent: {
		title: '减小缩进',
		className: 'be-outdent'
	},
	emot: {
		title: '插入表情',
		className: 'be-emot'
	},
	paste: {
		title: '粘贴文本',
		className: 'be-paste',
		disabledTitle: '提示：您现在所使用的浏览器不支持此操作，请使用快捷键 [Ctrl + V]！'
	},
	quicksave:{
		title:'快速保存',
		className:'be-quicesave'
	},
	preview:{
		title:'预览',
		className:'be-preview'
	}
	
};
var customList = {
	fontname: {
		title: '字体',
		className: 'be-font'
	},
	fontsize: {
		title: '字号',
		className: 'be-size'
	}
};

var fontnameList = [
	{font: 'SimSun',cn: '宋体',text: '宋体'},	
	{font: 'SimHei',cn: '黑体',text: '黑体'},
	{font: '隶书',cn: '隶书',text: '隶书'},
	{font: 'KaiTi_GB2312',cn: '楷体_GB2312',text: '楷体'},
	{font: '幼圆',cn: '幼圆',text: '幼圆'},
	{font: 'Arial',cn: 'Arial',text: 'Arial'},
	{font: 'Impact',cn: 'Impact',text: 'Impact'},
	{font: 'Georgia',cn: 'Georgia',text: 'Georgia'},
	{font: 'Verdana',cn: 'Verdana',text: 'Verdana'},
	{font: 'Courier New',cn: 'Courier New',text: 'Courier New'},
	{font: 'Times New Roman',cn: 'Times New Roman',text: 'Times New Roman'}
];
var fontsizeList = [
	{size: 7,text: '初号'},
	{size: 6,text: '一号'},
	{size: 5,text: '二号'},
	{size: 4,text: '三号'},
	{size: 3,text: '四号'},
	{size: 2,text: '五号'},
	{size: 1,text: '六号'}
];
var colorList = [
	'auto',
	'#000000','#000000','#000000','#000000','#003300','#006600','#009900','#00CC00','#00FF00','#330000','#333300','#336600','#339900','#33CC00','#33FF00','#660000','#663300','#666600','#669900','#66CC00','#66FF00',
	'newline',
	'#000000','#333333','#000000','#000033','#003333','#006633','#009933','#00CC33','#00FF33','#330033','#333333','#336633','#339933','#33CC33','#33FF33','#660033','#663333','#666633','#669933','#66CC33','#66FF33',
	'newline',
	'#000000','#666666','#000000','#000066','#003366','#006666','#009966','#00CC66','#00FF66','#330066','#333366','#336666','#339966','#33CC66','#33FF66','#660066','#663366','#666666','#669966','#66CC66','#66FF66',
	'newline',
	'#000000','#999999','#000000','#000099','#003399','#006699','#009999','#00CC99','#00FF99','#330099','#333399','#336699','#339999','#33CC99','#33FF99','#660099','#663399','#666699','#669999','#66CC99','#66FF99',
	'newline',
	'#000000','#CCCCCC','#000000','#0000CC','#0033CC','#0066CC','#0099CC','#00CCCC','#00FFCC','#3300CC','#3333CC','#3366CC','#3399CC','#33CCCC','#33FFCC','#6600CC','#6633CC','#6666CC','#6699CC','#66CCCC','#66FFCC',
	'newline',
	'#000000','#FFFFFF','#000000','#0000FF','#0033FF','#0066FF','#0099FF','#00CCFF','#00FFFF','#3300FF','#3333FF','#3366FF','#3399FF','#33CCFF','#33FFFF','#6600FF','#6633FF','#6666FF','#6699FF','#66CCFF','#66FFFF',
	'newline',
	'#000000','#FF0000','#000000','#990000','#993300','#996600','#999900','#99CC00','#99FF00','#CC0000','#CC3300','#CC6600','#CC9900','#CCCC00','#CCFF00','#FF0000','#FF3300','#FF6600','#FF9900','#FFCC00','#FFFF00',
	'newline',
	'#000000','#00FF00','#000000','#990033','#993333','#996633','#999933','#99CC33','#99FF33','#CC0033','#CC3333','#CC6633','#CC9933','#CCCC33','#CCFF33','#FF0033','#FF3333','#FF6633','#FF9933','#FFCC33','#FFFF33',
	'newline',
	'#000000','#0000FF','#000000','#990066','#993366','#996666','#999966','#99CC66','#99FF66','#CC0066','#CC3366','#CC6666','#CC9966','#CCCC66','#CCFF66','#FF0066','#FF3366','#FF6666','#FF9966','#FFCC66','#FFFF66',
	'newline',
	'#000000','#FFFF00','#000000','#990099','#993399','#996699','#999999','#99CC99','#99FF99','#CC0099','#CC3399','#CC6699','#CC9999','#CCCC99','#CCFF99','#FF0099','#FF3399','#FF6699','#FF9999','#FFCC99','#FFFF99',
	'newline',
	'#000000','#00FFFF','#000000','#9900CC','#9933CC','#9966CC','#9999CC','#99CCCC','#99FFCC','#CC00CC','#CC33CC','#CC66CC','#CC99CC','#CCCCCC','#CCFFCC','#FF00CC','#FF33CC','#FF66CC','#FF99CC','#FFCCCC','#FFFFCC',
	'newline',
	'#000000','#FF00FF','#000000','#9900FF','#9933FF','#9966FF','#9999FF','#99CCFF','#99FFFF','#CC00FF','#CC33FF','#CC66FF','#CC99FF','#CCCCFF','#CCFFFF','#FF00FF','#FF33FF','#FF66FF','#FF99FF','#FFCCFF','#FFFFFF'
];
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
var BlogEditor = function(options){
	var defaults = {
		className: '',
		textarea: null,
		width: 0,
		height: 0,
		//4个角是否有边框
		corner: {
			width:0,
			height:0,
			left:0,
			top:0,
			right:0,
			bottom:0
		},
		mode: 'simple', // simple 简单编辑器 full高级编辑器
		line1: ['bold','italic','underline','fontcolor','backcolor','link','justifyleft','justifycenter','justifyright','photo','vertical-line','quicksave','preview'],
		line2: ['fontname','fontsize','ol','ul','indent','outdent','emot','vertical-line','paste'],
		comment: true,//是否显示评论权限
		footer: false,//是否显示页脚
		source: false//是否显示查看源代码
	};
	this.options = $.extend({},defaults,options || {});
	this.sourceMode = false;
	this.bookmark = null;
	this.cacsTimeout = null;//检查按钮状态的延迟
	this.token = '';
	this.panels = {};
	this.instanceId = instanceId++;
	this.init();
};
BlogEditor.prototype = {
	init: function(){
		var self = this;
		this.$container = $('<div class="blogeditor"></div>');
		if(this.options.className){
			this.$container.addClass(this.options.className);
		}
		if(this.options.textarea){
			this.$textarea = $(this.options.textarea);
		}
		var html = '<div class="be-toolbar">',i,item;
		html += '<div class="be-toolbar-line line1">';
		html += this.addFormatButton(this.options.line1);
		html += '<span class="right be-toggle-btn"><a href="javascript:void(0)">';
		if(this.options.mode == 'simple'){
			html += '高级编辑';
		}else{
			html += '收起';
		}
		html += '</a></span>';
		html += '</div>'
		html += '<div class="be-toolbar-line line2"'+(this.options.mode == 'simple'?' style="display:none"':'')+'>';
		html += this.addFormatButton(this.options.line2);
		if(this.options.comment){
			html += '<span class="right be-comment-select"><select><option value="1">所有用户</option></select></span><span class="right be-comment-label">评论权限</span>';
		}
		html += '</div>';
		html += '</div>';
		html += '<div class="be-iframe"><iframe frameborder="0" id="beIframe'+this.instanceId+'" src="javascript:;" style="width:100%;" hideFocus="hideFocus"></iframe></div>';
		if(this.options.footer){
			html += '<div class="be-footer">';
			if(this.options.source){
				html += '<span class="be-sourcemode"><input type="checkbox" /><label>显示源代码</label></span>';
			}
			html += '</div>'
		}
		this.$container.html(html);
		if(this.$textarea){
			this.$textarea.hide();
			this.$container.insertAfter(this.$textarea);
		}
		this.width = this.options.width?this.options.width:(this.$textarea?this.$textarea.width():300);
		this.height = this.options.height?this.options.height:(this.$textarea?this.$textarea.height():200);
		this.$container.width(this.width);
		this.$container.height(this.height);
		this.$container.find('[data-cmd=photo]').html('<i id="_be_upload_'+this.instanceId+'"></i>');
		//初始化iframe
		this.initIframe();
		//初始化4个角落
		this.initCorner();
		//初始化遮罩
		this.initMask();
		//初始化图片上传
		this.initSwfupload();
		//初始化按钮事件
		this.$container.find('.be-toolbar')
		.delegate('.be-btn-normal','mouseenter',function(){
			var $target = $(this);
			if(!$target.hasClass('be-disabled') && !self.sourceMode){
				$target.removeClass('be-btn-normal').addClass('be-btn-over');
			}
		})
		.delegate('.be-customlist','mouseenter',function(){
			var $target = $(this);
			if($target.hasClass('be-font') && !self.sourceMode){
				$target.removeClass('be-font').addClass('be-font-over');
			}else if($target.hasClass('be-size') && !self.sourceMode){
				$target.removeClass('be-size').addClass('be-size-over');
			}
		})
		.delegate('.be-btn-over','mouseleave',function(){
			var $target = $(this);
			if(!$target.hasClass('be-disabled') && !self.sourceMode){
				$target.removeClass('be-btn-over').addClass('be-btn-normal');
			}
		})
		.delegate('.be-customlist','mouseleave',function(){
			var $target = $(this);
			if($target.hasClass('be-font-over') && !self.sourceMode){
				$target.removeClass('be-font-over').addClass('be-font');
			}else if($target.hasClass('be-size-over') && !self.sourceMode){
				$target.removeClass('be-size-over').addClass('be-size');
			}
		})
		/*
		.bind('mouseover',function(event){
			var $target = $(event.target);
			if($target.closest('.be-btn-normal').length) {
				$target = $target.closest('.be-btn-normal');
				within.call($target, event, function() {
					if(!$target.hasClass('be-disabled') && !self.sourceMode){
						$target.removeClass('be-btn-normal').addClass('be-btn-over');
					}
					
				});
			}else if($target.closest('.be-customlist').length){
				$target = $target.closest('.be-customlist');
				within.call($target, event, function() {
					if($target.hasClass('be-font') && !self.sourceMode){
						$target.removeClass('be-font').addClass('be-font-over');
					}else if($target.hasClass('be-size') && !self.sourceMode){
						$target.removeClass('be-size').addClass('be-size-over');
					}					
				});
			}
		})
		.bind('mouseout',function(event){
			var $target = $(event.target);
			if($target.closest('.be-btn-over').length) {
				$target = $target.closest('.be-btn-over');
				within.call($target, event, function() {
					if(!$target.hasClass('be-disabled') && !self.sourceMode){
						$target.removeClass('be-btn-over').addClass('be-btn-normal');
					}
					
				});
			}else if($target.closest('.be-customlist').length){
				$target = $target.closest('.be-customlist');
				within.call($target, event, function() {
					if($target.hasClass('be-font-over') && !self.sourceMode){
						$target.removeClass('be-font-over').addClass('be-font');
					}else if($target.hasClass('be-size-over') && !self.sourceMode){
						$target.removeClass('be-size-over').addClass('be-size');
					}					
				});
			}
		})
		*/
		.bind('click',function(event){
			var $target = $(event.target),cmd;
			if($target.closest('[data-cmd]').length){
				$target = $target.closest('[data-cmd]');
				if(!$target.hasClass('be-disabled') && !self.sourceMode){
					self.execCmd($target.attr('data-cmd'));
					self.checkAllCommandState();
				}				
			}
			else if($target.closest('.be-toggle-btn').length){
				self.toggleToolbar();
			}
			else if($target.closest('.blog-flash-tip').length){
				self.$container.find('.blog-flash-tip').fadeOut();
			}
		})
		.find('*').attr('unselectable','on');
		//修正弹出表情框是光标闪动的bug
		this.$container.find('[data-cmd=emot]')
		.attr('unselectable','off')
		.mousedown(function(){
			self.saveBookmark();
		});
		//源码模式事件
		if(this.options.footer){
			this.$container.find('.be-sourcemode :checkbox').click(function(){
				self.toggleSource(this.checked);
			});
		}
	},
	addFormatButton: function(array){
		var html = '',item;
		for(var i=0;i<array.length;i+=1){
			item = array[i];
			if(btns[item]){
				if((item == 'paste' && !isIE) || (item == 'photo' && !window['SWFUpload'])){
					html += '<span class="be-disabled be-btn-normal '+btns[item].className+'" title="'+btns[item].disabledTitle+'" data-cmd="'+item+'"></span>';
				}else{
					html += '<span class="be-btn-normal '+btns[item].className+'" title="'+btns[item].title+'" data-cmd="'+item+'"></span>';
				}
			}else if(customList[item]){
				html += '<span class="be-customlist '+customList[item].className+'" title="'+customList[item].title+'" data-cmd="'+item+'">'+customList[item].title+'</span>';
			}else if(item == 'vertical-line'){
				html += '<span class="vertical-line"></span>';
			}
			
		}
		return html;
	},
	toggleToolbar: function(){
		var $line2 = $('.line2',this.$container),$btn = $('.be-toggle-btn > a',this.$container);
		if($line2.is(':visible')){
			$line2.hide();
			$btn.html('高级编辑');
		}else{
			$line2.show();
			$btn.html('收起');
		}
		//重新设置iframe的高度
		this.setIframeDim();
	},
	initIframe: function(){
		var self = this;
		this.$iframe = $('#beIframe'+this.instanceId);
		this.$iframe.height(this.height - this.$container.find('.be-toolbar').outerHeight() - this.$container.find('.be-footer').outerHeight());
		var headHTML='<meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/><link rel="stylesheet" href="http://s3.suc.itc.cn/mysohu/blogeditor/d/iframe.v201201181002.css"/>';
		var iframeHTML='<!DOCTYPE html><html><head>'+headHTML;
		iframeHTML+='</head><body spellcheck="false" class="editMode"></body></html>';
		this.win = this.$iframe[0].contentWindow;
		this.$win = $(this.win);
		try{
			this.doc = this.win.document;
			this.$doc = $(this.doc);
			this.doc.open();
			this.doc.write(iframeHTML);
			this.doc.close();
			if(isIE){
				this.doc.body.contentEditable = true;
			}else{
				this.doc.designMode = 'on';
			}
			this.$doc
			.keypress(function(event){
				self.forcePtag(event);
				self.checkAllCommandState();
			})
			.click(function(){
				self.hidePanels();
			})
			.mouseup(function(){
				self.checkAllCommandState();
			});
			this.setSource();
			setTimeout(function(){
				self.$doc.scrollTop(0);
				self.focus();
			},0);
		}catch(e){}
	},
	initMask: function(){
		this.$mask = $('<div class="be-mask"></div>').appendTo(this.$container).hide();
		this.$mask.width(this.$container.width()).height(this.$container.height());
		this.$loading = $('<div class="be-loading"><img src="http://s2.suc.itc.cn/i/home/d/feed-loading.gif" /><br />图片上传中，请稍候...</div>').appendTo(this.$container).hide();
		this.$loading.css({
			left: (this.width-this.$loading.width())/2,
			top: (this.height-this.$loading.height())/2
		});
		/*
		if(isIE6){
			this.$mask.html('<iframe frameborder="0" tabindex="-1" src="about:blank" style="display:block;cursor:default;opacity:0;filter:alpha(opacity=0);"></iframe>');
			this.$mask.find('iframe').width(this.$mask.width()).height(this.$mask.height());
		}*/
	},
	initCorner: function(){
		if(this.options.corner && this.options.corner.width > 0){
			var pl = 2,pt = 5;
			var corner = this.options.corner,
				border = {
					'position':'absolute',
					'width': corner.width,
					'height': corner.height,
					'border-style': 'solid',
					'border-color': '#c4c4c4'
				},
				$iframebox = this.$container.find('.be-iframe').css('position','relative'),
				$lt = $('<div class="be-corner"></div>').css($.extend({
					'left': corner.left - pl,
					'top' : corner.top - pt,
					'border-right': '1px',
					'border-bottom': '1px'
				},border)),
				$rt = $('<div class="be-corner"></div>').css($.extend({
					'right': corner.right - pl,
					'top' : corner.top - pt,
					'border-left': '1px',
					'border-bottom': '1px'
				},border)),
				$lb = $('<div class="be-corner"></div>').css($.extend({
					'left': corner.left - pl,
					'bottom' : corner.bottom - pt,
					'border-right': '1px',
					'border-top': '1px'
				},border)),
				$rb = $('<div class="be-corner"></div>').css($.extend({
					'right': corner.right - pl,
					'bottom' : corner.bottom - pt,
					'border-left': '1px',
					'border-top': '1px'
				},border));
			$iframebox.find('.be-corner').remove();
			$iframebox.height(this.height - this.$container.find('.be-toolbar').outerHeight() - this.$container.find('.be-footer').outerHeight());
			$iframebox.append($lt).append($rt).append($lb).append($rb);
			this.setIframeDim();
			
		}
	},
	setIframeDim: function(){
		var corner = this.options.corner,
			height = this.height - this.$container.find('.be-toolbar').outerHeight() - this.$container.find('.be-footer').outerHeight();
		this.$container.find('.be-iframe').height(height);
		if(corner && corner.width){
			this.$iframe.width(this.width - (corner.width*2+corner.left+corner.right));
			this.$iframe.height(height - (corner.height*2+corner.top+corner.bottom));
			this.$iframe.css({
				'margin-top': corner.top + corner.height,
				'margin-left': corner.left + corner.width
			});
		}else{
			this.$iframe.height(height);
		}
	},
	initSwfupload: function(){
		var self = this;
		if(window.swfobject && swfobject.getFlashPlayerVersion().major == 0){
			//没有安装flash
			if(!this.$container.find('.blog-flash-tip').length){
				var $fTip = $('<div class="blog-flash-tip panel-thumbnail insert-picture-confirm"></div>');
				$fTip.html(
					'<div class="extend-pieces-wrapper"><span class="img-arrow"></span></div>' + 
					'<div class="panel-container">' +
						'<div class="panel-container-flash-tip">' +
							'<p class="flash-del"><a href="javascript:void(0)">关闭</a></p>' +
							'<div class="flash-icon"><a href="http://www.adobe.com/go/getflashplayer" target="_blank"><img src="http://s3.suc.itc.cn/i/home/d/flash-ico.jpg" /></a></div>' + 
							'<div class="flash-txt"><a href="http://www.adobe.com/go/getflashplayer" target="_blank">你还没有安装Flash，无法使用该功能，点击下载一个吧！</a></div>' +
						'</div>' +
					'</div>'
				).hide();
				this.$container.find('[data-cmd=photo]')
					.click(function(){
						var $pthis = $(this),
							pos = $pthis.position();
						$fTip.fadeIn().css({
							left: pos.left - 16,
							top: pos.top + $pthis.height() + 5
						});
					})	
					.parent().append($fTip);
			}
			return;
		}
		this.swfu = new SWFUpload({
            // Backend Settings
            //upload_url: "http://upload.pp.sohu.com/sentenceUpload.do",            
			upload_url: "http://upload.pp.sohu.com/blogUpload.do",            
            // File Upload Settings
            file_size_limit : "10 MB",
            file_types : "*.jpg;*.jpeg;*.gif;*.png",
            file_types_description : "图片文件",
            file_upload_limit : "0",

            // Event Handler Settings - these functions as defined in Handlers.js
            //  The handlers are not part of SWFUpload but are part of my website and control how
            //  my website reacts to the SWFUpload events.
            file_queue_error_handler : function(file, errorCode, message){
				try {
					var errorName = "";
					if (errorCode === SWFUpload.errorCode_QUEUE_LIMIT_EXCEEDED) {
						errorName = "You have attempted to queue too many files.";
					}

					if (errorName !== "") {
						//alert(errorName);
						return;
					}

					switch (errorCode) {
						case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
							self.dialog({
								className: "jquery-alert",
								btns: ["accept"],
								defaultBtn: "accept",
								title: false,
								content: '图片文件太小，请检查图片属性。'
							});
							break;
						case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
							self.dialog({
								className: "jquery-alert",
								btns: ["accept"],
								defaultBtn: "accept",
								title: false,
								content: '图片过大，请选择小于10M的图片。'
							});
							break;
						case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
							self.dialog({
								className: "jquery-alert",
								btns: ["accept"],
								defaultBtn: "accept",
								title: false,
								content: '该文件不是支持的格式，请检查。'
							});
							break;
						default:
							self.dialog({
								className: "jquery-alert",
								btns: ["accept"],
								defaultBtn: "accept",
								title: false,
								content: '让服务器再飞一会儿，请稍后再试。'
							});
							break;
					}
				} catch (ex) {
					this.debug(ex);
				}
			
			},
            file_dialog_complete_handler : function(numFilesSelected, numFilesQueued){
				var that = this;
				try {
					if (numFilesQueued > 0) {
						// token
						self.showUploadLoading(true);
						$.getJSON('http://i.sohu.com/api/gettoken.jsp?ot=json',function(json){
							if(json.status == 0){
								//分享图片.log($space_config._url);
								that.setPostParams({"token": json.data[0].enToken, "watermark": ''});
								that.startUpload();
								//self.token = json.data[0].enToken;//存储token，下次就不用请求了
							}else{
								self.dialog({
									className: "jquery-alert",
									btns: ["accept"],
									defaultBtn: "accept",
									title: false,
									content: '让服务器再飞一会儿，请稍后再试。'
								});
								self.showUploadLoading(false);
							}
						});
					}
				} catch (ex) {
					this.debug(ex);
				}
			},
            upload_progress_handler : function(){
				//显示进度
			},
            upload_error_handler : function(file, errorCode, message){
				self.dialog({
					className: "jquery-alert",
					btns: ["accept"],
					defaultBtn: "accept",
					title: false,
					content: '让服务器再飞一会儿，请稍后再试。'
				});
			},
            upload_success_handler : function(file, serverData){
				try { 
					var json = window["eval"]("(" + serverData + ")");
					if (json.code == 0) {
						var picUrl = json.data.image[1] || '';
						if(picUrl){
							self.loadBookmark();
							var vernier = picUrl.lastIndexOf('.');						
							var blogPic = picUrl.substr(0,vernier) + picUrl.substr(vernier);					
							self.pasteHTML('<img class="imgwidthfix" style="max-width:618px;" src="'+blogPic+'" /><br/>');
							self.showUploadLoading(false);
						}
					}
				}catch(ex){
					this.debug(ex);
				}
			},

            // Button Settings
            button_image_url : "http://js6.pp.sohu.com.cn/i/default/my/img/nil.gif", // http://js6.pp.sohu.com.cn/i/default/my/img/icon_picture_upload_w45.gif
            button_placeholder_id : '_be_upload_'+this.instanceId,
            button_width: 24,
            button_height: 22,
            button_text : '',
            button_text_style : '',
            button_text_top_padding: 0,
            button_text_left_padding: 0,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,
            button_disabled : false,
            
            
            // Flash Settings
            flash_url : "http://i.sohu.com/asset/swfupload.swf",
            
            // Debug Settings
            debug: false
        });
	},
	showUploadLoading: function(b){
		if(b){
			this.$loading.show();
			this.$mask.show();
		}else{
			this.$loading.hide();
			this.$mask.hide();
		}
	},
	forcePtag: function(event){
		if(this.sourceMode || event.which!==13 || event.shiftKey || event.ctrlKey || event.altKey)return true;
		var pNode = this.getParent('p,h1,h2,h3,h4,h5,h6,pre,address,div,li');
		if(pNode.is('li')) return true;
		//外层没有容器的时候，用 p 包裹
		if(pNode.length===0){
			this._exec('formatblock','<p>');
		}
	},
	getParent: function(tag){
		var rng = this.getRng(),p;
		if(!isIE)
		{
			p = rng.commonAncestorContainer;
			if(!rng.collapsed){
				if(rng.startContainer === rng.endContainer&&rng.startOffset - rng.endOffset < 2&&rng.startContainer.hasChildNodes()){
					p = rng.startContainer.childNodes[rng.startOffset];
				}
			}
		}
		else {
			p=rng.item?rng.item(0):rng.parentElement();
		}
		tag = tag?tag:'*';
		p=$(p);
		if(!p.is(tag)){
			p=$(p).closest(tag);
		}
		return p;
	},
	getSel: function(){
		return this.doc.selection ? this.doc.selection : this.win.getSelection();
	},
	getRng: function(bNew){
		var sel,rng;
		try{
			if(!bNew){
				sel = this.getSel();
				rng = sel.createRange ? sel.createRange() : sel.rangeCount > 0?sel.getRangeAt(0):null;
			}
			if(!rng){
				rng = this.doc.body.createTextRange?this.doc.body.createTextRange():this.doc.createRange();
			}
		}catch (ex){}
		return rng;
	},
	setRngToElement: function(element){
		var sel = this.getSel(),rng = this.getRng(true);
		if(isIE){
			rng.moveToElementText(element[0]);
			rng.select();
		}else{
			rng.selectNode(element[0]); 
			sel.removeAllRanges();
			sel.addRange(rng);
		}
		this.bookmark = null;
	},
	getSelect: function(format){
		var sel = this.getSel(),rng = this.getRng(),isCollapsed = true;
		if (!rng || rng.item){
			isCollapsed = false;
		}else{
			isCollapsed = !sel || rng.boundingWidth === 0 || rng.collapsed;
		}
		if(format==='text') {
			return isCollapsed ? '' : (rng.text || (sel.toString ? sel.toString() : ''));
		}
		var html;
		if(rng.cloneContents){
			var $tmp = $('<div></div>'),c;
			c = rng.cloneContents();
			if(c){
				$tmp.append(c);
			}
			html = $tmp.html();
		}else if(rng.item){
			html = rng.item(0).outerHTML;
		}else if(rng.htmlText){
			html = rng.htmlText;
		}else if(!isIE){
			html = rng.toString();
		}
		if(isCollapsed){
			html = '';
		}
		html = this.cleanHTML(html);
		return html;
	},
	setCSS: function(css){
		try{
			this._exec('styleWithCSS',css,true);}
		catch(e){
			try{
				this._exec('useCSS',!css,true);
			}catch(e){}
		}
	},
	saveBookmark: function(){
		if(!this.sourceMode && !this.bookmark){
			var rng = this.getRng();
			rng = rng.cloneRange?rng.cloneRange():rng;
			this.bookmark = {'top':this.$win.scrollTop(),'rng':rng};
		}
	},
	loadBookmark: function(){
		if(this.sourceMode||!this.bookmark)return;
		this.focus();
		var rng = this.bookmark.rng;
		if(isIE){
			rng.select();
		}else{
			var sel = this.getSel();
			sel.removeAllRanges();
			sel.addRange(rng);
		}
		this.$win.scrollTop(this.bookmark.top);
		this.bookmark = null;
	},
	execCmd: function(cmd,value){
		this.focus();
		this.hidePanels();
		this.saveBookmark();
		cmd = cmd.toLowerCase();
		switch(cmd)
		{
			case 'paste':
				try{this.doc.execCommand(cmd);if(!this.doc.queryCommandSupported(cmd))throw 'Error';}
				catch(ex){alert('提示：您现在所使用的浏览器不支持此操作，请使用快捷键 [Ctrl + V]！');}
				break;
			case 'fontname':
				this.showFontName();
				break;
			case 'quicksave':
				this.quickSaveArticle();
				break;
			case 'preview':
				this.previewArticle();
				break;
			case 'fontsize':
				this.showFontSize();
				break;
			case 'fontcolor':
				this.showFontColor();
				break;
			case 'backcolor':
				this.showBgColor();
				break;
			case 'ol':
				this._exec('insertOrderedList');
				break;
			case 'ul':
				this._exec('insertUnorderedList');
				break;
			case 'link':
				this.showLinkDialog();
				break;
			case 'emot':
				this.showEmot();
				break;
			default:
				this._exec(cmd);
				break;
		}
	},
	_exec: function(cmd,param,noFocus){
		if(!noFocus){
			this.focus();
		}
		this.loadBookmark();
		var state;
		if(param!==undefined){
			state = this.doc.execCommand(cmd,false,param);
		}else{
			state= this.doc.execCommand(cmd,false,null);
		}
		return state;
	},
	focus: function(){
		var self = this;
		if(!this.sourceMode){
			this.$win.focus();
		}else{
			$('#sourceCode',this.doc).focus();
		}
		if(isIE){
			var rng = this.getRng();
			if(rng.parentElement&&rng.parentElement().ownerDocument!==this.doc){
				this.setCursorFirst();//修正IE初始焦点问题
			}
		}
		return false;
	},
	setCursorFirst: function(firstBlock){
		this.win.scrollTo(0,0);
		var rng = this.getRng(true),_body = this.doc.body,firstNode = _body,firstTag;
		if(firstBlock&&firstNode.firstChild&&(firstTag=firstNode.firstChild.tagName)&&firstTag.match(/^p|div|h[1-6]$/i)){
			firstNode = _body.firstChild;
		}
		isIE?rng.moveToElementText(firstNode):rng.setStart(firstNode,0);
		rng.collapse(true);
		if(isIE){
			try{
				rng.select();
			}catch(e){
				
			}
		}else{
			var sel = this.getSel();
			sel.removeAllRanges();
			sel.addRange(rng);
		}
	},
	toggleSource: function(b){
		if(this.sourceMode === b){
			return;
		}
		var $body = $(this.doc.body),html = this.getSource();
		if(!this.sourceMode){
			if(isIE){
				this.doc.body.contentEditable = 'false';
			}else{
				this.doc.designMode = 'off';
			}
			$body.attr('scroll','no').removeClass('editMode').addClass('sourceMode').html('<textarea id="sourceCode" wrap="soft" spellcheck="false" height="100%"><textarea>');
			this.$container.find('[data-cmd]').removeClass('be-btn-down be-btn-over').addClass('be-btn-normal');
			this.$container.find('[data-cmd=photo] :first-child').hide();
		}else{
			$body.html('').removeAttr('scroll').removeClass('sourceMode').addClass('editMode');
			if(isIE){
				this.doc.body.contentEditable = 'true';
			}else{
				this.doc.designMode = 'on';
			}
			if(isMozilla){
				//this._exec("inserthtml","-");//修正firefox源代码切换回来无法删除文字的问题
			}
			this.$container.find('[data-cmd=photo] :first-child').show();
		}
		this.sourceMode = b;
		this.setSource(html);
		if(!this.sourceMode){
			this.setCursorFirst(true);
		}
	},
	setSource: function(html){
		this.bookmark = null;
		if(typeof html !== 'string' && html !== ''){
			html = this.$textarea ? this.$textarea.val() : '<p>&nbsp;&nbsp;&nbsp;&nbsp;</p>';
		}
		if(this.sourceMode){
			$('#sourceCode',this.doc).val(html);
		}else{
			html = this.cleanHTML(html);
			if(isIE){
				//修正IE会删除可视内容前的script,style,<!--
				this.doc.body.innerHTML='<img id="_be_temp" width="0" height="0" />'+html+'\n';//修正IE会删除&符号后面代码的问题
				$('#_be_temp',this.doc).remove();
			}else{
				this.doc.body.innerHTML = html;
			}
		}
	},
	getSource: function(){
		var html;
		if(this.sourceMode){
			html = $('#sourceCode',this.doc).val();
		}else{
			html = this.doc.body.innerHTML;
			html = this.cleanHTML(html);
		}
		return html;
	},
	pasteHTML: function(html,bStart){
		if(this.sourceMode)return false;
		this.focus();
		html = html;
		var sel = this.getSel(),rng = this.getRng();
		if(bStart !== undefined){//非覆盖式插入
			if(rng.item){
				var item = rng.item(0);
				rng = this.getRng(true);
				rng.moveToElementText(item);
				rng.select();
			}
			rng.collapse(bStart);
		}
		html += '<'+(isIE?'img':'span')+' id="_be_temp" width="0" height="0" />';
		if(rng.insertNode){
			rng.deleteContents();
			rng.insertNode(rng.createContextualFragment(html));
			//console.log(html);
		}else{
			if(sel.type.toLowerCase()==='control'){
				sel.clear();
				rng = this.getRng();
			}
			rng.pasteHTML(html);
		}
		var $temp=$('#_be_temp',this.doc),temp = $temp[0];
		if(isIE){
			rng.moveToElementText(temp);
			rng.select();
		}else{
			rng.selectNode(temp); 
			sel.removeAllRanges();
			sel.addRange(rng);
		}
		$temp.remove();
	},
	cleanHTML: function(html){
		html = html.replace(/<!?\/?(DOCTYPE|html|body|meta|head)(\s+[^>]*?)?>/ig, '');
		html = html.replace(/<\??xml(:\w+)?(\s+[^>]*?)?>([\s\S]*?<\/xml>)?/ig, '');
		html = html.replace(/<script(\s+[^>]*?)?>[\s\S]*?<\/script>/ig, '');
		html = html.replace(/<style(\s+[^>]*?)?>[\s\S]*?<\/style>/ig, '');
		html = html.replace(/(<(\w+))((?:\s+[\w-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]+))*)\s*(\/?>)/ig,function(all,left,tag,attr,right){
			//替换掉行内js事件
			attr = attr.replace(/\s+on(?:click|dblclick|mouse(down|up|move|over|out|enter|leave|wheel)|key(down|press|up)|change|select|submit|reset|blur|focus|load|unload)\s*=\s*("[^"]*"|'[^']*'|[^>\s]+)/ig,'');
			//替换掉行内定位样式
			attr = attr.replace(/position\s*:\s*(?:relative|absolute)\s*;?/ig,'');
			//替换掉行内float
			attr = attr.replace(/float\s*:\s*(?:left|right)\s*;?/ig,'');
			return left+attr+right;
		});
		html = html.replace(/<\/(strong|b|u|strike|em|i)>((?:\s|<br\/?>|&nbsp;)*?)<\1(\s+[^>]*?)?>/ig,'$2');//连续相同标签
		//html = html.replace(/\r?\n/g,'<br />');//将换行替换成<br />
		return html;
	},
	dialog: function(opts){
		var self = this;
		var options = {
			className: "",
			btns: ["accept", "cancel"],
			labAccept: '确定',
			labCancel: '取消',
			title: '',
			content: '',
			fixed: false,
			modal: false,
			scrollIntoView: false,
			onBeforeAccept: function(){},
			onClose: function(){
				self.$mask.hide();
				self.showUploadLoading(false);
			}
		};
		$.extend(options,opts || {});
		var $dialog = $.dialog(options);
		var thisOffset = this.$container.offset();
		$dialog.css({
			left: thisOffset.left + (this.$container.width()-$dialog.width())/2,
			top: thisOffset.top + this.$container.find('.be-toolbar').outerHeight() + 5
		});
		this.$mask.show();
	},
	showLinkDialog: function(){
		var self = this,selText = this.getSelect(),$link = this.getParent('a');
		if(selText === '' && !$link.length){
			this.dialog({
				className: "jquery-alert",
				btns: ["accept"],
				defaultBtn: "accept",
				title: false,
				content: '请选择要添加链接的内容！'
			});
		}else{
			var $content = $('<div class="blogeditor-addlink-dialog"></div>');
			var html = '<div><label>链接网址</label><input class="link" type="text" value="http://" /></div>';
			html += '<div><label>目标窗口</label><select class="target"><option selected="selected" value="_blank">弹出新窗口</option><option value="_self">当前窗口</option></select></div>';
			$content.html(html);
			if($link.length){
				$content.find('.link').val($link.attr('href'));
				$content.find('.target').val($link.attr('target'));
			}
			this.dialog({
				title: '添加链接',
				content: $content,
				onBeforeAccept: function(){
					var regx = /^http(?:s)?:\/\//i,url = $content.find('.link').val(),target = $content.find('.target').val();
					if(!regx.test(url)){
						url = 'http://' + url;
					}
					if(url == 'http://'){
						//删除链接
						if($link.length){
							self.setRngToElement($link);
							self._exec('unlink');
						}
					}else{
						if($link.length){
							//更新已有的链接
							$link.attr('href',url).attr('target',target);
						}else{
							//创建新链接
							self.loadBookmark();
							self.pasteHTML('<a href="'+url+'" target="'+target+'">'+selText+'</a>');
							//console.log(selText);
						}
					}
				}
			});
			$content.find('.link').select();
		}
	},
	
	previewArticle: function(){
		var title = $('#titleblog').val(); 
		if(/^\s*$/.test(title) || title == '请填写标题'){
			$.inform({
				icon: 'icon-error',
				delay: 1000,
				easyClose: true,
				content: '标题不能为空，请输入博客标题。',
				onClose: function($dialog) {}
			});
			$('#titleblog').focus();
			return;
			//
		}else if(title.replace(/[^\x00-\xff]/g,"aa").length > 100){
			$.inform({
				icon: 'icon-error',
				delay: 1000,
				easyClose: true,
				content: '标题不能超过50字符。',
				onClose: function($dialog) {}
			});
			$('#titleblog').focus();
			return;
		}
		
		var content = this.htmlText();				
		var tag = ($('#blogtag').val() == "请输入标签") ? "" : $('#blogtag').val();
		var category = $("#categoryselect").val();
		var comment = '0';
	
	
		$("#formTitle").val(title);
		$("#formContent").val(content);
		$("#formKeywords").val(tag);
		$("#formCategory").val(category);
		
	
		$("#ArticlePreviewForm").submit();
		
	},
	quickSaveArticle: function(){
		var title = $('#titleblog').val(); 
		if($.trim(title).length == 0 || title == '请填写标题'){
			$.inform({
				icon: 'icon-error',
				delay: 2000,
				easyClose: true,
				content: '标题不能为空，请输入博客标题。',
				onClose: function($dialog) {}
			});
			$('#titleblog').focus();
			return;
		}
		var content = this.htmlText();				
		var tag = ($('#blogtag').val() == "请输入标签") ? "" : $('#blogtag').val();
		var category = $("#categoryselect").val() || $("#categoryId").val();
		var comment = '0';
		
		var vcode = $("#vcode").val() || "";
		var vcodeEn = $("#vcodeEn").val() || "";
		
		var saveURL = '/a/blog/home/entry/save.htm?_input_encode=UTF-8&_output_encode=UTF-8';
		var updateURL = '/a/blog/home/entry/update.htm?_input_encode=UTF-8&_output_encode=UTF-8'
		var quicksaveArticleID = $("#savedraftarticle").data("ArticleID");
		var sendURL = (quicksaveArticleID == undefined) ? saveURL : updateURL;
		
		$.ajax({
			url:sendURL,
			type:'POST',
			data:{"id":quicksaveArticleID,"title":title,"content":content,"keywords":tag,"categoryId":category,"oper":"art_draft","allowComment":comment,"vcode":vcode,"vcodeEn":vcodeEn},
			success:function(result){
				var json = $.parseJSON(result);
				if(!json.status){
					var date = new Date();
					var hours = date.getHours();
					var minutes = date.getMinutes();
					var nowHours = (hours.length == 1) ? ("0"+hours) : hours;
					var nowMinutes = (minutes.length == 1) ? ("0"+minutes) : minutes;
					//var time = nowHours +":"+ nowMinutes;
					var time = '';
	
					if($("#QuickSaveTips").length == 0){
						$("#QuickSaveTips").data("State","Idle");
						var HtmlString = '<span id="QuickSaveTips" style="display:none; text-align:center; height:22px;line-height:22px;border-radius: 5px 5px 5px 5px;background-color:#70b907;border:1px solid #e8e8e8;padding: 0 10px; color:#fff; position:absolute;width:200px;top:205px;padding:0 10px; margin:0 0 0 -50px; left:50%; " ></span>';
						$("body").append(HtmlString);
					}
					
					if($("#QuickSaveTips").data("State") != "Busy"){
						$("#QuickSaveTips").data("State","Busy");
						$("#QuickSaveTips").css({"top":"205px"}).text("已成功为您保存到草稿箱").fadeIn(1000).delay(3000).fadeOut(1000);
						setTimeout(function(){
							$("#QuickSaveTips").data("State","Idle");
						},3000);
					}
					$("#savedraftarticle").data("ArticleID",json.data);
					
				}else{
					if($("#QuickSaveTips").length == 0){
						var HtmlString = '<span id="QuickSaveTips" style="display:none; text-align:center; height:22px;line-height:22px;border-radius: 5px 5px 5px 5px;background-color:#70b907;border:1px solid #e8e8e8;padding: 0 10px; color:#fff; position:absolute;width:200px;top:210px;padding:0 10px; margin:0 0 0 -50px; left:50%; " ></span>';
						$("body").append(HtmlString);
					}
					if($("#QuickSaveTips").data("State") != "Busy"){
						$("#QuickSaveTips").data("State","Busy");
						$("#QuickSaveTips").css({"top":"205px"}).text(json.statusText).fadeIn(1000).delay(3000).fadeOut(1000);
						setTimeout(function(){
							$("#QuickSaveTips").data("State","Idle");
						},3000);
					}
				}
			}
		});
	
		
	},
	
	showFontName: function(){
		if(this.panels['fontname']){
			this.panels['fontname'].show();
			return;
		}
		var self = this;
		var $fontname = $('<ul class="list"></ul>'),$fontbtn = $('[data-cmd=fontname]',this.$container);
		var html = '',offset = $fontbtn.position();
		for(var i=0;i<fontnameList.length;i+=1){
			html += '<li style="font-family:'+fontnameList[i].font+'" data-value="'+fontnameList[i].font+'">'+fontnameList[i].text+'</li>';
		}
		$fontname.html(html).appendTo(this.$container);
		$fontname.css({
			left: offset.left,
			top: offset.top + $fontbtn.outerHeight() + 2
		});
		$fontname.find('li')
		.hover(function(){
			$(this).addClass('hover');
		},function(){
			$(this).removeClass('hover');
		})
		.click(function(){
			var $li = $(this);
			self.loadBookmark();
			self._exec('fontName',$li.attr('data-value'));
			self.checkAllCommandState();
			self.hidePanels();
		});
		this.panels['fontname'] = $fontname;
	},
	showFontSize: function(){
		if(this.panels['fontsize']){
			this.panels['fontsize'].show();
			return;
		}
		var self = this;
		var $fontsize = $('<ul class="list fontsize"></ul>'),$fontbtn = $('[data-cmd=fontsize]',this.$container);
		var html = '',offset = $fontbtn.position();
		for(var i=0;i<fontsizeList.length;i+=1){
			html += '<li data-value="'+fontsizeList[i].size+'">'+fontsizeList[i].text+'</li>';
		}
		$fontsize.html(html).appendTo(this.$container);
		$fontsize.css({
			left: offset.left,
			top: offset.top + $fontbtn.outerHeight() + 2
		});
		$fontsize.find('li')
		.hover(function(){
			$(this).addClass('hover');
		},function(){
			$(this).removeClass('hover');
		})
		.click(function(){
			var $li = $(this);
			self.loadBookmark();
			self._exec('fontSize',$li.attr('data-value'));
			self.checkAllCommandState();
			self.hidePanels();
		});
		this.panels['fontsize'] = $fontsize;
	},
	showFontColor: function(){
		if(this.panels['fontcolor']){
			this.panels['fontcolor'].show();
			return;
		}
		var self = this,$panel = this.buildColorPanel(),$btn = $('[data-cmd=fontcolor]',this.$container),offset = $btn.position();
		$panel.appendTo(this.$container);
		$panel.css({
			left: offset.left,
			top: offset.top + $btn.outerHeight() + 2
		});
		$panel.find('li').click(function(){
			var $li = $(this);
			self.loadBookmark();
			self._exec('foreColor',$li.attr('data-value'));
			self.hidePanels();
		});
		this.panels['fontcolor'] = $panel;

	},
	showBgColor: function(){
		if(this.panels['backcolor']){
			this.panels['backcolor'].show();
			return;
		}
		var self = this,$panel = this.buildColorPanel(),$btn = $('[data-cmd=backcolor]',this.$container),offset = $btn.position();
		$panel.appendTo(this.$container);
		$panel.css({
			left: offset.left,
			top: offset.top + $btn.outerHeight() + 2
		});
		$panel.find('li').click(function(){
			var $li = $(this);
			self.loadBookmark();
			if(isIE){
				self._exec('backColor',$li.attr('data-value'));
			}else{
				self.setCSS(true);
				self._exec('hiliteColor',$li.attr('data-value'));
				self.setCSS(false);
			}
			self.hidePanels();
		});
		this.panels['backcolor'] = $panel;
	},
	buildColorPanel: function(){
		var $colors = $('<ul class="color"></ul>'),html='';
		for(var i=0;i<colorList.length;i+=1){
			if(colorList[i] == 'auto'){
				html += '<li data-value="#" class="auto">自动颜色</li>';
			}else if(colorList[i] == 'newline'){
				//nothing
			}else{
				html += '<li class="item" data-value="'+colorList[i]+'" style="background-color:'+colorList[i]+'"></li>';
			}
		}
		$colors.html(html)
		$colors.find('.auto').hover(function(){
			$(this).addClass('hover');
		},function(){
			$(this).removeClass('hover');
		});
		return $colors;
	},
	showEmot: function(){
		var self = this;
		if(this.panels['emot']){
			this.panels['emot'].show();
			return;
		}
		var self = this;
		var $emot = $('<ul class="emot"></ul>'),$btn = $('[data-cmd=emot]',this.$container);
		var html = '',offset = $btn.position();
		for(var i=0;i<emotList.length;i+=1){
			html += '<li data-ubb="'+emotList[i].ubb+'" data-title="'+emotList[i].title+'" data-src="'+emotList[i].url+'"><a href="javascript:void(0)" title="'+emotList[i].title+'"><img src="'+emotList[i].url+'" /></a></li>';
		}
		$emot.html(html).appendTo(this.$container);
		$emot.css({
			left: offset.left,
			top: offset.top + $btn.outerHeight() + 2
		});
		$emot.find('li')
		.click(function(){
			var $li = $(this);
			self.loadBookmark();
			self.pasteHTML('<img src="'+$li.attr('data-src')+'" alt="'+$li.attr('data-title')+'" title="'+$li.attr('data-title')+'" />');
			self.hidePanels();
		});
		this.panels['emot'] = $emot;
	},
	hidePanels: function(){
		$.each(this.panels,function(key,obj){
			if(obj){
				obj.hide();
			}
		});
	},
	checkAllCommandState: function(){
		if(this.cacsTimeout){
			clearTimeout(this.cacsTimeout);
		}
		var self = this;
		setTimeout(function(){
			if(self.sourceMode){
				return;
			}
			var cmds = ['bold','italic','underline','justifyLeft','justifyRight','justifyCenter','fontName','fontSize','insertOrderedList','insertUnorderedList'];
			for(var i=0;i<cmds.length;i+=1){
				self.checkCommandState(cmds[i]);
			}
		},200);
	},
	checkCommandState: function(cmd){
		try{
			if(self.sourceMode){
				return;
			}
			cmd = cmd.toLowerCase();
			switch(cmd){
				case 'insertorderedlist':
					this.setCommandState('ol',this.doc.queryCommandState(cmd));
					break;
				case 'insertunorderedlist':
					this.setCommandState('ul',this.doc.queryCommandState(cmd));
					break;
				case 'fontname':
					this.setCommandState('fontname',this.doc.queryCommandValue(cmd));
					break;
				case 'fontsize':
					this.setCommandState('fontsize',this.doc.queryCommandValue(cmd));
					break;
				default:
					this.setCommandState(cmd,this.doc.queryCommandState(cmd));
					break;
			}
		}catch(ex){}
	},
	setCommandState: function(cmd,b){
		var $btn = $('[data-cmd='+cmd+']',this.$container),i;
		if($btn){
			if(cmd == 'fontname'){
				if(b != ''){
					var fn = b.split(',')[0],fntext = '字体';
					for(i=0;i<fontnameList.length;i+=1){
						if(fn.indexOf(fontnameList[i].font) > -1 || fn.indexOf(fontnameList[i].cn) > -1){
							fntext = fontnameList[i].text;
							break;
						}
					}
					$btn.html(fntext);
				}else{
					$btn.html('字体');
				}
			}else if(cmd == 'fontsize'){
				if(b != ''){
					var fs = b,fstext = '字号';
					for(i=0;i<fontsizeList.length;i+=1){
						if(fontsizeList[i].size == fs){
							fstext = fontsizeList[i].text;
							break;
						}
					}
					$btn.html(fstext);
				}else{
					$btn.html('字号');
				}
			}else{
				if(b){
					$btn.removeClass('be-btn-normal be-btn-over').addClass('be-btn-down');
				}else{
					$btn.removeClass('be-btn-down be-btn-over').addClass('be-btn-normal');
				}
			}
		}
	},
	//获取html值
	htmlText: function(html){
		if(html){
			this.setSource(html);
		}
		return this.getSource();
	},
	//获取权限
	commentValue: function(){
		if(this.options.comment){
			return this.$container.find('.be-comment-select select').eq(0).val();
		}
		return null;
	},
	//显示
	show: function(){
		this.$container.show();
	},
	//隐藏
	hide: function(){
		this.$container.hide();
	},
	//重新初始化swfupload
	//显示隐藏
	reDrawSwfupload: function(){
		this.$container.find('[data-cmd=photo]').html('<i id="_be_upload_'+this.instanceId+'"></i>');
		this.initSwfupload();
	},
	//取得高度
	getHeight: function(){
		return this.height;
	},
	//设置高度
	setHeight: function(num){
		if(typeof num !== 'number'){
			return this.height;
		}
		//设置高度
		this.height = num;
		this.$container.height(this.height);
		if(this.$iframe){
			this.$iframe.height(this.height - this.$container.find('.be-toolbar').outerHeight() - this.$container.find('.be-footer').outerHeight());
		}
		if(this.$mask){
			this.$mask.height(this.$container.height());
		}
		if(this.$loading){
			this.$loading.css({
				left: (this.width-this.$loading.width())/2,
				top: (this.height-this.$loading.height())/2
			});
		}
		this.setIframeDim();
		return this.height;
		//end
	},
	//返回插件实例内的某个元素
	find: function(selector){
		return this.$container.find(selector);
	}
};

$.BlogEditor = BlogEditor;

})(jQuery,window);