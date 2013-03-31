require(
'plugins::Template',
function(T) {
	define(
	'i::myapplication::template',
	T({
		"favorites" : '{{#}}<li data-id="{{{id}}}"><div class="popup right"><a href="javascript:;"><i class="icon-downward"></i></a></div><div class="popup bottom"><span class="roundness"><i class="icon-gyrate"></i></span></div><div class="photo"><a class="img" a href="{{{url}}}" target="_blank" title="{{name}}"><img src="{{{iconMax}}}" /></a></div><div class="con"><a href="{{{url}}}" target="_blank" title="{{name}}">{{filtered_name}}</a></div></li>{{/}}',
		"dlg" : '<div class="dialog-myapplication-form-box"><ul><li class="rows clearfix"><span class="title"><span class="red">*</span>网址:</span><span class="form-box"><input type="text" class="form-input" maxlength="40"></span></li><li class="rows clearfix"><span class="title"><span class="red">*</span>名称:</span><span class="form-box"><input type="text" class="form-input" maxlength="40"></span></li><li class="rows clearfix"><span class="title">自定义图标:</span><div class="images-box"><ul class="rtbar-com">{{#}}<li {{@0}}class="active"{{/0}}><a href="javascript:;"><img src="http://s3.suc.itc.cn/i/shared/icon_{{{}}}_48.jpg" /></a></li>{{/}}</ul></div></li></ul></div>',
		"myapp_addr" : '<li data-url="{{url}}" data-name="{{name}}" data-icon="{{{iconMax}}}" data-id="{{{id}}}"><div class="popup right"><a href="javascript:;"><i class="icon-upward"></i></a><a href="javascript:;"><i class="icon-close"></i></a></div><div class="photo"><a target="_blank" href="{{url}}" class="img"><img src="{{{iconMax}}}"></a></div><div class="con"><a target="_blank" href="{{url}}" title="{{name}}">{{name}}</a></div></li>',
		"left_addr" : '{{#}}<li><div class="photo"><a href="{{url}}" target="_blank" title="{{name}}"><img src="{{iconMin}}"></a></div><p><a href="{{url}}" target="_blank" title="{{name}}">{{filtered_name}}</a></p></li>{{/}}',
		"left_more" : '<li class="i-add"><div class="popup popup-fixed"><div class="myapplication-popup"><div class="triangle triangle-left"><q>◇</q><q class="k2">◆</q><q class="k3">◆</q></div><div class="side"><div><a target="_blank" href="http://app.i.sohu.com/"><i class="add-myapp"></i>添加应用</a></div><div class="split-lines"></div><div><a href="javascript:;" class="i-addurl"><i class="add-myadrs"></i>添加网址</a></div></div></div></div><div class="photo"><a href="javascript:void(0);"></a></div><div class="con"><a href="javascript:void(0);">添加更多</a></div></li>'
	}));
});
