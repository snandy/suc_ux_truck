/*
* ajaxSuggest
* @date 2011/3/26
* @author bobotieyang
*/
;(function($){

if ($.fn.ajaxSuggest) {
	return;
}


var requestId = 0;

var ieBug = $.browser.msie && parseFloat($.browser.version) < 7;
var defaults = {
	appendTo: 'body',
	delay: 500,//延迟多久请求
	useCache: true,//是否缓存数据
	autoSelectFirst: false,//自动选择第一项
	maxCacheLength: 10,//缓存的最大关键词数
	minChars: 1,//最小字符数
	maxItems: -1,//列表一次显示的项目数，超出的显示滚动条
	width: -1,//提示区域的宽度，-1表示自动适应文本框的
	url: '',//接口地址
	type: 'get',//请求方式get,post
	dataType: 'jsonp',//数据格式json,jsonp
	paramName: 'p',//默认参数
	extraParams: {},//额外的参数，可以传入一个函数，函数返回一个对象
	onItemSelect: null,//当选择了某项
	onFinished: null,//隐藏提示框后执行
	funFormatResults: null,//格式化返回的数据，合法的数据格式  [{data:'',value:''},{data:'',value:''}] 格式化后的数据会被存储在LI的data属性里
	funFormatItem: null,//用来格式化每个LI的显示内容，参数：value, data 返回 String
	funPosition: null,//用来自定义定位
	resultsClass: 'suggest-result',
	selectClass: 'suggest-result-select'
};



var suggest = function(input,options){

	/**
	 * Cached data
	 * @type Object
	 * @private
	 */
	this.cacheData_ = {};

	/**
	 * Number of cached data items
	 * @type number
	 * @private
	 */
	this.cacheLength_ = 0;

	/**
	 * Class name to mark selected item
	 * @type string
	 * @private
	 */
	this.selectClass_ = 'jquery-suggest-selected-item';

	/**
	 * Handler to activation timeout
	 * @type ?number
	 * @private
	 */
	this.keyTimeout_ = null;

	/**
	 * Last value processed by the autocompleter
	 * @type ?string
	 * @private
	 */
	this.lastProcessedValue_ = null;

	/**
	 * Last value selected by the user
	 * @type ?string
	 * @private
	 */
	this.lastSelectedValue_ = null;

	/**
	 * Is this autocompleter active?
	 * @type boolean
	 * @private
	 */
	this.active_ = false;

	/**
	 * Is it OK to finish on blur?
	 * @type boolean
	 * @private
	 */
	this.finishOnBlur_ = true;

	/**
	 * 按下Esc Tab Enter键时阻止keyup激活提示
	 * @type ?number
	 * @private
	 */
	this.preventActive_ = false;

	/**
	 * 针对Opera的中文输入补丁,该bug暂不处理
	 * @type boolean
	 * @private
	 */
	this.intervalId_ = null;
	
	
	this.options = options;

	/**
	 * Init DOM elements repository
	 */
	this.dom = {};

	/**
	 * Store the input element we're attached to in the repository, add class
	 */
	this.dom.$elem = $(input);
	
	/**
	 * Create DOM element to hold results
	 */
	this.dom.$results = $('<div></div>').hide();
	if (this.options.resultsClass) {
		this.dom.$results.addClass(this.options.resultsClass);
	};
	this.dom.$results.css({
		position: 'absolute'
	});
	
	$(this.options.appendTo).append(this.dom.$results);
	

	if(ieBug){
		this.dom.$iframe = $('<iframe frameborder="0" tabindex="-1" src="about:blank" style="position:absolute;z-index:'+this.dom.$results.css('z-index')+';display:block;cursor:default;opacity:0;filter:alpha(opacity=0);"></iframe>')
		.insertBefore(this.dom.$results)	
		.hide();
	}
	
	var self = this;

	function onEsc(e){
		e.preventDefault();
		self.preventActive_ = true;
		self.dom.$elem.val(self.lastProcessedValue_);
		self.finish();
		return false;
	}
	
	var _eventName_ = (function(){
		var evtname = '';
		if($.browser.msie){
			if(parseInt($.browser.version,10) > 8){
				evtname = 'input.ajaxsuggest keyup.ajaxsuggest';
			}else{
				evtname = 'propertychange.ajaxsuggest';
			}
		}else{
			evtname = 'input.ajaxsuggest';
		}
		return evtname;
	})();

	this.dom.$elem
	.attr('autocomplete','off')
	.keyup(function(e) {
		switch(e.keyCode) {

			case 38: // up
				e.preventDefault();
				if (self.active_) {
					self.focusPrev();
				} else {
					//self.activate();
				}
				return false;
			break;

			case 40: // down
				e.preventDefault();
				if (self.active_) {
					self.focusNext();
				} else {
					//self.activate();
				}
				return false;
			break;

			case 9: // tab
			case 13: // return
				if (self.active_ && self.hasSelected()) {
					e.preventDefault();
					self.preventActive_ = true;
					self.selectCurrent();
					return false;
				}
			break;
			
			/*
			遨游3的兼容模式keydown不会触发ESC
			*/
			case 27: // escape
				if (self.active_) {
					return onEsc(e);
				}
			break;

			default:
				//self.activate();

		}
	})
	/*
	.keypress(function(e){
		
		
		//遨游3的兼容模式keypress可以正常执行esc
		
		if(e.keyCode == 27 && self.active_){
			return onEsc(e);
		}
		//ie6下keypress才能触发enter
		else if(e.keyCode == 13 && self.active_ && self.hasSelected()){
			e.preventDefault();
			self.preventActive_ = true;
			self.selectCurrent();
		}
	})
	*/
	.blur(function() {
		if (self.finishOnBlur_) {
			setTimeout(function() { self.finish(); }, 200);
		}
	})
	.bind(_eventName_,function(){
		if(self.dom.$elem.val() == ''){
			self.finish();
		}else{
			self.activate();
			
		}
	});
};

suggest.prototype = {
	position: function(){
		var offset = this.dom.$elem.offset();
		var parentOffset = this.dom.$results.offsetParent().offset();
		this.dom.$results.css({
			top: offset.top + this.dom.$elem.outerHeight() - parentOffset.top,
			left: offset.left - parentOffset.left
		});
	},

	activate: function() {
	    var self = this;
	    var activateNow = function() {
	        self.activateNow();
	    };
		var delay = parseInt(this.options.delay, 10);
		if (isNaN(delay) || delay <= 0) {
			delay = 250;
		}
		if (this.keyTimeout_) {
			clearTimeout(this.keyTimeout_);
		}
		this.keyTimeout_ = setTimeout(activateNow, delay);
		

	},

	activateNow: function() {
		var value = this.dom.$elem.val();
		
		if (value !== this.lastProcessedValue_ && value !== this.lastSelectedValue_) {
			if (value.length >= this.options.minChars) {
				this.active_ = true;
				this.lastProcessedValue_ = value;
				this.fetchData(value);
				
			}
		}
	},

	cacheRead: function(filter) {
		var filterLength, searchLength, search, maxPos, pos;
		if (this.options.useCache) {
			filter = String(filter);
			if(this.cacheData_[filter]){
				return this.cacheData_[filter];
			}
		}
		return false;
    },

	cacheWrite: function(filter, data) {
		if (this.options.useCache) {
			if (this.cacheLength_ >= this.options.maxCacheLength) {
				this.cacheFlush();
			}
			filter = String(filter);
			if (!this.cacheData_[filter]) {
				this.cacheLength_++;
			}
			return this.cacheData_[filter] = data;
		}
		return false;
    },

	cacheFlush: function() {
	    this.cacheData_ = {};
	    this.cacheLength_ = 0;
		
    },

	fetchData: function(value) {
		var self = this;
		var localData = this.cacheRead(value);
		if(localData){
			this.showResults(localData);
			
		}else{
			var paramName = self.options.paramName;
			var extraParams = self.options.extraParams;
			if($.isFunction(self.options.extraParams)){
				extraParams = self.options.extraParams();
			}
			var param = $.extend({},extraParams);
			param[paramName] = value;
			
			$.ajax({
				url: self.options.url,
				type: self.options.type,
				dataType: self.options.dataType,
				data: param,
				ajaxRequestId: ++requestId,
				success: function(data){
					if(!this.ajaxRequestId == requestId){
						return false;
					};
					if($.isFunction(self.options.funFormatResults)){
						data = self.options.funFormatResults(data);
					}
					self.cacheWrite(value, data);
					self.showResults(data);
					
				}
			});
		}
	},

	showResults: function(results) {
		if(results.length == 0){
			this.finish();
			return;
		}
	    var self = this;
		var $ul = $('<ul></ul>');
		var i, result, $li, extraWidth, first = false, $first = false;
		var numResults = results.length;
		for (i = 0; i < numResults; i++) {
			result = results[i];
			$li = $('<li title="'+ result.value +'" style="cursor:pointer">' + this.showResult(result.value, result.data) + '</li>');
			$li.data('value', result.value);
			$li.data('data', result.data);
			$li.click(function() {
				var $this = $(this);
				self.selectItem($this);
			}).mousedown(function() {
				self.finishOnBlur_ = false;
			}).mouseup(function() {
				self.finishOnBlur_ = true;
			});
			$ul.append($li);
			if(i == 0 && this.options.autoSelectFirst){
				$li.addClass(this.selectClass_).addClass(this.options.selectClass);
			}
		}

		// Alway recalculate position before showing since window size or
		// input element location may have changed. This fixes #14
		
		this.dom.$results.html($ul).show();
		
		if($.isFunction(this.options.funPosition)){
			this.options.funPosition(this.dom.$elem,this.dom.$results);
		}else{
			this.position();
		}
		
		if(this.options.width == 'auto'){
			this.dom.$results.css('width', 'auto');
		}else if(this.options.width > 0){
			this.dom.$results.width(this.options.width);
		}else{
			extraWidth = this.dom.$results.outerWidth() - this.dom.$results.width();
			this.dom.$results.width(this.dom.$elem.outerWidth() - extraWidth);
		}
		
		if(this.dom.$iframe){
			this.dom.$iframe.css({
				top: this.dom.$results.css('top'),
				left: this.dom.$results.css('left'),
				width: this.dom.$results.css('width'),
				height: this.dom.$results.css('height')
			}).show();
		}
		
		//根据maxItems来设置ul的高度和滚动条
		if(this.options.maxItems >= 5 && numResults > this.options.maxItems){
			$ul.css({
				'overflow': 'hidden',
				'overflow-y': 'scroll'
			});
			$ul.height(this.options.maxItems * $li.innerHeight()).scrollTop(0);
			$ul.mousedown(function(e){
				if(e.target === this){
					
					self.finishOnBlur_ = false;
					setTimeout(function() {
						$(document).one('mousedown',function(e){
							
							if(e.target !== self.dom.$elem[0] && e.target !== self.dom.$results[0] && !$.contains(self.dom.$results[0],e.target)){
								self.finishOnBlur_ = true;
								self.finish();
							}else if(e.target === self.dom.$elem[0]){
								self.finishOnBlur_ = true;
							}
						});
					}, 1 );
				}
			});
		}

		$('li', this.dom.$results).hover(
			function() { self.focusItem(this); },
			function() { /* void */ }
		);

	},
	
	showResult: function(value, data) {
		if ($.isFunction(this.options.funFormatItem)) {
			return this.options.funFormatItem(value, data,this.lastProcessedValue_);
		} else {
			return value;
		}
	},

	selectItem: function($li) {
		var value = $li.data('value');
		var data = $li.data('data');
		var displayValue = value;
		this.lastProcessedValue_ = displayValue;
		this.lastSelectedValue_ = displayValue;
		this.dom.$elem.val(displayValue).focus();
		this.setCaret(displayValue.length);
		this.callHook('onItemSelect', { value: value, data: data });
		this.finish();
	},

	focusItem: function(item) {
		var $item, $items = $('li', this.dom.$results);
		if ($items.length) {
			$items.removeClass(this.selectClass_).removeClass(this.options.selectClass);
			if (typeof item === 'number') {
				item = parseInt(item, 10);
				
				if (item < 0 || item >= $items.length) {
					this.dom.$elem.val(this.lastProcessedValue_);
				}else{
					$item = $items.eq(item);
					var displayValue = $item.data('value');
					this.lastSelectedValue_ = displayValue;
					this.dom.$elem.val(displayValue);
				}
				this.setCaret(this.dom.$elem.val().length);
				
				if(this.hasScroll() && $item){
					this.setScroll($item);
				}
			} else {
				$item = $(item);
			}
			if ($item) {
				$item.addClass(this.selectClass_).addClass(this.options.selectClass);
			}
		}
	},

	finish: function() {
		if (this.keyTimeout_) {
			clearTimeout(this.keyTimeout_);
		}
		
		this.dom.$results.hide();

		if(this.dom.$iframe){
			this.dom.$iframe.hide();
		}

		this.lastProcessedValue_ = null;
		
		this.active_ = false;

		if($.isFunction(this.options.onFinished)){
			this.options.onFinished();
		}
	},

	focusPrev: function() {
		this.focusMove(-1);
	},
	
	focusNext: function() {
		this.focusMove(+1);
	},

	focusMove: function(modifier) {
		var i, $items = $('li', this.dom.$results);
		modifier = parseInt(modifier, 10);
		for (var i = 0; i < $items.length; i++) {
			var $item = $items.eq(i);
			if ($item.hasClass(this.selectClass_)) {
				this.focusItem(i + modifier);
				return;
			}
		}
		if(modifier > 0){
			this.focusItem(0);
		}else{
			this.focusItem($items.length - 1);
		}
	},

	hasScroll: function() {
		var $ul= this.dom.$results.find('> ul').eq(0);
		
		return $ul.height() < $ul.attr("scrollHeight");
	},

	setScroll: function($item){
		var $ul= this.dom.$results.find('> ul').eq(0);
		var offset = $item.offset().top - this.dom.$results.offset().top,
			scroll = $ul.attr("scrollTop"),
			elementHeight = $ul.height();
		if (offset < 0) {
			$ul.attr("scrollTop", scroll + offset);
		} else if (offset >= elementHeight) {
			$ul.attr("scrollTop", scroll + offset - elementHeight + $item.innerHeight());
		}
		
	},
	
	selectCurrent: function() {
		var $item = $('li.' + this.selectClass_, this.dom.$results);
		if ($item.length == 1) {
			this.selectItem($item);
		} else {
			this.finish();
		}
	},
	
	hasSelected: function(){
		return $('li.' + this.selectClass_, this.dom.$results).length > 0;
	},

	callHook: function(hook, data) {
		var f = this.options[hook];
		if (f && $.isFunction(f)) {
			return f(data, this);
		}
		return false;
	},

	setCaret: function(pos) {
		this.selectRange(pos, pos);
	},

	selectRange: function(start, end) {
		var input = this.dom.$elem.get(0);
		if (input.setSelectionRange) {
			input.focus();
			input.setSelectionRange(start, end);
		} else if (this.createTextRange) {
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', end);
			range.moveStart('character', start);
			range.select();
		}
	}
	



};


$.fn.ajaxSuggest = function(options) {
	var o = $.extend({}, defaults, options || {});
	return this.each(function() {
		new suggest(this, o);
	});
	

};


})(jQuery);