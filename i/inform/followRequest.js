/**
 * @desc 求跟随消息处理
 */
;(function($) {
    var pager = {
	init: function(element, option) {
	    this._config.element = element;
	    this._config.callback = option.callback;
	    if(this._config.callback) {
		this._config.element.bind('click', this._activePage);
	    }
	    this._config.size = option.size;
	    this.refresh(option);
	},
	refresh : function(info) {
	    this._updatePages(this._calculate(info));
	},
	_calculate : function(info) {
	    var pageCount = 0, 
		pageNow = -1, 
		pagePrev = -1, 
		pageNext = -1, 
		pageInfo = {};

	    var count = info.count, 
		start = info.start, 
		size = this._config.size, 
		radios = 1;
	    pageCount = Math.ceil(count / size);
	    pageNow = Math.min(Math.floor(start / size), pageCount - 1);
	    pagePrev = pageNow - 1;
	    pageNext = (pageNow == pageCount - 1 ? -1 : (pageNow + 1));
	    var listStart = -1, 
		listEnd = -1;
	    if (pageCount >= 2) {
		listStart = 0;
		listEnd = pageCount - 1;
	    }
	    pageInfo = {
		listStart : listStart,
		listEnd : listEnd
	    }
	    pageInfo.pageCount = pageCount;
	    pageInfo.pageNow = pageNow;
	    pageInfo.pagePrev = pagePrev;
	    pageInfo.pageNext = pageNext;
	    return pageInfo;
	},
	_updatePages : function(pageInfo) {
	    var html = [],
		s = '';
	    if (pageInfo.pageCount > 1) {
		html.push(' <a href="javascript:void(0);" class="' + (pageInfo.pagePrev > -1 ? 'txt" data-page="' + pageInfo.pagePrev : 'null') + '">上一页</a>');
		html.push(' <span class="page-num page-num-active"><p style="display:none;">');
		for (var i = pageInfo.listStart; i <= pageInfo.listEnd; i++) {
		    if(i === pageInfo.pageNow) {
			s = '<span><span class="cpage">第' + (i + 1) + '页</span><span class="btn-arrow"></span></span>';
		    }
		    html.push(this._getPage(i, pageInfo.pageNow, i + 1));
		}
		html.push('</p>');
		html.push(s);
		html.push('</span>');
		html.push(' <a href="javascript:void(0);" class="' + (pageInfo.pageNext > -1 ? 'txt" data-page="' + pageInfo.pageNext : ' null') + '">下一页</a> ');
	    }
	    this._config.element.html(html.join(''));
	},
	_getPage: function(page, pageNow, text) {
	    var r = [];
	    r.push('<a href="javascript:void(0);" data-page="' + page + '" ');
	    if(page === pageNow) {
		r.push('class="curt"');
	    }
	    r.push('>第' + text + '页</a>');
	    r = r.join('');
	    return r;
	},
	_activePage: function(event) {
	    var element = $(event.target).closest('a[data-page]');
	    if(element && element.attr('data-page')) {
		pager._config.callback(parseInt(element.attr('data-page'), 10) * pager._config.size);
	    }
	},
	_config: {
	    element: null,
	    callback: null,
	    size: 0	 
	}
    };
    
    var followRequest = {
	init: function() {
	    this._config.container = $('#request-list');
	    this._list();
	    this._regEvent();
	    this._card(); 
	},
	_list: function() {
	    var _self = this,
		s;
	    this._request(function(data) {
		s = _self._template(data); 
		_self._config.container.html(s);
	    });
	},
	_regEvent: function() {
	    var _self = this,
		li,
		xpt,
		param;
	    
	    //同意全部请求
	    $(this._config.agreeTotal).click(function() {
		var ids = [],
		    xpts = [];
		    li = _self._config.container.find('li');

		    $.each(li, function() {
			xpt = $(this).attr('data-xpt');
			ids.push($(this).attr('data-id'));
			xpts.push(xpt);
		    });

		    xpts = xpts.join(',');
		    param = {
			xpts: xpts
		    };

		    _self._ajax(_self._config.batchAgreeUrl, param, function(data) {//接受跟随邀请
			if(data.code === 0) {
			    _self._ajax(_self._config.batchAddUrl, param, function() {//批量加互相跟随
				if(data.code === 0) {
				    ids = ids.join(',');
				    if(ids) {
					_self._agree(ids);
				    }
				}
			    });
			}
		    });
	    });
	    
	    //拒绝全部请求
	    $(this._config.ignoreTotal).click(function() {
		$.confirm({
		    title : false,
		    icon : "icon-question",
		    content : "是否要删除所有请求？<br/>被删除的请求将无法恢复！",
		    labConfirm : "确认",
		    labCancel : "取消",
		    onConfirm : function() {
			var ids = [];
			li = _self._config.container.find('li');
			$.each(li, function() {
			    ids.push($(this).attr('data-id'));
			});
			ids = ids.join(',');
			_self._refuse(ids);
		    },
		    onCancel: function() {
			return false;
		    }
		});
	    });

	    //同意、拒绝单个求跟随请求
	    this._config.container.click(function(event) {
		var elem = event.target,
		    s = elem.className;
		switch(s) {
		    case 'agree':
			elem.className += '-act';
			elem.innerHTML = '已同意';
			_self._single(elem, _self._config.agreeUrl, 'agree', true);				
			break;
		    case 'refuse-request':
		    case 'request-icon-del':
			$.confirm({
			    title : false,
			    content : '确定要拒绝本次邀请吗？',
			    onConfirm : function() {
				_self._single(elem, _self._config.refuseUrl);
			    }
			});				
			break;
		    case 'inform-icon-del':
			if(elem.parentNode.className === 'request-icon-del')
			    $.confirm({
				title : false,
				content : '确定要拒绝本次邀请吗？',
				onConfirm : function() {
				    _self._single(elem, _self._config.refuseUrl);
				}
			    });
			break;
		    default:
			break;
		}
	    });
	},
	_single: function(elem, url, type, s) {
	    var _self = this,
		li = $(elem).closest('li[data-xpt]'), 
		nick = li.find('.request-nick'), 
		name = nick.text(), 
		xpt = li.attr('data-xpt'),
		param = {
		    xpt: xpt
		};
	    this._ajax(url, param, function(data) {
		if (data.code === 0) {
		    if (type === 'agree') {
			//添加请求跟随者跟随被请求者，发送请求不处理是否成功或者失败
			_self._ajax(_self._config.addMultiUrl, param, function(result) {
			   if (result.code === 0) {//成功
				// 弹出设置分组对话框
				if (s && $.iCard && $.iCard.SetGroupsDialog) {
				    $.iCard.SetGroupsDialog.show({
					'friendid': result.friendId,
					'nick': name,
					'friendType': 1,//不显示是否邀请TA跟随
					'xpt': xpt
				    }, function() {
					setTimeout(function() {
					    _self._remove(li);
					}, 1500);
				    });
				}
			    }else{
				_self._error(result.msg);
			    } 
			});
		    }else{
			// 拒绝成功更新dom节点
			_self._remove(li);
		    }
		}else{
		    _self._error(data.smg);
		}	
	    });
	},
	_request: function(option, fn) {
	    var _self = this,
		param,
		count = this._config.count,
		start = 0;
	    if(typeof option === 'function') {
		fn = option;
		option = null;
	    }
	    param = $.extend({
			start: 0,
			count: count,
			type: 'T0202' 
		    }, option || {});

	    start = param.start;
	    this._ajax(this._config.listUrl, param, function(result) {
		if(result.code === 0) {
		    var data = result.data,
			total = data.total;//求跟随数量
			if(!total) {//没有求跟随请求
				_self._noData();
			}else{
				if(start >= total) {
					_self._special(start);
				}else{
					fn && fn(data.list);

				//分页
				_self._initPager({
					count: total,
					start: start,
					size: count
				});	
				}
			}
		}else{
		    _self._error(result.msg);
		}
	    });	  
	},
	_template: function(data) {
	   var i = 0,
	       length = data.length,
	       cur,
		   img,
	       r = [];
	    for(; i < length; i++) {
		cur = data[i];
		if(cur) {
			img = cur.parameters.senderImage || null;
		    r.push('<li data-xpt="' + cur.senderXpt + '" data-id="' + cur.id + '"><div class="photo">');
		    r.push('<a href="' + cur.parameters.senderHomeUrl + '" target="_blank"><img onerror="this.src=mysohu.userFace" src="' + img + '" data-card="true" data-card-action="xpt=' + cur.senderXpt + '"/></a>');
		    r.push('</div><div class="con">');
		    r.push('<div class="title"><div class="left"><a href="' + cur.parameters.senderHomeUrl + '" target="_blank" class="request-nick" data-card="true" data-card-action="xpt=' + cur.senderXpt + '"> ' + cur.senderNickname + ' </a>邀请你与TA互相跟随，并对你说 </div>');
		    r.push('<span>' + this._dateFormat(cur.time) + ' <a href="javascript:void(0);" class="request-icon-del"><i class="inform-icon-del"></i></a></span></div>');
		    r.push('<div class="text"><div class="arrow"></div>' + cur.description + '</div>');
		    r.push('<div class="btn"> <a class="agree" href="javascript:void(0);">同意</a> <a class="refuse-request" href="javascript:void(0);">拒绝</a> <br clear="all"></div></div></li>');	
		}
	    }
	    r = r.join('');
	    return r;
	},
	_agree: function(id) {
	    this._delete(id, 'agree');			
	},
	_refuse: function(id) {
	    this._delete(id, 'refuse');
	},
	_delete: function(id, s) {
	    var _self = this,
	    param = {
			type: 'T0202',//消息类型，此处是求跟随请求
			id: id
	    };
	    
	    this._ajax(this._config.deleteUrl, param, function(data) {
			if(data.code === 0) {
				if(typeof s === 'function') {
					s();
				}else{
					//同意全部请求、拒绝全部请求成功提示
					_self._reportMsg(s, function() {
						 _self._refresh();
					});	
				}
			}else{
				_self._error(data.msg);
			}					
	    });
	},
	_update: function(option) {
	    var _self = this,
		s;

	    this._request(option, function(data) {
		s = _self._template(data); 
		_self._config.container.fadeOut(500, function() {
		    _self._config.container.html(s).fadeIn(500);
		    $(window).scrollTop(0);
		});
	    });
	},
	_refresh: function(option) {
	    this._update(option);
	},
	_remove: function(li) {
	    var _self = this;
	    this._delete(li.attr('data-id'), function() {
		li.slideUp(500, function() {
		    li.remove();	
		    if(!_self._config.container.find('li').length) {
			_self._refresh();	
		    }
		});	
	    });
	},
	_initPager: function(option) {
	    if(option.count > this._config.count) 
			this._pageBar(option);  
		else
			this._config.container.next().remove();
	},
	_pageBar: function(option) {
	    this._config.container.next().remove().end().parent().append('<div class="ui-pagination" id="request-pageBar"></div>');

	    var element = $('#request-pageBar');
	    option['callback'] = this._goPage;
	    
	    pager.init(element, option);
	},
	_goPage: function(start) {
	    var option = {
		    start: start
		};
	    followRequest._refresh(option);
	},
	_card: function() {
	    var _self = this,
		elem = _self._config.container;

	    new $.iCard({
		bindElement: elem,
		showInviteCheckbox: false,
		onFollow: function(s){
		    var li = elem.find('li[data-xpt="' + s.xpt + '"]');
		    li.find('a.agree').attr('class', 'agree-act').text('已同意');
		    _self._single(li, _self._config.agreeUrl, 'agree', false);
		},
		onSetGroup: function(s){
		    var li = elem.find('li[data-xpt="' + s.xpt + '"]');
		    _self._remove(li);
		},
		onCancelSetGroup: function(s){
		    var li = elem.find('li[data-xpt="' + s.xpt + '"]');
		    _self._remove(li);
		}
	    });
	},
	_reportMsg: function(s, callback) {
		var _self = this,
			r = [],
			tips;
		r.push('<div class="successfully-remove" data-highlight="true"><i class="inform-icon-right"></i>');
		if(s === 'agree') {
			r.push('同意成功');
		}else{
			r.push('忽略成功');
		}
		r.push('</div>');
		r = r.join('');

		this._config.container.next().hide().end().fadeOut(500, function() {
			tips = $(r).insertBefore(_self._config.container.parent());
		
			setTimeout(function() {
				tips.remove();
				callback && callback();
			}, 3000);
		});
	},
	_special: function(s) {
		var r = s - this._config.count;
		this._refresh({start: r});
	},
	_noData: function() {
	    $(this._config.agreeTotal).replaceWith('<span style="color:gray">同意全部请求</span>');
	    $(this._config.ignoreTotal).replaceWith('<span style="color:gray">忽略全部请求（慎用）</span>');
		if(!this._config.container.is(':visible')) 
			this._config.container.show();
		
	    this._config.container.html('<div class="inform-normal">没有求跟随请求~</div>');	
		this._config.container.next().remove();
	},
	_ajax: function(url, param, fn) {
	    if(typeof param === 'function') {
		fn = param;
		param = null;
	    }
	    $.ajax({
		url: url,
		data: param,
		dataType: 'json',
		type: 'post',
		success: fn,
		error: function() {
		}
	    });
	},
	_error: function(msg) {
	    msg = msg || '服务器错误';
	    $.inform({
		icon : 'icon-error',
		delay : 1000,
		easyClose : true,
		content : msg
	    });
	},
	_dateFormat: function(date) {
	    if(this._isDate(date)) {
			return date.substring(0, 19);
	    }else{
			return date;
	    }
	},
	_isDate: function(date) {
	    var s = (date || '').split(' ')[0];
	    if(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(s)) {
			return true;
	    }else{
			return false;
	    }
	},
	_config: {
	    count: 10,//指定每页显示多少条
	    container: null,
	    agreeTotal: '#agree-total',
	    ignoreTotal: '#ignore-total',
	    listUrl: '/a/request/home/requests',
	    agreeUrl: '/a/app/friend/quest/accept.do',
	    refuseUrl: '/a/app/friend/quest/refuse/request.do',
	    addMultiUrl: '/a/app/friend/friend/addMulti.do',
	    batchAgreeUrl: '/a/app/friend/quest/acceptbatch.do',
	    batchAddUrl: '/a/app/friend/friend/addMultiBatch.do',
	    deleteUrl: '/a/request/home/delete'
	}
    };
	
    $(function() {
	followRequest.init();
    });
})(jQuery);

