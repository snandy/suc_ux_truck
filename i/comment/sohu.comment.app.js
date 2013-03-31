(function($){
	$.getScript = function(url, callback, value){
		var cache = true;
		var parameter = [];
		if (!!value && typeof value == "object") {
			cache = value.cache ? value.cache : false;
			parameter = value.parameter ? value.parameter : [];
		} else if (!!value && typeof value == "boolean") {
			cache = value;
		}
		
		setTimeout(function(){
			$.ajax({
				type: "GET",
				url: url,
				success: function(){
					try {
						callback.apply(this, (parameter));
					} catch (e) {
					}
				},
				dataType: "script",
				cache: cache
			});	
		},0)
	};
	/**
	 * 字符串优化类
	 */
	$.Buffers = function(){
		this._s = new Array;
	};
	$.Buffers.prototype = {
		append: function(str){
			this._s.push(str);
		},
		toString: function(){
			var str = this._s.join("");
			this._s.length = 0;
			return str;
		}
	};
})(jQuery);

(function($){
	// Private functions.
	var p = {
		comments: {}
	};
	/**
	 * 输入框渲染类
	 * @param {Object} $t
	 * @param {Object} opts
	 */
	p.Model = function($t, opts){
		p.me = this;
		this.$layout = $t;
		this.opts = opts;
		
		//不显示输入框
		if (!opts.editor) {
			window.commTemplates = theCode[1];
			return;
		}else{
			window.commTemplates = theCode[0];
		}
		//初始化
		this.Init()
		
	};
	/**
	 * 输入框功能
	 */
	p.Model.prototype = {
		/**
		 * 初始化一些模块
		 */
		Init: function(){
			var _t = this;
			//回填输入框代码
			_t.inputHTML();
			//热点新闻 
			_t.hotNewsScrollEvts();
			//加载输入自定义事件
			_t.InputEvts();
			
		},
		inputHTML: function(){
			var _t = this, $opts = _t.opts, $layout = _t.$layout, inputInf = {}, hotNews,s = new $.Buffers();
			
			if($($opts.feedLoading).length> 0){
				$($opts.feedLoading).hide();
			}	
				
			$.each($opts.hotTopicsData, function(i){
				//压入列表
				s.append($.fn.commMain.ParseTpl($.fn.commMain.defaults.$hotNews, $.extend(true, {}, $opts.hotTopicsData[i],{commentNum:i}), true));
			})
			
			hotNews =s.toString();
			
			$.extend(inputInf, {
				login_rePic: $opts.$login_rePic,
				login_reLink: $opts.$login_reLink,
				ico: $opts.$ico,
				url: $opts.$url,
				comm_newmsg: '',
				comm_nameInfoad: $opts.comm_nameInfoad,
				comm_textAD: $opts.comm_textAD,
				hotNews: hotNews
			});
		
			$layout.prepend($.fn.commMain.ParseTpl(commTemplates.textstr, inputInf));
			//$layout.prepend("更新时间："+SohuComment.version)
		},
		hotNewsScrollEvts:function(){
			var _t = this, $opts = _t.opts, $layout = _t.$layout;	
			var hotNewsWrapper,leftScrollBtn,rightScrollBtn,hotNewsObj;
			var hotTopicsData,totalNum,topicId;
			//按钮鼠标事件
			hotNewsWrapper = $($.fn.commMain.defaults.sentenceBoxComm).find(".hot-news-wrapper");
			hotNewsObj = $(hotNewsWrapper).find("div.hot-news").eq(0);
			leftScrollBtn = $($.fn.commMain.defaults.sentenceBoxComm).find(".comment-news-btn .news-l-btn a");
			rightScrollBtn = $($.fn.commMain.defaults.sentenceBoxComm).find(".comment-news-btn .news-r-btn a");
			
			leftScrollBtn.add(rightScrollBtn).hover(function(){
				$(this).addClass("btn-now");
			},function(){
				$(this).removeClass("btn-now");
			});
			
			hotTopicsData = $opts.hotTopicsData;
			totalNum = hotTopicsData.length + 1;
			hotNewsWrapper.css("width",totalNum * hotNewsObj.width())
			//topicId = hotNewsObj.attr("data-commentid");
			//opts.topicId = "317264738"			
			$.extend($opts,{topicId:hotNewsObj.attr("data-commentid"),topicNum:hotNewsObj.attr("comment-num")});
			var sa = $($.fn.commMain.defaults.sentenceBoxComm);//id, 内容, 列表, 按钮, 时间, 个数			
			_t.scrollHandler(sa, sa.find(".hot-news-wrapper"), sa.find(".hot-news"), sa.find(".comment-news-btn"), 300, 1);
		},
		scrollHandler:function(rr, conr, lisr, btns, ts, unit, ft){
			var _t = this, $opts = _t.opts, $layout = _t.$layout;	
			var hotNewsWrapper = $($.fn.commMain.defaults.sentenceBoxComm).find(".hot-news-wrapper");
			var hotNewsObj = $(hotNewsWrapper).find("div.hot-news");		
			var conr0 = conr[0],
			btnPr = btns.find('.news-l-btn a'),
			btnNr = btns.find('.news-r-btn a'),
			cls = "libg";
			
			var ff = ft||false;
			if (lisr.length <= 1) return;
			
			var pnumr = unit, numr = lisr.length;
			if(numr <= pnumr) {btnWr.hide();return;}
			
			var owr = lisr[1].offsetLeft - lisr[0].offsetLeft, 
				idxArear = [0, numr - pnumr],
				idxr = 0;
			
			if(ff) owr = lisr[1].offsetTop - lisr[0].offsetTop;
			
			function updateNum(n){
				if (n > idxArear[1] || n < idxArear[0]) {return;}
				
				btnPr[((n == 0)?'add':'remove') + 'Class']('uN');
				btnNr[((n == idxArear[1])?'add':'remove') + 'Class']('dN');
				
				idxr = n;
				if(ff){
					conr.stop().animate({top: -n * owr},ts);
				}else{
					conr.stop().animate({left: -n * owr},ts);
				}
			}
			
			btnPr.click(function(ev){	
				if(idxr <= 0){                                      //by zhangshuqing 2011-09-28
					idxr = 6;
				}	
				updateNum(idxr - 1);
				$.extend($opts,{topicId:hotNewsObj.eq(idxr).attr("data-commentid"),topicNum:hotNewsObj.eq(idxr).attr("comment-num")});
				return false;
			});
			btnNr.click(function(ev){	
				if(idxr+1 >= lisr.length){                          //by zhangshuqing 2011-09-28
					idxr = -1;
				}
				updateNum(idxr + 1);
				$.extend($opts,{topicId:hotNewsObj.eq(idxr).attr("data-commentid"),topicNum:hotNewsObj.eq(idxr).attr("comment-num")});							
				return false;
			});
		},
		/**
		 * 加载输入框及周围的一些事件
		 */
		InputEvts: function(){		
			//console.log("11","InputEvts")
			var _t = this, $opts = _t.opts, $layout = _t.$layout;			
			//输入框事件
			var $sentencePostArea = $('.sentence-box-comm .post-area');//一句话内容输入框		
			$sentencePostArea.bind('mouseover.sentencebox', function(event) {$(this).addClass('post-area-hover');})
							 .bind('mouseout.sentencebox', function(event) {$(this).removeClass('post-area-hover');})
							 .bind('click.sentencebox', function(event) {$(this).addClass('post-active-hover');});	
			//$($opts.comActionWrapper).bind("blur", _t.blurHandler)
			$($opts.comBord).bind("keyup", _t.inputKey)
							.bind("paste", _t.inputKey)
							.bind("cut", _t.inputKey)
							.bind("focus", _t.focusHandler);
			
			// 表情事件绑定
			$.fn.commMain.bindemote($($opts.faceFrag), $($opts.comBord));
			
			//辩论事件			
			$($opts.commtopk).unbind();
			$($opts.commtopk).bind("click", function(){
				var $layout = $(this).closest(".sentence-box-comm"),$form = $layout.find(".post-action-wrapper"),$formPK = $layout.find(".formPK");
				$form.hide();
				var obj = $layout.find(".formPK .subFrm .pkBtn");
				$formPK.slideDown("fast", function(){
					_t.pkEvent(this);//加载辩论时的事件
				});
			});
			
			//提交事件
			$($opts.substr).bind("click", function(){
				//console.log("click....InputEvts")
				//为默认值 时,它应该不会是空，如果是，也是默认值是空的					
				var _tt = this,$this = $(_tt),$layout = $this.closest(".post-action-wrapper");					
				if ($($opts.comBord).val() == $opts.comm_textAD) {
					//$($opts.comBord).focus();                                            //by zhangshuqing 2011-09-26
					emptyContentAlert($($opts.comBord));
					$layout.find(".txt-error").html($opts.required).show();
					return;
				}else if($($opts.comBord).val() == ""){
					emptyContentAlert($($opts.comBord));
					//$layout.find("textarea").focus();					
					return;
				}
				
				//都没问题了，再提交，提交数据只做登录验证，其它的都在这做完。
				//_t.submitComm();
			});
		},
		/**
		 * 辩论事件
		 */
		pkEvent: function(me){	
			//console.log("22","pkEvent")		
			var _t = this, $opts = _t.opts, $layout = $(me).closest(".remark");
			
			//关闭辩论，返回评论
			$layout.find(".formPK .close").bind("click", function(){
				var _t = $(this), $layout = $(_t).closest(".remark");
				_t.unbind();
				$layout.find(".formPK").hide();
				$layout.find(".form").show();
				return false;
			});
			
			/**
			 * 三个输入框事件
			 */
			//标题事件
			$layout.find(".comBord").bind("keyup", _t.pkKey)
									.bind("paste", _t.pkKey)
									.bind("cut", _t.pkKey)
									.bind("focus", _t.focusHandler);
			//鼠标响应
			$layout.find(".comBord").hover(function(){
					$(this).addClass("bordOver");
				},function(){
					$(this).removeClass("bordOver");
				})
			
			//提交按钮
			$layout.find(".pkBtn .btn").bind("click", function(){
				var err = true,pkBtn = $layout.find(".pkBtn"),pktxtl = $layout.find(".pktxtl"),pktxtr = $layout.find(".pktxtr");
				//为空 时
				//console.log("222222---click")
				if (pkBtn.val() == "") {
					pkBtn.focus().next("span").html($opts.PKtitleReq);
					err = false;					
					emptyContentAlert(pkBtn);					
					return false;
				}else{
					var _len = $.fn.commMain.len(pkBtn.val());					
					if (_len > $opts.maxPKtitle) {
						$(_t).next("span").html($.fn.commMain.ParseTpl($opts.$MaxInputTxt, {
							maxInputLen: _len - $opts.maxPKtitle
						}));
						emptyContentAlert(pkBtn);						
						return false;
					}
				}
				if (pktxtl.val().replace(/\s/g, '') == "") {
					pktxtl.focus().next("span").html($opts.PKtitleOSP);
					err = false;
					emptyContentAlert(pktxtl);
					return false;
				}else{
					var _len = $.fn.commMain.len(pktxtl.val());					
					if(_len > $opts.maxInputPK) {
						$(_t).next("span").html($.fn.commMain.ParseTpl($opts.$MaxInputTxt, {
							maxInputLen: _len - $opts.maxInputPK
						}));
						emptyContentAlert(pktxtl);
						//报错时，提交按钮失效
						//$($opts.pkbtn).unbind("click");
						return false;
					}
				}
				
				if (pktxtr.val().replace(/\s/g, '') == "") {
					pktxtr.focus().next("span").html($opts.PKtitleOSP);
					err = false;
					emptyContentAlert(pktxtr);
					//_t.pkKey(this);
					return false;
				}else{
					var _len = $.fn.commMain.len(pktxtr.val());					
					if(_len > $opts.maxInputPK) {
						$(_t).next("span").html($.fn.commMain.ParseTpl($opts.$MaxInputTxt, {
							maxInputLen: _len - $opts.maxInputPK
						}));
						emptyContentAlert(pktxtr);
						//报错时，提交按钮失效
						//$($opts.pkbtn).unbind("click");
						return false;
					}
				}
				
				//都没问题了，再提交，提交数据只做登录验证，其它的都在这做完。	
				if (err) {
					//_t.submitComm();
					//console.log("............")
					$($opts.pkbtn).unbind("click").one("click", _t.submitComm);
					$($opts.pkbtn).trigger("click");
				}else{
					return false;
				}
			}).bind("mouseover", function(){
				$(this).addClass("over");
			}).bind("mouseout", function(){
				$(this).removeClass("over");
			});	
		},
		/**
		 * 评论输入框事件
		 * @param {Object} e
		 */
		inputKey: function(e){
			//console.log("33","inputKey")		
			var e = window.event || e, keyCode = e.keyCode || e.which;
			var _t = p.me, $opts = _t.opts, $this = $(this), $layout = $this.closest(".post-action-wrapper");
			var $btn = $layout.find("#sentence_submit")
			var _len = $.fn.commMain.len($.trim($this.val())), _max = ($opts.maxInput);			
			//评论框
			if (_len > _max) {
				$layout.find(".txt-error").html($.fn.commMain.ParseTpl($opts.$MaxInputTxt, {
					maxInputLen: _len - _max
				})).attr("errlen", _len - _max).show();
				
				//解除提交
				//$btn.unbind("click");
			} else {				
				$layout.find(".txt-error").html('').attr("errlen", 0).hide();
				//重新绑定提交				
				$btn.unbind("click").bind("click", _t.submitComm);
			}
			
			//输入框变形，这是个狂派的家伙！
			if ($(this).height() <= 66 && $(this).scrollTop() > 0) {
				$(this).css({
					wordWrap: "break-word",
					resize: "none"
				}).animate({
					height: "132px"
				})
			}			
			
			//快捷键
			if (e.ctrlKey && keyCode == 13) {
				//_t.submitComm;
				return;
			}
		},
		/**
		 * 辩论框事件
		 * @param {Object} e
		 */
		pkKey: function(e){	
			//console.log("44","pkKey")		
			var e = window.event || e, keyCode = e.keyCode || e.which;
			var _t = p.me, $opts = _t.opts, _i = this;			
			if(!_i.nodeType){return false}
			var _len = $.fn.commMain.len($.trim($(this).val()));
		
			//标题时的事件			
			if ($(_i).hasClass("pkBtn")) {
				if (_len > $opts.maxPKtitle) {
					$(_i).next("span").html($.fn.commMain.ParseTpl($opts.$MaxInputTxt, {
						maxInputLen: _len - $opts.maxPKtitle
					}));
					emptyContentAlert($(this));
					//报错时，提交按钮失效
					//$(this).closest(".formPK").find(".pkbtn").unbind("click");
					return false;
				}
			}
			if($(_i).hasClass("pkTa")){
				if(_len > $opts.maxInputPK) {
					$(_i).next("span").html($.fn.commMain.ParseTpl($opts.$MaxInputTxt, {
						maxInputLen: _len - $opts.maxInputPK
					}));
					emptyContentAlert($(this));
					//报错时，提交按钮失效
					//$($opts.pkbtn).unbind("click");
					return false;
				}
			}
			$(_i).next("span").html('');
			//如果都有值 。。。
			//$($opts.pkbtn).unbind("click").bind("click", _t.submitComm);
					
		},
		/**
		 * 聚焦事件
		 * @param {Object} e
		 */
		focusHandler: function(e){
			//console.log("55","focusHandler")		
			if ($(this).height() < 66 && $(this).hasClass("commtxt")){
				$(this).animate({"height": "66px"})
			}
			
			var e = window.event || e, keyCode = e.keyCode || e.which;
			var _t = p.me, $opts = _t.opts, $layout = $(this).closest(".sentence-box-comm");
			
			//评论或辩论			
			if ($(this).hasClass("commtxt")) {
				if ($(this).val() == $opts.comm_textAD) {					
					//清空并高亮边框					
					$layout.find(".post-area").addClass("post-active-hover").find("textarea").val('');
					$($opts.substr).unbind("click").bind("click", _t.submitComm);
		
				}else{
					$($opts.substr).unbind("click").bind("click", _t.submitComm);
				}				
				return ;
			} else {
				//辩论时的焦点处理，这留着以后可能用得着				
			}
			
		},
		//失去焦点事件
		blurHandler: function(e){			
			var $target = $(e.target);			
			var _t = p.me, $this = $(this),$opts = _t.opts, $layout = $(this).closest(".sentence-box-comm");
			//如果什么都没写,恢复默认;
			if ($this.val().replace(/\s/g, '') == "" || $this.val() == '') {				
				$this.closest(".post-area").removeClass(".post-active-hover").find("textarea").val($opts.comm_textAD);
				if ($this.height() >= 66) {
					$this.animate({
						height: "36px"
					});
				}					
				return false;
			}	
		},
		/**
		 * 提交表单
		 * @param {Object} e
		 */
		submitComm: function(e){
			//console.log("666","submitComm")
			var _t = p.me, $opts = _t.opts, d = $opts.data, _i = this, $layout = $(_i).closest(".form").length ? $(_i).closest(".form") : $($opts.form);
			var topicId = $opts.topicId, content = $layout.find("textarea").val(), s, ic = $layout.find(".comInput"), ip = $(ic).height();//ic是评论层，ip也是，ic,ip的区别是ip用来给提示层算父级的高时用的，这块代码结构处理得不好，有时间让刘凯改改吧。
			var buffer = new $.Buffers();
			//提交地址
			$opts.$commpost = $.fn.commMain.ParseTpl($opts.$commsubmit, $opts);
			//如果等于空	
			
			if ($(_i).attr("attr") == "comment"){	
				if (content == $opts.comm_textAD || content =="") {
					$layout.find("textarea").focus();				
					emptyContentAlert($($opts.comBord));
					$layout.find(".txt-error").html($opts.required).show();
					return false;
				}else {
					var _len = $.fn.commMain.len(content), _max = ($opts.maxInput);			
					//评论框
					if (_len > _max) {
						emptyContentAlert($($opts.comBord));
						$layout.find(".txt-error").html($.fn.commMain.ParseTpl($opts.$MaxInputTxt, {
							maxInputLen: _len - _max
						})).attr("errlen", _len - _max).show();
						return false;
					}
				}
				
			}
			else if ($(_i).attr("attr") == "pk"){//辩论	
				$layout = $(_i).closest(".formPK");
				//content = $layout.find(".pktxtl").val() + ' PK ' + $layout.find(".pktxtr").val();
				content = $layout.find(".subFrm .pkBtn").val();                                        //by zhangshuqing 2011-09-26
				buffer.append('<input type="hidden" name="debate" value="true" />');
				buffer.append('<input type="hidden" name="title" value="' + $layout.find(".pkBtn").val() + '" />');
			}else{
				return false;
			}			
			
			//转译html标签
			content = $.fn.commMain.encode(content);
			
			buffer.append('<input type="hidden" name="topicId" value="' + topicId + '" />');
			buffer.append('<input type="hidden" name="cmt_from" value="2" />');
			buffer.append('<textarea type="hidden" name="content" style="display:none">' + content + '</textarea>');
			buffer.append('<input type="submit" name="submitOK" value="发表" />');
			
			s = buffer.toString();			
			
			var submitover = function(){
				var debateCode = "";
				//恢复评论框或辩论框
				if ($(_i).attr("attr") == "comment") {
					$($opts.comBord).val("");									
					$($opts.comBord).one("blur",_t.blurHandler);
					$($opts.comBord).trigger("blur");					
				} else if ($(_i).attr("attr") == "pk") {
					//假显示用
					//content = $layout.find(".pkBtn").val();
					debateCode = $.fn.commMain.ParseTpl($opts.$debateCode, {
						debateUrl: 'javascript:void(0)',
						detateTarget: '',
						detateText: $opts.debateWait
					});
					$layout.find(".comBord").val('');
					//关闭PK，显示评论					
					$layout.closest(".sentence-box-comm").find(".formPK").hide();
					$layout.closest(".sentence-box-comm").find(".form").show();
					//ic = $layout.find(".pkInput");
					//ip = $layout.height() * 2 - 40;
				}
				//成功提示				
				$.inform({
							icon: "icon-success",
							delay: 3000,
							easyClose: true,
							content: "已提交，正在审核中，请耐心等待。"
						});
				//假显示 

				$($opts.comList).prepend($.fn.commMain.ParseTpl(commTemplates.commFalse, $.extend(true, {}, $opts.pp, {
					content: content.replace(/\n/g, "<br/>"),
					topicUrl:$opts.hotTopicsData[$opts.topicNum].url,
					topicTitle:$opts.hotTopicsData[$opts.topicNum].title,
					debateCode: debateCode,
					fansCount: $opts.relation.fansCount,
					commentsCount: $opts.relation.commentsCount,
					createTime: $.fn.commMain.time.friendly(new Date().getTime())
				}), true));
			
			};
			
			
			//清掉提交用的iframe,保证每个提交的onload生效。
			if ($("#divtarget").size() > 0) {
				$("#divtarget").remove();
			}
			
			//提交容器			
			$("<div/>").appendTo("body").css({
				top: "-5000px",
				left: "-1000px",
				position: "absolute"
			}).attr("id", "divtarget").append('<iframe name="commtarget" id="commtarget"></iframe>');
			
			$("#commtarget").bind("load", submitover);
			//debugger;
			$('<form/>').appendTo('#divtarget').attr('id', 'commform').attr('method', 'post').attr('action', $opts.$commpost).attr('target', 'commtarget').append(s).submit();
			
		}
	};
	
	/**
	 * 列表渲染类
	 * @param {Object} $t
	 * @param {Object} opts
	 */
	p.ModelList = function($t, opts){
		p.l = this;
		this.$layout = $t;
		this.opts = opts;
		//初始化		
		this.Init()		
	};
	/**
	 * 列表功能
	 */
	p.ModelList.prototype = {
		/**
		 * 初始化一些模块
		 */
		Init: function(){			
			var _t = this, $opts = _t.opts, $layout = this.$layout;
			var d = $opts.data;	
			//dom		
			_t.listHTML();			
			//事件
			_t.iintEvts();			
		},
		listHTML: function(){
			
			var _t = this, $opts = _t.opts, $layout = this.$layout;
			var d = $opts.data, s = new $.Buffers(), relationlist = $opts.relation, relation_me = "", debateCode = "";
			var commentContent = "",followerCount ="",replyCount = 0,rootId = 0,xpt = "";
			if($($opts.feedLoading).length> 0){
				$($opts.feedLoading).hide();
			}
			//tab
			if(!$($opts.panelNavWrapper).length && $opts.editor){
				$layout.append(commTemplates.listTap)	
			}			
		
			if($opts.editor){
				//设置默认排序样式			
				_t.changTab($opts.type);
			}else if (!$opts.editor && $($.fn.commMain.defaults.comList).length == 0) {				
				$layout.append($.fn.commMain.defaults.$pannelBoxList);
			}
			
			//查看更多
			//$layout.append($.fn.commMain.ParseTpl(commTemplates.listModel, d));			
			//列表HTML
			$.each(d.commentList, function(i){
				//格式化时间
				d.commentList[i].createTime = $.fn.commMain.time.friendly(d.commentList[i].createTime);
				//来自于				
				d.commentList[i].from = $.fn.commMain.from(d.commentList[i].from);
				//如果没头像
				d.commentList[i].authorimg = d.commentList[i].authorimg == "" ? $opts.$ico : d.commentList[i].authorimg;
				//pp转base64
				d.commentList[i].baseid = $.fn.commMain.base64(unescape(d.commentList[i].passport));
				
				//找关系
				/*
				if ($opts.login && relationlist.passport == $opts.pp.userId && $opts.editor) {
					var r = relationlist.relation[$.fn.commMain.base64(d.commentList[i].passport)];
					r = r == undefined ? 0 : r;
					if ($opts.pp.userId == d.commentList[i].passport) {
						r = 1;
					}				
					relation_me = $.fn.commMain.ParseTpl($.fn.commMain.relation(r));
				}*/
				
				//followerCount
				//回复我的显示粉丝、评论人数				
				if($opts.type == "reply_me"){
					 followerCount = $.fn.commMain.ParseTpl($.fn.commMain.defaults.$followerCount, d.commentList[i])
				}
				
				//显示昵称
				var nickName_str = '';                          //by zhangshuqing 2011-09-28
				var nickName = d.commentList[i].nickname;
				nickName_str = '<a href="{{#mylinks}}" target="_blank" data-card="true" data-card-action="xpt={{#baseid}}">{{#nickname}}</a>';           //by zhangshuqing 2011-09-28
				if(unescape(d.commentList[i].passport) == $opts.pp.userId && $opts.type == "my_post"){					//by zhangshuqing 2011-09-28	
					nickName=$.fn.commMain.defaults.nickName[0];
					nickName_str = '{{#nickname}}';                                                     //by zhangshuqing 2011-09-28
				}
				
				//是否辩论
				if (d.commentList[i].debate) {
					d.commentList[i].content = d.commentList[i].title;
					debateCode = $.fn.commMain.ParseTpl($opts.$debateCode, {
						debateUrl: $opts.lhost + $opts.topicId + '/d' + d.commentList[i].commentId + '.html',
						detateTarget: ' target="_blank"',
						detateText: $opts.debatePart
					});
				} else {
					debateCode = "";
				}
				//rootId = d.commentList[i].rootId == 0 ? d.commentList[i].commentId :  d.commentList[i].rootId;
				//xpt = d.commentList[i].rootId == 0 ? d.commentList[i].xpt : d.commentList[i].rootXpt;
				replyCount = d.commentList[i].replyCount;
				//如果有原文内容
				var authorSuffix = $.fn.commMain.defaults.$authorSuffix[0];
				if(d.commentList[i].replied){
					//是我发表的，还是xx回复的
					var authorName = d.commentList[i].replied.nickname;
					if(unescape(d.commentList[i].replied.passport) == $opts.pp.userId && $opts.type == "reply_me"){					/*by zhangshuqing 2011-09-28 start*/	
						authorName=$.fn.commMain.defaults.nickName[0];
						authorSuffix = $.fn.commMain.ParseTpl($.fn.commMain.defaults.$authorSuffix[2],$.extend({},d.commentList[i].replied,{nickname:authorName}),true);	
					}else{
						authorSuffix = $.fn.commMain.ParseTpl($.fn.commMain.defaults.$authorSuffix[1],$.extend({},d.commentList[i].replied,{nickname:authorName}),true);						
				  }                                                                                             /*by zhangshuqing 2011-09-28 end*/
					var originalContent = $.fn.commMain.ParseTpl(commTemplates.originalContent,$.extend({},d.commentList[i].replied,{nickname:authorName}),true);
					replyCount = 0;
				}
				
				//截字
				commentContent = $.fn.commMain.encode($.fn.commMain.change(d.commentList[i].content));
				
				//显示更多				
				if(commentContent.length > 100){					
					commentContent = commentContent.substr(0,100);
					var contentMore = $.fn.commMain.ParseTpl($.fn.commMain.defaults.$contentMore,$.extend({},{commentNum:i}),true);									
				}
				//压入列表
				s.append($.fn.commMain.ParseTpl(commTemplates.commList, $.extend(true, {}, d.commentList[i], {
					content: commentContent,
					nickname: nickName,
					followerCount: followerCount,
					contentMore: contentMore,
					debateCode: debateCode,
					relation_me: relation_me,
					authorSuffix: authorSuffix,
					originalContent: originalContent,
					replyCount: replyCount,
					nickName_str:nickName_str                                                   //by zhangshuqing 2011-09-28
					//rootId: rootId,
					//xpt: xpt
				}), true));
			})			
			//回填列表	
				
			if(!$opts.typeOld){				
				$opts.typeOld = $opts.type;				
				//回填列表
				$layout.find(".pannel-box-list").append(s.toString());
			}else if($opts.typeOld != $opts.type){
				//回填列表,其他tab页面
				$opts.typeOld = $opts.type;
				$layout.find(".pannel-box-list").html(s.toString());				
			}else{
				//回填列表
				$layout.find(".pannel-box-list").append(s.toString());						
			}
			
			//回填页码			
			$layout.pageList();
			
			//名片
			/*
			jQuery.iCard && new jQuery.iCard({
				params : {
					type : 'simple',
					pageid : 30
				},
				bindElement : '.pannel-box-list'
			});*/
			
		},
		/**
		 * 加载列表中的一些事件
		 */
		iintEvts: function(){
			var _t = this, $opts = _t.opts, $layout = _t.$layout;
			
			//展开全部			
			$($opts.comMore).each(function(){
				var commNum = $(this).attr("comment-num");
				$(this).data("contentAll",$opts.data.commentList[commNum].content);				
				$(this).click(function(){					
					var contentAll = $.fn.commMain.change($(this).data("contentAll"),"content");
					
					var contentObj  = $opts.editor ? $(this).closest(".comment-txt") : $(this).closest(".text");
					var moveObj = $opts.editor ? contentObj.prev("h3") : contentObj.closest(".comments-main");

					if ($(this).hasClass("top")){
						$(this).removeClass("top").addClass("bot").attr("title","关闭").hide().appendTo(moveObj);					
						contentObj.html(contentAll);						
					}else{
						$(this).removeClass("bot").addClass("top").attr("title","展开全部").hide().appendTo(moveObj);
						contentObj.html(contentAll.substr(0,100));						
					}
					$(this).appendTo(contentObj).show();
				});
			});
			
			//顶和回复的事件,这里直接调外挂
			
			$($opts.dingReply).each(function(i){
				var commentId = $(this).closest(".box").attr("data-commentid"), topicId = $(this).closest(".box").attr("data-topicId"), $commlist = $(this).closest(".box").find(".comment-box-sub");
				//顶				
				$(this).find("a").eq(0).agree(commentId, topicId);				
				//回复列表
				$(this).find("a").eq(1).reply($commlist, commentId);
			});
			
		},
		/**
		 * 修改排序标签默认状态
		 * @param {Object} n
		 */
		changTab: function(n){
			var _t = this, $opts = _t.opts;
			var tmp = {
				all_comment: 0,
				my_post: 2,
				reply_me : 4
			};
			$($opts.comMenu).find("li").removeClass("current");
			$($opts.comMenu).find("li").eq(tmp[n]).addClass("current");
			
			if(tmp[n] == 0){
				$($opts.comMenu).find("li").eq(1).hide();
				$($opts.comMenu).find("li").eq(3).show();
			}else if(tmp[n] == 2){
				$($opts.comMenu).find("li").eq(1).hide();
				$($opts.comMenu).find("li").eq(3).hide();
			}else if(tmp[n] ==4){
				$($opts.comMenu).find("li").eq(1).show();
				$($opts.comMenu).find("li").eq(3).hide();
			}
			//排序切换
			$.each(tmp, function(i, j){
				if (i == n) {
					$($opts.comMenu).find("li").eq(tmp[i]).unbind("click");
				} else {
					$($opts.comMenu).find("li").eq(tmp[i]).unbind("click").bind("click", function(){
						$($opts.comList).html('');
						SohuComment.GetModule("commList").Init($.extend({}, $opts, {
							type: i,
							pages: {
								pageNo: 1
							}
						}));
					});	
				}
			});
			//刷新			
			$($opts.comMenu).find("span.btn-reload a").unbind("click").bind("click",function(){
				$($opts.comList).html('');				
				SohuComment.GetModule("commList").Init($.extend({}, $opts, {					
					pages: {pageNo: 1},
					refresh: true
				}));
			})
		},
		/**
		 * 回复输入框事件
		 * @param {Object} e
		 */
		inputKey: function(e){
			var e = window.event || e, keyCode = e.keyCode || e.which;
			var _t = p.l, $opts = _t.opts;
			
			var _len = $.fn.commMain.len($.trim($(this).val()));
			var _rows = $.fn.commMain.len($.trim($(this).val()));
			var _max = ($opts.maxInput);
			
			if (_len > _max) {
				$($opts.erInfo).html($.fn.commMain.ParseTpl($opts.$MaxInputTxt, {
					maxInputLen: _len - _max
				})).show();
			} else {
				$($opts.form).find(".erInfo").html('').hide();
			}
			
			//快捷键
			if (e.ctrlKey && keyCode == 13) {
				//CMT.CommentSubmit(root_id);
				return;
			}
			
		},
		/**
		 * 聚焦事件
		 * @param {Object} e
		 */
		focusHandler: function(e){
			var _t = p.l, $opts = _t.opts;
			if ($($opts.comBord).val() == $opts.comm_textAD) {
				//清空并高亮边框
				$($opts.comInput).addClass("comInputOvr").find("textarea").val('');
			} else {
				//检查字字数
				//_t.keyLen(this);
			}
		}
		
	};
	
		//改变背景色
	function emptyContentAlert(a){		
        var b = [255, 200, 200];
        a.css("backgroundColor","rgb(" + b[0] + "," + b[1] + "," + b[2] + ")") ;
        var c = setInterval(function(){
            b[1] += 10;
            b[2] += 10;
            if (b[1] > 255) {
                clearInterval(c);
            }
             a.css("backgroundColor","rgb(" + b[0] + "," + b[1] + "," + b[2] + ")") ;
        }, 100);
    }
	/**
	 * 代码常量
	 */
	//var commTemplates =[{
	var theCode =[{	
		//输入框
		textstr:[
			'<div class="section sentence-box-comm remark">',			
			'<div class="comment-news">',
			'	<div class="hot-news-wrapper">',
			'		{{#hotNews}}',
			'	</div>',
			'</div>',
			'	<div class="comment-news-btn">',
			'		<div class="news-btn news-l-btn"><a href="javascript:void(0)" title="向左滚动"></a></div>',
			'		<div class="news-btn news-r-btn"><a href="javascript:void(0)" title="向右滚动"></a></div>',
			'	</div>',
			'	<div class="post-action-wrapper form">',
			'	<div class="post-wrapper">',
			'		<div class="post-wrapper-inner">',
			'			<div class="post-area" id="sentence_post_area">',
			'				<div class="post-state-wrapper">',
			'					<div style="height: 36px; display: ;" class="post-state success" id="post_state"></div>',
			'				</div>',
			'				<div class="textarea-wrapper post-state-success">',
			'				<textarea  class="commtxt comBord" rows="1" cols="60" id="onesentencetext" name="" style="">{{#comm_textAD}}</textarea>',
			'				</div>',
			'			</div>',
			'		</div>',
			'	</div>',
			'	<div class="post-action">',
			'		<div class="post-options">',
			'			<div class="pub-faces">',
			'				<div class="clearfix"><a id="emotion_panel_handle" href="javascript:void(0);"><span class="btn-emot"></span><i class="text">表情</i></a><div style="display:none;" class="faceFrag emotion-list"></div></div>',
			'			</div>',
			'			<div class="insert-pk">',
		    '   				<div class="clearfix"><a id="pk_panel_handle" href="javascript:void(0);"><span class="btn-insert-pk"></span><i class="text">辩论</i></a></div>',
		    '  			</div>',
			'		</div>',
			'		<div class="post-btns">',
			'			<div class="btn-submit"><a id="sentence_submit" href="javascript:void(0);" attr="comment"><span class="submit">发布</span></a></div>',
			//'			<div class="txt-number"><span class="txt-number-now">0</span> / 200</div>',			
			'			<div class="txt-error">请输入内容</div>',
			'		</div>',
			'	</div>',
			'	</div>',
			'<div class="formPK clearfix" style="display:none">',
			'	<h3><span>添加辩论话题</span><a href="javascript:void(0)" target="_blank" title="关闭" class="close"></a></h3>',
			'	<div class="subFrm clearfix"><span class="pkTt">辩论主题：</span><input type="text" class="comBord pkBtn" /><span class="pkInfo red"></span></div>',
			'	<div class="subFrm clearfix"><span class="pkTt">正方内容：</span><textarea class="pktxtl comBord pkTa"></textarea><span class="pkInfo redTa"></span></div>',
			'	<div class="subFrm clearfix"><span class="pkTt">反方内容：</span><textarea class="pktxtr comBord pkTa"></textarea><span class="pkInfo redTa"></span></div>',
			'	<div class="pkBtn clearfix"><input type="button" class="btn" value="发布" attr="pk" /></div>',
			'</div>',
			'</div>'
			].join(''),
		//tab标签
		listTap:[
			'<div class="section panel-nav-wrapper">',
			'	<div class="panel-nav-tit">',
			'		 <div class="tabs-extend">',
			'		 	<span class="btn-reload"><a href="javascript:void(0)" title="刷新"><i class="icon-reload"></i></a></span>',
			'		 </div>',
			'		<ul class="tabs-menu">',
			'			<li class="current"><a href="javascript:void(0)" title="全部说两句"><span>全部说两句</span></a></li>',
			'			<li style="display:none;" class="split-tag">|</li>',
			'			<li><a href="javascript:void(0)" title="我说的"><span>我说的</span></a></li>',
			'			<li class="split-tag">|</li>',
			'			<li><a href="javascript:void(0)" title="回复我的"><span>回复我的</span></a></li>',
			'		</ul>',
			'	</div>',
			'</div>',
			'<div class="section pannel-box-list"></div>'
			].join(''),
		//查看更多
		listModel:[].join(''),
		//评论列表 
		commList:[
			'<div class="section panel-box box" data-topicId="{{#topicId}}" data-commentId="{{#commentId}}" data-baseid="{{#baseid}}" data-xpt="{{#xpt}}">',
			'	<div class="comment-box clearfix">',
			'		<div class="comment-user">',
			'			<div class="comment-pic"><a href="{{#mylinks}}" target="_blank"><img src="{{#authorimg}}" title="{{#nickname}}" data-card="true" data-card-action="xpt={{#baseid}}" /></a></div>',
			'			<div class="com-follow-each">{{#relation_me}}</div>',
			'		</div>',
			'		<div class="comment-con">',
			'			<h3>{{#nickName_str}} {{#followerCount}} {{#authorSuffix}}</h3>',
			'			<div class="comment-txt">{{#content}} {{#contentMore}}</span></div>',
			'			{{#debateCode}}',
			'			{{#originalContent}}',
			'			<div class="comment-ort">[原文] <a href="{{#topicUrl}}" target="_blank">{{#topicTitle}}</a></div>',			
			'			<div class="mod-foot">',
		    '                <div class="item-info"><span class="feed-timestamp"><i class="icon i-forward"></i><a href="{{#endPageAtApp}}" target="_blank" >{{#createTime}}</a></span> <span class="feed-from">{{#from}}</span></div>',
		    '                <div class="item-behavior"><span class="feed-set"><a href="javascript:void(0)" class="sentence-forward">顶一下(<em>{{#spCount}}</em>)</a>　<a href="javascript:void(0)" class="sentence-comment">回复(<em>{{#replyCount}}</em>)</a></span></div>',
		    '            </div>',
			'		</div>',
			'		<div class="comment-box-sub"></div>',
			'	</div>',
			'</div>'
			].join(''),
		//原文内容
		originalContent:[
			'			<div class="comment-body">',
			'				<p><a href="{{#mylinks}}" target="_blank">{{#nickname}}</a> {{#content}}</p>',
			'			</div>',
			].join(''),
		//评论假显示                                                                 //by zhangshuqing 2011-09-29 #ico-#>image
		commFalse:[
			'<div class="section panel-box box" data-commentId="{{#commentId}}" data-baseid="{{#baseid}}">',
			'	<div class="comment-box clearfix">',
			'		<div class="comment-user">',
			'			<div class="comment-pic"><a href="{{#url}}" target="_blank"><img src="{{#image}}" title="{{#title}}"></a></div>',			
			'		</div>',
			'		<div class="comment-con">',
			'			<h3><a href="{{#mylinks}}" target="_blank">{{#title}}</a> 发表说两句</h3>',
			'			<div class="comment-txt">{{#content}}<span class="top" style="display:none"></span></div>',
			'			{{#debateCode}}',
			'			{{#originalContent}}',	
			'			<div class="comment-ort">[原文] <a href="{{#topicUrl}}" target="_blank">{{#topicTitle}}</a></div>',				
			'			<div class="mod-foot">',
		    '                <div class="item-info"><span class="feed-timestamp"><i class="icon i-forward"></i>{{#createTime}}</span></div>',
		    '            </div>',
			'		</div>',
			'		<div class="comment-box-sub"></div>',
			'	</div>',
			'</div>'
			
			].join(''),
		//回复列表输入框
		SubListModel:[
			'<div class="sub-com clearfix">',
			'	<div class="com-angle"></div>',
			'	<div class="comment-pic-sub">{{#login_replyPic}}</div>',
			'	<div class="sub-com-area">',
			'		<div class="sub-area"><textarea></textarea></div>',
			'		<div class="post-action">',
			'			<div class="post-options">',
			'				<div class="pub-faces">',
			'					<div class="clearfix"><a href="javascript:void(0);"><span class="btn-emot"></span><i class="text">表情</i></a><div style="display:none" class="faceFrag emotion-list"></div></div>',
			'				</div>',
			//'				<div class="time-send"><input type="checkbox" />同时转发</div>',
			'			</div>',
			'			<div class="post-btns">',
			'				<div class="btn-submit"><a href="javascript:void(0);"><span class="submit">评论</span></a></div>',
			//'				<div class="txt-number"><span class="txt-number-now">0</span> / 200</div>',			
			'				<div class="txt-error erInfo">请输入内容</div>',
			'			</div>',
			'		</div>',
			'	</div>',
			'</div>',
			'<div class="box-sub-list"></div>'
			].join(''),
		//回复列表
		subList:[
			'<div class="box-sub clearfix" data-replyId="{{#replyId}}" data-baseid="{{#baseid}}">',
			'	<div class="comment-pic-sub"><a href="{{#mylinks}}" target="_blank"><img src="{{#authorimg}}" title="{{#nickname}}"></a></div>',
			'	<div class="comment-con-sub">',
			'		<div class="com-list-head"><a href="{{#mylinks}}" target="_blank">{{#nickname}}</a> {{#content}}</div>',
			'		<div class="com-list-foot"><span>{{#createTime}}</span><a href="javascript:void(0)">顶一下</a>　<a href="javascript:void(0)">回复</a></div>',
			'	</div>',
			'</div>'
			].join(''),
		subFalse:[
			'<div class="box-sub clearfix">',
			'	<div class="comment-pic-sub"><a href="{{#url}}" target="_blank"><img src="{{#image}}" title="{{#title}}"></a></div>',
			'	<div class="comment-con-sub">',
			'		<div class="com-list-head"><a href="{{#url}}" target="_blank">{{#title}}</a> {{#content}}</div>',
			'		<div class="com-list-foot"><span>{{#createTime}}</span></div>',
			'	</div>',
			'</div>'
			].join('')		
	},{
		//评论列表 
		commList:[
			'<div class="section panel-box box" data-topicId="{{#topicId}}" data-commentId="{{#commentId}}" data-baseid="{{#baseid}}" data-xpt="{{#xpt}}">',
	        '  <div class="comments-box-area">',
	        '  	<div class="comments-body">',
	        '  		<div class="comments-head">',
	        '  			<span class="tit"><a href="{{#mylinks}}" target="_blank" >{{#nickname}}</a></span> {{#authorSuffix}}',
	        '  		</div>',
	        '  		<div class="comments-main">',
	        '  			<p class="text">{{#content}} {{#contentMore}}</p>',
			'			{{#debateCode}}',
			'			{{#originalContent}}',
			'			<p class="detail"><span>[原文]</span> <a href="{{#topicUrl}}" target="_blank">{{#topicTitle}}</a></p>',
			'		</div>',
			'		<div class="comments-foot">',
		    '        	<div class="item-info"><span class="feed-timestamp"><i class="icon i-forward"></i><a href="{{#endPageAtApp}}" target="_blank">{{#createTime}}</a></span> <span class="feed-from">{{#from}}</span></div>',
		    '        	<div class="item-behavior"><span class="feed-set"><a href="javascript:void(0)">顶一下(<em>{{#spCount}}</em>)</a>　<a href="javascript:void(0)">回复(<em>{{#replyCount}}</em>)</a></span></div>',
		    '        </div>',						
	        '  	</div>',
	        '	<div class="comments-conent comment-box-sub"></div>',
	        '  </div>',
	        '</div>'
			].join(''),
		//原文内容
		originalContent:[
			'<p class="preview"><span class="com-user"><a href="{{#mylinks}}" target="_blank">{{#nickname}}</a></span> {{#content}}</p>'
			].join(''),
		//评论假显示
		commFalse:[
			''			
			].join(''),
		//回复列表输入框
		SubListModel:[
			'<div class="comments-post sub-com">',
			'	<i class="icon-up-arrow"></i>',
			'	<div class="comments-post-pic">{{#login_replyPic}}</div>',
			'	<div class="comments-post-enter">',
			'    	<div class="post-wrapper">',
			'     		<div class="post-wrapper-inner">',
			'      			<div class="post-area">',
			'        			<div class="post-state-wrapper"><div id="post_state" class="post-state success" style="height: 36px; display: none;"></div></div>',
			'        			<div class="textarea-wrapper post-state-success">',
			'          				<textarea style="height: 36px; display: inline; background-color: rgb(255, 255, 255);" name="" cols="60" rows="1"></textarea>',
			'       				</div>',
			'      			</div>',
			'     		</div>',
			'    	</div>',
			'    	<div class="post-action">',
			'        	<div class="post-options">',
			'      			<div class="pub-faces"><a href="javascript:void(0)"><span class="btn-emot"></span><i class="text">表情</i></a><div class="faceFrag emotion-list" style="display:none"></div></div>',			      
			//'      			<div class="checkbox"><div class="clearfix"><input type="checkbox" /><a href=""><i class="text">同时转发</i></a></div></div>',
			'     		</div>',
			'     		<div class="post-btns"><div class="btn-submit"><a href="javascript:void(0)"><span class="submit" attr="reply">评论</span></a></div><div class="erInfo"></div></div>',
			'    	</div>',
			'    </div>',
			'</div>',
			'<div class="box-sub-list"></div>'
			].join(''),
		//回复列表
		subList:[
			'<div class="comments-list box-sub clearfix" data-replyId="{{#replyId}}" data-baseid="{{#baseid}}">',
			'	<div class="com-list-pic"><a href="{{#mylinks}}" target="_blank"><img src="{{#authorimg}}" alt="{{#nickname}}" data-card="true" data-card-action="xpt={{#baseid}}" /></a></div>',
			'	<div class="com-list-con">',
			'		<div class="com-list-head">',
			'			<span class="username"><a href="{{#mylinks}}" target="_blank" data-card="true" data-card-action="xpt={{#baseid}}">{{#nickname}}</a></span> <span class="txt">{{#content}}</span>',
			'		</div>',
			'		<div class="com-list-foot">',
			'			<span class="com-set"><a href="javascript:void(0)">顶一下</a> <a href="javascript:void(0)">回复</a></span>',
			'			<span class="com-timestamp">{{#createTime}}</span>',
			'		</div>',
			'	</div>',
			'</div>'
			].join(''),
		subFalse:[
			'<div class="comments-list">',
			'	<div class="com-list-pic"><a href="{{#url}}" target="_blank"><img src="{{#ico}}" alt="{{#title}}"></a></div>',
			'	<div class="com-list-con">',
			'		<div class="com-list-head">',
			'			<span class="username"><a href="{{#url}}" target="_blank">{{#title}}</a></span> <span class="txt">{{#content}}</span>',
			'		</div>',
			'		<div class="com-list-foot">',
			//'			<span class="com-set"><a href="javascript:void(0)">顶一下</a> <a href="javascript:void(0)">回复</a></span>',
			'			<span class="com-timestamp">{{#createTime}}</span>',
			'		</div>',
			'	</div>',
			'</div>'
			].join('')	
	}];
	window.theCode = theCode
	
	
	//main plugin body
	$.fn.commMain = function(opts){
		// Set the options.//用设置值改变默认值，大家一块用？
		//opts = $.extend({}, $.fn.commMain.defaults, opts, thecode);		
		if (!opts.editor) {
			window.commTemplates = theCode[1];
		}else{
			window.commTemplates = theCode[0];
		}
		opts = $.extend($.fn.commMain.defaults, opts, {
			commTemplates: commTemplates
		});
		
		// Go through the matched elements and return the jQuery object.
		return this.each(function(){
			p.comments[opts.modelName] = new p[opts.modelName]($(this), opts);
		});
		
	};
	
	// Public defaults.
	$.fn.commMain.defaults = {
		//配置项
		showList: true,
		topicId: 0,
		domain: '',
		pageList: false,
		fhost: 'http://comment.news.sohu.com/upload/comment4/',//内部文件地址域
		lhost: 'http://comment2.news.sohu.com/',//外部链接域
		dhost: 'comment4.news.sohu.com',//数据引用域
		maxInput: 1000,//评论最大字数
		maxPKtitle: 20,//辩论标题最大字数
		maxInputPK: 500,//辩论最大字数
		required: 	"评论内容不能为空",
		PKtitleReq: "请填写辩论标题",
		PKtitleOSP: "请填写您的观点",
		debatePart: '参与辩论',
		debateWait: '等待审核',
		comm_nameInfoad: '发表给力评论！说两句，得金币。',
		comm_textAD: '我的看法是...',
		commFulltxt: '快来说两句，发表您的见解！',//没有条数时显示的文字;
		nickName: ['我'],
		//默认值
		$MaxInputTxt: '超出{{#maxInputLen}}字',//描述
		//模板
		//列表容器,个人展示页列表生成时用
		$pannelBoxList:'<div class="section pannel-box-list"></div>',
		//数据链接,防止http请求,全变成跨域的
		$hotNews:'<div class="hot-news" data-commentid="{{#id}}" comment-num= {{#commentNum}}><h2>[热点新闻] <a href="{{#url}}" target="_blank">{{#title}}</a></h2><p>{{#desc}}</p></div>',
		$commsubmit: 'http://{{#host}}/post/comment.html',//评论提交
		$authorSuffix:['发表说两句','回复 <a href="{{#mylinks}}" target="_blank">{{#nickname}}</a>','回复 {{#nickname}}'],
		$commnetDetail:'<span class="comment-detail"><a href="http://i.sohu.com/p/{{#baseid}}/scomment/person/single/{{#commentId}}/" target="_blank" >详细内容&gt;&gt;</a></span>',
		$commnetSubDetail:'<div class="more-sub-list"><a href="http://i.sohu.com/p/{{#xpt}}/scomment/person/single/{{#commentId}}/" target="_blank" >查看全部回复&gt;&gt;</a></div>',
		$login_replyPic: '<a href="{{#url}}" target="_blank"><img src="{{#image}}" width="40" height="40" alt="" /></a>',         //by zhangshuqing 2011-09-29
		$feedLoading:'<div class="feed-item feed-loading"><div class="feed-loading-info">正在加载，请稍后...... </div></div>',
		$contentMore:'<span class="top" title="展示全部" comment-num="{{#commentNum}}"></span>',	
		$followerCount:'(<a href="http://i.sohu.com/p/{{#xpt}}/scomment/" target="_blank" title="评论数"><span class="pl">{{#commentsCount}}</span></a> <a  href="http://i.sohu.com/p/{{#xpt}}/app/friend/#/a/app/friend/fans/fansshow.do?xpt={{#baseid}}" target="_blank" title="跟随者"><span class="fs">{{#fansCount}}</span></a>)',//粉丝、评论人数
		$debateCode: '<div class="comment-pk"><a href="{{#debateUrl}}"{{#detateTarget}}>{{#detateText}}</a></div>',//pk
		//标签及列表
		comCanvas:	'#SOHUcomment',
		sentenceBoxComm:'#SOHUcomment .sentence-box-comm',
		form:		'#SOHUcomment .sentence-box-comm .post-action-wrapper',//评论层
		comInput:	'#SOHUcomment .sentence-box-comm .post-action-wrapper .textarea-wrappe',//输入层
		comActionWrapper:'#SOHUcomment .sentence-box-comm .post-action-wrapper',//评论表情层
		comBord:	'#SOHUcomment #onesentencetext',//评论输入框
		faceFrag:	'#emotion_panel_handle',//表情
		faceDiv:	'#SOHUcomment .sentence-box-comm .post-action .pub-faces .faceFrag',//表情层
		commtopk:	'#SOHUcomment .sentence-box-comm .post-action .insert-pk a',//转换辩论
		erInfo:		'#SOHUcomment .sentence-box-comm .post-action-wrapper .txt-error',//字数超限
		substr:		'#SOHUcomment .sentence-box-comm .post-action #sentence_submit',//评论提交
		formPK:		'#SOHUcomment .sentence-box-comm .formPK',//辩论
		closePK:	'#SOHUcomment .sentence-box-comm .formPK .close',//关闭辩论
		pkTt:		'#SOHUcomment .sentence-box-comm .formPK .subFrm .pkBtn',//辩论标题
		pkOp:		'#SOHUcomment .sentence-box-comm .formPK .subFrm .pktxtl',//辩论正方
		pkSp:		'#SOHUcomment .sentence-box-comm .formPK .subFrm .pktxtr',//辩论反方
		pkbtn:		'#SOHUcomment .sentence-box-comm .formPK .pkBtn .btn',//辩论提交
		
		comMenu: 	'#SOHUcomment .panel-nav-wrapper .panel-nav-tit',//tab切换		
		comList: 	'#SOHUcomment .pannel-box-list',//列表框架
		comMore:	'#SOHUcomment  span.top',//展开全部
		dingReply: 	'#SOHUcomment .panel-box span.feed-set',//顶,回复
		panelNavWrapper: '#SOHUcomment .panel-nav-wrapper',//列表Table
		feedLoading:'#SOHUcomment .feed-loading'
	};
	
	
	/**
	 * 标志替换
	 * @param {Object} str
	 * @param {Object} data
	 */
	$.fn.commMain.ParseTpl = function(str, data, changes){
		var result;
		var patt = new RegExp("\{{\#([a-zA-z0-9]+)\}}");
		while ((result = patt.exec(str)) != null) {
			var v = data[result[1]] === 0 ? "0" : data[result[1]] || '';
			if (changes) {
				v = $.fn.commMain.change(v, result[1]);
			}
			
			str = str.replace(new RegExp(result[0], "g"), v);
		};
		return str;
	};
	/**
	 * 获取指定长度的随机字符串。注意：仅仅由数字和字母组成
	 * @param {Object} size 随机字符串的长度
	 * @param {Boolean} plusTimeStamp 是否加上当前时间戳
	 */
	$.fn.commMain.RdStr = function(size, plusTimeStamp){
		var size0 = 8;
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		size = size || size0;
		size = size < 1 ? size0 : size;
		size = size > chars.length ? size0 : size;
		var s = '';
		for (var i = 0; i < size; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			s += chars.substring(rnum, rnum + 1);
		};
		if (plusTimeStamp) {
			s += new Date().getTime();
		};
		return s;
	};
	/**
	 * 算中英文长度
	 * @param {Object} val
	 * @param {Object} maxBytesLen
	 */
	$.fn.commMain.len = function(r, t){
		if (!t) {
			return Math.ceil(r.replace(/[^\x00-\xff]/g, 'xx').length / 2);
		} else {
			return r.length;
		}
	};
	 $.fn.commMain.encode = function(s){
	  //return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/([\\\.\*\[\]\(\)\$\^])/g,"\\$1");
	  return s.replace(/</g,"&lt;").replace(/%3C/g,"&lt;").replace(/>/g,"&gt;").replace(/%3E/g,"&gt;").replace(/&lt;br&gt;/g,"<br>");
	}
	 $.fn.commMain.decode = function(s){
	  return s.replace(/&gt;/g,">").replace(/&lt;/g,"<");
	}
	/**
	 * 转编码及表情
	 * @param {Object} str
	 */
	$.fn.commMain.change = function(str, v){
		var result = str, p = "", s = new Array();
		result = unescape(result);
		s["&#040;"] = "(";
		s["&#041;"] = ")";
		
		for (var n in s) {
			p += n + "|";
		}
		p = p.substring(0, p.length - 1);
		var regn = new RegExp("(" + p + ")", "gi");		
		if (v == "content") {
			result = result.replace(regn, function($1){
				return s[$1];
			});
			result = Emote.parseBlogEmote(result);
		}
		return result;
	};
	//处理中文base64
	$.fn.commMain.Base64Replace = function (b64){
		return b64.replace(/\+/g,'-').replace(/\//g,'_');
	}
	/**
	 * 转pp为Base64
	 * @param {Object} pp
	 */
	$.fn.commMain.base64 = function(pp){
		//return Base64 ? Base64.encode(/focus\.cn$/ig.test(pp) ? (pp + "@focus.cn") : pp) : pp;
		return $.fn.commMain.Base64Replace(Base64.encode(pp));
	};
	
	/**
	 *  表情事件绑定
	 * @param {Object} o 需要绑定的jQuery对象
	 * @param {Object} e textarea
	 */
	$.fn.commMain.bindemote = function(o, e){
		o.unbind("click");
		o.bind("click", function(){			
			if (typeof Emote == "function") {
				var offsetX = $(this).parent().offset().left;
				var offsetY = $(this).parent().offset().top;
				var editor = $(this).closest(".section").find("textarea");
				//Emote.show($(this).next(), e, offsetX, offsetY);
				Emote.show(null, editor[0]).css({
					'position' : 'absolute',
					'left' : $(this).parent().offset().left - 12 + "px",
					'top' : $(this).parent().offset().top + 15 + "px"
				});
			}
			return false;
		});
	};
	/**
	 * 评论回复的提交
	 * @param {Object} e
	 */
	$.fn.commMain.replysubmit = function(e){
		//if(mysohu.beLogin({
		//	self:this
		//}))return;
		//alert("11");
		var $opts = $.fn.commMain.defaults, _i = this, $layout = $(_i).closest(".sub-com");
		var topicId = $layout.parents(".box").attr("data-topicId"), content = $layout.find("textarea").val(), replyToId = $layout.parents(".box").attr("data-commentid");
		var buffer = new $.Buffers();
		
		//提交地址
		$opts.$commpost = $.fn.commMain.ParseTpl($opts.$commsubmit, $opts);
		
		if ($layout.find("textarea").val().length == 0) {
			emptyContentAlert($layout.find("textarea"));
			$layout.find(".erInfo").html($opts.required).show();
			return;
		}
		
		var _max = ($opts.maxInput);
		var _len = $.fn.commMain.len($.trim($layout.find("textarea").val()));
		if(_len > _max){
			emptyContentAlert($layout.find("textarea"));
			return;
		}
		//未登录
		if (!$opts.login) {
			//因为登陆直接调用关系，不能传参数，所以把需要的参数放变量里吧。
			$opts.submitarr = {
				me: _i
			};
			$.ppDialog({
				appId: '1019',
				regRedirectUrl: location.href,
				title: '您已退出，请重新登录！',
				onLogin: function(userId) {
					location.reload();
				}
			});
			return false;
		}
		//提交表单
		buffer.append('<input type="hidden" name="replyToId" value="' + replyToId + '" />');
		buffer.append('<input type="hidden" name="topicId" value="' + topicId + '" />');
		buffer.append('<input type="hidden" name="cmt_from" value="2" />');
		//buffer.append('<input type="hidden" name="content" value="' + content + '" />');
		buffer.append('<textarea type="hidden" name="content" style="display:none">' + content + '</textarea>');
		buffer.append('<input type="submit" name="submitOK" value="发表" />');
		
		s = buffer.toString();
		
		var submitover = function(){
			//恢复评论回复框
			$layout.find("textarea").val('');
			var replayObj = $layout.closest(".comment-box").find("span.feed-set em").eq(1);
			var replayNum = replayObj.text();
			replayObj.text(parseInt(replayNum) + 1);
			
			//恢复按钮
			//$(_i).val("发表").removeClass("btnload").bind("click", $.fn.commMain.replysubmit).next("em").remove();
			
			
			//评论回复提示层动画
			/*var ic = $layout.find(".reCom"), ip = ic;
			$($opts.$complete).appendTo(ic).css({
				top: parseInt(ip.height() / 2) - 7
			}).fadeIn('fast', function(e){
				window.setTimeout(function(){
					$(ic).find(".complete").fadeOut(500, function(){
						$(this).remove();
					});
				}, 1000);
				
			});*/
			
			//成功提示				
			$.inform({
						icon: "icon-success",
						delay: 3000,
						easyClose: true,
						content: "已提交，正在审核中，请耐心等待。"
					});
			//内容过滤
			content = $.fn.commMain.encode(content);
			//假显示 
			$layout.after($.fn.commMain.ParseTpl(commTemplates.subFalse, $.extend(true, {}, $opts.pp, {
				content: content,
				//fansCount: $opts.relation.fansCount,
				//commentsCount: $opts.relation.commentsCount,
				createTime: $.fn.commMain.time.friendly(new Date().getTime())
			}), true));
		};
		
		//回复用提交容器
		if ($("#divtarget").size() > 0) {
			$("#divtarget").remove();
		}
		
		$("<div/>").appendTo("body").css({
			top: "-5000px",
			left: "-1000px",
			position: "absolute"
		}).attr("id", "divtarget").append('<iframe name="replytarget" id="replytarget" src="about:blank"></iframe>');

			
		$("#replytarget").bind("load", submitover);
		
		$('<form/>').appendTo('#divtarget').attr('id', 'commform').attr('method', 'post').attr('action', $opts.$commpost).attr('target', 'replytarget').append(s).submit();
		
		//清空掉一些时数据
		$opts.submitarr = null;
		
		//防止冒泡
		return false;
	};
	/**
	 * 来自于
	 * @param {Object} from
	 */
	$.fn.commMain.from = function(from){
		from = parseInt(from) || 0;
		var f = ['<a href="http://i.sohu.com/scomment/home/all/" target="_blank">来自我来说两句</a>', '<a href="http://club.sohu.com" target="_blank">来自搜狐社区</a>', '<a href="http://i.sohu.com/scomment/home/all/" target="_blank">来自我的搜狐</a>'];
		return f[from];
	};
	/**
	 * 查关系
	 * 0互相没关注，此为默认
	 * 1表示为自己
	 * 2表示双向
	 * 3表示单向,我关注了ta
	 * 4表示单向,表示ta关注了我,而我没有关注ta,显示跟随
	 * @param {Object} from
	 */
	$.fn.commMain.relation = function(n){
		n = parseInt(n) || 0;
		var arr = ['<a class="bA follow" href="javascript:void(0)" attr="' + n + '"></a>', '', '<a class="bB" href="javascript:void(0)" attr="' + n + '"></a>', '<a class="bC" href="javascript:void(0)" attr="' + n + '"></a>', '<a class="bA follow" href="javascript:void(0)" attr="' + n + '"></a>'];
		return arr[n];
	};
	/**
	 * 格式化时间
	 */
	$.fn.commMain.time = {
		now: function(){
			return (new Date()).getTime();
		},
		getDateStr: function(time, splitStr){
			splitStr = typeof(splitStr) == "string" ? splitStr : '-';
			var date = new Date();
			date.setTime(time);
			var str = date.getFullYear() + splitStr + (date.getMonth() + 1) + splitStr + date.getDate();
			return str;
		},
		friendly: function(time){
			var tip = '', second = 1000, minute = second * 60, hour = minute * 60, now_time = new Date, now = new Date(), now_year = now.getFullYear(), now_month = now.getMonth(), now_date = now.getDate(), now_midnight = new Date(now_year, now_month, now_date), midnight_time = now_midnight.getTime(), diff = now_time - time;
			// 处理时间格式
			if (diff < 0) {
				tip = '';
			} else if (diff <= minute * 5) {
				tip = '刚刚';
			} else if (diff < hour) {
				var m = Math.floor(diff / minute);
				tip = m + '分钟前';
			} else if (diff < now_time - midnight_time) {
				var t = new Date(time), hh = t.getHours(), mm = t.getMinutes();
				if (hh < 10) {
					hh = '0' + hh;
				}
				if (mm < 10) {
					mm = '0' + mm;
				}
				tip = '今日 ' + hh + ':' + mm;
			} else {
				var t = new Date(time), MM = t.getMonth() + 1, DD = t.getDate(), hh = t.getHours(), mm = t.getMinutes();
				if (MM < 10) {
					MM = '0' + MM;
				}
				if (DD < 10) {
					DD = '0' + DD;
				}
				if (hh < 10) {
					hh = '0' + hh;
				}
				if (mm < 10) {
					mm = '0' + mm;
				}
				tip = MM + '月' + DD + '日 ' + hh + ':' + mm;
			}
			return tip;
		}
	};
})(jQuery);

/*
 * 我说两句工厂类，做基本定义，调数据，加载插件等工作
 * by qianwang@
 */
(function($){
	var p = {
		modules: {}
	}, pub = {
		version: '2011.09.26.16:47'
	};
	//passport 信息
	pub.userInfo = {
		ico: $.fn.commMain.defaults.$ico,
		url: $.fn.commMain.defaults.$url
	};
	pub.commentGetUserInfo = function(opts){
		var _t = this;
		var userId = PassportSC.cookieHandle();
		//userId = Base64.encode(/focus\.cn$/ig.test(userId) ? (userId + "@focus.cn") : userId);
		userId = $.fn.commMain.Base64Replace(Base64.encode(userId));
		var accountUrl = "http://i.sohu.com/api/accountinfo.do?vn=jsonData&xp=" + userId + "&t=" + $.fn.commMain.RdStr(10);
		$.getScript(accountUrl, function(){
			$.extend(SohuComment.userInfo, jsonData[userId] || {}, {
				base64: userId,
				userId: PassportSC.cookieHandle()
			});
			_t.Onload(opts);//回调并初始化
			return;
		});
		
		return;
		
	};
	pub.login = function(){
		var $opts = $.fn.commMain.defaults;
		//回填用户数据到opts;
		$.extend($opts, {
			login: true,//确认登录
			pp: SohuComment.userInfo
		});
		
		//刷新输入框用户信息
			
		//刷新列表中的关系
		
		return;
	};
	pub.submit = function(){
		//点提交后的登陆
		var $opts = $.fn.commMain.defaults;
		
		//先调用login，把数据回填，然后执行提交。
		SohuComment.login();
		
		if ($opts.submitarr.me) {
			$($opts.submitarr.me).trigger("click");
		}
		return;
	};
	
	pub.Init = function(opts){
		var opts = opts || {};
		opts.dhost = opts.host || "comment4.news.sohu.com";
		opts.host = opts.dhost.toUpperCase();
		opts.fhost = 'http://comment.news.sohu.com/upload/comment4/';//内部文件地址目录
		//opts.fhost = 'http://Ms.SOHU.COM/';//'http://MC.SOHU.COM/',测试用的
		opts.showList = opts.showList == undefined ? true : opts.showList;
		opts.pageList = opts.pageList == undefined ? false : opts.pageList;
		opts.editor = opts.editor == undefined ? true : opts.editor;
		opts.refresh = opts.refresh == undefined ? false : opts.refresh;
		
		var _t = this, init = function(){
			//初始化通行证,再启动			
			
			if ($.cookie("ppinf")) {				
				SohuComment.commentGetUserInfo(opts);
				return;
			} else {
				//启动初始化
				_t.Onload(opts);
			}
			return;
		};
		
		//加载一些插件啦，样式啦，但这些都是需要提前加载的,然后再开始
				
		//$.getScript(opts.fhost + "emotespace.js", function(){			
			init();			
		//});
	};
	pub.Onload = function(opts){
		login = $.cookie("ppinf") ? true : false;
		//加载通行证信息,放入opts,给以后用，这个地方的内容是不会改的
		$.extend(opts, {
			pp: SohuComment.userInfo,
			login: login
		});
		
		//初始化所有模块
		for (var m in p.modules) {
			if (p.modules[m] && p.modules[m].Init) {
				p.modules[m].Init(opts);
			}
		}
		
		$(document).ready(function(){
			//alert("页面加载完毕");
			for (var m in p.modules) {
				if (p.modules[m] && p.modules[m].OnLoad) {
					p.modules[m].OnLoad(p);
				}
			}
			
		});
	};
	/**
	 * 添加一个模块
	 * @param {Object} key
	 * @param {Object} module
	 */
	pub.AddModule = function(key, module){
		if (p.modules[key]) {
			alert("模块" + key + "已经存在！");
			return;
		}
		p.modules[key] = module;
	};
	/**
	 * 获取一个模块
	 * @param {Object} key
	 */
	pub.GetModule = function(key){		
		return p.modules[key];
	};
	
	window.SohuComment = pub;
})(jQuery);


/**
 * 输入框
 * @param {Object} $
 */
(function($){
	//输入框模块
	SohuComment.AddModule("commMain", {
		Init: function(opts){
			var _i = this, i = 0;
			this.opt = opts;
			
			//读取推荐新闻，取得topicId
			//opts.topicId = "317264738"
			
			if (opts.editor) {			
				//http://comment4.news.sohu.com/dynamic/cmt_hot_topics/
				opts.hotTopicsUrl = opts.hotTopicsUrl || 'http://{{#host}}/dynamic/cmt_hot_topics/';
				//opts.hotTopicsUrl = opts.hotTopicsUrl || 'http://ms.sohu.com/i/comment/temp.js';
				this.opt = opts;
				//loading....
				if($($.fn.commMain.defaults.feedLoading).length > 0){
					$($.fn.commMain.defaults.comCanvas).find(".section:last").after($($.fn.commMain.defaults.feedLoading))
					$($.fn.commMain.defaults.feedLoading).show();
				}else{
					$($.fn.commMain.defaults.comCanvas).append($.fn.commMain.defaults.$feedLoading);
				}
				//加载推荐数据		
				$.getScript($.fn.commMain.ParseTpl(opts.hotTopicsUrl, opts), function(){
					var hotTopicsData = eval(hotTopics) || null;
					_i.preLoad(hotTopicsData);
					
				}, {
					cache: true
				});
			}else{
				_i.preLoad();
			}
		},
		OnLoad: function(p){
		
		},
		preLoad:function(p){
			var _i = this, opts = _i.opt
			
			//创建输入框对象
			$("#SOHUcomment").commMain($.extend(_i.opt, {
				modelName: "Model",
				pp: SohuComment.userInfo,
				hotTopicsData:p
			}));
			
		}
	});
})(jQuery);


/**
 * 列表
 * @param {Object} $
 */
(function($){
	//输入模块
	SohuComment.AddModule("commList", {
		Init: function(opts){
			var _i = this;
			if (!opts.showList) {
				return;
			}
			if (!opts.editor) {
				opts.type = "user_list";
			}
			opts.type = opts.type || "all_comment";//排序类型 hot：热度  all：时间
			
			opts.jsonData = "cmt_"+opts.type;
					
			opts.files =  "cmt_"+opts.type + "/?_xpt=" + $space_config._xpt;
						
			//显示页码
			opts.pages = $.extend({
					pageNo: 1,
					pageSize: 10
				}, opts.pages);
			opts.uri = "dynamic";
			opts.prame = $.fn.commMain.ParseTpl("&pageNo={{#pageNo}}&pageSize={{#pageSize}}", opts.pages);			
			
			//数据url
			opts.topicUrl = opts.topicUrl || 'http://{{#host}}/{{#uri}}/{{#files}}{{#prame}}';				
			
			opts.topicUrlData = $.fn.commMain.ParseTpl(opts.topicUrl, opts);
			
			//回填所有更新过的默认值;
			this.opt = opts;
			//loading....
			if($($.fn.commMain.defaults.feedLoading).length > 0){
				$($.fn.commMain.defaults.comCanvas).find(".section:last").after($($.fn.commMain.defaults.feedLoading))
				$($.fn.commMain.defaults.feedLoading).show();
			}else{
				$($.fn.commMain.defaults.comCanvas).append($.fn.commMain.defaults.$feedLoading);
			}	
			
			//加载数据,先看看是不是已经有了？
			if (window[opts.jsonData] && window[opts.jsonData].pageNumber == opts.pages.pageNo && !opts.refresh) {
				var returns = {};
				var returnDate = $.extend(true, returns, window[opts.jsonData]);
				_i.preLoad(returnDate);
			} else {
				//重新加载数据后,渲染页面,window[opts.files]				
				$.getScript(opts.topicUrlData, function(){					
					window[opts.jsonData] = eval(opts.jsonData) || null;
					var returns = {};//复制一个真实的数据到opts,防止影响原始数据
					var returnDate = $.extend(true, returns, window[opts.jsonData]);							
					_i.preLoad(returnDate);					
				}, {
					cache: true
				});
			};
			
		},
		OnLoad: function(p){
		},
		preLoad: function(d){
			var _i = this, opts = _i.opt, load = function(r){		
				var relation = eval(r) || {};			
				//创建列表对象				
				$("#SOHUcomment").commMain($.extend(_i.opt, {
					modelName: "ModelList",
					relation: relation,
					data: d
				}));		
			};
			//把好友列表缓存			
		/*	if (d.totalNumber > 0 && opts.editor) {					
				var followers = [];
				$.each(d.commentList,function(i){
					if($.inArray(d.commentList[i].passport,followers) == -1){
						followers.push( d.commentList[i].passport)
					}						
				})
				//opts.relationUrl = opts.relationUrl || 'http://{{#host}}/direct/cmt_relation_{{#pp_base64}}.json?fassports=' + followers;
				opts.relationUrl = 'http://{{#host}}/direct/cmt_relation_{{#pp_base64}}.json?fassports=' + followers;
				$.getScript($.fn.commMain.ParseTpl(opts.relationUrl, $.extend({}, opts, {
					pp_base64: opts.pp.base64
				})), load, {
					parameter: ["returnRelation"],
					cache: true
				});
			} else {	*/							
				opts.relation = opts.relation ? opts.relation : {}; 
				load(opts.relation);
			//}
		}
	});
})(jQuery);


/**
 * @author qianwang
 * @desc 回复列表
 * @param {Object} $
 */
(function($){
	/*回复列表*/
	$.fn.reply = function($layout, cId){	
			var _t = this, $opts = $.fn.commMain.defaults, $layout = $layout, commentId = $layout.parents(".box").attr("data-commentid"),xpt =  $layout.parents(".box").attr("data-xpt");
			
			var inputKey = function(e){
				var e = window.event || e, keyCode = e.keyCode || e.which;
				var _t = this;
				
				var _len = $.fn.commMain.len($.trim($(_t).val()));
				var _max = ($opts.maxInput);
				
				//评论框
				if (_len > _max) {
					$layout.find(".erInfo").html($.fn.commMain.ParseTpl($opts.$MaxInputTxt, {
						maxInputLen: _len - _max
					})).attr("errlen", _len - _max).show();
					//解除提交
					$layout.find(".btn").unbind("click");
				} else {
					$layout.find(".erInfo").html('').attr("errlen", 0).hide();
					//重新绑定提交
					$layout.find(".btn").unbind("click").bind("click", $.fn.commMain.replysubmit);
				}
				
			};
			
			_t.unbind("click").bind("click", function(){
				if($layout.html() != null && $layout.html() != ""){
					$layout.html("");
					return false;
				}
				$layout.html($.fn.commMain.ParseTpl($opts.commTemplates.SubListModel, $.extend({}, {
					login_replyPic: $opts.$login_replyPic
				}, $opts.pp)));
				$layout.find("textarea").focus();                //点回复后，输入框中默认有光标
				// 表情事件绑定				
				$.fn.commMain.bindemote($layout.find(".pub-faces a"), $layout.find("textarea"));
				
				//输入框字数
				$layout.find("textarea").bind("blur", inputKey).bind("keyup", inputKey).bind("paste", inputKey).bind("cut", inputKey);
				
				//提交
				$layout.find(".btn-submit a").bind("click", $.fn.commMain.replysubmit);
				
				//读回复列表 http://comment4.news.sohu.com/dynamic/cmt_reply_146227101.json
				$opts.replyUrl = $opts.replyUrl || 'http://{{#host}}/dynamic/cmt_reply_{{#commentId}}.json';
				
				$.getScript($.fn.commMain.ParseTpl($opts.replyUrl, $.extend({}, $opts, {
					commentId: commentId
				})), function(r){
					//回复列表
					var result = eval(r), s = new $.Buffers(), $opts = $.fn.commMain.defaults;
					var d = result.replies;
					$(_t).find("em").html(result.totalNumber);
					//如果有列表，就输出
					if (result.totalNumber > 0) {						
						/*$layout.append($.fn.commMain.ParseTpl($opts.$replyNum, {
							replyUrl: $opts.$replyUrl,
							replyNumber: result.totalNumber
						}));*/
						//回写回复数
						
						$.each(d, function(i){
							//格式化时间
							d[i].createTime = $.fn.commMain.time.friendly(d[i].createTime);							
							//来自于							
							d[i].from = $.fn.commMain.from(d[i].from);							
							//如果没头像
							d[i].authorimg = d[i].authorimg == "" ? $opts.$ico : d[i].authorimg;							
							//pp转base64
							d[i].baseid = $.fn.commMain.base64(unescape(d[i].passport));
							s.append($.fn.commMain.ParseTpl($opts.commTemplates.subList, $.extend(true, {}, d[i]), true));
						});
						var subList = s.toString();						
						
						//回填评论回复列表
						
						if(subList.length == 0){
							//setTimeout(function(){$layout.append(subList)},1000)
						}						
						$layout.find(".box-sub-list").append(subList)
						
						//回复中的顶和回复的事件
						$layout.find(".box-sub .com-list-foot").each(function(){
							var topicId = $opts.topicId, replyid = $(this).closest(".box-sub").attr("data-replyid"), $commlist = $(this).closest(".box").find(".comSubList");
							//顶,这里直接调外挂
							
							$(this).find("a").eq(0).agree(replyid, topicId);
							
							//回复列表,直接跳到上面的输入框
							$(this).find("a").eq(1).bind("click", function(){
								if ($("html,body").scrollTop() > ($layout.find("textarea").offset().top - 260)) {
									$("html,body").animate({
										scrollTop: $layout.find("textarea").offset().top - 260
									}, 100)
								}
								$layout.find("textarea").focus();
								$layout.find("textarea").val("回复 "+$(this).parent().parent().parent().children(".com-list-head").children(".username").text()+" : ");              //by zhangshuqing 2011-09-26
							});
						});
					
						//如果大于10条显示分页
						if(result.totalNumber > 10 && !$opts.editor && !$opts.showList){                             
							$layout.replyPageList(result);	
						}else if((result.totalNumber > 10 && $opts.editor) || (!$opts.editor && $opts.showList)){						
							$layout.find(".box-sub-list").append($.fn.commMain.ParseTpl($.fn.commMain.defaults.$commnetSubDetail, $.extend(true, {}, {
								xpt:xpt,
								commentId:commentId
							}), true));							
						}
					}
				}, {
					parameter: ["reply_" + commentId],
					cache: true
				});
				
			})		
	};
	//回复列表 
	$.fn.replyPageList = function(data){
		
		var _t = this, $opts = $.fn.commMain.defaults,boxSubList = $(_t).find(".box-sub-list"), $layout = $(_t), commentId = $layout.parents(".box").attr("data-commentid");;
		
		var totalCount = data.totalNumber, pageNum = data.pageNumber, ps = data.pageSize;
		
		var pages = "", pager = "", pageStr = "", pageStr2 = "", pageNext = "", pageUp = "", pageOmit = "", pages_n = 0;
		var pageBefore_1 = 0, pageBefore_2 = 0, pageNext_1 = 0, pageNext_2 = 0, pageBeforeStr_1 = "", pageBeforeStr_2 = "", pageNextStr_1 = "", pageNextStr_2 = "", dottedLine_1 = "", dottedLine_2 = "", pageNumStr = "";
		var pageTemp_1 = 0, pageTemp_2 = 0, pageTemp_3 = 0, pageTemp_4 = 0;
		
		var pages = "", pager = "", pageStr = "", pageStr2 = "", pageNext = "", pageUp = "", pageOmit = "", pages_n = 0;
		//单页码条数
		var ViewPageNum = 10;
		//共几页
		pages = parseInt(totalCount % ps) > 0 ? parseInt(totalCount / ps) + 1 : parseInt(totalCount / ps);
		//余页
		pager = parseInt(totalCount % ps);
		//nPages-10
		nPages = pageNum > 1 ? (pageNum - 1) * ps + 1 : 1;
		//6-nPagee
		nPagee = pages - pageNum > 0 ? pageNum * ps : totalCount;
		//页码页数
		pages_n = parseInt(Math.round(pages / ViewPageNum));
		//显示页码数
		pageOmit = ViewPageNum;
		//起始页码
		var p = 1;
		//第一页
		var firstPage = "";
		//最后一页
		var lastPage = "";
			firstPage = pageNum == 1 ? '<span>1</span>' : '<a href="javascript:void(0)" attr="1">1</a>';             /**by zhangshuqing 2011-09-23 start**/
			lastPage = pageNum == pages ? '<span>' + pages + '</span>' : '<a href="javascript:void(0)" attr="' + pages + '">' + pages + '</a>';
			if(pages < 8){
				for (var i=1; i <= pages; i++) {
					if (i == pageNum) {
						pageStr2 += '<span>' + i + '</span>';
					} else {
						pageStr2 += '<a href="javascript:void(0)" attr="' + i + '">' + i + '</a>';
					}
				}				
			}else{
				if(pageNum <= 3){
					for (var i = 1; i <= 6; i++) {
						if (i == pageNum) {
							pageStr2 += '<span>' + i + '</span>';
						} else {
							pageStr2 += '<a href="javascript:void(0)" attr="' + i + '">' + i + '</a>';
						}
					}
					pageStr2 = pageStr2 + "..." + lastPage;
				}else if(pages - pageNum <= 2){
					for (var i = pages-5; i <= pages; i++) {
						if (i == pageNum) {
							pageStr2 += '<span>' + i + '</span>';
						} else {
							pageStr2 += '<a href="javascript:void(0)" attr="' + i + '">' + i + '</a>';
						}
					}
					pageStr2 = firstPage + "..." +pageStr2;
				}else{
					pageBefore_1 = pageNum - 1;
					pageBefore_2 = pageNum - 2;
					pageNext_1 = pageNum + 1;
					pageNext_2 = pageNum + 2;
					pageBeforeStr_1 = pageBefore_1 <= 1 ? "" : '<a href="javascript:void(0)" attr="' + pageBefore_1 + '">' + pageBefore_1 + '</a>';
					pageBeforeStr_2 = pageBefore_2 <= 1 ? "" : '<a href="javascript:void(0)" attr="' + pageBefore_2 + '">' + pageBefore_2 + '</a>';
					pageNextStr_1 = pageNext_1 >= pages ? "" : '<a href="javascript:void(0)" attr="' + pageNext_1 + '">' + pageNext_1 + '</a>';
					pageNextStr_2 = pageNext_2 >= pages ? "" : '<a href="javascript:void(0)" attr="' + pageNext_2 + '">' + pageNext_2 + '</a>';
					dottedLine_1 = pageBefore_2 > 2 ? "..." : "";
					dottedLine_2 = pages - pageNext_2 > 1 ? "..." : "";
					pageNumStr = pageNum == 1 || pageNum == pages ? "" : '<span>' + pageNum + '</span>';
					pageStr2 = firstPage + dottedLine_1 + pageBeforeStr_2 + pageBeforeStr_1 + pageNumStr + pageNextStr_1 + pageNextStr_2 + dottedLine_2+ lastPage;								
				}
			}                                                                               /**by zhangshuqing 2011-09-23 end**/
		
		
		var pageBuffer = new $.Buffers();
		//pageBuffer.append('<div class="l">第'+nPages+'-'+nPagee+'条 共'+pages+'页 当前第'+pageNum+'页</div>');
		
			if (pages - pageNum > 0 && pageNum == 1) {
				pageNext = pageNum + 1;
				pageBuffer.append('<span class="selected">上一页</span> ' + pageStr2 + ' <a href="javascript:void(0)" attr="' + pageNext + '"" >下一页</a>');                    //by zhangshuqing 2011-09-20
			} else if (pages - pageNum > 0 && pageNum > 1) {
				pageNext = pageNum + 1;
				pageUp = pageNum - 1;
				pageBuffer.append('<a href="javascript:void(0)" attr="' + pageUp + '">上一页</a> ' + pageStr2 + ' <a href="javascript:void(0)" attr="' + pageNext + '">下一页 </a>');             //by zhangshuqing 2011-09-20
			} else if (pages - pageNum == 0 && pages > 1) {
				pageUp = pageNum - 1;
				pageBuffer.append('<a href="javascript:void(0)" attr="' + pageUp + '">上一页</a> ' + pageStr2 + ' <span class="selected">下一页</span>&nbsp;');                  //by zhangshuqing 2011-09-20
			} else if (pages - pageNum == 0 && pages <= 1) {
				pageUp = pageNum - 1;
				pageBuffer.append('<span class="selected">上一页</span> ' + pageStr2 + ' <span class="selected">下一页</span>&nbsp;');                   //by zhangshuqing 2011-09-20
			}
		boxSubList.append('<div class="pagination">'+pageBuffer.toString()+'</div>');
		
		$(this).find(".pagination a").each(function(){
			$(this).bind("click", function(){
				$(this).subList();
			})
		});
		
		//翻页请求数据，重绘子列表
		$.fn.subList = function(){
			var pageNo = $(this).attr("attr");	
			
			//读回复列表 http://comment4.news.sohu.com/dynamic/cmt_reply_146227101.json
			$opts.replyUrl = 'http://{{#host}}/dynamic/cmt_reply_{{#commentId}}.json?pageNo='+pageNo+'&pageSize=10';
			
			$.getScript($.fn.commMain.ParseTpl($opts.replyUrl, $.extend({}, $opts, {
				commentId: commentId
			})), function(r){
				//回复列表				
				var result = eval(r), s = new $.Buffers();
				var d = result.replies;
				
				//如果有列表，就输出
				if (result.totalNumber > 0) {					
					$.each(d, function(i){
						//格式化时间
						d[i].createTime = $.fn.commMain.time.friendly(d[i].createTime);							
						//来自于							
						d[i].from = $.fn.commMain.from(d[i].from);							
						//如果没头像
						d[i].authorimg = d[i].authorimg == "" ? $opts.$ico : d[i].authorimg;							
						//pp转base64
						d[i].baseid = $.fn.commMain.base64(unescape(d[i].passport));
						s.append($.fn.commMain.ParseTpl($opts.commTemplates.subList, $.extend(true, {}, d[i]), true));
					});
					var subList = s.toString();						
					
					//回填评论回复列表
					
					if(subList.length == 0){
						//setTimeout(function(){$layout.append(subList)},1000)
					}						
					$layout.find(".box-sub-list").html(subList)
					
					//回复中的顶和回复的事件
					$layout.find(".box-sub .com-list-foot").each(function(){
						var topicId = $opts.topicId, replyid = $(this).closest(".box-sub").attr("data-replyid"), $commlist = $(this).closest(".box").find(".comSubList");
						//顶,这里直接调外挂
						
						$(this).find("a").eq(0).agree(replyid, topicId);
						
						//回复列表,直接跳到上面的输入框
						$(this).find("a").eq(1).bind("click", function(){
							if ($("html,body").scrollTop() > ($layout.find("textarea").offset().top - 260)) {
								$("html,body").animate({
									scrollTop: $layout.find("textarea").offset().top - 260
								}, 100)
							}
							$layout.find("textarea").focus();
							$layout.find("textarea").val("回复 "+$(this).parent().parent().parent().children(".com-list-head").children(".username").text()+" : ");                  //by zhangshuqing 2011-09-26
						});
					});
					
					//如果大于10条显示分页
					if(result.totalNumber > 10){
						$layout.replyPageList(result);	
					}
				}
			}, {
					parameter: ["reply_" + commentId],
					cache: true
				});
		}
	};
	
})(jQuery);

/**
 * @author qianwang
 * @desc 找关系,这个插件用于未登录时，登录以后刷关系数据
 * @param {Object} $
 */
(function($){
	$.fn.relation = function(obj){		
			//this $("#SOHUcomment .comList box").relation()				
			var $layout = $(this), $opts = $.fn.commMain.defaults;
			//if ($.cookie("ppinf") && !!$opts.relation && $opts.data.totalNumber > 0) {
			if($.cookie("ppinf") && $layout.length > 0){				
				var followers = [];	
				if(typeof obj == "undefined"){											
					$.each($opts.data.commentList,function(i){
						if($.inArray(unescape($opts.data.commentList[i].passport),followers) == -1){
							followers.push(unescape($opts.data.commentList[i].passport))
						}						
					})
				}
				else{							
					$.each($layout,function(i){									
						if($.inArray($($layout[i]).attr("passport"),followers) == -1){
							followers.push($($layout[i]).attr("passport"))
						}						
					})
				
				}				
				//$opts.relationUrl = $opts.relationUrl || 'http://{{#host}}/direct/cmt_relation_{{#pp_base64}}.json?fassports=' + followers;
				$opts.relationUrl = 'http://{{#host}}/direct/cmt_relation_{{#pp_base64}}.json?fassports=' + followers;
				
				$.getScript($.fn.commMain.ParseTpl($opts.relationUrl, $.extend({}, $opts, {
					pp_base64: $opts.pp.base64
				})), function(){
					//确认登录后，把好友和用户信息放opts里。					
					$.extend($opts, {
						relation: eval(returnRelation) || {}
					});
					var result = returnRelation.relation || {};
					$layout.each(function(i){
						var r = result[$(this).attr("data-baseid")];
						r = r == undefined ? 0 : r;
						
						//自已发的是1
						if ($opts.pp.base64 == $(this).attr("data-baseid")) {
							r = 1;
						}
						//回填关系状态
						
						$(this).find(".fun").html($.fn.commMain.relation(r)).find(".follow").each(function(){							
							$(this).follows($(this).closest(".box").attr("data-baseid"));
						});
						
					})
				}, true);
			}
			return;		
	};
})(jQuery);

/**
 * @author dupeng
 * @modify qianwang
 * @desc 顶插件
 * @param {Object} $
 */
(function($){
	$.fn.agree = function(cId, tId){		
			var _t = $(this), $opts = $.fn.commMain.defaults;
			if (!!!cId && !!!tId) {
				return;
			}
			_t.css("position", "relative").append($("<span>", {
				css: {
					font: "600 30px/34px '黑体'",
					color: "#c00",
					position: "absolute",
					display: "none",
					top: -20,
					left: 10
				},
				text: "+1"
			}).addClass("float")).click(function(){
				return false;
			}).one("click", function(){			
				//顶
				$opts.dingUrl = $opts.dingUrl || 'http://{{#host}}/post/simple_up/?commentId={{#cId}}&topicId={{#topicId}}';
				
				$.getScript($.fn.commMain.ParseTpl($opts.dingUrl, $.extend({}, $opts, {
					cId: cId,
					topicId: tId
				})), function(r){
					r = eval(r);
					if (!!r.status && r.status == 1) {
						_t.find("em").text(parseInt(_t.find("em").text()) + 1);//改数
						_t.css({"color":"#999","text-decoration":"none"});
						_t.find("> .float").css("display", "block").animate({
							top: [-50, "swing"]
						}, 300, function(){
							$(this).fadeOut(300);
						});
					}
					return
				}, {
					parameter: ["simpleUpResult"],
					cache: true
				});
				
				
			});		
	};
})(jQuery);
/**
 * @author qianwang
 * @desc 跟随插件
 * @param {Object} $
 */
(function($){
	$.fn.follows = function (base64){		
			var _t = $(this), $opts = $.fn.commMain.defaults, relation = _t.attr("attr");
			if (!!!base64) {
				return;
			}
			_t.bind("click", function(){
				//链接
				$opts.followUrl = $opts.followUrl || 'http://{{#host}}/post/add_friend/?passport={{#base64}}';
				$.getScript($.fn.commMain.ParseTpl($opts.followUrl, {
					host: $opts.host,
					base64: base64
				}), function(r){
					$(_t).unbind("click");
					//if($.browser.msie && $.browser.version =="6.0"){						
					var postAddFansResult={"status":1,"msg":"","extend":{"frinedRelations":[{"friendType":2,"fassport":""}]}};
					//}
				
					var r = eval(r);
					if (!!r.status && r.status == 1) {
						var msg = 3;
						if (relation == 4) {
							msg = 2;
						}						
						//因为只有两种可能点了跟随，双向都没和TA跟随我，所以都不会再有链接了
						_t.unbind().parent().html($.fn.commMain.relation(msg));
					}
					return
				}, {
					parameter: ["postAddFansResult"]
				});
			});
		
	};
})(jQuery);
/**
 * @author dupeng
 * 页码
 * @param {Object} $
 */
(function($){
	$.fn.pageList = function(){		
			var _t = $(this), $opts = $.fn.commMain.defaults;
			var totalCount = $opts.data.totalNumber, pageNum = $opts.data.pageNumber, ps = $opts.pages.pageSize;
			
			var pages = "", pager = "", pageStr = "", pageStr2 = "", pageNext = "", pageUp = "", pageOmit = "", pages_n = 0;
			//单页码条数
			var ViewPageNum = $opts.pages.ViewNum == undefined ? 10 : $opts.pages.ViewNum;
			//共几页			
			pages = parseInt(totalCount % ps) > 0 ? parseInt(totalCount / ps) + 1 : parseInt(totalCount / ps);
			
			//余页
			pager = parseInt(totalCount % ps);
			//nPages-10
			nPages = pageNum > 1 ? (pageNum - 1) * ps + 1 : 1;
			//6-nPagee
			nPagee = pages - pageNum > 0 ? pageNum * ps : totalCount;
			//页码页数
			pages_n = parseInt(Math.round(pages / ViewPageNum));
			//显示页码数
			pageOmit = ViewPageNum;
			//起始页码
			var p = 1;	
			var pageBuffer = new $.Buffers();	
			var $comListMore = $("#SOHUcomment .com-list-more");
			
			if (pages - pageNum > 0 && totalCount > 0) {
				pageNext = pageNum + 1;						
				pageBuffer.append('<div class="section panel-box com-list-more"><div class="comment-more"><p class="btn-more"><a href="javascript:void(0)" attr="' + pageNext + '">更多说两句&gt;&gt;</a></p></div></div>')				
			}else if(pages - pageNum <= 0 && totalCount > 0){
				$comListMore.show();
				$comListMore.html('<div class="comment-more"><p class="btn-more">已经见底儿，没有更多说两句啦!</p></div>');
				//$comListMore.hide();
				return;
			}else if(totalCount == 0){
				if($comListMore.length > 0){
					$comListMore.html('<div class="comm-status"><div class="empty-img empty-tip-article"></div><div class="empty-words">还没有评论，快去发表啦！</div></div>');
				}else{
					pageBuffer.append('<div class="section panel-box com-list-more"><div class="comm-status"><div class="empty-img empty-tip-article"></div><div class="empty-words">还没有评论，快去发表啦！</div></div></div>');
					$(this).append(pageBuffer.toString());
				}
				return;
			}
			
			if($comListMore.length > 0){
				$comListMore.html('<div class="comment-more"><p class="btn-more"><a href="javascript:void(0)" attr="1">更多说两句&gt;&gt;</a></p></div>');
				$comListMore.show();
				$comListMore.find(".comment-more a").attr("attr",pageNext)				
			}else{
				$(this).append(pageBuffer.toString());
			}						
					
			$(this).find(".com-list-more p").unbind("click").bind("click", function(){                       //by zhangshuqing 2011-09-27
				$comListMore.hide();
				SohuComment.GetModule("commList").Init($.extend({}, $opts, {
					pages: {
						"pageNo": $(this).children("a").attr("attr")                                               //by zhangshuqing 2011-09-27
					}
				}));
			});
	};
})(jQuery);
/**
 * @author wangyl
 * @desc 公用，跟随
 * @param {Object} $
 */
(function($) {	
	$.follower = function() {
		setTimeout(function(){
			$("#recommend_follower .box").relation("recommend");
		},2000);
		//右侧我来说两句数
		var cmt_comments_count_url ="http://comment4.news.sohu.com/direct/cmt_comments_count/?_xpt="+$space_config._xpt
		window.comment_count = 0;
		$.getScript(cmt_comments_count_url,function(){
		  		$("#canvas .rightbar-wrapper li.rtbar-scomments a").eq(1).html(window.comment_count);
		 	}
		); 
		
	};
})(jQuery);
/*
 * 个人展示页说两句接口，顶，回复
 *
 */
(function($){
	$.presonReply = function(){	
		var feedSetObj = $("#SOHUcomment .panel-box span.feed-set");		
		var commentId = feedSetObj.closest(".box").attr("data-commentid"), topicId = feedSetObj.closest(".box").attr("data-topicId"), $commlist = feedSetObj.closest(".box").find(".comment-box-sub");
		//顶
		feedSetObj.find("a").eq(0).agree(commentId, topicId);		
		//回复列表
		feedSetObj.find("a").eq(1).reply($commlist, commentId);
		setTimeout(function(){feedSetObj.find("a").eq(1).trigger("click");},1000);
		
		$.presonChange();
	}
	$.presonChange = function(){		
		var contentObj = $("#SOHUcomment .comments-main p.text");		
		var content = $.fn.commMain.change(contentObj.html(),"content");
			contentObj.html(content);
	}	
})(jQuery);
