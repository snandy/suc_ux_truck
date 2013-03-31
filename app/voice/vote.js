require('core::util::jQuery', 'core::util::beLogin', function($, beLogin) {
    var voteSys = {
        init: function() {
            this.isGoodVoiceUser(this.initView, null);
        },
        //if good voice user execute done, else general user execute fail
        isGoodVoiceUser: function(done, fail) {
            this.ajax('/a/voice/app/get-status', 'POST', {xpt: $space_config._xpt}).done(done).fail(fail);
        },
        initView: function(data) {
            var that = this;

            that.getVote(function(json){
                var data = json.attachment,
                wrapper = that.wrapper = $('div.rtbar-cvoice');

                that.postVote(function(result) {
                    if(result.status == '408'){
                        if(!/^601/.test(result.message)){
                            data.disabled = true;                             
                        }
                    }
                    wrapper.html(that.tmpl(data)).removeClass('hide');
                    that.regEvent();
                });
            });
        },
        regEvent: function() {
            var that = this;

            this.wrapper.delegate('a.btn:not(".disabled")', 'click', function(event) {
                if(beLogin()) {
                    return; 
                }
                
                var $btn = $(event.target);
                
                $btn.addClass('disabled');
                that.doVote(function(json){
                    that.updateView(json.attachment.total);
                    that.anim(function(){
                        $btn.removeClass('disabled');
                    });
                });

                //ie6 abort request
                event.preventDefault();
            });
        },
        anim: function(callback) {
            var that = this,
                transition = that.isSupportTransition(),
                addone = that.wrapper.find('i.img-addone'),
                thanks = that.wrapper.find('i.img-vote'),
                s1,
                s2;

            addone.css({opacity: 1});
            thanks.css({opacity: 1});
            if(transition) {
                addone.css({'margin-top': '-10px'}).addClass('vote-add-up').unbind().bind('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
                    addone.addClass('vote-anim-hide');
                    s1 && addone.removeClass('vote-anim-hide vote-add-up').css({'margin-top': '38px', opacity: 0});
                    s1 = true;
                });

                thanks.css({'margin-top': '-18px'}).addClass('vote-thanks-up').unbind().bind('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
                    thanks.css({'margin-top': '0px'});
                    s2 && callback();
                    s2 = true;
                });
            }else{
                addone.animate({
                    'margin-top': that.ie6 ? 0 : -10
                }, 800, function() {
                    addone.animate({
                        opacity: 0
                    }, 800, function() {
                        addone.css({'margin-top': '38px'});
                        thanks.animate({
                            'margin-top': -18
                        }, 800, function() {
                            thanks.animate({
                                'margin-top': 0 
                            }, 1000, function() {
                                callback();
                            });
                        });
                    });
                });
            }
        },
        getVote: function(callback){
            $.ajax({
                type: 'GET',
                url: 'http://poll.hd.sohu.com/poll/r/spYQNq0GELTeDL3h.jsonp?i=' + window._uid + '&callback=?',
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
                            content: '最多投3票，感谢您的支持！',
                            onClose: function(){}
                        }); 
                    }
                }else{
                    //error
                }
            });
        },
        updateView: function(num) {
            var count = this.wrapper.find('div.ticket > b');

            count.text(num);
        },
        isSupportTransition: function() {
            var s = document.createElement('div').style; 

            return 'transition' in s || 'webkitTransition' in s || 'MozTransition' in s || 'msTransition' in s || 'OTransition' in s;
        },
        tmpl: function(data){ 
            return [
                '<div class="rtbar-wrapper">',
                '  <div class="cvoice-head"></div>',
                '  <div class="cvoice-body">',
                '    <div class="popup"><i class="img-addone"></i></div>',
                '    <div class="ticket"><i class="i-heart"></i><b>' + data.total + '</b><span>票</span></div>',
                '    <div class="vote">',
                '      <div class="pull-right"><a class="btn ' + (data.disabled ? 'disabled' : '') + ' btn-pink" href="#">投 票</a></div>',
                '      <div class="vote-box"><i class="img-vote"></i></div>',
                '    </div>',
                '  </div>',
                //'  <div class="cvoice-foot"><span class="pull-right"><a href="#">查看榜单<span>&gt;&gt;</a></span></div>',
                '  <div class="cvoice-foot"></div>',
                '</div>'
                ].join('')
        },
        ajax: function(url, method, param) {
            var that = this,
                dfd = $.Deferred(); 

            $.ajax(url, {
                type: method,
                data: param,
                success: function(data) {
                    if(data.code === 0 || data.code === 5) {
                        if(data.data !== -1 && data.data !== 8 && data.data !== 1) {
                            dfd.resolveWith(that, [data]);
                        }
                    }else{
                        dfd.reject(); 
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    dfd.reject(); 
                }
            });

            return dfd.promise();
        },
        wrapper: null,
        ie6: $.browser.msie && parseInt($.browser.version, 10)
    };

    $(function() {
        voteSys.init();  
    }); 
});
