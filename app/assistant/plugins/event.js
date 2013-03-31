/**
 * 节日，重大事件提醒
 */
require("core::spy", "app::assistant::popup", "app::assistant::template", function(spy, Popup, TMPL) {
	define('app::assistant::plugins::event', function(self, handle) {
		spy.getEvent(function(events) {
			if (self.popup)
				return;
			for ( var i = 0, L = events.length, ids = new Array(L); i < L; i++) {
				ids[i] = "evt" + events[i].id;
			}
			var unread = self.checkRead(ids);
			if (unread == -1) {// no unread events
				if (handle) {
					handle.next(0);
					handle = null;
				}
				return;
			}
			onEvent(events[unread]);
		});
		return true;
		function onEvent(event) {
			self.setEvent(function() {
				var popup = new Popup({
					handle : self,
					className : "event",
					content : TMPL.event(event)
				});
				popup.autoPos();
				popup.delegate("a", "click", function() {
					popup.collapse();
				}).bind(Popup.Collapse, function() {
					self.idle();
					if (handle) {
						handle.next();
						handle = null;
					}
				});
				self.setRead("evt" + event.id);
			}, event.useTheme);
		}
	});
});