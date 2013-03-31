/**
 *  ueditor完整配置项
 *  可以在这里配置整个编辑器的特性
 */

(function () {
	$blog_config = $blog_config || {};
	
    var tmp = window.location.pathname, initStyles = [], baseImg = 'http://s3.suc.itc.cn/mysohu/ueditor/themes/mysohu/images/',
        URL = window.UEDITOR_HOME_URL||tmp.substr(0,tmp.lastIndexOf("\/")+1).replace("_examples/","").replace("website/","");//这里你可以配置成ueditor目录在您网站的相对路径或者绝对路径（指以http开头的绝对路径）
    
    initStyles.push('body{margin:8px;*margin:3px 8px;margin:3px 8px/9;overflow:hidden;font-family:"宋体";font-size:14px;word-wrap:break-word;line-height:160%;}');
    initStyles.push('*{line-height:160%;}');
    initStyles.push('p{margin:5px 0;}');
    initStyles.push('img{max-width:100%;height:auto;_zoom:expression((function w(W){this.onload=w;var a;if(a=this.width-W){a>0&&!this.naturalWidth&&(this.naturalWidth=W+a);(a>0||a<0&&this.naturalWidth>= W)&&(this.style.width=W+"px");}return 1;}).call(this,750));}');
    // taobao 广告样式
    initStyles.push('.blog-article-insertad{width:596px;margin:0 auto 15px;border:1px solid #c9caca;padding:10px;overflow:hidden;zoom:1}')
    initStyles.push('.blog-article-insertad .img{width:70px;height:70px;float:left;padding-right:15px;}');
    initStyles.push('.blog-article-insertad .img img{width:70px;height:70px;}');
    initStyles.push('.blog-article-insertad .info{float:left;}');
    initStyles.push('.blog-article-insertad .info h4{height:22px;line-height:22px;padding:10px 0 8px 0;margin:0}');
    initStyles.push('.blog-article-insertad .info h4 a{color:#828282;font-size:14px;vertical-align:middle;}');
    initStyles.push('.blog-article-insertad .info h4 i{width:29px;height:14px;display:inline-block;margin-right:10px;vertical-align:middle;}');
    initStyles.push('.blog-article-insertad .info h4 i.icon-cx{background: url("' + baseImg + 'icon_blog_ad_cx.gif") no-repeat 0 0;}');
    initStyles.push('.blog-article-insertad .info h4 i.icon-rm{background: url("' + baseImg + 'icon_blog_ad_rm.gif") no-repeat 0 0;}');
    initStyles.push('.blog-article-insertad .info .zjcj .lt{color:#999;margin-right: 20px;font-size:12px;}');
    initStyles.push('.blog-article-insertad .info .zjcj .lt em.num{font-family: "Tahoma";font-size: 14px;font-weight: 600;color:#ee0000;font-style:normal;}');
    initStyles.push('.blog-article-insertad .info .zjcj .rt{color:#999;font-size:12px;}');
    initStyles.push('.blog-article-insertad .info .zjcj .rt em{width:16px;height:16px;display:inline-block;margin-right:2px;vertical-align:middle;background: url("' + baseImg + 'icon_blog_ad_hg.gif") no-repeat 0 0;}');
    initStyles.push('.blog-article-insertad .info .zjcj .rt em.icon-s-crown{background-position: 0 0;}');
    initStyles.push('.blog-article-insertad .info .zjcj .rt em.icon-s-cap{background-position: 0 -16px;}');
    initStyles.push('.blog-article-insertad .info .zjcj .rt em.icon-s-blue{background-position: 0 -32px;}');
    initStyles.push('.blog-article-insertad .info .zjcj .rt em.icon-s-red{background-position: 0 -48px;}');
    initStyles.push('.blog-article-insertad .price{float:right;height:60px;padding:0 15px 0 0;}');
    initStyles.push('.blog-article-insertad .price-double{height:55px;padding:15px 15px 0 0;}');
    initStyles.push('.blog-article-insertad .price span.p-jg{font:14px "Microsoft YaHei" 600;color:#ee0000;display: block;}');
    initStyles.push('.blog-article-insertad .price span.p-jg .num{font: 18px "Tahoma"}');
    initStyles.push('.blog-article-insertad .price span.p-jg .num strong{font-size:24px}');
    initStyles.push('.blog-article-insertad .price del{color:#999999;}');
    initStyles.push('.blog-article-insertad .price del .d-num{font-size: 14px}');
    initStyles.push('.blog-article-insertad .btn-qkk{float:right;width: 98px;height: 55px;overflow: hidden;padding: 15px 5px 0 0;}');
    initStyles.push('.blog-article-insertad .btn-qkk a{display: block;width: 98px;height:38px;background: url("' + baseImg + 'btn_blog_ad_qkk.gif") no-repeat 0 0;}');
    	
    UEDITOR_CONFIG = {
        imagePath:URL + "server/upload/", //图片文件夹所在的路径，用于显示时修正后台返回的图片url！具体图片保存路径需要在后台设置。！important
        compressSide:0,                   //等比压缩的基准，确定maxImageSideLength参数的参照对象。0为按照最长边，1为按照宽度，2为按照高度
        maxImageSideLength:900,          //上传图片最大允许的边长，超过会自动等比缩放,不缩放就设置一个比较大的值
        relativePath:true,                //是否开启相对路径。开启状态下所有本地图片的路径都将以相对路径形式进行保存.强烈建议开启！
        filePath:URL + "server/upload/",  //附件文件夹保存路径
	    catchRemoteImageEnable:true,                                   //是否开启远程图片抓取
        catcherUrl:URL +"server/submit/php/getRemoteImage.php",             //处理远程图片抓取的地址
        localDomain:"sohu.com",                                        //本地顶级域名，当开启远程图片抓取时，除此之外的所有其它域名下的图片都将被抓取到本地
        UEDITOR_HOME_URL:URL,                                          //为editor添加一个全局路径
        //工具栏上的所有的功能按钮和下拉框，可以在new编辑器的实例时选择自己需要的从新定义 Link
		toolbarItems:[
			'Save','Undo','Redo','|','Paste','Cut','Copy','|',
			'FontFamily','FontSize',
			'Bold','Italic', 'Underline','StrikeThrough','ForeColor', 'BackColor','|',
			'InsertOrderedList', 'InsertUnorderedList','PastePlain','SelectAll',
			'JustifyLeft', 'JustifyCenter', 'JustifyRight','Indent','|',
			'Link','Emotion','InsertImage', ($blog_config.showAd?'InsertAD':'InsertVideo'), '|',
			'RemoveFormat','AutoTypeSet','Source','Preview'
		],
       
        //当鼠标放在工具栏上时显示的tooltip提示
        labelMap:{
            'anchor':'锚点', 'undo':'撤销', 'redo':'重做', 'bold':'加粗', 'indent':'首行缩进',
            'italic':'斜体', 'underline':'下划线', 'strikethrough':'删除线', 'subscript':'下标',
            'formatmatch':'格式刷', 'source':'源代码', 'blockquote':'引用',
            'pasteplain':'纯文本粘贴模式', 'selectall':'全选', 'preview':'预览',
            'horizontal':'分隔线', 'removeformat':'清除格式', 'time':'时间', 'date':'日期',
            'unlink':'取消链接', 'cleardoc':'清空文档',
            'fontfamily':'字体', 'fontsize':'字号', 'paragraph':'段落格式', 'insertimage':'插入图片', 'link':'超链接',
            'emotion':'表情', 'insertvideo':'视频', 'insertad': '商品', 'justifyleft':'居左对齐', 'justifyright':'居右对齐', 'justifycenter':'居中对齐',
            'justifyjustify':'两端对齐', 'forecolor':'字体颜色', 'backcolor':'背景色', 'insertorderedlist':'有序列表',
            'insertunorderedlist':'无序列表', 'imagenone':'默认',
            'imageleft':'左浮动', 'imageright':'右浮动', 'imagecenter':'居中', 'wordimage':'图片转存',
            'lineheight':'行间距', 'customstyle':'自定义标题','autotypeset': '一键排版','save':'保存','paste':'粘贴','cut':'剪切','copy':'复制'
        },
        //dialog内容的路径 ～会被替换成URL
        iframeUrlMap:{
        	'anchor':'/a/blog/dialogs/anchor/anchor.html',
            'insertimage':'/a/blog/dialogs/image/image.html',
            'link': '/a/blog/dialogs/link/link.html',
            'insertad': '/a/blog/dialogs/taobao/ad.html',
            'insertvideo':'/a/blog/dialogs/video/video.html',
            'wordimage':'/a/blog/dialogs/wordimage/wordimage.html',
            'emotion': '/a/blog/dialogs/emotion/emotion.html'
        },
        //所有的的下拉框显示的内容
        listMap:{
            //字体
            'fontfamily':['宋体', '微软雅黑', '黑体', '隶书', '楷体', '幼圆', 'Arial', 'Impact', 'Georgia', 'Verdana', 'Courier', 'Times New Roman'],
            //字号
            'fontsize':[12, 14, 16, 18, 24, 36],
            //段落格式 值:显示的名字
            'paragraph':['p:段落', 'h1:标题 1', 'h2:标题 2', 'h3:标题 3', 'h4:标题 4', 'h5:标题 5', 'h6:标题 6'],
            //段间距 值和显示的名字相同
            'rowspacing':['5', '10', '15', '20', '25'],
            //行内间距 值和显示的名字相同
            'lineheight':['1', '1.5','1.75','2', '3', '4', '5'],
            //block的元素是依据设置段落的逻辑设置的，inline的元素依据BIU的逻辑设置
            //尽量使用一些常用的标签
            //参数说明
            //tag 使用的标签名字
            //label 显示的名字也是用来标识不同类型的标识符，注意这个值每个要不同，
            //style 添加的样式
            //每一个对象就是一个自定义的样式
            'customstyle':[
                {tag:'h1', label:'居中标题', style:'border-bottom:#ccc 2px solid;padding:0 4px 0 0;text-align:center;margin:0 0 20px 0;'},
                {tag:'h1', label:'居左标题', style:'border-bottom:#ccc 2px solid;padding:0 4px 0 0;margin:0 0 10px 0;'},
                {tag:'span', label:'强调', style:'font-style:italic;font-weight:bold;color:#000'},
                {tag:'span', label:'明显强调', style:'font-style:italic;font-weight:bold;color:rgb(51, 153, 204)'}
            ]
        },
        //字体对应的style值
        fontMap:{
            '宋体':['宋体', 'SimSun'],
		    '微软雅黑':['微软雅黑','microsoft yahei'],
		    '黑体':['黑体', 'SimHei'],
		    //'新宋体':['新宋体','nsimsun'],
		    '隶书':['隶书', 'SimLi'],
            '楷体':['楷体', '楷体_GB2312', 'SimKai'],
            'andale mono':['andale mono'],
            'arial':['arial', 'helvetica', 'sans-serif'],
            'arial black':['arial black', 'avant garde'],
            'impact':['impact', 'chicago'],
            'comic sans ms':['comic sans ms'],
            'verdana':['verdana'],
            'times new roman':['times new roman']
        },
        //定义了右键菜单的内容
        contextMenu:[
			
        ],
		initialStyle: initStyles.join('\n'),
        //初始化编辑器的内容,也可以通过textarea/script给值，看官网例子
        initialContent:'',
        autoClearinitialContent:false, //是否自动清除编辑器初始内容，注意：如果focus属性设置为true,这个也为真，那么编辑器一上来就会触发导致初始化的内容看不到了
        iframeCssUrl:'http://s3.suc.itc.cn/mysohu/ueditor/themes/default/iframe.css', //要引入css的url
        removeFormatTags:'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var', //清除格式删除的标签
        removeFormatAttributes:'class,style,lang,width,height,align,hspace,valign', //清除格式删除的属性
        enterTag:'p', //编辑器回车标签。p或br
        maxUndoCount:20, //最多可以回退的次数
        maxInputCount:20, //当输入的字符数超过该值时，保存一次现场
        selectedTdClass:'selectTdClass', //设定选中td的样式名称
        pasteplain:false, //是否纯文本粘贴。false为不使用纯文本粘贴，true为使用纯文本粘贴
        //提交表单时，服务器获取编辑器提交内容的所用的参数，多实例时可以给容器name属性，会将name给定的值最为每个实例的键值，不用每次实例化的时候都设置这个值
        textarea:'editorValue',
        focus:false, //初始化时，是否让编辑器获得焦点true或false
        indentValue:'2em', //初始化时，首行缩进距离
        pageBreakTag:'_baidu_page_break_tag_', //分页符
        minFrameHeight:400, //最小高度
        autoHeightEnabled:true, //是否自动长高
        autoFloatEnabled:true, //是否保持toolbar的位置不动
        elementPathEnabled:false, //是否启用elementPath
        wordCount:false, //是否开启字数统计
        maximumWords:10000, //允许的最大字符数
        tabSize:4, //tab的宽度
        tabNode:'&nbsp;', //tab时的单一字符
        imagePopup:true, //图片操作的浮层开关，默认打开
        sourceEditor:"codemirror", //源码的查看方式，codemirror 是代码高亮，textarea是文本框
        tdHeight:'20', //单元格的默认高度
        zIndex : 999, //编辑器z-index的基数
        snapscreenImgIsUseImagePath: 1, //是否使用上面定义的imagepath，如果为否，那么server端需要直接返回图片的完整路径
        messages:{
            pasteMsg:'编辑器已过滤掉您粘贴内容中不支持的格式！', //粘贴提示
            wordCountMsg:'当前已输入 {#count} 个字符，您还可以输入{#leave} 个字符 ', //字数统计提示，{#count}代表当前字数，{#leave}代表还可以输入多少字符数。
            wordOverFlowMsg:'你输入的字符个数已经超出最大允许值，服务器可能会拒绝保存！', //超出字数限制
            pasteWordImgMsg:'您粘贴的内容中包含本地图片，需要转存后才能正确显示！',
            snapScreenNotIETip: '截图功能需要在ie浏览器下使用',
            snapScreenMsg:'截图上传失败，请检查你的PHP环境。 '
        },
        serialize:function () {                              //配置过滤标签
            return {
                //编辑器中不能够插入的标签，如果想插入那些标签可以去掉相应的标签名
                blackList:{style:1, link:1, object:1, applet:1, input:1, meta:1, base:1, button:1, select:1, textarea:1, '#comment':1, 'map':1, 'area':1}
            };
        }(),
        //下来框默认显示的内容
        ComboxInitial:{
            FONT_FAMILY:'字体',
            FONT_SIZE:'字号',
            PARAGRAPH:'段落格式',
            CUSTOMSTYLE:'自定义样式'
        },
        //自动排版参数
        autotypeset:{
            mergeEmptyline : true,          //合并空行
            removeClass : true,            //去掉冗余的class
            removeEmptyline : false,       //去掉空行
            textAlign : "left",             //段落的排版方式，可以是 left,right,center,justify 去掉这个属性表示不执行排版
            imageBlockLine : 'center',      //图片的浮动方式，独占一行剧中,左右浮动，默认: center,left,right,none 去掉这个属性表示不执行排版
            pasteFilter : false,             //根据规则过滤没事粘贴进来的内容
            clearFontSize : false,           //去掉所有的内嵌字号，使用编辑器默认的字号
            clearFontFamily : false,         //去掉所有的内嵌字体，使用编辑器默认的字体
            removeEmptyNode : true,         // 去掉空节点
            //可以去掉的标签
            removeTagNames : {div:1,a:1,abbr:1,acronym:1,address:1,b:1,bdo:1,big:1,cite:1,code:1,del:1,dfn:1,em:1,font:1,i:1,ins:1,label:1,kbd:1,q:1,s:1,samp:1,small:1,span:1,strike:1,strong:1,sub:1,sup:1,tt:1,u:1,'var':1},
            indent : true,                  // 行首缩进
            indentValue : '2em'             //行首缩进的大小
        }
    };
})();
