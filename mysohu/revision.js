// mysohu trunk
dev = true;
load.repos.macros = {
	'global-style' : [ '/d/reset.css', '/d/global.css', '/d/rightbar.css', '/d/common-remark.css', '/d/404/mysohu-error.css',
		'/i/card/d/card.css', '/themes/d/theme.css', '/themes/default/style.css' ],
	'widgets' : [ {
		later : true
	}, '/app/widgets/template.js', '/app/widgets/theme.js', '/app/widgets/backTop.js' ],
	'base' : [ '/mysohu/base/base64.js', '/mysohu/base/passport.js', '/mysohu/plugins/jquery.cookie.js', "/mysohu/mysohu.js",
		"/mysohu/core/util.js", "/mysohu/core/util/fx.js", "/mysohu/core/util/ajax.js", "/mysohu/core/util/channel.js",
		"/mysohu/core/util/cookie.js", "/mysohu/core/util/userData.js", "/mysohu/core/timeUtil.js",
		'/mysohu/core/Watchdog.js,/mysohu/core/spy.js', '/i/card/jquery.icard.js' ],
	'feed' : [ '/mysohu/plugins/Template.js', '/app/feed/template.js', '/app/feed/common.js', '/app/emote/emote.js',
		'/mysohu/core/stringUtil.js', '/app/feed/render.js', '/app/feed/feed.js', '/i/home/d/feed.css' ],
	'tblogeditor' : [ {
		later : true
	}, '/mysohu/tblogeditor/d/photo_upload.css', '/mysohu/at/d/at.css', '/mysohu/plugins/swfupload/swfupload.js',
		'/mysohu/plugins/jquery.textbox.js', '/mysohu/tblogeditor/photo.js', '/mysohu/tblogeditor/editor.js', '/mysohu/gold.js' ],
	'webim' : [ {
		repo : "other",
		name : "sohuwebim",
		charset : "utf-8",
		type : "text/javascript",
		later : true
	}, "http://a1.itc.cn/webim/nc/topname.test.js?productid=isohu" ],
	'dialog' : [ {
		later : true
	}, '/mysohu/plugins/ibutton/jquery.ibutton.js', '/mysohu/plugins/ibutton/space/ibutton.css',
		'/mysohu/plugins/dialog/jquery.dialog.js', '/mysohu/plugins/ishadow/jquery.ishadow.js',
		'/mysohu/plugins/box/jquery.box.js', '/mysohu/plugins/scrollbarwidth/jquery.scrollbarwidth.js',
		'/mysohu/plugins/dialog/space/dialog.css' ],
	'ppdialog' : [ '/mysohu/plugins/ppdialog/default/ppdialog.css,/mysohu/plugins/ppdialog/jquery.ppdialog.js' ],
	'mblog_share' : [ '/d/reset.css', '/d/global.css', '/i/home/d/sentence.css', '/d/share/share.css', '/mysohu/mysohu.js',
		'/mysohu/conf/share.js' ],
	'search' : [ '/mysohu/area.js', '/search/core.js', '/i/card/jquery.icard.js,/i/card/d/card.css' ]
};
load.repos.s3.init("");