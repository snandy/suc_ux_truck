;(function($){
$(function(){
if ($.uguide) {
	return;
}
$.uguide = {};

/** initialize begin. **/
var clocation = window.location.href;
var is_home = $space_config._currentApp === 'home';
var userId = Base64.encode(PassportSC.cookieHandle());
//var $tip1 = $("#updateTip1");
//var $tip2 = $("#updateTip2");
//var $tip3 = $("#updateTip3");
//var tip1Cookie = $.cookie("suc_spaceUpdate_" + userId);
//var tip2Cookie = $.cookie("suc_spaceNewPublic_" + userId);
//var tip3Cookie = $.cookie("suc_spaceNewMyspace_" + userId);
var dialogCookie1 = $.cookie("suc_spaceNickSetting_" + userId);
var dialogCookie2 = $.cookie("suc_spaceInfoGuide_" + userId);
var xpt = window._xpt || $space_config._xpt || null;

// bind events to tip2 and tip3
/*
$tip2.bind("click", function(event){
	if ($(event.target).closest("span").attr("className") == "close") {
		$tip2.hide();
		$.cookie("suc_spaceNewPublic_" + userId, "false", {
			expires: 1,
			path: "/",
			domain: "sohu.com"
		});
	}
	
});
$tip3.bind("click", function(event){
	if ($(event.target).closest("span").attr("className") == "close") {
		$tip3.hide();
		$.cookie("suc_spaceNewMyspace_" + userId, "false", {
			expires: 1,
			path: "/",
			domain: "sohu.com"
		});
	}
});
*/
// try to show guide dialog first
showInfoGuideDia();
showEditNickDia();
/** initialize end. **/


// 显示信息补全对话框
function showInfoGuideDia() {
	if (is_home && xpt == userId) {
		if (!dialogCookie2) {
			// 取服务器弹出状态
			$.getJSON("http://i.sohu.com/api/gettip.do?type=2&callback=?", function(oResult) {
				if (oResult.status == "1") {
					// 弹出信息补全框
					setTimeout(infoGuideDia, 2000);

					// 设置服务器状态不再弹出
					$.getJSON("http://i.sohu.com/api/updatetip.do?type=2&callback=?", function(oResult){});
				}
				else if (oResult.status == "0") {
					//showTip2();
					//showTip3();
				}
				
				$.cookie("suc_spaceInfoGuide_" + userId, "false", {path: "/", domain: "sohu.com", expires: 365});
			});
		}
		else if (dialogCookie2 == "false") {
			//showTip2();
			//showTip3();
		}
	}
}

// 显示昵称修改对话框
function showEditNickDia() {
	if (is_home) {
		if (!dialogCookie1) {
			// 取服务器弹出状态
			$.getJSON("http://i.sohu.com/api/gettip.do?type=1&callback=?", function(oResult) {
				if (oResult.status == "1") {
					// 弹出眤称设置框
					setTimeout(editNickDia, 2000);
					// 设置服务器状态不再弹出
					$.getJSON("http://i.sohu.com/api/updatetip.do?type=1&callback=?", function(oResult){});
				}
				else if (oResult.status == "0") {
					//showTip1();
				}

				$.cookie("suc_spaceNickSetting_" + userId, "false", {path: "/", domain: "sohu.com", expires: 365});
			});
		}
		else if (dialogCookie1 == "false") {
			//showTip1();
		}
	}
}

// 补全信息对话框的定义
function infoGuideDia() {
	return $.dialog({
		title: "补全信息",
		className: "space-notice-dialog",
		btns: ["accept"],
		contentWidth: 420,
		labAccept: "去补全信息",
		onClose: function(){
			//showTip2();
			//showTip3();
		},
		content:
			'<div class="content">' +
				'<span><strong>欢迎加入我的搜狐！</strong></span>' +
				'<p><span>请继续完善您的个人信息，以最完美的形象展示</span></p>' +
			'</div>',
		onAccept: function(){
			window.open("http://i.sohu.com/guide/tocom.htm");
		}
	});
}

// 编辑昵称对话框的定义
function editNickDia() {
	var uname = unescape($.cookie("sucaccount", {raw: true}).split("|")[1]);
	return $.dialog({
		title: "修改昵称",
		className: "space-notice-dialog",
		btns: ["accept"],
		labAccept: "修改昵称",
		contentWidth: 420,
		onClose: function(){
			//showTip1();
		},
		content:
			'<div class="content">' +
				'<span><strong>博客空间已经升级为我的搜狐！</strong></span>' +
				'<p><span>系统帮您预填的昵称是：<span style="color:#0b60af">' + uname + '</span></span></p>' +
				'<p><span style="font-weight:bold">不喜欢？可以马上修改。</span></p>' +
			'</div>',
		onAccept: function(){
			window.open("http://blog.sohu.com/home/soProfile/basic.htm");
		}
	});
}


// 显示 tip1
/*
function showTip1() {
	if (!tip1Cookie) {
		$.getJSON("http://i.sohu.com/api/gettip.do?type=3&callback=?", function(oResult){
			if (oResult.status == "1") {
				$tip1.show();
				$.cookie("suc_spaceUpdate" + userId, "true", {path: "/", domain: "sohu.com", expires: 365});
			}
			else if (oResult.status == "0") {
				$.cookie("suc_spaceUpdate_" + userId, "false", {path: "/", domain: "sohu.com", expires: 365});
			}
		});
	}
	else if (tip1Cookie == "true") {
		$tip1.show();
	}
}
*/
// 显示 tip2
/*
function showTip2() {
	if (/http:\/\/(.*)\.blog\.sohu\.com/.test(clocation) ||
				clocation.indexOf("http://blog.sohu.com/people") > -1) {
		if (!tip2Cookie) {
			$.getJSON("http://i.sohu.com/api/gettip.do?type=11&callback=?", function(oResult){
				if (oResult.status == "1") {
					$tip2.show();
					$.cookie("suc_spaceNewPublic_" + userId, "true", {
						expires: 1,
						path: "/",
						domain: "sohu.com"
					});
				}
				else if (oResult.status == "0") {
					$.cookie("suc_spaceNewPublic_" + userId, "false", {
						expires: 1,
						path: "/",
						domain: "sohu.com"
					});
				}
			});
		}
		else if (tip2Cookie == "true") {
			$tip2.show();
		}
	}
}
*/
// 显示 tip3
/*
function showTip3() {
	if (clocation.indexOf("http://i.sohu.com/myspace/main.do") > -1) {
		if (!tip3Cookie) {
			$.getJSON("http://i.sohu.com/api/gettip.do?type=12&callback=?", function(oResult){
				if (oResult.status == "1") {
					$tip3.show();
					$.cookie("suc_spaceNewMyspace_" + userId, "true", {
						expires: 1,
						path: "/",
						domain: "sohu.com"
					});
				}
				else if (oResult.status == "0") {
					$.cookie("suc_spaceNewMyspace_" + userId, "false", {
						expires: 1,
						path: "/",
						domain: "sohu.com"
					});
				}
			});
		}
		else if (tip3Cookie == "true") {
			$tip3.show();
		}
	}
}
*/
});
})(jQuery);
