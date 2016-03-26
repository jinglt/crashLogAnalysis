var Compass = ccui.Widget.extend({
	
	initWidth : 128,
	mapView : null,
	theCompass : null,
	theBack : null,
	rotating : false,
	targetRotation : 0,
	
	ctor : function(mapView){
		this._super();
		this.mapView = mapView;
		this.initWidth =  AppContext.dp2Px(40); //AppContext.baseWidth / 640 * 74;
		this.initView();
		
		this.setTouchEnabled(true);
		this.addTouchEventListener(this.touchEvent, this);
		cc.eventManager.addCustomListener(MapEvents.MAP_VIEW_CHANGING, this.updateView.bind(this));
	},
	
	initView : function(){
		
		this.setContentSize(cc.size(this.initWidth, this.initWidth));
		
//		var drawNode = new cc.DrawNode();
//		drawNode.attr({
//			x : this.initWidth/2,  
//			y : this.initWidth/2
//		});
//		
		var bg = new cc.Sprite(res.compass_bg);
		bg.scale = this.initWidth/bg.width;
		bg.x = this.initWidth/2;
		bg.y = this.initWidth/2;
		this.addChild(bg);
		this.theBack = bg;
		
		var cps = new cc.Sprite(res.compass);
		cps.attr({
			x : this.initWidth/2,  
			y : this.initWidth/2,
			anchorX : 0.5,
			anchorY : 0.5
		});
		
		cps.scale = this.initWidth  /cps.width;
		this.addNode(cps);
		
		this.theCompass = cps;
		if(this.mapView.mapLayer!=null){
			this.rotation = this.mapView.mapLayer.viewRotation - this.mapView.mapLayer.direction;
		}
		
		this.hideBack();
	},
	
	hideBack : function(){
//		this.theBack.clear();
//		this.theBack.drawCircle(cc.p(0,0), this.initWidth/2, 0, 256, false, this.initWidth/50, cc.color(150, 150, 150, 150));
	},
	
	showBack : function(){
//		this.theBack.clear();
//		this.theBack.drawDot(cc.p(0,0), this.initWidth/2, cc.color(255, 255, 255, 150));
//		this.theBack.drawCircle(cc.p(0,0), this.initWidth/2, 0, 256, false, this.initWidth/50, cc.color(150, 150, 150, 150));
	},
	
	touchEvent: function (sender, type) {
		switch (type) {
		case ccui.Widget.TOUCH_BEGAN:
			break;
		case ccui.Widget.TOUCH_MOVED:
			break;
		case ccui.Widget.TOUCH_ENDED:

			this.updateMapRotation();
			break;
		case ccui.Widget.TOUCH_CANCELED:
			break;

		default:
			break;
		}
	},
	
	updateView : function(evtObj){
		var udata = evtObj.getUserData();
		var map = udata.map;
		if(udata.rotationChanged){
			this.rotation = map.rotation - map.direction;
			
			if(map.rotation==0){
				this.hideBack();
			}else{
				this.showBack();
			}
		}
	},
	
	updateMapRotation : function(r){
		
		if(r==null){
			if(this.rotating){
				return;
			}
			
			if(this.mapView.mapLayer.viewRotation==0){
				this.targetRotation = this.mapView.mapLayer.direction;
			}else{
				this.targetRotation = 0;
			}
			
			r =  (this.mapView.mapLayer.viewRotation - this.targetRotation + 360)%360/30;
			this.rotating = true;
			cc.log("updateMapRotation : targetRotation : " + this.targetRotation + ", r : " + r);
		}
		
		var mapR = this.mapView.mapLayer.viewRotation;
		
//		cc.log(new Date().getTime() + " ： updateMapRotation : " + mapR + ", r : " + r);
		
		if(mapR==this.targetRotation || r==0){
			this.rotating = false;
			return;
		}
		
		if( Math.abs(r) > Math.abs((mapR - this.targetRotation)%360)){
			this.mapView.mapLayer.setMapView(null, null, null, this.targetRotation, false);
			this.rotating = false;
		}else{
//			cc.log(new Date().getTime() + " ： mapR- r : " + (mapR - r));
			this.mapView.mapLayer.setMapView(null, null, null, mapR- r, false);
			this.scheduleOnce(this.updateMapRotation.bind(this, r));
		}
		
	}
	
});

