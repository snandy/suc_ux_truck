/**
 * Created by JetBrains WebStorm.
 * User: lianghe
 * Date: 12-3-2
 * Time: 下午12:04
 * To change this template use File | Settings | File Templates.
 */
(function($){
    var watermark = (function(){
        var wrapper,
            list,
            mark,
            button,
            first,
            last,
            map = {
                '底部居右':8,
                '底部居中':7,
                '图片中心':4
            };

        /**
         * @desc 保存水印设置
         */
        function submit(){
            //防止重复提交保存设置
            button.attr('disabled',true).val('正在保存');

            var enable,position;
            enable = (first.find('input:radio:checked').next().text() || '是') === '是' ? 0 : 1;
            position = map[last.find('input:radio:checked').next().text() || '底部居右'];

            $.ajax({
                url:'/a/setting/mark/set',
                data:{markable:enable,markposition:position},
                method:'post',
                dataType:'json',
                success:function(data){
                    //恢复保存按钮可用
                    button.attr('disabled',false).val('保存设置');
                    if(data.code === 0){
                        $.inform({
                            icon: 'icon-success',
                            delay: 1000,
                            easyClose: true,
                            content: data.msg || "保存内容设置成功！",
                            onClose: function(){
                            }
                        });
                    }else{
                        $.inform({
                            icon: 'icon-error',
                            delay: 1000,
                            easyClose: true,
                            content: data.msg || '保存失败'
                        });
                    }
                },
                error:function(data){
                    //恢复保存按钮可用
                    button.attr('disabled',false).val('保存设置');
                }
            });
        }

        /**
         * @param event
         * @desc 事件处理函数
         */
        function handler(event){
            var target = event.target,
                elem = $(target);
            //当前元素不是保存设置按钮
            if(!elem.hasClass('ui-btn-w80')){
                var type = $.nodeName(target,'input') ? target.type : '';
                if(type === 'radio'){
                    var value,
                        refer;
                    value = elem.next().text();
                    refer = first.find('input:radio:checked').next().text();
                    
                    //设置水印显示位置
                    setup(value,refer);
                }
            }else{
                button = elem;
                submit();
            }
        }
        
        /**
         * @param {} value
         * @desc 设置水印显示位置
         */
        function setup(value,refer){
        	switch(value){
                case '是':
                    //启用radio控件
                	var checked,
                		text;
                	last.find('input:radio').prop('disabled',false);
                	checked = last.find('input:checked');
                    text = checked.next().text();
                    
                    setup(text,refer);
                    break;
                case '否':
                    //禁用radio控件
                    last.find('input:radio').prop('disabled',true);
                    mark.removeAttr('class').addClass('img-0');
                    break;
                case '底部居右':
                    if(refer === '是'){
                        mark.removeAttr('class').addClass('img-3');
                    }
                    break;
                case '底部居中':
                    if(refer === '是'){
                        mark.removeAttr('class').addClass('img-2');
                    }
                    break;
                case '图片中心':
                    if(refer === '是'){
                        mark.removeAttr('class').addClass('img-1');
                    }
                    break;
                default:
                    break;
            }
        };

        /**
         * @desc 初始化水印设置元素列表、保存设置按钮
         */
        function init(){
            wrapper = $('.profile-mark-wrapper');
            list = wrapper.find('.profile-mark-list');
            first = list.first();
            last =  list.last();
            mark = $('.profile-mark-wrapper .profile-mark-right').children().last();
            wrapper.click(handler);
        }
        return {
            init:init
        };
    })();
    $(function(){
        watermark.init();
    });
})(jQuery);