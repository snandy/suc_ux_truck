/*
	s3.suc.itc.cn 6-13
	i/blog.js
	6224
	2011-10-10重构blog.js
 */

;(function($) {
	// DOCUMENT.ready.Event
	$(function() {
		var $nick = $('#nickname')
		// 自己的博客可以编辑，删除，分类设置，撰写新博客等
		if (mysohu.is_mine()) {
			$nick.html('我的博客')
			$('.hide').removeClass('hide')
		} else {
			$nick.html($space_config._sucNick + '的博客')
		}
		blog.init();
	});

	var blog = {
		// 待发布的博客的分类categoryselect
		_category : '',

		init : function() {
			// 评论和转发的数量
			this.blogReaderForwardNumber.init();

			// 加载博客前台页面tags list列表
			this.blogTagsList.init();

			// 设置博客前台展示的时候的博客配图的大小
			this.blogThumbnail.init();

			// 博客管理
			this.blogManager.init();

			// 博客展示页发布按钮
			this.blogDrafArticle.init();

			// 博客分类管理弹窗
			this.blogCategoryManager.init();
		},

		// 博客草稿文字相关的
		blogDrafArticle : {
			init : function() {
				this.initArticleDraf();
				this.setDraftKeywords();
			},

			// 博客草稿预览页的发布
			// setTimeout(function(){ initArticleDraf() },1000);
			initArticleDraf : function() {
				var that = this;
				if ($("#publisharticlelink").length != 0) {

					var id = $("#articleid").val();
					$("#categoryId").bind("change", function() {
						categoryid = $("#categoryId option:selected").val();
					});

					$("#publisharticle").bind("click", function() {
						that.publishArticleDraft(id);
					});
					$("#publisharticlelink").bind("click", function() {
						that.publishArticleDraft(id);
					});
				}

				if ($("#articledeletelink").length != 0) {
					var id = $("#articleid").val();
					$("#articledeletelink").bind("click", function() {
						$.confirm({
							title : false,
							icon : "icon-question",
							content : "确认删除吗？此操作不可逆！",
							labConfirm : "确认",
							labCancel : "取消",
							onConfirm : function($dialog) {
								that.deleteArticleDraft(id);
							},
							onCancel : function($dialog) {
							}
						});
					});
				}
			},

			// 草稿最终页直接点删除
			deleteArticleDraft : function(id) {
				$.ajax({
					url : '/a/blog/home/entry/delete.htm?_input_encode=UTF-8&_output_encode=UTF-8',
					type : 'POST',
					data : {
						"id" : id
					},
					success : function(result) {
						var json = $.parseJSON(result);
						if (!json.status) {
							$.inform({
								icon : 'icon-success',
								delay : 2000,
								easyClose : true,
								content : json.statusText,
								onClose : function($dialog) {
								}
							});
							setTimeout(function() {
								if (json.status == 0) {
									window.location.href = json.data;
								}
							}, 2000);
						} else {
							$.inform({
								icon : 'icon-error',
								delay : 2000,
								easyClose : true,
								content : json.statusText,
								onClose : function($dialog) {
								}
							});
							setTimeout(function() {
								window.location.href = 'http://i.sohu.com/blog/home/entry/list.htm';
							}, 2000);
						}
					}
				});
			},

			// 发布草稿箱中的博文
			publishArticleDraft : function(id) {
				$.ajax({
					url : '/a/blog/home/entry/publish.htm?_input_encode=UTF-8&_output_encode=UTF-8',
					type : 'POST',
					data : {
						"id" : id
					},
					success : function(result) {
						var json = $.parseJSON(result);
						if (json.status == 0) {
							$.inform({
								icon : 'icon-success',
								delay : 2500,
								easyClose : true,
								content : "博客发布成功！即将跳转到博客浏览页面。",
								onClose : function($dialog) {
								}
							});
							setTimeout(function() {
								if (json.status == 0) {
									window.location.href = json.data;
								}
							}, 2500);
							return false;
						} else {
							$.inform({
								icon : 'icon-error',
								delay : 2000,
								easyClose : true,
								content : json.statusText,
								onClose : function($dialog) {
								}
							});
							return false;
						}
					}
				});
			},

			// keywords 编辑草稿页面，请输入标签
			// setTimeout(function(){ setDraftKeywords() },2000);
			setDraftKeywords : function() {

				if ($("#keywords").length > 0) {
					// 如果原始有tag信息，则不再初始化
					if ($("#keywords").val().length == 0) {
						$("#keywords").val("请输入标签").css({
							"color" : "#999999"
						});
					}

					// 输入标签的提示文案的显示与关闭
					$("#keywords").live("click", function() {
						var handler = this;
						if ($(handler).val() == '请输入标签') {
							$(handler).val('').css({
								"color" : "#666666"
							});
						}
					}).focusout(function() {
						var handler = this;
						var txt = $(handler).val();
						if ($.trim(txt) == '请输入标签' || /^\s*$/.test(txt) == true) {
							$(handler).val('请输入标签').css({
								"color" : "#999999"
							});
						}
					});

					// 输入标签的提示文案的显示与关闭
					$("#title").live("click", function() {
						var handler = this;
						if ($(handler).val() == '请填写标题') {
							$(handler).val('').css({
								"color" : "#666666"
							});
						} else {
							$(handler).css({
								"color" : "#666666"
							});
						}
					}).focusout(function() {
						var handler = this;
						var txt = $(handler).val();
						if ($.trim(txt) == '请填写标题' || /^\s*$/.test(txt) == true) {
							$(handler).val('请填写标题').css({
								"color" : "#999999"
							});
						}
					});
				}
			}
		},

		blogCategoryManager : {
			init : function() {
				this.categoryManager();
			},

			// 管理分类的弹窗category /blog/home/category/list
			categoryManager : function() {
				var modifymark = false;
				var originalcategoryname = '';
				// 修改一个分类
				function updateCategory(id, txt) {
					var name = $("#name_" + id).text();
					if (name == txt) {
						return;
					} else {
						var perm = $("#hide_" + id + ":checked").length;
						$.ajax({
							url : '/a/blog/home/category/update.htm?_input_encode=UTF-8&_output_encode=UTF-8',
							data : {
								"id" : id,
								"name" : $.trim(name),
								"desc" : "",
								"perm" : perm
							},
							type : 'POST',
							success : function(result) {
								var json = $.parseJSON(result);
								if (json.status) {
									setTimeout(function() {
										$.sentenceNotice({
											type : 'notice',
											delay : 1000,
											icon : 'success',
											content : json.msg
										});
									}, 200);
									modifymark = true;
								} else {
									setTimeout(function() {
										$.sentenceNotice({
											type : 'notice',
											delay : 1000,
											icon : 'error',
											content : json.msg
										});
									}, 200);
								}
							}
						});
					}
				}

				var $dialogCategoryManager = {};

				$("#managecategory").live("click", function() {
					$.ajax({
						url : "/a/blog/home/category/list.htm?_input_encode=UTF-8&_output_encode=UTF-8",
						data : "",
						type : "POST",
						success : function(result) {
							var json = $.parseJSON(result), $content = '';
							$.each(json.categoryList, function(i, n) {
								if (n.perm == 0) {
									$content += '<li id="item_'
									+ n.id
									+ '" class="rs"><span class="col-1"><span id="editname_'
									+ n.id
									+ '_'
									+ n.name
									+ '"  title="'
									+ n.name
									+ '" class="sort-name-default"><strong id="name_'
									+ n.id
									+ '">'
									+ n.name
									+ '</strong><a href="javascript:;" class="edit">编辑</a></span>	</span><span class="col-3"><span class="create-date">'
									+ n.createOn
									+ '</span></span><span class="col-4"><span class="tool"><input class="hidecategory" id="hide_'
									+ n.id + '" type="checkbox">隐藏　　<a  id="categoryid_' + n.id
									+ '" class="deleteThisCategory" href="javascript:;">删除</a></span></span></li>';
								} else {
									$content += '<li id="item_'
									+ n.id
									+ '" class="rs"><span class="col-1"><span id="editname_'
									+ n.id
									+ '_'
									+ n.name
									+ '"  title="'
									+ n.name
									+ '" class="sort-name-default"><strong id="name_'
									+ n.id
									+ '">'
									+ n.name
									+ '</strong><a href="javascript:;" class="edit">编辑</a></span>	</span><span class="col-3"><span class="create-date">'
									+ n.createOn
									+ '</span></span><span class="col-4"><span class="tool"><input class="hidecategory" id="hide_'
									+ n.id + '" type="checkbox" checked="checked">隐藏　　<a  id="categoryid_' + n.id
									+ '" class="deleteThisCategory" href="javascript:;">删除</a></span></span></li>';
								}
							});

							$dialogCategoryManager = $.dialog({
								className : '',
								labAccept : '保存',
								labCancel : '取消',
								title : '管理分类',
								content : '<div class="dialog-blog-set"><ul>'
								+ '<li class="title"><span class="col-1">分类名</span><span class="col-3">创建日期</span><span class="col-4">分类隐藏</span></li></ul><ul style="height:180px;" class="items-list">'
								+ $content
								+ '</ul><ul><li class="rs"><span class="sort-name-add"><input  id="addcategoryname"  type="text" value="填写分类名" class="sort-name-input"><a id="addcategory" class="btn1" href="javascript:;">新增分类</a></span></li>'
								+ '</ul></div>',
								fixed : true,
								modal : true,
								scrollIntoView : true,
								onBeforeAccept : function() {
								},
								onClose : function() {
									if (modifymark) {
										var url = window.location.href;
										var ihome = 'http://i.sohu.com/blog/home/entry/list.htm';
										if (url == ihome) {
											window.location.href = ihome;
										} else {
											window.location.href = url;
										}
									}
								}
							});
							// 鼠标移动到博客分类名和博客分类描述上的时候出现编辑.sort-name-default
							$(".sort-name-default").live("mouseenter", function() {
								$(this).addClass("sort-name-default-hover");
							}).live("mouseleave", function() {
								$(this).removeClass("sort-name-default-hover");
							});
						}
					});

					$("#addcategoryname").live("click", function() {
						var handler = this;
						if ($(handler).val() == '填写分类名') {
							$(handler).val("").css({
								"color" : "#000000"
							});
						}
					}).live("focusout", function() {
						var handler = this;
						if ($(handler).val() == '' || $(handler).val() == '填写分类名') {
							$(handler).val("填写分类名").css({
								"color" : "#999999"
							});
						}
					});

					$(".edit").live("click", function() {
						var temp = $(this).parent().attr("id").split('_');
						var type = temp[0];
						var id = temp[1];
						var name = temp[2];
						if (type == 'editname') {
							$(this).parent().removeClass('sort-name-default-hover').addClass('sort-name-default-edit').html(
							'<input id="editnameinput_' + id + '" type="text" value="' + name + '" class="sort-name-input"/>');
							$('#editnameinput_' + id).focus().bind(
							"focusout",
							function() {
								var editname = $('#editnameinput_' + id).val().replace(/[\<]/g, "&lt;")
								.replace(/[\>]/g, "&gt;");

								originalcategoryname = editname;
								if (/^\s*$/.test(originalcategoryname)) {
									setTimeout(function() {
										$.sentenceNotice({
											type : 'notice',
											delay : 1000,
											icon : 'error',
											content : '分类名称不能为空!'
										});
									}, 200);

									$("#editnameinput_" + id).val(name).focus();
									return false;

								} else if (originalcategoryname != name) {
									$(this).parent().attr({
										"id" : "editname_" + id + "_" + editname,
										"title" : editname
									}).removeClass('sort-name-default-edit').html(
									'<strong id="name_' + id + '">' + editname
									+ '</strong><a href="javascript:;" class="edit">编辑</a>');

									updateCategory(id, name);
								} else if (originalcategoryname == name) {
									$(this).parent().attr({
										"id" : "editname_" + id + "_" + editname,
										"title" : editname
									}).removeClass('sort-name-default-edit').html(
									'<strong id="name_' + id + '">' + editname
									+ '</strong><a href="javascript:;" class="edit">编辑</a>');
								}
							});
						}
					});

				});

				// 修改一个分类 hidecategory 是否隐藏的勾选checkbox
				$(".hidecategory").live("click", function() {
					updateCategory(this.id.substr(5));
				});

				// 删除博客分类 delete category
				$(".deleteThisCategory").live("click", function() {
					var id = this.id.substr(11);
					$.confirm({
						title : false,
						icon : "icon-question",
						content : "确认删除吗？此操作不可逆！",
						labConfirm : "确认",
						labCancel : "取消",
						onConfirm : function($dialog) {
							$.ajax({
								url : '/a/blog/home/category/delete.htm?_input_encode=UTF-8&_output_encode=UTF-8',
								data : {
									"id" : id
								},
								type : 'POST',
								success : function(result) {
									var json = $.parseJSON(result);
									if (json.status) {
										$("#item_" + id).slideUp(500);
										setTimeout(function() {
											$("#item_" + id).remove();
											$dialogCategoryManager.adjust();
											modifymark = true;
											return false;
										}, 700);
									} else {
										$.sentenceNotice({
											type : 'notice',
											delay : 2000,
											icon : 'error',
											content : json.msg
										});
										return false;
									}
								}
							});
						},
						onCancel : function($dialog) {
						}
					});
				});

				// 添加一个分类
				$("#addcategory").live("click", function() {
					var name = $("#addcategoryname").val()
					var safename = $("#addcategoryname").val().replace(/[\<]/g, "&lt;").replace(/[\>]/g, "&gt;");
					if (name == '填写分类名' || $.trim(name) == '') {
						$.sentenceNotice({
							type : 'notice',
							delay : 1000,
							icon : 'error',
							content : '请填写分类名'
						});
						$("#addcategoryname").val('').focus();
					} else if (name.replace(/[^\x00-\xff]/g, "aa").length > 32) {
						$.sentenceNotice({
							type : 'notice',
							delay : 1000,
							icon : 'error',
							content : '分类名称超过32个字符'
						});
						$("#addcategoryname").focus();
					} else {
						var handler = this;

						$.ajax({
							url : '/a/blog/home/category/add.htm?_input_encode=UTF-8&_output_encode=UTF-8',
							data : {
								"name" : $.trim(name),
								"desc" : "",
								"perm" : "0"
							},
							type : "POST",
							success : function(result) {
								var json = $.parseJSON(result);
								if (json.status) {
									var id = json.categoryId;
									var time = json.createOn;
									var $newCategory = '<li id="item_'
									+ id
									+ '" class="rs" style="display: none;"><span class="col-1"><span id="editname_'
									+ id
									+ '_'
									+ safename
									+ '"  class="sort-name-default"><strong title="'
									+ $.trim(safename)
									+ '" id="name_'
									+ id
									+ '">'
									+ $.trim(safename)
									+ '</strong><a href="javascript:;" class="edit">编辑</a></span>	</span><span class="col-3"><span class="create-date">'
									+ time
									+ '</span></span><span class="col-4"><span class="tool"><input class="hidecategory" id="hide_'
									+ id + '" type="checkbox">隐藏　　<a id="categoryid_' + id
									+ '" class="deleteThisCategory" href="javascript:;">删除</a></span></span></li>';

									var items_list = $(handler).closest('div.dialog-blog-set').find('ul.items-list').prepend(
									$newCategory)[0];

									items_list.scrollTop = 0;

									$("#item_" + id).slideDown();
									$("#addcategoryname").val("");

									if ($(".items-list").height() < 180) {
										$(".items-list").height('180');
										$dialogCategoryManager.adjust();
									} else {
										$(".items-list").height('180');
									}

									// 添加分类不刷新页面，并且把新添加的分类加入到分类列表
									// modifymark = true;
									if ($("#categoryselect").length > 0) {
										$("#categoryselect").append('<option value="' + id + '">' + $.trim(name) + '</option>');
										$("#categoryselect").val(id);
										blog._category = id;
									}

								} else {
									$.sentenceNotice({
										type : 'notice',
										delay : 1000,
										icon : 'error',
										content : json.msg
									});
									return false;
								}
							}
						});
					}
				});
			}
		},

		blogManager : {
			init : function() {
				this.publishArticle();
				this.deleteArticle();
			},

			// 直接在博客列表页点击发布，发布博客
			publishArticle : function() {
				var $articlepublish = $(".articlepublish") 
				if ($articlepublish.length > 0) {
					$articlepublish.live("click", function() {
						var id = (this.id).substr(8);
						$.ajax({
							url : '/a/blog/home/entry/publish.htm?_input_encode=UTF-8&_output_encode=UTF-8',
							type : 'POST',
							data : {id : id},
							success : function(result) {
								var json = $.parseJSON(result);
								if (json.status == 0) {
									$.inform({
										icon : 'icon-success',
										delay : 2500,
										easyClose : true,
										content : "博客发布成功！即将跳转到博客浏览页面。",
										onClose : function($dialog) {
										}
									});
									setTimeout(function() {
										if (json.status == 0) {
											window.location.href = json.data;
										}
									}, 2000);
									return false;
								} else if (json.status == 1) {
									$.inform({
										icon : 'icon-error',
										delay : 2500,
										easyClose : true,
										content : json.statusText,
										onClose : function($dialog) {
										}
									});
								}
							}
						});
					});
				}
			},

			// 在草稿页删除博文blog article//在草稿页
			deleteArticle : function() {
				if ($(".articledelete").length == 0) {
					return
				}
				$(".articledelete").live("click", function() {
					var id = (this.id).substr(8);
					$.confirm({
						title : false,
						defaultBtn : 'cancel',
						content : '是否删除此博文？删除后不可恢复。',
						onConfirm : function() {
							$.ajax({
								url : '/a/blog/home/entry/delete.htm?_input_encode=UTF-8&_output_encode=UTF-8',
								type : 'POST',
								data : {id : id},
								success : function(result) {
									var json = $.parseJSON(result);
									if (json.status == 0) {
										$.inform({
											icon : 'icon-success',
											delay : 2000,
											easyClose : true,
											content : "删除成功。",
											onClose : function($dialog) {
											}
										});
										if ($("#id_" + id).length > 0) {
											var articlenum = parseInt($("#articlenum").text(), 10) - 1;
											var articlecountnum = parseInt($("#articlecountnum").text(), 10) - 1;

											$("#articlenum").text(articlenum);
											$("#articlecountnum").text(articlecountnum);

											$("#id_" + id).slideUp(500);
										} else {
											window.location.href = json.data;
										}
									} else {
										$.inform({
											icon : 'icon-error',
											delay : 2000,
											easyClose : true,
											content : "删除失败。",
											onClose : function($dialog) {
											}
										});
									}
								},
								error : function() {
									$.inform({
										icon : 'icon-error',
										delay : 2000,
										easyClose : true,
										content : "网络异常,请重试",
										onClose : function($dialog) {
										}
									});
								}
							});
						},
						onCancel : function(event) {
							return false;
						}
					});

				});
			}

		},

		// 阅读数量，评论，转发
		blogReaderForwardNumber : {
			// 后加载阅读数量和转发数量
			init : function() {
				var that = this;
				if ($(".readernum").length > 0) {
					that.readerNumber();
				}
				// 博客转发和评论数量有相关模块统一初始化屏蔽相关代码2011-12-15
				if ($(".forwardnum").length > 0) {
					that.forwardNumber();
				}
			},
			// 博客转发和评论数量有相关模块统一初始化屏蔽相关代码2011-12-15
			forwardNumber : function() {
				var ids = [];
				$(".forwardnum").each(function(i) {
					var id = (this.id).substr(8);
					ids.push('blog_' + id);
				});
				var ts = (new Date).getTime();
				$.ajax({
					url : 'http://cc.i.sohu.com/a/app/counts/get.htm',
					data : 'ids=' + ids.join(','),
					dataType : 'jsonp',
					success : function(data) {
						$.each(data, function(i, n) {
							if (n.spreadcount == 0) {
								$("#forward_" + i).html('转发');
							} else {
								$("#forward_" + i).html('转发(' + n.spreadcount + ')');
							}
							if (n.commentcount == 0) {
								$("#comment_" + i).html('评论');
							} else {
								$("#comment_" + i).html('评论(' + n.commentcount + ')');
							}
						});
					}
				});
			},

			// 阅读数量。后加载url:'http://blog.sohu.com/page/comment.do',
			// data:{'m':'list','v':'count','eids':id},
			readerNumber : function() {
				var ids = [];
				$(".readernum").each(function(i) {
					var id = (this.id).substr(7);
					ids.push(id);
				});
				var ts = (new Date).getTime();
				var url = window.location.href;
				if (url.match('index.htm') || url.match('/blog/home/entry/list.htm') || url.match('/blog/show/entry/list.htm')) {
					$.ajax({
						url : 'http://ana.blog.sohu.com/blogcount',
						data : {
							'l' : ids.join(','),
							'vn' : ts
						},
						type : 'GET',
						timeout : 2000,
						dataType : 'script',
						success : function(data) {
							var info = Blog["ercs_" + ts] || {};
							$.each(info, function(i, n) {
								setTimeout(function() {
									$("#reader_" + i).html('阅读(' + n + ')'); /* getReaderToRender(i,n) */
								}, 0);
							});
						}
					});
				} else {
					$.ajax({
						url : 'http://ana.blog.sohu.com/blogcount',
						data : {
							'e' : ids.join(','),
							'vn' : ts
						},
						type : 'GET',
						timeout : 2000,
						dataType : 'script',
						success : function(data) {
							var info = Blog["ercs_" + ts] || {};
							$.each(info, function(i, n) {
								setTimeout(function() {
									$("#reader_" + i).html('阅读(' + n + ')'); /* getReaderToRender(i,n) */
								}, 0);
							});
						}
					});
				}
			}
		},

		// 加载博客前台页面所需要的tag标签信息
		blogTagsList : {
			init : function() {
				this.getBlogTag();
			},

			// 后加载博客前台页面所需要的tage标签信息
			getBlogTag : function() {
				if ($("#suc_blog_tags").length > 0) {
					var id = $("#suc_blog_tags p").attr('id').substr(5);
					if (id.length == 0)
						return;
					var taglink = $("#hidetaglink").val();
					var url = 'http://ptag.blog.sohu.com/btags/' + id + '/all/';
					$
					.getScript(
					url,
					function(data, status) {
						if (status === 'success') {
							var islong = false;
							var html = '';
							var hidehtml = '<a id="show_all_suc_tags" href="javascript:;" > 展开全部标签 </a><span style="display:none;"  id="suc_blog_tags_hide">'
							$.each(BlogPtags.tags_abc, function(i, n) {
								if (i < 50) {
									html += '<a href="' + taglink + n.encode + '" title="' + n.count + '篇" >' + n.tag + '</a>';
								} else {
									islong = true;
									hidehtml += '<a href="' + taglink + n.encode + '" title="' + n.count + '篇" >' + n.tag
									+ '</a>';
								}
							});
							hidehtml += '<a id="hide_all_suc_tags" href="javascript:;" > 收起标签 </a></span>'
							if (islong) {
								$("#tags_" + id).html(html + hidehtml);

								$("#show_all_suc_tags").bind("click", function() {
									$("#suc_blog_tags_hide").slideDown(300);
									$("#show_all_suc_tags").hide();
								});
								$("#hide_all_suc_tags").bind("click", function() {
									$("#suc_blog_tags_hide").slideUp(300);
									$("#show_all_suc_tags").show();
								});
							} else {
								$("#tags_" + id).html(html);
							}
						}
					});

				}
			}

		},

		// 设置博客前台页面中博客配图的大小为宽高最大180px
		blogThumbnail : {
			init : function() {
				this.setBlogThumbnail();
			},
			setBlogThumbnail : function() {
				if ($(".blogthumbnail").length > 0) {
					$(".blogthumbnail").each(function(i) {
						if ($(this).width() > $(this).height()) {
							if ($(this).width() > 180) {
								$(this).css({
									"display" : "block",
									"width" : "180px"
								});
							} else {
								$(this).css({
									"display" : "block"
								});
							}
						} else {
							if ($(this).height() > 180) {
								$(this).css({
									"display" : "block",
									"height" : "180px"
								});
							} else {
								$(this).css({
									"display" : "block"
								});
							}
						}
					});
				}
			}
		}
	}// blog.end

})(jQuery);

(function($){
	var xpt = window.$space_config._xpt
	
	$(function(){
		var url = window.location.href, userid = xpt;
		if(/from=news/.test(url)){
			var isBlogPopTips = $.cookie('isBlogPopTips|' + userid);
			if(!isBlogPopTips){
				var poptipsHTML = '<div class="popup myblog"><a id="poptipsCloseBTN" href="javascript:;" class="close"></a><i class="img-prompt"></i></div>';
				$('.panel-box:first').prepend(poptipsHTML)
				$('#poptipsCloseBTN').bind('click',function(){
					$(this).parent().remove()
				})
				setTimeout(function(){
					$.cookie('isBlogPopTips|' + userid, true, {path: '/', expires: 90});
				},0);
			}
		}
	})
	
	// 插入商品广告
	function insertAd() {
		var preUrl = 'http://i.sohu.com/a/advertise/',
			charset = '?cb=?&_input_encode=UTF-8&_output_encode=UTF-8',
			adUrl = preUrl + 'get.htm' + charset,
			upUrl = preUrl + 'updesc.htm' + charset,
			elAd = $('.blog-article-ad-wrapper'), $title, $show, $edit, $input
			
		$blog_config = $blog_config || {}
		
		if (!$blog_config.showAd) return
		
		// 参数cache，jsonpCallback用来强制使用缓存，因为默认会生成TIMESTAMP，且不同jsonpCallback
		$.ajax({
			url: adUrl,
			cache: true,
			dataType: 'jsonp',
			jsonpCallback: 'callback',
			data: {xpt: xpt},
			success: function(obj) {
				elAd.html(obj.data)
				$title = elAd.find('.title')
				$show  = $title.find('.tt-bt')
				$edit  = $title.find('.tt-bj')
				$input = $title.find('input')
				if (mysohu.is_mine()) {
					$edit.show()
				}
			}
		})
		
		elAd.delegate('.tt-bj', 'click', function() {
			$show.hide()
			$input.show()[0].focus()
			$input.val($show.text())
		}).delegate('input', 'blur', function() {
			var val = $input.val()
			if (val === '') return;
			if (val.length > 20) {
				alert('标题不能超过20个字符')
				return
			}
			$.getJSON(upUrl, {desc: val}, function(obj) {
				if (obj.status == 0) {
					$show.html(val).show()
					$input.hide()
				} else {
					$.inform({
						icon: 'icon-error',
						delay: 2000,
						easyClose: true,
						content: '保存失败，稍后再试'
					})
				}
			})
		})
		
		// 统计，随时可能移除 因为部分DOM是ajax请求获取的，所以延迟待其获取后使用事件委托
		setTimeout(function() {
			$('.blog-article-insertad').delegate('.img, .info h4 a, .btn-qkk a', 'click', function() {
				mysohu.put_log('blog_ad_in')
			})
			$('.blog-article-ad', elAd).delegate('li a', 'click', function(e) {
				mysohu.put_log('blog_ad_out')
			})
		}, 2000)
	}
	
	setTimeout(insertAd, 1000)
})(jQuery);

// 博文中插入的音乐实现自动播放
(function() {
	function thisMovie(movieName) {
		if (jQuery.browser.msie) {
			return document.getElementById(movieName);
		} else {
			 return document[movieName];
		}
 	}
 	(function play(){
		setTimeout(function() {
			try {
				var blogContainer = document.getElementById('blogarticlefont');
				var id = blogContainer.getElementsByTagName('object')[0].id;
				movie = thisMovie(id);
				movie.musicPlay();
			} catch(e){
				play();
			}
		}, 2500);
 	})();
	
})();


