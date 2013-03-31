/**
 * 母婴后台管理app加载
 * 
 * @author bobotieyang
 */
;
loadResource('/mysohu/plugins/swfupload/swfupload.js');
loadResource('/app/discuss/discuss.js','/app/baby/i/reg.js','/app/baby/signin.js','/app/baby/emot.js','/app/baby/photoupload.js','/app/baby/dialog.js');
loadResource('/app/baby/pager.js','/app/baby/i/week.js','/app/baby/i/month.js','/app/baby/i/day.js','/app/baby/i/photo.js','/app/baby/i/square.js');

(function($, ms) {

	$(function() {
		ms.babyapp.loadPage('i');
		require('plugins::hijacker', function($hijacker) {
			$hijacker.hijackthis('.hijackthis');
		});
	});

})(jQuery, mysohu);