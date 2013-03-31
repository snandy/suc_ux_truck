require('core::util::channel', function(channel) {
	define('app::assistant::plugins::channel', function(assistant, handle) {
		handle.next();
		assistant.invoke('initChannel');
		channel.adapter = {
			setItem : function(ch, str) {
				assistant.invoke('broadcast', ch.substr(4), str);
			}
		};
		assistant.$broadcast = function(ch, str) {
			channel.trigger(ch, str);
		}
	});
});