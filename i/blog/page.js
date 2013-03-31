// 标签
(function($){

$.blogtag = function($editor, $autoTag) {
	var defVal, $tag, $input, $editor, tagManager;
	var TAGSLENGTH = 548;
	
	if (!$editor) {
		return;
	}

	$input = $editor.find('input');
	$tag   = $editor.find('.tag-list');
	defVal = '最多可插入5个标签，用空格隔开不同标签';

	$input.val(defVal);
	
	// 计算字符串的长度，汉字按两个字符计算
	function computeLength(str) {
		var r, arr=[], re = /[\u4E00-\u9FA5]/g;
		while ( (r=re.exec(str)) != null ) {
			arr.push(r);
		}
		
		return (str.length-arr.length) + arr.length * 2;
	}
	
	$editor
		.click(function() {
			if ($input.css('display')!=='none') {
				if ($input.val() === defVal) {
					$input.val('');
					$input.css('color', 'black');
				}
				$input[0].focus();
			}
		})
		.delegate('input', 'blur', function() {
			if (this.value === '') {
				this.value = defVal;
				this.style.color = '#666666';
			} else if (this.value != defVal) {
				tagManager.add(this.value);
				this.value = '';
			}
		})
		.delegate('input', 'keydown', function(ev) {
			// 退格键删除
			var keyCode = ev.keyCode,
				val     = this.value;
			
			if (val == defVal) {
				this.value = '';
			}

			if (keyCode === 8 && val === '') {
				tagManager.remove($tag.find('span').last().find('i')[0]);
			}
		})
		.delegate('input', 'keyup', function(ev) {
			var val, keyCode, endstr, rtrimleft;
			
			val       = this.value;
			keyCode   = ev.keyCode;
			rtrimLeft = /^\s+/;
			
			// 不允许为空，不允许空格输入
			if (rtrimLeft.test(val)) {
				this.value = '';
				return;
			}
			
			// 空格或回车事件
			if ( (keyCode === 32 || keyCode === 13) && val!=='' ) {
				endstr = val.substring(val.length-1);
				// 中文处理，避免空格
				if (keyCode === 32 && endstr!=' ') {
					return;
				}
				if ( tagManager.add( $.trim(val) ) ) {
					this.value = '';
				}
			}
		})
		.delegate('i.close', 'click', function() {
			tagManager.remove(this);
		});
	

	tagManager = function() {
		var MAX = 5, num = 0, tags = [], rscript=/<script>/;

		function duplicate(str) {
			var isDuplicate = true;
			if ( $.inArray(str, tags) === -1) {
				isDuplicate = false;
			}
			return isDuplicate;
		}
		function addTag(val) {
			var htm;
			
			if (duplicate(val) || rscript.test(val)) {
				return false;
			}
			// 不能超过指定宽度
			if (computeLength(val) > 20) {
				alert('单个标签字符数不要超过20（汉字的字符数为2）');
				return false;
			}
			if (num<MAX) {
				tags.push(val);
				htm = '<span class="icon-tag">' + val + 
						'<i class="close" title="删除"></i>' +
					  '</span>';
				$tag.append(htm);
				num++;
				$input.width(TAGSLENGTH-$tag.width()-10);
			}
			if (num===MAX) {
				$input.hide();
			}
			
			return true;
		}
		function removeTag(el) {
			var i, txt, $el;
			$el = $(el).parent();
			txt = $el.text();
			i   = $.inArray(txt, tags);
			
			// 数组中去掉
			if (i !== -1) {
				tags.splice(i, 1);
			}

			// 删除tag
			$el.remove();
			num--;
			$input.width(TAGSLENGTH-$tag.width());
			
			// 最多为5个tag，少于5个则显示输入框
			if (num<MAX && $input.css('display')==='none') {
				$input.show();
				$input[0].focus();
			}
		}
		function clear() {
			$tag.find('i').each(function(i, it) {
				removeTag(it);
			});
		}
		
		return {
			add: addTag,
			remove: removeTag,
			clear: clear
		};

	}();
	
	if ($autoTag) {
		$autoTag.click(function(ev) {
			ev.preventDefault();
			var context = '';
			context = mysohu.blogEditor.editor.getContentTxt();
			if (context.length <= 0) {
				$.inform({
					icon: 'icon-error',
					delay: 2500,
					easyClose: true,
					content: '请先填写日志内容，系统才能根据内容来提取标签。<br/>或者您可以自己为日志添加一些标签，例如“情感 日记”。'
				});
				
			} else if (context.length < 100) {
				$.inform({
					icon: 'icon-error',
					delay: 2500,
					easyClose: true,
					content: '您的日志内容过少，系统很难有效提取标签。<br/>请增加到100字以上。<br/>或者您可以自己为日志添加一些标签，例如“情感 日记”。'
				});
				
			} else {
				requestTag(context);
			}
		});
		function requestTag(str) {
			var text,
				options,
				blogTitle = $('#blog-title'),
				url = '/a/blog/home/tag/get.htm?_input_encode=UTF-8&_output_encode=UTF-8';
			 
			if (blogTitle.length > 0) {
				if (blogTitle.val() == '') {
					text = str;
				} else {
					text = blogTitle.val() + ' ' + str;
				}
			}
			options = {
				requestUrl: url,
				method: 'post',
				parameters: text
			};
			setTimeout(function() {
				ajaxRequestTag(options); 
			}, 500);
			// console.log(options)
		}
		function ajaxRequestTag(opt) {
			var url = opt.requestUrl,
				parameters = opt.parameters;
			
			$.ajax({
				url: url,
				type: 'POST',
				data: {'text': parameters},
				success: function(result) {
					var tags = [], str = result.substr(5);
					if (result.length == 7) {
						$.inform({
							icon: 'icon-error',
							delay: 2500,
							easyClose: true,
							content: '很遗憾，系统没有提取出有效的标签。<br/>或许您可以自己为日志添加一些标签，例如“情感 日记”。'
						});
						
					} else if (str.length > 0) {
						tags = str.split(' ');
						tagManager.clear();
						$(tags).each(function(i, it) {
							tagManager.add(it);
						});
					}
				}
			});
		}
	}
	
};
	
}(jQuery));

// 分类
(function($){

$.category = function() {
	var btn_new = $('#createNewCategory');
	var blogCategory = $('#categoryBlogSelect');
	var newCategoryDiv = $('<div>' +
								'<input style="width:80px;height:22px;line-height:22px;margin:0 10px 0 0;"/>' +
								'<a class="category-submit">确定</a>' +
								'<a class="category-cancel">取消</a>' +
							'</div>');

	btn_new.before(newCategoryDiv.hide());

	var $input = newCategoryDiv.find('input');

	btn_new.click(function () {
		btn_new.hide();
		newCategoryDiv.show();
		$input[0].focus();
	});

	newCategoryDiv
		.delegate('a:first', 'click', submitCreate)
		.delegate('a:last', 'click', cancelCreate);
	
	//取消创建分类名称
	function cancelCreate(){
		newCategoryDiv.hide();
		btn_new.show();
	}
	
	//提交分类名称
	function submitCreate(){
		var categoryName = $input.val();
		
		if(/^\s*$/.test(categoryName)){
			$.inform({
				icon: 'icon-error',
				delay: 2000,
				easyClose: true,
				content: '请输入分类名称。'
			}); 
			$input.val('')[0].focus();

		} else if(categoryName.replace(/[^\x00-\xff]/g,"aa").length > 32){
			$.inform({
				icon: 'icon-error',
				delay: 2000,
				easyClose: true,
				content: '分类名称超过32个字符'
			}); 
			$input[0].focus();

		} else {
			categoryName = $.trim(categoryName);
		
			$.ajax({
				url:'/a/blog/home/category/add.htm?_input_encode=UTF-8&_output_encode=UTF-8',
				data:{"name":categoryName,"desc":"","perm":"0"},
				type:"POST",
				dataType: 'json',
				success:function(json){
					var icon = '';
					if (json.status) {
						var id=json.categoryId;
						var time = json.createOn;
						blogCategory.prepend('<option selected="selected" value="' +id+ '">' + categoryName + '</option>');
						icon = 'icon-success';
						cancelCreate();
						
						//设置选中
						setTimeout(function(){
							var opt=document.getElementById("categoryBlogSelect");
							opt[0].selected = true;
						},200);
						
					} else {
						icon = 'icon-error';
						$input[0].focus();
					}
					
					$.inform({
						icon: icon,
						delay: 1000,
						easyClose: true,
						content: json.msg
					});	

				}
			});
			
		}
	}

};

})(jQuery);

// 投稿类别
(function($) {

$.contributeCategory = function() {
	var BlogChannel=[
		{"id":"0","name":"选择频道","data":{"0":"请先选择频道"}},
		{"id":"445","name":"社会观点","data":{"5133":"亲历现场","5129":"星空评论","5136":"国际军事"}},
		{"id":"446","name":"图片","data":{"5165":"图片"}},
		{"id":"110","name":"财经","data":{"5111":"经济观察","5112":"金融证券","5110":"投资理财"}},
		{"id":"280","name":"文化","data":{"4933":"读书","5138":"史话","5141":"名家"}},
		{"id":"104","name":"娱乐","data":{"4926":"娱乐江湖","4927":"明星博文","4935":"影视评论"}},
		{"id":"448","name":"时尚","data":{"4922":"服饰潮流","4923":"美容瘦身","4937":"情爱男女"}},
		{"id":"442","name":"旅游户外","data":{"4780":"旅游","5109":"户外"}},
		{"id":"900","name":"育儿","data":{"4882":"孕期指南","5181":"新手爸妈","5240":"亲子日记","5220":"育儿心得"}},
		{"id": "1000", "name": "生活", "data": {"5441": "婚嫁", "5444": "家居", "5454": "美食"}},
		{"id":"102","name":"健康","data":{"5300":"健康养生"}},
		{"id":"980","name":"原创文学","data":{"5121":"讲述•人生","5126":"诗词墨苑","5125":"小说时代"}}
	];
	
	//初始化大分类和第一个的小分类
	var parentHtmlString=[],childHtmlString =[];	
	
	$.each(BlogChannel, function(i,n){
		parentHtmlString.push('<option value="' + n.id + '" >' + n.name + '</option>');				
		
		//如果初始是未选中的，则这里不需要初始化出小分类
		if(i==0){
			$.each(n.data,function(j,m){
				childHtmlString.push('<option value="' + j + '" >' + m + '</option>');
			});
		}
	});
	$('#ParentBlogCategory').html(parentHtmlString.join(''));
	$('#ChildBlogCategory').html(childHtmlString.join(''));
	
	//绑定切换事件
	$('#ParentBlogCategory').bind('change',blogChannelChangeEvent);
	function blogChannelChangeEvent(){
		var parentID = $('#ParentBlogCategory option:selected').val();
		var childChannelHtmlString=[];
		
		$.each(BlogChannel,function(i,n){
			if(n.id == parentID){
				$.each(n.data,function(j,m){
					childChannelHtmlString.push('<option value="' + j + '" >' + m + '</option>');
				});
			}
		});
		$('#ChildBlogCategory').html(childChannelHtmlString.join(''));
	}

};

})(jQuery);

// 初始化
$(function() {
	$.blogtag($('.eblog-tag'), $('.auto-tag'));
	$.category();
	$.contributeCategory();
});
