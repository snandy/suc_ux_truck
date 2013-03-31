/* 注意，该文件内的资源引用都必须为 js.sohu.com/passport/images 目录 */
// 得到字符串的长度，一个汉字算2个字节
function getStringLen(str) {
    var cArr = str.match(/[^\x00-\xff]/ig);
    return str.length + (cArr == null ? 0 : cArr.length);
}

// md5
hex_md5 = (function () {
    var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
    var chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode */

    function hex_md5(s) {
        return binl2hex(core_md5(str2binl(s), s.length * chrsz));
    }
    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length
     */
    function core_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);
    }

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }

    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    function binl2hex(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
        }
        return str;
    }
    /*
     * Convert a string to an array of little-endian words If chrsz is ASCII,
     * characters >255 have their hi-byte silently ignored.
     */
    function str2binl(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz)
        bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
        return bin;
    }
    return hex_md5;
})();

(function () {
    if (window.PassportSC) return;
    var MIN_HTTS_TIMESTAMP = 1293156753137;

    function b64_423(str) {
        var b64table = new Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_');
        var binary = new String();
        for (var i = 0; i < str.length; i++) {
            for (var j = 0; j < 64; j++) {
                if (str.charAt(i) == b64table[j]) {
                    var bin = j.toString(2);
                    binary += ("000000" + bin).substr(bin.length);
                    break;
                }
            }
            if (j == 64) {
                if (i == 2) {
                    /* 去掉 4 个 0 */
                    return binary.substr(0, 8);
                } else {
                    /* 去掉 2 个 0 */
                    return binary.substr(0, 16);
                }
            }
        }
        return binary;
    }

    function b2i(str) {
        var x = 0;
        var k = 128;
        for (var i = 0; i < 8; i++, k = k / 2) {
            if (str.charAt(i) == "1") {
                x += k;
            }
        }
        return String.fromCharCode(x);
    }

    function b64_decodex(str) {
        var ret = new Array();
        var i;
        var x = "";
        for (i = 0; i < str.length; i += 4) {
            x += b64_423(str.substr(i, 4));
        }
        for (i = 0; i < x.length; i += 8) {
            ret += b2i(x.substr(i, 8));
        }
        return ret;
    }

    function utf8to16(str) {
        var out, i, j, len, c, c2, c3, c4, s;

        out = [];
        len = str.length;
        i = j = 0;
        while (i < len) {
            c = str.charCodeAt(i++);
            switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxx xxxx
                out[j++] = str.charAt(i - 1);
                break;
            case 12:
            case 13:
                // 110x xxxx 10xx xxxx
                c2 = str.charCodeAt(i++);
                out[j++] = String.fromCharCode(((c & 0x1f) << 6) | (c2 & 0x3f));
                break;
            case 14:
                // 1110 xxxx 10xx xxxx 10xx xxxx
                c2 = str.charCodeAt(i++);
                c3 = str.charCodeAt(i++);
                out[j++] = String.fromCharCode(((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f));
                break;
            case 15:
                switch (c & 0xf) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx
                    c2 = str.charCodeAt(i++);
                    c3 = str.charCodeAt(i++);
                    c4 = str.charCodeAt(i++);
                    s = ((c & 0x07) << 18) | ((c2 & 0x3f) << 12) | ((c3 & 0x3f) << 6) | (c4 & 0x3f) - 0x10000;
                    if (0 <= s && s <= 0xfffff) {
                        out[j] = String.fromCharCode(((s >>> 10) & 0x03ff) | 0xd800, (s & 0x03ff) | 0xdc00);
                    } else {
                        out[j] = '?';
                    }
                    break;
                case 8:
                case 9:
                case 10:
                case 11:
                    // 1111 10xx 10xx xxxx 10xx xxxx 10xx xxxx 10xx xxxx
                    i += 4;
                    out[j] = '?';
                    break;
                case 12:
                case 13:
                    // 1111 110x 10xx xxxx 10xx xxxx 10xx xxxx 10xx xxxx 10xx
                    // xxxx
                    i += 5;
                    out[j] = '?';
                    break;
                }
            }
            j++;
        }
        return out.join('');
    }

	//判断浏览器的类型
	function getBrowserType() {
		var btype = 0;
		var B = function(ua) {
			var b = {
				ie : /msie/.test(ua) && !/opera/.test(ua),
				opera : /opera/.test(ua),
				safari : /webkit/.test(ua) && !/chrome/.test(ua),
				firefox : /firefox/.test(ua),
				chrome : /chrome/.test(ua),
				maxthon : /maxthon/.test(ua),
				sogou : /se/.test(ua),
				tt : /TencentTraveler/.test(ua)
			};
			var mark = '';
			for (var i in b) {
				if (b[i]) {
					mark = "safari" == i ? "version" : i;
					break;
				}
			}
			b.version = mark && RegExp("(?:" + mark + ")[\\/: ]([\\d.]+)").test(ua) ? RegExp.$1 : "0";
			b.ie6 = b.msie && parseInt(b.version, 10) == 6;
			b.ie7 = b.msie && parseInt(b.version, 10) == 7;
			b.ie8 = b.msie && parseInt(b.version, 10) == 8;
			b.ie9 = b.msie && parseInt(b.version, 10) == 9;
			return b;
		}(navigator.userAgent.toLowerCase());
	
		if (B.ie6) {
			return 1
		}
		if (B.ie7) {
			return 5
		}
		if (B.ie8) {
			return 6
		}
		if (B.firefox) {
			return 2
		}
		if (B.opera) {
			return 3
		}
		if (B.chrome) {
			return 7
		}
		if (B.safari) {
			return 4
		}
	
		return btype
	}

    // 判断浏览器是否支持cookie
    function checkCookieEnabled() {
        try {
            if (navigator.cookieEnabled == false) {
                return false;
            }
        } catch (e) {}
        return true;
    }

    Function.prototype.bindFunc = function (pObject) {
        if (typeof (pObject) != "object") {
            return false;
        }
        var __method = this;
        return function () {
            return __method.apply(pObject, arguments);
        };
    }; // 需要注意此处的分号
    window.login_status = "";
    window.logout_status = "";
    window.renew_status = "";
    window.PassportCardList = [];
    window.PassportSC = {
        version: 26,
        cvsid: "$Id: pp18030.js,v 1.78 2009/10/26 08:22:26 jiangyan Exp $",
        appid: 9999,
        // 一个汉字算2个字节
        max_line_length: 30,
        domain: "",
        cookie: false,
        email: "",
        bindDomainSelector: true,
        /* 绑定域名列表选择框 */
        autopad: "",
        /* 自动填写的域名后缀，扩展为多个域名中间以逗号分隔 */
        autoRedirectUrl: "",
        /* 别的地方登陆后，刷新本页面时是否自动跳转 */
        loginRedirectUrl: "",
        /* 在本页面登录后是否自动跳转 */
        logoutRedirectUrl: "",
        /* 在本页面退出后是否自动跳转 */
        selectorTitle: "请选择您的用户帐号类型",
        registerUrl: "http://passport.sohu.com/web/signup.jsp",
        /* 申请通行证的URL */
        recoverUrl: "http://passport.sohu.com/web/recover.jsp",
        /* 忘记密码的URL */
        postru: "",
        emailPostfix: false,
        curDSindex: -1,
        usePost: 0,
        successCalledFunc: false,
        /* 登录成功后的回调函数 */
        curCardIndex: 0,

        oElement: false,
        rootElement: false,
        dsElement: false,
        sElement: false,
        cElement: false,
        dsAnchor: false,
        emailInput: false,
        passwdInput: false,
        pcInput: false,
        loginMsg: false,
        iElement: false,
        isSetFocus: true,
        /* 是否自动设置输入框的焦点 */
        loginProtocal: "https",
        http_url: false,

        eInterval: false,
        maxIntervalCount: 70,
        intervalCount: 0,
        state: "0000",
        defualtRemPwd: 'checked="checked"',
        /* checked为默认选中记住密码 */
        isShowRemPwdMsg: 0,
        /* 1为alert提示确认要记住密码 */
        campImg: "http://js.sohu.com/passport/images/pic007.gif",
        /* 定制大本营的图片 */
        campImgAlt: "大本营",
        /* 定制大本营的alt文字 */
        campUrl: "http://blog.sohu.com/camp?from=",
        /* 定制大本营的链接地址 */
        cardTitle: "上搜狐，知天下",
        /* 定制卡片上面的标题 */
        firstDomain: "uniqname",
        /* 产品定制的下拉域名显示的第一个域名 */
        defaultApp: "",
        domainPool: ["chinaren.com", "sogou.com"],
        // 自动提示的所有域名的列表
        domainList: ["uniqname", "sohu.com", "chinaren.com", "sogou.com", "vip.sohu.com", "17173.com", "focus.cn", "game.sohu.com", "37wanwan.com"],
        appList: {
            "1062": "bai",
            "1073": "t",
            "1000": "mail",
            "1005": "alumni",
            "10050": "chinaren",
            "1019": "blog",
            "1017": "pp",
            "1001": "club",
            "1038": "crclub",
            "1039": "group",
            "1021": "music",
            "1010": "say",
            "1042": "cbbs",
            "1028": "focus",
            "1029": "17173",
            "1013": "vip",
            "1035": "rpggame",
            "1044": "pinyin",
            "1022": "relaxgame"
        },
        appName: {
            "bai": "白社会",
            "t": "微博",
            "mail": "邮件",
            "alumni": "校友录",
            "chinaren": "ChinaRen",
            "blog": "博客",
            "pp": "相册",
            "club": "搜狐社区",
            "crclub": "CR社区",
            "group": "群组",
            "music": "音乐盒",
            "say": "说吧",
            "cbbs": "校友论坛",
            "focus": "焦点房产",
            "17173": "游戏论坛",
            "vip": "vip邮箱",
            "rpggame": "RPG游戏",
            "pinyin": "输入法",
            "relaxgame": "休闲游戏"
        },
        appUrl: {
            "bai": "http://bai.sohu.com",
            "t": "http://t.sohu.com",
            "mail": "",
            "alumni": "http://class.chinaren.com",
            "chinaren": "",
            "blog": "http://blog.sohu.com/",
            "pp": "http://pp.sohu.com/",
            "club": "http://club.sohu.com",
            "crclub": "http://club.chinaren.com",
            "group": "http://i.chinaren.com/group",
            "say": "http://s.sogou.com",
            "music": "http://mbox.sogou.com/",
            "cbbs": "http://cbbs.chinaren.com",
            "focus": "http://www.focus.cn",
            "17173": "http://bbs.17173.com",
            "vip": "http://vip.sohu.com",
            "rpggame": "http://game.sohu.com",
            "pinyin": "http://pinyin.sogou.com",
            "relaxgame": "http://game.sohu.com/index2.htm"
        },
        appPool: false,
        bottomRow: [],
        recomServ: [],
        /* Passport推荐其的服务 */
        reverseFirstDomain: false,
        // 如果输入的是手机号，firstdomain显示为sohu.com
        // ,否则，firstdomain还是原来的
        showEmailInputTip: true,
        usePostFix: true,
        gotohref: function (url) {
            var a = document.createElement('a');
            if (getBrowserType() == 1) {
                // IE6特殊处理
                a.setAttribute("href", url);
                document.body.appendChild(a);
                a.click();
            } else {
                window.location = url;
                return;
            }
            /*
             * if(!a.click) { //only IE has this (at the moment);
             * window.location = url; return; }
             */
        },
        getDomain: function () {
            var hostname = document.domain.split('.');
            var l = hostname.length;
            if (l <= 2) {
                return document.domain;
            }
            // 只支持 focus.cn/sohu.com/chinaren.com/17173.com/sogu.com 就够了
            return hostname[l - 2] + '.' + hostname[l - 1];
        },
        // 根据当前的domain，来获取passport对应的domain
        getPassportDomain: function () {
            var p_domain = "passport." + this.domain;
            if (this.domain == "") this.domain = this.getDomain();
            if (this.domain in {
                "focus.cn": "",
                "17173.com": "",
                "37wanwan.com": "",
                "51f.com": ""
            }) {
                p_domain = "pass." + this.domain;
            }
            return p_domain;
        },
        addCookie: function (name, value, expireHours) {
            if (this.domain == "") this.domain = this.getDomain();
            var cookieString = name + "=" + escape(value) + "; path=/; domain=." + this.domain + ";";
            // 判断是否设置过期时间
            if (expireHours > 0) {
                var date = new Date();
                date.setTime(date.getTime() + expireHours * 3600 * 1000);
                cookieString = cookieString + "expires=" + date.toGMTString() + ";";
            }
            document.cookie = cookieString;
        },
        addCookie2: function (name, value, expireHours, domain) {
            var cookieString = name + "=" + value + "; path=/; domain=." + domain + ";";
            if (expireHours > 0) {
                var date = new Date;
                date.setTime(date.getTime() + expireHours * 3600 * 1e3);
                cookieString = cookieString + "expires=" + date.toGMTString() + ";";
            }
            document.cookie = cookieString;
        },
        getCookie: function (name) {
            var str = document.cookie;
            var cookies = document.cookie.split('; ');
            var vname = name + "=";
            for (var i = 0; i < cookies.length; i++) {
                if (cookies[i].indexOf(vname) == 0) {
                    return cookies[i].substr(vname.length);
                }
            }
            return "";
        },
        deleteCookie: function (name) {
            if (this.domain == "") this.domain = this.getDomain();
            var exp = new Date();
            exp.setTime(exp.getTime() - 100000);
            var cval = this.getCookie(name);
            document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString() + "; path=/; domain=." + this.domain + ";";
        },
        preventEvent: function (evt) {
            evt.cancelBubble = true;
            evt.returnValue = false;
            if (evt.preventDefault) {
                evt.preventDefault();
            }
            if (evt.stopPropagation) {
                evt.stopPropagation();
            }
        },

        getPosition: function (ele, name) {
            var pos = 0;
            while (ele) {
                pos += ele[name];
                ele = ele.offsetParent;
            }
            return pos;
        },
        getTime: function () {
            var x = new Date();
            return x.getTime();
        },
        strip: function (s) {
            return s.replace(/^\s+/, '').replace(/\s+$/, '');
        },
        reportMsg: function (code) {
            var msg = '';
            switch (code) {
            case '1':
                msg += '请输入通行证用户名';
                break;
            case '2':
                msg += '通行证用户名为邮件地址格式';
                break;
            case '3':
                msg += '用户名后缀必须为' + arguments[1];
                break;
            case '4':
                msg += '请输入通行证密码';
                break;
            case '5':
                var email = this.strip(this.emailInput.value);
                if (email.lastIndexOf("@focus.cn") > 0) {
                    msg += '用户名或密码错误!咨询电话:010-58511234';
                } else {
                    msg += '用户名或密码错误';
                }
                break;
            case '6':
                msg += '登录超时，请稍后重试';
                break;
            case '7':
                msg += '登录失败，请重试';
                break;
            case '8':
                msg += '网络故障，退出失败，请重新退出';
                break;
            case '9':
                msg += '登录失败，请稍后重试';
                break;
            case '10':
                msg += '暂时不可登录，请稍后重试';
                break;
            case '11':
                msg += '浏览器设置有误，请查看帮助修正';
                break;
            case '12':
                msg += '服务器故障，请稍候再试';
                break;
            default:
                msg += '登录错误，请稍后重试';
            }
            this.showMsg(msg);
        },

        showMsg: function (msg) {
            if (!this.loginMsg) return;
            this.loginMsg.innerHTML = msg;
        },
        // 可以由外部的产品来调用该函数，返回userid
        cookieHandle: function () {
            if (!this.cookie) {
                this.parsePassportCookie();
            }
            if (this.cookie && this.cookie['userid'] != '') {
                return this.cookie['userid'];
            } else {
                return "";
            }
        },

        // 由外部产品调用，获取appid所对应的relationid
        relationHandle: function () {
            if (!this.cookie) {
                this.parsePassportCookie();
            }
            return this._parserRelation();
        },
        _parserRelation: function () {
            var relations = this.cookie['relation'];
            if (relations != null && relations.length > 0) {
                var arr = relations.split(";");
                for (var i = 0; i < arr.length; i++) {
                    var barr = arr[i].split(",");
                    var appids = barr[2].split("#");
                    for (var j = 0; j < appids.length; j++) {
                        if (PassportSC.appid == appids[j]) {
                            return barr[0];
                        }
                    }
                }
            }
            return "";
        },
        getDisplayName: function () {
            var userid = this.cookieHandle();
            var arr = userid.split("@");
            var userid_prefix = arr[0];
            var pattern = /^1\d{10}$/;
            if (pattern.test(userid_prefix)) {
                return userid_prefix.substring(0, 3) + "****" + userid_prefix.substring(7);
            } else {
                return userid;
            }

        },
        parsePassportCookie: function () {
            var cookies = document.cookie.split('; ');
            for (var i = 0; i < cookies.length; i++) {
                if (cookies[i].indexOf('ppinf=') == 0) {
                    var cookievalue = cookies[i].substr(6);
                    break;
                }
                if (cookies[i].indexOf('ppinfo=') == 0) {
                    var cookievalue = cookies[i].substr(7);
                    break;
                }
                if (cookies[i].indexOf('passport=') == 0) {
                    var cookievalue = cookies[i].substr(9);
                    break;
                }
            }
            if (i == cookies.length) {
                this.cookie = false;
                return;
            }
            try {
                var x = unescape(cookievalue).split('|');
                if (x[0] == '1' || x[0] == '2') {
                    var cookie_raw_info = utf8to16(b64_decodex(x[3]));
                    this._parsePassportCookie(cookie_raw_info);
                    return;
                }
            } catch (e) {}
        },
        _parsePassportCookie: function (str) {
            var keyStart_offset;
            var eq_offset;
            var lenEnd_offset;
            this.cookie = new Object;

            keyStart_offset = 0;
            eq_offset = str.indexOf(':', keyStart_offset);
            while (eq_offset != -1) {
                var k;
                var l;
                var v;
                k = str.substring(keyStart_offset, eq_offset);
                lenEnd_offset = str.indexOf(':', eq_offset + 1);
                if (lenEnd_offset == -1) {
                    break;
                }
                l = parseInt(str.substring(eq_offset + 1, lenEnd_offset));
                v = str.substr(lenEnd_offset + 1, l);
                if (str.charAt(lenEnd_offset + 1 + l) != '|') {
                    break;
                }
                this.cookie[k] = v;

                keyStart_offset = lenEnd_offset + 2 + l;
                eq_offset = str.indexOf(':', keyStart_offset);
            }

            var relation_userid = this._parserRelation();
            if (relation_userid != null && relation_userid.length > 0) {
                this.cookie[k] = relation_userid;
            }

            try {
                this.cookie['service'] = new Object;
                var x = this.cookie['service'];
                x['mail'] = 0;
                x['alumni'] = 0;
                // chinaren是一个虚拟的东西
                x['chinaren'] = 0;
                x['blog'] = 0;
                x['pp'] = 0;
                x['club'] = 0;
                x['crclub'] = 0;
                x['group'] = 0;
                x['say'] = 0;
                x['music'] = 0;
                x['focus'] = 0;
                x['17173'] = 0;
                x['vip'] = 0;
                x['rpggame'] = 0;
                x['pinyin'] = 0;
                x['relaxgame'] = 0;

                var y = this.cookie['serviceuse'];
                if (y.charAt(0) == 1) {
                    x['mail'] = 'sohu';
                } else if (y.charAt(2) == 1) {
                    x['mail'] = 'sogou';
                } else if (this.cookie['userid'].indexOf("@chinaren.com") > 0) {
                    x['mail'] = 'chinaren';
                }
                // else if (y.charAt(6) == 1) {
                // x['mail'] = 'chinaren';
                // }
                if (y.charAt(1) == 1) {
                    x['alumni'] = 1;
                }

                if (y.charAt(3) == 1) {
                    x['blog'] = 1;
                }
                if (y.charAt(4) == 1) {
                    x['pp'] = 1;
                }

                if (y.charAt(5) == 1) {
                    x['club'] = 1;
                }

                if (y.charAt(7) == 1) {
                    x['crclub'] = 1;
                }
                if (y.charAt(8) == 1) {
                    x['group'] = 1;
                }

                /*
                 * if (y.charAt(9) == 1) { x['say'] = 1; }
                 */
                if (y.charAt(10) == 1) {
                    x['music'] = 1;
                }
                // Focus的服务，只要它是focus用户，就将它设置为1
                if (y.charAt(11) == 1 || this.cookie['userid'].lastIndexOf('@focus.cn') > 0) {
                    x['focus'] = 1;
                }
                // 17173的服务，只要它是17173用户，就将它设置为1
                if (y.charAt(12) == 1 || this.cookie['userid'].indexOf('@17173.com') > 0) {
                    x['17173'] = 1;
                }
                if (y.charAt(13) == 1) {
                    x['vip'] = 1;
                }
                if (y.charAt(14) == 1) {
                    x['rpggame'] = 1;
                }
                if (y.charAt(15) == 1) {
                    x['pinyin'] = 1;
                }
                if (y.charAt(16) == 1) {
                    x['relaxgame'] = 1;
                }
            } catch (e) {}
        },
        parseAppid: function () {
            var id = this.appid.toString();
            var i = 0;
            this.appPool = new Array();
            for (var j in this.appList) {
                var x = this.appList[j];
                if (typeof (x) != 'string') continue;
                if (j == id) {
                    this.defaultApp = this.appName[x];
                } else {
                    // Focus的单独处理，使用2个链接
                    if (j == "1028") {
                        this.appPool[i] = {
                            "app": "focus",
                            "name": "北京业主论坛",
                            "url": "http://house.focus.cn/group/yezhu.php"
                        };
                        i++;
                        this.appPool[i] = {
                            "app": "focus",
                            "name": "装修论坛",
                            "url": "http://home.focus.cn/group/group_forum.php"
                        };
                    } else {
                        this.appPool[i] = {
                            "app": x,
                            "name": this.appName[x],
                            "url": this.appUrl[x]
                        };
                    }
                    i++;
                }
            }
        },
        getBottomRow: function () {
            var i = 0;
            var length = this.max_line_length - getStringLen(this.defaultApp);
            this.bottomRow[0] = new Array();
            this.bottomRow[1] = new Array();

            // 判断cookie是否存在
            if (!this.cookie) return;
            // 以下生成底下的2行文字服务
            i = this._getBottomRow(this.bottomRow[0], length, 0);
            length = this.max_line_length;
            i = this._getBottomRow(this.bottomRow[1], length, i);
        },

        _getBottomRow: function (row, len, offset) {
            var app, j;
            var x = this.cookie['service'];
            var y = this.appPool;
            var i = offset;
            var strlen;
            for (j = 0; i < y.length; i++) {
                app = y[i]["app"];
                // 由于prototype对object进行了扩展，所以在此判断一下
                if (typeof (app) != 'string') continue;
                // 加上微博，白社会:登录后直接显示，不需要serviceuse
                if (i == 0 || i == 1) {
                    strlen = getStringLen(y[i]["name"]);
                    if (len - strlen < 0) break;
                    len -= (strlen + 2);
                    row[j] = y[i];
                    j++;
                    continue;
                }

                if (typeof (x[app]) == "undefined") continue;
                if (x[app] != 0) {
                    strlen = getStringLen(y[i]["name"]);
                    if (len - strlen < 0) break;
                    len -= (strlen + 2);
                    row[j] = y[i];
                    if (app == "mail") {
                        if (x["mail"] == "sohu") {
                            // 加上appid的参数，代表是从卡片上点击进入邮箱
                            row[j]["url"] = "http://mail.sohu.com?appid=0001";
                        } else if (x["mail"] == "sogou") {
                            row[j]["url"] = "http://mail.sogou.com";
                        } else {
                            row[j]["url"] = "http://mail.chinaren.com";
                        }
                    }
                    j++;
                } else {
                    if (y[i]["name"] == "ChinaRen") {
                        continue;
                    }
                    var relen = this.recomServ.length;
                    this.recomServ[relen] = y[i];
                    // 对于没有开通mail服务的帐号，目前只可能是chinaren的
                    if (app == "mail") {
                        this.recomServ[relen]["url"] = "http://mail.chinaren.com";
                    }
                }
            }
            return i;
        },

        // 根据lastdomain的cookie值来生成 emailPostfix
        parseLastDomain: function (list) {
            this.emailPostfix = new Array();
            var entiredomain = "",
                specDomain = "";
            var lastdomain = "",
                useridar = "",
                lastdomain_ar = [];
            var cookies = document.cookie.split('; ');
            for (var i = 0; i < cookies.length; i++) {
                if (cookies[i].indexOf('lastdomain=') == 0) {
                    try {
                        lastdomain_ar = unescape(cookies[i].substr(11)).split('|');
                        if (lastdomain_ar.length == 4) {
                            var isnotSLogin = lastdomain_ar[3];
                            if (isnotSLogin != null && isnotSLogin == "1") {
                                this.loginProtocal = "http";
                            }
                        }
                    } catch (e) {}
                    break;
                }
            }

            var j = 0;
            // 解析cookie中保存的登录 用户名，放在最前面
            if (lastdomain_ar.length >= 3) {
                var userid_raw_info = utf8to16(b64_decodex(lastdomain_ar[1]));
                var userid_ar = userid_raw_info.split("|");
                // 解析userid，cookie中的第一个是最新登录的userid
                for (var i = 0; i < userid_ar.length; i++) {
                    if (userid_ar[i] != "") {
                        this.emailPostfix[j] = userid_ar[i];
                        j++;
                    }
                }
            }

            // 如果指定了firstDomain,则首先放前面
            if (this.firstDomain != "") {
                for (var i in list) {
                    if (this.firstDomain == list[i]) {
                        specDomain = list[i];
                        break;
                    }
                }
                if (specDomain != "") {
                    this.emailPostfix[j] = specDomain;
                    j++;
                }
            }

            // 如果当前是game.sohu.com，则也将它放置前面
            if (document.domain.indexOf("game.sohu.com") >= 0) {
                entiredomain = "game.sohu.com";
                this.emailPostfix[j] = entiredomain;
                j++;
            }

            // 然后放置本域的domain
            this.emailPostfix[j] = this.domain;
            j++;

            // 最后放置其它的domain
            for (var i in list) {
                if (typeof (list[i]) != 'string') continue;
                if (list[i] != this.domain && list[i] != entiredomain && list[i] != specDomain) {
                    this.emailPostfix[j] = list[i];
                    j++;
                }
            }
        },

        /* 下面是 Login/Logout 函数 */
        doPost: function () {
            for (var i = 0; i < document.forms.length; i++) {
                if (document.forms[i].name == "loginform") {
                    break;
                }
            }
            if (i == document.forms.length) {
                document.location.href = "http://passport.sohu.com";
                return false;
            }
            // 得到浏览器的类型
            var b = getBrowserType();
            // 得到屏幕宽度
            var w = screen.width;
            document.forms[i].action = "http://passport.sohu.com/sso/login_js.jsp?appid=" + this.appid + "&ru=" + this.postru + "&b=" + b + "&w=" + w + "&v=" + this.version;
            document.forms[i].submit();
            return false;
        },

        doLogin: function () {
            if (this.eInterval) return; // 必须判断一下，避免连续两次点击
            if (arguments[0]) {
                PassportCardList[index].doLogin();
            }
            login_status = "";
            this.intervalCount = 0;
            this.sElement.innerHTML = "";

            this.email = this.strip(this.emailInput.value);
            var email = this.email;
            var password = this.strip(this.passwdInput.value);

            var pc = 0;
            if (this.pcInput.checked == true) pc = 1;

            if (email == "") {
                this.reportMsg('1');
                this.emailInput.focus();
                return false;
            }
            /*
             * if (email.lastIndexOf('@') == -1) { this.reportMsg('2');
             * this.emailInput.focus(); return false; }
             */
            // 如果autopad不为空，则限制只能输入本域的用户
            if (this.autopad != "") {
                var dpostfix = email.substr(email.lastIndexOf('@') + 1);
                if (this.autopad.lastIndexOf(dpostfix) < 0) {
                    this.reportMsg('3', this.autopad);
                    this.emailInput.focus();
                    this.passwdInput.value = "";
                    return false;
                }
            }
            if (password == "") {
                this.reportMsg('4');
                this.passwdInput.value = "";
                this.passwdInput.focus();
                return false;
            }
            if (this.usePost == 1) {
                return this.doPost();
            }
            // 显示Passport等待状态框，执行后将破坏 document.forms
            this.drawPassportWait('正在登录搜狐通行证，请稍候...');
            return this.loginHandle(email, password, pc, this.sElement, this.loginFailCall.bindFunc(this), this.loginSuccessCall.bindFunc(this));
        },

        // 可以由外部的产品调用该js来实现登录，参数为一个node
        loginHandle: function (user_id, pwd, pc, ele, lfc, lsc) {
            // 判断ele是否是对象类型的
            if (typeof (ele) != "object") {
                return false;
            }
            if (checkCookieEnabled() == false) {
                lfc();
                return false;
            }
            login_status = "";
            // 得到浏览器的类型
            var b = getBrowserType();
            // 得到屏幕宽度
            var w = screen.width;
            // 得到当前输入域的domain
            if (this.domain == "") {
                this.domain = this.getDomain();
            }
            var ra = this.getTime();
            var pwd_md5 = hex_md5(pwd);
            try {
                this.http_url = "http://passport.sohu.com/sso/login.jsp?userid=" + encodeURIComponent(user_id) + "&password=" + pwd_md5 + "&appid=" + this.appid + "&persistentcookie=" + pc + "&isSLogin=1" + "&s=" + ra + "&b=" + b + "&w=" + w + "&pwdtype=1" + "&v=" + this.version;
                if ((this.loginProtocal == "https") && (ra > MIN_HTTS_TIMESTAMP)) {
                    var url = "https://passport.sohu.com/sso/login.jsp?userid=" + encodeURIComponent(user_id) + "&password=" + pwd_md5 + "&appid=" + this.appid + "&persistentcookie=" + pc + "&s=" + ra + "&b=" + b + "&w=" + w + "&pwdtype=1" + "&v=" + this.version;

                    // }else if(this.loginProtocal=="http"){
                } else {
                    var url = this.http_url;
                }
            } catch (e) {
                this.http_url = "http://passport.sohu.com/sso/login.jsp?userid=" + user_id + "&password=" + pwd_md5 + "&appid=" + this.appid + "&persistentcookie=" + pc + "&isSLogin=1" + "&s=" + ra + "&b=" + b + "&w=" + w + "&pwdtype=1" + "&v=" + this.version;
                if ((this.loginProtocal == "https") && (ra > MIN_HTTS_TIMESTAMP)) {
                    var url = "https://passport.sohu.com/sso/login.jsp?userid=" + user_id + "&password=" + pwd_md5 + "&appid=" + this.appid + "&persistentcookie=" + pc + "&s=" + ra + "&b=" + b + "&w=" + w + "&pwdtype=1" + "&v=" + this.version;

                }
                // else if(this.loginProtocal=="http"){
                else {
                    var url = this.http_url;
                }
            }
            if (this.domain != "sohu.com") {
                url += "&domain=" + this.domain;
            }
            if (this.loginProtocal == "https") {
                this.state = "1100";
            } else {
                this.state = "2200";
            }
            this.sendLog(ele, "beginLogin", "0");
            var newScript = document.createElement("script");
            newScript.src = url;
            newScript.id = "loginele";
            ele.appendChild(newScript);
            var self = this;
            this.eInterval = setInterval(function () {
                self.loginIntervalProc(lfc, lsc, ele);
            }, 100);
            return false;
        },
        sendLog: function (ele, desc, flag) {
            var newScript = document.createElement("script");
            var browerType = getBrowserType();
            newScript.src = "http://passport.sohu.com/web/cardlog.jsp?desc=" + desc + "&loginProtocal=" + this.loginProtocal + "&userid=" + this.email + "&appid=" + this.appid + "&browserType=" + browerType + "&status=" + login_status + "&count=" + this.intervalCount + "&max=" + this.maxIntervalCount + "&flag=" + flag;
            ele.appendChild(newScript);
        },
        loginIntervalProc: function (lfc, lsc, ele) {
            if (login_status == "" && this.intervalCount < this.maxIntervalCount) {
                this.intervalCount++;
                return;
            }

            /* 此时有返回结果，或者已经超时。clear..... */
            clearInterval(this.eInterval);
            this.eInterval = false;
            if (login_status == "" && this.intervalCount >= this.maxIntervalCount) {
                var flag = "";
                if (this.state == "2200") {
                    flag = "1";
                    this.state = "2210";
                } else if (this.state == "1200") {
                    this.state = "1210";
                    flag = "3";
                }
                this.sendLog(ele, "login timeout" + this.state, flag);
            }
            if (login_status == "success") {
                this.addCookie2("pp_login_time", this.loginProtocal + "|" + this.email + "|" + this.appid + "|" + getBrowserType() + "|" + this.intervalCount + "|" + this.state, -1, "sohu.com");
                if (this.state == "1200") {
                    this.sendLog(ele, "login success", "2");
                }
            }
            if (login_status != "success" || this.intervalCount >= this.maxIntervalCount) {
                if (this.loginProtocal == "https" && login_status == "") {
                    this.intervalCount = 0;
                    this.loginProtocal = "http";
                    this.state = "1200";
                    if (this.http_url.charAt(4) == "s") {
                        this.http_url = "http" + this.http_url.substr(5);
                    }
                    if (this.domain != "sohu.com") {
                        this.http_url += "&domain=" + this.domain;
                    }
                    var newScript = document.createElement("script");
                    newScript.src = this.http_url;
                    ele.appendChild(newScript);
                    var self = this;
                    this.eInterval = setInterval(function () {
                        self.loginIntervalProc(lfc, lsc, ele);
                    }, 100);
                } else {
                    lfc();
                }
                return;
            }
            // 非自动跳转的页面才种其它域的cookie
            if (this.loginRedirectUrl == "") {
                this.autoProcAllDomain("login", ele);
            }
            // 自动跳转的，则设置cookie
            else {
                this.addCookie("crossdomain", this.getTime(), 336);
            }
            lsc();
        },

        // 登录失败后的回调函数; 这里面不能引用 this 代表 PassportSC
        loginFailCall: function () {
            this.sElement.innerHTML = "";
            this.drawLoginForm();
            if (this.intervalCount >= this.maxIntervalCount) {
                this.reportMsg('6');
                this.emailInput.focus();
            } else if (login_status == 'error3' || login_status == 'error2') {
                this.reportMsg('5');
                this.passwdInput.focus();
            } else if (login_status == 'error5') {
                this.reportMsg('10');
                this.passwdInput.focus();
            } else if (login_status == 'error13') {
                window.location = "http://passport.sohu.com/web/remind_activate.jsp";
                return;
            } else if (login_status == 'error11') {
                this.reportMsg('12');
                this.passwdInput.focus();
            } else if (checkCookieEnabled() == false) {
                this.reportMsg('11');
                this.emailInput.focus();
            } else {
                this.reportMsg('9');
                this.passwdInput.focus();
            }
        },

        // 登录成功后回调函数
        loginSuccessCall: function () {
            this.parsePassportCookie();
            if (this.cookie && this.cookie['userid'] != '') {
                this.email = "";
                // 登录成功后是否自动跳转
                if (this.loginRedirectUrl != "") {
                    // 如果是自动跳转，需要判断是否是mail登录用户，然后判断本域的用户登录
                    if (this.cookie['service']['mail'] != "0" && (this.appid == "1000" || this.appid == "1014" || this.appid == "1037")) {
                        // 如果不是本域的用户，则让它重新登录
                        if (this.domain.indexOf(this.cookie['service']['mail']) == -1) {
                            this.drawLoginForm();
                        } else {
                            /* 不需要等待，种其它域的cookie放在自动跳转后的页面来完成 */
                            PassportSC.gotohref(this.loginRedirectUrl);
                        }
                    } else {

                        if (document.location.href == this.loginRedirectUrl) {
                            document.location.reload();
                        } else {
                            PassportSC.gotohref(this.loginRedirectUrl);
                        }
                    }
                }
                // 不需要自动跳转，就画卡片
                else {
                    // Cookie验证成功后再生成下面的服务文字
                    this.getBottomRow();
                    this.drawPassportCard();
                    // 同时重绘其它的卡片
                    for (var i = 0; i < PassportCardList.length; i++) {
                        if (i == this.curCardIndex) continue;
                        PassportCardList[i].parsePassportCookie();
                        PassportCardList[i].getBottomRow();
                        PassportCardList[i].drawPassportCard();
                    }
                }
            } else {
                this.drawLoginForm();
                this.reportMsg('7');
            }
        },

        doLogout: function () {
            if (this.eInterval) return; // 必须判断一下，避免连续两次点击退出
            this.intervalCount = 0;
            this.sElement.innerHTML = "";
            if (this.usePost == 1) {
                window.location = "http://passport.sohu.com/sso/logout_js.jsp?s=" + this.getTime() + "&ru=" + this.postru;
            } else {
                this.logoutHandle(this.sElement, this.logoutFailCall.bindFunc(this), this.logoutSuccessCall.bindFunc(this, "dd"));
            }
        },
        // 可以由外部产品来调用退出
        logoutHandle: function (ele, lfc, lsc) {
            // 判断ele是否是对象类型的
            if (typeof (ele) != "object") {
                return false;
            }
            logout_status = "";
            // 得到当前输入域的domain
            if (this.domain == "") {
                this.domain = this.getDomain();
            }
            var ra = this.getTime();
            var url = 'http://passport.sohu.com/sso/logout.jsp?s=' + ra + '&appid=' + this.appid;
            if (this.domain != "sohu.com") {
                url += "&domain=" + this.domain;
            }
            var newScript = document.createElement("script");
            newScript.src = url;
            ele.appendChild(newScript);
            var self = this;
            this.eInterval = setInterval(function () {
                self.logoutIntervalProc(lfc, lsc, ele);
            }, 100);
        },

        logoutIntervalProc: function (lfc, lsc, ele) {
            if (logout_status == "" && this.intervalCount < this.maxIntervalCount) {
                this.intervalCount++;
                return;
            }
            /* 此时有返回结果，或者已经超时。clear..... */
            clearInterval(this.eInterval);
            this.eInterval = false;
            // 退出失败
            if (logout_status == "" && this.intervalCount >= this.maxIntervalCount) {
                lfc();
                var newScript = document.createElement("script");
                var browerType = getBrowserType();
                newScript.src = "http://passport.sohu.com/web/cardlog.jsp?desc=logout timeout&loginProtocal=" + this.loginProtocal + "&userid=" + this.email + "&appid=" + this.appid + "&browserType=" + browerType;
                ele.appendChild(newScript);
                return;
            }

            if (logout_status != "success") {
                lfc();
                return;
            }
            // 非自动跳转的页面才清除其它域的cookie
            if (this.logoutRedirectUrl == "") {
                this.autoProcAllDomain("logout", ele);
            }
            // 自动跳转的，则设置cookie
            else {
                this.addCookie("crossdomain_logout", this.getTime(), 336);
            }
            lsc();
        },

        // 登录失败后的回调函数
        logoutFailCall: function () {
            this.sElement.innerHTML = "";
            this.reportMsg('8');
        },

        // 登录成功后回调函数
        logoutSuccessCall: function (aa) {
            // 再重新生成一次domanselect list
            this.parseLastDomain(this.domainList);
            // 将cookie置空
            this.cookie = false;
            this.drawLoginForm();
            // 重绘所有的卡片
            for (var i = 0; i < PassportCardList.length; i++) {
                if (i == this.curCardIndex) continue;
                PassportCardList[i].drawLoginForm();
            }
            // 退出成功后，在调用其它产品的提供的一个方法
            try {
                logoutApp();
            } catch (e) {}
        },
        // 重新生成cookie，该函数可由外部产品来进行调用
        renewCookie: function (ele, lfc, lsc) {
            // 判断ele是否是对象类型的
            if (typeof (ele) != "object") {
                return false;
            }
            // 得到当前输入域的domain
            if (this.domain == "") {
                this.domain = this.getDomain();
            }
            var ra = this.getTime();
            var url = "http://passport.sohu.com/sso/renew.jsp?s=" + ra;
            if (this.domain != "sohu.com") {
                url += "&domain=" + this.domain;
            }
            var newScript = document.createElement("script");
            newScript.src = url;
            ele.appendChild(newScript);
            var self = this;
            this.eInterval = setInterval(function () {
                self.renewIntervalProc(lfc, lsc, ele);
            }, 100);
            return false;
        },
        renewIntervalProc: function (lfc, lsc, ele) {
            if (renew_status == "" && this.intervalCount < this.maxIntervalCount) {
                this.intervalCount++;
                return;
            }

            /* 此时有返回结果，或者已经超时。clear..... */
            clearInterval(this.eInterval);
            this.eInterval = false;

            if (renew_status != "success" || this.intervalCount >= this.maxIntervalCount) {
                try {
                    lfc();
                } catch (e) {}
                return;
            }
            this.autoProcAllDomain("renew", ele);
            try {
                lsc();
            } catch (e) {}
        },
        // 设置其它所有域的cookie
        autoProcAllDomain: function (action, ele) {
            var vurl = this.crossDomainIframeUrl(action);
            if (vurl) {
                var iframe = document.createElement("iframe");
                iframe.src = vurl;
                iframe.style.width = "0";
                iframe.style.height = "0";
                ele.appendChild(iframe);
            }
        },
        // 该函数由自动跳转后的页面来调用，从而完成跨域种其它域的cookie
        doCrossDomainCookie: function (ele, action) {
            if (typeof (ele) != "object") {
                return;
            }
            var cookiename = "crossdomain";
            if (action == "logout") cookiename = "crossdomain_logout";
            // 判断是否需要跨域设置cookie
            var cookie = this.getCookie(cookiename);
            if (cookie == "" || cookie == "0") return;
            if (this.domain == "") this.domain = this.getDomain();
            var vurl = this.crossDomainIframeUrl(action);
            if (vurl) {
                var iframe = document.createElement("iframe");
                iframe.src = vurl;
                iframe.style.width = "0";
                iframe.style.height = "0";
                ele.appendChild(iframe);
                this.deleteCookie(cookiename);
            }
        },
        crossDomainUrl: function (action, domain) {
            var curtime = this.getTime();
            var vurl = "http://passport.sohu.com/sso/crossdomain.jsp?s=" + curtime + "&action=" + action + "&domain=" + domain;
            return vurl;
        },
        crossDomainIframeUrl: function (action) {
            var vurl = "http://" + this.getPassportDomain() + "/sso/crossdomain_all.jsp?action=" + action;
            return vurl;
        },
        // 设置某个域的cookie，该函数可由外部产品来调用
        setDomainCookie: function (ele, domain, lsc, lfc) {
            login_status = "";
            crossdomain_status = "";
            var curl = this.crossDomainUrl("login", domain);
            if (curl) {
                newScript = document.createElement("script");
                newScript.src = curl;
                ele.appendChild(newScript);
            }
            var self = this;
            this.eInterval = setInterval(function () {
                self.setCookieIntervalProc(ele, lsc, lfc);
            }, 100);
        },
        setCookieIntervalProc: function (ele, lsc, lfc) {
            if (crossdomain_status != "") {
                clearInterval(this.eInterval);
                this.eInterval = false;
                lfc();
                return;
            }
            if (login_status == "" && this.intervalCount < this.maxIntervalCount) {
                this.intervalCount++;
                return;
            }

            /* 此时有返回结果，或者已经超时。clear..... */
            clearInterval(this.eInterval);
            this.eInterval = false;

            if (login_status != "success" || this.intervalCount >= this.maxIntervalCount) {
                lfc();
                return;
            }
            lsc();
        },
        /* 下面这一部分函数是用于 domain select 提示的 */
        downDSindex: function () {
            if (this.dsAnchor.firstChild == null) return;
            var x = this.dsAnchor.firstChild.rows;
            var i = 0;
            for (; i < x.length; i++) {
                if (x[i].firstChild.idx == this.curDSindex) break;
            }
            if (i >= x.length - 1) { // 没有找到，或者最后一个
                this.curDSindex = x[0].firstChild.idx;
            } else {
                this.curDSindex = x[i + 1].firstChild.idx;
            }
        },
        upDSindex: function () {
            if (this.dsAnchor.firstChild == null) return;
            var x = this.dsAnchor.firstChild.rows;
            var last = -1;
            var i = 0;
            for (; i < x.length; i++) {
                if (x[i].firstChild.idx == this.curDSindex) break;
                last = x[i].firstChild.idx;
            }
            if (i == x.length) { // 没有找到
                this.curDSindex = x[0].firstChild.idx;
            } else if (last == -1) { // 第一个
                this.curDSindex = x[x.length - 1].firstChild.idx;
            } else {
                this.curDSindex = last;
            }
        },
        findDSindex: function (index) {
            try {
                var x = this.dsAnchor.firstChild.rows;
                for (var i = 0; i < x.length; i++) {
                    if (x[i].firstChild.idx == index) return x[i].firstChild;
                }
            } catch (e) {}
            return false;
        },

        clearFocus: function (index) {
            if (typeof (index) != "number") index = this.curDSindex;
            try {
                var x = this.findDSindex(index);
                x.className = '';
                x.style.fontWeight = 'normal';
            } catch (e) {}
        },

        setFocus: function (index) {
            if (typeof (index) != "number") index = this.curDSindex;
            try {
                var x = this.findDSindex(index);
                x.className = 'active';
            } catch (e) {}
        },

        // 输入字符的同时，填充下面的列表
        fillEmailSelect: function () {
            var e = this.emailInput.value;
            var p = /^[\u4e00-\u9fa5,a-zA-Z0-9-_.@]{1,100}$/;

            if (e == "" || !p.test(e)) {
                this.dsElement.style.display = "none";
                return;
            }

            var x_postfix = "";
            var x_prefix = "";
            var x_index = e.lastIndexOf("@");
            if (x_index < 0) {
                x_prefix = e;
            } else if (x_index == e.length - 1) { /* 第一次输入 @ */
                x_prefix = e.substr(0, x_index);
            } else {
                x_prefix = e.substr(0, x_index);
                x_postfix = e.substr(x_index + 1);
            }
            var mleft = this.getPosition(this.emailInput, "offsetLeft") - this.getPosition(this.cElement, "offsetLeft");
            if (document.all && !document.addEventListener) { // 处理 IE
                // 浏览器的盒式模型 bug
                mleft += 1;
            }
            this.dsElement.style.marginLeft = mleft + "px";
            this.dsElement.style.marginTop = (this.getPosition(this.emailInput, "offsetTop") - this.getPosition(this.cElement, "offsetTop") + this.emailInput.offsetHeight) + "px";
            /*
             * version 2 this.dsElement.style.marginLeft =
             * this.getPosition(this.emailInput,"offsetLeft") -
             * this.getPosition(this.rootElement,"offsetLeft") + "px";
             * this.dsElement.style.marginTop =
             * this.getPosition(this.emailInput,"offsetTop") -
             * this.getPosition(this.rootElement,"offsetTop") +
             * this.emailInput.offsetHeight+ "px";
             */
            // this.dsElement.style.left = this.getPosition(this.emailInput,
            // "offsetLeft") + "px";
            // this.dsElement.style.top = this.getPosition(this.emailInput,
            // "offsetTop") + this.emailInput.offsetHeight + "px";
            this.dsElement.style.zIndex = "2000";
            this.dsElement.style.paddingRight = "0";
            this.dsElement.style.paddingLeft = "0";
            this.dsElement.style.paddingTop = "0";
            this.dsElement.style.paddingBottom = "0";
            this.dsElement.style.backgroundColor = "white";
            this.dsElement.style.display = "block";

            var myTable = document.createElement("TABLE");
            myTable.width = "100%";
            myTable.cellSpacing = 0;
            myTable.cellPadding = 3;
            var tbody = document.createElement("TBODY");
            myTable.appendChild(tbody);

            var j = 0;
            var haveCurrent = false;
            var isUserid = false;
            var firstItem = -1;
            var userid_postfix = "",
                userid_prefix = "";

            var domainList = this.emailPostfix;
            var pattern = /^1.*$/;
            if (pattern.test(e)) {
                if (this.autopad != "") {
                    domainList = ["mobile", "qq.com", "focus.cn", this.autopad];
                } else {
                    domainList = ["mobile", "qq.com", "focus.cn"];
                }
            }

            // 从emailPostfix中依次取出userid和domain的list，userid位于前3个
            for (var i = 0; i < domainList.length; i++) {
                var postfix = domainList[i];
                if (typeof (postfix) != 'string') continue;
                if (x_postfix != "") {
                    if (postfix.lastIndexOf(x_postfix) != 0) continue;
                }
                // 包含@，表明是从lastdomain中取出的userid
                if (postfix.lastIndexOf("@") > 0) {
                    tmp_pos = postfix.lastIndexOf("@");
                    if (this.autopad != "" && this.autopad.lastIndexOf(postfix.substring(tmp_pos + 1)) < 0) {
                        continue;
                    }
                    userid_prefix = postfix.substring(0, tmp_pos);
                    // Cookie的Userid中不包含已经输入的字符，则跳过即可
                    if (userid_prefix.lastIndexOf(x_prefix) != 0) {
                        continue;
                    }
                    // Cookie的Userid的前缀完全等于已经输入的字符，需要标志一下，过滤掉下面的重复的记录
                    if (userid_prefix == x_prefix) {
                        userid_postfix = postfix.substring(postfix.lastIndexOf("@") + 1);
                    }
                    isUserid = true;
                }
                // 不是从lastdomain中取出的
                else {
                    // 对于设置了autopad的，只显示autopad域的域名，其它的不予提示
                    if (this.autopad != "" && this.autopad.lastIndexOf(postfix) < 0) {
                        continue;
                    }
                }
                // 过滤掉重复的后缀
                if (postfix == userid_postfix) {
                    continue;
                }
                j++;
                if (firstItem == -1) firstItem = i;
                if (this.curDSindex == i) haveCurrent = true;
                var tr = document.createElement("TR");
                var td = document.createElement("TD");
                td.nowrap = "true";
                td.align = "left";
                // 判断emailPostfix的项是否是从cookie中读取的userid，这时不需要在额外增加@...了
                if (postfix=="mobile" ||postfix=="uniqname") { // 为显示手机号码添加，显示完整的手机号，不再添加@
                    td.innerHTML = x_prefix;
                } else {
                    if (isUserid == false) {
                        if (this.usePostFix) {
                            td.innerHTML = x_prefix + "@" + postfix;
                        } else {
                            td.innerHTML = x_prefix;
                        }
                    } else {
                        if (this.usePostFix) {
                            td.innerHTML = postfix;
                        } else {
                            td.innerHTML = postfix.substring(0, postfix.lastIndexOf("@"));
                        }
                    }
                }

                td.id = "email_postfix_" + i;
                td.idx = i;
                var self = this;
                td.onmouseover = function () {
                    self.clearFocus();
                    self.curDSindex = this.idx;
                    self.setFocus();
                    this.style.cursor = "hand";
                };

                td.onclick = function () {
                    self.doSelect();
                };

                tr.appendChild(td);
                tbody.appendChild(tr);
                isUserid = false;
            }

            if (j > 0) {
                this.dsAnchor.innerHTML = "";
                this.dsAnchor.appendChild(myTable);
                if (haveCurrent == false) this.curDSindex = firstItem;
                this.setFocus();
            } else {
                this.dsElement.style.display = "none";
                this.curDSindex = -1;
            }
        },

        doSelect: function () {
            this.dsElement.style.display = "none";
            // if(this.emailInput.value=="") return; jiangyan@2009-12-08 注释掉
            // for：
            // 在chrome下，如果使用拼音输入法，在汉字状态下，去选择下来框中的英文的时候，textfield值将为空，注释掉这句话将解决这个问题
            var x = this.findDSindex(this.curDSindex);
            if (x) {
                var c = x.innerHTML;
                if (c) {
                    this.emailInput.value = c.replace(/&amp;/g, "&");
                }
            }
            if (this.emailInput.value != "") this.passwdInput.focus();
        },
        // 这里的KeyDown事件主要处理IE的上下箭头事件,IE 必须用 keydown 事件，否则判断不出来 'Up/Down'
        checkKeyDown: function (event) {

            // var keyCode = event.keyCode;
            event = event || window.event;
            var keyCode = event.keyCode || event.which || event.charCode;

            if (keyCode == 38 || keyCode == 40) {
                if (event.shiftKey == 1) {
                    return;
                }
                this.clearFocus();
                if (keyCode == 38) {
                    this.upDSindex();
                } else if (keyCode == 40) {
                    this.downDSindex();
                }
                this.setFocus();
            }
        },
        // 这里的KeyPress事件主要处理FIREFOX的上下箭头事件和TT的BUG产生的olns四个字符
        checkKeyPress: function (event) {

            event = event || window.event;
            var keyCode = event.keyCode || event.which || event.charCode;
            // var keyCode = event.keyCode;
            if (keyCode == 13) {
                this.preventEvent(event);
            }
            // 上下箭头
            else if (keyCode == 38 || keyCode == 40) {
                if (event.shiftKey == 1) {
                    return;
                }
                this.preventEvent(event);
                this.clearFocus();
                if (keyCode == 38) {
                    this.upDSindex();
                } else if (keyCode == 40) {
                    this.downDSindex();
                }
                this.setFocus();
            }
            // TT的Bug的四个字符
            else if (keyCode == 108 || keyCode == 110 || keyCode == 111 || keyCode == 115) {
                var self = this;
                setTimeout(function () {
                    self.fillEmailSelect();
                }, 10);
            }
        },
        // 响应用户的输入，填充下拉列表
        checkKeyUp: function (event) {
            event = event || window.event;
            var keyCode = event.keyCode || event.which || event.charCode;
            // var keyCode = event.keyCode;
            // 不论是否是"回车"键，均先填充email列表，解决用户用输入法中文模式"回车"来输入英文的情况
            this.fillEmailSelect();
            if (keyCode == 13) {
                this.doSelect();
            }

            // chrome&saferi 浏览器的上下箭头不响应 keydown和keypress，只响应keyup
            // jiangyan@2009-12-08
            if (getBrowserType() == 7 || getBrowserType() == 4) {
                if (keyCode == 38 || keyCode == 40) {
                    if (event.shiftKey == 1) {
                        return;
                    }
                    this.clearFocus();
                    if (keyCode == 38) {
                        this.upDSindex();
                    } else if (keyCode == 40) {
                        this.downDSindex();
                    }
                    this.setFocus();
                }
            }

        },
        init: function (element) {
            this.rootElement = element;
            this.rootElement.innerHTML = '<div class="ppselecter" style="position: absolute; display: none;"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td style="" class="ppseltit" id="ppseltitId">' + this.selectorTitle + '</td></tr><tr><td height="2" /></tr><tr><td /></tr></tbody></table></div><div style="display: none;"></div><div class="passportc"></div>';
            if (this.selectorTitle == null || this.selectorTitle.length == 0) {
                // 不显示 title
                this.rootElement.innerHTML = '<div class="ppselecter" style="position: absolute; display: none;"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr></tr><tr><td height="0" /></tr><tr><td /></tr></tbody></table></div><div style="display: none;"></div><div class="passportc"></div>';
            }

            this.dsElement = this.rootElement.childNodes[0];
            this.sElement = this.rootElement.childNodes[1];
            this.cElement = this.rootElement.childNodes[2];
            this.dsAnchor = this.dsElement.firstChild.rows[2].firstChild;

            // 得到当前输入域的domain
            this.domain = this.getDomain();
            this.parseLastDomain(this.domainList); // 生成domanselect list
            this.parseAppid();
            /* 必须执行 parseAppid 后才能 parsePassportCookie */
            this.parsePassportCookie();
            // 解析完Cookie后，再生成下面的服务文字
            this.getBottomRow();

            // 这里还差一些代码.. 需要分析 URL，看看是不是 http post 失败跳转回来的页面
            if (this.postru == "") {
                this.postru = document.location.href;
            }
        },

        _drawPassportCard: function () {},

        drawPassportCard: function () {
            this._drawPassportCard();
            var vlink = document.getElementById("ppcontid");
            vlink.onclick = this.doClickLink.bindFunc(this);
            this.$iElement();
            // 登录成功后，再调用其它产品的提供的一个方法
            try {
                if (this.iElement != null) {
                    this.successCalledFunc(this.iElement);
                } else {
                    try {
                        this.drawPassportInfo();
                    } catch (e) {

                    }
                }
            } catch (e) {
                this.drawPassportInfo();
            }
        },

        // 处理链接的点击事件
        doClickLink: function (_event) {
            var event = window.event ? window.event : _event;
            var srcName = event.srcElement || event.target;
            var tName = srcName.tagName.toLowerCase();
            var userid = this.cookie['userid'];
            var furl = document.location.href;
            var pname = "";
            if (tName == "img") {
                tName = srcName.parentNode.tagName.toLowerCase();
                srcName = srcName.parentNode;
            }
            if (tName == "a") {
                var newScript = document.createElement("script");
                newScript.src = "http://passport.sohu.com/web/golog.jsp?userid=" + userid + "&fappid=" + this.appid + "&furl=" + furl + "&turl=" + srcName;
                this.iElement.appendChild(newScript);
            }
        },

        $iElement: function () {
            this.iElement = this.$getElementByClassName("listContA");
        },

        /* 通过ClassName得到Object，模糊查询 */
        $getElementByClassName: function (cname) {
            var x = this.cElement.getElementsByTagName("div");
            for (var i = 0; i < x.length; i++) {
                if (x[i].className.lastIndexOf(cname) == 0) {
                    return x[i];
                }
            }
        },

        drawPassportWait: function (str) {},

        drawPassportInfo: function () {},

        getRanServ: function () {
            var relen = this.recomServ.length;
            if (relen == 0) return "";
            var i = Math.floor(relen * (Math.random()));
            var rtn = '<a href="' + this.recomServ[i]['url'] + '" target="_blank">' + this.recomServ[i]['name'] + "</a>";
            if (relen == 1) return rtn;
            var j = Math.floor(relen * (Math.random()));
            while (i == j) {
                j = Math.floor(relen * (Math.random()));
            }
            rtn += ' | <a href="' + this.recomServ[j]['url'] + '" target="_blank">' + this.recomServ[j]['name'] + "</a>";
            return rtn;
        },

        _drawLoginForm: function () {},

        drawLoginForm: function () {
            this._drawLoginForm();
            var inputs = this.cElement.getElementsByTagName("input");
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].name == "email") this.emailInput = inputs[i];
                if (inputs[i].name == "password") this.passwdInput = inputs[i];
                if (inputs[i].name == "persistentcookie") this.pcInput = inputs[i];
            }
            this.loginMsg = this.$getElementByClassName("error");

            if (this.isShowRemPwdMsg == 1) {
                var self = this;
                this.pcInput.onclick = function () {
                    if (self.pcInput.checked == false) return;
                    var confirm = window.confirm("浏览器将在两周内保持通行证的登录状态，网吧或公共机房上网者请慎用。您能确认本次操作吗？");
                    if (confirm == false) {
                        self.pcInput.checked = false;
                    }
                };
            }

            this.bindSelector(); // 抽象出来，给狐首 pi18030 调用
            this.autoFillUserId();
            var self = this;
            if (this.emailInput.value == "") {
                if (this.isSetFocus) {
                    setTimeout(function () {
                        self.emailInput.focus();
                    }, 50);
                }
            } else {
                if (this.isSetFocus && this.emailInput.value != "昵称/邮箱/手机号") {
                    setTimeout(function () {
                        self.passwdInput.focus();
                    }, 50);
                }
            }
        },
        autoFillUserId: function () {
            if (this.showEmailInputTip) {
                this.showEmailInputTip = false;
                return;
            }
            var cuserid = this.getCookie("pptmpuserid");

            if (this.email.length > 0) {
                this.emailInput.value = this.email; // 登录失败后自动填入错误的用户名
            } else {
                this.emailInput.value = cuserid;
            }
            if (cuserid.length > 0) {
                // this.deleteCookie("pptmpuserid");
                var self = this;
                setTimeout(function () {
                    self.deleteCookie("pptmpuserid");
                }, 1000);
            }
        },
        bindSelector: function () {
            if (this.bindDomainSelector) {
                this.curDSindex = -1;
                /*
                 * this.emailInput.onblur = function() { this.doSelect(); };
                 */
                try {
                    // FireFox使用addEventListener
                    this.emailInput.addEventListener('mousedown', this.checkMousedown.bindFunc(this), false);
                    this.emailInput.addEventListener('keypress', this.checkKeyPress.bindFunc(this), false);
                    this.emailInput.addEventListener('keyup', this.checkKeyUp.bindFunc(this), false);
                    this.emailInput.addEventListener('blur', this.doSelect.bindFunc(this), false);
                } catch (e) {
                    try {
                        // IE使用attachEvent
                        this.emailInput.attachEvent("onmousedown", this.checkMousedown.bindFunc(this));
                        this.emailInput.attachEvent("onkeydown", this.checkKeyDown.bindFunc(this));
                        this.emailInput.attachEvent("onkeypress", this.checkKeyPress.bindFunc(this));
                        this.emailInput.attachEvent("onkeyup", this.checkKeyUp.bindFunc(this));
                        this.emailInput.attachEvent("onblur", this.doSelect.bindFunc(this));
                    } catch (e) {}
                }
            }
        },

        checkMousedown: function () {
            if (this.emailInput.value == "昵称/邮箱/手机号") {
                this.emailInput.value = "";
                this.emailInput.style.color = "black";
                this.emailInput.focus();
                return;
            }
        },

        drawPassport: function (element) {
            if (typeof (element) != "object") {
                return;
            }
            // 保证只有在PassportSC.drawPassport调用时才写入第一个元素
            if (PassportCardList.length == 0) {
                PassportCardList[0] = this;
            }
            // 缺省第一个卡片的回调函数
            if (!this.successCalledFunc) {
                this.successCalledFunc = window.drawAppInfo || this.drawPassportInfo;
            }
            this.init(element);

            if (this.cookie && (this.cookie['userid'] != '' || this.relationHandle() != '')) {
                if (this.autopad != "") {
                    // 如果设置了autopad，那么即使当前登录了，但用户名和autopad不符，也会显示登录框,
                    // edit by jiangyan@20100720 多帐户关联时应该考虑relationHandle
                    var userid = this.relationHandle() != '' ? this.relationHandle() : this.cookie['userid'];
                    var at = userid.lastIndexOf("@");
                    if (at > 0) {
                        if (this.autopad.lastIndexOf(userid.substr(at + 1)) < 0) {
                            this.drawLoginForm();
                            return;
                        }
                    }
                }
                // 判断首页是否自动跳转
                if (this.autoRedirectUrl != "") {
                    PassportSC.gotohref(this.autoRedirectUrl);
                }
                // 不需要自动跳转，则直接画卡片
                else {
                    this.drawPassportCard();
                }
            } else {
                this.drawLoginForm();
            }
        },
        /* 从第2个卡片开始，调用这个函数来进行绘制 */
        drawPassportNew: function (element, appid, scf) {
            if (typeof (element) != "object") {
                return;
            }
            var pBaseClass = new Function();
            pBaseClass.prototype = this;
            var cardCount = PassportCardList.length;
            var PassportSN = new pBaseClass();
            /* 设置登录成功后的回调函数 */
            PassportSN.successCalledFunc = scf;
            PassportSN.appid = appid;
            PassportSN.curCardIndex = cardCount;
            /* 设置以后的卡片默认不setFocus */
            PassportSN.isSetFocus = false;
            PassportCardList[cardCount] = PassportSN;
            drawPassportNewInit(cardCount, element);
            return;
        },
        // 类似于37wanwan这样，通过js的请求，来自动画passportCard
        drawPassportJS: function () {
            if (!this.oElement || typeof (this.oElement) != "object") {
                return;
            }
            var cookie_ppinf = this.getCookie('ppinf');
            var sso_url = 'http://sso.passport.sohu.com/mirror/' + this.getPassportDomain() + '/' + cookie_ppinf;
            var newScript = document.createElement("script");
            newScript.src = sso_url;
            ele.appendChild(newScript);
        },
        // 类似于37wanwan.com这样的域名，创建iframe进行setcookie或clearcookie的操作
        doCrossDomainIframe: function (iurl) {
            var iframe = document.createElement("iframe");
            iframe.src = iurl;
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.id = "ifr_crossdomain";
            PassportSC.oElement.appendChild(iframe);
        }
    };
    // 对于登陆后自动跳转的情况，如果定义了全局变量，则不需要自动跨域种其它域的cookie，而是手工去调用
    if (typeof (PP_SETCROSSDOMAIN) == "undefined") {
        // 用于在跳转后的新页面上直接在后台跨域处理cookie
        var ele = document.getElementsByTagName("head")[0];
        PassportSC.doCrossDomainCookie(ele, "login");
        PassportSC.doCrossDomainCookie(ele, "logout");
    }
    // IE版本在5.5以下时，采用post方式提交
    if (typeof encodeURIComponent == "undefined") {
        PassportSC.usePost = 1;
    }
    // 处理手机上的opera mini浏览器
    if (getBrowserType() == 3 && (screen.height == 5000 || window.navigator.userAgent.lastIndexOf("Mini") >= 0)) {
        PassportSC.usePost = 1;
    }

})();