/*
* 系统设置
*
*/
;(function($,ms) {


function onSelectItem(n,v){
	if(v == this.attr('data-notify-value')){
		return;
	}
	this.attr('data-notify-value',v);
	this.find('a').html('<i class="global-icon-privacy-12">隐私</i>'+n+'<span class="profile-icon-menu-jt"></span>');
	sendData(this);
}

function sendData($ele){
	var url = '/a/setting/notify/set',
		option = $ele.attr('data-notify-option'),
		value = $ele.attr('data-notify-value');
	$.getJSON(url,{
		'option': option,
		'value': value
	},function(results){
		if(results.code == 0){
			//成功
			$ele.closest('tr').find('.intro').html(results.data.text);
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
		{v: 1 , n: '接收'},
		{v: 3 , n: '仅我跟随的人'},
		{v: 2 , n: '屏蔽'}
]);

$('#setting_notify_sentence,#setting_notify_refer').find('[data-notify-option]').click(function(event){
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


$('.setting-msg-switch-on,.setting-msg-switch-off').filter('[data-notify-option]').click(function(){
	var $this = $(this),
		option = $this.attr('data-notify-option'),
		value = $this.attr('data-notify-value');
	value = value == 1 ? 2 : 1;
	$this.attr('data-notify-value',value);
	if(value == 1){
		$this.removeClass('setting-msg-switch-off').addClass('setting-msg-switch-on');
		$this.find('a').html('<i class="global-icon-privacy-12">隐私</i>接收');
	}else{
		$this.removeClass('setting-msg-switch-on').addClass('setting-msg-switch-off');
		$this.find('a').html('<i class="global-icon-privacy-12">隐私</i>屏蔽');
	}
	sendData($this);
	
});


});

})(jQuery,MYSOHU);