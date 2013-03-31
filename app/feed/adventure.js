load('/i/qiyu/d/qiyu.css');
require("app::feed::render", "core::util[ajax]", "core::util::Ready", function(render, util, Ready, undefined) {
	var filter_html = function() {
		var types = [ 0, "全部", 'all', 1, "热门新闻", 'news', 2, "精选博客", 'blog', 3, "最热微博", 'tblog' ];
		var buf = [];
		for ( var i = 0; i < types.length; i += 3) {
			buf.push('<li data-tid="', types[i], '" action="type" data-logid="qiyu_', types[i + 2], '"><a href="javascript:;"><span>', types[i + 1], '</span></a></li>');
		}
		return buf.join('');
	}();
	var typeIndex = {
		mblog : 1,
		blog : 2,
		photo : 3,
		video : 4
	};
	var qiyu = {
		init : function(feedgroup, type) {
			feedgroup.qiyu = this;
			this.feedgroup = feedgroup;
			var feed = this.feed = feedgroup.feed;
			this.saved = {
				filter_html : feedgroup.$filter.html(),
				feed_reload : feed.reload,
				feed_load_earlier : feed.load_earlier
			};
			feedgroup.$filter.html(filter_html).addClass('i-adventure');
			feed.params.showtype = feedgroup.$filter.children().eq(type && typeIndex[type] || 0).addClass("current").attr('data-tid');
			feed.adventure = this;
			feed.statusNew.hide(); // 手动关闭新feed提示
			feed.reload = this.feed_reload;
			feed.load_earlier = this.feed_load_earlier;
			feed.addClass('qiyu-box');
			feed.iCard.options.onFollow = this.onFollow;
			feed.iCard.options.params.pageid = 31;
			// get data
			qiyu.feed.reload();
			util.ajax.getJSON("/a/adventure/hot-level/", function(ret) {
				if (ret.code != 0) {// TODO
					return;
				}
				qiyu.setLevel(ret.data);
			});
		},
		setLevel : function(data) {
			var arr = this.level = [ 0 ];
			for ( var i = 0; i < data.length; i++) {
				arr.push(Number(data[i].upper));
			}
			var levelHTMLs = [];
			var str = levelHTMLs[1] = '';
			for ( var i = 2; i <= arr.length; i++) {
				str += '<i class="icon icon-qiyu-fire"></i>';
				levelHTMLs[i] = str;
			}
			this.htmls = levelHTMLs;
			this.fillLevel();
		},
		feed_reload : function() {
			if (this.loading)
				return;
			this.params.st = 0;
			this.showStatus('loading').html('');
			render.resetRendered();
			qiyu.load({
				fresh : 1
			}, function(data) {
				qiyu.appendFeeds(data);
				if (data) {
					qiyu.feed.params.st += data.length;
				}
				qiyu.preload();
			});
		},
		feed_load_earlier : function() {
			qiyu.appendFeeds(qiyu.preloaded);
			this.params.st += qiyu.preloaded.length;
			qiyu.preload();
		},
		preload : function() {
			var self = this, feed = this.feed;
			feed.loading = true;
			this.load(null, function(data) {
				feed.loading = false;
				self.preloaded = data;
				feed.showStatus(data && data.length ? 'show_more' : feed[0].children.length ? 'no_more' : 'no_data');
				if (!feed[0].children.length) {
					$('.empty-words', feed.statusDom['no_data']).html(feed.params.showtype && feed.params.showtype != 0 ? "抱歉，该分类还没有什么发现，去其他的分类转转吧！" : "抱歉，暂时还没有什么发现，明天再来转转吧！");
				}
			});
		},
		getLevel : function(hot) {
			for ( var i = 1, arr = this.level, L = arr.length; i < L; i++) {
				if (hot < arr[i])
					break;
			}
			return i;
		},
		fillLevel : function() {
			this.feed.find('.feed-qiyu-icon').each(function() {
				this.innerHTML = qiyu.htmls[qiyu.getLevel(Number(this.getAttribute('data-hot')))];
			});
		},
		appendFeeds : function(data) {
			var feed = this.feed;
			if (data && data.length) {
				var feeds = [];
				for ( var i = 0, L = data.length || 0; i < L; i++) {
					var datai = data[i];
					datai.feed.adventure = {
						hot : datai.hotScores
					};
					feeds.push(datai.feed);
				}
				feed.push(feeds);
			}
			feed.fillInfo();
			qiyu.level && qiyu.fillLevel();
		},
		load : function(opts, callback) {
			if (this.loading)
				return;
			var self = this, feed = this.feed, params = feed.params;
			if (window.mysohu && mysohu.put_log) {
				mysohu.put_log('qiyu_loading');
			}
			util.ajax.postJSON("/a/adventure/hot-list/" + (params.showtype || 'all') + '/' + params.st + '/' + params.sz + '/', {
				fresh : opts && opts.fresh && 1 || 0
			}, function(ret) {
				self.loading = false;
				if (ret.code != 0) {
					feed.showStatus('no_data');
					$('.empty-words', feed.statusDom['no_data']).html('囧，加载出错啦，<a href="javascript:;" onclick="$(\'#feedlist\').trigger(\'i-feed-reload\');">重新试试吧</a>！');
					return;
				}
				callback(ret.data);
			});
			this.loading = true;
		},
		onFollow : function(data) {
			qiyu.feed.find('.app-friends-add[data-xpt="' + data.xpt + '"]').each(function() {
				this.className = "ui-btn btn-gray-h20 ui-btn-later";
				this.innerHTML = "<span>已跟随</span>";
			});
		},
		dispose : function() {
			var self = this.feedgroup, feed = this.feed, saved = this.saved;
			this.feedgroup.$filter.removeClass('i-adventure');
			self.hideGroups();
			self.activateTab(0);
			self.$filter.html(saved.filter_html);
			feed.reload = saved.feed_reload;
			feed.load_earlier = saved.feed_load_earlier;
			feed.removeClass('qiyu-box');
			feed.iCard.options.params.pageid = 32;
			feed.iCard.options.onFollow = null;
			feed.adventure = this.saved = this.feed = this.feedgroup = self.qiyu = null;
		}
	};
	define("app::feed::adventure.follow", function(e) {
		var xpt = e.actionTarget.getAttribute("data-xpt");
		util.ajax.getJSON('/a/app/friend/friend/add.do?from_type=adventure&xpt=' + xpt, function(ret) {
			if (ret.code == 1) {// success
				if ($.iCard && $.iCard.SetGroupsDialog) {
					var params = {
						'friendid' : ret.data.friendId,
						'nick' : e.actionTarget.getAttribute("data-nick"),
						'friendType' : ret.data.friendType,
						'xpt' : xpt
					};
					$.iCard.SetGroupsDialog.show(params);
					qiyu.onFollow(params);
				} else {
					require('core::ui::dialog::success', function($success) {
						$success('跟随成功');
					});
				}
				util.channel.broadcast("feed", "qiyu.reload");
			} else {
				require('core::ui::dialog::error', function($error) {
					$error(ret.msg);
				});
			}
		});
	});
	define("app::feed::adventure", qiyu);
});