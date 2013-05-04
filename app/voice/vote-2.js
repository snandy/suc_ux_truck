require('core::util::jQuery', 'core::util::beLogin', function($, beLogin) {
    var replaceCJK = /[^\x00-\xff]/g,
        testCJK    = /[^\x00-\xff]/;

    var utils = {
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

    var voteSys = {
        init: function() {
            this.isVoiceUser(this.initView);
        },
        isVoiceUser: function(done) {
            var that = this;

            $.ajax('/a/voice/app/get-status', {
                type: 'POST',
                data: {xpt: window.$space_config._xpt},
                success: function(result) {
                    if(result.code === 0 || result.code === 5) {
                        if(result.data.status !== -1 && result.data.status >= 2) {
                            done.call(that, result.data);
                        }
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                }
            });
        },
        initView: function(data) {
            var that = this;

            that.getVote(function(json){
                var s = json.attachment,
                    wrapper = that.wrapper = $('div.s-voice-banner'),
                    personUrl = window.$space_config._url,
                    isMine = mysohu.is_mine();

                s.photo = data.photo;
                s.name = data.name;
                s.uid = data.uid;
                s.partName = utils.cutCjkString(data.name, 10, '', 0);
                s._class = '';
                /*
                that.postVote(function(result) {
                    if(result.status == '408'){
                        if(!/^601/.test(result.message)){
                            s._class = '';          
                        }
                    }
                      
                    //渲染
                });
                */
                //渲染开始
                if(isMine) {
                    s.setup = '<div class="user-vote-btn"><a class="btn" href="http://i.sohu.com/voice/user/update-info.htm" target="_blank">' + (data.isLocked ? '查看' : '管理') + '个人信息</a></div><div class="links t-center"><a href="' + personUrl + 'guestbook/index.htm" target="_blank">查看留言板</a></div>';
                }else{
                    s.setup = '<div class="user-vote-btn"><a class="btn" href="' + personUrl + 'profile/index.htm" target="_blank">查看详细资料</a></div><div class="links"><a href="javascript:;" class="leave-message">给TA留言</a> <a href="' + personUrl + 'guestbook/index.htm" target="_blank">查看留言板</a></div>';
                }
                var id1 = data.noAccompanimentVoiceId,
                    id2 = data.withAccompanimentVoiceId,
                    url1 = 'http://api.my.tv.sohu.com/video/videoviewinfo2.do?vid=',
                    url2 = '/a/video/playcount.htm';

                $.when(that.ajax(url1 + id1, null), that.ajax(url1 + id2, null), $.getJSON(url2, {videoIds: id1 + ',' + id2})).then(function(a, b, c) {
                    if(id1 === 0) {
                        a[0].status = 5;
                    }
                    if(id2 === 0) {
                        b[0].status = 5;
                    }
                    //视频信息
                    s.videos = that.assembled([a[0], b[0]], c[0]);
                    wrapper.html(that.tmplFn()(s)).removeClass('hide');
                    that.regEvent();
                }); 
                //渲染结束
            });
        },
        regEvent: function() {
            var that = this;

            this.wrapper.delegate('a.vote-btn', 'click', function(event) {
                event.preventDefault();
                mysohu.voiceofchina.vote.doVote(window._uid,function(json){
                    $.inform({
                        icon: 'icon-success',
                        delay: 3000,
                        easyClose: true,
                        content: '恭喜您，投票成功',
                        onClose: function(){
                            that.updateView(json.attachment.total);
                        }
                    }); 
                });
                /*
                that.doVote(function(json){
                    $.inform({
                        icon: 'icon-success',
                        delay: 3000,
                        easyClose: true,
                        content: '恭喜您，投票成功',
                        onClose: function(){
                            that.updateView(json.attachment.total);
                        }
                    }); 
                });
                */
            });

            //给TA留言
            $('a.leave-message', this.wrapper).click(function() {
                that.leaveMessage();
            });
        },
        assembled: function(a, b) {
            var i,
                cur,
                r = [],
                obj = {url: 'http://i.sohu.com/voice/user/update-voice', smallcover: 'http://s3.suc.itc.cn/s/chinavoice/d/tmp_voice_video.jpg', tvName: '还未上传', partTvName: '还未上传', normal: false};
            
            if(!mysohu.is_mine()) {
                obj.url = '';
            }
            for(i = 0; i < a.length; i++) {
                cur = a[i];
                if(cur.status === 1) {
                    if(cur.data) {
                        r.push({url: (cur.url || '').replace('my.tv.sohu.com', 'voice.tv.sohu.com'), smallcover: cur.data.smallcover, tvName: cur.data.tvName, partTvName: utils.cutCjkString(cur.data.tvName, 16, '', 0), normal: true});
                    }else{
                        r.push(obj);
                    }
                }else{
                    r.push(obj);
                }
            }
            
            for(i = 0; i < b.data.length; i++) {
                cur = b.data[i];
                r[i]['playCount'] = cur.videoId === 0 ? 0 : cur.playCount;
            }

            return r;
        },
        getVote: function(callback){
            $.ajax({
                type: 'GET',
                //url: 'http://poll.hd.sohu.com/poll/r/spYQNq0GELTeDL3h.jsonp?i=' + window._uid + '&callback=?',
                url: 'http://voice.tv.sohu.com/vote/score.jsonp?callback=?',
                data: {
                    itemId: window._uid
                },
                dataType: 'jsonp',
                scriptCharset: 'UTF-8',
                success: function(json){
                    callback(json);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                }
            });
        },
        postVote: function(callback, is_check){
            var tag = is_check? 1: 0;

            $.ajax({
                type: 'GET',
                url: 'http://poll.hd.sohu.com/poll/w/spYQNq0GELTeDL3h.jsonp?i=' + window._uid + '&a=' + tag + '&callback=?',
                dataType: 'jsonp',
                scriptCharset: 'UTF-8',
                success: function(json){
                    callback(json);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                }
            });
        },
        doVote: function(callback){
            var that = this;
            that.postVote(function(json){
                if(json.status == '408'){
                    if(/^601/.test(json.message)){
                        that.postVote(function(json){
                            if(json.status == '200'){
                                callback(json);
                            }
                        }, true);
                    }else{
                        $.inform({
                            icon: 'icon-error',
                            delay: 3000,
                            easyClose: true,
                            content: '很抱歉，您今天已经投了3票，明天再来继续支持喜欢的选手',
                            onClose: function(){}
                        }); 
                    }
                }else{
                    //error
                }
            });
        },
        updateView: function(num) {
            $('span.num', this.wrapper).text(num);
        },
        leaveMessage: function() {
            if (!mysohu.tweet) {
                loadResource('/mysohu/tweet/msg_dlg.js').ready(function(){
                    setTimeout(function(){
                        self.message();
                    },1000);
                });
                return;
            }
            var xpt = window.$space_config._xpt, 
                nick = window._sucNick;
            mysohu.tweet.message_dialog({
                'receiverPassport' : xpt,
                'nick' : nick
            });
        },
        tmplFn: function(){ 
            //doT 0.1.6 do not support array iterate syntax
            return doT.template([
                '<div class="voice-uesr-photo"><img src="{{=it.photo}}" alt=""/></div>',
                '<div class="voice-user-info-wrapper">',
                '  <div class="user-info">',
                '    <h3 class="user-name" title="{{=it.name}}">{{=it.partName}}</h3>',
                '    <div class="user-vote"><i class="icon-like"></i>支持：<span class="num">{{=it.total}}</span></div>',
                '    <div class="user-vote-btn"><a href="javascript:;" class="vote-btn{{=it._class}}">投票支持</a></div>',
                '    {{=it.setup}}',
                '  </div>',
                '  <div class="video-list">',
                '    {{ for(var i = 0; i < it.videos.length; i++) { }}',
                '    <div class="video-list-item">',
                '      <div class="img">',
                '        {{ if(it.videos[i].url) { }}',
                '        <a href="{{=it.videos[i].url}}" target="_blank"><img src="{{=it.videos[i].smallcover}}" alt=""/></a>',
                '        <a href="{{=it.videos[i].url}}" class="video-play" target="_blank"></a>',
                '        {{ }else{ }}',
                '        <img src="{{=it.videos[i].smallcover}}" alt=""/>',
                '        {{ } }}',
                '      </div>',
                '      <h4 class="video-title clearfix">',
                '        <span class="video-type">',
                '        {{ if(i === 0) { }}',
                '        清',
                '        {{ }else{ }}',
                '        伴',
                '        {{ } }}',
                '        唱：</span>',
                '        {{ if(it.videos[i].url) { }}',
                '        <a href="{{=it.videos[i].url}}" class="video-name" title="{{=it.videos[i].tvName}}" target="_blank">{{=it.videos[i].partTvName}}</a>',
                '        {{ }else{ }}',
                '        {{=it.videos[i].tvName}}',
                '        {{ } }}',
                '      </h4>',
                '      <div class="video-data">',
                '        <p class="video-playtimes">',
                '          <i class="icon-video-playtimes"></i>',
                '          {{ if(it.videos[i].normal) { }}',
                '          <a href="{{=it.videos[i].url}}" class="video-num" target="_blank">{{=it.videos[i].playCount}}</a>',
                '          {{ }else{ }}',
                '          0',
                '          {{ } }}',
                '        </p>',
                //'        <p class="video-comment"><a href="#"><i class="icon-video-comment"></i><span>999999</span></a></p>',
                '      </div>',
                '    </div>',
                '    {{ } }}',
                '  </div>',
                '</div>'
            ].join(''));
        },
        ajax: function(url, param) {
            return $.ajax({url: url, type: 'GET', data: param, dataType: 'jsonp', scriptCharset: 'UTF-8'});
        },
        wrapper: null
    };

    $(function() {
        voteSys.init();  
    }); 
});
