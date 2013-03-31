require('core::util', 'core::util::jQuery', 'plugins::hijacker', '#document', function(util, $, hijacker) {

	hijacker.hijackthis('.hijackthis');
	// when having show-comment tag, show comment automatically
	var show_comment = $('.show-comment');
	if (show_comment.length) {
		var page = location.hash.match(/(?:#comment(?:\.(\d+))?)?$/)[1];
		if (page)
			window.location.hash = "#comment";

		var as = $.find('.feed-set a');
		hijacker.hijack({
			actionTarget : show_comment[show_comment.length - 1],
			action : 'comment.show',
			onSuccess : mysohu.appId === 'blog' && function(cmt) {
				for ( var L = as.length, n = 0; n < L; n++) {
					var an = as[n].getAttribute("action");
					if (an == "junction")
						an = as[n].getAttribute("jTarget");
					if (!an)
						continue;
					if (/forward/.test(an))
						util.refreshCount(as[n], cmt.spreadcount);
					else if (/comment|discuss/.test(an))
						util.refreshCount(as[n], cmt.commentcount);
				}
			}
		});
		if (mysohu.appId === 'blog') {
			$('.forwardnum')[0].as = as;
		}

	}

	$('a[action="mblog.refer"]').click(function(e) {
		e.preventDefault();
		var nick = e.target.getAttribute("data-nick");
		require('app::widgets::atTA', function($at) {
			$at({
				nick : nick
			});
		});
	});
});
