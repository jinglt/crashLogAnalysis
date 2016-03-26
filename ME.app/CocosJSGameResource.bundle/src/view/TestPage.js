var TestPage = PageView.extend({

	input : null,
	listView : null,
	keysView : null,
	queryhisKey : "TestPage_queryhis_list",
	onQueryResultSelect : null,
	queryHisKeys : {},
	filterKey : null,

	onCreate : function(){
		this.title = null;
//		this.removeOnHide = true;
	},

	onShow : function(){
		this.contentUI.visible = true;
		this.input.setString("test");
		this.input.attachWithIME();
		this.schedule(this.showBeaconsList, 1);
		return true;
	},

	onHide : function(){

		this.input.didNotSelectSelf();
		this.clearResults();
		this.unschedule(this.showBeaconsList);
		MU.scheduleOnce(function(){
			this.removeFromParent(true);
		}, this);
		return true;
	},

	createHeaderUI : function(){

		var width = AppContext.viewSize.width;
		var height = AppContext.baseWidth / 8;

		var panel = this._super();

		var backBtn = panel.getChildByName("backBtn");

		var queryBox = new ccui.HBox();
		queryBox.setContentSize(width - backBtn.width, height*0.8);

		var queryBtn = new IconButton(res.btn_search, "搜索", height * 2, height * 0.8);

//		UIHelper.addToRelativeLayout(queryBtn, panel, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL, 0);
		queryBtn.addTouchEventListener(this.queryElements, this);
		queryBox.addChild(queryBtn,1);

		var input = new TextInput("查询Beacon条件..", queryBox.width - queryBtn.width, height*0.8);
//		UIHelper.addToRelativeLayout(input, panel, ccui.RelativeLayoutParameter.CENTER_IN_PARENT, 0);

		input.onTextChanged = (function(text){
			if(text==""){
				this.clearResults();
				this.listView.visible = true;
			}
		}).bind(this);

		input.onTextFocus = (function(){
			this.showQueryKeys();
		}).bind(this);

		queryBox.addChild(input,0);
		this.input = input;

		UIHelper.addToRelativeLayout(queryBox, panel, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL, 0);

		return panel;
	},
	
	showQueryKeys : function(){

		this.keysView.removeAllItems();

		var keys = this.queryHisKeys;

		
		var i=0;
		for(var key in keys){
			
			var keyHeight = AppContext.baseWidth/8;
			var keyPanel = UIHelper.createPanel(AppContext.viewSize.width, keyHeight, res.btn_normal_9);
			keyPanel.setLayoutType(ccui.Layout.RELATIVE);
			keyPanel.setTouchEnabled(true);
			keyPanel.addChild(UIHelper.createButtonEmpty(AppContext.viewSize.width, keyHeight));
			
			var rpanel = keyPanel;
			rpanel.key = key;
			var content = UIHelper.createLabelWidget(key, AppContext.baseWidth/20);
			UIHelper.addToRelativeLayout(content, rpanel, ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL, AppContext.baseWidth/8);
//			var count = UIHelper.creatLabelWidget("有 " +d.count + " 个结果", cc.color(150, 150, 150), AppContext.baseWidth/22);
//			UIHelper.addToRelativeLayout(count, rpanel, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL, AppContext.baseWidth/8);
			this.keysView.insertCustomItem(keyPanel, 0);
			i++;
		}


		this.contentUI.visible = true;
		this.keysView.visible = true;
	},

	createContentUI : function(){

		var layout = new ccui.Layout();

		//查询结果
		var listView = new ccui.ListView();
		this.listView = listView;
		// set list view ex direction
		listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
		listView.setTouchEnabled(true);
		listView.setBounceEnabled(true);
		listView.setBackGroundImage(res.panel_bg_9);
		listView.setBackGroundImageScale9Enabled(true);
		listView.setItemsMargin(AppContext.baseWidth / 80);
		listView.addEventListener(this.listViewItemSelect, this);


		var resultPanel = UIHelper.createPanel(AppContext.viewSize.width, AppContext.baseWidth * 0.3, res.btn_normal_9);
		resultPanel.setLayoutType(ccui.Layout.RELATIVE);
		resultPanel.setTouchEnabled(true);
		resultPanel.addChild(UIHelper.createButtonEmpty(AppContext.viewSize.width, AppContext.baseWidth * 0.3));
		listView.setItemModel(resultPanel);

		layout.addChild(listView);

		//查询记录
		var keysView = new ccui.ListView();
		this.keysView = keysView;

		keysView.setDirection(ccui.ScrollView.DIR_VERTICAL);
		keysView.setTouchEnabled(true);
		keysView.setBounceEnabled(true);
		keysView.setBackGroundImage(res.panel_bg_9);
		keysView.setBackGroundImageScale9Enabled(true);
		keysView.setItemsMargin(AppContext.baseWidth / 80);
		keysView.addEventListener(this.keysViewItemSelect, this);

		var keyHeight = AppContext.baseWidth/8;
		var keyPanel = UIHelper.createPanel(AppContext.viewSize.width, keyHeight, res.btn_normal_9);
		keyPanel.setLayoutType(ccui.Layout.RELATIVE);
		keyPanel.setTouchEnabled(true);
		keyPanel.addChild(UIHelper.createButtonEmpty(AppContext.viewSize.width, keyHeight));
		keysView.setItemModel(keyPanel);

		layout.addChild(keysView);

		layout.visible = false;
		return layout;
	},

	onLayoutResize : function(){
		this._super();
		var csize = this.contentLayout.getContentSize();
		this.listView.setContentSize(csize);
		this.keysView.setContentSize(csize);
	},

	keysViewItemSelect : function(sender, type){
		switch (type) {
			case ccui.ListView.ON_SELECTED_ITEM_END : 

				var key = sender.getItem( sender.getCurSelectedIndex()).key;

				if(key != null){
					this.input.setString(key);
					this.queryElements();
				}

				break;

			default:
				break;
		}
	},

	listViewItemSelect : function(sender, type){

		switch (type) {
//			case ccui.ListView.EVENT_SELECTED_ITEM:
			case ccui.ListView.ON_SELECTED_ITEM_END : 
				var beacon = sender.getItem( sender.getCurSelectedIndex()).data;
				
				if(beacon){
					this.input.setString(beacon.major + "-" + beacon.minor);
					MU.scheduleOnce(this.queryElements, this);
				}

				break;

			default:
				break;
		}
	},


	queryElements : function(){

		// 隐藏输入法
		this.input.didNotSelectSelf();

		var queryWord = this.input.getString().trim();

		this.filterKey = queryWord.trim().toUpperCase();
		this.queryHisKeys[this.filterKey] = Date.now();
		this.showBeaconsList();
		
		this.listView.scrollToTop(0.1, false);
		this.contentUI.visible = true;
		this.keysView.visible = false;
	},
	
	findBeacons : function(){
		var beacons = cc.extend({}, BeaconService.beaconsMap);
		var findBeacons = [];
		var i=0;
		
		if(this.filterKey==null || this.filterKey==""){
			for(var key in beacons){
				findBeacons.push(beacons[key]);
			}
		}else{
			var beacon = BeaconService.updateBeaconRssi(this.filterKey);
			if(beacon){
				findBeacons.push(beacon);
			}
		}
		
		findBeacons.sort(function(a, b){
			return b.avgRssi - a.avgRssi;
		});
		
		return findBeacons;
	},
	
	showBeaconsList : function(){

		this.clearResults();

		var beacons = this.findBeacons();
		var now = new Date().toLocaleTimeString();
		for(var i=0; i<beacons.length; i++){

			var bc = beacons[i];
			var key = bc.major + "-"  + bc.minor;
			this.listView.pushBackDefaultItem();
			var rpanel = this.listView.getItem(i);

			rpanel.data = bc;

			var margin = AppContext.baseWidth/50;
			var text = "" + bc.name + " | " + key;
			var content = UIHelper.createLabelWidget(text,  AppContext.baseWidth/20);
			UIHelper.addToRelativeLayout(content, rpanel, ccui.RelativeLayoutParameter.PARENT_TOP_LEFT,margin);
			
			var uuid = UIHelper.createLabelWidget(bc.uuid,  AppContext.baseWidth/20);
			UIHelper.addToRelativeLayout(uuid, rpanel, ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL, margin);

			
			if(bc.rssis.length){
				var rs = [].concat(bc.rssis);
				rs.sort(function(b, a){
					return a.received - b.received;
				});

				var rssi ="[" + rs.length + "] | " + now + " | " + new Date(rs[0].received).toLocaleTimeString() +" | rssi : " + rs[0].rssi + " | "+ bc.avgRssi;
				var contentRssi = UIHelper.createLabelWidget(rssi,  AppContext.baseWidth/20);
				UIHelper.addToRelativeLayout(contentRssi, rpanel, ccui.RelativeLayoutParameter.PARENT_RIGHT_BOTTOM, margin * 2);
			}
		}
	},

	clearResults : function(){
		this.contentUI.visible = true;
		this.listView.removeAllItems();
	}

});