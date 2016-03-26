
var MapView = PageView.extend({
	_camera : null,
	mapContainer : null,
	mapLayer : null,
	mapId : null,
	mapTheme : null,
	curPage : null,
	queryPage : null,
	naviPage : null,
	waitForClose : false,
	
	onCreate : function(){
		AppService.scheduleLogTask();
		
		this.isMainPage = true;
		
		this.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
		this.setBackGroundColor(cc.hexToColor(AppStyles.background_color));

		this.queryPage = new QueryPage({name : "queryPage", title : "查询", mapView : this});
		this.naviPage = new NaviPage({name : "naviPage", title : "导航", mapView : this});
	},
	
	onShow : function(){
		
		MU.scheduleOnce(function(){
			this.loadMap();
		}, this, 0.1);
		return true;
	},
	
	loadMap : function(){
		
		//beacon点位信息
		var beacons = MapService.queryMapBeacons(this.mapId);
		BeaconService.updateBeaconNodes(this.mapId, beacons);
		
		if(this.mapLayer != null){
			this.mapLayer.removeFromParent(true);
		}
		this.mapLayer = MapService.createMapLayer(this.mapId);
		this.addChild(this.mapLayer, 0);
		PositionService.startTracePosition(this.mapLayer);
		this.mapLayer.showFullMap(true);
		return;
		
	},
	
	createHeaderUI : function(){
		
		var mapName = this.title;
		this.title = "Follow me";
		var panel = this._super();
		
		var width = panel.width;
		var height = panel.height;

		var searchBtn = new IconButton(res.icon_search, "", height * 1.5, height);
		searchBtn.getButton().loadTexturePressed(res.btn_red_pressed_9);
		searchBtn.addTouchEventListener(function(){this.queryPage.show()}, this);
		
		UIHelper.addToRelativeLayout(searchBtn, panel, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL);
		
		return panel;
	},
	
	createContentUI : function(){
		
		var margin = AppContext.baseWidth/40;
		var layout = new ccui.Layout();
		layout.setLayoutType(ccui.Layout.RELATIVE);
		
		//定位按钮
		var box = new ccui.Layout();
		box.setLayoutType(ccui.Layout.LINEAR_HORIZONTAL);
		var locBtn = new LocateButton(this);
		locBtn.name = "LocateButton";
		
		UIHelper.addToLinearLayout(locBtn, box, ccui.LinearLayoutParameter.BOTTOM);
		UIHelper.addToLinearLayout(UIHelper.createMarginWidget(margin, locBtn.height), box, ccui.LinearLayoutParameter.BOTTOM);

		//比例尺
		var scaleBar = new ScaleBar(this);
		scaleBar.name = "ScaleBar";
		UIHelper.addToLinearLayout(scaleBar, box, ccui.LinearLayoutParameter.BOTTOM, -margin/2);

		var locSize = locBtn.getContentSize();
		var scaleSize = scaleBar.getContentSize();

		box.setContentSize(cc.size(locSize.width + margin + scaleSize.width, Math.max( locSize.height, scaleSize.height)));
		UIHelper.addToRelativeLayout(box, layout, ccui.RelativeLayoutParameter.PARENT_LEFT_BOTTOM, margin);

		var compass = new Compass(this);
		compass.name = "Compass";
		UIHelper.addToRelativeLayout(compass, layout,ccui.RelativeLayoutParameter.PARENT_TOP_LEFT, margin);

		var floorSelector = new FloorSelector(this);
		floorSelector.name = "floorSelector";
		UIHelper.addToRelativeLayout(floorSelector, layout,ccui.RelativeLayoutParameter.PARENT_TOP_RIGHT, margin);

		var zoomBar = new ZoomBar(this);
		UIHelper.addToRelativeLayout(zoomBar, layout,ccui.RelativeLayoutParameter.PARENT_RIGHT_BOTTOM, margin);
		
		return layout;
	},
	
	createFooterUI : function(){
		return this.createMenusUI();
	},
	
	createMenusUI : function(){
		var margin = AppContext.baseWidth/640 * 10;
		var width = AppContext.viewSize.width;
		var height = AppContext.dp2Px(54) + margin;

		var layout = UIHelper.createPanel(width, height);
		layout.setLayoutType(ccui.Layout.RELATIVE);
		
		var backWin = UIHelper.createPanel(width - margin * 2, height - margin, res.window_back_9);
		UIHelper.addToRelativeLayout(backWin, layout, ccui.RelativeLayoutParameter.PARENT_TOP_CENTER_HORIZONTAL);

		var hbox = new ccui.HBox();
		hbox.setContentSize(width - margin*4, height - margin * 3);
		UIHelper.addToRelativeLayout(hbox, layout, ccui.RelativeLayoutParameter.PARENT_TOP_CENTER_HORIZONTAL, margin);

		var btnW = hbox.width/2;
		var btnH = hbox.height;

		var naviButton  = new IconButton(res.icon_navi, "导航", btnW, btnH);
//		naviButton.getButton().setCapInsetsPressedRenderer(cc.rect(0, 0, 23, 46));
		naviButton.addTouchEventListener(function(){
			this.naviPage.show();
		}, this);
		hbox.addChild(naviButton);

		hbox.addChild(UIHelper.createVSplit(0, btnH));
		var homeButton  = new IconButton(res.icon_more, "更多", btnW, btnH);
//		homeButton.getButton().setCapInsetsPressedRenderer(cc.rect(23, 0, 23, 46));
		homeButton.addTouchEventListener(function(){
			new PersonalPage({name : "personalPage", title : "更多", mapView : this}).show();
		}, this);
		hbox.addChild(homeButton);

		return layout;
	},
	
	createInfoPanel : function(data){
		
		var margin = AppContext.baseWidth / 640 * 10;
		var pwidth = AppContext.viewSize.width - margin * 2;
		var pheight = AppContext.baseWidth / 640 * 202 + margin * 2;
		
		var layout = UIHelper.createPanel(pwidth + margin * 2, pheight + margin);
		layout.setLayoutType(ccui.Layout.RELATIVE);
		
		//panel
		var panel = UIHelper.createPanel(pwidth, pheight, res.window_back_9);
		panel.setLayoutType(ccui.Layout.RELATIVE);
		UIHelper.addToRelativeLayout(panel, layout, ccui.RelativeLayoutParameter.PARENT_BOTTOM_CENTER_HORIZONTAL, margin);
		
		
		var cwidth = pwidth - margin * 2;
		var cheight = pheight - margin * 2;
		
		var box = new ccui.Layout();
		box.setLayoutType(ccui.Layout.RELATIVE);
		box.setContentSize(cwidth, cheight);
		UIHelper.addToRelativeLayout(box, panel, ccui.RelativeLayoutParameter.CENTER_IN_PARENT, 0);
		
		//title
		var title = UIHelper.createLabelWidget(data.name + "", AppContext.baseWidth / 640 * 30, cc.hexToColor(AppStyles.font_normal_color), AppStyles.font_title);
		UIHelper.addToRelativeLayout(title, box, ccui.RelativeLayoutParameter.PARENT_TOP_LEFT, margin * 2, margin * 3);
		
		//detailPage
		for(var i=0; i< AppContext.appProps.detailPages.length; i++){
			var pgData = AppContext.appProps.detailPages[i];
			if(pgData.refType==data.refType){
				var pTop = this.headerUI.height;
				var url = SC.mapService + "/service/map/getParkingInfo?"
				+"reftype="+encodeURIComponent(data.refType)
				+"&refid="+encodeURIComponent(data.refId)
				+"&mapId=" + encodeURIComponent(this.mapLayer.mapId);
//				MU.log(url);
				var pageBtn = new LinkButton("详情", AppContext.baseWidth/640 * 30, function(){
					new WebPage({title : data.name + "-详情",  url : url}).show();
				}, this);
				UIHelper.addToRelativeLayout(pageBtn, box, ccui.RelativeLayoutParameter.PARENT_TOP_RIGHT, margin * 2, margin * 2);
				break;
			}
		}
		
		//desc
		var contentText = MU.getFloorName(data.floor) + " " + this.mapLayer.mapStyles.getRefTypeDesc(data.refType);
		if(data.desc){
			contentText += " " + data.desc;
		}
		var content = UIHelper.createLabelWidget(contentText, AppContext.baseWidth / 640 * 26, cc.hexToColor(AppStyles.font_tip_color));
		UIHelper.addToRelativeLayout(content, box, ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL, margin * 2);
		
		//navi
		var btnHeight = AppContext.baseWidth / 640 * 76;
		var naviBox = new ccui.HBox();
		naviBox.setContentSize(cwidth, btnHeight);
		var startBtn = new IconButton(res.icon_start, "从这走", (cwidth)/2, btnHeight);
		startBtn.addTouchEventListener(this.onNaviStartSelect, this, data);
		var endBtn = new IconButton(res.icon_end, "到这去", (cwidth)/2, btnHeight);
		endBtn.addTouchEventListener(this.onNaviEndSelect, this, data);
		naviBox.addChild(startBtn);
		naviBox.addChild(endBtn);
		UIHelper.addToRelativeLayout(naviBox, box, ccui.RelativeLayoutParameter.PARENT_BOTTOM_CENTER_HORIZONTAL);
		
		return layout;
	},
	
	onNaviStartSelect : function(data){
		this.hideInfoPanel();
		this.setNaviStartData(data);
	},
	
	onNaviEndSelect : function(data){
		this.hideInfoPanel();
		this.naviPage.setStartData(PositionService.currentPosition);
		this.setNaviEndData(data);
	},
	
	showInfoPanel : function(panel){
		
		this.footerUI.removeFromParent(true);
		this.footerUI = panel;
		this.footerLayout.addChild(this.footerUI);
		this.updateLayout();
	},
	
	showInfoData : function(data){
		
		this.showInfoPanel(this.createInfoPanel(data));
	},
	
	hideInfoPanel : function(){
		
		this.footerUI.removeFromParent(true);
		this.footerUI = this.createMenusUI();
		this.footerLayout.addChild(this.footerUI);
		this.updateLayout();
	},
	
	onExit : function(){
		this._super();
		PositionService.stopTracePosition();
//		cc.director.setProjection(cc.Director.PROJECTION_2D);
	},
	
	onResume : function(){
		this.hideInfoPanel();
	},
	
	onHide : function(){
		
		if(true || this.waitForClose==true){
			MU.scheduleOnce(function(){
				AppContext.nativeExitApp();
			});
			return false;
		}else{
			this.waitForClose = true;
			MU.scheduleOnce(function(){
				this.waitForClose = false;
			}, this, 1);
			Popup.showMsg("再按一次退出！");
			return false;
		}
	},
	
	queryForEvent : function(selector, target){
		this.queryPage.queryForEvent(selector, target);
	},
	
	setNaviStartData : function(data){
		this.naviPage.show();
		this.naviPage.setStartData(data);
	},
	
	setNaviEndData : function(data){
		this.naviPage.show();
		this.naviPage.setEndData(data);
	},
	
	selectPointOnMap : function(pointName, onPointSelect, target){
		var selectPointPage = new SelectPointPage({name : "selectPointPage", pointName : pointName, mapView : this});
		selectPointPage.onPointSelect = onPointSelect.bind(target);
		selectPointPage.show();
	}
});

