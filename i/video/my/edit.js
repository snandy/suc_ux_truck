/*
 *	视频
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var ns = '.video'

var project = {
	init: function($form){
		var self = this;
		this.$form = $form;
		this.$name = $form.find('[name=title]');
		this.$tag = $form.find('[name=tag]');
		this.$type = $form.find('.drop-menu');
		this.$popBox = $form.find('.pop-box');
		this.$typeHidden = $form.find('[name=categoriesId]');
		this.$catecode = $form.find('[name=catecode]');
		this.$imgHidden = $form.find('[name=cover]');
		this.$desc = $form.find('[name=introduction]');

		this.$focuson = null;
			
		$form.submit(function(){
			if(self.check()){
				$.post($form.attr('action'),$form.serialize(),function(results){
					if(results.status == 1){
						$.inform({
							icon: 'icon-success',
							delay: 1000,
							easyClose: true,
							content: "修改成功",
							onClose: function(){
								window.location.href = '/video/home/list.htm';
							}
						});
					}
				},'json');
				
			}else{
				self.$focuson.focus();
			}
			return false;
		
		});
		
		
		$form.click(function(event){
			var $target = $(event.target);
			//切换选择类型
			if($target.closest('.drop-menu').length){
				self.$popBox.toggle();
			}
			//选择类型
			else if($target.closest('[data-value]').length){
				$target = $target.closest('[data-value]');
				self.setType($target.text(),$target.attr('data-value'));
			}
			//选择封面
			else if($target.closest('.front-cover li').length){
				$target = $target.closest('.front-cover li');
				self.$imgHidden.val($target.find('img').attr('src'));
				$form.find('.front-cover li').removeClass('active');
				$target.addClass('active');
			}
			//取消按钮
			else if($target.closest('[name=reset]').length){
				window.location.href = '/video/home/list.htm';
			}
		});


		
		this.$type.parent().height(27);//修正弹出层出来时造成的高度变化
		
		ms.VideoApp.getCateInfo(function(cateList){
			
			self.$popBox.html(self.initCategory(cateList));//初始化类型

			self.setType('',self.$catecode.val() || self.$typeHidden.val());
		});
		
		

		$(document).click(function(event){
			if(!$(event.target).closest('.drop-menu').length){
				self.$popBox.hide();
			}
		});
	},
	check: function(){
		var re = true;
		this.$focuson = null;
		//标题
		this.$name.val($.trim(this.$name.val()));
		var nlen = ms.VideoApp.utils.cjkLength(this.$name.val());
		if(nlen == 0){
			this.showError(this.$name,'标题不能为空');
			re = false;
		}else if(nlen > 60){
			this.showError(this.$name,'标题超出字数限制，标题长度最大为30个字');
			re = false;
		}else{
			this.showTip(this.$name,'标题长度最大为30个字');
		}
		//标签
		this.$tag.val($.trim(this.$tag.val()));
		var tags = this.$tag.val().split(/\s+/);
		tags = $.grep(tags,function(n,i){
			return $.trim(n) != '';
		});
		if(this.$tag.val() == ''){
			this.showError(this.$tag,'请填写标签');
			re = false;
		}else if(tags.length > 5){
			this.showError(this.$tag,'标签个数不能超过5个');
			re = false;
		}else{
			this.showTip(this.$tag,'标签用空格隔开，如"音乐 搜狐"');
			//标签每个最多20个字符
			for(var i=0;i<tags.length;i+=1){
				if(ms.VideoApp.utils.cjkLength(tags[i]) > 20){
					this.showError(this.$tag,'单个标签长度不能超过20个字符');
					re = false;
					break;
				}
			}
		}
		//简介
		this.$desc.val($.trim(this.$desc.val()));
		var dlen = ms.VideoApp.utils.cjkLength(this.$desc.val());
		if(dlen == 0){
			this.showError(this.$desc,'请填写简介');
			re = false;
		}else if(dlen > 1000){
			this.showError(this.$desc,'简介长度不能超过1000个字符');
			re = false;
		}else{
			this.hideError(this.$desc);
		}





		//this.showError($desc,'text');
		return re;

	},
	showError: function($o,text){
		if(!$o.next().length){
			$('<span class="tip"></span>').insertAfter($o);
		}
		$o.next().addClass('video-err-tip').html(text);
		if(!this.$focuson){
			this.$focuson = $o;
		}
	},
	showTip: function($o,text){
		$o.next().removeClass('video-err-tip').html(text);
	},
	hideError: function($o){
		$o.next().hide();
	},
	initCategory: function(cateList){
		var html = '<p>';
		for(var i=0;i<cateList.length;i+=1){
			if(cateList[i].attr != 'normal' || cateList[i].upload == 1) continue;
			html += '<a href="javascript:void(0)" data-value="'+cateList[i].id+'">'+cateList[i].title+'</a>';
		}
		html += '</p>';
		return html;
	},
	setType: function(n,v){
		this.$catecode.val(v);
		this.$typeHidden.val(v);
		if(n != ''){
			this.$type.html(n);
		}
		this.$popBox.find('a').removeClass('active').end().find('[data-value="'+v+'"]').addClass('active').end().hide();
	}
};


$(function(){
	
	project.init($('#videoEditForm'));


});

})(jQuery,MYSOHU);