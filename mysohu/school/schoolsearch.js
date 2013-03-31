/*
* @Class SchoolSearch
* @date 2011/8/11
* @author bobotieyang
*/
;(function($,MYSOHU,window,document,undefined){

if ($.SchoolSearch || MYSOHU.SchoolSearch) {
	return;
}

var replaceCJK = /[\u2E80-\u9FFF\uF92C-\uFFE5]/g,
	testCJK    = /[\u2E80-\u9FFF\uF92C-\uFFE5]/;

var utils = {
	cjkLength: function(strValue){
		return strValue.replace(replaceCJK, "lv").length;
	},
	isCjk: function(strValue){
		return testCJK.test(strValue);
	},
	cutString: function(str,len,suffix,slen){
		suffix = suffix || '';
		slen = slen || suffix.length;
		if(str.length > len){
			str = str.substr(0,len - slen) + suffix;
		}
		return str;
	},
	cutCjkString: function(str,len,suffix,slen){
		suffix = suffix || '';
		slen = slen || suffix.length;
		len -= slen;
		if(this.cjkLength(str) <= len){
			return str;
		}
		var s = str.split(''),c = 0,tmpA = [];
		for(var i=0;i<s.length;i+=1){
			if(c < len){
				tmpA[tmpA.length] = s[i];
			}
			if(this.isCjk(s[i])){
				c += 2;
			}else{
				c += 1;
			}
		}
		return tmpA.join('') + suffix;
	},
	isUndefined: function(value){
		return typeof value == 'undefined';
	}
};

//创建select项
function buildSelect($select,data,value){
	var option,select = $select[0];
	if(!value){
		value = ($select.attr('data-default-value') ? $select.attr('data-default-value') : '');
		$select.attr('data-default-value','');
	}
	select.options.length = 1;
	for(var id in data){
		var option = document.createElement('option');
		option.text = data[id];
		option.value = id;
		if(id == value){
			option.selected = 'selected';
		}
		select.options.add(option);
	}
}



var instanceId = 0;
var area = MYSOHU.area;
var SchoolSearchInstances = [];//存储页面上创建的所有学校弹框
var ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

//ie6下垂直水平居中
function ie6Fixed($o,left,top,st){
	$o[0].style.cssText = 'left:'+left+'px;top:'+(top+st)+'px;top:expression(documentElement.scrollTop + ' + top + ' + "px");';
}

var ua = navigator.userAgent.toLowerCase(),
	isMac = /macintosh/i.test(ua),
	isMacSafari = isMac && /webkit/.test(ua) && !/chrome/.test(ua);

//在mac机的flash需要隐藏，否则弹框出来后，拖动带滚动条的div的滚动条，会让浮层的z-index失效
function flashAddClass(){
	if(isMacSafari) $('object,embed,div.assistant-wrapper').addClass('school-name-search-flash');
}

function flashremoveClass(){
	if(isMacSafari) $('object,embed,div.assistant-wrapper').removeClass('school-name-search-flash');
}
//学校选择
var SchoolSearch = function(options){
	SchoolSearchInstances[SchoolSearchInstances.length] = this;
	var defaults = {
		appendTo: 'body',
		type: 6,
		maskOpacity: 0.6,
		onSelected: function(sName,sId){}
	};
	this.options = $.extend(defaults,options || {});
	this.varname = 'school_popup_' + parseInt(Math.random() * 100000000);
	this.init();
}
SchoolSearch.destroyAll = function(){
	for(var i=0;i<SchoolSearchInstances.length;i+=1){
		SchoolSearchInstances[i].destroy;
	}
	SchoolSearchInstances = [];
}
SchoolSearch.prototype = {
	init: function(){
		var self = this;
		this.container = $('<div class="school-name-search"></div>');
		var html = '<div class="school-name-search-con">';
		html += '<div class="school-name-search-title">';
		html += '<span class="school-name-search-close school-icon"><span title="关闭" class="school-icon-close"><a href="#">关闭</a></span></span>学校名称搜索';
		html += '</div>';
		html += '<div class="school-name-search-con-box">';
		html += '<div class="school-form">';
		html += '<div class="form-item clearfix">';
		html += '<div class="form-item-title">快速搜索：</div>';
		html += '<div class="form-item-con">';
		html += '<input type="text" value="" class="school-input w185 sp-search"><span class="school-input-clew" style="display:none;"><em>请输入并点选您要找的学校信息</em></span>';
		html += '</div>';
		html += '</div>';
		html += '<div class="form-item clearfix">';
		html += '<div class="form-item-title">学校所在地：</div>';
		html += '<div class="form-item-con sp-selects">';
		html += '<select class="school-select w82 sp-province"><option value="0">选择省份</option></select><select class="school-select w82 sp-city"><option value="0">选择城市</option></select>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '<div class="hr-line"></div>';
		html += '<div class="school-name-search-letter-sort clearfix">';
		html += '<ul>';
		html += '</ul>';
		html += '</div>';
		html += '<div class="school-name-list"><ul></ul></div>';
		html += '<div class="search-clew">';
		html += '<a target="_blank" href="http://q.sohu.com/forum/21/topic/1504090">没有您所在的学校？</a>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		this.container.html(html).appendTo($(this.options.appendTo));
		this.container.click(function(event){
			var $target = $(event.target);
			if($target.closest('.school-icon-close').length){
				event.preventDefault();
				self.hide();
			}else if($target.closest('[data-schoolid]').length){
				event.preventDefault();
				$target = $target.closest('[data-schoolid]');
				self.options.onSelected($target.attr('title'),$target.attr('data-schoolid'));
				self.hide();
			}else if($target.closest('[data-letter]').length){
				event.preventDefault();
				$target = $target.closest('[data-letter]');
				self.loadByLetter($target,$target.attr('data-letter'));
			}
		});
		this.notFound = $('<div class="school-suggest-clew" style="position:absolute;z-index:1">请检查输入是否正确或为全称，<br>或者联系我们<a target="_blank" href="http://q.sohu.com/forum/21/topic/1504090">添加此学校</a></div>').appendTo(this.container);
		

		this.container.find('input.sp-search')
			.focus(function(){
				$(this).next().show();
			})
			.blur(function(){
				$(this).next().hide();
			})
			.ajaxSuggest({
				appendTo: 'div.school-name-search',
				autoSelectFirst: true,
				useCache: false,
				resultsClass: 'school-suggest-result',
				selectClass: 'school-suggest-result-select',
				url: 'http://i.sohu.com/a/profile/service/school_suggestion.htm?cb=?',
				dataType: 'jsonp',
				paramName: 'sugg',
				extraParams: function() {
					var $pSel = self.container.find('.sp-province');
					var $cSel = self.container.find('.sp-city');
					var param = {
						_input_encode: 'UTF-8',
						stype: self.options.type,
						provid: $pSel.val()
					};
					if(self.options.type == '6'){
						param.cityid = 0;
					}else{
						param.cityid = $cSel.val();
					}
					return param;
				},
				funPosition: function($input,$results){
					var offset = $input.offset();
					var parentOffset = $results.offsetParent().offset();
					$results.css({
						top: offset.top + $input.outerHeight() - parentOffset.top - 1,
						left: offset.left - parentOffset.left - 1
					});
				},
				funFormatResults: function(data){
					var ary,results = [];
					if(data.status == 0){
						if($.isArray(data.data)){
							ary = data.data;
							for(var i=0;i<ary.length;i+=1){
								results[results.length] = {
									data: ary[i][0],
									value: ary[i][1]
								};
							}
						}
					}
					if(results.length == 0){
						self.showNotFound();
					}else{
						self.hideNotFound();
					}
					return results;
				},
				funFormatItem: function(value,data,lastValue){
					lastValue = $.trim(lastValue);
					value = utils.cutCjkString(value,28,'...',2);
					if(lastValue == ''){
						return value;
					}
					var reg = new RegExp('('+lastValue+')','ig');
					return value.replace(reg,'<strong>$1</strong>');
				},
				onItemSelect: function(data){
					self.options.onSelected(data.value,data.data);
					setTimeout(function(){
						self.hide()
					},0);
				},
				onFinished: function(){
					if(self.container.find('input.sp-search').val() == ''){
						self.hideNotFound();
					}
				}
			});
		
		this.initLetterSearch();
		this.initArea();
		this.initShadow();
		this.hide();
		$(window).resize(function(){
			if(self.isVisible()){
				self.adjust();
			}
		});
	},
	initShadow: function(){
		this.$mask = $('<div class="school-name-search-mask"></div>');
		this.$mask.css('opacity',this.options.maskOpacity).insertBefore(this.container).hide();

		if(ieBug){
			this.$iframe = $('<iframe frameborder="0" tabindex="-1" src="about:blank" style="display:block;cursor:default;opacity:0;filter:alpha(opacity=0);"></iframe>')
			.appendTo(this.$mask);
		}
	},
	initLetterSearch: function(){
		var $ul = this.container.find('.school-name-search-letter-sort > ul');
		for(var i=65 ;i <= 90 ;i+=1){
			$ul.append('<li><a href="#" data-letter="'+String.fromCharCode(i)+'">'+String.fromCharCode(i)+'</a></li>')
		}
	},
	initArea: function(){
		var self = this;
		var $pSel = this.container.find('.sp-province');
		var $cSel = this.container.find('.sp-city');
		buildSelect($pSel,area.province);
		$pSel.change(function(){
			buildSelect($cSel,area.city[$pSel.val()]);
			var param = {
				provid: $pSel.val()
			};
			self.load(param);
		});
		$cSel.change(function(){
			var param = {
				provid: $pSel.val(),
				cityid: $cSel.val()
			};
			self.load(param);
		});
	},
	show: function(options){
		var self = this;
		var $pSel = this.container.find('.sp-province');
		var $cSel = this.container.find('.sp-city');
		this.options = $.extend(this.options,options || {});
		var param = {};
		param.stype = this.options.type;
		if(this.options.type == '6'){
			$cSel.hide();
			$pSel[0].selectedIndex = 1;
			param.provid = $pSel.val();
		}else{
			$cSel.show();
			$pSel[0].selectedIndex = 1;
			$pSel.change();
			$cSel[0].selectedIndex = 1;
			param.provid = $pSel.val();
			param.cityid = $cSel.val();
		}
		this.container.find('input.sp-search').val('');
		this.container.show();
		this.notFound.hide();
		this.adjust(this.options.at);
		this.load(param);
		flashAddClass();
	},
	hide: function(){
		this.container.hide();
		this.$mask.hide();
		flashremoveClass();
	},
	adjust: function(at){
		var winWidth = $(window).width(),
			winHeight = $(window).height(),
			winStop = $(document).scrollTop(),
			winSleft = $(document).scrollLeft(),
			htmlHeight = $(document).height(),
			thisWidth = this.container.width(),
			thisHeight = this.container.height(),
			left = (winWidth - thisWidth)/2,
			top = (winHeight - thisHeight)/2;

		if(ieBug){
			ie6Fixed(this.container,left > 0 ? left : 0,top > 0 ? top : 0,winStop);
			
		}else{
			this.container.css({
				'left': left > 0 ? left : 0,
				'top': top > 0 ? top : 0
			});
		}
		this.$mask.css({
			'opacity': this.options.maskOpacity,
			width: winWidth,
			height: winHeight
		}).show();
		if(this.$iframe){
			this.$iframe.css({
				width: winWidth,
				height: winHeight
			});
		}
	},
	clearLetterHighlight: function(){
		this.container.find('.school-name-search-letter-sort a').removeClass('now');
	},
	loadByLetter: function($o,letter){
		var $pSel = this.container.find('.sp-province');
		var $cSel = this.container.find('.sp-city');
		var param = {
			qindex: letter,
			provid: $pSel.val(),
			cityid: $cSel.val()
		};
		this.load(param,'/a/profile/service/school_qindex.htm');
		$o.addClass('now');
	},
	load: function(param,url){
		var varname = this.varname,self = this;
		url = url || '/a/profile/service/school_select.htm';
		param.stype = this.options.type;
		$.getJSON(url,param,function(results){
			if(results.status == '0'){
				self.build(results.data);
			}
		});
		this.clearLetterHighlight();
	},
	build: function(data){
		var $ul = this.container.find('.school-name-list > ul');
		$ul.empty();
		if($.isArray(data)){
			for(var i=0,len=data.length;i<len;i+=1){
				$ul.append('<li><a href="#" data-schoolid="'+data[i][0]+'" title="'+data[i][1]+'">'+utils.cutCjkString(data[i][1],20,'...',2)+'</a></li>');
			}
		}
	},
	destroy: function(){
		this.container.remove();
		if(this.iframe){
			this.iframe.remove();
		}
	},
	showNotFound: function(){
		this.notFound.show();
		var $input = this.container.find('input.sp-search');
		var offset = $input.offset();
		var parentOffset = this.notFound.offsetParent().offset();
		this.notFound.css({
			zIndex:1,
			width: 181,
			top: offset.top + $input.outerHeight() - parentOffset.top - 1,
			left: offset.left - parentOffset.left - 1
		});
		if(ieBug){
			this.container.find('.sp-selects').hide();
		}
	},
	hideNotFound: function(){
		this.notFound.hide();
		if(ieBug){
			this.container.find('.sp-selects').show();
		}
	},
	isVisible: function(){
		return this.container.is(':visible');
	}
	
};

MYSOHU.SchoolSearch = SchoolSearch;

SchoolSearch.getInstance = function(){
	SchoolSearchInstances.length || new SchoolSearch().init();
	return SchoolSearchInstances[0];
};

})(jQuery,MYSOHU,window,document);