// 编辑器图片上传

(function($, mysohu){
	
$(function(){

	var blogLoading = $('#blogEditorLoading');
	var blogGuide = $('#blogguidtips');
	var blogBox = $('#blogeditorbox');
	var blogEditor = mysohu.blogEditor;
	var codeDlg = null;
	var opt = {
		publish: publish,
		draft: draft,
		cancel: cancel,
		isAutoSave: true
	};
	$('#writeblog').click(function() {
		blogBox.show();
		createEditor();
		blogGuide.hide();
	});

	function createEditor() {
		blogEditor.create(opt);
	}
	
	var search = window.location.search;
	if (search.indexOf('from=show') != -1) {
		blogGuide.hide();
		blogBox.show();
		setTimeout(function() {
			createEditor();
		}, 3000);

	}

	function cancel() {
		if (blogEditor.isEmpty()) {
			blogBox.hide();
			blogGuide.show();
			$(window).scrollTop(0);
		} else {
			window.location.reload();
		}
	}

	function publish() {
		var params = blogEditor.getParams()

		if (!params) return

		if ($('#showvcode').val() == '0') {
			save(params)
		} else {
			codeDlg = blogEditor.showCodeDialog(params, save)
		}
	}
	
	function save(params) {
		//保存的URL
		var saveURL = '/a/blog/home/entry/save.htm?_input_encode=UTF-8&_output_encode=UTF-8';
		var updateURL = '/a/blog/home/entry/update.htm?_input_encode=UTF-8&_output_encode=UTF-8&deliver=show';
		var quicksaveArticleID = $('#saveBlogToDraft').data("ArticleID");
		var sendURL = (quicksaveArticleID == undefined) ? saveURL : updateURL;
		var data = {
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
			url: sendURL,
			type: 'POST',
			data: data,
			success: function(result) {
				var json = $.parseJSON(result);
				if (json.status==2) {
					codeDlg.setInfo('验证码错误');
					return;
				}
				if (!json.status) {
					var targetURL = "http://i.sohu.com"+json.data; 
					var isContributeOK = false;//是否投稿成功
					
					//允许用户正常退出当前页面
					blogEditor.isAllowQuit = true;
					var entryid = (quicksaveArticleID == undefined) ? json.entryid : quicksaveArticleID;

					//对博客进行投稿
					if ( params.parent != '0' && $('#ParentBlogCategory').length>0 ) { 
						//构造提交投稿的参数
						var data = {
							showurl: '',
							entryid: entryid,
							bigtype: params.parent,
							smalltype: params.child
						}; 
						$.ajax({
							url: '/a/contribute/blog/ctb.htm',
							data: data,
							dataType:'jsonp',
							success: function(json) {
								if (!json.code) {
									$.sentenceNotice({
										type: 'notice',
										delay: 2500,
										icon: 'success',
										content: '博客发布成功，并已为您投稿！'
									});
								} else {
									$.sentenceNotice({
										type: 'notice',
										delay: 2500,
										icon: 'error',
										content: '博客发布成功，' + json.msg
									});
								}
								setTimeout(function() {
									window.location.href = targetURL;
								}, 2500);
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
					
				} else {
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

	function draft(params){
		var saveURL = '/a/blog/home/entry/save.htm?_input_encode=UTF-8&_output_encode=UTF-8';
		var updateURL = '/a/blog/home/entry/update.htm?_input_encode=UTF-8&_output_encode=UTF-8&deliver=show';
		var quicksaveArticleID = $('#saveBlogToDraft').data("ArticleID");
		var sendURL = (quicksaveArticleID == undefined) ? saveURL : updateURL;
		var data = {
			id: quicksaveArticleID,
			title: params.title,
			content: params.content,
			keywords: params.keywords,
			perm: params.perm,
			categoryId: params.category,
			oper: "art_draft",
			allowcomment:params.comment,
			vcode: params.vcode,
			vcodeEn: params.vcodeEn
		};
		$.ajax({
			url:sendURL,
			type:'POST',
			data: data,
			dataType: 'json',
			success: function(json) {
				var editorui = blogEditor.editor.editorui;
				if(!json.status) {
					//如果不是通过自动保存触发的，属于用户自己的保存，就 clearInterval
					if(!params.autosave){
						clearInterval(blogEditor.autoSaveInterval);
					}
					//草稿保存成功后记录blogID
					$("#saveBlogToDraft").data("ArticleID",json.entryid);
				}
				editorui.showToolbarMsg('<p style="text-align:center;">已为您保存到草稿箱</p>')
				setTimeout(function(){
					editorui.hideToolbarMsg();
				}, 3000);
			}
		});
	}

});
	
})(jQuery, mysohu);
