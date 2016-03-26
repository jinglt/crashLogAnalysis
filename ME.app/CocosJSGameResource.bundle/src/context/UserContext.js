
var UserContext = {
    
	STORAGE_FILE : "usercontext.dat",	
	
	values : {
		clientId : null, 
		mapId : "bj_zongbu", 
		mapTheme : "default",
		userInfo : { erpCode : null, userName : null, userHeadImg : null },
		station : null,
		carLocate : null,
		updateTime : null
	},
	
	init : function(){
		
		//加载用户配置
		var vstr = AppContext.nativeReadFileOnSdcard(AppContext.DATA_PATH + this.STORAGE_FILE);
		if(vstr){
			cc.extend(this.values, JSON.parse(vstr));
		}
		
		var userInfo = AppContext.nativeGetUserInfo();
		if(userInfo.erpCode){
			cc.extend(this.values.userInfo, userInfo);
		}
		
		if(this.values.clientId == null){
			this.values.clientId = Math.random() * 10000000000;
			this.saveOnLocal();
		}
	},
	
	saveOnLocal : function(){
		
		this.values.updateTime = Date.now();
		var vStr = JSON.stringify(this.values);
		
		var r = AppContext.nativeWriteFileOnSdcard(AppContext.DATA_PATH + this.STORAGE_FILE, vStr);
		return JSON.parse(r);
	}
	
};