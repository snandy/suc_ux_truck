;(function($) {
	var Clicklog = function($parent, dataName,eventType) {
		var $parent = $($parent);
		$parent.delegate('[' + dataName + ']', eventType + '.clicklog', function(event){
				var $this = $(this),
				data = $this.attr(dataName);

				if(mysohu && data){
					mysohu.put_log(data);
				}
			});

		this.unbind = function(){
			$parent.undelegate(eventType+'.clicklog');
		};
	};

	mysohu.clicklog = function(selector, prop, type) {
		return new Clicklog(selector, prop, type);	
	};

	//初始化
	$(function() {
		mysohu.clicklog('body','data-logid','click');
	});
})(jQuery);
