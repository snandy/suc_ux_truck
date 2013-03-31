/**
 * 母婴后台管理app加载
 * 
 * @author bobotieyang
 */
;
loadResource('/app/discuss/discuss.js','/app/baby/dialog.js','/app/baby/pager.js','/app/baby/emot.js');
loadResource('/app/baby/s/month.js','/app/baby/s/day.js','/app/baby/s/photo.js','/app/baby/s/comment.js');

(function($, ms) {

	$(function() {
		ms.babyapp.loadPage('s');
		require('plugins::hijacker', function($hijacker) {
			$hijacker.hijackthis('.hijackthis');
		});
	});

})(jQuery, mysohu);