/*
 *	中国好声音
 *  code by bobotieyang@sohu-inc.com
 */
;
(function($,ms){


$(function(){
	$('input.btn-cv-search').removeClass('btn-cv-search-hover').hover(function(){
		$(this).addClass('btn-cv-search-hover');
	},function(){
		$(this).removeClass('btn-cv-search-hover');
	});

	var $keyword = $('#voice_search input[name="keyword"]'),
		placeholder = $keyword.attr('placeholder');

	if('placeholder' in document.createElement('input')){
		$keyword.addClass('active');
	}else{
		$keyword
		.focus(function(){
			if($keyword.val() == placeholder){
				$keyword.val('');
			}
			$keyword.addClass('active');
		})
		.blur(function(){
			if($keyword.val() == ''){
				$keyword.val(placeholder);
				$keyword.removeClass('active');
			}
		});
		if($keyword.val() == '') $keyword.val(placeholder);
		else $keyword.addClass('active');
	}

	$('#voice_search').submit(function(){
		if($keyword.val() == placeholder) $keyword.val('');
	});

	$('div.item[data-xpt]').each(function(){
		var $this = $(this),
			xpt = $this.attr('data-xpt');

		$.getJSON('/a/album/photo/latest.do',
		{
			xpt: xpt,
			start : 0,
			count : 4,
			needurl : true
		},function(results){
			if(results.code == 0){
				var html = [],
					len = results.data.photos.length > 4 ? 4 : results.data.photos.length;
				for(var i=0;i<len;i+=1){
					var itemData = results.data.photos[i];
					html.push('<li><a href="'+itemData.urlAlbum+'" target="_blank"><img src="'+itemData.url150+'" width="45" height="45" alt=""></a></li>')
				}
				$this.find('div.pho').html('<ul>'+html.join('')+'</ul>');
			}
		});

	});

	$('div.sc-left').delegate('.vote-submit','click',function(event){
		event.preventDefault();
		var $item = $(this).closest('div.item[data-uid]'),
			uid = $item.attr('data-uid'),
			$count = $item.find('.vote-count');

		if(uid){
			 mysohu.voiceofchina.vote.doVote(uid,function(json){
                $.inform({
                    icon: 'icon-success',
                    delay: 3000,
                    easyClose: true,
                    content: '恭喜您，投票成功',
                    onClose: function(){
                    	$count.html(json.attachment.total + ' <span>票</span>');
                    }
                }); 
            });
		}
	});

	//加载留言数（登陆后）
	if(window.$space_config && window.$space_config._xpt && $('#message_count').length){
		$.getJSON('/a/guestbook/number.htm',{pageOwnerXpt: window.$space_config._xpt},function(results){
			$('#message_count').html(results);
		})
	}
	//复制到剪贴板
	if($('#copy_btn').length){
		var $copyBtn = $('#copy_btn'),
			$copyURL = $('#copy_url');
		
		var clip = new ZeroClipboard($copyBtn,{
			moviePath: 'http://s3.suc.itc.cn/mysohu/plugins/zeroclipboard/ZeroClipboard.swf',
			trustedDomains: 'i.sohu.com',
			allowScriptAccess: 'always'
		});

		$copyBtn.click(function(event){
			event.preventDefault();
		});

		$copyURL.click(function(){
			this.select();
		});

	    clip.on( 'mousedown', function(client) {
			clip.setText($copyURL.val());
		});
	    
		clip.on( 'complete', function(client, args) {
			$.inform({
				icon: 'icon-success',
				delay: 3000,
                easyClose: true,
                content: '复制成功，你可以粘贴到MSN或QQ中发给好友！'
			});
		});
		
	}
	//2000名以外加载票数
	if(window.$space_config && window.$space_config._uid && $('#current_user_total').length){
		$.ajax({
            type: 'GET',
            url: 'http://voice.tv.sohu.com/vote/score.jsonp?callback=?',
            data: {
                itemId: window.$space_config._uid
            },
            dataType: 'jsonp',
            scriptCharset: 'UTF-8',
            success: function(json){
                $('#current_user_total').replaceWith(json.attachment.total);
            }
        });
	}
});

})(jQuery,mysohu);