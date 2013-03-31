require("app::assistant::popup", "app::assistant::template", function(Popup, TMPL) {
	var prefix = "http://z.i.sohu.com/help/";
	var questions = [ [ "跟随和跟随者", {
		"什么是跟随和跟随者？" : prefix + "help5_1.html",
		"如何加跟随？" : prefix + "help5_2.html",
		"如何取消跟随" : prefix + "help5_3.html",
		"如何给跟随的人分组？" : prefix + "help5_4.html",
		"如何寻找感兴趣的人？" : prefix + "help5_5.html"
	} ], [ "微博服务", {
		"如何发微博？" : prefix + "help6_1.html",
		"如何在微博发图片？" : prefix + "help6_2.html",
		"如何在微博发视频？" : prefix + "help6_3.html",
		"微博@功能说明。" : prefix + "help6_4.html",
		"如何转发网友微博？" : prefix + "help6_5.html",
		"如何对微博进行评论？" : prefix + "help6_6.html"
	} ], [ "博客服务", {
		"如何发布一篇博客？" : prefix + "help7_1.html",
		"博客没写完，如何存为草稿？" : prefix + "help7_2.html",
		"如何在发表博客时插入图片？" : prefix + "help7_3.html",
		"如何修改博客？" : prefix + "help7_4.html",
		"如何删除博客？" : prefix + "help7_5.html",
		"如何新建分类？" : prefix + "help7_6.html",
		"如何修改和删除分类？" : prefix + "help7_7.html"
	} ], [ "相册服务", {
		"如何上传图片？" : prefix + "help8_1.html",
		"如何创建新专辑？" : prefix + "help8_2.html",
		"如何编辑和修改专辑？" : prefix + "help8_3.html",
		"如何删除专辑？" : prefix + "help8_4.html",
		"如何进行专辑排序？" : prefix + "help8_5.html",
		"如何编辑和修改图片描述？" : prefix + "help8_6.html",
		"如何进行图片排序？" : prefix + "help8_7.html",
		"如何删除图片？" : prefix + "help8_8.html",
		"上传图片支持的格式与大小？" : prefix + "help8_9.html"
	} ], [ "视频服务", {
		"如何上传视频？" : prefix + "help9_1.html",
		"新上传的视频多久能通过审核？" : prefix + "help9_2.html",
		"如何编辑和修改视频信息？" : prefix + "help9_3.html",
		"如何删除视频？" : prefix + "help9_4.html",
		"上传速度太慢，甚至没进度？" : prefix + "help9_5.html",
		"视频上传大小和格式说明？" : prefix + "help9_6.html"
	} ], [ "留言服务", {
		"如何给他人留言？" : prefix + "help10_1.html",
		"如何不让别人看见我的留言板？" : prefix + "help10_2.html",
		"不想让别人给我留言，怎么办？" : prefix + "help10_3.html",
		"在别人留言板的留言如何删除？" : prefix + "help10_4.html",
		"为什么别人看不到我的留言板？" : prefix + "help10_5.html",
		"为什么有的人我不能给他留言？" : prefix + "help10_6.html",
		"谁可以删除留言？" : prefix + "help10_7.html"
	} ], [ "资料和系统设置", {
		"如何设置个人资料？" : prefix + "help3_1.html",
		"什么是个性标签，怎么添加、管理？" : prefix + "help3_2.html",
		"如何限制别人查看我的部分资料？" : prefix + "help3_3.html",
		"为什么要设置收货地址？" : prefix + "help3_4.html",
		"如何进行隐私设置？" : prefix + "help3_5.html",
		"如何设置个性化的消息接收提示？" : prefix + "help3_6.html",
		"个人展示页个性域名设置要求？" : prefix + "help3_7.html",
		"如何进入个人展示页？" : prefix + "help3_8.html",
		"如何修改用户密码？" : prefix + "help3_9.html"
	} ], [ "皮肤和导航设置", {
		"如何更换皮肤？" : prefix + "help4_1.html",
		"如何使用和别人一样的皮肤？" : prefix + "help4_2.html",
		"导航条如何进行自定义排序？" : prefix + "help4_3.html"
	} ] ];
	define("app::assistant::plugins::help", function(self) {
		self.$log('help');
		var popup = new Popup({
			handle : self,
			className : 'help',
			content : TMPL.help({
				lord : self.setting.lord,
				questions : questions
			})
		});
		popup.autoPos();
		popup.bind(Popup.Collapse, function() {
			self.popup = null;
			self.setStatus();
		});

		popup.$body.bind('click', function(e) {
			var target = e.target;
			if (target.nodeName !== "A")
				return;
			if (target.className.indexOf('item') != -1) {
				var tmp = target.getAttribute("data-index");
				if (tmp === null)
					return;
				tmp = questions[tmp];
				popup.$body[0].children[0].className = "not-general";
				var html = [];
				popup.$body.find('.title').html(tmp[0]);
				tmp = tmp[1];
				for ( var k in tmp) {
					html.push('<li><a class="item" href="', tmp[k], '" target="_blank">', k, '</a></li>');
				}
				popup.$body.find('ul.not-general').html(html.join(''));
				popup.autoPos();
			} else if (target.className.indexOf('back') != -1) {
				self.$log('help_home');
				popup.$body[0].children[0].className = "general";
			}

		});
	});
});