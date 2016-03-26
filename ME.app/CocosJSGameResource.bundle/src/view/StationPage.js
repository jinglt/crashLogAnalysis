var StationPage = PageView.extend({

	MARKER_STATION : "MARKER_STATION",
	mapView : null,
	
	onCreate : function(){
		this.name = "stationPage";
	},
	
	onPause : function(){
		this._super();
		this.mapView.hideInfoPanel();
		this.mapView.mapLayer.removeMarker(this.MARKER_STATION);
	},
	
	onResume : function(){
		this._super();
		
		MU.scheduleOnce(function(){
			var station = UserService.getStation();

			if(station==null || station.mapId==null){
				var page = this;
				Popup.confirm("你还没有标记自己的工位\n拖动地图标记“我的工位”", function(){
					page.changeStation();
				},function(){
					page.hide();
				});
			}else{
				this.showStation(station);
			}
		}, this);
		
	},
	
	showStation : function(station){
		var marker = this.mapView.mapLayer.addMarker(this.MARKER_STATION, station.floor, cc.p(station.centerX, station.centerY), 
						UIHelper.createImgMarker(res.icon_station_select, AppContext.baseWidth/12, cc.p(0.5, 0)));
		marker.data = station;

		marker.onMarkerSelect =  (function(mk){
			this.mapView.showInfoPanel(this.createStationInfoPanel(mk.data));
			return true;
		}).bind(this);

		marker.selectMarker();
	},

	createStationInfoPanel : function(data){
		
		data = cc.extend({},data);
		
		data.name = data.name || "我的工位";
		data.desc = data.desc || "说点什么..  （点击可编辑）";

		var panel = this.mapView.createInfoPanel(data);

		var margin = AppContext.baseWidth/640 * 10;
		var posBtn = new LinkButton("重新标记", AppContext.baseWidth/640 * 30, this.changeStation, this);
		UIHelper.addToRelativeLayout(posBtn, panel, ccui.RelativeLayoutParameter.PARENT_TOP_RIGHT, margin * 4, margin * 4);
		
		var editBtn = new IconButton(null, "", panel.width - margin * 8, AppContext.baseWidth/640 * 50);
		editBtn.addTouchEventListener(this.changeSign, this);
		UIHelper.addToRelativeLayout(editBtn, panel, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL, margin * 4);
		
		return panel;
	},
	

	
	changeSign : function(){
		
		var page = this;
		var station = UserService.getStation() || {};
		Popup.popupInput("请输入个性签名", station.desc || "", function(txt){
			
			
			if(station.desc==txt){
				return;
			}
			
			station.desc = txt;
			station.updateTime = Date.now();
			
			page.saveStation(station);
			
			//记录签名日志
			AppService.logBegin(page.mapView.mapId, "MYSTATION", AppService.openId,"SIGN",station.floor);
			
		});
		
	},
	
	saveStation : function(station){
		var page = this;
		UserService.saveStation(station, function(err, msgJson){

			if(msgJson){
				Popup.showMsg(JSON.parse(msgJson).msg);
			}else if(err){
				Popup.showMsg("上传工位失败，请在"+page.mapView.mapLayer.mapInfo.mapName+"内网使用此功能！");
			}
			page.showStation(station);
		});

	},
	
	changeStation : function(){
		
		this.mapView.selectPointOnMap("我的工位",  function(position){

			if(position==null){
				this.hide();
				return;
			}
			
			var userInfo = UserService.getUserInfo();
			var station = UserService.getStation() || {};
			
			station.centerX = position.x;
			station.centerY = position.y;
			station.mapId = position.mapId;
			station.floor = position.floor;
			station.name =  userInfo.userName;
			station.desc = station.desc;
			station.erpCode = userInfo.erpCode;
			station.updateTime = Date.now();
			
			this.saveStation(station);

			//记录位置日志
			AppService.logBegin(this.mapView.mapId, "MYSTATION", AppService.openId, "POSITION", station.floor );
		}, this);
	}

});