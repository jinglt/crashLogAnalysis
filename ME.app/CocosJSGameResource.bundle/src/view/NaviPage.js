var NaviPage = PageView.extend({
	
	mapView: null,
	startData : null,
	endData : null,
	startText : null,
	endText : null,
	
	onCreate : function(){
		this.removeOnHide = false;
	},
	
	onResume : function(){
		if(this.startData==null || this.startData.refType==RefTypes.USER_POSITION){
			this.setStartData(null);
			this.waitForUserPosition(this.setStartData, 3);
		}
		if(this.endData==null){
			this.setEndData(null);
		}else if(this.endData.refType==RefTypes.USER_POSITION){
			this.waitForUserPosition(this.setEndData, 3);
		}
		
		return true;
	},
	
	waitForUserPosition : function(selector, times){
//		cc.log("waitForUserPosition");
		if(PositionService.currentPosition==null ){
			if(times>0){
				MU.scheduleOnce(this.waitForUserPosition.bind(this, selector, times-1), this, 1);
			}else{
				Popup.showMsg("暂时无法获取您的位置！");
			}
		}else{
			selector.call(this, PositionService.currentPosition);
		}
	},
	
	onPause : function(){
	},

	createContentUI : function(){

		var layout = UIHelper.createColoredPanel();
		layout.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
		
		//panel
		var vWidth = AppContext.viewSize.width;
		var pMargin = AppContext.baseWidth/640*15;
		var pWidth = vWidth - pMargin * 2;
		var pHeight = AppContext.baseWidth / 640 * 182;
		
		//上边界
		UIHelper.addToLinearLayout(UIHelper.createMarginWidget(vWidth, pMargin*1.5), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		//panel
		var panel = UIHelper.createPanel(pWidth, pHeight, res.panel_bg_9);
		panel.setLayoutType(ccui.Layout.RELATIVE);
		UIHelper.addToLinearLayout(panel, layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		//导航输入区
		var cMargin = AppContext.baseWidth/640 * 3;
		var swtWidth = AppContext.baseWidth/640 * 98;
		var btnHeight = (pHeight - cMargin * 2) * 0.5;
		var btnWidth = (pWidth - cMargin * 2) - swtWidth;
		var swtHeight = btnHeight * 2;
		
		//起点终点选择框
		//起点
		var startHolder = UIHelper.createButtonEmpty(btnWidth, btnHeight);
		startHolder.onTouched = this.queryForStart.bind(this);
		UIHelper.addToRelativeLayout(startHolder, panel, ccui.RelativeLayoutParameter.PARENT_TOP_LEFT, cMargin);
		var stratIcon = UIHelper.createImage(btnHeight * 0.4, btnHeight * 0.4, res.icon_navi_start, 0);
		stratIcon.x = btnHeight/2;
		stratIcon.y = btnHeight/2;
		startHolder.addChild(stratIcon);
		var startText = UIHelper.createLabelWidget("选择起点..", btnHeight * 0.4);
		startText.anchorX = 0;
		startText.x = btnHeight;
		startText.y= btnHeight/2;
		startHolder.addChild(startText);
		this.startText = startText;
		
		//分线
		UIHelper.addToRelativeLayout(UIHelper.createHSplit(btnWidth, 0, null, null, 0), panel, ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL, cMargin);
		
		//终点
		var endHolder = UIHelper.createButtonEmpty(btnWidth, btnHeight);
		endHolder.onTouched = this.queryForEnd.bind(this);
		UIHelper.addToRelativeLayout(endHolder, panel, ccui.RelativeLayoutParameter.PARENT_LEFT_BOTTOM, cMargin);
		var endIcon = UIHelper.createImage(btnHeight * 0.4, btnHeight * 0.4, res.icon_navi_end, 0);
		endIcon.x = btnHeight/2;
		endIcon.y = btnHeight/2;
		endHolder.addChild(endIcon);
		var endText = UIHelper.createLabelWidget("选择终点..", btnHeight * 0.4);
		endText.anchorX = 0;
		endText.x = btnHeight;
		endText.y= btnHeight/2;
		endHolder.addChild(endText);
		this.endText = endText;
		
		//分线
		UIHelper.addToRelativeLayout(UIHelper.createVSplit(0, swtHeight, null, null, 0), panel, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL, cMargin + swtWidth);
		
		//切换按钮
		var switchBtn = new IconButton(res.icon_switch, null, swtWidth, swtHeight);
		switchBtn.contentScale = 0.4;
		switchBtn.onSizeChanged();
		switchBtn.addTouchEventListener(this.switchNaviData, this);
		UIHelper.addToRelativeLayout(switchBtn, panel, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL, cMargin);
		
		//边距
		UIHelper.addToLinearLayout(UIHelper.createMarginWidget(vWidth, pMargin), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		//导航按钮
		var nMargin = AppContext.baseWidth /  640 * 5;
		var naviBox = UIHelper.createPanel(pWidth, btnHeight, res.panel_bg_9);
		naviBox.setLayoutType(ccui.Layout.RELATIVE);
		UIHelper.addToLinearLayout(naviBox, layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		var naviButton = new IconButton(res.icon_navi, "开始导航", pWidth + nMargin *2, btnHeight + nMargin * 2);
		naviButton.getButton().loadTexturePressed(res.window_small_bg_pressed_9);
		naviButton.contentScale = 0.45;
		naviButton.onSizeChanged();
		naviButton.addTouchEventListener(this.startNavigate, this);
		UIHelper.addToRelativeLayout(naviButton, naviBox, ccui.RelativeLayoutParameter.CENTER_IN_PARENT);

		return layout;
	},
	
	switchNaviData : function(){
		
		var data = this.startData;
		this.setStartData(this.endData);
		this.setEndData(data);
		
	},

	onLayoutResize : function(){
		this._super();
		var csize = this.contentLayout.getContentSize();
	},

	queryForStart : function(){
		
		this.mapView.queryForEvent(function(data){
			this.show();
			this.setStartData(data);
		}, this);
	},

	queryForEnd : function(){
		
		this.mapView.queryForEvent(function(data){
			this.show();
			this.setEndData(data);
		}, this);
	},

	startNavigate : function(){
		Popup.showLoading();
		
		if(this.startData==null){
			Popup.showMsg("请选择起点！");
		}else if(this.endData==null){
			Popup.showMsg("请选择终点！");
		}else{
			var pathResult = null;

			try{
				pathResult = PathService.calcMapPathResult(this.mapView.mapLayer, this.startData, this.endData);
			}catch(ex){

			}
			//记录导航日志
			AppService.logBegin(this.mapView.mapId, "NAVI", AppService.openId, this.startText.getString() +"|" + this.endText.getString(),(pathResult==null?"false":"true") );
			
			if(pathResult==null || pathResult.pathParts.length==0){
				Popup.showMsg("没有计算出导航路径！");
			}else{
				new NaviResultPage({mapView : this.mapView, pathResult : pathResult, title : "导航到-" + this.endData.name}).show();
			}

		}

		Popup.hideLoading();
		
	},
	
	setStartData : function(data){
		this.startData = data;
		if(data==null){
			this.startText.setColor(cc.color(150,150,150));
			this.startText.setString("选择起点..");
		}else {
			this.startData = data = cc.extend({}, data);
			data.x = data.x || data.centerX;
			data.y = data.y || data.centerY;
			
			if(data.refType==RefTypes.USER_POSITION){
				if(data.mapId==this.mapView.mapLayer.mapId){
					this.startText.setColor(cc.color(0,0,255));
					this.startText.setString("我的位置" + " (" + MU.getFloorName(data.floor) + ")");
				}else{
					this.startText.setColor(cc.color(150,150,150));
					this.startText.setString("选择起点..");
				}
			}else{
				this.startText.setColor(cc.color(0,0,0,255));
				this.startText.setString(data.name + " (" + MU.getFloorName(data.floor) + ")");
			}
		}
			
	},
	
	setEndData : function(data){
		this.endData = data;
		if(data==null){
			this.endText.setColor(cc.color(150,150,150));
			this.endText.setString("选择终点..");
		}else {
			this.endData = data = cc.extend({}, data);
			data.x = data.x || data.centerX;
			data.y = data.y || data.centerY;
			
			if(data.refType==RefTypes.USER_POSITION){
				if(data.mapId==this.mapView.mapLayer.mapId){
					this.endText.setColor(cc.color(0,0,255));
					this.endText.setString("我的位置" + " (" + MU.getFloorName(data.floor) + ")");
				}else{
					this.endText.setColor(cc.color(150,150,150));
					this.endText.setString("选择终点..");
				}
			}else{
				this.endText.setColor(cc.color(0,0,0));
				this.endText.setString(data.name + " (" + MU.getFloorName(data.floor) + ")");
			}
		}
	},
	
	createStartMarkerNode : function(){
		return UIHelper.createMarkerNode("起");
	},
	
	createEndMarkerNode : function(){
		return UIHelper.createMarkerNodeRed("终");
	},
	
	createStepMarkerNode : function(step){
		return UIHelper.createMarkerNode(step);
	}

});