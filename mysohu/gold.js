/*
	s3.suc.itc.cn
	mysqohu/gold.js
	6224
*/


;(function($){
	if(!!mysohu.gold){
		return;
	}
	var gold = {
		//今天是否还有金币奖励次数cookie //newmblog、newblog、newalbum、newvideo
		checked:function(type){
			
			/*
			var xpt  = $space_config._xpt;
			var info = $.cookie(type+'_'+xpt);
			if(info == null){
				return true;
			}else{
				var json = $.parseJSON(info);
				var time = (new Date).getMonth() + '_' + (new Date).getDay();
				
				//如果是当天时间则继续检查是否已经over
				if(time == json.time){
					//检查是否已经over了
					if(!json.over){				
						//如果是 博客，相册，视频if(json.number == 0){
						if(type == "newblog" || type == "newalbum" || type == "newvideo"){
							if(json.number <1){
								return true;
							}else{
								gold.setCookie(type + '_' + xpt,'{"type":"'+type+'","time":"' + time + '","goldNum":3,"over":true,"number":1}');
								return false;						
							}
						}else if(type == "newmblog"){
							//如果是微薄
							if(json.number < 3){
								return true;
							}else{
								gold.setCookie(type + '_' + xpt,'{"type":"'+type+'","time":"' + time + '","goldNum":1,"over":true,"number":' + json.number + '}');
								return false;							
							}					
						}
					}else{
						return false;
					}
				}else{
					gold.setCookie(type + '_' + xpt,'{"type":"'+type+'","time":"' + time + '","goldNum":3,"over":false,"number":' + json.number + '}');
					return true;			
				}
			}
			*/
			
			return true;
			
		},
		
		//记录今天已经领取的奖励cookie
		//opt={"uid":"_xpt(Base64密文)","time":"当前时间","pcode":"blog","desc":"描述信息"}
		setCookie:function(type_xpt,value){
			$.cookie(type_xpt,value,{expires:1,path:'/',domain: 'sohu.com'});
		},
		
		//取得金币奖励
		//参数opt = ｛"type":"blog","":""｝//newmblog、newblog、newalbum、newvideo
		request:function(type,callback){
			var xpt  = $space_config._xpt;
			var pp  = $space_config._pp;
			
			$.ajax({
				url:'http://api.ums.sohu.com/change-bonus/'+ pp +'/'+ type +'/?pcode='+ type +'&desc=xxx',
				data:{},
				type:'GET',
				dataType:'jsonp',
				jsonpCallback:'surChangeBonusCallback',
				success:function(data){
					//一次发发布所给的金币数量，根据类型
					var goldNum = 0;
					if(type == "newblog" || type == "newalbum" || type == "newvideo" ){
						goldNum = 3;
					}else if( type == "newmblog" ){
						goldNum = 1;
					}	
					if(data.result == 0){
						var time = (new Date).getMonth() + '_' + (new Date).getDay();
						var info = $.cookie(type+'_'+xpt);
						
						if(info == null){
							gold.setCookie(type + '_' + xpt,'{"type":"'+type+'","time":"' + time + '","goldNum":"'+ goldNum +'","over":false,"number":1}');
							
						}else{
							var json = $.parseJSON(info);
							gold.setCookie(type + '_' + xpt,'{"type":"'+type+'","time":"' + time + '","goldNum":"'+ goldNum +'","over":false,"number":' + (json.number + 1) + '}');
						}
					}else{
						var time = (new Date).getMonth() + '_' + (new Date).getDay();
						var info = $.cookie(type+'_'+xpt);
						var json = $.parseJSON(info);
						
						if(json == null){
							gold.setCookie(type + '_' + xpt,'{"type":"'+type+'","time":"' + time + '","goldNum":"'+ goldNum +'","over":true,"number":1}');
						}
					}
					callback(data,goldNum);
				}
			});
		}
	}
	mysohu.gold = gold;
})(jQuery);

	
	
	

	