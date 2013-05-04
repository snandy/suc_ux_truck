require(
'plugins::Template',
function(T) {
	define(
	'app::feed::common',
	T({
		"usericon" : '<div class="feed-pic"><a href="{{{ulink}}}" target="_blank" {{^xpt}}title="{{{unick}}}" {{/xpt}}{{#adventure}}data-logid="qiyu_profile"{{/adventure}}><img {{#xpt}} data-card-action="xpt={{{xpt}}}" data-card="true" {{/xpt}} alt="" src="{{{photo}}}" /> </a> {{#adventure}}<div class="feed-qiyu-follow"><span class="ui-btn btn-green-h20 app-friends-add" action="app::feed::adventure.follow" data-xpt="{{xpt}}" data-nick="{{unick}}" data-logid="qiyu_follow"> <span> <i class="ui-btn-icon"></i> 跟随</span></span></div>{{/adventure}}</div>',
		"username" : '<span class="username"><a data-card-action="xpt={{{xpt}}}" data-card="true" href="{{{ulink}}}" target="_blank" {{#adventure}}data-logid="qiyu_username"{{/adventure}}>{{{unick}}}</a></span>{{#isauth}}<i class="authentication-min" title="我的搜狐认证"></i>{{/isauth}}',
		"feed_behavior" : '<div class="item-behavior"><span class="feed-set" {{#showFwd}} name="FeedCount" data-appid="{{{appId}}}" data-itemid="{{{itemid}}}" data-xpt="{{{xpt}}}"{{/showFwd}}>{{#isMine}}<a href="javascript:;" action="{{{delAction}}}.delete" class="feed-delete" data-logid="{{{logpre}}}_delete">删除</a>{{/isMine}} {{#showFwd}}<a href="javascript:;" action="forward" data-logid="{{{logpre}}}_forward">转发</a><a href="javascript:;" action="feed.dig" class="zan-txt" data-logid="{{{logpre}}}_zan">赞</a><a href="javascript:;" action="app::discuss::discuss" data-logid="{{{logpre}}}_discuss">评论</a>{{/showFwd}}</span></div>',
		"ori_action" : '<span class="feed-set"><a action="ori_forward" href="javascript:;">原文转发{{#forwards}}({{{}}}){{/forwards}}</a> | <a href="{{{url}}}#comment" target="_blank">原文评论{{#comments}}({{}}){{/comments}}</a></span>',
		"item_info" : '<div class="item-info"><span class="feed-timestamp" data-logid="{{{logpre}}}_time"><i class="icon i-app"></i>{{#link}}<a href="{{{}}}" target="_blank">{{/link}}{{time_ago}}{{#link}}</a>{{/link}}</span>&nbsp;&nbsp;<span class="feed-from" data-logid="{{{logpre}}}_source">{{{from}}}</span> {{#adventure}}<span class="feed-qiyu-icon" data-hot="{{hot}}" title="精彩内容，尽在奇遇"></span>{{/adventure}}</div>',
		"photo" : '<div class="tblog-preview"><div class="preview-small"><a href="{{{ori}}}" target="_blank"><img alt="" title="查看大图" class="thumb-photo" {{#album}} data-album="{{}}" data-mine="{{isMine}}" {{/album}} src="{{{small}}}" action="preview_expand" onerror="this.onerror=null;this.src=\'{{{ori}}}\'" data-photo_ori="{{{ori}}}" data-photo_big="{{{big}}}" /></a> {{#album}}<span class="view-album"><i class="icon-arrow-right"></i> <a href="{{}}" target="_blank" data-logid="{{{logpre}}}_taphoto">去{{^isMine}}TA{{^}}我{{/isMine}}的相册看看</a></span>{{/album}}</div></div>',
		"video" : '<div class="tblog-preview"><div class="preview-small"><a class="thumb-video" href="{{{originalurl}}}" target="_blank" data-title="{{{title}}}" data-player="{{{flash}}}" action="video_expand"><i class="iMask"><b></b></i> <img width="130" border="0" src="{{{pic}}}" /></a></div></div>',
		"photo_video" : '<div class="tblog-preview"><div class="preview-small"><a href="{{{ori}}}" target="_blank"><img class="thumb-photo" src="{{{small}}}" {{#album}} data-album="{{}}" data-mine="{{isMine}}" {{/album}} action="preview_expand" data-photo_ori="{{{ori}}}" data-photo_big="{{{big}}}" /></a> <a class="thumb-video" href="{{{shorturl}}}" target="_blank" data-player="{{{flash}}}" data-title="{{{title}}}" action="video_expand"><i class="iMask"><b></b></i> <img width="130" border="0" src="{{{pic}}}" /></a></div></div>',
		"video_preview" : '<div class="preview-big"><div class="preview-command-text"><span class="img-away" action="preview_shrink">收起</span><i>|</i><span class="icon-video"></span><a href="{{{link}}}" target="_blank">{{{title}}}</a></div><div class="preview-big-video"><object width="{{{width}}}" height="{{{height}}}" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" style="display: block; width: 450px;"><param value="true" name="allowFullScreen" /><param name="wmode" value="transparent" /><param value="flag=s&isAutoPlay=true&autoPlay=true" name="flashvars" /><param value="{{{flash}}}" name="movie" />{{#notIE}}<object type="application/x-shockwave-flash" data="{{{flash}}}" width="{{{width}}}" height="{{{height}}}"><param name="movie" value="{{{flash}}}" /><param name="wmode" value="transparent" /><param value="flag=s&isAutoPlay=true&autoPlay=true" name="flashvars" /></object>{{/notIE}}</object></div></div>',
		"photo_preview" : '<div class="preview-big"><div class="preview-command-text">{{#album}}<span class="view-album-big"><i class="btn-insert-picture"></i><a href="{{}}" target="_blank">去{{^isMine}}TA{{^}}我{{/isMine}}的相册看看</a></span>{{/album}}<span class="img-away" action="preview_shrink" pid="{{{pid}}}">收起</span><i>|</i><span class="img-source"><a href="{{{ori}}}" target="_blank">查看原图</a></span><i>|</i><span class="img-left-rotation" action="preview_rotleft" pid="{{{pid}}}">向左转</span><span class="img-right-rotation" action="preview_rotright" pid="{{{pid}}}">向右转</span></div><div class="preview-big-picture"><img alt="" title="收起" src="{{{src}}}" id="{{{pid}}}" style="display: none" /></div></div>',
		"video_noflash" : '<div class="preview-noflash" style="text-align: center; padding: 2em"><div><a target="_blank" href="http://www.adobe.com/go/getflashplayer"><img src="http://s3.suc.itc.cn/i/home/d/flash-ico.jpg"></a></div><div><a target="_blank" href="http://www.adobe.com/go/getflashplayer">没有安装Flash，点击下载&gt;&gt;</a></div></div>',
		"vote" : '<div class="mod-body"><p><a class="feed-app-img" href="{{{url}}}" target="_blank"><img src="http://s2.suc.itc.cn/i/home/d/icon_t.gif"></a></p></div>',
		"showClose" : '{{^adventure}} {{#}}<div class="close"><a href="javascript:;" action="feed.hide" data-id="{{id}}" title="隐藏这条新鲜事" data-logid=""><span>x</span></a></div>{{/}} {{^}}<div class="close"><a href="javascript:;" action="feed.read" data-id="{{id}}" title="已阅" data-logid="qiyu_recread"><span>x</span></a></div>{{/adventure}}',
		"feed_data" : ' data-id="{{{id}}}" data-xpt="{{{xpt}}}" data-from="{{{data_from}}}" data-appid="{{{appId}}}" data-unick="{{{unick}}}" data-usname="{{{usname}}}" data-ulink="{{{ulink}}}" data-itemid="{{{itemid}}}" data-link="{{{link}}}" data-title="{{title}}" data-content="{{content}}" data-time="{{{time}}}"{{#original}} data-orixpt="{{{xpt}}}" data-oriulink="{{{ulink}}}" data-oriappid="{{{appId}}}" data-oriunick="{{{unick}}}" data-oriurl="{{{url}}}" data-orititle="{{title}}" data-oricontent="{{content}}" data-oriid="{{{id}}}" data-oriitemid="{{{itemid}}}"{{/original}}'
	}));
});
