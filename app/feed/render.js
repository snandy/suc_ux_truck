require(
	'core::util[cookie]',
	'app::feed::template',
	'app::feed::common',
	'core::stringUtil',
	'core::timeUtil',
	function(util, FEED, COMMON, stringUtil, timeUtil, undefined) {
		// 在@提到我的等页面，不显示隐藏feed按钮
		var dontShowClose = $space_config._currentApp === 'refer';
		/**
		 * @constant 默认的头像链接
		 */
		var defaultIcon = 'http://js3.pp.sohu.com.cn/ppp/blog/images/common/nobody.gif';
		/**
		 * @constant feed类型的可读名字
		 */
		var types = [ 'sentence', 'blog', 'add_friend', 'upload_photo', 'upload_video', 'change_template', 'add_moudle', 'create_group', 'group_thread', 'add_page', 'ground_thread', 'add_group', 'edit_profile', 'pub_dynamic_album', 'favorite_album',
			'create_subject', 'create_moudle', 'update_moudle', 'share_url', 'share_blog', 'share_video', 'share_programme', 'share_album', 'share_photo', 'share_album_dynamic', 'share_blog_friend', 'share_group_thread', 'share_group', 'event_news',
			'mblog', 'poke', 'poke_adv', 'create_programme', 'weibo', 'delete_feed', 'forward', 'wenda', 'addapp', 'talk', 'gold', 'theme', 'group' ];

			// 20120129 屏蔽upload_video
			// , 'upload_video'
		/**
		 * @constant feed来自HTML
		 */
		var fromHTML = [ '', '来自<a href="http://i.sohu.com/" target="_blank">我的搜狐</a>', '来自<a href="http://t.sohu.com/" target="_blank">搜狐微博</a>', '来自<a href="http://i.sohu.com/" target="_blank">我的搜狐</a>' ];
		/**
		 * @description 保存绘制过的feed的id
		 */
		var rendered = {};
		/**
		 * @function 获取图片的小图或中图
		 * @param path
		 *            图片路径
		 * @param type
		 *            图片为小图或中图
		 */
		function getThumbPath(path, type) {
			if(/t\.itc\.cn/.test(path)){
				var i = path.lastIndexOf('/') + 1;
				path = path.substr(0, i) + (type === 'small' ? 'f_' : 'm_') + path.substr(i);
			}
			else if(/(220|201)\.img\.pp\.sohu\.com\.cn\//.test(path)){
				//从搜狐视频评论了一个视频,同步到微博,微博又同步给我的搜狐的图片,没有大图
				return path;
			}
			else if(/img\.pp\.sohu\.com\.cn\//.test(path)){
				var i = path.lastIndexOf('.');
				path = path.substr(0, path.substr(i - 2, 1) == '_' ? i - 2 : i) + (type === 'small' ? '_s' : '_b') + path.substr(i);
			} 
			else if(/img\.itc\.cn\//.test(path)){
				path = path + (type === 'small' ? '_c120' : (/\.gif$/.test(path)? '': '_w500'));
			}
			return path;
		}
		function getMblogAlbum(obj) {
			return obj.ulink + "album/photoset/tblog/photos/";
		}
		/**
		 * @function 预处理数据
		 * @param datai
		 *            单一条feed数据
		 * @return 预处理过的用于套模板的数据
		 */
		function prepareData(datai) {
			var func = prepareFuns[types[datai.type]];
			try {
				var ret = func && func(datai, datai.ext && datai.ext[0]);
			} catch (e) {
				(console.err || console.log)('Error parsing data: ', datai, e);
			}
			if (!ret)
				return;
			util.probe({
				usericon : {
					photo : datai.uavatar || defaultIcon
				},
				from : fromHTML[datai.from || 0],
				appId : datai.appid,
				id : datai.ids || datai.id,
				itemid : datai.itemid,
				type : datai.type,
				data_from : datai.type == 0 && datai.ext[0] && datai.ext[0].from == 2 ? 'tblog' : types[datai.type],
				title : datai.ext && datai.ext[0].title,
				time : datai.time,
				ulink : datai.ulink,
				unick : datai.unick,
				isauth : datai.isauth,
				xpt : datai.xpt,
				item_type : types[datai.type],
				time_ago : timeUtil.get_timeago(datai.time),
				isMine : util.cookie.xpt === datai.xpt,
				adventure : datai.adventure,
				logpre : datai.adventure ? 'qiyu' : 'feed'
			}, ret);
			ret.showClose = !dontShowClose && util.cookie.isMine && !ret.isMine;
			var target = ret.original || ret, hasVideo = target.video || target.photo_video;
			// 添加视频小电视
			if (hasVideo) {// add video icon
				var split = '>' + hasVideo.shorturl + '</a>', join = ' action="video_expand">' + hasVideo.shorturl + ' <span class="icon-video"></span></a>';
				target.filtered_title && (target.filtered_title = target.filtered_title.split(split).join(join));
				target.filtered_content && (target.filtered_content = target.filtered_content.split(split).join(join));
			}
			if (ret.isMine) {
				ret.delAction = (ret.xpt === util.cookie.xpt || ret.xpt === util.cookie.upt) && (ret.type === 0 || ret.type === 35) ? 'mblog' : 'feed';
			}
			return ret;
		}
		var feed_qiyu = '<div class="section panel-box"><div class="panel-box-area feed-box" style="padding:9px;text-align:center;cursor:pointer;color:#5e6265" onclick="require(\'app::feed::feedgroup\',function($){$.initQiyu()})">上次阅读到此处，更多精彩内容，快来<a href="javascript:;">“奇遇一下”</a>吧！</div></div>';
		var feed_qiyu_shown = false;
		/**
		 * @description 绘制入口函数
		 * @param arr
		 *            要绘制的feed列表
		 * @param maxid
		 *            上次显示的id
		 * @return 生成的documentFragment
		 */
		function render(arr, maxid) {
			var htmls = [], count = 0;
			for ( var i = 0, L = arr.length; i < L; i++) {

				var datai = arr[i];
				var uid = datai.appid ? datai.appid + "_" + datai.itemid : "feed_" + datai.id;

				// feed屏蔽 { '4': 'upload_video' }
				var ignore_type_ids = [4];
				var is_ignore = function(type){
					var is_found = false;
					for(var i = 0; i < ignore_type_ids.length; i++){
						if(ignore_type_ids[i] == type) is_found = true;
					}
					return is_found;
				}(datai.type);

				if(is_ignore) continue;

				if (rendered[uid])
					continue;
				rendered[uid] = true;
				if (!feed_qiyu_shown && maxid && count && count < 10 && datai.id == maxid) {
					htmls.push(feed_qiyu);
					feed_qiyu_shown = true;
				}
				try {
					var jsoni = prepareData(datai);
					if (!jsoni)
						continue;
					htmls.push('<div class="section panel-box"><div class="panel-box-area feed-box">', FEED[types[arr[i].type]](jsoni, COMMON), '</div></div>');
					count++;
				} catch (e) {
					console.log('Error rendering data at #' + i, e);
				}
			}
			if (!feed_qiyu_shown && L && L <= 10 && maxid == 'tail') {
				htmls.push(feed_qiyu);
				feed_qiyu_shown = true;
			}
			var ret = htmls.join('');
			return ret;
		}
		/**
		 * @function 重置已绘制的feed id列表
		 */
		render.resetRendered = function() {
			rendered = {};
			feed_qiyu_shown = false;
		};
		var simple_prepare = function() {
			return arguments[1];
		};
		/**
		 * @description 所有的绘制函数列表
		 */
		var prepareFuns = {
			// 0: 一句话
			sentence : function(data, ext) {
				var title = stringUtil.safeCut(ext.title, 140);
				var obj = {
					showFwd : true,
					from : fromHTML[ext.from || 1],
					iscuted : ext.iscuted || title.length < ext.title.length,
					link : ext.turl || data.ulink + 'mblog/view.htm?id=' + data.itemid,
					filtered_title : stringUtil.filter_all(title, ext.from == 2)
				};
				var sentence_type = ext.type;
				if (sentence_type == 1 || sentence_type == 3 && !ext.videocontent.length) { // photo
					var cover = ext.url;
					cover && (obj.photo = {
						small : getThumbPath(cover, 'small', ext.from),
						big : getThumbPath(cover, 'big', ext.from),
						ori : cover,
						album : getMblogAlbum(data)
					});
					obj.say_class = "photo";
				} else if (sentence_type == 2 || sentence_type == 3 && !ext.url) {
					ext.videocontent.length && (obj.video = ext.videocontent[ext.videocontent.length - 1]);
					obj.say_class = "video";
				} else if (sentence_type == 3) {
					var cover = ext.url;
					var info = obj.photo_video = ext.videocontent.pop();
					info.small = getThumbPath(cover, 'small', ext.from);
					info.big = getThumbPath(cover, 'big', ext.from);
					info.ori = cover;
					info.album = getMblogAlbum(data);
				} else if (sentence_type == "6") {
					obj.vote = {
						url : ext.turl
					};
				} else {
					obj["default"] = true;
				}
				return obj;
			},
			// 1: 博客
			blog : function(data, ext) {
				var obj = {
					showFwd : true,
					link : ext.link,
					content : ext.desc,
					iscuted : ext.iscuted
				};
				data.from || (data.from = 1);
				if (data.type === 1) {// with img
					obj.pic = ext.pic;
				}
				return obj;
			},
			// 2: 跟随
			add_friend : function(data, ext) {
				for ( var arr = [], i = 0, L = data.ext.length; i < L && arr.length < 9; i++) {
					var user = data.ext[i];
					user.icon && !/nobody\.gif$/.test(user.icon) && (arr.push(user));
				}
				var ret = {
					id : data.ids,
					ext : data.ext,
					photos : arr
				};
				if (L >= 5) {// 聚合
					ret.combo = {
						all : data.ext,
						last : ext,
						count : data.num,
						more : data.num > L
					};
				}
				return ret;
			},
			// 3: 上传照片
			upload_photo : function(data, ext) {
				var item = ext.item || [];
				var obj = {
					showFwd : true,
					appId : 'photo',
					url : ext.url,
					photocount : ext.photocount,
					link : ext.url,
					item : item,
					from : fromHTML[data.from || 1]
				};
				if (item.length > 1) {
					for ( var n = 0, L = item.length, arr = new Array(L); n < L; n++) {
						arr[n] = item[n].photoid;
					}
					obj.itemids = arr.join('_');
					obj.appId = 'album';
					obj.content = ext.title;
				} else if (item.length == 1) {
					obj.content = obj.desc = item[0].desc;
				}
				return obj;
			},
			// 4: 上传视频
			upload_video : function(data, ext) {
				var obj = {
					showFwd : true,
					link : ext.url,
					video : {
						originalurl : ext.url,
						title : ext.title,
						pic : ext.cover,
						flash : 'http://my.tv.sohu.com/fo/v4/' + data.itemid
					}
				};
				data.from || (data.from = 1);
				return obj;
			},
			// 6: 添加模块
			add_module : function(data) {
				var obj = {
					title : '',
					moudles : []
				};
				for ( var i = 0, L = data.ext.length; i < L; i++) {
					obj.moudles.push({
						link : data.ext[i].link,
						name : data.ext[i].title,
						thumb : data.ext[i].pic
					});
				}
				return obj;
			},
			// 7: 创建圈子
			create_group : simple_prepare,
			// 8: 圈子中发帖
			group_thread : function(data, ext) {
				if (ext.type == 4) {
					ext.vote = {
						url : ext.vurl,
						icon : ext.item[0].cover
					};
				} else {
					ext.pic = ext.item && ext.item[0].cover;
				}
				ext.link = ext.turl;
				return ext;
			},
			// 10: 广场中发帖
			ground_thread : simple_prepare,
			// 11: 加入圈子
			add_group : function(data, ext) {
				for ( var i = 0, L = data.ext.length, arr = [], shown = {}; i < L; i++) {
					var obj = data.ext[i];
					if (!shown[obj.name]) {
						shown[obj.name] = true;
						arr.push(obj);
					}
				}
				var ret = {
					id : data.ids,
					ext : arr
				};
				data.ext = arr;
				if (arr.length > 6) {// 聚合
					ret.combo = {
						all : arr,
						last : ext,
						count : arr.length
					};
					ret.icons = arr.slice(0, 6);
				} else {
					ret.icons = arr;
				}
				return ret;
			},
			// 12:修改个人档案
			edit_profile : function(data, ext) {
				// 只显示修改档案的头像类型
				return ext.type == 7 && ext;
			},
			// 18: 分享URL
			share_url : simple_prepare,
			// 19:分享博客
			share_blog : simple_prepare,
			// 20:分享视频
			share_video : simple_prepare,
			// 22:分享专辑
			share_album : simple_prepare,
			// 23:分享照片
			share_photo : simple_prepare,
			// 24:分享动感相册
			share_album_dynamic : simple_prepare,
			// 25:分享博友
			share_blog_friend : simple_prepare,
			// 26:分享帖子
			share_group_thread : simple_prepare,
			// 30:打招呼
			poke : function(data, ext) {
				var obj = {
					from : ext.form,
					friend_link : ext.user,
					friend_name : ext.user,
					poke_first : ext.oper1,
					poke_last : ext.oper2,
					poke_icon : ext.icon,
					poke_remark : ext.remark,
					flinks : []
				};
				var users_tag = ext.user.replace(/\|$/, '');
				var userArray = users_tag.split("|");
				for ( var j = 0; j < userArray.length; j++) {
					if (userArray[j] == '') {
						continue;
					}
					var obj_user = {
						user_xpt : userArray[j]
					};
					obj.flinks.push(obj_user);
				}
				// obj.flinks.join('');
				return obj;
			},
			// 35:转发
			forward : function(data, ext) {
				var ori = data.originfo || {
					status : 1
				}, ext2 = ori.ext;
				if (ori.from == 2)
					ori.appid = 'tblog';
				var title = stringUtil.safeCut(ext.title, 140), orititle = stringUtil.safeCut(ori.title, 140);
				var obj = {
					showFwd : ori.status != 1,
					filtered_title : stringUtil.filter_all(title, ext.from == 2),
					from : fromHTML[ext.from || 1],
					link : data.ulink + 'mblog/view.htm?id=' + data.itemid,
					iscuted : ext.iscuted || title.length < ext.title.length,
					original : ori.status != 1 && {
						id : ext.originalid,
						ulink : ori.ulink,
						appId : ori.appid,
						itemid : ori.itemid,
						unick : ori.unick,
						isauth : false,
						title : ori.title,
						filtered_title : stringUtil.filter_all(orititle, ori.from == 2),
						content : ori.content,
						filtered_content : stringUtil.filter_all(ori.content, ori.from == 2),
						url : ori.url,
						tblog : ori.from == 2,
						xpt : ori.passport,
						forwards : ori.spreadcount,
						comments : ori.commentcount,
						iscuted : ori.iscuted || orititle.length < ori.title.length
					}
				};
				if (ori.status != 1) {
					var oridata = obj.original;
					// fill original data
					obj.fwd_class = ori.appid;
					if (ori.appid === 'sentence' || ori.appid === 'tblog') {
						oridata.sentence_show = true;
						if (ori.type == 1 || ori.type == 3 && !ori.videocontent) {// img
							var cover = ext2 && ext2.piclist && ext2.piclist[0] && ext2.piclist[0].cover130;
							cover && (oridata.photo = {
								small : getThumbPath(cover, 'small', ori.from),
								big : getThumbPath(cover, 'big', ori.from),
								ori : cover,
								album : getMblogAlbum(ori),
								isMine : ori.passport === util.cookie.xpt
							});
						} else if (ori.type == 2 || ori.type == 3 && !ext2.piclist) {// video
							ori.videocontent && (oridata.video = ori.videocontent.pop());
						} else if (ori.type == 3) {// img + video
							var cover = ext2.piclist && ext2.piclist[0] && ext2.piclist[0].cover130;
							var item = oridata.photo_video = ori.videocontent.pop();
							item.small = getThumbPath(cover, 'small', ori.from);
							item.big = getThumbPath(cover, 'big', ori.from);
							item.ori = cover;
							item.album = getMblogAlbum(ori);
							item.isMine = ori.passport === util.cookie.xpt;
						} else if (ori.type == 6) {// vote
							oridata.vote = {
								url : ori.voteurl
							};
						}
					} else if (ori.appid === 'blog') {
						oridata.blog_show = true;
						oridata.pic = ext2 && ext2.piclist && ext2.piclist[0].cover130;
					} else if (/album|photos?/.test(ori.appid)) {
						oridata.isPhoto = true;
						oridata.isAlbum = ori.appid === 'album';
						oridata.photos = ext2.piclist;
						oridata.photos.length === 1 && (oridata.desc = oridata.isAlbum ? ori.content : oridata.photos[0].content);
					} else if (ori.appid === 'video') {
						oridata.video_show = true;
						oridata.video = ori.videocontent && ori.videocontent.pop();
					} else if (ori.appid === 'qingsohu') {
						oridata.qingsohu = true;
					}
				}
				return obj;
			},
			// 36:问答
			wenda : function(data, ext) {
				return {
					from : '来自<a href="http:\/\/wenda.sohu.com" target="_blank">搜狐问答</a>',
					url : ext.url,
					desc : ext.desc,
					method : [ null, "提问了", "回答了", "回答的", "分享了问答" ][ext.type],
					is_best : ext.type == 3
				};
			},
			// 37:添加应用
			addapp : function(data, ext) {
				return {
					url : ext.url,
					desc : ext.desc,
					appid : ext.from,
					pic : ext.pic
				};
			},
			// 38:我来说两句
			talk : function(data, ext) {
				ext.is_from_weibo = ext.from && ext.from == 3;
				ext.from = '来自<a target="_blank" href="http://i.sohu.com/scomment/home/all/">我来说两句</a>';
				ext.itemid = ext.originalid;
				ext.small = getThumbPath(ext.img, 'small');
				ext.big = getThumbPath(ext.img, 'big');
				ext.ori = ext.img;
				ext.link = data.ulink + 'scomment/person/single/' + ext.tid + '/';
				ext.filtered_content = stringUtil.filter_all(ext.content);
				return ext;
			},
			// 39:金币
			gold : function(data, ext) {
				ext["type" + ext.type] = true;
				ext.from = fromHTML[1];
				return ext;
			},
			// 换肤
			theme : function(data, ext) {
				data.themeid = ext.templateid;
				if (typeof ext.url != "undefined") {
					data.custom = true;
					data.themeurl = ext.url;
					data.position = ext.position;
					data.repeat = ext.repeat;
					if (ext.url) {
						var idx = ext.url.lastIndexOf('.');
						data.preview = ext.url.substr(0, idx) + "_s" + ext.url.substr(idx);
					}
				} else if (/^color/.test(ext.templateid)) {
					data.custom = true;
				}
				return data;
			},
			// 圈子
			group : function(data, ext) {
				ext.vice = ext.type == 2;
				return ext;
			}
		};
		define('app::feed::render', render);
	});