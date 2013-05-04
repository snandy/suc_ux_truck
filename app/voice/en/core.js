/*
 *	中国好声音 英文站
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var win = window,
	ieBug = $.browser.msie && parseFloat($.browser.version) < 7;

var replaceCJK = /[^\x00-\xff]/g,
	testCJK    = /[^\x00-\xff]/;

ms.vocEn = {
	utils: {
		cjkLength: function(strValue){
			return strValue.replace(replaceCJK, "lv").length;
		},
		isCjk: function(strValue){
			return testCJK.test(strValue);
		},
		cutString: function(str,len,suffix,slen){
			suffix = suffix || '';
			slen = slen || suffix.length;
			if(str.length > len){
				str = str.substr(0,len - slen) + suffix;
			}
			return str;
		},
		cutCjkString: function(str,len,suffix,slen){
			suffix = suffix || '';
			slen = slen || suffix.length;
			len -= slen;
			if(this.cjkLength(str) <= len){
				return str;
			}
			var s = str.split(''),c = 0,tmpA = [];
			for(var i=0;i<s.length;i+=1){
				if(c < len){
					tmpA[tmpA.length] = s[i];
				}
				if(this.isCjk(s[i])){
					c += 2;
				}else{
					c += 1;
				}
			}
			return tmpA.join('') + suffix;
		}
	}

};

})(jQuery,mysohu);