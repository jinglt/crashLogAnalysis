var SelectPointPage = PageView.extend({
	pointName : "地图上的点",
	mapView : null,
	positionNode : null,
	nodePosition : null,
	onPointSelect : null,
	posLabel : null,
	showPos : false,
	selectPoint : null,
	
	onCreate : function(){
		this.title = "标记" + this.pointName;
		this.removeOnHide = true;
		this.selectPoint = null;
		this.schedule(this.update, 0.5);
	},
	
	onHide : function(){
		this.schedulePointSelect(this.selectPoint);
		return true;
	},
	
	update : function(){
		
		if(this.showPos && this.posLabel){
			var p1 = this.getNodePosition();
			var p = this.mapView.mapLayer.convertToMapPosition(p1);
			this.posLabel.setString("X=" + MU.roundString(p.x, 2) + " | Y=" + MU.roundString(p.y, 2));
		}
		
	},
	
	getNodePosition : function(){
		if(this.nodePosition==null){
			this.nodePosition = this.positionNode.convertToWorldSpace(cc.p(0,0));
		}
		
		return this.nodePosition;
	},
	
	onResume : function(){
		
		this.mapView.showInfoPanel(this.createMenusUI());
		this.mapView.mapLayer.scrollEnabled = false;
	},
	
	onPause : function(){
		this.mapView.mapLayer.scrollEnabled = true;
	},
	
	createContentUI : function(){
		
		var layout = new ccui.Layout();
		layout.setLayoutType(ccui.Layout.RELATIVE);
		
		var color = cc.color(0, 255, 0, 255);
		
		var widget = new ccui.Widget();
		
		//瞄准器
		var lsize = AppContext.baseWidth/3;
		var drawNode = new cc.DrawNode();
		drawNode.drawCircle(cc.p(0,0), lsize * 0.8, 0, 256, false, AppContext.baseWidth/100, color);
		drawNode.drawCircle(cc.p(0,0), lsize * 0.2, 0, 256, false, AppContext.baseWidth/100, color);
		drawNode.drawSegment(cc.p(-lsize, 0), cc.p(lsize, 0), AppContext.baseWidth/400, color);
		drawNode.drawSegment(cc.p(0 ,-lsize), cc.p(0, lsize), AppContext.baseWidth/400, color);
//		widget.addChild(drawNode);
		
		//样式点
		var node = UIHelper.createMarkerNode("", 3);
		widget.addChild(node);
		
		this.positionNode = widget;
		
//		var action = cc.scaleBy(1, 1.5, 1.5);
		var action = cc.moveBy(0.5, 0, AppContext.baseWidth/640 * 30);
		var action2 = action.reverse();
//		var action = cc.blink(0.5, 1);
		action = cc.sequence(action, action2);
		node.runAction(action.repeatForever());
		
		//影子
		var shadow = new cc.DrawNode();
		shadow.drawDot(cc.p(0,0), AppContext.baseWidth/640 * 5, cc.color(100, 100, 100, 100));
		widget.addChild(shadow);

		
		UIHelper.addToRelativeLayout(widget, layout, ccui.RelativeLayoutParameter.CENTER_IN_PARENT, 0);
		return layout;
	},
	
	createFooterUI : function(){
		var width = AppContext.viewSize.width;
		var height = AppContext.baseWidth/7;
		
		return UIHelper.createMarginWidget(width, height);
	},
	
	createMenusUI : function(){
		
		var margin = AppContext.baseWidth/640*10;
		var pWidth = AppContext.viewSize.width - margin * 2;
		var pHeight = AppContext.baseWidth/640*100;
		
		var layout = UIHelper.createPanel(AppContext.viewSize.width, this.showPos?(pHeight + margin) * 2 : (pHeight + margin));
		layout.setLayoutType(ccui.Layout.RELATIVE);
		layout.setTouchEnabled(true);
		
		if(this.showPos){
			var posLabel = new ccui.Text("X= | Y=", AppStyles.font_normal, pHeight * 0.5);
			posLabel.setColor(cc.color(0, 0, 0));
			this.posLabel = posLabel;
			UIHelper.addToRelativeLayout(posLabel, layout, ccui.RelativeLayoutParameter.PARENT_TOP_CENTER_HORIZONTAL, margin * 2);
		}
		
		//panel
		var panel = UIHelper.createPanel(pWidth, pHeight, res.window_back_9);
		panel.setLayoutType(ccui.Layout.RELATIVE);
		UIHelper.addToRelativeLayout(panel, layout, ccui.RelativeLayoutParameter.PARENT_BOTTOM_CENTER_HORIZONTAL, margin);

		//btn
		var okBtn = new IconButton(res.icon_select_point, "选择该点", pWidth - margin * 2, pHeight - margin * 2);
		okBtn.addTouchEventListener(this.okBtnTouched, this);
		UIHelper.addToRelativeLayout(okBtn, panel, ccui.RelativeLayoutParameter.CENTER_IN_PARENT);
		return layout;
	},
	
	okBtnTouched : function(){
		if(this.mapView!=null){
			var p1 = this.positionNode.convertToWorldSpace(cc.p(0,0));
			var p = this.mapView.mapLayer.convertToMapPosition(p1);
			
			var data = {
							x : p.x,
							y : p.y,
							centerX : p.x,
							centerY : p.y,
							refType : RefTypes.SELECT_POSITION,
							name : this.pointName,
							floor : this.mapView.mapLayer.viewFloor,
							mapId : this.mapView.mapLayer.mapId,
							building : ""
			};
			this.selectPoint = data;
		}
		
		this.hide();
	},
	
	schedulePointSelect : function(data){
		var callback =  this.onPointSelect;
		if(callback){
			callback(data);
//			MU.scheduleOnce(function(){
////				cc.log("schedulePointSelect " + data);
//				callback(data);
//			});
		}

	}
});