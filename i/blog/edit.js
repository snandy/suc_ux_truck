// 修改编辑博客

(function($, mysohu) {

$(function() {
	var codeDlg;
	var blogEditor = mysohu.blogEditor;
	var opt = {
		publish: publish,
		draft: draft,
		cancel: cancel
	};

	blogEditor.create(opt);

	// 回填标题
	var val = '';
	var hiddenTitle = $('#hiddenBlogTitle');
	if (hiddenTitle.length) {
		val = hiddenTitle.val();
		$('#blog-title').val(val);
	}

	function publish() {
		var params = blogEditor.getParams()
		if (!params) {
			return
		}
		if ($('#showvcode').val() == '0') {
			save(params)
		} else {
			codeDlg = blogEditor.showCodeDialog(params, save)
		}
	}
	
	function save(params) {
		var updateURL = '/a/blog/home/entry/update.htm?_input_encode=UTF-8&_output_encode=UTF-8',
			quicksaveArticleID = $("#hiddenEntryId").val(),
			data = {
				id: quicksaveArticleID,
				title: params.title,
				content: params.content,
				keywords: params.keywords,
				perm: params.perm,
				categoryId: params.category,
				oper: "art_ok",
				allowcomment: params.comment,
				vcode: params.vcode,
				vcodeEn: params.vcodeEn,
				subflag: '0'
			};
			
		$.ajax({
			url: updateURL,
			type:'POST',
			data: data,
			dataType: 'json',
			success: function(json) {
				if (!json.status) { 
					var targetURL = json.data || ''; 
					var isContributeOK = false;//是否投稿成功
					
					//允许用户正常退出当前页面
					blogEditor.isAllowQuit = true;
					var entryid = (quicksaveArticleID == undefined) ? json.entryid : quicksaveArticleID; 
					//对博客进行投稿
					if (params.parent != '0' && $('#ParentBlogCategory').length>0) {
						//构造提交投稿的参数
						var temp = {"showurl":'',"entryid":entryid,"bigtype":params.parent,"smalltype":params.child}; 
						$.ajax({
							url:'http://i.sohu.com/a/contribute/blog/ctb.htm',
							data:temp,
							dataType:'jsonp',
							success:function(json){
								if(!json.code){
									//弹出投稿提示信息，由于接口的jsonp改造还没有完成
									$.sentenceNotice({
										type: 'notice',
										delay: 2500,
										icon: 'success',
										content: '博客发布成功，并已为您投稿！'
									});
									
									setTimeout(function(){
										window.location.href = targetURL;
									},2500);
									
								}else{
									$.sentenceNotice({
										type: 'notice',
										delay: 2500,
										icon: 'error',
										content: '博客发布成功，投稿失败！'
									});
									
									setTimeout(function(){
										window.location.href = targetURL;
									},2500);
								}
							}
						});
						
					} else {
						//没有进行博客投稿！的逻辑如下：
						$.inform({
							icon: 'icon-success',
							delay: 1000,
							easyClose: true,
							content: json.statusText
						});	
						
						setTimeout(function(){
							window.location.href = targetURL;
						},2000);
					}
					
				}else{
					$.inform({
						icon: 'icon-error',
						delay: 1000,
						easyClose: true,
						content: json.statusText
					});
				}
			},
			error:function(){
				$.inform({
					icon: 'icon-error',
					delay: 2000,
					easyClose: true,
					content: '服务器错误,请稍后再试...'
				});
			}
		});
	}
	
	function draft(params) {
		var updateURL = '/a/blog/home/entry/update.htm?_input_encode=UTF-8&_output_encode=UTF-8';
		var quicksaveArticleID = $("#hiddenEntryId").val();
		var data = {
			id: quicksaveArticleID,
			title: params.title,
			content: params.content,
			keywords: params.keywords,
			perm: params.perm,
			categoryId: params.category,
			oper: 'art_draft',
			allowcomment: params.comment
		};

		$.ajax({
			url:updateURL,
			type: 'POST',
			data: data,
			dataType: 'json',
			success: function(json){
				var editorui = blogEditor.editor.editorui;
				clearInterval(blogEditor.autoSaveInterval);
				editorui.showToolbarMsg('<p style="text-align:center;">已为您保存到草稿箱</p>')
				setTimeout(function(){
					editorui.hideToolbarMsg();
				}, 3000);
			}
		});
	}

	function cancel() {
		window.history.back();
	}


});

})(jQuery, mysohu);