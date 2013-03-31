/*
 *	母婴app 后台 育儿广场
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($){

var app = 'babyapp';

var PAGE_NAME = 'squareMy';

var start = new Date();//下限是当前日期
var end = new Date(start.getFullYear(),start.getMonth() + 10,1);//上限是十个月后

//创建select项
function buildSelect(select,data,value){
	value = value ? value : (select.attr('data-default-value') ? select.attr('data-default-value') : '');
	select.attr('data-default-value','');
	var select = select[0];
	select.options.length = 1;
	for(var id in data){
		var option = document.createElement('option');
		option.text = data[id];
		option.value = id;
		if(id == value){
			option.selected = 'selected';
		}
		select.options.add(option);
	}
}




var project = {
	$this: null,
	lastParams: {},
	init: function($this,options){
		var self = this;
		this.$this = $this;
		$.extend(this.options,options || {});
		/*
		执行每次都需要重复绑定的事件
		如suggest初始化
		*/
		//清理之前页面可能存在的对话框
		$[app].dialog.clear();
		
		this.initTab();
		this.birth();
		this.initArea();
		this.loadFriends();
			
		/*
		如果当前页面就是本页面，则执行静态绑定
		*/
		if($this.data('baby-page') && $this.data('baby-page') == PAGE_NAME){
			return $this;
		}
		
		/*
		下面是所有静态绑定的事件
		*/
		/*
		首先取消之前页面所有的静态绑定
		*/
		$this.unbind('.'+app);

		/*
		静态绑定click事件
		*/
		$this.bind('click.'+app,function(event){

			var $target = $(event.target),$o;
			
			//单个跟随
			if($target.closest('.baby-hall-follow-button > a').length){
				$o = $target.closest('[data-xpt]');
				if($o.length && !self.isAlreadyFollowed($o)){
					$.getJSON('/a/app/friend/addattentions.do',{
						'userid': $o.attr('data-xpt'),
						'from_type': 'baby'
					},function(results){
						if(results.code == 0){
							$o.find('.baby-hall-follow-button > a').addClass('already-attention').text('已跟随');
						}else{
							$.alert(results.msg);
						}
					});
				};
			}
			//跟随所有
			else if($target.closest('.baby-hall-followall-button > a').length){
				event.preventDefault();
				var xpts = [],$ul_ = self.$this.find('.baby-hall-follow-list');
				$ul_.find('> li[data-xpt]').each(function(){
					var $li_ = $(this);
					if(!self.isAlreadyFollowed($li_)){
						xpts.push($li_.attr('data-xpt'));
					}
				});
				if(xpts.length > 0){
					$.getJSON('/a/app/friend/addattentions.do',{
						'userid': xpts.join(','),
						'from_type': 'baby'
					},function(results){
						if(results.code == 0){
							//批量添加成功，2秒后刷新
							$ul_.find('> li .baby-hall-follow-button > a').addClass('already-attention').text('已跟随');
							setTimeout(function(){
								self.loadFriends(self.lastParams);
							},1000);
						}else{
							//失败
							$.alert(results.msg);
						}
					});
				}
			}
			//换一换
			else if($target.closest('.baby-hall-follow-wrapper a.change').length){
				event.preventDefault();
				self.loadFriends(self.lastParams);
			}
		});
		$this.data('baby-page',PAGE_NAME);
	},
	loadFriends: function(params){
		var self = this,
			$ul = this.$this.find('.baby-hall-follow-list');
		params = params || {};
		$.getJSON('/baby/square_interface.php',params,function(results){
			if(results.code != 0){
				return;
			}
			var data = results.data,$li,obj,html = '';
			if(data.length == 0){
				$.alert('未找到符合条件的用户！');
				return;
			}
			self.lastParams = params;
			for(var i=0;i<data.length;i+=1){
				obj = data[i];

				html += '<li data-xpt="'+obj.xpt+'"><div class="photo"><a href="'+obj.homeurl+'app/baby/" target="_blank" title="'+obj.nick+'"><img src="'+obj.image+'"></a></div>'
					 + '<h4><a href="'+obj.homeurl+'app/baby/" target="_blank" title="'+obj.nick+'">'+$[app].utils.cutCjkString(obj.nick,8,'',0)+'</a></h4>'
					 + '<div class="baby-hall-follow-button"><a href="javascript:void(0)">跟随</a></div></li>';
			}
			$ul.animate({'opacity':0.5},'fast',function(){
				$ul.html(html).animate({'opacity':1},'normal');
			});
		});
	},
	initTab: function(){
		var self = this,
			$ul = this.$this.find('.baby-hall-filter-nav'),
			$wrapper = $ul.next('.baby-hall-filter-select-wrapper');
		$ul.find('li').click(function(event){
			event.preventDefault();
			var $this = $(this);
			if($this.hasClass('now')){
				return;
			}
			$ul.find('li').removeClass('now');
			$this.addClass('now');
			
			switch($ul.find('li').index($this)){
				case 0:
					//已有宝宝
					self.birth();
					$wrapper.find('select').val('');
					$wrapper.css('visibility','visible');
					break;
				case 1:
					//准妈妈
					self.due();
					$wrapper.find('select').val('');
					$wrapper.css('visibility','visible');
					break;
				case 2:
					//备孕中
					$wrapper.css('visibility','hidden');
					self.loadFriends({
						status: 1
					});
					break;
			}
			
		});
	},
	birth: function(){
		this.initYear();
		this.initMonth();
	},
	initYear: function(){
		var self = this,
			$form = $('#baby_square_find'),
			now = new Date(),
			select = $form.find('select[name=year]').width(82);
		select[0].options.length = 1;
		select[0].options[0].value = '';
		for(var i = now.getFullYear() ,len = 2000; i >= len ;i -= 1){
			var option = document.createElement('option');
			if(i == 2000){
				option.text = "2000年及以前";
			}else{
				option.text = i;
			}
			option.value = i;
			select[0].options.add(option);
		}
		select.unbind('change').change(function(){
			self.onDateChange();	
		});
	},
	initMonth: function(){
		var self = this,
			$form = $('#baby_square_find'),
			select = $form.find('select[name=month]').width(65);
		select[0].options.length = 1;
		select[0].options[0].value = '';
		for(var i = 1; i <= 12 ;i += 1){
			var option = document.createElement('option');
			option.text = i;
			option.value = i < 10 ? '0'+i : i;
			select[0].options.add(option);
		}
		select.unbind('change').change(function(){
			self.onDateChange();
		});
	},
	due: function(){
		var self = this,
			$form = $('#baby_square_find'),
			$y = $form.find('select[name=year]'),
			$m = $form.find('select[name=month]');
		this.initDueYear();
		$y.unbind('change').change(function(){
			self.initDueMonth($(this).val());
		}).change();
		$m.unbind('change').change(function(){
			self.onDateChange();
		});
	},
	initDueYear: function(){
		var self = this,
			$form = $('#baby_square_find'),
			select = $form.find('select[name=year]').width(82);
		select[0].options.length = 1;
		for(var i = end.getFullYear() ,len = start.getFullYear(); i >= len ;i -= 1){
			var option = document.createElement('option');
			option.text = i;
			option.value = i;
			select[0].options.add(option);
		}
	},
	initDueMonth: function(year){
		var self = this,
			$form = $('#baby_square_find'),
			select = $form.find('select[name=month]').width(65);
		select[0].options.length = 1;
		if(!year){
			return;
		}
		var sMonth,eMonth;
		if(year == start.getFullYear()){
			sMonth = start.getMonth() + 1;
			eMonth = 12;
		}
		else if(year == end.getFullYear()){
			sMonth = 1;
			eMonth = end.getMonth() + 1;
		}
		else{
			sMonth = 1;
			eMonth = 12;
		}
		
		for(var i = sMonth; i <= eMonth ;i += 1){
			var option = document.createElement('option');
			option.text = i;
			option.value = i;
			select[0].options.add(option);
		}
	},
	initArea: function(){
		var self = this,
			$form = $('#baby_square_find'),
			$prov = $form.find('select[name=prov]').width(90),
			$city = $form.find('select[name=city]').width(125);
		buildSelect($prov,$[app].utils.area.provinceMap);
		$prov.change(function(){
			buildSelect($city,$[app].utils.area.cityMap[$(this).val()]);
		}).change();
		$city.change(function(){
			var prov = $prov.val(),
				city = $city.val();
			if(prov != '' && city != ''){
				self.loadFriends({
					'p': prov,
					'c': city
				});
				$form.find('[name=year],[name=month]').val('');
			}
		});
	},
	onDateChange: function(){
		var $form = $('#baby_square_find'),
			year = $form.find('[name=year]').val(),
			month = $form.find('[name=month]').val(),
			status = this.getStatus();
		if(year != '' && month != '' && status != 1){
			this.loadFriends({
				'status': status,
				'y': year,
				'm': month
			});
			$form.find('[name=prov],[name=city]').val('');
		}
	},
	getStatus: function(){
		var $ul = this.$this.find('.baby-hall-filter-nav'),
			$now = $ul.find('li.now');
		switch($ul.find('li').index($now)){
			case 0:
				//已有宝宝
				return 3;
			case 1:
				//准妈妈
				return 2;
			case 2:
				//备孕中
				return 1;
		}
	},
	isAlreadyFollowed: function($o){
		return $o.find('.baby-hall-follow-button > a').hasClass('already-attention');
	}

};


$[app][PAGE_NAME+'Boot'] = function(options) {
	var $this = this;
	return $this;
};

$[app][PAGE_NAME+'Load'] = function(options) {
	$[app].onPageLoaded();
	var $this = $('#innerCanvas');
	project.init($this,options);
	return $this;
};


})(jQuery);