/*
 * info_fill
 * @author yongzhongzhang
 */

;
require('core::util::jQuery', 'core::stringUtil', 'core::util::beLogin', 'core::spy', '#document', function($, stringUtil, beLogin, spy) {
	
	var $elems = {
		tblog : $('.ms_num_tblog'),
		comment : $('.ms_num_comment'),
		mail : $('.ms_num_mail'),
		follow : $('#ms_num_follow'),
		follower : $('#ms_num_follower'),
		feeds : $('#ms_num_feeds'),
		visits : $('#person_visits_num'),
		profile : $('#info_person_profile')
	};

	// 填充微博通知、我的评论
	($elems.comment.length || $elems.tblog.length) && spy.getNewCount(function(nc, nr) {
		if ($elems.comment.length) {
			if (nc > 0 && nc < 100 && $space_config._currentApp != 'discuss') {
				$elems.comment.text(nc).closest('li').addClass('current');
			} else if (nc >= 100 && $space_config._currentApp != 'discuss') {
				$elems.comment.text('99+').closest('li').addClass('current');
			} else {
				$elems.comment.text('0').closest('li.current').removeClass('current');
			}

		}
		if ($elems.tblog.length) {
			if (nr > 0 && nr < 100 && $space_config._currentApp != 'refer') {
				$elems.tblog.text(nr).closest('li').addClass('current');
			} else if (nr >= 100 && $space_config._currentApp != 'refer') {
				$elems.tblog.text('99+').closest('li').addClass('current');
			} else {
				$elems.tblog.text('0').closest('li.current').removeClass('current');
			}
		}
	});

	// 填充我的邮件
	$elems.mail.length && spy.getMailCount(function(num) {
		if (num > 0 && num < 100) {
			$elems.mail.text(num).closest('li').addClass('current');
		} else if (num >= 100) {
			$elems.mail.text('99+').closest('li').addClass('current');
		} else {
			$elems.mail.text('0').closest('li.current').removeClass('current');
		}
	});

	// 新鲜事
	$elems.feeds.length && spy.getFeeds(function(num) {
		$elems.feeds.text(num > 0 ? num : 0);
	});

	// 被访问次数
	$elems.visits.length && spy.getVisits(function(num) {
		$elems.visits.text(num);
	});

	// 个人信息
	if ($elems.profile.length) {
		$.getJSON('/a/profile/simpleprofile.json', {
			xpt : $space_config._xpt
		}, function(json) {

			if (parseInt(json.code) == 0) {
				var data = {
					"auth" : json.data.auth || false, // 是否认证用户
					"authInfo" : json.data.authInfo || '', // 认证描述
					"school" : json.data.school || '', // 学校中文名
					"day" : json.data.birthdayDay || '', // 出生日
					"month" : json.data.birthdayMonth || '', // 出生月
					"year" : json.data.birthdayYear || '', // 出生年
					"sex" : (function(sex) {
						if (sex == 0) {
							return '男';
						} else if (sex == 1) {
							return '女';
						} else {
							return '';
						}
					})(json.data.sex), // 性别, 1--女，0--男，其他值则表示未填写。
					"company" : json.data.workcompany || '', // 公司
					"province" : json.data.provinceName || '', // 居住地--省/直辖市
					"city" : json.data.cityName || '', // 居住地--城市名
					"county" : json.data.countyName || '' // 居住地--县/区
				}, html = [];

				if (!data.auth) {

					if (data.sex != '') {
						html.push(data.sex + ' ');
					}
					if (data.month != '' && data.day != '') {
						html.push('生于');
						if (data.year != '') {
							html.push(data.year + '年');
						}
						html.push(data.month + '月' + data.day + '日 ');
					}
					if (data.province != '' || data.city != '' || data.county != '') {
						html.push('住在 ' + data.province + ' ' + data.city + ' ' + data.county + ' ');
					}
					html.push('<br />');
					if (data.company != '') {
						html.push('在' + stringUtil.gbSubstr(data.company, 15) + '工作 ');
					}
					if (data.school != '') {
						html.push('曾就读于' + data.school + ' ');
					}
				} else {
					html.push(data.authInfo + '<br />');
				}

				$elems.profile.html(html.join(''));
			}
		});
	}

	// 意见反馈
	$('body').append('<div id="float_yjfk"><a href="http://feedback.q.sohu.com/" target="_blank" data-logid="right_yjfk"><span>意见反馈</span></a></div>');

	// 勋章区域
	spy.getMedals(function(level, score, _medal, vgift) {
		$('#medal_level').html(level);
		// $('#medal_levelname').html(data.levelName);
		$('#medal_score').html(score);

		var _mdimg = $('#medal_images'), _imgs = [], _link = _mdimg.closest('li.rtbar-medal').find('span > a').attr('href');
		$.each(_medal, function(index, item) {
			if (index > 2)
				return;
			_imgs.push('<i class="icon-medal-x16"><a href="' + _link + '"><img alt="" src="' + item.img + '" /></a></i>');
		});
		if (_medal.length) {
			if (_medal.length > 3) {
				_imgs.push('&nbsp;<a href="' + _link + '">&gt;&gt;</a>');
			}
			_mdimg.html(_imgs.join(''));
		}

		// $('#medal_nums').html(_medal.length);
		//显示礼物数量、魅力值
		if(vgift === '暂无礼物！') {
			$('#vgift-num-charm').children().first().html(vgift).next().remove();	
		}else{
			var arr = (vgift || '').split(/\s+/);
			$('#vgift-num-charm').children().first().html(arr[0]).next().html(arr[1]);	
		}
	});

	// 好友模块
	spy.getFollows(function(follows, followers, att) {
		$('#ms_num_follow').html(follows);
		$('#ms_num_follower').html(followers);
		followIt.init && followIt.init(att);
	});

	var followIt = {
		init : function(isAtted) {
			this.init = null;
			var self = this;
			if (window.$space_config) {
				$space_config.isAtted = isAtted;
			}

			this.$box = $('#tweet_editor_box .btn-attention-wraper');
			if (!this.$box.length) {
				return;
			}
			// 没有关系
			if (isAtted == -1) {
				this.$box.html('<span class="btn-attention" style="display:none"><a href="javascript:void(0);">跟随</a></span>');
			}
			// 单向关注,我关注他
			else if (isAtted == 0 || isAtted == 3) {
				this.$box.html('<span class="btn-attention-already" style="display:none"><em>已跟随</em><a href="javascript:void(0);">取消</a></span>');
				this.insertInviteBtn();
			}
			// 互相跟随
			else if (isAtted == 2) {
				this.$box.html('<span class="btn-attention-each-other" style="display:none"><em>互相跟随</em><a href="javascript:void(0);">取消</a></span>');
			}
			this.$box.children().fadeIn('slow');
			this.$box.delegate('a', 'click', function() {
				var status = this.innerHTML;
				if (status == '跟随') {
					self.follow();
				} else {
					self.unfollow();
				}
			});
			$('#header a.whisper-link').bind('click', function(e) {
				if(e.target.id !== 'handsel-gift') {
					e.preventDefault();
					self.whisper();
				}
			});

			$('#handsel-gift').bind('click', function(event) {//送TA礼物
				var nick = encodeURIComponent(encodeURIComponent(window._sucNick)),
					url = 'http://i.sohu.com/app/score/#/score/sur/virtual.json?nick=' + nick;

				window.open(url);
			});
		},
		follow : function() {
			var self = this, xpt = $space_config._xpt, nick = window._sucNick || '';

			if (beLogin()) {
				return;
			}
			$.get('/a/app/friend/friend/add.do', {
				'xpt' : xpt,
				'from_type' : 'show_follow'
			}, function(results) {
				if (results.code == 1 || results.code == -2) {
					// @friendType : 1 双向好友 0 单向好友
					if (results.data.friendType == 1) {
						self.$box.html('<span class="btn-attention-each-other"><em>互相跟随</em><a href="javascript:void(0);">取消</a></span>');
						self.removeInviteBtn();
					} else {
						self.$box.html('<span class="btn-attention-already"><em>已跟随</em><a href="javascript:void(0);">取消</a></span>');
						self.insertInviteBtn();
					}
					// 弹出设置分组对话框
					if ($.iCard && $.iCard.SetGroupsDialog) {
						$.iCard.SetGroupsDialog.show({
							'friendid' : results.data.friendId,
							'nick' : nick,
							'friendType' : results.data.friendType,
							'xpt' : xpt,
							'ifFromType' : 'blog_person_show'
						});
					}
				} else {
					$.alert(results.msg);
				}
			}, 'json');
		},
		unfollow : function() {
			var self = this, xpt = $space_config._xpt;

			if (beLogin()) {
				return;
			}
			$.post('/a/app/friend/friend/delete.do', {
				'xpt' : xpt
			}, function(results) {
				if (results.code == 1) {
					// 取消成功
					self.$box.html('<span class="btn-attention"><a href="javascript:void(0);">跟随</a></span>');
					self.removeInviteBtn();
				} else {
					$.alert(results.msg);
				}
			}, 'json');
		},
		insertInviteBtn : function() {
			var self = this, $btn = $('<a href="javascript:void(0);" class="invite-follow-link">求跟随</a>');
			$('#tweet_editor_box div.view-leavemsg').prepend($btn);

			$btn.bind('click', function() {
				self.invite();
			});
		},
		removeInviteBtn : function() {
			$('#tweet_editor_box a.invite-follow-link').remove();
		},
		invite : function() {
			var self = this, xpt = $space_config._xpt, nick = window._sucNick || 'TA';

			if ($.iCard.InviteFollowDialog) {
				$.iCard.InviteFollowDialog.show({
					'xpt' : xpt,
					'nick' : nick,
					'fromType' : 'person_show'
				});
			}
		},
		whisper : function() {
			if (window._sucNick) {
				require('app::whisper', function($whisper) {
					$whisper({
						'nick' : window._sucNick
					});
				});
			}
		}
	};

	function changeNum(el, num) {
		var _el = el, _num = parseInt(_el.html());
		if (typeof num == 'undefined' || (_num == 0 && num < 0))
			return _num;
		var _n = _num + parseInt(num);
		_el.html(_n);
		return _n;
	}

	// 扩展一个添加减少关注的接口
	$.iProfile.setAttNum = function() {
		var n = arguments[0];
		return changeNum($('#att_num'), n);
	};
	// 扩展一个添加关注粉丝的接口
	$.iProfile.setFansNum = function() {
		var n = arguments[0];
		return changeNum($('#fans_num'), n);
	};
});
