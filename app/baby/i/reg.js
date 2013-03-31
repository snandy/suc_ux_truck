/*
 *	babyapp-reg 选择阶段
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var reg = {
	tip: function($o,text){
		if(!$o.length) return;
		var $td = $o.closest('td');
		$td.find('span.baby-tips').remove();
		$td.append('<span class="baby-tips"><em>'+text+'</em></span>');
	},
	errorTip: function($o,text){
		if(!$o.length) return;
		var $td = $o.closest('td');
		$td.find('span.baby-tips').remove();
		$td.append('<span class="baby-tips baby-tips-err"><em>'+text+'</em></span>');
	},
	clearTip: function($o){
		if(!$o.length) return;
		$o.closest('td').find('span.baby-tips').remove();
	},
	buildSelect: function($select,data,type,value){
		type = type || 'Number';//比较的类型
		value = value ? value : ($select.attr('data-default-value') ? $select.attr('data-default-value') : '');
		$select.attr('data-default-value','');
		var select = $select[0],
			isAry = $.isArray(data);;
		select.options.length = 1;
		if(!data) return;
		$.each(data,function(k,v){
			var option = document.createElement('option');
			option.text = v;
			option.value = isAry ? v : k;
			select.options.add(option);
		});
		
		$select.val(type == 'Number' ? value*1 : value);
	}

};


ms.babyapp.reg = reg;

})(jQuery,mysohu);