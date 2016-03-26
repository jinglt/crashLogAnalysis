var QueryPage = PageView.extend({
	
	mapView: null,
	input : null,
	listView : null,
	queryView : null,
	posView : null,
	queryhisKey : "QueryPage_queryhis_list",
	onQueryResultSelect : null,
	
	onCreate : function(){
		this.title = null;
		this.removeOnHide = false;
	},
	
	onShow : function(){
		if(this.mapView.mapLayer){
			this.input.setPlaceHolder("查询" + this.mapView.mapLayer.mapInfo.mapName + "..");
		}
		this.input.setString("");
		this.input.attachWithIME();
		return true;
	},
	
	onHide : function(){
		this.input.didNotSelectSelf();
		this.clearResults();
		
		if(this.scheduleQueryForEvent(null)){
			return false;
		}
		
		return true;
	},
	
	onResume : function(){
		
	},
	
	onPause : function(){
		
	},
	
	createHeaderUI : function(){
		
		var width = AppContext.viewSize.width;
		var height = AppContext.dp2Px(46);
		var margin = AppContext.dp2Px(10);
		var panel = this._super();
		
		var backBtn = panel.getChildByName("backBtn");
		
		var queryBox = UIHelper.createPanel(width - backBtn.width - margin * 2, height - margin, res.panel_bg_9);
		queryBox.setLayoutType(ccui.Layout.LINEAR_HORIZONTAL);
		UIHelper.addToRelativeLayout(queryBox, panel, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL, margin);
		
		//文本框
		var input = new TextInput("查询..", queryBox.width - height * 1.2, height - margin);
		input.onTextChanged = (function(text){
			if(text==""){
				this.clearResults();
				this.listView.visible = true;
				this.queryView.visible = false;
			}
		}).bind(this);
		
		input.onTextFocus = (function(){
			this.showQueryKeys();
		}).bind(this);
		
		UIHelper.addToLinearLayout(input, queryBox, ccui.LinearLayoutParameter.CENTER_VERTICAL);
		this.input = input;
		
		//分线
		UIHelper.addToLinearLayout(UIHelper.createVSplit(margin/5, height - margin, null, null, 0), queryBox, ccui.LinearLayoutParameter.CENTER_VERTICAL);
		
		//按钮
		var queryBtn = new IconButton(res.icon_search_dark, "", height * 1.2, height - margin);
		queryBtn.contentScale = 0.7;
		queryBtn.onSizeChanged();
		queryBtn.addTouchEventListener(this.queryElements, this);
		UIHelper.addToLinearLayout(queryBtn, queryBox, ccui.LinearLayoutParameter.CENTER_VERTICAL);
		
		return panel;
	},
	
	showQueryKeys : function(){
		
		this.queryView.removeAllItems();
		
		var qWidth = this.queryView.width;
		var qHeight = this.queryView.height;
		var margin = AppContext.baseWidth/40;
		var pHeight = 0;
		
		var idx = 0;
		if(this.onQueryResultSelect){
			var posPanel = this.createPositionsPanel(qWidth);
			this.queryView.insertCustomItem(posPanel, idx++);
			this.queryView.insertCustomItem(UIHelper.createPanel(qWidth, margin), idx++);
			pHeight = posPanel.height + margin;
		}
		
		var keyHeight = AppContext.baseWidth/640*86;
		var keys =  [].concat(AppContext.appProps.hotKeys, QueryService.getQueryHisKeys());
		var innerList = UIHelper.createListView(res.panel_bg_9);
		innerList.setContentSize(qWidth, qHeight - pHeight);
		innerList.addEventListener(this.queryViewItemSelect, this);
		this.queryView.insertCustomItem(innerList, idx++);
		
		
		idx = 0;
		for(var i=0; i<keys.length; i++){
			
			var rpanel = UIHelper.createPanel(qWidth, keyHeight);
			rpanel.setLayoutType(ccui.Layout.RELATIVE);
			rpanel.setTouchEnabled(true);
			rpanel.addChild(UIHelper.createButtonEmpty(qWidth, keyHeight));
			var d = keys[i];

			rpanel.data = d;
			var content = UIHelper.createLabelWidget(d.key, AppContext.baseWidth/20);
			UIHelper.addToRelativeLayout(content, rpanel, ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL, margin, 0);
			var desc = UIHelper.createLabelWidget(d.desc||"", AppContext.baseWidth/22, cc.hexToColor(AppStyles.font_tip_color));
			UIHelper.addToRelativeLayout(desc, rpanel, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL, margin, 0);
			
			innerList.insertCustomItem(rpanel, idx++);
			innerList.insertCustomItem(UIHelper.createHSplit(qWidth, 0), idx++);
		}
		
		this.queryView.visible = true;
		this.listView.visible = false;
	},
	
	createContentUI : function(){
		
		var layout = UIHelper.createColoredPanel();
		
		//查询结果
		var listView = UIHelper.createListView(res.panel_bg_9);
		this.listView = listView;
		listView.addEventListener(this.listViewItemSelect, this);
		layout.addChild(listView);
		
		//查询记录
		var queryView = UIHelper.createListView("");
		this.queryView = queryView;
		layout.addChild(queryView);
		
		return layout;
	},
	
	onLayoutResize : function(){
		this._super();
		var csize = this.contentLayout.getContentSize();
		var margin = AppContext.baseWidth/40;
		this.listView.setContentSize(csize.width-margin*2, csize.height-margin*2);
		this.listView.x = margin;
		this.listView.y = margin;
		this.queryView.setContentSize(csize.width-margin*2, csize.height-margin*2);
		this.queryView.x = margin;
		this.queryView.y = margin;
	},
	
	queryViewItemSelect : function(sender, type){
		switch (type) {
		case ccui.ListView.ON_SELECTED_ITEM_END : 
			
			var data = sender.getItem( sender.getCurSelectedIndex()).data;
			
			if(data != null && data.key!=null){
				this.input.setString(data.key);
				this.queryElements();
			}

			break;

		default:
			break;
		}
	},
	
	listViewItemSelect : function(sender, type){
		
		switch (type) {
//		case ccui.ListView.EVENT_SELECTED_ITEM:
		case ccui.ListView.ON_SELECTED_ITEM_END : 
			
			var data = sender.getItem( sender.getCurSelectedIndex()).data;
			
			if(data!=null){
				if(this.onQueryResultSelect){
					this.scheduleQueryForEvent(data);
				}else{
					this.showResultMarker(data);
				}
			}
			
			break;

		default:
			break;
		}
	},
	
	showResultMarker : function(data){
		
		this.scheduleOnce(function(){
			new DataInfoPage({mapView : this.mapView, data : data, title : data.name||"查询"}).show();
		});
		
	},
	
	queryElements : function(){

		// 隐藏输入法
		this.input.didNotSelectSelf();
		// 清楚marker
		this.clearResults();

		var queryWord = this.input.getString().trim();

		var mapView = this.mapView;
		
		if(queryWord==""){
			Popup.showMsg("请输入关键字！");
			return;
		}

		// 根据查询内容获取查询对象的坐标集合
		var results = QueryService.queryElements(mapView.mapLayer.mapId, queryWord);
		
		//记录查询日志
		AppService.logBegin(this.mapView.mapId, "SEARCH", AppService.openId, queryWord, results.length);
		
//			this.addResultsMarker(results);
		
		var rWidth = this.listView.width;
		var rHeight = AppContext.baseWidth / 640 * 110;
		var rMargin = AppContext.baseWidth / 640 * 10;
		if(results==null || results.length==0){
			
			var rpanel = UIHelper.createPanel(rWidth, rHeight);

			var text = "没有查询到结果！";
			var content = UIHelper.createLabelWidget(text, AppContext.baseWidth/640 * 30);
			content.x = rWidth/2;
			content.y = rHeight/2;
			rpanel.addChild(content);
			
			this.listView.insertCustomItem(rpanel, 0);
			this.listView.insertCustomItem(UIHelper.createHSplit(rWidth, 0), 1);
		}else if(results.length==1){
			var data =  results[0];
			if(this.onQueryResultSelect!=null){
				this.scheduleQueryForEvent(data);
			}else{
				this.showResultMarker(data);
			}
			return;
		}else{
			
			var idx=0;
			for(var i=0; i<results.length; i++){
				
				var rpanel = UIHelper.createPanel(rWidth, rHeight);
				rpanel.setLayoutType(ccui.Layout.RELATIVE);
				rpanel.addChild(UIHelper.createButtonEmpty(rWidth, rHeight));
				var ele = results[i];
				rpanel.data = ele;
				var titleLabel = UIHelper.createLabelWidget("" + (i+1) + ".  " +  ele.name, AppContext.baseWidth/640*30, null, AppStyles.font_title);
				UIHelper.addToRelativeLayout(titleLabel, rpanel, ccui.RelativeLayoutParameter.PARENT_TOP_LEFT, rMargin * 5, rMargin * 2);
				
				var desc = "[" + MU.getFloorName(ele.floor) + "]  " + MapStyles.currentStyle.getRefTypeDesc(ele.refType) + " " + (ele.desc||"");
				var descLabel = UIHelper.createLabelWidget(desc, AppContext.baseWidth/640 * 24, cc.hexToColor(AppStyles.font_tip_color));
				UIHelper.addToRelativeLayout(descLabel, rpanel, ccui.RelativeLayoutParameter.PARENT_LEFT_BOTTOM, rMargin * 5, rMargin);
				
				this.listView.insertCustomItem(rpanel, idx++);
				this.listView.insertCustomItem(UIHelper.createHSplit(rWidth, 0), idx++);
			}
			
		}
		
		this.listView.scrollToTop(0.1, false);
		this.queryView.visible = false;
		this.listView.visible = true;
	},
	
	queryForEvent : function(selector, target){
		this.onQueryResultSelect = selector.bind(target);
		this.show();
	},
	
	scheduleQueryForEvent : function(data){
		if(this.onQueryResultSelect){
			this.scheduleOnce(function(){
				this.onQueryResultSelect(data);
				this.onQueryResultSelect = null;
				this.hide();
			});
			
			return true;
		}else{
			return false;
		}
	},

	clearResults : function(){
		this.contentUI.visible = true;
		this.listView.removeAllItems();
	},
	
	createPositionsPanel : function(pwidth){
		
		var pheight = AppContext.baseWidth/8;
		var margin = AppContext.baseWidth/20;
		
		var panel = UIHelper.createPanel(pwidth, pheight, res.panel_bg_9);
		panel.setLayoutType(ccui.Layout.RELATIVE);
		panel.setTouchEnabled(true);
		
		var myPosBtn = new IconButton(res.icon_location, "我的位置", (pwidth-margin*2)/2, pheight* 0.8);
		myPosBtn.contentScale = 0.6;
		myPosBtn.onSizeChanged();
		myPosBtn.addTouchEventListener(function(){
			this.scheduleQueryForEvent(PositionService.currentPosition);
		}, this);
		UIHelper.addToRelativeLayout(myPosBtn, panel, ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL, margin, 0);
		
		var selPosBtn = new IconButton(res.icon_select_point, "地图选点", (pwidth-margin*2)/2, pheight* 0.8);
		selPosBtn.contentScale = 0.6;
		selPosBtn.onSizeChanged();
		selPosBtn.addTouchEventListener(function(){
			this.mapView.selectPointOnMap("地图上的点", function(p){
				this.scheduleQueryForEvent(p);
			}, this);
			this.input.didNotSelectSelf();
			
		}, this);
		UIHelper.addToRelativeLayout(selPosBtn, panel, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL, margin, 0);
		
		return panel;
	}
	
})