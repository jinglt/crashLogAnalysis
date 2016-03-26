var PersonalPage = PageView.extend({
	
	mapView : null,
	headImg : null,
	
	createContentUI : function(){
		
		var layout = UIHelper.createColoredPanel();
		layout.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
		
		var pMargin = AppContext.baseWidth/640 * 20;
		// 个人信息
		var uWidth = AppContext.viewSize.width - pMargin * 2;
		var uHeight = AppContext.baseWidth/640 * 240;
		var uPanel = UIHelper.createPanel(uWidth, uHeight);
		var imgUrl = UserService.getUserInfo().userHeadImg;
		var failImg = res.icon_app;
		UIHelper.addToLinearLayout(uPanel, layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		uPanel.setLayoutType(ccui.Layout.RELATIVE);
		uPanel.setClippingEnabled(false);
		
		var radius = AppContext.baseWidth/640 * 70;
		var uWidget = new ccui.Widget();
		var clipNode = new cc.ClippingNode();
		var stencil = new cc.DrawNode();
		stencil.drawCircle(cc.p(0, 0), radius + radius * 0.2, 0, 256, false, radius * 0.4, cc.color(0, 255, 0, 100));
// stencil.drawDot(cc.p(0, 0), radius,cc.color(0, 255, 0) );
		clipNode.setStencil(stencil);
		
		var  uImg = new ImgView(radius * 2, 0, imgUrl, failImg);
		this.headImg = uImg;
		clipNode.addChild(uImg);
		clipNode.setInverted(true);
		uWidget.addChild(clipNode);
		UIHelper.addToRelativeLayout(uWidget, uPanel, ccui.RelativeLayoutParameter.CENTER_IN_PARENT, 0);
		
		// 功能按钮
		var mWidth = AppContext.viewSize.width - pMargin * 2;
		var mheight = AppContext.baseWidth / 640 * 82;
		var margin = AppContext.baseWidth / 640 * 20;
		
		var menuList = UIHelper.createPanel(mWidth, mheight * 2, res.panel_bg_9);
		menuList.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
		UIHelper.addToLinearLayout(menuList, layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);

		//我的工位
		var myStation = new IconListItem(res.icon_station, "我的工位", mWidth, mheight, pMargin);
		myStation.addTouchEventListener(function(){
			new StationPage({title : "我的工位", mapView : this.mapView}).show();
		}, this);
		menuList.addNode(myStation);
		
		//我的车位
		var myCar = new IconListItem(res.icon_car, "我的车位", mWidth, mheight, pMargin);
		myCar.addTouchEventListener(function(){
			new CarPage({title : "我的车位", mapView : this.mapView}).show();
		}, this);
		menuList.addNode(UIHelper.createHSplit(mWidth, 0, null, null ,0));
		menuList.addNode(myCar);
		
		//关于
		UIHelper.addToLinearLayout(UIHelper.createPanel(mWidth, AppContext.baseWidth/640*20), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		var aboutList = UIHelper.createPanel(mWidth, mheight, res.panel_bg_9);
		aboutList.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
		UIHelper.addToLinearLayout(aboutList, layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		var aboutItem = new IconListItem(res.icon_about, "关于", mWidth, mheight, pMargin);
		aboutItem.addTouchEventListener(function(){
			new AboutPage().show();
		}, this);
		aboutList.addNode(aboutItem);
		
		var aboutArrow = new cc.Sprite(res.icon_next);
		aboutArrow.scale = mheight * 0.4/aboutArrow.height;
		aboutArrow.x = mWidth - aboutArrow.width * aboutArrow.scale;
		aboutArrow.y = mheight/2;
		aboutItem.addChild(aboutArrow);
		
		
		if(PositionService.DEBUG){//测试用的功能
			var testBtn = new IconListItem(res.icon_app, "信号测试", mWidth, mheight, pMargin);
			testBtn.addTouchEventListener(function(){
				var testPage = new TestPage({title : "信号测试", mapView : this.mapView});
				testPage.show();
			}, this);
			UIHelper.addToLinearLayout(testBtn, layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);

			var posBtn = new IconListItem(res.icon_app, "选取位置", mWidth, mheight, pMargin);
			posBtn.addTouchEventListener(function(){
				this.mapView.selectPointOnMap("选点", function(pos){
					Popup.alert(JSON.stringify(pos));
				}, this);
			}, this);
			UIHelper.addToLinearLayout(posBtn, layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		}
		

		return layout;
	}	
	
});