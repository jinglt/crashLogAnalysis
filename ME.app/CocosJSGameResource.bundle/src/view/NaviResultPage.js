var NaviResultPage = PageView.extend({
	
	MARKER_START_ID : "MARKER_START_ID",
	MARKER_END_ID : "MARKER_END_ID",
	MARKER_CROSS_ID : "MARKER_CROSS_ID",
	PATH_NOW_ID : "PATH_NOW_ID",
	
	mapView: null,
	pathResult : null,
	pathPage : null,
	naviState : null,
	
	onCreate : function(){
// cc.eventManager.addCustomListener(MapEvents.MAP_VIEW_CHANGED,
// this.onMapViewChanged.bind(this));
		
		this.schedule(this.onMapViewChanged);
	},
	
	onMapViewChanged : function(){
		
		var map = this.mapView.mapLayer;
		
		if(map==null || this.pathPage==null || this.pathResult==null){
			return;
		}
		
		var pos = PositionService.currentPosition;
		if(pos==null){
			return;
		}
		
		var floor = pos.floor;
		if(this.naviState==null){
			this.naviState = {posFloor : floor, mapFloor : map.viewFloor};
		}
		
		//切换地图
		var mapChanged = false;
		if(this.naviState.posFloor!=floor && map.viewFloor!=floor ){
			MU.log("切换地图");
			map.drawFloor(floor);
			mapChanged = true;
		}
		
		//切换导航步骤
		if(mapChanged){
			var pathPart = this.pathResult.pathParts[this.pathPage.getCurPageIndex()];
			if(pathPart.startPoint.floor!=map.viewFloor && pathPart.endPoint.floor!=map.viewFloor){
				var idx = -1;
				for(var i=0; i<this.pathResult.pathParts.length; i++){
					var part = this.pathResult.pathParts[i];
					if(part.startPoint.floor==map.viewFloor && part.type==MapPathPart.TYPE_SAME_FLOOR){
						idx = i;
						break;
					}
				}

				if(idx>=0){
					MU.log("切换导航步骤");
//					this.drawFloorPath(idx);
					this.pathPage.scrollToPage(idx);
				}
			}
		}

		this.naviState = {posFloor : floor, mapFloor : map.viewFloor};
	},
	
	onResume : function(){
// this.pathResult = pathResult;
		this.mapView.showInfoPanel(this.createPathResultInfoPanel());
		this.drawFloorPath(0);
	},
	
	onPause : function(){
		this.clearPathResult();
		return true;
	},

	createPathResultInfoPanel : function(){
		
		var margin = AppContext.baseWidth / 640 * 10;
		var pwidth = AppContext.viewSize.width - margin * 2;
		var pheight = AppContext.baseWidth / 640 * 132 + margin * 2;
		var btnWidth = AppContext.baseWidth/640*70;
		var btnHeight = pheight - margin * 2;
		
		var layout = new ccui.Layout();
		layout.setLayoutType(ccui.Layout.RELATIVE);
		layout.setContentSize(AppContext.viewSize.width, pheight + margin);
		
		// pageView
		var pageView = new ccui.PageView();
		this.pathPage = pageView;
		pageView.setTouchEnabled(true);
		pageView.setContentSize(pwidth, pheight);
		UIHelper.addToRelativeLayout(pageView, layout, ccui.RelativeLayoutParameter.PARENT_BOTTOM_CENTER_HORIZONTAL, margin);
		pageView.addEventListener(this.pathInfoPageChange, this);
		
		for(var i=0, step=1; i<this.pathResult.pathParts.length; i++, step++){
			var path = this.pathResult.pathParts[i];
			
			var page = UIHelper.createPanel(pwidth, pheight, res.window_back_9);
			page.setLayoutType(ccui.Layout.RELATIVE);
			page.pathIndex = i;
			path.step = step;
			
			// title
			var title = UIHelper.createLabelWidget("第 " + step + "/" +this.pathResult.pathParts.length + " 步 - 在" + MU.getFloorName(path.startPoint.floor), 
							AppContext.baseWidth/640 * 30);
			UIHelper.addToRelativeLayout(title, page, ccui.RelativeLayoutParameter.PARENT_TOP_LEFT, margin * 3 + btnWidth, margin * 3);
			
			//结束导航
			var posBtn = new LinkButton("结束导航", AppContext.baseWidth/640 * 30, PageView.hideToRoot, PageView);
			UIHelper.addToRelativeLayout(posBtn, page, ccui.RelativeLayoutParameter.PARENT_TOP_RIGHT, margin * 3 + btnWidth, margin * 3);
			
			// content
			var desc = "";
			if(path.type==MapPathPart.TYPE_CROSS_BY_ELEVATOR){
				desc = "乘电梯到" + MU.getFloorName(path.endPoint.floor);
			}else if(path.type==MapPathPart.TYPE_CROSS_BY_STAIR){
				desc = "走楼梯到" + MU.getFloorName(path.endPoint.floor);
			}else if(path.type==MapPathPart.TYPE_SAME_FLOOR){
				var startName = "起点", endName = "终点";
				if(i>0){
					startName = "路径点" + step;
				}
				if(i<this.pathResult.pathParts.length-1){
					endName = "路径点" + (step + 1);
				}
				desc = "从" + startName + "步行到" +endName;
			}
			
			var content = UIHelper.createLabelWidget(desc, AppContext.baseWidth/640 * 26);
			UIHelper.addToRelativeLayout(content, page, ccui.RelativeLayoutParameter.PARENT_TOP_LEFT, margin * 3 + btnWidth, margin * 6 + AppContext.baseWidth/640 * 30);
			
			// 上一步
			if(step>1){
				var preBtn = new IconButton(res.icon_previous, "", btnWidth, btnHeight);
				preBtn.contentScale = 0.2;
				preBtn.onSizeChanged();
				preBtn.addTouchEventListener(function(){
					this.scrollToPage(this.getCurPageIndex()-1);
				}, pageView);
				UIHelper.addToRelativeLayout(preBtn, page, ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL, margin);
			}
			if(i<this.pathResult.pathParts.length-1){
				var nextBtn = new IconButton(res.icon_next, "", btnWidth, btnHeight);
				nextBtn.contentScale = 0.2;
				nextBtn.onSizeChanged();
				nextBtn.addTouchEventListener(function(){
					this.scrollToPage(this.getCurPageIndex()+1);
				}, pageView);
				UIHelper.addToRelativeLayout(nextBtn, page, ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL, margin);
			}
			
			pageView.addPage(page);
		}
		return layout;
	},
	
	pathInfoPageChange : function (sender, type) {
		switch (type) {
			case ccui.PageView.EVENT_TURNING:
				var pageView = sender;
				var page  = pageView.getPage(pageView.getCurPageIndex());
				this.drawFloorPath(page.pathIndex);
				break;
			default:
				break;
		}
	},
	
	drawFloorPath : function(pathIndex){
		this.clearFloorPath();
		
		var path = this.pathResult.pathParts[pathIndex];
		
		var floor = path.startPoint.floor;
		
		var mFloor = floor==0? 1: floor;
		if(mFloor!=this.mapView.mapLayer.viewFloor){
			this.mapView.mapLayer.drawFloor(mFloor);
		}
		
		var ppoints = path.pathPoints;
		
		// 加起点
		if(pathIndex==0){
			ppoints.splice(0, 0, this.pathResult.startPoint);
			this.mapView.mapLayer.addMarker(this.MARKER_START_ID, floor, this.pathResult.startPoint, this.createStartMarkerNode());
		}else{
			this.mapView.mapLayer.addMarker(this.MARKER_START_ID, floor, path.startPoint, this.createStepMarkerNode(path.step));
		}
		
		// 加终点
		if(pathIndex==this.pathResult.pathParts.length-1){
			ppoints.push(this.pathResult.endPoint);
			this.mapView.mapLayer.addMarker(this.MARKER_END_ID, floor, this.pathResult.endPoint, this.createEndMarkerNode());
		}else{
			this.mapView.mapLayer.addMarker(this.MARKER_END_ID, floor, path.endPoint, this.createStepMarkerNode(path.step + 1));
		}
		
		// 画路线
		this.mapView.mapLayer.addPath(this.PATH_NOW_ID, floor, ppoints);
		
		// 缩放和定位
		var center = cc.pMidpoint(path.startPoint, path.endPoint);
		var sLeft = Math.min(path.startPoint.x, path.endPoint.x);
		var sRight = Math.max(path.startPoint.x, path.endPoint.x);
		var sTop = Math.max(path.startPoint.y, path.endPoint.y);
		var sBottom =  Math.min(path.startPoint.y, path.endPoint.y);
		
		var xDis = (sRight - sLeft)  * MapConsts.PIXEL_PER_METER;
		var yDis = (sTop - sBottom) * MapConsts.PIXEL_PER_METER;
		var scaleTo = null;
		
		if(xDis / AppContext.viewSize.width > yDis / (AppContext.viewSize.height * 0.6)){
			scaleTo = AppContext.viewSize.width / xDis * 0.8;
		}else{
			scaleTo = AppContext.viewSize.height * 0.6 / yDis * 0.8;
		}
		
		//最小显示范围为50米
		scaleTo=Math.min(scaleTo,  AppContext.viewSize.width /MapConsts.PIXEL_PER_METER / 50);
		
		this.mapView.mapLayer.setMapView(center, scaleTo, null, 0, true);
	},

	createStartMarkerNode : function(){
		return UIHelper.createMarkerNode("起");
	},
	
	createEndMarkerNode : function(){
		return UIHelper.createMarkerNodeRed("终");
	},
	
	createStepMarkerNode : function(step){
		return UIHelper.createMarkerNode(step);
	},
	
	clearPathResult : function(){
		this.pathResult=null;
		this.pathPage=null;
		var map = this.mapView.mapLayer;
		map.removeMarker(this.MARKER_START_ID);
		map.removeMarker(this.MARKER_END_ID);
		map.removeMarker(this.MARKER_CROSS_ID);
		map.removePath(this.PATH_NOW_ID);
		this.mapView.hideInfoPanel();
	},
	
	clearFloorPath : function(){
		var map = this.mapView.mapLayer;
		map.removeMarker(this.MARKER_CROSS_ID);
		map.removePath(this.PATH_NOW_ID);
	}

});