/**
 * Created by JetBrains PhpStorm.
 * User: taoqili
 * Date: 12-07-25
 * Time: 下午2:52
 * To change this template use File | Settings | File Templates.
 */
var imageUploader = {}
imageUploader.setDescrition = function(desc) {
	this.descrition = desc
};
(function (doc) {
	
var g = $G,
	// $ = parent.jQuery,
	pdoc = parent.document,
	flagImg = null,
	flashObj; //flash上传对象

imageUploader.init = function (opt, callbacks) {
	switchTabs('imageTab')
	createAlignButton( ['remoteFloat', 'localFloat'] )
	createFlash(opt, callbacks)
	var srcImg = editor.selection.getRange().getClosedNode()
	if (srcImg) {
		showImageInfo(srcImg)
		showPreviewImage(srcImg, true)
		setTimeout(function() {
			$('[tabsrc=remote]', doc).click()
		}, 100)
	}
	addUrlChangeListener()
	addUploadListener()
	addOKListener()
	$focus(g('url'))
	zoom(true)
	dialog.showAtCenter()

	var top = pdoc.documentElement.scrollTop  || pdoc.body.scrollTop
	if (top != 0) {
		dialog.getDom().style.top = (130+top) + 'px'
	}
	
	dialog.getDom().parentNode.style.position = ''
	$('#edui64', pdoc).hide()
	$('#edui72_titlebar', pdoc).css('cursor', 'auto')
};
/**
 * 绑定确认按钮
 */
function addOKListener() {
	function resetStyle() {
		setTimeout(function() {
			dialog.getDom().parentNode.style.position = 'fixed'
		}, 1000)
	}
	dialog.onok = function () {
		var currentTab = findFocus( 'tabHeads', 'tabSrc' )
		switch ( currentTab ) {
			case 'remote':
				insertSingle()
				break;
			case 'local':
				insertBatch()
				break;
			case 'myalbum':
				insertAlbum()
				break;
			default:
				return;
		}
		resetStyle()
	}
	dialog.oncancel = function() {
		resetStyle()
	}
}

// 插入单张图片
function insertSingle() {
	var url     = g( 'url' ),
		width   = g( 'width' ),
		height  = g( 'height' ),
		border  = g( 'border' ),
		vhSpace = g( 'vhSpace' ),
		title   = g( 'title' ),
		align   = findFocus( 'remoteFloat', 'name' ),
		imgObj  = {}
		
	if ( !url.value ) return;
	if ( !flagImg ) return;   //粘贴地址后如果没有生成对应的预览图，可以认为本次粘贴地址失败
	if ( !checkNum( [width, height, border, vhSpace] ) ) return false;
	imgObj.src         = url.value
	imgObj.data_ue_src = url.value
	imgObj.width       = width.value
	imgObj.height      = height.value
	imgObj.border      = border.value
	imgObj.floatStyle  = align
	imgObj.vspace      = imgObj.hspace = vhSpace.value
	imgObj.title       = title.value
	imgObj.style       = 'width:' + width.value + 'px;height:' + height.value+ 'px;'
	editor.execCommand('insertImage', imgObj)
	editor.fireEvent( 'catchRemoteImage' )
}
/**
 * 检测传入的所有input框中输入的长宽是否是正数
 * @param nodes input框集合，
 */
function checkNum( nodes ) {
	for ( var i = 0, ci; ci = nodes[i++]; ) {
		if ( !isNumber( ci.value ) || ci.value < 0 ) {
			alert('请输入正确的长度或者宽度值！例如：123，400')
			ci.value = ''
			ci.focus()
			return false
		}
	}
	return true
}

// 数字判断
function isNumber( value ) {
	return /(0|^[1-9]\d*$)/.test( value )
}

// 整理字符串，汉字算两个字符
function computeStr(str, len) {
	len = len || 10
	str = str.substr(0,len)
	var re = /[\u4E00-\u9FA5]/
	var arr = []
	var i = 0, leng = 0, temp
	
	for (; i<str.length; i++) {
		temp = str.substr(i, 1)
		if (temp) {
			if ( re.test(temp) ) {
				leng+=2
			} else {
				leng++
			}
			
			if (leng<=10) {
				arr.push(temp)
			}
		}
	}
	
	return arr.join('')
}

// 插入多张图片
function insertBatch() {
	if ( imageUrls.length < 1 ) return;
	var imgObjs = [], align = findFocus('localFloat', 'name')
	for (var i = 0, ci; ci = imageUrls[i++];) {
		var tmpObj = {}
		tmpObj.title = ci.title
		tmpObj.floatStyle = align
		//修正显示时候的地址数据,如果后台返回的是图片的绝对地址，那么此处无需修正
		tmpObj.data_ue_src = tmpObj.src = ci.big_url; // origin_url改为big_url
		imgObjs.push( tmpObj )
	}
	editor.execCommand('insertImage', imgObjs)
}
/**
 * 插入我的相册图片
 */
function insertAlbum() {
	var centerUl = $('.c-center ul', doc)
	var isInsertAlbumName = $('.select-all input', doc)[0].checked
	var imgObjs = $('.c-right li', doc).map(function(i, it) {
		var title = ''
		var obj   = {}
		var $li   = $(it)
		var width = $li.attr('data-width')
		var tit   = $li.find('input').val()
		var sjpg  = $li.find('img').attr('src')
		obj.data_ue_src = obj.src = $li.attr('data-url930')
		if (isInsertAlbumName) {
			title = '该图片所属专辑：' + $li.data('albumname')
			title += '<br/>'
		}
		// if (width>750) {
			// obj.width = 750
		// }
		obj.title = title + (tit=='点击添加描述' ? '' : tit)
		obj.floatStyle = 'center'
		return obj
	}).toArray()
	
	if (imgObjs[0].src) {
		editor.execCommand('insertImage', imgObjs)
	}
	
}
/**
 * 找到id下具有focus类的节点并返回该节点下的某个属性
 * @param id
 * @param returnProperty
 */
function findFocus( id, returnProperty ) {
	var tabs = g( id ).children, property
	for ( var i = 0, ci; ci = tabs[i++]; ) {
		if ( ci.className=='focus' ) {
			property = ci.getAttribute( returnProperty )
			break
		}
	}
	return property
}

// 绑定开始上传事件
function addUploadListener() {
	g( 'upload' ).onclick = function () {
		flashObj.upload()
		this.style.display = 'none'
	}
}

// 绑定地址框改变事件
function addUrlChangeListener() {
	var value = g('url').value
	if (browser.ie) {
		g('url').onpropertychange = function () {
			var v = this.value
			if(v!=value){
				createPreviewImage( v )
				value = v
			}
		}
	} else {
		g('url').addEventListener('input', function () {
			var v = this.value
			if(v!=value){
				createPreviewImage( v )
				value = v
			}
		}, false )
	}
}
/**
 * 绑定图片等比缩放事件
 * @param percent  缩放比例
 */
function addSizeChangeListener( percent ) {
	var width  = g('width'),
		height = g('height'),
		lock   = g('lock')
	width.onkeyup = function () {
		if ( !isNaN( this.value ) && lock.checked ) {
			height.value = Math.round( this.value / percent ) || this.value
		}
	};
	height.onkeyup = function () {
		if ( !isNaN( this.value ) && lock.checked ) {
			width.value = Math.round( this.value * percent ) || this.value
		}
	}
}

// 依据url中的地址创建一个预览图片并将对应的信息填入信息框和预览框
function createPreviewImage(url) {
	if ( !url ){
		flagImg = null;
		g( 'preview' ).innerHTML = ''
		g( 'width' ).value       = ''
		g( 'height' ).value      = ''
		g( 'border' ).value      = ''
		g( 'vhSpace' ).value     = ''
		g( 'title' ).value       = ''
		$focus(g('url'))
		return
	}
	var img     = document.createElement('img'),
		preview = g( 'preview' )
	
	// pp.sohu.com里的图片都没有png,gif,jpg,jpeg，这里单独处理下
	var imgTypeReg = /(\.(png|gif|jpg|jpeg)$)|(img\.itc\.cn)/gi, //格式过滤
		urlFilter  = ''							//地址过滤
		
	if ( !imgTypeReg.test( url ) || url.indexOf( urlFilter ) == -1 ) {
		preview.innerHTML = '<span style="color: red">不允许的图片格式或者图片域！</span>'
		flagImg           = null
		return
	}
	preview.innerHTML = '图片加载中……'
	img.onload = function () {
		flagImg = this
		showImageInfo( this )
		showPreviewImage( this )
		this.onload = null
	};
	img.onerror = function () {
		preview.innerHTML = '<span style="color: red">图片加载失败！请检查链接地址或网络状态！</span>'
		flagImg           = null
		this.onerror      = null
	};
	img.src = url
}
/**
 * 显示图片对象的信息
 * @param img
 */
function showImageInfo( img ) {
	if ( !img.getAttribute( 'src' ) || !img.src ) return;
	var wordImgFlag  = img.getAttribute( 'word_img' )
	g( 'url' ).value = wordImgFlag ? wordImgFlag.replace( '&amp;', '&' ) : (img.getAttribute( 'data_ue_src' ) ||
			(editor.options.relativePath ? img.getAttribute( 'src', 2 ).replace( '&amp;', '&' ) : img.src.replace( '&amp;', '&' )));
	g( 'width' ).value   = img.width || 0
	g( 'height' ).value  = img.height || 0
	g( 'border' ).value  = img.getAttribute( 'border' ) || 0
	g( 'vhSpace' ).value = img.getAttribute( 'vspace' ) || 0
	g( 'title' ).value   = img.title || ''
	var align = editor.queryCommandValue( 'imageFloat' ) || 'none'
	updateAlignButton( align )

	//保存原始比例，用于等比缩放
	var percent = (img.width / img.height).toFixed( 2 )
	addSizeChangeListener( percent )
}

/**
 * 将img显示在预览框，
 * @param img
 * @param needClone  是否需要克隆后显示
 */
function showPreviewImage(img, needClone) {
	var tmpWidth = img.width, tmpHeight = img.height
	if ( needClone ) {
		//针对编辑图片时
		img        = img.cloneNode( true )
		img.width  = tmpWidth
		img.height = tmpHeight
		flagImg = img
	}
	var maxWidth = 250
	scale( img, maxWidth,maxWidth,maxWidth )
	if ( (img.width + 2 * img.border) > maxWidth ) {
		img.width = maxWidth - 2 * img.border
	}
	if ( (img.height + 2 * img.border) > maxWidth ) {
		img.height = maxWidth - 2 * img.border
	}
	var preview = g( 'preview' )
	preview.innerHTML = '<img src="' + img.src + '" width="' + img.width + '" height="' + img.height + '" border="' + img.border + 'px solid #000" />'
	
}
/**
 * 图片缩放
 * @param img
 * @param max
 */
function scale(img, max, oWidth, oHeight) {
	var width = 0, height = 0, percent, ow = img.width || oWidth, oh = img.height || oHeight;
	if ( ow > max || oh > max ) {
		if ( ow >= oh ) {
			if ( width = ow - max ) {
				percent    = (width / ow).toFixed( 2 )
				img.height = oh - oh * percent
				img.width  = max
			}
		} else {
			if ( height = oh - max ) {
				percent    = (height / oh).toFixed( 2 )
				img.width  = ow - ow * percent
				img.height = max
			}
		}
	}
}
/**
* 创建flash实例
* @param opt
* @param callbacks
*/
function createFlash(opt, callbacks) {
	var option = {
		createOptions:{
			id:'flash',
			url:opt.flashUrl,
			width:opt.width,
			height:opt.height,
			errorMessage:'Flash插件初始化失败，请更新您的FlashPlayer版本之后重试！',
			wmode: 'transparent',
			ver:'10.0.0',
			vars:opt,
			container:opt.container
		}
	}
	option = utils.extend( option, callbacks, false )
	flashObj = new baidu.flash.imageUploader( option )
}
/**
 * 依据传入的align值更新按钮信息
 * @param align
 */
function updateAlignButton(align) {
	var aligns = g( 'remoteFloat' ).children
	for ( var i = 0, ci; ci = aligns[i++]; ) {
		if ( ci.getAttribute( 'name' ) == align ) {
			if ( ci.className !='focus' ) {
				ci.className = 'focus'
			}
		} else {
			if ( ci.className =='focus' ) {
				ci.className = ''
			}
		}
	}
}

/**
 * 创建图片浮动选择按钮
 * @param ids
 */
function createAlignButton(ids) {
	for ( var i = 0, ci; ci = ids[i++]; ) {
		var floatContainer = g( ci ),
			nameMaps = {'none':'默认', 'left':'左浮动', 'right':'右浮动', 'center':'居中'}
		for ( var j in nameMaps ) {
			var div = document.createElement( 'div' )
			div.setAttribute( 'name', j )
			if ( j == 'none' ) div.className='focus'
			div.style.cssText = 'background:url(http://s3.suc.itc.cn/mysohu/ueditor/themes/default/images/' + j + '_focus.jpg);'
			div.setAttribute( 'title', nameMaps[j] )
			floatContainer.appendChild( div )
		}
		switchSelect( ci )
	}
}
/**
 * 放大或缩小窗口
 * 本地图片/网络图片 缩小
 * 相册图片 放大
 */
function zoom(def) {
	var $body = $('#edui72_body', pdoc)
	var $content = $('#edui72_content', pdoc)
	var $wrapper = $('.wrapper', doc)
	var $tabHeads = $('#tabHeads', doc)
	var $tabBodys = $('#tabBodys', doc)
	var $panel    = $('.panel', $tabBodys)
	var ie78 = $.browser.msie && !Array.isArray
	if (def) {
		$body.css({
			width: 640,
			height: 457
		})
		$content.css({
			width: 640,
			height: 390
		})
		$wrapper.css({
			width: 640
		})
		$tabHeads.css({
			width: 610
		})
		$tabBodys.css({
			width: 620,
			height: 325
		})
		$panel.css({
			width: 620,
			height: 325
		})
	} else {
		$body.css({
			width: (ie78 ? 753 : 752),
			height: (ie78 ? 585 : 581)
		})
		$content.css({
			width: (ie78 ? 753 : 752),
			height: (ie78 ? 519 : 514)
		})
		$wrapper.css({
			width: 752
		})
		$tabHeads.css({
			width: 740
		})
		$tabBodys.css({
			width: 750,
			height: 468
		})
		$panel.css({
			width: 750,
			height: 375
		})		
	}
}
/**
 * TAB切换
 * @param tabParentId  tab的父节点ID或者对象本身
 */
function switchTabs() {
	var doc     = document,
		currTab = $('[tabSrc=local]', doc)
		
	$('#imageTab', doc)
		.delegate('span[tabSrc]', 'click', function() {
			var $el = $(this), id = $el.attr('tabSrc')
			currTab.removeClass('focus')
			$('#' + currTab.attr('tabSrc'), doc).hide()
			currTab = $el.addClass('focus')
			$('#'+id, doc).show()
			
			if (id=='remote') {
				$focus(g('url'))
			} else if (id=='myalbum') {
				album.initAlbum()
			}
			
			if (id=='local') {
				$(doc.body).mouseenter(on)
			} else {
				$(doc.body).mouseleave(un)
			}
			
			if (id=='myalbum') {
				zoom(false)
			} else {
				zoom(true)
			}
			
		})
}

var album = function(doc) {
	var xpt = parent.jQuery.cookie('sucaccount', {raw:true}).split('|')[0]
	
	// DOM元素
	var albumEl    = $('#myalbum', doc),
		leftUl     = $('.c-left ul', albumEl),
		albumPagi  = $('.left-pagination', albumEl),
		imgsEl     = $('.c-center-wrapper', albumEl),
		imgsTip    = $('p', imgsEl),
		centerUl   = $('ul', imgsEl),
		imgPagi    = $('.list-pagination', albumEl),
		imgTotalEl = $('span.total', imgPagi),
		rightEl    = $('.c-right', albumEl),
		rightUl    = $('ul', rightEl),
		numEl      = $('.t-right .num', albumEl),
		selAllEl   = $('label.select input', albumEl)
		
	// 相册翻页相关
	var albumTotal, albumPage, currAlbum, pageAlbumCount = 30, currAlbumPage = 0
	
	// 图片翻页相关
	var imgTotal, imgPage, pageImgCount = 30, currImgPage = 0
	
	// 选定相关
	var imgNum = 0, MAX = 100, selectedObj = {}
	
	function initAlbum() {
		loadAlbum(0)
	}
	
	function loadAlbum(page) {
		$.ajax('http://i.sohu.com/a/album/photoset/list.do', {
			type: 'post',
			data: {
				xpt: xpt,
				start: pageAlbumCount*page,
				count: pageAlbumCount
			},
			dataType: 'json'
		})
		.done(function(json) {
			if (json.code == 0 && json.data) {
				if (!albumTotal) {
					albumTotal = json.data.total
					albumPage = albumTotal%pageAlbumCount==0 ? albumTotal/pageAlbumCount : Math.floor(albumTotal/pageAlbumCount)+1
				}
				if (albumPage>1) {
					albumPagi.show()
				}
				leftUl.html(buildAlbum(json.data.photosets))
				
			}
		})
	}
	
	function nextAlbum() {
		// 相册从0开始计数
		if (currAlbumPage<albumPage-1) {
			loadAlbum(++currAlbumPage)
		}
	}
	function prevAlbum() {
		if (currAlbumPage>0) {
			loadAlbum(--currAlbumPage)
		}
	}
	function buildAlbum(list) {
		var arr = []
		for (var i=0; i<list.length; i++) {
			arr.push(oneAlbum(list[i]))
		}
		return arr.join('')
	}
	function oneAlbum(o) {
		var str = 
			'<li data-id="' + o.id + '">' +
				'<div class="img">' +
					'<img width="88" height="88" src="' + o.coverUrl150 + '"/>' +
				'</div>' +
				'<div class="tt" title="' + o.name + '">' + 
					computeStr(o.name) + 
				'</div>' +
			'</li>'
		return str
	}
	
	// 拼相册列表URL地址
	function getPhotoListUrl(urlAlbum, albumId) {
		urlAlbum = $.trim(urlAlbum)
		var arr = urlAlbum.split('photo')
		var url = arr[0] + 'photoset/' + albumId + '/photos/#1'
		return url
	}
	
	function loadImg(id, page) {
		$.ajax('http://i.sohu.com/a/album/photo/list.do', {
			type: 'post',
			data: {
				xpt: xpt,
				photosetid: id,
				start: pageImgCount*page,
				count: pageImgCount
			},
			dataType: 'json'
		})
		.done(function(json) {
			if (json.code == 0 && json.data) {
				var data  = json.data
				imgTotal  = data.total
				imgPage   = imgTotal%pageImgCount==0 ? imgTotal/pageImgCount : Math.floor(imgTotal/pageImgCount)+1
				var first = data.photos[0]
				var url   = getPhotoListUrl(first.urlAlbum, id)
				var link  = '<a target="_blank" href="' + url + '">' + first.photosetName + '</a>'
				if (imgPage>0) {
					centerUl.data('photosetid', id)
					centerUl.data('albumname', link)
					centerUl.html(buildImg(data.photos))
					checkSelected()
					changeSelAllStatus()
					imgsTip.hide()
				}
				if (imgPage>1) {
					imgTotalEl.html('共'+imgPage+'页')
					imgPagi.show()
				} else {
					imgPagi.hide()
				}
				
			} else {
				centerUl.empty()
			}
		})
	}
	
	function buildImg(list) {
		var arr = []
		for (var i=0; i<list.length; i++) {
			arr.push(oneImg(list[i]))
		}
		return arr.join('')
	}
	
	function oneImg(o) {
		var defaultWidth = o.dim.split('x')[0]
		var str = 
			'<li data-width="' + defaultWidth + '" data-url930="' + o.url930 + '">' +
				'<div class="img">' +
					'<img width="84" height="84" src="' + o.url150 + '">' + 
				'</div>' +
				'<div class="tt" title="' + o.description + '">' + 
					computeStr(o.description) + 
				'</div>' +
			'</li>'
			
		return str
	}
	
	// 翻页相关
	function firstImg(id) {
		loadImg(id, currImgPage=0)
	}
	function lastImg(id) {
		loadImg(id, currImgPage=imgPage-1)
	}
	function nextImg(id) {
		if ( currImgPage==imgPage-1 ) return
		loadImg(id, ++currImgPage)
	}
	function prevImg(id) {
		if ( currImgPage==0 ) return
		loadImg(id, --currImgPage)
	}
	
	function changeNum(plus) {
		if (plus) {
			imgNum++
		} else {
			imgNum--
		}
		numEl.html(imgNum)
	}
	
	// 已经选中的加上打钩icon
	function checkSelected() {
		centerUl.find('li').each(function(i, it) {
			var $li = $(it)
			var src = $li.find('img').attr('src')
			if (selectedObj[src]) {
				addIcon($li)
			}
		})	
	}
	// 改变全选按钮状态
	function changeSelAllStatus() {
		var isSelectAll = 1
		centerUl.find('li').each(function(i, it) {
			if (!$(it).find('.icon-click').length) {
				isSelectAll = 0
				return false
			}
		})
		if ( isSelectAll ) {
			selAllEl[0].checked = true
		} else {
			selAllEl[0].checked = false
		}
	}
	
	function addIcon($li) {
		$li.find('.img').prepend('<i class="icon-click"></i>')
	}
	
	// 添加一张图片
	function add($li) {
		var $div   = $li.find('.img')
		var $tt    = $li.find('.tt')
		var src    = $div.find('img').attr('src')
		var title  = $tt[0].title
		var tit    = $tt.text()
		var width  = $li.attr('data-width')
		var url930 = $li.attr('data-url930')
		var $temp = $(
			'<li class="checked" data-width="' + width + '" data-url930="' + url930 + '">' +
				'<div class="img">' +
					'<img width="84" height="84" src="' + src + '"/>' +
				'</div>' +
				'<div class="tt" title="' + title + '">' + 
					(tit || '点击添加描述') + 
				'</div>' +
				'<input type="text" value="' + title + '"/>' +
			'</li>')
		
		selectedObj[src] = 1
		$temp.data('albumname', centerUl.data('albumname'))
		addIcon($li)
		// 默认ul中有四个空li填充背景，首次添加图片清空
		if (rightUl.find('li').first().children().length == 0) {
			rightUl.empty()
		}
		rightUl.append($temp)
		rightEl.scrollTop(rightUl.height())
		changeNum(true)
		changeSelAllStatus()
	}
	
	// 删除一张图片
	function remove($li) {
		var $div = $li.find('.img')
		var src  = $div.find('img').attr('src')
		$div.find('i').remove()
		removeLi(src)
		setRemoveStatus(src)
	}
	function removeLi(src) {
		rightUl.find('li').each(function(i, it) {
			var $li  = $(it)
			var srcc = $li.find('img').attr('src')
			if (srcc == src) {
				$li.remove()
			}
		})
	}
	
	function setRemoveStatus(src) {
		if (selectedObj[src]) {
			delete selectedObj[src]
			changeNum(false)
			changeSelAllStatus()
		}
	}
	
	function prompting() {
		alert('最多可插入100张图片。')
	}
	
	albumEl
		.delegate('.c-left-wrapper li', 'click', function() {
			var $self = $(this)
			var id = $self.attr('data-id')
			firstImg(id)
			if (currAlbum) {
				currAlbum.removeClass('click')
			}
			currAlbum = $self
			currAlbum.addClass('click')
		})
		.delegate('.left-next', 'click', function() {
			nextAlbum()
		})
		.delegate('.left-prev', 'click', function() {
			prevAlbum()
		})
		.delegate('.page-first', 'click', function() {
			var id = centerUl.data('photosetid')
			firstImg(id)
		})
		.delegate('.page-prev', 'click', function() {
			var id = centerUl.data('photosetid')
			prevImg(id)
		})
		.delegate('.page-next', 'click', function() {
			var id = centerUl.data('photosetid')
			nextImg(id)
		})
		.delegate('.page-last', 'click', function() {
			var id = centerUl.data('photosetid')
			lastImg(id)
		})
		.delegate('.c-center-wrapper li', 'click', function() {
			var $self = $(this)
			var $div = $self.find('.img')
			if ($div.find('i').length == 0) {
				if (imgNum < MAX) {
					add($self)
				} else {
					prompting()
				}
			} else {
				remove($self)
			}
			
		})
		.delegate('.c-right .tt', 'click', function() {
			var $self  = $(this)
			var $input = $self.hide().next()
			$input.show()[0].focus()
			$input[0].onblur = function() {
				var txt = computeStr($input.val())
				$self.text(txt).show()
				$input.hide()
			}
		})
		.delegate('.c-right li .img', 'click', function() {
			var $self = $(this)
			var src   = $self.find('img').attr('src')
			var $li   = null
			centerUl.find('li').each(function(i, it) {
				var $img = $(it).find('img')
				if ($img.attr('src') == src) {
					$li = $(it) 
				}
			})
			if ($li) {
				$li.find('i').remove()
			}
			$self.parent().remove()
			setRemoveStatus(src)
		})
		.delegate('label.select input', 'click', function() {
			var lis = $('.c-center-wrapper li', doc)
			var checked = this.checked
			
			if (imgNum>=MAX) {
				prompting()
				return
			} 
			lis.each(function(i, it) {
				var $li = $(it)
				// 全选
				if (checked) {
					if (imgNum<MAX) {
						if ($li.find('i').length == 0) {
							add($li)
						}
					} else {
						prompting()
						return false
					}
				// 取消全选
				} else {
					remove($li)
				}
			})
		})
	
	return {
		initAlbum: initAlbum
	}
		
}(document);


/**
 * 选择切换，传入一个container的ID
 * @param selectParentId
 */
function switchSelect( selectParentId ) {
	var $el = $('#'+selectParentId, document)
	var curr = $el.children('[name=none]')
	$el.delegate('div', 'click', function() {
		curr.removeClass('focus')
		curr = $(this).addClass('focus')
	})
}

// 避免flash中鼠标中轮滚动影响到页面
var mousewheel = browser.ie||browser.webkit?'mousewheel':'DOMMouseScroll'
var dialogEl   = dialog.getDom()
function scrollHander(e) {
	if (e.preventDefault) {
		e.preventDefault()
	} else {
		e.returnValue = false
	}
}
function on(e) {
	try{
		domUtils.on(doc.body, mousewheel, scrollHander)
		domUtils.on(parent, mousewheel, scrollHander)
	}catch(e){}
}
function un(e) {
	try{
		domUtils.un(doc.body, mousewheel, scrollHander)
		domUtils.un(parent, mousewheel, scrollHander)
	}catch(e){}
}

})(document);
