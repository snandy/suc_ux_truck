/*
* 系统设置
*
*/
;(function($,ms) {

function onSelectItem(n,v){
	if(v == this.attr('data-privacy-value')){
		return;
	}
	this.attr('data-privacy-value',v);
	this.find('a').html('<i class="global-icon-privacy-12">隐私</i>'+n+'<span class="profile-icon-menu-jt"></span>');
	sendData(this);
}

function sendData($ele){
	var url = '/a/setting/privacy/set',
		option = $ele.attr('data-privacy-option'),
		value = $ele.attr('data-privacy-value');
	$.getJSON(url,{
		'option': option,
		'value': value
	},function(results){
		if(results.code == 0){
			//成功
		}else{
			//失败
			$.alert(results.msg);
		}
	});
}

	
$(function(){

//初始化弹框选项
var privacy = new ms.SystemSetting.PrivacyMenu();

privacy.addMenu('three',[
		{v: 1 , n: '所有人'},
		{v: 3 , n: '仅我跟随的人'},
		{v: 2 , n: '禁止留言'}
]);

privacy.addMenu('two',[
		{v: 1 , n: '所有人'},
		{v: 3 , n: '仅我跟随的人'}
]);

privacy.addMenu('m1',[
		{v: 1 , n: '所有人'},
		{v: 3 , n: '仅跟随我的人'},
		{v: 2 , n: '禁止所有人'}
]);

$('#setting_privacy_messagewrite [data-privacy-option]').click(function(event){
	event.stopPropagation();
	var $this = $(this);
	privacy.show({
		at: $this,
		menu: 'three',
		onSelectItem: function(n,v){
			onSelectItem.call($this,n,v);
		}
	});
});

$('#setting_privacy_messageread [data-privacy-option]').click(function(event){
	event.stopPropagation();
	var $this = $(this);
	privacy.show({
		at: $this,
		menu: 'two',
		onSelectItem: function(n,v){
			onSelectItem.call($this,n,v);
		}
	});
});

$('#setting_privacy_whisperreceive [data-privacy-option]').click(function(event){
	event.stopPropagation();
	var $this = $(this);
	privacy.show({
		at: $this,
		menu: 'two',
		onSelectItem: function(n,v){
			onSelectItem.call($this,n,v);
		}
	});
});

$('#setting_privacy_followRequestReceive [data-privacy-option]').click(function(event){
	event.stopPropagation();
	var $this = $(this);
	privacy.show({
		at: $this,
		menu: 'm1',
		onSelectItem: function(n,v){
			onSelectItem.call($this,n,v);
		}
	});
});

});


})(jQuery,MYSOHU);