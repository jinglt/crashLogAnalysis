var AppService = {
				openId : null,
				taskInteval : 60,
				taskDoing : false
};

AppService.logBegin = function(mapId,mainFunction,subFunction,value1,value2){
//	MU.log("logBegin " + mainFunction);
	var erp = UserContext.values.userInfo.erpCode;
	var platform = cc.sys.os;
	var brand = AppContext.deviceInfo.brand;
	var model = AppContext.deviceInfo.model;
	var osVersion = AppContext.deviceInfo.osVersion;
	var osVersionNo = AppContext.deviceInfo.osVersionNo;
	var startTime = Date.now();
	var endTime = 0;
	
	var sql = "insert into app_log(erp,platform,brand,model,osVersion,osVersionNo,mapId,mainFunction,subFunction,startTime,endTime,value1,value2) values('"
		+erp+"','"+platform+"','"+brand+"','"+model+"','"+osVersion+"','"+osVersionNo+"','"+mapId+"','"+mainFunction+"','"+subFunction+"',"+startTime+","+endTime+",'"+value1+"','"+value2+"')";
	
	try{
		var res = AppContext.nativeExecUpdateAppSql(sql);
		return res.lastInsertId;
	}catch(ex){
		MU.logObj(ex);
		return -1;
	}

}


AppService.logEnd = function(rowid){
	var endTime = Date.now();
	var sql = "update app_log set endTime="+endTime+" where rowid="+rowid;
	AppContext.nativeExecUpdateAppSql(sql);
}

AppService._postLogs = function(postObj, postLogTime){
//	MU.log("_postLogs : " + JSON.stringify(postObj));
	
	var url = SC.mapService + "/service/log/uploadLog";
	
	AppContext.ajaxPostText(url, JSON.stringify(postObj), function(err, rsText){
		if(err){
			MU.log("_postLogs error : " + JSON.stringify(err));
		}else{
//			MU.log("_postLogs result : " + rsText);
			try{
				var rs = JSON.parse(rsText);
				if(rs.code==0){
					var sql = "delete from app_log where startTime<="+(parseInt( postLogTime)+1);
//					 MU.log("sql--->>"+sql);
					AppContext.nativeExecUpdateAppSql(sql);
				}
			}catch(e){

			}
		}
		
		AppService.taskDoing = false;
		
	}, AppService.taskInteval/2);
}

AppService.scheduleLogTask = function(){
	
	if(AppService.taskDoing){
		MU.scheduleOnce(AppService.scheduleLogTask, AppService,  10);
		return;
	}
	
	AppService.taskDoing = true;
	
	if(this.openId==null){
		this.openId = MU.formatDate(new Date(), "yyyyMMddhh_") + parseInt(Math.random() * 10000);
//		AppService.logBegin("", "OPEN", AppService.openId, "", "");
	}
	// 心跳记录
	var posLog = "";
	if(PositionService.currentPosition){
		var pos = PositionService.currentPosition;
		posLog = pos.mapId + "|" +pos.floor + "|" + MU.round2(pos.x) + "|" + MU.round2(pos.y);
	}
	AppService.logBegin("", "HEARTBEAT", AppService.openId, posLog, AppContext.VERSION);
	
	//查询本地日志
	var url = SC.mapService + "/service/log/uploadLog";
	var sql = "select rowid,erp,platform,brand,model,osVersion,osVersionNo,mapId,mainFunction,subFunction,startTime,endTime,value1,value2,isUploaded from app_log where isUploaded = 0 order by rowid limit 30";
	var logJson = AppContext.nativeQueryAppData(sql);
	
	var postObj = {};
	postObj.operations=[];
	var lastJsonKey = null;
	var postLogTime = null;
    if(logJson && logJson.length>0){
       for(var i =0; i< logJson.length; i++){
//    	   MU.log("startTime : "+logJson[i][10]);
    	   // erp,platform,brand,model,osVersion,osVersionNo
           var currentJsonKey = logJson[i][1]+logJson[i][2]+logJson[i][3]+logJson[i][4]+logJson[i][5]+logJson[i][6];
           
           // 判断是否相同机型用户信息
           if(lastJsonKey!=null && currentJsonKey !=lastJsonKey){
//               MU.log("机型变化了："+lastJsonKey + " -> " + currentJsonKey);
               postLogTime = logJson[i-1][10];
               AppService._postLogs(postObj, postLogTime);
                // reset
                postObj = {};
                postObj.operations=[];
           }
           // 机型信息
           postObj.erp=logJson[i][1];
           postObj.platform=logJson[i][2];
           postObj.brand=logJson[i][3];
           postObj.model=logJson[i][4];
           postObj.osVersion=logJson[i][5];
           postObj.osVersionNo=logJson[i][6];
           
           // 日志内容
           var opObj = {};
           opObj.mapId=logJson[i][7];
           opObj.mainFunction=logJson[i][8];
           opObj.subFunction=logJson[i][9];
           opObj.startTime=logJson[i][10];
           opObj.endTime=logJson[i][11];
           opObj.value1=logJson[i][12];
           opObj.value2=logJson[i][13];
           postObj.operations.push(opObj);
           
           lastJsonKey = currentJsonKey;
           postLogTime = logJson[i][10];
       }
      
       AppService._postLogs(postObj, postLogTime);
   }

    MU.scheduleOnce(AppService.scheduleLogTask, AppService, AppContext.appProps.logTaskInterval || 60);
}