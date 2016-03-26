var FloorSelector = ccui.Widget.extend({
	mapView : null,
	mainBtn : null,
	mainLayer : null,
	floorList : null,
	selectFloorItem : null,
	buildingList : null,
	initWidth : 0,
	floors : [],
	
	ctor : function(mapView){
		this._super();
		this.mapView = mapView;
		
		this.initWidth =  AppContext.dp2Px(40);
		var lheight = this.initWidth;
		this.setContentSize(this.initWidth, lheight);
		cc.eventManager.addCustomListener(MapEvents.MAP_VIEW_CHANGED, this.onMapFloorChanged.bind(this));
		this.initWithMap();
	},
	
	initWithMap : function(){
		if(this.floors.length==0 && this.mapView.mapLayer){
			var floors = [];
			if(this.mapView.mapLayer!=null){
				floors = [].concat(this.mapView.mapLayer.mapInfo.floorScope);
			}
			floors.sort(function(a, b){
				return b-a;
			});

			this.floors = floors;

			this.initView();
		}else{
			MU.scheduleOnce(this.initWithMap, this, 1);
		}
	},
	
	initView : function(){
		
		var lwidth = this.initWidth;
		var lheight = lwidth;
		
		// mainBtn
		var mainBtn = new ccui.Button();
		this.mainBtn = mainBtn;
		//
		mainBtn.setName("mainBtn");
		mainBtn.setTouchEnabled(true);
		mainBtn.setScale9Enabled(true);
		mainBtn.loadTextures(res.btn_red_9, res.btn_red_pressed_9);
		mainBtn.setContentSize(lwidth, lheight);
		mainBtn.setTitleFontSize(lheight * 0.4);
		mainBtn.setTitleColor(cc.hexToColor(AppStyles.font_title_color));
		mainBtn.setTitleFontName(AppStyles.font_title);
		if(this.mapView.mapLayer){
			mainBtn.setTitleText(MU.getFloorName(this.mapView.mapLayer.viewFloor));
		}
		mainBtn.x = lwidth/2;
		mainBtn.y = lheight/2;
		this.addNode(mainBtn, 1);
		this.mainBtn.addTouchEventListener(this.mainBtnTouched, this);
		
		this.mainLayer = this.createSelectLayer();
		this.mainLayer.visible=false;
		cc.director.getRunningScene().addChild(this.mainLayer);
		//
		var itemHeight = AppContext.baseWidth/640 * 64;
		var idx = 0;
		for(var i=0; i< this.floors.length; i++){
			var fname = this.floors[i];
			
			var labelUI = new ccui.Button();
			labelUI.setTouchEnabled(true);
			labelUI.setScale9Enabled(true);
			labelUI.loadTexturePressed(res.btn_pressed_nb_sm_9);
			labelUI.setSwallowTouches(false);
			labelUI.attr({
				anchorX : 0.5,
				anchorY : 0.5,
				width : this.floorList.width,
				height : itemHeight
			});
			labelUI.floor = fname;
			
			var txt = UIHelper.createLabelWidget(MU.getFloorName(fname), itemHeight/2, cc.hexToColor(AppStyles.font_weak_color));
			txt.x = labelUI.width/2;
			txt.y = labelUI.height/2;
			labelUI.addChild(txt);
			labelUI.floor = fname;
			labelUI.label = txt;
			this.floorList.addItem(labelUI);
			
			labelUI.addTouchEventListener(function (sender, type) {
					switch (type) {
						case ccui.Widget.TOUCH_ENDED:
							this.floorList.setSelectedItem(sender);
							this.okBtnTouched();
							break;
						default:
							break;
					}
			}, this);
			
			if(this.floors[i]==this.mapView.mapLayer.viewFloor){
				idx = i;
			}
		}
		
		this.floorList.setSelectIedtemIndex(idx);
	},
	
	createSelectLayer : function(){
		
		var pMargin = AppContext.baseWidth/640 * 10;
		var pWidth = AppContext.baseWidth/640 * 598;
		var pHeight = AppContext.baseWidth/640 * 379;
		var btnHeight = AppContext.baseWidth/640 * 70;
		var listHeight = AppContext.baseWidth/640 * 239;
		var itemHeight = AppContext.baseWidth/640 * 64;
		//
		var panel = UIHelper.createPanel(pWidth + pMargin * 2, pHeight + pMargin * 2, res.window_back_9);
		panel.setLayoutType(ccui.Layout.RELATIVE);
		panel.anchorX = 0.5;
		panel.anchorY = 0.5;
		panel.x = AppContext.viewSize.width/2;
		panel.y = AppContext.viewSize.height * 0.55;
		//
		var cbox = new ccui.VBox();
		cbox.setContentSize(pWidth, pHeight);
		UIHelper.addToRelativeLayout(cbox, panel, ccui.RelativeLayoutParameter.CENTER_IN_PARENT);
		//
		var titleBox = UIHelper.createMarginWidget(pWidth, btnHeight);
		var titleTxt = UIHelper.createLabelWidget("请选择你要去的楼层", btnHeight/2, null, AppStyles.font_title);
		titleTxt.x = pWidth/2;
		titleTxt.y = btnHeight/2;
		titleBox.addChild(titleTxt);
		cbox.addChild(titleBox);
		//split
//		cbox.addChild(UIHelper.createHSplit(pWidth, 0, null, null, 0));
		//list
		var listBox = UIHelper.createPanel(pWidth, listHeight);
		listBox.setLayoutType(ccui.Layout.RELATIVE);
		cbox.addChild(listBox);
		//building
		var buildingList = UIHelper.createListView(null);
		buildingList.setContentSize(pWidth/2, listHeight);
		this.buildingList = buildingList;

		var floorList = new ScrollButton(pWidth, listHeight);
		floorList.onSelectChange = this.onFloorItemSelect.bind(this);
		this.floorList = floorList;
		UIHelper.addToRelativeLayout(floorList, listBox, ccui.RelativeLayoutParameter.CENTER_IN_PARENT);
		//selectBox
//		var selectBox = UIHelper.createPanel(pWidth, itemHeight);
//		selectBox.setLocalZOrder(200);
		UIHelper.addToRelativeLayout(UIHelper.createHSplit(pWidth, 0, null, null, 0), listBox, ccui.RelativeLayoutParameter.PARENT_TOP_CENTER_HORIZONTAL, (listHeight - itemHeight)/2);
		UIHelper.addToRelativeLayout(UIHelper.createHSplit(pWidth, 0, null, null, 0), listBox, ccui.RelativeLayoutParameter.PARENT_BOTTOM_CENTER_HORIZONTAL, (listHeight - itemHeight)/2);
		//
		cbox.addChild(UIHelper.createHSplit(pWidth, 0, null, null, 0));
		//
		var okBtn = new IconButton(res.icon_correct,"", pWidth, btnHeight);
		okBtn.addTouchEventListener(this.okBtnTouched, this);
		cbox.addChild(okBtn);
		//
		var layer = Popup.createBackLayer();
		layer.addChild(panel);
		
		return layer;
	},
	
	onFloorItemSelect : function(item){
		if(this.selectFloorItem!=null){
			this.selectFloorItem.label.setColor(cc.hexToColor(AppStyles.font_weak_color));
			this.selectFloorItem = null;
		}
		this.selectFloorItem = item;
		item.label.setColor(cc.hexToColor(AppStyles.font_normal_color));
	},
	
	okBtnTouched : function(){
		if(this.mainLayer){
			this.mainLayer.visible=false;
			
			var floor = this.selectFloorItem.floor;

			if(floor!=null && floor!=this.mapView.mapLayer.viewFloor){
				this.mapView.mapLayer.drawFloor(floor);
			}
		}
	},
	
	mainBtnTouched: function (sender, type) {
		switch (type) {
		case ccui.Widget.TOUCH_BEGAN:
			break;
		case ccui.Widget.TOUCH_MOVED:
			break;
		case ccui.Widget.TOUCH_ENDED:
			
			this.mainLayer.visible = !this.mainLayer.visible;
			
			if(this.mainLayer.visible){
				AppContext.pushBackKeyCallback(function(){
					
					if(this.mainLayer.visible){
						this.mainLayer.visible = false;
					}else{
						return true;
					}
					
				}, this);
			}
			
			break;
		case ccui.Widget.TOUCH_CANCELED:
			break;

		default:
			break;
		}
	},
	
	onMapFloorChanged : function(evtObj){
		
		var udata = evtObj.getUserData();
		
		if(udata.floorChanged && this.floorList){
			this.mainBtn.setTitleText(MU.getFloorName(udata.map.viewFloor));
			
			var idx = -1;
			for(var i=0; i<this.floors.length; i++){
				if(this.floors[i]==udata.map.viewFloor){
					this.floorList.setSelectIedtemIndex(i);
					break;
				}
			}
		}
	}
	
	
});

