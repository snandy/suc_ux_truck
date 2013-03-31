/**
 * @author hl
 * @desc 个人展示TA收到的礼物
 */
(function($, sohu) {
	var rgift = {
		init: function() {
			this.diff();		  
		},
		diff: function() {
			
			this.wrapper = $('#rtbarr-rgift ul');
			if(this.wrapper.length) {
				var textnode = $('#rtbarr-rgift h3').contents().filter(function() { return this.nodeType === 3;}).get(0);
					  
				if(this.oneself()) {//自己的个人展示显示我收到的礼物
					textnode.nodeValue = '我收到的礼物';

					this.msg = '你还没有收到任何礼物';
				}else{
					textnode.nodeValue = 'TA收到的礼物';	
				}	
				this.load();
			}
		},
		load: function() {
			var url = 'http://api.ums.sohu.com/sur/lastVirtual.json?xpt=' + $space_config._xpt;

			this.ajax(url, function(result) {
				if(result.code === 0) {
					var i = 0,
						data = result.data,
						length = data.length,
						cur,
						r = [];
				
					if(!length) {
						r.push('<span class="visitors-txt">' + this.msg + '</span>');	
					}else{
						for(; i < length; i++) {
							cur = data[i];
							r.push('<li><a href="' + cur.url + '" title="' + cur.fromUserNickName + '赠送" target="_blank"><img alt="' + cur.fromUserNickName + '赠送" src="' + cur.logo + '" /></a></li>');
						}
					}
					r = r.join('');

					this.wrapper.html(r);
				}	
			});
		},
		ajax: function(url,param , fn) {
			if(typeof param === 'function') {
				fn = param;
				param = null;
			}

			$.ajax({
				url: url,
				type: 'get',
				data: param,
				dataType: 'jsonp',
				scriptCharset: 'UTF-8',
				success: function() {
					fn.apply(rgift, arguments);
				},
				error: function() {
				}
			});
		},
		oneself: function() {
			return sohu.is_mine && sohu.is_mine();			 
		},
		msg: 'TA还没有收到任何礼物'
	};	

	$(function() {
		rgift.init();	
	});
})(jQuery, mysohu);
