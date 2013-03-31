/**
 * @fileOverview feed相关的初始化、绘制、交互代码
 * @author Kyriosli
 */
// pre render feed
adventure = location.hash.match(/adventure(?:\.(\w+))?/);
if (window.feeds_data && !adventure) {
  require('core::timeUtil', 'app::feed::render', '#feedlist', function(timeUtil, render, feedlist) {
    feeds_data.news || (feeds_data.news = []);
    timeUtil.setServerTime(feeds_data.now);
    feedlist.innerHTML = render(feeds_data.news);
  });
}
require('core::util[ajax,channel,cookie,fx]', 'app::feed::render', 'core::timeUtil', 'core::util::jQuery', 'app::feed::template', 'app::feed::template.hint', 'plugins::hijacker', function(util, render, timeUtil, $, FEED, HINT, hijacker) {
  var defaults = {
    url: '',
    feed_list: 'div#feedlist',
    feed_state: '',
    status_show_more: '#show_more_feed',
    status_loading: '#home_wait_feed',
    status_no_more: '#feed_no_more',
    status_no_data: '#feed_no_data',
    status_new: '#feed_state_new',
    imgWidth: 450,
    checkTimeout: 28,
    auto_expand: true
  };
  var loadParams = {
    pp: $space_config._xpt,
    st: 0,
    sz: 20
  };
  /**
   * @constructor Feed
   * @extends $.fn.init
   *
   * @param options
   *            可选项
   */

  function Feed(options) {
    this.options = util.probe(defaults, options);
    this.appId = window.$space_config && $space_config._currentApp;
  }
  Feed.RELOAD = 'i-feed-reload';
  Feed.DELETE = 'i-feed-delete';
  Feed.prototype = new $.fn.init();
  util.probe({
    /**
     * @function init
     * @description 完成feed的初始化及事件绑定等
     */
    init: function(params) { // 初始化feed，绑定事件，加载feed
      var self = Feed.instance = this;
      var options = this.options;
      this.params = util.probe(loadParams, params);
      this.length = 1;
      this[0] = $(options.feed_list)[0];
      hijacker.hijackthis(this);
      // listen to reload event
      this.bind(Feed.RELOAD, _reload);
      options.btn_reload && $(options.btn_reload).click(_reload);
      $.iCard && (this.iCard = new $.iCard({
        params: {
          type: 'simple',
          pageid: 32
        },
        bindElement: this
      }));
      this.statusDom = {
        loading: $.find(options.status_loading)[0],
        no_more: $.find(options.status_no_more)[0],
        no_data: $.find(options.status_no_data)[0],
        show_more: $.find(options.status_show_more)[0]
      };
      $(this.statusDom.show_more).click(function() {
        self.load_earlier();
      });
      this.screens = 0;
      options.dontCheck || this.init_checkFeed();
      util.channel.listen('feed', 'push', function(evt) {
        var data = evt.data;
        // 判断是否插入
        if (self.appId === 'home' && !self.adventure || self.appId === 'mblog' && (data.type === 0 || data.type === 35) && $space_config._xpt === util.cookie.xpt || self.appId === 'index' && $space_config._xpt === util.cookie.xpt) self.push(evt.data, 'head');
      });
      if (!adventure) {
        if (window.feeds_data) {
          var tmp = window.feeds_data;
          window.feeds_data = undefined;
          this.postProcess(tmp);
          this.options.checkNewAcc && this.checkNewAcc();
        } else {
          this.reload();
        }
      }
      options.auto_expand && this.autoExpand();
      // 鼠标移入移出事件
      this.bind('mouseover', function(e) {
        if (e.target === self[0]) return;
        var entered = self.findChild(e.target);
        if (!entered || !entered.children.length) return;
        if (util.hasClassName(entered, 'hover')) return;
        util.addClassName(entered, 'hover');
        if (util.hasClassName(entered.children[0], "feed-forward-photos")) {
          var anchor = $.find('.pic a', entered)[0];
          if (anchor.style.height && anchor.children.length > 3) {
            anchor.style.height = "";
          }
        }
      }).bind('mouseout', function(e) {
        if (e.target === self[0]) return;
        var entered = self.findChild(e.relatedTarget),
          left = self.findChild(e.target);
        if (entered === left || !left) return;
        util.removeClassName(left, 'hover');
        if (util.hasClassName(left.children[0], "feed-forward-photos")) {
          var anchor = $.find('.pic a', left)[0];
          if (!anchor.style.height && $.find('.comment-box', left).length == 0) {
            anchor.style.height = "149px";
          }
        }
      });
      return this;

      function _reload(e) {
        e && e.preventDefault();
        self.reload();
      }
    },
    checkNewAcc: function() {
      var self = this;
      util.ajax.getJSON('/api/isnewacc.do', function(ret) {
        ret.status == 0 && ret.isnew != 0 && self.prepend(FEED.newAcc());
      });
    },
    autoExpand: function() {
      var self = this;
      setTimeout(function() {
        $(window).bind('scroll', expandTrigger);
      }, 2000);
      this.bind(Feed.DELETE, expandTrigger);

      function expandTrigger() {
        if (self.screens >= 5 || self.loading || self.statusDom.show_more.style.display == 'none') return;
        var topNow = util.wndTop() + $(window).height(),
          bottomFeed = $(self.statusDom.show_more).position().top;
        if (bottomFeed - topNow < 50) {
          self.load_earlier();
        }
      }
    },
    findChild: function(em) {
      while (em) {
        var parent = em.parentNode;
        if (parent == this[0]) break;
        em = parent;
      }
      return em && (em.firstElementChild || em.firstChild);
    },
    /**
     * @function getHint
     * @description 获取提示文案
     * @param type
     *            empty,
     */
    getHint: function(type) {
      var ret = HINT[type];
      type += '_' + (util.cookie.isMine ? this.appId == 'index' ? 'mine' : 'all' : 'other');
      HINT[type] && (ret = HINT[type]);
      type += '_' + (this.appId);
      HINT[type] && (ret = HINT[type]);
      if (this.appId === 'home' || this.appId === 'mblog') {
        type += '_' + (this.params.gid === '-2' ? 'all' : 'group') + '_' + ['all', 'origin', 'photo', 'video', 'all'][this.params.showtype || 0];
        HINT[type] && (ret = HINT[type]);
      }
      return ret();
    },
    setParam: function(name, value) { // 设置加载参数
      if ((typeof name) === 'object') {
        for (var k in name) {
          this.params[k] = name[k];
        }
      } else if (arguments.length === 2) {
        if (this.params[name] != value) {
          reload = true;
          this.params[name] = value;
        }
      }
      this.reload();
    },
    init_checkFeed: function() { // 检查新消息
      this.init_checkFeed = null;
      this.statusNew = $(this.options.status_new);
      if (!this.statusNew.length) {
        return;
      }
      var self = this;
      this.statusNew.html(this.getHint('newfeed'));
      if (mysohu.appId == 'home') {
        this.statusNew.click(function(e) {
          e.preventDefault();
          // 加载新的消息
          self.statusNew.fadeOut();
          if (self.loading) return;
          if (self.adventure) {
            self.adventure.dispose();
            self.reload();
          } else {
            self.checkDog && self.checkDog.resetAll();
            self.load({
              url: '/a/newsfeed/getnew',
              params: util.probe(self.params, {
                maxid: self.maxid
              }),
              onComplete: self.loadComplete_insert
            });
          }
          if (util.wndTop() > 235) window.scrollTo(0, 235);
        });
      }
      require("core::spy", function(spy) {
        self.checkDog = spy.checkFeed(function() {
          if (self.adventure) {
            return;
          }
          if (util.ie !== 6 && util.wndTop() > 235) {
            self.statusNew.addClass('fixed');
            setTimeout(function() {
              self.statusNew.removeClass('fixed');
            }, 6000);
          }
          self.statusNew.fadeIn();
        });
      });
    },
    showStatus: function(status) { // 切换状态
      for (var k in this.statusDom) {
        this.statusDom[k].style.display = k === status ? 'block' : 'none';
      }
      var current = this.statusDom[status];
      if (status === 'no_more') {
        current.innerHTML = this.getHint(this.adventure ? "nomore" : this.appId == 'home' ? 'nomore_qiyu_home' : "nomore_qiyu");
      } else if (status === 'no_data') {
        current.innerHTML = this.getHint("empty");
      } else if (status === 'show_more') {
        current.innerHTML = this.getHint("more");
      }
      return this;
    },
    reload: function() { // 刷新feed
      this.statusNew && this.statusNew.fadeOut();
      self.checkDog && self.checkDog.resetAll();
      if (this.loading) return;
      this.screens = 0;
      this.nextStart = 0;
      this.minid = '';
      render.resetRendered();
      this.html('');
      this.load_earlier();
    },
    load_earlier: function() { // 加载之前的feed
      if (this.loading) return;
      this.showStatus('loading');
      this.load({
        url: this.options.url,
        params: util.probe(this.params, {
          st: this.nextStart,
          minid: this.minid
        }),
        onComplete: this.loadComplete_append
      });
    },
    load: function(options) {
      if (this.loading) return;
      this.loading = true;
      var self = this;
      util.ajax({
        method: 'GET',
        url: options.url,
        vars: options.params,
        retries: 3,
        type: 'json',
        success: function(json) {
          self.loading = false;
          if (json.status != 0) {
            self.showStatus('show_more');
            return;
          }
          self.checkDog && self.checkDog.resetAll();
          options.onComplete.call(self, json);
          if (self.isFirstLoad) {
            self.isFirstLoad = false;
            self.options.checkNewAcc && self.checkNewAcc();
          }
        },
        error: function() {
          self.loading = false;
          self.showStatus('no_data');
          $('.empty-words', self.statusDom['no_data']).html(
            '囧，加载出错啦，<a href="javascript:;" onclick="$(\'#feedlist\').trigger(\'i-feed-reload\');">重新试试吧</a>！');
        }
      });
    },
    loadComplete_insert: function(data) { // 加载完成后回调：插入到头部
      if (data.isFlush) {
        this.minid = this.maxid = '';
        this.html('');
        this.nextStart = data.news.length;
        render.resetRendered();
        this.screens = 0;
        this.loadComplete_append(data);
      } else {
        timeUtil.setServerTime(data.now);
        this.push(data.news, 'head');
        this.fillInfo();
        if (data.news && data.news.length) {
          this.maxid = Math.max(this.maxid || 0, parseInt(data.news[0].id));
        }
      }
    },
    loadComplete_append: function(data) { // 加载完成后回调：追加到尾部
      this.screens++;
      timeUtil.setServerTime(data.now);
      if (!data.news || !data.news.length) {
        this.showStatus(this[0].children.length ? 'no_more' : 'no_data');
        if (!this.nextStart) this.hide();
        return;
      }
      this.push(data.news, 'tail');
      this.postProcess(data);
    },
    postProcess: function(data) {
      if (this.nextStart === data.nextStart) data.nextStart = -1;
      this.showStatus(data.nextStart == -1 ? this[0].children.length ? 'no_more' : 'no_data' : 'show_more');
      this.nextStart = data.nextStart;
      if (data.news.length) {
        this.minid = Math.min(this.minid || 2147483647, data.news[data.news.length - 1].id);
        this.maxid = Math.max(this.maxid || 0, parseInt(data.news[0].id));
      }
      this.fillInfo();
    },
    push: function(arr, pos) { // 插入新feed
      if (!arr) return;
      var isArr = $.isArray(arr);
      var fragment = render(isArr ? arr : [arr], isArr && (pos === 'head' ? 'tail' : this.maxid));
      this.show();
      if (pos === 'head') {
        this.prepend(fragment);
      } else {
        this.append(fragment);
      }
    },
    /**
     * 回填用户头像和昵称、评论转发数、赞数
     *
     */
    fillInfo: function() {
      fillNicks(this.find('[name=BlogUser]'));
      fillCount(this.find('span[name="FeedCount"]'));
      fillComments(this.find('a[name="CommentDiscuss"]'));
      fillThemes(this.find('.feed-theme-name'));
    }
  }, Feed.prototype);
  Feed.userData = {};
  define('app::feed', Feed);
  /**
   * 回填我来说两句评论数
   */

  function fillComments(comments) {
    for (var i = 0, L = comments.length, toGet = new Array(L), sum = 0; i < L; i++) {
      comments[i].removeAttribute("name");
      var id = parseInt(comments[i].getAttribute("data-replyid"));
      toGet[i] = id;
      sum += id;
    }
    var valName = "jsonp" + (sum % 0x7FFFF);
    util.ajax.jsonp('http://comment4.news.sohu.com/direct/cmt_get_reply_count.json?ids=' + toGet.join(), function(data) {
      if (!data) return;
      for (var i = 0, L = comments.length; i < L; i++) {
        var node = comments[i],
          id = node.getAttribute('data-replyid'),
          did = data[id];
        util.refreshCount(node, did || 0);
      }
    }, true, valName);
  }
  /**
   * 回填feed转发、评论、赞数
   */

  function fillCount(spans) {
    var toGet = [],
      toGet2 = [],
      digs = {};
    spans.each(function() {
      this.removeAttribute("name");
      var aid = this.getAttribute("data-appid"),
        type = aid == 'photo' ? 7 : aid == 'album' ? 8 : 0;
      aid += "_" + this.getAttribute("data-itemid");
      toGet.push(aid);
      toGet2.push(aid);
      digs[aid] = this.children[this.children.length - 2];
    });
    util.ajax.jsonp('http://cc.i.sohu.com/a/app/counts/get.htm?ids=' + toGet.join(), function(data) {
      spans.each(function() {
        var id = this.getAttribute("data-itemid"),
          did = data[id];
        if (did) {
          var childs = this.children,
            count = childs.length;
          did.spreadcount && util.refreshCount(childs[count - 3], did.spreadcount);
          did.commentcount && util.refreshCount(childs[count - 1], did.commentcount);
        }
      });
    }, false);
    // });
    util.ajax.postJSON('/a/dig/diginfo', {
      targets: toGet2.join()
    }, function(data) {
      if (data.status != 0) return;
      for (var i = 0, L = data.digInfo.length; i < L; i++) {
        var info = data.digInfo[i],
          dig = digs[info.key];
        if (info.num) {
          if (info.pInfo && info.pInfo.length) {
            dig.innerHTML = '<span><i class="up-trigon"></i></span>赞(' + info.num + ')';
            var html = ['<div class="zan"><div class="inner-zan"><span><i class="ico-zan"></i></span>'];
            if (info.isDig) {
              html.push('我和');
            }
            for (var j = 0, K = info.pInfo.length; j < K; j++) {
              var p = info.pInfo[j];
              j && html.push('，');
              html.push('<a href="', p.ulink, '" target="_blank">', p.unick, '</a>');
            }
            if (K < info.num) {
              html.push('等', info.num, '人');
            }
            html.push('觉得这个很赞</div></div>');
            $(dig).closest('.feed-box').append(html.join(''));
          } else {
            util.refreshCount(dig, info.num);
          }
        }
      }
    });
  }
  /**
   * 回填换肤feed的标题
   */

  function fillThemes(nodes) {
    require('app::widgets::theme', function(theme) {
      nodes.each(function() {
        this.className = "";
        var id = this.getAttribute("data-themeid"),
          t = theme.getTheme(id);
        if (t) {
          if (t.group.isCustom) {
            this.innerHTML += "(" + t.title + "色)";
          } else {
            this.innerHTML = t.title + "(" + t.group.title + ")";
          }
        } else {
          Feed.instance[0].removeChild(Feed.instance.findChild(this).parentNode);
        }
      });
    });
  }
  /**
   * 回填分享的昵称
   */

  function fillNicks(nodes) {
    if (nodes.length) {
      var toGet = {}, arr = [];
      nodes.each(function() {
        var xpt = this.getAttribute("data-card-action");
        xpt = /^xpt=/.test(xpt) ? xpt.substr(4) : null;
        if (xpt && !Feed.userData[xpt] && !toGet[xpt]) {
          toGet[xpt] = true;
          arr.push(xpt);
        }
      });
      if (arr.length) {
        // read and fill
        util.ajax.postJSON('/api/accountinfo.do', {
          xp: arr.join(','),
          method: "getAccounts"
        }, fill);
      } else {
        fill();
      }
    }

    function fill(data) {
      data && util.probe(data, Feed.userData);
      nodes.each(function() {
        var self = $(this),
          xpt = this.getAttribute("data-card-action").substr(4);
        var uData = Feed.userData[xpt];
        if (!uData) {
          return; // should never happen
        }
        var blogexp = self.attr("data-blogexp");
        if (blogexp) {
          if (blogexp.indexOf("@innerHTML") != -1) self.html(uData.title);
          if (blogexp.indexOf("@href") != -1) {
            self.attr('href', uData.url || ('http://i.sohu.com/p/' + xpt));
          }
        }
        var $img = self.find('img');
        if ($img.length == 1) {
          blogexp = $img.attr("data-blogexp");
          if (blogexp) {
            if (blogexp.indexOf("@src") != -1) {
              $img.attr("src", uData.ico);
            }
            if (blogexp.indexOf("@alt") != -1) {
              $img.attr("alt", uData.title);
            }
            if (blogexp.indexOf("@title") != -1) {
              $img.attr("title", uData.title);
            }
          }
        }
      });
    }
  }
});
// init feed
require('app::feed', '#feedlist', function(Feed, feedlist) {
  var appId = mysohu.appId;
  var params = {};
  if (appId === 'home' || appId === 'mblog') params.gid = -2;
  if (appId != 'home' && appId != 'index') params.app = appId === 'mblog' ? 'miniblog' : appId === 'album' ? 'photo' : appId;
  new Feed({
    url: appId == 'home' ? '/a/newsfeed/message' : appId == 'refer' ? '/a/app/mblog/refered/list.htm' : appId == 'index' ? '/a/newsfeed/pshow' : '/a/newsfeed/appfeedlist',
    checkNewAcc: appId === 'home',
    feed_list: feedlist,
    btn_reload: "#feed_reload",
    dontCheck: appId == 'refer'
  }).init(params);
  if (appId === "home" || appId === "mblog") {
    require('app::feed::feedgroup', function(feedgroup) {
      feedgroup.init(null, Feed.instance);
      if (adventure) feedgroup.initQiyu(adventure[1]);
    });
  }
});
