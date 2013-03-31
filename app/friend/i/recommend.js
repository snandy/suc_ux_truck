/*
 *	home proxy方式 好友后台 特别推荐
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'friend';

var core = ms.friend;//将friend类缩写成core

var PAGE_NAME = 'blogRecommend';

var win = window,
	doc = document;

function errorAlert(text){
	$.inform({
		icon : 'icon-error',
		delay : 2000,
		easyClose : true,
		content : text
	});
}

function getPersonalURL(){
	var cookie = $.cookie("sucaccount", {raw: true});
	if(cookie){
		return 'http://i.sohu.com/p/' + cookie.split('|')[4] + '/';
	}
	return '#';
}

//分页
var Pager = function(settings){
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
Pager.prototype = {
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
		max = parseInt(max,10);
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

//添加弹窗
var BlogRecommendDlg = function(opts){
	var defaults = {
		onAppend: function(){},//点击添加并成功后
		onBeforeShow: function(){}//弹窗读取接口并显示前
	};
	opts = $.extend(defaults,opts || {});

	var MODE = {
		all: 'all',
		search: 'search',
		selected: 'selected'
	};
	
	var self = this,
		inited = false,
		$container,
		$mask,
		$groups,
		pageList,
		selected = [],
		mode = MODE.all,// all search selected
		lastParams = {};//存数最后一次请求的参数

	function init(){
		$container = $('<div class="f-add-commend-wrapper" style="display:none"></div>');
		var html = [
		'<a class="close" href="javascript:void(0)" title="关闭"></a>',
		'<div class="f-add-commend-title"><h1>选择您推荐的人</h1></div>',
		'<div class="f-add-commend-con">',
			'<div class="f-add-commend-search">',
				'<form action="" onsubmit="return false">',
				'<input type="text" name="nick" maxlength="12" value="" />',
				'<span class="ui-btn"><span>查找</span></span>',
				'</form>',
			'</div>',
			'<div class="f-add-commend-tab">',
				'<h2>您目前跟随的人</h2>',
				'<div class="choice-firend">',
					'<a href="javascript:void(0)">筛选好友</a>',
				'</div>',
				'<div class="choice-tab">',
					'<a class="selected brd-all" href="javascript:void(0)">全部</a><a class="brd-selected" href="javascript:void(0)">已选(<span>0</span>)</a>',
				'</div>',
			'</div>',
			'<div class="f-add-commend-firend-list">',
				'<ul></ul>',
				'<div class="f-add-commend-firend-page"></div>',
			'</div>',
		'</div>',
		'<div class="f-add-commend-btn">',
			'<span class="ui-btn brd-append"><span>确定</span></span><span class="ui-btn btn-gray"><span>取消</span></span>',
		'</div>'
		].join('');

		$container.html(html).appendTo('body');

		$mask = $('<div class="f-add-commend-mask" style="display:none"></div>');
		$container.before($mask);

		$container.find('a.close,div.f-add-commend-btn > span.btn-gray').bind('click',function(){
			self.hide();
		});
		
		var $choice = $container.find('div.choice-firend > a');

		$container.find('span.brd-append').bind('click',function(){
			var $o = $(this);
			if($o.hasClass('ui-btn-disabled')) return;
			var xpts = getSelectedXpts();
			if(xpts.length == 0){
				errorAlert('您还未选择任何用户，请选择');
				return;
			}

			if(xpts.length > 6){
				errorAlert('最多仅能选择6人，请重新查看！');
				lastParams = {};
				$choice.text('筛选好友');
				loadSelected();
				return;
			}
			
			$o.addClass('ui-btn-disabled');
			var tid = setTimeout(function(){
				$o.removeClass('ui-btn-disabled');
			},10000);
			$.getJSON('/a/app/friend/recommend/add.do',{'xpts': xpts.join(','),isUpdate: true},function(results){
				clearTimeout(tid);
				$o.removeClass('ui-btn-disabled');
				if(results.code == 0){
					$.inform({
						icon : 'icon-success',
						delay : 2000,
						easyClose : true,
						content : "保存成功"
					});
					self.hide();
					if($.isFunction(opts.onAppend)) opts.onAppend(self);
				}else{
					errorAlert(results.msg);
				}
			});
		});
		
		

		$container.find('a.brd-all').bind('click',function(){
			lastParams = {};
			$choice.text('筛选好友');
			loadFriends();
		});

		$container.find('a.brd-selected').bind('click',function(){
			lastParams = {};
			$choice.text('筛选好友');
			loadSelected();
		});

		$container
		.delegate('li[data-xpt] > div.img','click',function(){
			var $o = $(this).closest('li[data-xpt]');
			$o.toggleClass('selected');
			if($o.hasClass('selected')){
				var $un = $o.find('h3.name > a');
				var obj = {
					xpt: $o.attr('data-xpt'),
					name: $un.attr('title'),
					url: $un.attr('href'),
					icon: $o.find('img').attr('src')
				};
				add(obj);
			}else{
				remove($o.attr('data-xpt'));
			}
		});

		pageList = new Pager({
			appendTo: $container.find('div.f-add-commend-firend-page'),
			current: 1,
			max: 1,
			maxShow: 7,
			autoUpdate: false,
			onClick: function(page){
				lastParams.curPage = page;
				if(mode == MODE.all){
					loadFriends(lastParams);
				}
				else if(mode == MODE.search){
					loadSearch(lastParams);
				}
			}
		});
		initGroups();

		//搜索
		var $nick = $container.find('div.f-add-commend-search input[name="nick"]'),
			$form = $container.find('div.f-add-commend-search form');
		
		function submit(){
			if($.trim($nick.val()) == '') return;
			lastParams = {
				searchNick: $nick.val()
			};
			$choice.text('筛选好友');
			loadSearch(lastParams);
			$nick.blur();
		}
		
		$nick
		.focus(function(){
			suggestSubmit = false;
		})
		.iPrompt({text: '输入昵称或备注',css:{'color':'#999999'}})
		.ajaxSuggest({
			appendTo: 'div.f-add-commend-wrapper',
			url: '/a/search/user/friend/sug.do?cb=?&_input_encode=UTF-8',
			dataType: 'jsonp',
			paramName: 'nick',
			extraParams: {
				'type':'friend'
			},
			funFormatResults: function(data){
				var ary,results = [];
				if(data.code == 1){
					if($.isArray(data.data.friends)){
						ary = data.data.friends;
						for(var i=0;i<ary.length;i+=1){
							results[results.length] = {
								data: ary[i].nick,
								value: ary[i].nick
							};
						}
					}
				}
				
				return results;
			},
			funFormatItem: function(value,data,lastValue){
				lastValue = $.trim(lastValue);
				value = core.utils.cutCjkString(value,26,'...',2);
				if(lastValue == ''){
					return value;
				}
				var reg = new RegExp('('+lastValue+')','ig');
				return value.replace(reg,'<strong>$1</strong>');
			},
			onItemSelect: function(data){
				//nothing
				//submit();
			}
		});

		$form.bind('submit',function(){
			submit();
			return false;
		}); 

		$container.find('div.f-add-commend-search span.ui-btn').bind('click',function(){
			submit();
		});
		
		inited = true;
	}

	function adjust(){
		var $win = $(win),
			left = ($win.width() - $container.width())/2,
			top = ($win.height() - $container.height())/2 + $win.scrollTop();

		$container.css({
			left : left,
			top : top < 30 ? 30 : top
		});

		$mask.css({
			width: $win.width(),
			height: $win.height()
		});		
	}

	function initGroups(){
		$.getJSON('/a/app/friend/group/getgroups.do',function(results){
			if(results.code == 1){
				var $btn = $container.find('div.choice-firend'),
					$text = $container.find('div.choice-firend > a'),
					$box = $('<div style="top:113px; left:126px; display:none" class="f-add-commend-win-select-friend"></div>'),
					groups = results.data.groups,
					html = ['<ul class="first"><li><a href="javascript:void(0)" data-groupId="all">全部分组</a></li>'];
				for(var i=0,len=groups.length;i<len;i+=1){
					if(i == 10){
						html.push('</ul><ul class="secend"><li></li>');
					}
					html.push('<li><a href="javascript:void(0)" data-groupId="'+groups[i].groupId+'">'+groups[i].groupName+'</a></li>');
				}
				html.push('</ul>');
				function hideBox(){
					$box.hide();
					$container.unbind('click',hideBox);
				}
				$container.append($box.html(html.join('')));
				$btn
				.bind('click',function(){
					$box.show();
					$container.unbind('click',hideBox);
					setTimeout(function(){
						$container.bind('click',hideBox);
					},0);
				})
				.hover(function(){$(this).addClass('choice-firend-hover');},function(){$(this).removeClass('choice-firend-hover');});
				$box.find('li > a').bind('click',function(){
					var $o = $(this),
						groupId = $o.attr('data-groupId');
					$text.text($o.text());
					
					if(groupId == 'all'){
						lastParams = {};
					}else{
						lastParams = {
							groupId: groupId
						};
					}
					loadFriends(lastParams);
				});
			}
		});
	}

	function noContent(){
		var text;
		if(mode == MODE.all){
			if(lastParams.groupId) text = '该分组为空，请尝试其他分组！';
			else text = '抱歉，您目前跟随的人数为0，无法选择推荐的人！';
		}
		else if(mode == MODE.search){
			text = '该昵称不存在你跟随的人中，请重新搜索！';
		}
		else if(mode == MODE.selected){
			text = '您还未选择任何用户，请选择';
		}
		var html = [
		'<div class="fox-tips">',
			'<div style="width:180px; margin:50px 0 0 8px;" class="f-recommend-arrowtips">',
				'<div class="arrow"></div>',
				'<div class="tips-con">' + text + '</div>',
			'</div>',
			'<div style="margin:15px 0 0 30px" class="f-recommend-tips-fox2"></div>',
		'</div>'
		].join('');
		$container
		.find('div.fox-tips').remove().end()
		.find('div.f-add-commend-firend-list').children().hide().end().append(html);
	}
	
	function isSelected(xpt){
		for(var i=0,len=selected.length;i<len;i+=1){
			if(selected[i].xpt == xpt){
				return i;
			}
		}
		return -1;
	}
	
	function add(obj){
		if(isSelected(obj.xpt) == -1){
			selected.push(obj);
		}
		updateCounter();
	}

	function remove(xpt){
		var index = isSelected(xpt);
		if(index > -1){
			selected.splice(index,1);
		}
		updateCounter();
	}
	
	//更新已选数字
	function updateCounter(){
		var $o = $container.find('a.brd-selected > span');
		$o.text(selected.length);
		if(selected.length > 6) $o.addClass('red');
		else $o.removeClass('red');
	}
	

	//获取已经选择的xpt列表
	function getSelectedXpts(){
		var xpts = [];
		for(var i=0,len=selected.length;i<len;i+=1){
			xpts.push(selected[i].xpt);
		}
		return xpts;
	}
	
	//全部
	function loadFriends(params){
		var b = false;
		if(typeof params === 'boolean'){
			b = params
			params = {}
		}else{
			params = params || {};
		}
		mode = MODE.all;
		$container.find('a.brd-all').addClass('selected').siblings().removeClass('selected');
		$.getJSON('/a/app/friend/recommend/followlist/',params,function(results){
			if(results.code == 0){
				build(results.data,b);
			}else{
				noContent();
			}
		});
	}
	
	//搜索
	function loadSearch(params){
		var b = false;
		if(typeof params === 'boolean'){
			b = params
			params = {}
		}else{
			params = params || {};
		}
		mode = MODE.search;
		$container.find('a.brd-all').addClass('selected').siblings().removeClass('selected');
		$.getJSON('/a/search/user/friend/search/recommend.do?_input_encode=UTF-8',params,function(results){
			if(results.code == 0){
				build(results.data,b);
			}else{
				noContent();
			}
		});
	}
	
	//已选
	function loadSelected(){
		mode = MODE.selected;
		$container.find('a.brd-selected').addClass('selected').siblings().removeClass('selected');
		var data = {
			friends: selected,
			curPage: 1,
			totalPage: 1
		};
		build(data);
	}

	function build(data,b){
		var html = [];
		for(var i=0,len=data.friends.length;i<len;i+=1){
			var obj = data.friends[i];
			html.push('<li data-xpt="'+obj.xpt+'"'+(isSelected(obj.xpt) > -1 ? ' class="selected"' : '')+'>');
			html.push('<div class="img"><img src="'+obj.icon+'"><span></span></div>');
			html.push('<h3 class="name"><a href="'+obj.url+'" target="_blank" title="'+obj.name+'">'+obj.name+'</a></h3>');
			html.push('</li>');
		}
		$container.find('div.f-add-commend-firend-list > ul').html(html.join(''));

		$container
		.find('div.fox-tips').remove().end()
		.find('div.f-add-commend-firend-list').children().show();

		$mask.show();
		$container.show();
		pageList.update(data.curPage,data.totalPage);
		if(len == 0){
			noContent();
		}
		updateCounter();
		if(b) adjust();
	}

	this.show = function(data){
		if(!inited){
			init();
		}
		selected = [];
		$container.find('div.f-add-commend-search input[name="nick"]').val('').blur();
		$container.find('div.choice-firend > a').text('筛选好友');
		if($.isFunction(opts.onBeforeShow)) opts.onBeforeShow(self);
		loadFriends(true);
		$(win).bind('resize',adjust);

	}

	this.hide = function(){
		$mask.hide();
		$container.hide();
		$(win).unbind('resize',adjust);
	}

	this.setSelected = function(data){
		selected = data;
	}
}

var project = {
	$this: null,
	card: null,//名片
	isInited: false,
	init: function($this){
		var self = this;
		this.$this = $this;
		
		//博友推荐
		
		this.brdlg = new BlogRecommendDlg({
			onAppend: function(inst){
				self.getRecommend();
			},
			onBeforeShow: function(inst){
				var	data = [];
				self.$this.find('div.friend-item-list > div[data-friends-xpt]').each(function(){
					var $o = $(this),$un = $o.find('div.user-name');
					data.push({
						xpt: $o.attr('data-friends-xpt'),
						name: $un.text(),
						url: $un.find('a').attr('href'),
						icon: $o.find('div.user-icon img').attr('src')
					});
				});
				inst.setSelected(data);
			}
		});

		
		this.initCard();//初始化名片
		
		$this
		.delegate('div.s-follow-list > a,div.s-follow-list p','click.'+app,function(event){
			event.preventDefault();
			
			self.brdlg.show();
		})
		.delegate('div.recommend-item','mouseenter.'+app,function(){
			var $o = $(this),
				order = self.getOrder($o);
			$o.addClass('item-curr');
			
			
			if(order.index == 0){
				$o.find('a.up').attr('class','top');
			}else{
				$o.find('a.top').attr('class','up');
			}
			if(order.index == order.length - 1){
				$o.find('a.down').attr('class','bottom');
			}else{
				$o.find('a.bottom').attr('class','down');
			}
		})
		.delegate('div.recommend-item','mouseleave.'+app,function(){
			$(this).removeClass('item-curr');
		})
		.delegate('a.up','click.'+app,function(event){
			event.preventDefault();
			var $o = $(this),
				$p = $o.closest('div.recommend-item');
			$p.prev().before($p);
			$p.mouseleave();
			self.previewMove($p.attr('data-friends-xpt'),'up');
			self.setOrder($p);
		})
		.delegate('a.down','click.'+app,function(event){
			event.preventDefault();
			var $o = $(this),
				$p = $o.closest('div.recommend-item');
			$p.next().after($p);
			$p.mouseleave();
			self.previewMove($p.attr('data-friends-xpt'),'down');
			self.setOrder($p);
		})
		.delegate('div.del > a','click.'+app,function(event){
			event.preventDefault();
			var $p = $(this).closest('div.recommend-item');
			$.confirm({
				title: false,
				content: '<p style="line-height:150%">确定将"'+$.trim($p.find('div.user-name > a').text())+'"移出特别推荐吗？<br />此操作将不会解除你们之间的跟随关系。</p>',
				onConfirm: function(){
					self.del($p);
				}
			});
		})
		.delegate('div.info-txt > a','click.'+app,function(event){
			event.preventDefault();
			var $p = $(this).parent(),
				text = $p.find('span').text();
			$p.html('<input type="text" value="" class="input" maxlength="30">');
			$p.find('input').val(text).focus();
		})
		.delegate('div.info-txt > input','blur.'+app,function(event){
			self.setDesc($(this));
		})
		.delegate('div.info-txt > input','keypress.'+app,function(event){
			if(event.keyCode == 13){
				self.setDesc($(this));
			}
		});
		
		$this.data('friends-page',PAGE_NAME);			
	},
	getOrder: function($o){
		var $items = this.$this.find('div.recommend-item');
		return {
			index: $items.index($o),
			length: $items.length
		};
	},
	setOrder: function($o){
		var order = this.getOrder($o);
		$.getJSON('/a/app/friend/recommend/update.do',{id: $o.attr('data-rid'),orderNum: order.index+1});
	},
	setDesc: function($input){
		var self = this,
			$p = $input.parent(),
			text = $input.val(),
			$div = $p.closest('div.recommend-item'),
			id = $div.attr('data-rid')
			xpt = $div.attr('data-friends-xpt');

		$.getJSON('/a/app/friend/recommend/update.do?_input_encode=UTF-8',{'id': id,recommendDesc: text},function(results){
			if(results.code == 0){
				$p.html('<span>'+results.data.recommendDesc+'</span><a href="#">点击编辑描述 </a>');
				self.$this.find('ul.commend-item-list > li[data-friends-xpt="'+xpt+'"] p.txt').html('<em>'+results.data.recommendDesc+'</em>');
			}else{
				errorAlert(results.msg);
			}
		});
	},
	previewMove: function(xpt,direction){
		var $o = this.$this.find('ul.commend-item-list > li[data-friends-xpt="'+xpt+'"]');
		if(!$o.length){
			return;
		}
		if(direction == 'up'){
			$o.prev().before($o);
		}
		else if(direction == 'down'){
			$o.next().after($o);
		}
	},
	initCard: function(){
		var self = this;
		this.card = new $.iCard({
			bindElement: '#friend-canvas',
			params: {
				type: 'simple'
			},
			onUnfollow: function(param){
				self.del(self.$this.find('div.recommend-item[data-friends-xpt="'+param.xpt+'"]'));
				self.card.hide();
			}
		});
	},
	getRecommend: function(){
		var self = this;
		$.getJSON('/a/app/friend/recommend/list/'+win.$space_config._xpt+'/',function(results){
			if(results.code == 0){
				self.build(results.data);
			}
		});
	},
	del: function($o){
		var self = this,
			xpt = $o.attr('data-friends-xpt');

		core.removeRecommend(xpt,function(){
			$o.remove();
			self.$this.find('ul.commend-item-list > li[data-friends-xpt="'+xpt+'"]').remove();
			self.emptyMode();
		});
	},
	appendBtnHTML: function(text){
		var html = [
		'<div class="s-follow-list clearfix">',
			'<a class="add" href="#"></a>',
			'<div class="s-follow-tips">',
				'<div class="arrow"></div>',
				'<p>'+text+'</p>',
			'</div>',
		'</div>'
		];
		return html.join('');
	},
	emptyMode: function(){
		var $list = this.$this.find('div.friend-item-list'),
			$empty = this.$this.find('div.f-recommend-empty'),
			$addBtn = $list.find('div.s-follow-list'),
			$rightTips = this.$this.find('div.f-recommend-arrowtips'),
			$rightList = this.$this.find('div.f-commend-right'),
			$rightMore = this.$this.find('div.f-commend-right-more'),
			$rightFox = this.$this.find('div.f-recommend-tips-fox'),
			len = $list.find('div.recommend-item').length;
		if(len > 0){
			if(len < 6){
				if($addBtn.length) $addBtn.show();
				else $list.append(this.appendBtnHTML('点击这里继续选择推荐的人，最多可选择6人'));
			}
			return;
		}
		$list.html(this.appendBtnHTML('您还未选择要推荐的人，点击这里进行选择'));
		if($empty.length){
			$empty.show();
		}else{
			$list.after('<div class="f-recommend-empty"></div>');
		}
		$rightList.hide();
		$rightMore.hide();
		if($rightFox.length){
			$rightFox.show();
		}else{
			$rightTips.after('<div style="margin:15px 0 0 30px" class="f-recommend-tips-fox"></div>');
		}
	},
	build: function(data){
		var listHTML = [],
			previewHTML = [];
		for(var i=0,len=data.viewRecommends.length;i<len;i+=1){
			var obj = data.viewRecommends[i];
			listHTML.push(this.listItemHTML(obj));
			previewHTML.push(this.previewItemHTML(obj));
		}
		if(len < 6)	listHTML.push(this.appendBtnHTML('点击这里继续选择推荐的人，最多可选择6人'));
		this.$this.find('div.friend-item-list').html(listHTML.join(''));

		//right
		var $empty = this.$this.find('div.f-recommend-empty'),
			$rightTips = this.$this.find('div.f-recommend-arrowtips'),
			$rightList = this.$this.find('div.f-commend-right'),
			$rightMore = this.$this.find('div.f-commend-right-more'),
			$rightFox = this.$this.find('div.f-recommend-tips-fox');

		if($empty.length){
			$empty.hide();
		}

		if($rightList.length){
			$rightList.show();
		}else{
			$rightTips.after('<div class="f-commend-right"><h3>选择您推荐的人</h3><ul class="commend-item-list"></ul></div>');
			$rightList = this.$this.find('div.f-commend-right');
		}
		if($rightMore.length){
			$rightMore.show();
		}else{
			$rightList.after('<div class="f-commend-right-more"><a href="'+getPersonalURL()+'" target="_blank">现在就去展示页看看&gt;&gt;</a></div>');
		}
		$rightFox.hide();

		$rightList.find('ul').html(previewHTML.join(''));
	},
	listItemHTML: function(obj){
		return [
		'<div class="recommend-item" data-friends-xpt="'+obj.xpt+'" data-rid="'+obj.id+'">',
			'<div class="user-icon">',
				'<a href="'+obj.homeUrl+'" target="_blank"><img src="'+obj.icon+'" data-card-action="xpt='+obj.xpt+'" data-card-type="isohu" data-card="true"></a>',
			'</div>',
			'<div class="user-info">',
				'<div class="user-name">',
					'<a href="'+obj.homeUrl+'" target="_blank" data-card-action="xpt='+obj.xpt+'" data-card-type="isohu" data-card="true">'+obj.nick+'</a>',
				'</div>',
				'<div class="info-txt">',
					'<span>'+obj.recommendDesc+'</span>',
					'<a href="#">点击编辑描述 </a>',
				'</div>',
			'</div>',
			'<div class="f-sort-box">',
				'<div class="del"><a href="#">移除</a></div>',
				'<div class="btn-wrapper"><a class="up" href="#"></a><a class="down" href="#"></a></div>',
			'</div>',
		'</div>'
		].join('');
	},
	previewItemHTML: function(obj){
		return [
		'<li data-friends-xpt="'+obj.xpt+'" data-rid="'+obj.id+'">',
			'<div class="photo">',
				'<img src="'+obj.icon+'">',
			'</div>',
			'<div class="con">',
				'<a class="name" href="'+obj.homeUrl+'" target="_blank">'+obj.nick+'</a>',
				'<p class="txt"><em>'+obj.recommendDesc+'</em></p>',
			'</div>',
		'</li>'
		].join('');
	}
};


$(function(){
	project.init($('#friend-canvas'));
});


})(jQuery,mysohu);