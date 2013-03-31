load('/mysohu/ui.init.js');
require('core::util::jQuery', 'app::widgets::template', 'core::util', function($, PLUGINS, util) {
	/**
	 * class Page extends $.fn.init
	 * 
	 * @param {number}
	 *            pages
	 */
	function Page(pages, curr) {
		this[0] = util.parseHTML(PLUGINS.page())[0];
		this[0].wrapped = this;
		this.length = 1;
		this.btns = this.find('a');
		this.list = this.find(".page-num p");
		this.curr = this.find('.cpage span');
		this.setPages(pages || 1);
		arguments.length >= 2 && this.showPage(curr || 1);
	}

	Page.prototype = new $.fn.init();
	Page.prototype.showPage = function(n) {
		if (n === "prev")
			n = this.current - 1;
		else if (n === "next")
			n = this.current + 1;
		else if (n === "tail")
			n = this.pages;
		else
			n = parseInt(n);
		var N = this.pages;
		if (n < 1 || n > N)
			return undefined;
		var range = util.range(1, N, n, 10), a = range[0], b = range[1];
		this.btns[0].className = a === 1 ? "none" : "txt";
		this.btns[1].className = n === 1 ? "null" : "txt";
		this.btns[2].className = n === N ? "null" : "txt";
		this.btns[3].className = b === N ? "none" : "txt";
		this.curr.html(n);
		for ( var i = a, arr = []; i <= b; i++) {
			arr.push('<a href="javascript:;"', i == n ? ' class="curt"' : '', ' action="page" data-page="', i, '">第', i,
			'页</a>');
		}
		this.list.html(arr.join(''));
		return this.current = n;
	};
	Page.prototype.hidePages = function() {
		this.list.hide().parent().removeClass('page-num-active');
		return this;
	};
	Page.prototype.setPages = function(pages) {
		this.list.hide().parent().attr('class', "page-num");
		if (pages === this.pages)
			return this;
		this.pages = pages;
		this.btns[3].title = "第" + pages + "页";
		pages ? this.show().showPage(this.current) : this.hide();
		return this;
	};
	define('plugins::hijacker::page', function(e) {
		var $page = $(e.actionTarget).closest('div.ui-pagination')[0].wrapped;
		var page = $page.showPage(e.actionTarget.getAttribute("data-page"));
		$page.hidePages();
		if (typeof page == 'undefined')
			return;
		$page.trigger('page', page);
		$page = $page.closest('.page-handler').data('page');
		if (!$page)
			return;
		page && $page.handler.setPage && $page.handler.setPage(page);
	});
	define('core::ui::Page', Page);
});
