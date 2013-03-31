// 编辑器图片上传

(function($, mysohu){
	
	var CONSTANT_PLACEHOLDER = '在此输入博客标题';
	
	var blogEditor = {

		isAllowQuit: false,

		autoSaveInterval: null,

		create: function(opt) {
			var self = this;
			this.draft = opt.draft;
			this.publish = opt.publish;
			this.cancel = opt.cancel;
			this.isAutoSave = opt.isAutoSave;
			
			if(this.created){
				this.editor.focus();
				return;
			}
			
			var ueHandler = this.editor = new baidu.editor.ui.Editor();
			
			//开发保存功能插件 Save plugin
			baidu.editor.commands['save'] = {
				execCommand : function() {
					self.saveToDraft();
				}
			};
			baidu.editor.commands['preview'] = {
				execCommand : function() {
					self.preview();
				}
			};
			this.editor.render("myEditor");
			this.created = true;
			this.editor.focus();
			
			
			//粘贴，复制，剪切，只有IE浏览器会有，其他浏览器关闭掉
			if($.browser.msie){
				//开发保存功能插件 Save plugin
				baidu.editor.commands['paste']={
					execCommand : function(){
						var text = window.clipboardData.getData("Text");
						this.execCommand('insertHtml',text);
						return true;
					},
					queryCommandState : function(){ }
				};
					
				baidu.editor.commands['cut']={
					execCommand : function(){
						var range = ueHandler.selection.getRange();
						range.select();
						var txt = ueHandler.selection.getText();
						if(txt.toString() == '[object TextRange]'){
							return;
						}else{
							window.clipboardData.setData("Text",txt);
							this.execCommand('insertHtml','');
						}
						return true;
					},
					queryCommandState : function(){ }
				};
					
				baidu.editor.commands['copy']={
					execCommand : function(){
						var range = ueHandler.selection.getRange();
						range.select();
						var txt = ueHandler.selection.getText();
						if(txt.toString() == '[object TextRange]'){
							return;
						}else{
							window.clipboardData.setData("Text",txt);
						}
						return true;
					},
					queryCommandState : function(){ }
				};
			}else{
				//非IE系列浏览器，屏蔽掉这几个按钮
				$('.edui-for-paste .edui-button-wrap .edui-button-body .edui-icon ').css({"background-position":"-46px -180px"});
				$('.edui-for-cut .edui-button-wrap .edui-button-body .edui-icon ').css({"background-position":"0px -551px"});
				$('.edui-for-copy .edui-button-wrap .edui-button-body .edui-icon ').css({"background-position":"-33px -551px"});
			}
			
			if (this.isAutoSave) {
				this.autosave();
			}
			this.initElements();
			this.initEvents();
		},

		initElements: function() {
			this.elTitle = $('#blog-title');
			this.elTitle.val(CONSTANT_PLACEHOLDER).css({"color":"#999999"});
			this.elCategory = $('#categoryBlogSelect');
			this.elBtnCancel = $('#cancelBlog');
			this.initPreviewHtml();
		},
		
		initEvents: function() {
			var self = this;
			//标题获得焦点的时候，导航条变灰
			$('#newblog')
				.delegate('#blog-title', 'focusin', function(evt) {
					var titleText = self.elTitle.val();
					if (titleText == CONSTANT_PLACEHOLDER || titleText=='') {
						self.elTitle.val('').css({"color":"#333"});
					}
					self.editor.editorui.toolbar.setdisabled(true);
				})
				.delegate('#blog-title', 'focusout', function() {
					var titleText = self.elTitle.val();
					if (titleText=='') {
						self.elTitle.val(CONSTANT_PLACEHOLDER).css({"color":"#999"});
					}
					self.editor.editorui.toolbar.setdisabled(false);
				});

			// 预览链接
			$('#previewBlog').click(function() {
				self.preview();
			});

			// 存草稿
			$('#saveBlogToDraft').click(function() {
				self.saveToDraft();
			});

			// 发布
			$('#publishBlog').click(function() {
				self.publish();
			});

			// 取消
			$('#cancelBlog').click(function() {
				self.cancel();
			});

			// 离开前提示
			window.onbeforeunload = function() {
				if(!self.isAllowQuit && !self.isEmpty()){
					return '您正在编辑的博客尚未保存，确定要离开此页吗？';
				}
			};

		},

		//初始化预览的HTML代码from
		initPreviewHtml:function(){
			var space_config_URL = $space_config._url;
			var previewURL = (space_config_URL == 'i.sohu.com') ? ('http://i.sohu.com/p/' + $space_config._xpt + '/blog/preview.htm') : ('http://'+space_config_URL+'/blog/preview.htm');
			$("#ArticlePreviewForm").attr('action', previewURL);
		},

		//获得博客的分类
		getCategory: function() {
			return this.elCategory.val();
		},

		//获取文章 关键字 BlogKeywordsList
		getKeywords: function() { 
			var keywords = [];
			var list = $('#BlogKeywordsList').find('span');
			$.each(list,function(i,n) {
				var keyword = $(n).text(); 
				keywords.push(keyword);
			}); 
			return keywords.join(' ');
		},

		//获取阅读权限 readaccess
		getReadAccess: function(){
			var readAccess;
			$.each($("input[name='readaccess']"), function(i,n) {
				if($(n).attr("checked") == 'checked') {
					readAccess = $(n).val();
				}
			});
			return readAccess;
		},

		//获取评论权限 commentaccess
		getCommentAccess:function(){
			var commentAccess;
			$.each($("input[name='commentaccess']"), function(i,n) {
				if($(n).attr("checked") == 'checked') {
					commentAccess = $(n).val();
				}
			});
			return commentAccess;
		},

		getTitle: function(){
			var title = this.elTitle.val();
			if (title == CONSTANT_PLACEHOLDER) {
				title = '';
			}
			
			if (/^\s*$/.test(title)) {
				$.inform({
					icon: 'icon-error',
					delay: 2000,
					easyClose: true,
					content: '标题不能为空，请输入博客标题。'
				}); 
				this.elTitle.val('').focus();
				return false;
			} else if (title.replace(/[^\x00-\xff]/g,"aa").length > 100) {
				$.inform({
					icon: 'icon-error',
					delay: 2000,
					easyClose: true,
					content: '标题长度不能大于50个汉字。'
				});
				this.elTitle.focus();
				return false;
			}else{
				return title;
			}
		},

		getContent: function() {
			var editor      = this.editor;
			var blogcontent = editor.getContent();
			var blogtext    = editor.getContentTxt();
			
			if(blogcontent.length < 3){
				$.inform({
					icon: 'icon-error',
					delay: 2000,
					easyClose: true,
					content: '内容太少了吧。'
				});
				editor.focus();
			}else if(blogcontent.length > 100000){
				$.inform({
					icon: 'icon-error',
					delay: 2000,
					easyClose: true,
					content: '内容不能超过10万个字符。'
				});
				editor.focus();
			}else{
				return blogcontent;
			}
		},

		//取得投稿一级分类（父类）的频道ID
		getParentCategory: function(){
			return $('#ParentBlogCategory option:selected').val();
		},

		//取得投稿子分类的频道ID
		getChildCategory: function(){
			return $('#ChildBlogCategory option:selected').val();
		},

		isEmpty: function() {
			var title = this.elTitle.val();
			var content = this.editor.getContentTxt();
			if (content.length > 0 || title != CONSTANT_PLACEHOLDER) {
				return false;
			}
			return true;
		},

		//获取参数列表 var params  getParams
		getParams: function() {
			//返回的参数对象列表
			var params={};
			//perm : 0 公开 1 私有  allowcomment: 0 所有人可评论 1 禁止评论 2只允许登陆用户评论
			var title, content, keywords, category, perm, comment;
			
			var ParentID = this.getParentCategory();//投稿的父分类
			var ChildID = this.getChildCategory();//投稿的子分类
			
			//*//博客标题
			title = this.getTitle();//博客标题
			category = this.getCategory();//博客分类
			keywords = this.getKeywords();//博客关键字
			perm = this.getReadAccess();//博客阅读权限
			comment = this.getCommentAccess();//博客评论权限
			
			if (title) {
				content = this.getContent();//博客内容
			}
			
			if(title && content){
				params={'title':title,'content':content,'keywords':keywords,'category':category,'oper':'art_ok','perm':perm,'comment':comment,'parent':ParentID,'child':ChildID,'autosave':0};
				return params;
			}else{
				return false;
			}
		},

		//为存为草稿准备的，获取数据的方法
		getTempParams:function(){
			var tempParams={};//返回的参数对象列表
			//perm : 0 公开 1 私有  allowcomment: 0 所有人可评论 1 禁止评论 2只允许登陆用户评论
			var title, content, keywords, category, perm, comment, onlyImg;
			title = this.elTitle.val();
			if (title == CONSTANT_PLACEHOLDER) {
				title = '';
			}
			
			if (/^\s*$/.test(title)) {
				var thisData = new Date();
				var thisTime = (thisData.getMonth() + 1) +'月' +thisData.getDate() + '日 ' +thisData.getHours() + ':' + thisData.getMinutes();
				title =  '这是 '+thisTime+' 为您自动保存的草稿';
			} else if (title.replace(/[^\x00-\xff]/g,"aa").length > 100) {
				$.inform({
					icon: 'icon-error',
					delay: 2000,
					easyClose: true,
					content: '标题长度不能大于50个汉字。'
				});
				title = title.substr(0,40);
			}
			
			content = this.editor.getContent();
			onlyImg = /<img/.test(content);
			
			if (this.editor.getContentTxt().length > 0 || onlyImg) {
				var ParentID = this.getParentCategory();//投稿的父分类
				var ChildID  = this.getChildCategory();//投稿的子分类
				
				category = this.getCategory();//博客分类
				keywords = this.getKeywords();//博客关键字
				perm     = this.getReadAccess();//博客阅读权限
				comment  = this.getCommentAccess();//博客评论权限
				
				return {
					'title':title,
					'content':content,
					'keywords':keywords,
					'category':category,
					'oper':'art_ok',
					'perm':perm,
					'comment':comment,
					'parent':ParentID,
					'child':ChildID,
					'autosave':1
				};
			}
			
			return false;
			
		},

		//博客的自动保存功能
		autosave: function(){
			var self = this;
			this.autoSaveInterval = setInterval(function() {
				var tempParams = self.getTempParams();
				if (tempParams) {
					self.draft(tempParams);
				}
			}, 60000);
		},

		preview: function() {
			var params= this.getTempParams();
			var title = /为您自动保存的草稿/.test(params.title) ? '暂无标题' : params.title;
			$("#formTitle").val(title);
			$("#formContent").val(params.content);
			$("#formKeywords").val(params.keywords);
			$("#formCategory").val(params.category);
			$("#ArticlePreviewForm").submit();
		},

		//存为草稿的按钮动作
		saveToDraft: function() {
			var params = this.getParams();
			var draft = this.draft;
			if (draft && params) {
				draft(params);
			}
		},
		
		showCodeDialog: function(params, callback) {
			var changeVcode = function() {
				$.ajax({
					url: '/a/blog/home/vcode/get.htm',
					type:"POST",
					success:function(data) {
						$("#vcodeEn").val(data)
						codeDlg.find('.blogvcode img')
							.css('cursor', 'pointer')
							.data('code', data)
							.attr('title', '点击更换验证码')
							.attr("src","/a/blog/home/vcode/rand?vcode="+data)
					}
				})
			}
			var html = 
			'<div class="blogvcode" style="margin: 30px 0 0 50px;">' +
				'<label>验证码：<input style="width:100px"/></label>' +
				'<img width="80px" style="margin: 0 0 -5px 3px;" src="" valign="bottom"/>' +
			'</div>' +
			'<div class="info" style="padding:5px 0 0 99px;color:red;"></div>'
			
			var codeDlg = $.dialog({
				title : '请输入验证码',
				btns : ['accept', 'cancel'],
				defaultBtn : 'cancel',
				contentWidth : 398,
				labAccept : '发布',
				content : html
			})
			
			codeDlg.find('.dialog-left-border, .dialog-right-border').height(190)
			codeDlg.find('.dialog-content-container').height(100)
			codeDlg.find('.dialog-middle-container').height('')
			codeDlg.find('.dialog-button-container').css('border-radius', 0).css('border-top', 0)
			codeDlg.css('background-color', 'white')
			codeDlg.find('input')[0].focus()
			codeDlg.unbind('accept')
			codeDlg.delegate('.dialog-button-accept', 'click', function() {
					var $input = codeDlg.find('input')
					params.vcode = $input.val()
					params.vcodeEn = $("#vcodeEn").val()
					var val = $input.val()
					if (val.length<=0) {
						codeDlg.setInfo('验证码不能为空')
						$input[0].focus()
						return false
					}
					callback(params)
				})
				.delegate('.blogvcode img', 'click', function() {
					changeVcode()
				})
			
			codeDlg.setInfo = function(str) {
				codeDlg.find('.info').html(str)
			}
			changeVcode()
			
			return codeDlg
		}
	};
	
	mysohu.blogEditor = blogEditor;
	
})(jQuery, mysohu);
