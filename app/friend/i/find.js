/*
 *	home proxy方式 好友后台 找人
 *  @author bobotieyang@sohu-inc.com
 */
;
(function($,ms){

var app = 'friend';

var core = ms.friend;//将friend类缩写成core

var PAGE_NAME = 'find';

var varname = 'varFriendsappCounty' + parseInt(Math.random() * 100000000);//街道变量名

//创建select项
function buildSelect($select,data,value){
	var option,select = $select[0];
	if(!value){
		value = ($select.attr('data-default-value') ? $select.attr('data-default-value') : '');
		$select.attr('data-default-value','');
	}
	select.options.length = 1;
	for(var id in data){
		var option = document.createElement('option');
		option.text = data[id];
		option.value = id;
		select.options.add(option);
	}
	$select.val(value);
}

var area =  ms.area;

var project = {
	$this: null,
	options: {
		type: 1
	},
	schoolpop: null,
	card: null,//名片
	isInited: false,
	init: function($this,options){
		var self = this;
		this.$this = $this;
		$.extend(this.options,options || {});

		/*
		执行每次都需要重复绑定的事件
		如suggest初始化
		*/
		
		ms.SchoolSearch.destroyAll();

		switch(parseInt(this.options.type,10)){
			case 1:
				this.byNick();
				break;
			case 2:
				this.bySchool();
				break;
			case 3:
				this.byArea();
				break;
			case 4:
				this.byCom();
				break;
		}

		
		
		/*
		下面是所有静态绑定的事件
		*/
		/*
		首先取消之前页面所有的静态绑定
		*/
		this.initCard();//初始化名片

		/*
		静态绑定click事件，处理取消跟随，设置备注
		*/
		$this
		//添加跟随
		.delegate('.app-friends-add','click.'+app,function(){
			var $target = $(this),
				$div = $target.closest('div[data-friends-xpt]');
			if($div.length){
				core.follow(
				{
					'xpt':$div.attr('data-friends-xpt'),
					'from_type':$div.attr('data-from-type') || core.fromType.seach
				},
				function(data){
					//添加跟随后更改跟随状态
					var html = '';
					//添加跟随 @friendType : 1 双向好友 0 单向好友
					html = '<div class="attention-ok">已跟随</div>';
					$div.find('div.set-action').html(html);
					self.card.clearCache();
					//弹出设置分组对话框
					if($.iCard && $.iCard.SetGroupsDialog){
						$.iCard.SetGroupsDialog.show({
							'friendid': data.friendId,
							'nick': $div.find('div.user-name > a').eq(0).text(),
							'friendType': data.friendType,
							'xpt': $div.attr('data-friends-xpt')
						});
					}
				});
			};
		});	
	},
	byNick: function(){
		var tipText = '在这里输入朋友的姓名或用户名，如：小新';
		var $form = this.$this.find('div.app-left div.search-con form');
		var $nick = $form.find('[name=nick]').iPrompt({text: tipText,css:{'color':'#999999'}});
		$form.submit(function(){
			$nick.val($.trim($nick.val()));
			if($nick.val() == '' || $nick.val() == tipText){
				$nick.val('').focus();
				return false;
			}
			return true;
		});
	},
	bySchool: function(){
		var self = this;
		this.schoolpop = new ms.SchoolSearch();

		var tipText = '在这里输入朋友的姓名或用户名，如：小新';
		var tipText2 = '点击选择学校';
		var $form = this.$this.find('div.app-left div.search-con form');
		var $schoolname = $form.find('input[name=schoolname]');
		var $schoolid = $form.find('input[name=schoolid]');
		var $schooltype = $form.find('select[name=schooltype]');
		if($schoolname.val() == ''){
			$schoolname.val(tipText2).css({'color':'#999999'});
		}
		$schoolname
		.attr('readonly','readonly')
		.mousedown(function(){
			if($schooltype.val() == '' || $schooltype.val() == 0){
				$schooltype[0].selectedIndex = 1;
			}
			self.schoolpop.show({
				type: $schooltype.val(),
				at: $schoolname,
				onSelected: function(sName,sId){
					$schoolname.val(sName);	
					$schoolid.val(sId);
					$schoolname.css({'color':'#333333'});
				}
			});
			//SchoolSel.show($schoolname,$schoolid,$schooltype.val());
		})
		.focus(function(){
			if($schoolname.val() == tipText2){
				$schoolname.val('').css({'color':'#333333'});
			}
		})
		.blur(function(){
			if($schoolname.val() == ''){
				$schoolname.val(tipText2).css({'color':'#999999'});
			}
		});
		$schooltype.change(function(){
			if(!self.schoolpop.isVisible()){
				return;
			}
			if($schooltype.val() == '' || $schooltype.val() == 0){
				self.schoolpop.hide();
			}else{
				self.schoolpop.show({
					type: $schooltype.val(),
					at: $schoolname,
					onSelected: function(sName,sId){
						$schoolname.val(sName);	
						$schoolid.val(sId);
					}
				});
				//SchoolSel.show($schoolname,$schoolid,$schooltype.val());
			}
		});
		//SchoolSel.clearSelectors();
		var $nick = $form.find('input[name=nick]').iPrompt({text: tipText,css:{'color':'#999999'}});

		$form.submit(function(){
			$nick.val($.trim($nick.val()));
			if($nick.val() == tipText){
				$nick.val('');
			}
			if($nick.val() != '' || $schoolid.val() != ''){
				return true;
			}else{
				$nick.val('').focus();
				return false;
			}
			return true;
		});
	},
	byArea: function(){
		var tipText = '在这里输入朋友的姓名或用户名，如：小新';
		var $form = this.$this.find('div.app-left div.search-con form');
		var $province = $form.find('select[name=provinceid]');
		var $city = $form.find('select[name=cityid]');
		var $country = $form.find('select[name=countryid]');
		var $nick = $form.find('input[name=nick]').iPrompt({text: tipText,css:{'color':'#999999'}});
		buildSelect($province,area.province);
		$province.change(function(){
			buildSelect($city,area.city[$province.val()]);
			buildSelect($country,{},-1);
		}).change();
		$city.change(function(){
			var cid = $city.val();
			if(cid == '' || cid == 0){
				buildSelect($country,{},-1);
				return;
			}
			$.getJSON('http://i.sohu.com/a/profile/service/county.htm',{'cid':cid},function(result){
				if(result.status == 0){
					buildSelect($country,result.data[0]);
				}
			});
		}).change();
		$form.submit(function(){
			$nick.val($.trim($nick.val()));
			if($nick.val() == tipText){
				$nick.val('');
			}
			if($nick.val() != '' || $province.val() != ''){
				return true;
			}else{
				$nick.val('').focus();
				return false;
			}
			return true;
		});
	},
	byCom: function(){
		var tipTextCom = '在这里输入公司名称',tipTextName = '在这里输入朋友的姓名或用户名，如：小新';
		var $form = this.$this.find('div.app-left div.search-con form');
		var $com = $form.find('input[name=employer]').iPrompt({text: tipTextCom,css:{'color':'#999999'}});
		var $nick = $form.find('input[name=nick]').iPrompt({text: tipTextName,css:{'color':'#999999'}});

		$form.submit(function(){
			$com.val($.trim($com.val()));
			$nick.val($.trim($nick.val()));
			if($com.val() == tipTextCom){
				$com.val('');
			}
			if($nick.val() == tipTextName){
				$nick.val('');
			}
			if($nick.val() != '' || $com.val() != ''){
				return true;
			}else{
				$com.val('').focus();
				return false;
			}
			return true;
		});
	},
	findDiv: function(param){
		if(param.xpt){
			return this.$this.find('div[data-friends-xpt="'+param.xpt+'"]');
		}else if(param.friendid){
			return this.$this.find('div[data-friends-friendid="'+param.xpt+'"]');
		}
		return null;
	},
	initCard: function(){
		var self = this;
		this.card = new $.iCard({
			bindElement: '#friend-canvas',
			onFollow: function(param){
				var $div = self.findDiv(param);
				$div.find('div.set-action').html('<div class="attention-ok">已跟随</div>');	
			},
			onUnfollow: function(param){
				var $div = self.findDiv(param);
				$div.find('div.set-action').html('<div class="set-attention"><a class="app-friends-add" href="javascript:void(0)">跟随</a></div>');
			}
		});
	}
};


var urlParams = core.getURLParams();

$(function(){
	project.init($('#friend-canvas'),{type: urlParams.type ? urlParams.type : 1});
});

})(jQuery,mysohu);