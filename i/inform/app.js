/*
 * 通知
 */
;
(function($) {

	$(function() {
		$('#delete_all').click(function(e) {
			var that = this, ids = [], lis;
			lis = $('.items-list-wrap ul.request-list').find('li');

			$.each(lis, function(i, li) {
				ids.push(this.id);
			});
			ids = ids.join(',');
			$.confirm({
				title : false,
				icon : "icon-question",
				content : "是否要删除所有通知？<br/>被删除的通知将无法恢复！",
				labConfirm : "确认",
				labCancel : "取消",
				onConfirm : function($dialog) {
					if (ids) {
						deleteMsg(ids, 'deleteallok=1');
					} else {
						// add by chenjun 20120426,非求跟随时的操作
						window.location.href = that.href;
					}
				},
				onCancel : function($dialog) {
					return false;
				}
			});
			return false;
		});

		var $inform_tip = $('div.successfully-remove');

		if ($inform_tip.length && $inform_tip.attr('data-highlight') == 'true') {
			setTimeout(function() {
				$inform_tip.fadeOut();
			}, 3000);
		}

		/**
		 * @author lianghe
		 * @desc 消息中心处理求跟随消息
		 */
		;
		(function() {
			var elem = $('ul.request-list'), agreeUrl = '/a/app/friend/quest/accept.do', refuseUrl = '/a/app/friend/quest/refuse/request.do';

			function findLi(xpt) {
				return elem.find('li[data-xpt="' + xpt + '"]');
			}

			var card = new $.iCard({
				bindElement : elem,
				showInviteCheckbox : false,
				onFollow : function(param) {
					var $li = findLi(param.xpt);
					$li.find('a.agree').attr('class', 'agree-act').text('已同意');
					remote($li, agreeUrl, 'agree', false);
				},
				onSetGroup : function(param) {
					updateList(findLi(param.xpt));
				},
				onCancelSetGroup : function(param) {
					updateList(findLi(param.xpt));
				}
			});

			if (elem.find('li')) {
				var target;
				elem.click(function(event) {
					target = event.target;
					if (target.tagName.toLowerCase() === 'a') {
						if (target.className === 'agree') {
							target.className += '-act';
							target.innerHTML = '已同意';
							remote(target, agreeUrl, 'agree', true);
						}
						if (target.innerHTML === '拒绝') {
							$.confirm({
								title : false,
								content : '确定要拒绝本次邀请吗？',
								onConfirm : function() {
									remote(target, refuseUrl, 'refuse');
								}
							});
						}
					}
				});
			}
			function remote(elem, url, inv, bShowGroupDlg) {
				var li = $(elem).closest('li[data-xpt]'), a = li.find('a[data-card-action^="xpt"]'), name = a.text(), xpt = li
				.attr('data-xpt');

				request(url, {
					'xpt' : xpt
				}, function(data) {
					if (data.code === 0) {
						if (inv === 'agree') {
							// 添加请求跟随者跟随被请求者，发送请求不处理是否成功或者失败
							request('/a/app/friend/friend/addMulti.do', {
								'xpt' : xpt
							}, function(data) {
								if (data.code === 0) {// 成功
									// 弹出设置分组对话框
									if (bShowGroupDlg && $.iCard && $.iCard.SetGroupsDialog) {
										$.iCard.SetGroupsDialog.show({
											'friendid' : data.friendId,
											'nick' : name,
											'friendType' : 1,// 不显示是否邀请TA跟随
											'xpt' : xpt
										}, function() {
											setTimeout(function() {
												updateList(li);
											}, 1500);
										});
									}
								} else {
									$.inform({
										icon : 'icon-error',
										delay : 1000,
										easyClose : true,
										content : data.msg || '跟随好友失败'
									});
								}
							});
						} else {
							// 拒绝成功更新dom节点
							updateList(li);
						}
					} else {
						$.inform({
							icon : 'icon-error',
							delay : 1000,
							easyClose : true,
							content : data.msg || '处理求跟随失败'
						});
					}
				});
			}
			;
			function request(url, params, callback) {
				$.ajax({
					url : url,
					data : params,
					type : 'get',
					dataType : 'json',
					success : function(data) {
						callback && callback(data);
					},
					error : function(data) {
						$.inform({
							icon : 'icon-error',
							delay : 1000,
							easyClose : true,
							content : '服务器端发生错误'
						});
					}
				});
			}

			function updateList(li) {
				var url = li.find('i.inform-icon-del').parent().get(0).href;
				location.href = url;
			}

			// 全部同意求跟随消息
			$('#agreeAll').click(function() {
				var lis = $('ul.request-list').find('li'), xpt, ids = [], xpts = [], param;
				$.each(lis, function(i, li) {
					xpt = $(this).attr('data-xpt');
					ids.push(this.id);
					xpts.push(xpt);
				});
				xpts = xpts.join(',');
				param = {
					xpts : xpts
				};

				request('/a/app/friend/quest/acceptbatch.do', param, function(data) {// 接受跟随邀请
					if (data.code === 0) {
						request('/a/app/friend/friend/addMultiBatch.do', param, function(data) {// 批量加互相跟随
							if (data.code === 0) {
								ids = ids.join(',');
								if (ids) {
									deleteMsg(ids, 'agreeallok=1');
								}
							}
						});
					}
				});
			});
		})();

		/**
		 * @param {}
		 *            id
		 * @desc 删除求跟随消息
		 */
		function deleteMsg(id, s) {
			var param = {
				type : 'T0202',// 消息类型，此处是求跟随请求
				id : id
			};
			$.getJSON('/a/request/home/delete', param, function(data) {
				if (data.code === 0) {
					location.href = 'http://i.sohu.com/request/home/request/list.htm?type=request_follow&from=-1&' + s;
				} else {
					$.inform({
						icon : 'icon-error',
						delay : 1000,
						easyClose : true,
						content : data.msg || '求跟随消息删除失败'
					});
				}
			});
		}
	});

})(jQuery);
/**
 * 更新未读短消息数
 */
require('core::util::jQuery', '#document', function($) {
	onUnreadMsgCount = function(ret) {
		delete onUnreadMsgCount;
		if (ret.status && ret.msg != 0) {
			var span = $('ul.tabs-menu>li>a>span')[1];
			span.innerHTML += '<i class="icon-inform-count">' + ret.msg + '</i>';
		}
	};
	loadScript('http://d.me.sohu.com/operations?productid=isohu&type=getUnreadMsgCount&callback=onUnreadMsgCount&magicCode='
	+ $space_config.magic, null, true);
});