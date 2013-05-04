require(
'plugins::Template',
function(T) {
	define(
	'app::discuss::template',
	T({
		"layout" : '<div class="mod-extend emote-handler page-handler comment-box"><div class="public-remark"><span class="flake-top-icon"></span><div class="flake-body"><div class="post-mini"><div class="emotion-list"></div><div class="pm-reply-box">{{+usericon}}<div class="pm-reply-con"><div class="pm-reply-fields"><textarea rows="2"></textarea></div><div class="pm-reply-options"><div class="btn-submit"><a href="javascript:;" action="app::discuss::discuss.post"><span class="ui-btn"><span>评论</span></span></a></div><div class="pub-faces"><a href="javascript:;" action="emote"><span class="btn-emot"></span></a><span><span class="txt-number-now">0 / {{chars}}</span><span></span></span></div><div class="post-options">{{^hideFwd}}<p><label> <input type="checkbox"> 同时转发</label></p>{{/hideFwd}} {{#origin}}<p><label> <input type="checkbox"> 同时评论给</label>{{+username}}</p>{{/origin}}</div></div></div></div><div class="comment-list-conn"><div class="pm-list"><ul></ul><div class="show-total"></div></div></div></div></div></div></div>',
		"show_total" : '<a href="{{link}}#comment" target="_blank">还有{{count}}条你没看哦~点开看看</a>',
		"no_more" : '<li class="replaceme">没有更多啦~</li>',
		"content" : [
      '<li class="hijackdata" data-nick="{{unick}}" data-sname="{{sname}}" data-xpt="{{xpt}}" data-replytodiscussid="{{id}}">',
      '  <div class="feed-pic share-pic"><a href="{{ulink}}" target="_blank"><img data-card-action="xpt={{xpt}}" data-card="true" alt="" src="{{uavatar}}"></a></div>',
      '  <div class="share-con">',
      '    <div class="mod-head">{{+username}}<span class="user-suffix"> </span>{{{content}}}</div>',
      '    <div class="mod-foot"><span class="feed-set"> {{#showDelete}}<a href="javascript:;" action="discuss.delete">删除</a>{{/showDelete}} <a action="app::discuss::discuss.replyto" href="javascript:;">回复</a></span><span class="feed-timestamp">{{time_ago}}</span></div>',
      '  </div>',
      '</li>'
    ].join('')
	}));
});
