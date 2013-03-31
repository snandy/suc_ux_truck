require("app::assistant::popup", function(Popup) {
	define("app::assistant::plugins::search", function(self) {
		self.$log('search');
		var popup = new Popup({
			handle : self,
			className : 'search',
			content : '<input type="text" maxlength="12" /><a href="javascript:;" title="找人" class="btn-search"></a>'
		});
		popup.autoPos();
		popup.find('input').focus();
		popup.bind(Popup.Collapse, function() {
			self.popup = null;
			self.setStatus();
		});

		var input = popup.find('input'), btnSearch = popup.find('.btn-search');
		input.bind("keyup", function(e) {
			if (e.keyCode == "13")
				onSearch();
		}).bind('click', function(e) {
			self.$log('search_textbox');
		});
		btnSearch.bind("click", onSearch);

		function onSearch() {
			self.$log('search_btn');
			if (!input[0].value)
				return;
			mysohu.setLocation("http://i.sohu.com/searchuser/home/index.htm?_input_encode=UTF-8&nick="
			+ encodeURIComponent(input[0].value));
		}
	});
});