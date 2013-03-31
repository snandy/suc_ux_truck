/* *
 * By: Lewis Lv
 * @param {Array<string>} list Tracing link selector list
 * @param {String} url Tracing server link
 */

;(function($) {
if ($.hotmap) {
	return;
}

$.hotmap = function(settings) {
	var defaults = {
		list: [],
		url: "http://bgt.blog.sohu.com/blogclick.gif"
	};

	var opts = $.extend(defaults, settings);

	var biImg = new Image;
	$(document).mousedown(function(event) {
		
		var $target = $(event.target), hotmap, biMark;

		for (var i = 0; i < opts.list.length; i++) {
			hotmap = $.isArray(opts.list[i]) ? opts.list[i][0] : opts.list[i];
try{
			if ($target.closest(hotmap).length) {
				biMark = $.isArray(opts.list[i]) ? opts.list[i][1] :
						(hotmap.indexOf(":eq") == -1) ? (hotmap + ":eq(0)") : hotmap;
				biImg.src = opts.url + "?from=" + biMark.replace(/#/g, "|") + "&t=" + new Date().getTime();
				break;
			}
}catch(e){}
		}
	});
};

})(jQuery);
