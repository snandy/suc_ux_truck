;(function($) {
	
	function log(msg) {
		//console.log(msg + ' clicked');
		var img = new Image();
		img.src = 'http://cc.i.sohu.com/pv.gif?' + msg + '&ts=' + (+new Date());
	}

	var Clicklog = function($parent, dataName,eventType) {
		
		var $parent = $($parent);
		$parent.delegate('['+dataName+']',eventType+'.clicklog',function(event){
			var $this = $(this),
				data = $this.attr(dataName);
			
			if(data){
				log(data);
			}
		});
		
		this.unbind = function(){
			$parent.undelegate(eventType+'.clicklog');
		};
	};
	Clicklog.writeLog = log;
	
	//初始化
	$(function() {
		new Clicklog('body','data-log-click','click');
	});
	
})(jQuery);
