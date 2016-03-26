
var UserService = {
	
	getUserInfo : function(){
		return UserContext.values.userInfo;
	},
	
	getStation : function(){
		return UserContext.values.station;
	},
	
	saveStation : function(station, onFinish){
		station.syncTime = 0;
		UserContext.values.station = cc.extend(UserContext.values.station || {}, station);
		UserContext.saveOnLocal();
		this.uploadStation(UserContext.values.station, onFinish);
	},
	
	uploadStation : function(station, onFinish){
		var postData = {};
		postData.stationName = station.name;
		postData.stationX = station.centerX;
		postData.stationY = station.centerY;
		postData.floorNumber = station.floor;
		postData.mapId = station.mapId;
		postData.buildingInfo = station.building;
		postData.userCode = station.erpCode;
		postData.remark = station.desc;

		var postJson = JSON.stringify(postData);
		MU.logObj(station);
		cc.log("post json : " + postJson);
		var url = SC.mapService+"/service/user/uploadStation";
		AppContext.ajaxPostText(url, postJson, function(err, rsText){
			if(err){
				MU.log("uploadStation error : " + JSON.stringify(err));
				onFinish(err);
			}else{
				MU.log("uploadStation result : " + rsText);
				var rs = JSON.parse(rsText);
				if(rs.code==0){
					UserContext.values.station.syncTime = Date.now();
					UserContext.saveOnLocal();
				}
				
				onFinish(null, rsText);
				
			}
		}, 5);
	},
	
	getCarLocate : function(){
		return UserContext.values.carLocate;
	},
	
	saveCarLocate : function(carLocate){
		UserContext.values.carLocate = carLocate;
		return UserContext.saveOnLocal();
	}
	
};
