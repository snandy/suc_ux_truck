require('core::util::jQuery', function($) {
	define("plugins::hijacker", {
		hijackthis : function(elem) {
			var $elem = $(elem);
			if ($elem.length && !$elem.closest('.hijacked').length) {
				$elem.click(clickHandler).bind('hijack', triggerHandler).addClass('hijacked');
			}
		},
		free : function(elem) {
			var $elem = $(elem);
			if ($elem.length && elem.hijacked) {
				$elem.unbind('click', clickHandler).removeClass('hijacked');
			}
		},
		hijack : function(e) {
			require(e.action.indexOf('::') == -1 ? 'plugins::hijacker::' + e.action : e.action, function(handler) {
				handler.call(e.actionTarget, e);
			});
		}
	});
	function triggerHandler(e, target, action) {
		if (!action || target.hijacker_loading && target.hijacker_loading != "false")
			return;
		e.action = action;
		e.actionTarget = target;
		target.hijacker_loading = true;
		require(action.indexOf('::') == -1 ? 'plugins::hijacker::' + action : action, function(handler) {
			target.hijacker_loading = false;
			handler.call(target, e);
		});
		e.dont_prevent || e.preventDefault();
	}
	function clickHandler(e) {
		if (e.actionTarget) // triggered
			return;
		var action;
		for ( var target = e.target, end = this.parentNode; target && target != end; target = target.parentNode) {
			if (target.nodeName != "FORM" && (action = target.getAttribute("action")))
				break;
		}
		if (action === "junction") {
			target = $.find(target.getAttribute('jTarget'))[0];
			action = target.getAttribute("action");
		}
		triggerHandler(e, target, action);
	}
});