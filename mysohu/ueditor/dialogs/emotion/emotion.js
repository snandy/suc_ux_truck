function initImgBox(box, str, len) {
	if (box.length)return;
	var tmpStr = "",i = 1;
	for (; i <= len; i++) {
		tmpStr = str;
		if (i < 10)tmpStr = tmpStr + '0';
		tmpStr = tmpStr + i + '.gif';
		box.push(tmpStr);
	}
}
function $G(id) {
	return document.getElementById(id)
}
function InsertSmiley(url) {
	var obj = {
		src: url
	};
	obj.data_ue_src = obj.src;
	editor.execCommand('insertimage', obj);
	dialog.popup.hide();
}

function over(td, srcPath, posFlag) {
	td.style.backgroundColor = "#ACCD3C";
	$G('faceReview').style.backgroundImage = "url(" + srcPath + ")";
	if (posFlag == 1) $G("tabIconReview").className = "show";
	$G("tabIconReview").style.display = 'block';
}
function out(td) {
	td.style.backgroundColor = "#FFFFFF";
	var tabIconRevew = $G("tabIconReview");
	tabIconRevew.className = "";
	tabIconRevew.style.display = 'none';
}
var emotion = {};
emotion.SmileyPath = 'http://s3.suc.itc.cn/mysohu/ueditor/dialogs/emotion/images/';
emotion.SmileyBox = {tab0:[],tab1:[],tab2:[],tab3:[],tab4:[],tab5:[],tab6:[]};
emotion.SmileyInfor = {tab0:[],tab1:[],tab2:[],tab3:[],tab4:[],tab5:[],tab6:[]};
var faceBox = emotion.SmileyBox;
var inforBox = emotion.SmileyInfor;
var sBasePath = emotion.SmileyPath;

initImgBox(faceBox['tab0'], 'j_00', 64);
initImgBox(faceBox['tab1'], 't_00', 40);
initImgBox(faceBox['tab2'], 'l_00', 34);

inforBox['tab0'] = ['微笑','谄媚','偷笑','大笑','害羞','调皮','得意','耍酷','讽刺','委屈','郁闷','难过','泪奔','大哭','发火','咒骂','发呆','不懂','疑惑','吃惊','流汗','尴尬','惊恐','闭嘴','犯困','睡觉','馋','吐','耳语','海盗','重伤','拥抱','爽','强','酷','赞','红心','心碎','花开','花谢','邮件','手势-棒','手势-逊', '握手', '电话', '手机', '嘴唇', 'V', '太阳', '月亮', '星星', '灯泡', '电视', '闹钟', '礼物', '现金', '咖啡','饭','西瓜','番茄','药丸','猪头','足球','便便'];
inforBox['tab1'] = ['猪头','红心','耍酷','鼻涕','流汗','偷笑','猫王','鼻血','大笑','坏笑','大哭','红旗','馋','郁闷','便便','蔑视','搋子','睡觉','重伤','疑惑','晕','赞','爆炸','握手','委屈','饮料','刷牙','饭','胸罩','喇叭','闹钟','圣诞','篮球','小花','啤酒','蛋糕','加油','奥运','火炬','顶'];
inforBox['tab2'] = ['HI','OK~','变脸','吐','大笑','发火','吃惊','扁人','晕','晚安','谄媚','流汗','沙发','泪奔','鼻血','我吓死你','被雷到了','路过','疑惑','鬼脸','鄙视','讽刺','难过','顶','咱聊聊啊','打酱油','努力','北京欢迎您','冠军','鸟巢','加油哦','滑冰','无影手','奥运加油'];

//大对象
FaceHandler = {
	imageFolders:{tab0:'base/',tab1:'huhu/',tab2:'bofu/'},
	imageWidth:{tab0:20,tab1:42,tab2:42},
	imageCols:{tab0:10,tab1:10,tab2:10},
	imageColWidth:{tab0:3,tab1:3,tab2:3},
	imageCss:{tab0:'jd',tab1:'tsj',tab2:'ldw'},
	imageCssOffset:{tab0:20,tab1:42,tab2:42},
	tabExist:[0,0,0,0,0,0,0]
};
function switchTab(index) {
	if (FaceHandler.tabExist[index] == 0) {
		FaceHandler.tabExist[index] = 1;
		createTab('tab' + index);
	}
	//获取呈现元素句柄数组
	var tabMenu = $G("tabMenu").getElementsByTagName("div"),
		tabContent = $G("tabContent").getElementsByTagName("div"),
		i = 0,L = tabMenu.length;
	//隐藏所有呈现元素
	for (; i < L; i++) {
		tabMenu[i].className = "";
		tabContent[i].style.display = "none";
	}
	//显示对应呈现元素
	tabMenu[index].className = "on";
	tabContent[index].style.display = "block";
}
function createTab(tabName) {
	var faceVersion = "?v=1.1",//版本号
		tab = $G(tabName),//获取将要生成的Div句柄
		imagePath = sBasePath + FaceHandler.imageFolders[tabName],//获取显示表情和预览表情的路径
		imageColsNum = FaceHandler.imageCols[tabName],//每行显示的表情个数
		positionLine = imageColsNum / 2,//中间数
		iWidth = iHeight = FaceHandler.imageWidth[tabName],//图片长宽
		iColWidth = FaceHandler.imageColWidth[tabName],//表格剩余空间的显示比例
		tableCss = FaceHandler.imageCss[tabName],
		cssOffset = FaceHandler.imageCssOffset[tabName],
		textHTML = ['<table class="smileytable" cellpadding="1" cellspacing="0" align="center" style="border-collapse:collapse;table-layout:fixed;" border="1" bordercolor="#BAC498" width="100%">'],
		i = 0,imgNum = faceBox[tabName].length,imgColNum = FaceHandler.imageCols[tabName],faceImage,
		sUrl,realUrl,posflag,offset,infor;
	for (; i < imgNum;) {
		textHTML.push('<tr>');
		for (var j = 0; j < imgColNum; j++,i++) {
			faceImage = faceBox[tabName][i];
			if (faceImage) {
				sUrl = imagePath + faceImage + faceVersion;
				realUrl = imagePath + faceImage;
				posflag = j < positionLine ? 0 : 1;
				offset = cssOffset * i * (-1) - 1;
				infor = inforBox[tabName][i];
				textHTML.push('<td  class="' + tableCss + '"   border="1" width="' + iColWidth + '%" style="border-collapse:collapse;" align="center"  bgcolor="#FFFFFF" onclick="InsertSmiley(\'' + realUrl.replace(/'/g, "\\'") + '\')" onmouseover="over(this,\'' + sUrl + '\',\'' + posflag + '\')" onmouseout="out(this)">');
				textHTML.push('<span  style="display:block;">');
				textHTML.push('<img  style="background-position:left ' + offset + 'px;" title="' + infor + '" src="' + sBasePath + '0.gif" width="' + iWidth + '" height="' + iHeight + '"></img>');
				textHTML.push('</span>');
			} else {
				textHTML.push('<td width="' + iColWidth + '%"   bgcolor="#FFFFFF">');
			}
			textHTML.push('</td>');
		}
		textHTML.push('</tr>');
	}
	textHTML.push('</table>');
	textHTML = textHTML.join("");
	tab.innerHTML = textHTML;
}
var tabIndex = 0;
switchTab(tabIndex);
$G("tabIconReview").style.display = 'none';