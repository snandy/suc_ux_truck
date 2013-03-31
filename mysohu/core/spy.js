/**
 * Spy 组件，作为统筹所有通知数字接口的封装，提供透明的数字读取、自动更新实现
 */
require("core::util[ajax,channel,cookie]", "core::Watchdog", function(util, Watchdog) {
	var xpt = window.$space_config && $space_config._xpt;

	var spy = {
		/**
		 * 获取跟随者数，当新跟随者数字发生改变时会调用回调函数
		 * 
		 * @param callback
		 *            回调函数，将赋予两个参数：我跟随的人数，我的跟随者数
		 */
		getFollows : function(callback) {
			contexts.follow.add(callback);
		},
		getNewFollowers : function(callback) {
			contexts.newFollower.add(callback);
		},
		/**
		 * 获取新评论数、微博通知数
		 * 
		 * @param callback
		 *            回调函数，赋予两个参数：评论数，微博通知数
		 */
		getNewCount : function(callback) {
			contexts.newCount.add(callback);
		},
		getMailCount : function(callback) {
			contexts.mail.add(callback);
		},
		getFeeds : function(callback) {
			contexts.feeds.add(callback);
		},
		getVisits : function(callback) {
			contexts.visit.add(callback);
		},
		getMedals : function(callback) {
			contexts.medal.add(callback);
		},
		/**
		 * 获取系统消息数
		 * 
		 * @param callback
		 *            回调函数，赋予三个参数：通知、请求、系统消息
		 */
		getMessages : function(callback) {
			contexts.message.add(callback);
		},
		getWhisper : function(callback) {
			contexts.whisper.add(callback);
		},
		checkFeed : function(callback) {
			contexts.newfeed.add(callback);
			return contexts.newfeed.dog;
		},
		remove : function(callback) {
			callback.spyqueue = callback.spyn = callback.spyqueue[callback.spyn] = undefined;
		},
		setQuestReady : function(quests) {
			contexts.quest.onLoad(quests);
		},
		getQuestReady : function(callback) {
			contexts.quest.add(callback);
		},
		getEvent : function(callback) {
			contexts.event.add(callback);
		}
	};

	var contexts = {};
	var channel = util.channel.createContext("spy", function(type, e) {
		contexts[type] && contexts[type].onData(e.data);
	});

	function Context(id, opts) {
		this.id = id;
		opts && util.probe(opts, this);
		contexts[this.id] = this;
	}
	Context.prototype = {
		id : '',
		autoLoad : true,
		timeout : 60000,
		autoReload : false,
		useChannel : true,
		useXpt : false,
		init : function() {
			if (this.timeout)
				this.dog = new Watchdog({
					context : this,
					useChannel : this.useChannel,
					id : 'spy.' + this.id,
					timeout : this.timeout,
					onTimeout : function() {
						this.pauseAll();
						this.context.getData(this.context);
					}
				});
		},
		add : function(callback) {
			if (callback.spyqueue)
				throw "Can't add a same callback fun to spy system twice.";
			if (!this.callback) {
				this.init();
				callback.spyqueue = this.callbacks = [ callback ];
				this.autoLoad && this.getData(this);
				callback.spyn = 0;
			} else {
				callback.spyn = this.callbacks.length;
				(callback.spyqueue = this.callbacks).push(callback);
			}
			if (this.data) {// already loaded
				if (this.dog && this.dog.isTimeout()) {// data expired
					this.getData(this);
				} else
					callback.apply(this, this.getArgs(this.data));
			}
		},
		getData : function(self) {
			// will trigger onData on data load
		},
		onLoad : function(data) {
			if (this.dog) {
				if (this.autoReload)
					this.dog.resetAll();
				else
					this.dog.stopAll();
			}
			this.useChannel && channel.broadcast(this.id, data, this.useXpt && xpt);
			this.onData(data);
		},
		onData : function(data) {
			this.data = data;
			util.each(this.callbacks, this.getArgs(data));
		},
		getArgs : function(data) {
			return [ data ];
		}
	};

	new Context("newFollower", {
		getData : function(self) {
			util.ajax.jsonp("http://uis.i.sohu.com/fans/getaddcount.do", function(ret) {
				if(ret) ret.status == 0 && self.onLoad(ret.data.count < 0 ? 0 : ret.data.count);
			});
		}
	});
	new Context("follow", {
		useXpt : true,
		getData : function(self) {
			util.ajax.getJSON("/a/app/friend/friend/count.do?xpt=" + xpt, function(ret) {
				ret.code == 1 && self.onLoad(ret.data);
			});
		},
		getArgs : function(data) {
			return [ data.friendCount, data.fansCount, data.isAtted ];
		}
	});

	new Context("newCount", {
		getData : function(self) {
			util.ajax.getJSON("/a/app/discuss/newcount.htm", function(ret) {
				self.onLoad(ret);
			});
		},
		getArgs : function(data) {
			return [ data.newcommentcount, data.newreferedcount ];
		}
	});

	new Context('message', {
		autoReload : true,
		getData : function(self) {
			util.ajax.getJSON("/a/request/home/toolbar/fetchCount.htm?xpt=" + util.cookie.xpt, function(ret) {
				if(ret) ret.status == 1 && self.onLoad(ret.data);
			});
		},
		getArgs : function(data) {
			return [ data.inform, data.request, data.sys_msg ];
		}
	});

	new Context('whisper', {
		autoReload : true,
		getData : function(self) {
			util.ajax.jsonp('http://' + (typeof dev === "undefined" ? 'd' : 'ndev')
			+ '.me.sohu.com/operations?productid=isohu&type=getUnreadMsgCount&magicCode=' + $space_config.magic, function(ret) {
				if(ret) ret.status && self.onLoad(parseInt(ret.msg));
			});
		}
	});

	new Context('mail', {
		autoReload : true,
		getData : function(self) {
			util.ajax.jsonp("http://register.mail.sohu.com/servlet/getUnreadMailCountServlet", function(ret) {
				self.onLoad(ret);
			});
		}
	});
	new Context('medal', {
		useXpt : true,
		getData : function(self) {
			util.ajax.jsonp("http://api.ums.sohu.com/sur/summary.json?xpt=" + xpt, function(ret) {
				if(ret) ret.status == 0 && self.onLoad(ret.data);
			});
		},
		getArgs : function(data) {
			return [ data.level, data.score, data.medal ,data.virtual];
		}
	});
	new Context('feeds', {
		useXpt : true,
		getData : function(self) {
			util.ajax.getJSON("/a/newsfeed/newsnum?pp=" + xpt, function(ret) {
				if(ret) ret.status == 0 && self.onLoad(ret.newsnum);
			});
		}
	});
	new Context('visit', {
		timeout : false,
		useChannel : false,
		getData : function(self) {
			util.ajax.jsonp("http://stat.i.sohu.com/guest/count/count.do?type=0&xpt=" + xpt, function(ret) {
				self.onLoad(ret.count);
			});
		}
	});

	new Context('newfeed', {
		autoLoad : false,
		timeout : 30000,
		getData : function(self) {
			util.ajax.getJSON("/a/newsfeed/notify?pp=" + util.cookie.xpt, function(ret) {
				if (ret.isNewFeedArrived) {
					self.onLoad();
				} else {
					self.dog.resetAll();
				}
			});
		}
	});

	new Context('event', {
		timeout : 180000, // every 3 minutes
		autoReload : true,
		getData : function(self) {
			util.ajax.getJSON("/a/assistant/majorEvents", function(ret) {
				ret.code == 0 && self.onLoad(ret.data);
			});
		}
	});
	new Context('quest', {
		autoLoad : false,
		timeout : false
	});

	mysohu.spy = spy;
	define("core::spy", spy);
});
