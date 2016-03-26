var AppContext = {

	EVENT_VIEW_RESIZE : "EVENT_VIEW_RESIZE",
	ANDROID_CODE : "com/jd/map/app/AppJsRuntime",
	IOS_CODE : "RootViewController",
	DATA_PATH : "data/data/",
	MAP_PATH : "data/map/",
	VERSION : "1.1.0.0",

	designSize : 640,
	viewSize : null,
	baseWidth : 0,
	deviceInfo : null,
	namedCallbacks : {},
	backKeyCallbacks : [],
	viewSize2PxRate : 1,
	appProps : {},

	init : function(){
		this.deviceInfo = this.nativeGetDeviceInfo();
		MU.logObj(this.deviceInfo);
		var fsize = this.nativeGetAppSize();
//		this.designSize = fsize.width;
		this.viewSize2PxRate = fsize.width / this.designSize;
		this.viewSize = cc.size(this.designSize, Math.ceil( this.designSize * fsize.height/fsize.width));
		this.baseWidth = Math.min( this.viewSize.width, this.viewSize.height );

		cc.view.adjustViewPort(true);
		cc.view.setDesignResolutionSize(this.viewSize.width, this.viewSize.height, cc.ResolutionPolicy.FIXED_WIDTH);
		cc.view.resizeWithBrowserSize(true);
		
		this.loadAppProps();
		this.nativeInitContext();
		this.handleNativeJsCode();
	},
	
	loadAppProps :  function(){
		var str = this.nativeReadFileOnSdcard("data/data/appProps.json");
		if(str){
			try{
				this.appProps = JSON.parse(str);
			}catch(ex){

			}
		}
	},
	
	dp2Px : function(dp){
		if(this.deviceInfo){
			return dp * this.deviceInfo.density / this.viewSize2PxRate;
		}
		
		return dp;
	},

	isAndroid : function(){
		return cc.sys.os == cc.sys.OS_ANDROID;
	},

	isIOS : function(){
		return cc.sys.os == cc.sys.OS_IOS;
	},

	isWindow : function(){
		return cc.sys.os == cc.sys.OS_WINDOWS;
	},


	nativeInitContext : function(){
		
		if(cc.sys.os == cc.sys.OS_ANDROID){
			jsb.reflection.callStaticMethod(this.ANDROID_CODE, "onCocosReady", "()V");

			return true;
		}else if(cc.sys.os == cc.sys.OS_IOS){
			return true;
		}else{
			return true;
		}
		
	},

	nativeGetDirection : function(){
		if(cc.sys.os == cc.sys.OS_ANDROID){
			return jsb.reflection.callStaticMethod(this.ANDROID_CODE, "getDirection", "()I");
		}else if(cc.sys.os == cc.sys.OS_IOS){
			return jsb.reflection.callStaticMethod(this.IOS_CODE, "getDirection");
		}else{
			return 0;
		}
	},

	nativeExitApp : function(){
// cc.director.stopAnimation();
// cc.director.popToRootScene();
// cc.director.popScene();
		if(this.isAndroid()){
			jsb.reflection.callStaticMethod(this.ANDROID_CODE, "exitApp", "()V");
			return 1;
		}
		if(this.isIOS()){
			return jsb.reflection.callStaticMethod(this.IOS_CODE, "exitApp");
			return 1;
		}
	},

	nativeOnBackEvent : function(){
// MU.log("on back event start ..");
		return false;
		
// MU.log("on back event finish");
	},
	
	triggerBackKeyEvent : function(){
		var callback = AppContext.backKeyCallbacks.pop();
		if(callback!=null){
// MU.log("backKeyCallbacks " + this.backKeyCallbacks.length);
			try{
				var r = callback();
				if(r==true){
					AppContext.triggerBackKeyEvent();
				}
			}catch(ex){

			}
		}
	},
	
	pushBackKeyCallback : function(callback, target){
		if(callback){
			target = target || this;
			this.backKeyCallbacks.push(callback.bind(target));
		}
	},

	nativeGetAppSize : function(){
		if(this.isIOS()){
			var str = jsb.reflection.callStaticMethod(this.IOS_CODE, "nativeGetAppSize");
			if(str){
				return JSON.parse(str);
			}
		}
		return cc.view.getFrameSize();
	},

	nativeReadFileOnSdcard : function(file){
		
		if(this.isAndroid()){
			return jsb.reflection.callStaticMethod(this.ANDROID_CODE, "readFileOnSdcard", "(Ljava/lang/String;)Ljava/lang/String;", file);
		}
        if(this.isIOS()){
            return jsb.reflection.callStaticMethod(this.IOS_CODE, "readFileOnSdcard:",file);
        }
		return null;
	},

	nativeWriteFileOnSdcard : function(file, content){

		if(this.isAndroid()){
			return jsb.reflection.callStaticMethod(this.ANDROID_CODE, "writeFileOnSdcard", "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;",file, content);
		}
        if(this.isIOS()){
            return jsb.reflection.callStaticMethod(this.IOS_CODE, "writeFileOnSdcard:content:",file,content);
        }
		return null;
	},

	nativeGetBeaconInfo : function(){
		if(this.isAndroid()){
			var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "getBeaconInfo", "()Ljava/lang/String;");
			if(str){
				return JSON.parse(str);
			}

		}
		if(this.isIOS()){
			var str = jsb.reflection.callStaticMethod(this.IOS_CODE, "getBeaconInfo");
			if(str){
				return JSON.parse(str);
			}
		}

		return null;
	},
	
	nativeReadCompressedFile : function(file){
		if(this.isAndroid()){
			var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "readCompressedFile", "(Ljava/lang/String;)Ljava/lang/String;", file);
			return str;
		}
		if(this.isIOS()){
			var str = jsb.reflection.callStaticMethod(this.IOS_CODE, "readCompressedFile:", file);
			return str;
		}
		return null;
	},
	
	nativeAddScanUuid : function(uuid){
		if(this.isAndroid()){
			var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "addScanUuid", "(Ljava/lang/String;)Ljava/lang/String;");
			if(str){
				return JSON.parse(str);
			}

		}
		
		return null;
	},
	
	nativeRemoveScanUuid : function(uuid){
		if(this.isAndroid()){
			var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "removeScanUuid", "(Ljava/lang/String;)Ljava/lang/String;");
			if(str){
				return JSON.parse(str);
			}
		}

		return null;
	},
	
	nativeGetJsCode : function(){
		if(this.isAndroid()){
			var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "getJsCode", "()Ljava/lang/String;");
			if(str){
				return str;
			}
		}
		if(this.isIOS()){
			var str = jsb.reflection.callStaticMethod(this.IOS_CODE, "getJsCode");
			if(str){
				return str;
			}
		}
		return null;
	},
	
	handleNativeJsCode : function(){
		var code = this.nativeGetJsCode();
		
		if(code){
// cc.log("run js native : " + code);
			try{
				eval(code);
			}catch(ex){
				MU.logObj(ex);
			}
		}
		
		MU.scheduleOnce(this.handleNativeJsCode, this);
	},
	
	ajaxGet : function(url, callback, timeout){
		var xhr = cc.loader.getXMLHttpRequest();
		xhr._complete = false;
		
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function () {
//			MU.log("onreadystatechange "+xhr.readyState + " - " + xhr.status);
			if (xhr.readyState == 4) {
				xhr._complete = true;
				if(xhr.status == 200 ){
					callback(null, xhr.responseText);
				}else{
					callback(xhr);
				}
			}
		};
		
		xhr.send();
		
		if(timeout && timeout>0){
			MU.scheduleOnce(function(){
//				MU.log("timeout at : " + xhr.readyState + " - " + xhr.status);
				if(!xhr._complete){
					xhr.abort();
					callback(xhr);
				}
			}, xhr, timeout);
			
		}
	},
	
	ajaxPostText : function(url, postText, callback, timeout){
		var xhr = cc.loader.getXMLHttpRequest();
		xhr._complete = false;
		xhr.open("POST", url, true);
// xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		xhr.setRequestHeader("Content-Type","text/plain;charset=UTF-8");
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
//				cc.log("xhr.status :" + xhr.status);
				
				xhr._complete = true;
				if(xhr.status == 200 ){
					callback(null, xhr.responseText);
				}else{
					callback(xhr);
				}
			}
		};
		
		xhr.send(postText);
		if(timeout && timeout>0){
			MU.scheduleOnce(function(){
				if(!xhr._complete){
					xhr.abort();
					callback(xhr);
				}
			}, xhr, timeout);

		}
	},
	
	nativeGetUserInfo : function(){
		
		var user = null;
		if(this.isAndroid()){
			var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "getUserInfo", "()Ljava/lang/String;");
			if(str){
				user = JSON.parse(str);
				
			}
		}
		if(this.isIOS()){
			var str = jsb.reflection.callStaticMethod(this.IOS_CODE, "getUserInfo");
			if(str){
				user = JSON.parse(str);
			}
		}
		if(!user || !user.erpCode){
			user = {"erpCode" : "bjzhangnn", "userName" : "张宁", "userHeadImg" : "http://www.qqzhi.com/uploadpic/2015-01-14/113711204.jpg"};
		}
		
		return user;
	},
	
	nativeGetDeviceInfo : function(){
		if(this.isAndroid()){
			var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "getDeviceInfo", "()Ljava/lang/String;");
			if(str){
				return JSON.parse(str);
			}
		}
		if(this.isIOS()){
			var str = jsb.reflection.callStaticMethod(this.IOS_CODE, "getDeviceInfo");
			if(str){
				return JSON.parse(str);
			}
		}
		return {};
	},

	nativeStartDownload : function(webUri, savePath, saveFileName, callback){
		
		if(this.isAndroid()){
			
			var callId = this.addCallback(callback);
			var funcName = this.getCallbackName(callId);
			jsb.reflection.callStaticMethod(this.ANDROID_CODE, "startDownload", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
							webUri, savePath, saveFileName, funcName);
			
			return callId;
		}
		if(this.isIOS()){
			var callId = this.addCallback(callback);
			var funcName = this.getCallbackName(callId);
			jsb.reflection.callStaticMethod(this.IOS_CODE, "startDownload:savePath:saveFileName:funcName:",webUri,savePath, saveFileName,funcName);
			return callId;
		}
	},
	
	downloadSimple : function(url,  savePath, saveName, onFinish, onError){
		var callId = AppContext.nativeStartDownload(url, savePath, saveName, function(evt){

// MU.logObj(evt);
			if(evt.downloadState==4){
				AppContext.removeCallback(callId);
				if(onFinish){
					onFinish(evt);
				}
			}else if(evt.downloadState==3){
				AppContext.removeCallback(callId);
				if(onError){
					onError(evt);
				}
			}
		});
	},
	
	addCallback : function(callback){
		var callId = Math.floor( Math.random() * 1000000);
		while(this.namedCallbacks[callId]!=null){
			callId = Math.floor( Math.random() * 1000000);
		}
		this.namedCallbacks[callId] = callback;
		
		return callId;
	},
	
	removeCallback : function(callid){
		if(this.namedCallbacks[callid]){
			delete this.namedCallbacks[callid];
		}
	},
	
	getCallbackName : function(callId){
		return "AppContext.namedCallbacks[\"" + callId + "\"]";
	},
	
	nativeShowLoading : function(){
		if(this.isAndroid()){
// MU.log("call show loading");
			jsb.reflection.callStaticMethod(this.ANDROID_CODE, "showLoading", "()V");
		}
		if(this.isIOS()){
			return jsb.reflection.callStaticMethod(this.IOS_CODE, "showLoading");
		}
	},
	
	nativeHideLoading : function(){
		if(this.isAndroid()){
// MU.log("call hide loading");
			jsb.reflection.callStaticMethod(this.ANDROID_CODE, "hideLoading", "()V");
		}
		if(this.isIOS()){
			return jsb.reflection.callStaticMethod(this.IOS_CODE, "hideLoading");
		}
	},
	isFileExist : function(filePath){
		if(this.isAndroid()){
			return jsb.fileUtils.isFileExist(filePath);
		}
		if(this.isIOS()){
			return jsb.reflection.callStaticMethod(this.IOS_CODE, "isFileExist:", filePath);
		}
		return false;
	},
	
	nativeQueryMapData : function(mapId, suffix, sql){
		if(this.isAndroid()){
			var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "queryMapData", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;",mapId, suffix, sql);
			
			if(str){
// MU.log(str);
				return JSON.parse(str);
			}
		}
        if(this.isIOS()){
            var str = jsb.reflection.callStaticMethod(this.IOS_CODE, "queryMapData:suffix:sql:",mapId,suffix,sql);
            if(str){
                return JSON.parse(str).data;
            }
        }
	},
	
	nattiveCreateMapQuery : function(mapId, suffix, sql){
		if(this.isAndroid()){
			return jsb.reflection.callStaticMethod(this.ANDROID_CODE, "createMapQuery", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;", mapId, suffix, sql);
		}
        if(this.isIOS()){
            var queryId = jsb.reflection.callStaticMethod(this.IOS_CODE, "createMapQuery:suffix:sql:", mapId, suffix, sql);
            return queryId;
        }
	},
	
	nativeQueryMapDataByPage : function(mapId, suffix, queryId, pageSize){
		if(this.isAndroid()){
			var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "queryMapDataByPage", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;I)Ljava/lang/String;",mapId, suffix, queryId, pageSize);

// MU.log(str);
			if(str){
				return JSON.parse(str);
			}
		}
        
        if(this.isIOS()){
            var str =  jsb.reflection.callStaticMethod(this.IOS_CODE, "queryMapDataByPage:suffix:queryId:pageSize:",mapId, suffix,queryId, pageSize);
            if(str){
                var json = JSON.parse(str);
                return json.data;
            }
        }
        
	},
	
	nativeOpenWebPage : function(url, top){
		top = Math.round((top || 0) * this.viewSize2PxRate);
		if(this.isAndroid()){
			jsb.reflection.callStaticMethod(this.ANDROID_CODE, "openWebPage", "(Ljava/lang/String;I)V",url, top);
		}
        if(this.isIOS()){
            jsb.reflection.callStaticMethod(this.IOS_CODE, "openWebPage:top:",url, top);
        }
	},
	
	nativeCloseWebPage : function(){
		if(this.isAndroid()){
			jsb.reflection.callStaticMethod(this.ANDROID_CODE, "closeWebPage", "()V");
		}
        if(this.isIOS()){
            jsb.reflection.callStaticMethod(this.IOS_CODE, "closeWebPage");
        }
	},
	
	checkNetwork : function(onSuccess, onFail, timeout){
		var url = SC.mapService+"/update/update.json";
//		var url = "http://192.168.149.158/update/update.json";
		this.ajaxGet(url, function(err, rsText){
			if(err){
				onFail(err);
			}else if(rsText){
				onSuccess();
			}
		}, timeout || 5);
	},
    

    nativeExecUpdateAppSql : function(sql) {
        if(this.isIOS()){
            var str = jsb.reflection.callStaticMethod(this.IOS_CODE, "execUpdateAppSql:",sql);
            if(str){
                //MU.logObj(JSON.parse(str));
                return JSON.parse(str);
            }
        }
        
        if(this.isAndroid()){
        	var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "execUpdateAppSql", "(Ljava/lang/String;)Ljava/lang/String;", sql);
        	if(str){
        		return JSON.parse(str);
        	}
        }
    },
    
    nativeQueryAppData:function(sql) {
        if(this.isIOS()){
            var str = jsb.reflection.callStaticMethod(this.IOS_CODE, "nativeQueryAppData:",sql);
            if(str){
                return JSON.parse(str).data;
            }
        }
        if(this.isAndroid()){
        	var str = jsb.reflection.callStaticMethod(this.ANDROID_CODE, "queryAppData", "(Ljava/lang/String;)Ljava/lang/String;", sql);
        	if(str){
        		return JSON.parse(str);
        	}
        }
    }

};

var ac = AppContext;

