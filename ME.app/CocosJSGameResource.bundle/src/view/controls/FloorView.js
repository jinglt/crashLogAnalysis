var FloorView = ccui.Widget.extend({
	mapView : null,
	listView : null,
	mainBtn : null,
	selectBtn : null,
	initWidth : 0,
	floors : [],
	
	ctor : function(mapView){
		this._super();
		this.mapView = mapView;
		
		this.initWidth =  AppContext.baseWidth/8;
		var lheight = this.initWidth;
		this.setContentSize(this.initWidth, lheight);

		this.initWithMap();
		
	},
	
	initWithMap : function(){
		if(this.floors.length==0 && this.mapView.mapLayer){
			var floors = [];
			if(this.mapView.mapLayer!=null){
				for(var f in this.mapView.mapLayer.mapInfo.floorMap){
					if(f!=0){
						floors.push(f);
					}
				}
			}

			floors.sort(function(a, b){
				return b-a;
			});

			this.floors = floors;

			cc.eventManager.addCustomListener(MapEvents.MAP_VIEW_CHANGED, this.onMapFloorChanged.bind(this));
			
			
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
		
		// Create the list view
		var listView = new ccui.ListView();
		this.listView = listView;
		// set list view ex direction
		listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
		listView.setTouchEnabled(true);
		listView.setBounceEnabled(true);
		listView.setBackGroundImage(res.btn_small_9);
		listView.setBackGroundImageScale9Enabled(true);
		listView.setContentSize(lwidth, lheight * Math.min(this.floors.length, 4) + lheight * 0.1 * (Math.min(this.floors.length, 4)-1));
		listView.addEventListener(this.selectedItemEvent, this);
		listView.y = -listView.height;
		listView.visible = false;
		this.addNode(listView, 0);
		
		//
		//
		var idx = 0;
		for(var i=0; i< this.floors.length; i++){
			var fname = this.floors[i];
			
			
			if(i>0){
				listView.insertCustomItem(UIHelper.createHSplit(lwidth, lheight * 0.1), idx++);
			}
			
			var button = new ccui.Button();
			button.setName("TextButton");
			button.setTouchEnabled(true);
			button.setScale9Enabled(true);
			button.loadTextures("", res.btn_small_blue_9);
			button.setContentSize(lwidth, lheight);
			button.setTitleFontSize(lheight * 0.4);
			button.setTitleColor(cc.hexToColor(AppStyles.font_tip_color));
			button.setTitleFontName(AppStyles.font_normal);
			button.setTitleText(MU.getFloorName(fname));
			button.floor = fname;
			listView.insertCustomItem(button, idx++);
			
		}
		
	},
	
	mainBtnTouched: function (sender, type) {
		switch (type) {
		case ccui.Widget.TOUCH_BEGAN:
			break;
		case ccui.Widget.TOUCH_MOVED:
			break;
		case ccui.Widget.TOUCH_ENDED:
			
			this.listView.visible = !this.listView.visible;
// this.mainBtn.visible = !this.listView.visible;

			break;
		case ccui.Widget.TOUCH_CANCELED:
			break;

		default:
			break;
		}
	},
	
	selectedItemEvent: function (sender, type) {
		switch (type) {
// case ccui.ListView.EVENT_SELECTED_ITEM:
		case ccui.ListView.ON_SELECTED_ITEM_END : 
			var listViewEx = sender;
			var newBtn = listViewEx.getItem( listViewEx.getCurSelectedIndex());
			var floor = newBtn.floor;
			
			if(floor!=null){
				this.mapView.mapLayer.drawFloor(floor);
// if(this.selectBtn){
// this.selectBtn.setTitleColor(cc.hexToColor("#666666"));
// this.selectBtn.loadTextureNormal("");
// }
// newBtn.setTitleColor(cc.hexToColor("#FFFFFF"));
// newBtn.loadTextureNormal(res.btn_blue_9);
				this.selectBtn = newBtn;
			}
			
			this.listView.visible = false;
			this.mainBtn.visible = true;
			break;

		default:
			break;
		}
	},
	
	onMapFloorChanged : function(evtObj){
		var udata = evtObj.getUserData();
		
		if(udata.floorChanged){
			
			this.mainBtn.setTitleText(MU.getFloorName(udata.map.viewFloor));
		}
		
		
// if(udata.lastFloor != udata.floor){
//			
//			
// // var idx = 0;
// //
// // for(var i in this.floors){
// // if(this.floors[i]==udata.floor){
// // idx = i;
// // break;
// // }
// // }
//			
//			
// this.mainBtn.setTitleText(MU.getFloorName(udata.floor));
// // cc.log("floor changed " + udata.floor + ", at " + idx);
// }
	
	}
	
	
});

