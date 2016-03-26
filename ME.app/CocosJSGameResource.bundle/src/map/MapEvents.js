
var MapEvents = cc.Class.extend({
	
	map : null,
	userAction : null,
	userActionCallback : null,
	clickDelay : 200,
	curTouch : null,
	touchingCount : 0,
	
	ctor : function(map){
		this.map = map;
	},
	
	registerAll : function(){
		// 添加触摸事件
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ALL_AT_ONCE,
			swallowTouches: false,
			onTouchesBegan : this.onTouchesBegan.bind(this),
			onTouchesMoved: this.onTouchesMoved.bind(this),
			onTouchesEnded : this.onTouchesEnded.bind(this)},
			this.map);
	},
	
	clearUserAction : function(){
		this.userAction = null;
		this.userActionCallback = null;
	},
	
	requestMapPoint: function(callback){
		if(callback!=null){
			this.userAction = "requestMapPoint";
			this.userActionCallback = callback;
		}
	},
	
	toucheOnceOnMap : function(position){
		var map = this.map;
		
		var p = position;
		
//    	this.convertTest(p);
		
		if(this.userAction!=null){
			this.userActionCallback(map.convertToMapPosition(p));
			this.clearUserAction();
		}else{
			//是否点击了元素
			p = map.convertToMapPosition(p);
			
			
//			/先判断是否点击了marker
			var mks = [];
			
			for(var mk in map.makers){
				mks.push(map.makers[mk]);
			}
			var selMk = null;
			
			for(var i=0; i<mks.length; i++){
				var marker = mks[i];
				
				var wp = map.convertToWorldPositon(cc.p(marker.centerX, marker.centerY));
				if(marker.isTouchOnMarker(position.x - wp.x, position.y - wp.y)){
//					MU.logObj(marker);
					selMk = marker;
					break;
				}
				
			}
			
			if(selMk){
				selMk.selectMarker();
			}else{
				//没有点击marker时再判断是否点击了元素
				
				var eles = [].concat(map.polys);

				eles.sort(function(a, b){
					if(a.viewLevel==0){
						return 1;
					}

					if(b.viewLevel==0){
						return -1;
					}

					return a.viewLevel-b.viewLevel;
				});

				var selEl = null;

				for(var i = 0; i< eles.length; i++) {
					var el = eles[i];
					if(el.points!=null && el.visible && MapUtil.isInsidePoly(p, el.points)){
						selEl = el;
						break;
					}
				}

				if(selEl != null){
//					this.map.addPolyline(MapEvents.SELECT_POLYLINE_ID, selEl.floor, selEl.points, this.map.mapStyles.getStyle("selectElement"), selEl.viewLevel);
					cc.eventManager.dispatchCustomEvent(MapEvents.MAP_ELEMENT_SELECT, selEl);
				}else{
//					this.map.removePolyline(MapEvents.SELECT_POLYLINE_ID);
					cc.eventManager.dispatchCustomEvent(MapEvents.MAP_ELEMENT_SELECT, null);
				}
			}
			
			
			
		}
	},
	
	toucheTwiceOnMap : function(position){
		var mapPoint = this.map.convertToMapPosition(position);
		this.map.setMapView(mapPoint, this.map.viewScale * 2, null, null, true);
	},
	
	touchesMoveOnMap : function(touches){
		var map = this.map;
		// 单点触控改变位置
		if(touches.length==1){
			var touch = touches[0];
			var delta = touch.getDelta();
			map.moveByPixel(delta.x, delta.y);

		}else if(touches.length>=2){// 多点触控进行缩放操作
			
			var touch1 = touches[0];
			var touch2 = touches[1];

			if(touch1.getPreviousLocation() ==null || touch2.getPreviousLocation() == null){
				return;
			}

			var p1 = touch1.getLocation();
			var p2 = touch2.getLocation();
			
			if(cc.pDistance(p1, p2)<AppContext.dp2Px(100)){
				return;
			}
			
			var lp1 = touch1.getPreviousLocation();
			var lp2 = touch2.getPreviousLocation();
			var center = cc.pMidpoint(p1, p2);
			var lcenter = cc.pMidpoint(lp1, lp2);
			var lmapPoint = map.convertToMapPosition(lcenter);
			var scale = map.viewScale * (cc.pDistance(p1, p2) / cc.pDistance(lp1, lp2));
			var rotation = cc.pAngleSigned(cc.p(p2.x-p1.x, p2.y-p1.y), cc.p(lp2.x-lp1.x, lp2.y-lp1.y))  / Math.PI * 180;
			rotation = map.effectRotation(rotation);
			this.curTouch.moveRotation += Math.abs(rotation);
			//rotation = map.effectRotation(rotation);

			//cc.log("rotation: "+ rotation);
			if(Math.abs( this.curTouch.moveRotation) > 20){
				map.setMapView(lmapPoint, scale, center, map.rotation + rotation);
			}else{
				map.setMapView(lmapPoint, scale, center);
			}

		}
	},
	
	onTouchesBegan : function (touches, event) {
		
		this.touchingCount ++;
		this.map.stopScroll();
		var touch = touches[0];
		if(touch.getID()==0 ){
			if(this.curTouch == null || this.curTouch.clickCount==0){
				this.curTouch = {
						id : touch.getID(),
						clickCount : 0,
						beginPoint : touch.getLocation(),
						beginTime : new Date().getTime(),
						isMoved : false,
						lastMoveTime : null,
						lastMoveDelta : cc.p(0, 0),
						isMultiTouch : false,
						moveRotation : 0,
						endPoint : null,
						endTime: null
				};
			}
		}
		
		return true;
	},

	onTouchesMoved : function (touches, event) {
		if(this.curTouch==null){
			return;
		}
		
		this.curTouch.isMoved = true;
		if(touches.length>1){
			this.curTouch.isMultiTouch = true;
		}else{
			var touch = touches[0];
			if(touch.getID()==0){
				this.curTouch.lastMoveTime = new Date().getTime();
				this.curTouch.lastMoveDelta = touch.getDelta();
//				cc.log("onTouchesMoved at " + this.curTouch.lastMoveDelta.x + ", " + this.curTouch.lastMoveDelta.y);
			}
		}
		
		this.touchesMoveOnMap(touches);
	},

	onTouchesEnded : function (touches, event) {
		this.touchingCount --;
		var touch = touches[0];
		if(this.curTouch!=null && touch.getID()==0){
			
			
			this.curTouch.clickCount ++;
			this.curTouch.endPoint = touch.getLocation();
			this.curTouch.endTime = new Date().getTime();
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.finishTouch, this.clickDelay/1000, false);
			
//			cc.log("onTouchesEnded at " + this.curTouch.endPoint.x + ", " + this.curTouch.endPoint.y);
			if(cc.pDistance(this.curTouch.endPoint, this.curTouch.beginPoint) > AppContext.viewSize.width/25){
				if(!this.curTouch.isMultiTouch){
					this.startMapScroll();
				}
			}
			
		}
	},
	
	finishTouch : function(){
		
		var touch = this.curTouch;
		var ccount = touch.clickCount;
		touch.clickCount = 0;
		
		if(ccount==1){
			if(cc.pDistance(touch.beginPoint, touch.endPoint)<5){
				this.toucheOnceOnMap(touch.endPoint);
			}
		}else if(ccount>1){
			this.toucheTwiceOnMap(touch.endPoint);
		}
		
	},
	
	startMapScroll : function(){
		if(this.curTouch==null){
			return;
		}
		var dx = this.curTouch.lastMoveDelta.x;
		var dy = this.curTouch.lastMoveDelta.y;

		this.map.startScroll(dx, dy);
	},
	

	convertTest : function(p){
		
		var mapP = this.map.convertToMapPosition(p);
		var p2 = this.map.convertToWorldPositon(mapP);
		
		cc.log("convertTest : mapXy: " + (this.map.viewX + ", " + this.map.viewY));
		cc.log("convertTest : mapScale: " + (this.map.viewScale));
		cc.log("convertTest : mapRotation: " + (this.map.viewRotation));
		cc.log("convertTest : point: " + (p.x + ", " + p.y));
		cc.log("convertTest : map point: " + (mapP.x + ", " + mapP.y));
		cc.log("convertTest : revert point: " + (p2.x + ", " + p2.y));

		cc.log("device 100px to inch: " + cc.DENSITYDPI_DEVICE);
	}

});

MapEvents.MAP_VIEW_CHANGED = "MAP_VIEW_CHANGED";
MapEvents.MAP_VIEW_CHANGING = "MAP_VIEW_CHANGING";
MapEvents.MAP_ELEMENT_SELECT = "MAP_ELEMENTS_SELECT";
MapEvents.SELECT_POLYLINE_ID = "SELECT_POLYLINE_ID";
MapEvents.MAP_MARKER_SELECT = "MAP_MARKER_SELECT";
