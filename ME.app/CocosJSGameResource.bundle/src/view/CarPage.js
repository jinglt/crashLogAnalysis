var CarPage = PageView.extend({

	MARKER_CAR : "MARKER_CAR",
	mapView : null,
	carLocate : null,
	
	onCreate : function(){
		this.name = "carPage";
	},
	
	onResume : function(){
		this._super();
		
		MU.scheduleOnce(function(){
			var car = this.carLocate || UserService.getCarLocate();

			if(car==null){
				var page = this;
				Popup.alert("你还没有标记自己的车位\n拖动地图标记“我的车位”", function(){
					page.changeCarLocate();
				});
			}else{
				this.showCar(car);
			}
		}, this);
		
	},

	onPause : function(){
		this._super();
		this.mapView.hideInfoPanel();
		this.mapView.mapLayer.removeMarker(this.MARKER_CAR);
	},

	createCarInfoPanel : function(data){

		var panel = this.mapView.createInfoPanel(data);

		var margin = AppContext.baseWidth/640 * 10;
		var editBtn = new LinkButton("重新标记", AppContext.baseWidth/640 * 30, this.changeCarLocate, this);
//		editBtn.addTouchEventListener(this.changeCarLocate, this);
		UIHelper.addToRelativeLayout(editBtn, panel, ccui.RelativeLayoutParameter.PARENT_TOP_RIGHT, margin * 4, margin * 4);

		return panel;
	},
	
	showCar : function(car){
		var marker = this.mapView.mapLayer.addMarker(this.MARKER_CAR, car.floor, cc.p(car.centerX, car.centerY), 
						UIHelper.createImgMarker(res.icon_car_select, AppContext.baseWidth/12, cc.p(0.5, 0)));
		marker.data = car;

		marker.onMarkerSelect =  (function(mk){
			this.mapView.showInfoPanel(this.createCarInfoPanel(mk.data));
			return true;
		}).bind(this);

		marker.selectMarker();
	},
	
	changeCarLocate : function(){
		if(this.mapView.mapLayer.viewFloor>1){
			this.mapView.mapLayer.drawFloor(1);
		}
		
		this.mapView.selectPointOnMap("我的车位",  function(car){
			if(car==null){
				this.hide();
				return;
			}
			
			if(car.floor>1){
				
				Popup.showMsg("不能将车停到" + MU.getFloorName(car.floor)+ "哦！");
				MU.scheduleOnce(this.changeCarLocate, this, 1);
				return;
			}
			
			car.centerX = car.x;
			car.centerY = car.y;
			car.name = "我的车位";
			car.desc = "保存于：" + MU.formatDate(new Date(), "yyyy-MM-dd hh:mm");
			car.updateTime = Date.now();
			this.carLocate = car;

			var saveResult = UserService.saveCarLocate(car);
			
			if(saveResult && saveResult.code==1){
				Popup.showMsg("保存成功！");
				this.showCar(car);
				
			}else{
				Popup.showMsg("保存出错！");
			}
			
			//记录位置日志
			AppService.logBegin(this.mapView.mapId, "MYCAR", AppService.openId, car.floor, MU.round2(car.centerX)+"|"+ MU.round2(car.centerY) );

		}, this);
	}

});