/**
 * 空间页中间提示tip
 */
(function($){
    $(document).ready(function(){
        $("#top_tip_close").click(function(){
            //关闭顶部tip
            $("#top_tip").hide();
            $.cookie("top_tip_" + xpt, 'false', {
                expires: 1,
                path: '/',
                domain: 'i.sohu.com'
            });
        });
        //判断top_tip_close_xpt这个cookie是否存在，如果存在或者为true则显示，否则不显示
        var xpt = $space_config._xpt;
        if ($.cookie("top_tip_" + xpt) == null) {
            $.cookie("top_tip_" + xpt, 'true', {
                expires: 1,
                path: '/',
                domain: 'i.sohu.com'
            });
        }
        if ($.cookie("top_tip_" + xpt) == "true") {
            $("#top_tip").show();
        }
        else {
            $("#top_tip").hide();
        }
    });
})(jQuery);
