/*
 *	档案 头像页Flash回调
 *  @author bobotieyang@sohu-inc.com
 */
;(function($,window,sohu){
	var options,
		popover,
		fired = false,
		refer;
	function deferred(){
		if(!sohu.guid){
			setTimeout(deferred,10);
		}else{
			sohu.guid.exec(function(id){
				if(id == 1){//id为字符串类型
					refer = $('#avatar');
					
					options = {
						css: {
				            height:'19px'
						},
						fix: {
							left: 110,
							top: -6
						},
						text: '点击这里，选择一张图片上传为头像吧！',
						refer: refer
					};
					//上传头像按钮旁边，显示上传提示信息
					popover = new sohu.guid.Popover(options);
				}
			});
		}
	};
	deferred();
	

	sohu.iAvatarCallback = function(action,value){
		if(action == 'saveok'){
			if(popover) popover.close();//关闭上传按钮旁边的tooltips
			
			//保存成功
			$.inform({
				icon: 'icon-success',
				delay: 3000,
				easyClose: true,
				content: "保存成功，审核完毕之后头像将会更新！",
				onClose: function(){
					window.location.href = 'http://i.sohu.com/profile/home/swfUploadIcon.htm';
				}
			});
		}
		else if(action == 'error'){
			$.inform({
				icon: 'icon-error',
				delay: 3000,
				easyClose: true,
				content: value || '保存修改信息失败'
			});
		}
		else if(action == 'action'){
			if(value == 1){
				//点击了上传按钮
				if(popover) popover.close();//关闭上传按钮旁边的tooltips
			}
			else if(value == 2){
				//图片加载成功
				if(sohu.guid){
					sohu.guid.exec(function(id){
						if(!refer)
							refer = $('#avatar');
						if(id == 1 && !fired){//id为字符串类型
							options = {
								css: {
						            height:'55px',
						            width:'160px'
								},
								fix: {
									left: 253,
									top: 285
								},
								text: '移动图片上的白色线框调整位置，滑动下方按钮改变图片大小。试试看吧！',
								refer: refer
							};
							popover = new sohu.guid.Popover(options);
							//显示一次之后不再显示
							fired = true;
						}
					});
				}
			}
		}
	};
})(jQuery,window,mysohu);