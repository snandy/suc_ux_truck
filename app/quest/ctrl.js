/**
 * @author lianghe
 * @desc 首页任务,任务中心 任务类型 0成长任务 1活动任务 2日常任务
 */
(function($, document, sohu) {
	var task = {
		init : function() {
			this._pageDiffe();
		},
		_pageDiffe : function() {
			var _url = location.href;
			this._config.home = !/\/task\/home/.test(_url) ? true : false;
			if (this._config.home) {
				this._homeTask();
			} else {
				this._initEvent();
				this._setMoney();
			}
			this._resizeWin();
		},
		_homeTask : function() {
			var url = this._config.homeTaskUrl;
			this._config.goldBox = $(this._config.homeGold);
			this._config.homeTasks = $(this._config.homeTaskList);
			this._dataUpdate(url, this, function(value) {
				this._config.homeTasks.html(value);
			});
		},
		_initEvent : function() {
			var elem, taskId, self = this;
			self._config.tasks = $(this._config.taskList);
			self._config.tasks.click(function(event) {
				elem = $(event.target);
				if (elem.hasClass('ui-btn') || elem.parent().hasClass('ui-btn')
				|| (elem.hasClass('name') && elem.parent().parent().hasClass('box'))) {
					taskId = elem.parents('li').eq(0).attr('data-task-id');
					task.getTask(taskId);
				}
			});
		},
		_resizeWin : function() {
			var height, width;
			$(window).resize(this._throttle(function() {
				if (this._config.dialogBox) {
					this._setPos(this._config.dialogBox);
				}
				if (this._config.mask) {
					height = document.documentElement.clientHeight;
					width = document.documentElement.clientWidth;
					this._config.mask.style.height = height + 'px';
					this._config.mask.style.width = width + 'px';
				}
			}, 10));
		},
		getTask : function(taskId) {
			if (!this._config.dialogBox) {
				this._config.dialogBox = document.createElement('div');
				document.body.appendChild(this._config.dialogBox);
				this._config.dialogBox.style.display = 'none';
				this._config.dialogBox.className = 'quest-dl-wrapper';
			}
			this._request(this._config.taskUrl, taskId, this._setTaskContent);
		},
		_request : function(url, id, callback) {
			var param = '',
                headers = null,
                method = 'GET';
                
			if (typeof id === 'function') {
				callback = id;
			} else if(typeof id === 'object') {
                method = 'POST';
                param = id;
                headers = {
                    refer: location.href 
                }
			}else{
				param = 'taskid=' + id;
            }
			$.ajax({
				url : url,
				type : method,
				data : param,
				dataType : 'json',
                headers: headers,
				success : function(data) {
					callback(data);
				},
				error : function(jqXHR, textStatus, errorThrown) {
				}
			});
		},
		_dataUpdate : function(url, task, callback) {
			task._request(url, function(data) {
				if (data.code !== 0) {
					// TODO
					return;
				}
				data = data.data;
				// 与助手交互
				require('core::spy', function(spy){
					spy.setQuestReady(data);
				});
				var html = [ '<h3><p class="rtbar-quest-title-btn"><a href="http://i.sohu.com/task/home/listall.htm"><span class="ui-btn btn-green-h20"><span>更多任务</span></span></a></p>今天你完成了吗?</h3>' ];
				html.push('<ul class="rtbar-quest-list clearfix">');
				for ( var i = 0, length = data.length; i < length; i++) {
					var cur = data[i];
					var _status = cur.type === 2 ? cur.type : cur.type === 0 ? 1 : 3;
					var _icon = (cur.icon || '').replace(/\.jpg$/, '_s.jpg');
					var r = [];
					r.push('<li class="status' + _status
					+ '"><div class="photo"><a href="javascript:void(0);" onclick="mysohu.task.getTask(' + cur.id
					+ ')"><img src=' + _icon + ' /></a></div>');
					r.push('<div class="con"><div class="title"><i class="icon"></i><a href="javascript:void(0);" title="'
					+ cur.name + '" onclick="mysohu.task.getTask(' + cur.id + ')">' + cur.name + '</a>');
					if (cur.executeState === 1) {
						r.push('<span><a href="javascript:void(0);" onclick="mysohu.task.getTask(' + cur.id + ')" class="awards"></a></span>');
						if (cur.name && cur.name !== '打卡领工资') {
							first = true;
						}
					}
					r.push('</div><div class="bottom">');
					r.push('<div class="progressbar"><p style="width:' + cur.percent + '%"></p><span>' + cur.percent
					+ '%</span></div>');
					for ( var k in cur.awards) {
						r.push('<i class="icon"></i><span class="num">' + cur.awards[k].number + '</span>');
					}
					r.push('</div></div></li>');
					html.push(r.join(''));
				}
				html.push('</ul>');
				callback.call(task, html.join(''));
			});
		},
		_setMoney : function() {
			this._config.goldBox = $('.app-box-body').find('i.points a');
			$.iProfile.getMedal(function(data) {
				if (data.status === 0) {
					data = data.data;
					if (task._config.goldBox.length)
						task._config.goldBox.text(data.score);
				}
			});
		},
		_setTaskContent : function(data) {
			// 0为成功，1为失败
			if (data.code === 0) {
				// 重置获取金币数量
				var self = task, _defaultHtml = [], _data = data.data, _taskTime = (!_data.startTime || !_data.endTime) ? ''
				: '<p>时限：' + self._taskDate(_data.startTime, _data.endTime) + '</p>', body = document.body, width, height, _taskId = _data.taskid;
				self._updateConfig(_data);
				_defaultHtml
				.push('<div class="quest-dl-top"><div class="quest-dl-con"><a href="javascript:void(0);" class="quest-dl-close" title="关闭"></a>');
				_defaultHtml.push('<div class="quest-dl-img"><img src="' + _data.icon + '" /></div><div class="quest-title">');
				_defaultHtml.push('<div class="img"></div>');
				_defaultHtml.push('<div class="quest-title-con"><h1>' + _data.name + '</h1>' + _taskTime + '</div></div>');
				_defaultHtml.push('<div class="item-list"><div class="item"><h2>任务描述:</h2><div class="item-con item-con-text">'
				+ _data.description + '</div></div>');
				_defaultHtml.push('<div class="item"><h2>任务目标:</h2><div class="item-con item-con-list">');
				_defaultHtml.push('<div class="progressbar"><p style="width: ' + _data.percent + '%"></p><span>'
				+ _data.percent + '%</span></div>');
				// _taskId,任务类型标示，用来区分日常任务中的打卡任务和其他任务
				if (_taskId !== 129) {
					_defaultHtml.push('<ul>'
					+ self._taskTarget(_data.url, _data.targetdescription, _data.progressContents, _data.target) + '</ul>');
				}
				_defaultHtml.push('</div></div><div class="item"><h2>任务奖励:</h2><div class="item-con item-con-award"><ul>');
				_defaultHtml.push(self._taskAward(_data.awards) + '</ul>');
				_defaultHtml.push('</div></div></div>');
				_defaultHtml.push('<div class="btn">' + self._buttonStatus(_taskId, _data.type, _data.executeState)
				+ '</div></div></div>');
				// 关闭和领取奖励事件处理
				self._initDialogEvent(self._config.dialogBox, _data.id, _data.sign);
				self._config.dialogBox.innerHTML = _defaultHtml.join('');
				self._show(self._config.dialogBox);
				if (!self._config.mask) {
					self._config.mask = document.createElement('div');
				}
				width = document.documentElement.clientWidth;
				height = document.documentElement.clientHeight;
				self._config.mask.className = 'quest-mask';
				var cssText = 'width:' + width + 'px;height:' + height + 'px;';
				self._config.mask.style.cssText = cssText;
				body.appendChild(self._config.mask);
			} else {
				$.inform({
					icon : 'icon-error',
					delay : 1000,
					easyClose : true,
					content : data.msg
				});
			}
		},
		_buttonStatus : function(taskId, type, exec) {
			var r = '';
			/*
			 * quest-dl-btn-status1 打卡领工资,quest-dl-btn-status2
			 * 已打卡,quest-dl-btn-status3 领取奖励,quest-dl-btn-status4
			 * 领取奖励灰色(已经废弃更改为去做任务) quest-dl-btn-status5
			 * 已领奖励灰色,quest-dl-btn-status6 去做任务
			 */
			switch (type) {
			case 0:// 成长任务,只有领取奖励可领或者去做任务两种状态
				r = !!exec ? 'quest-dl-btn-status3' : 'quest-dl-btn-status6';
				break;
			case 1:// 活动任务，暂未开放
				break;
			case 2:// 日常任务，有领取奖励、去做任务和已领取奖励三种状态，已领取状态根据executeState是否为2,打卡领工资是唯一的id=129属于日常任务
				if (taskId === 129) {
					r = exec === 1 ? 'quest-dl-btn-status1' : 'quest-dl-btn-status2';
				} else {
					switch (exec) {
					case 0:
						r = 'quest-dl-btn-status6';
						break;
					case 1:
						r = 'quest-dl-btn-status3';
						break;
					case 2:
						r = 'quest-dl-btn-status5';
					default:
						break;
					}
				}
				break;
			default:
				break;
			}
			;
			return r === 'quest-dl-btn-status6' ? '<a href="' + this._config.doTaskUrl + '" class="quest-dl-btn-status6"></a>'
			: '<a href="javascript:void(0);" class="' + r + '"></a>';
		},
		_updateConfig : function(task) {
			this._config.gold = 0;
			this._config.taskType = task.type;
			this._config.taskId = task.taskid;
		},
		_taskDate : function(d1, d2) {
			return this._formatDate(d1) + '-' + this._formatDate(d2);
		},
		_formatDate : function(date) {
			var d = new Date(), yy, mm, dd, r;
			d.setTime(date);
			yy = d.getFullYear();
			mm = d.getMonth() + 1;
			dd = d.getDate();
			if (mm < 10) {
				mm = '0' + mm;
			}
			if (dd < 10) {
				dd = '0' + dd;
			}
			r = yy + '.' + mm + '.' + dd;
			return r;
		},
		_taskTarget : function(u, d, p, t) {
			var r = [], prop, cur, i = 0, length, n = [], inv = false;
			for (prop in d) {
				cur = d[prop];
				var arr = [];
				arr.push(cur);
				cur && r.push(arr);
			}
			for (prop in p) {
				cur = p[prop];
				if (typeof cur !== 'undefined' && (prop.toLowerCase() in d || prop.toUpperCase() in d)) {
					r[i] && r[i].push(cur);
					i++;
				}
			}
			i = 0;
			if (typeof t[prop] !== 'undefined') {
				r[i] && r[i].push(0);
			}
			for (prop in t) {
				cur = t[prop];
				if (typeof cur !== 'undefined' && (prop.toLowerCase() in d || prop.toUpperCase() in d)) {
					r[i] && r[i].push(cur);
					i++;
				}
			}
			i = 0;
			length = r.length;
			for (; i < length; i++) {
				cur = r[i];
				if (!inv && parseInt(cur[1], 10) < parseInt(cur[2], 10)) {
					this._config.doTaskUrl = u;
					inv = true;
				}
				n.push('<li><p><a href=" ' + u + '" title="' + cur[0] + '">' + cur[0] + '</a></p><span>' + cur[1] + '/'
				+ cur[2] + '</span></li>');
			}
			return n.join('');
		},
		_taskAward : function(award) {
			var r = [], prop, cur;
			for (prop in award) {
				cur = award[prop];
				if (prop === 'coin')
					this._config.gold += cur.number;
				r.push('<li><div class="img"><img src="' + cur.icon + '"></div><h3>' + cur.number + '</h3></li>');
			}
			return r.join('');
		},
		_setPos : function(elem) {
			var w = elem.offsetWidth, h = elem.offsetHeight, left = 0, top = 0, wins = this._getBrowserSize(), extra;
			left = (wins.width - w) / 2;
			top = (wins.height - h) / 2;
			if (!this._config.ie6) {
				elem.style.left = left + 'px';
				elem.style.top = (top < 20 ? 20 : top) + 'px';
			} else {
				extra = document.documentElement.scrollTop;
				left = left < 0 ? 0 : left;
				top = top < 0 ? 0 : top;
				this._fixed(left, top, extra);
			}
		},
		_getBrowserSize : function() {
			var w, h;
			w = document.documentElement.clientWidth;
			h = document.documentElement.clientHeight;
			return {
				width : w,
				height : h
			};
		},
		_fixed : function(left, top, extra) {
			this._config.dialogBox.style.cssText = 'position:absolute;left:' + left + 'px;top:' + (top + extra)
			+ 'px;top:expression(documentElement.scrollTop + ' + top + ' + "px");';
		},
		_show : function(elem) {
			this._config.dialogBox.style.display = 'block';
			this._setPos(elem);
		},
		_initDialogEvent : function(elem, id, token) {
			var target, elem = $(elem), self = this, url;
			elem.click(function(event) {
				target = event.target;
				switch (target.className) {
				case 'quest-dl-close':
					self._closeDialog(elem);
					break;
				case 'quest-dl-btn-status1':// 打卡领工资
					self._request(self._config.punchUrl, {taskid: id, sign: token}, self._getReward);
					break;
				case 'quest-dl-btn-status3':// 领取奖励
					self._request(self._config.rewardUrl, id, self._getReward);
					break;
				default:
					break;
				}
				;
			});
		},
		_getReward : function(data) {
			var elem = $(task._config.dialogBox);
			if (data.code === 0) {
				// 领取奖励成功
				var _data = data.data, id = _data.taskid, msg = task._config.taskId === 129 ? '打卡' : '领取', _goldBox = task._config.goldBox;
				task._closeDialog(elem);
				// _data.showType 服务器端返回状态，显示做哪种动画效果，目前始终是1，文字版加金币
				// _data.changeBonus 服务器端返回变化金币数，目前是设置为得到多少金币，后台代码更新后再做修改
				sohu.gold.reward({
					// type:_data.showType,
					type : 1,
					a : _data.bonus,
					// b:_data.changeBonus,
					b : task._config.gold,
					msg : msg,
					fn : function() {
						// 首页任务完成之后刷新等级、金币、勋章以及推荐任务列表，任务页面完成后日常任务更新按钮文案、其他任务更新任务列表
						if (task._config.home) {
							task._dataUpdate(task._config.homeTaskUrl, task, function(value) {
								var html = value;
								this._config.homeTasks.fadeOut(500, function() {
									task._config.homeTasks.html(html);
								}).fadeIn(500, function() {
									!!_goldBox.length && task._updateGold(_goldBox, task._config.gold)();
								});
							});
						} else {
							// 日常任务不更新任务列表
							if (task._config.taskType === 2) {
								!!_goldBox.length ? task._updateButton(id, task._updateGold(_goldBox, task._config.gold))
								: task._updateButton(id);
							} else {
								// 更新任务列表
								!!_goldBox.length ? task._updateTaskList(id, task._updateGold(_goldBox, task._config.gold))
								: task._updateTaskList(id);
							}
						}
					}
				});
			} else {
				task._closeDialog(elem);
				$.inform({
					icon : 'icon-error',
					delay : 1000,
					easyClose : true,
					content : data.msg
				});
			}
		},
		_closeDialog : function(elem) {
			this._config.mask && this._config.mask.parentNode.removeChild(this._config.mask);
			elem.empty();
			elem.remove();
			this._config.dialogBox = null;
			this._config.mask = null;
		},
		_updateButton : function(taskid, callback) {
			var elem = this._config.tasks.find('li[data-task-id="' + taskid + '"]').addClass('complete').find('span.ui-btn')
			.children();
			elem.text('已完成');
			callback && setTimeout(function() {
				callback();
			}, 1500)
		},
		_updateGold : function(elem, gold) {
			var old, cur, max;
			old = parseInt(elem.text(), 10);
			max = old + gold;
			return function sched() {
				cur = old++;
				if (cur <= max) {
					elem.text(cur);
					setTimeout(sched, 50);
				}
			};
		},
		_updateTaskList : function(id, callback) {
			var elem = $('li[data-task-id=' + id + ']'), li = this._config.tasks.find(elem);
			li.delay(1500).fadeOut(500, function() {
				li.remove();
				callback && callback();
			});
		},
		_throttle : function(fn, delay) {
			var timer, context = this;
			return function() {
				var args = arguments;
				clearTimeout(timer);
				timer = setTimeout(function() {
					fn.apply(context, args);
				}, delay);
			};
		},
		_deferred: function() {
			var args = arguments;
			if(!task._define(args[0])) {
				setTimeout(function() {
					task._deferred.apply(null, args);
				}, 10);
			}else{
				args[1] && args[1]();
			}
			
		},
		_define: function(deps) {
			var r;
			try{
				r = (new Function('return ' + deps))(); 		
			}catch(e) {
				r = false;
			}
			return r;
		},
		_config : {
			homeTaskUrl : '/a/task/task/recommend',// 首页推荐任务url
			taskUrl : '/a/task/task/get',// 参加任务url
			rewardUrl : '/a/task/award/get',// 领取奖励url
			punchUrl : 'http://i.sohu.com/a/task/subject/checkin',
			doTaskUrl : '',
			taskList : '#tasklist',
			homeTaskList : '#rtbarTaskBox',
			homeGold : '#medal_score',
			homeTasks : null,
			tasks : null,
			dialogBox : null,
			mask : null,
			goldBox : null,
			gold : 0,
			taskId : 0,
			taskType : false,
			home : false,
			ie6 : !window.XMLHttpRequest
		}
	};
	sohu.task = task;
	$(function() {
		sohu.task.init();
	});
})(jQuery, document, mysohu);
