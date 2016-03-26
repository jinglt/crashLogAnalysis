
var LocateButton = ccui.Layout.extend({
	
	mapView : null,
	button: null,
	normalSprite : null,
	sucSprite : null,
	positionInited : false,
	
	ctor : function(mapView){
		this._super();
		this.mapView = mapView;
		this.initView();
		
		this.button.addTouchEventListener(this.touchEvent, this);
		
		this.schedule(this.updateView.bind(this), 0.5);
	},
	
	initView : function(){
		var margin = AppContext.baseWidth / 640 * 5;
		var btnWidth =  AppContext.dp2Px(40); //AppContext.baseWidth / 640 * 69 + margin;
		
		this.setContentSize(cc.size(btnWidth, btnWidth));
//		this.setBackGroundImage(res.btn_small_9);
//		this.setBackGroundImageScale9Enabled(true);
		
		var btn = new ccui.Button();
		this.button = btn;
		btn.setTouchEnabled(true);
		btn.setScale9Enabled(true);
		btn.setContentSize(btnWidth, btnWidth);
		btn.loadTextures(res.window_small_bg_9, res.window_small_bg_pressed_9, "");
		btn.attr({
			x : btnWidth/2,  
			y : btnWidth/2,
			anchorX : 0.5,
			anchorY : 0.5
		});
		this.addNode(btn);
		
		//normalSprite
		this.normalSprite = new cc.Sprite(res.icon_locate);
		this.normalSprite.attr({
			x : btnWidth/2,  
			y : btnWidth/2,
			anchorX : 0.5,
			anchorY : 0.5,
			scale : btnWidth*0.5/this.normalSprite.width
		});
		
		this.addNode(this.normalSprite);
		
		//sucSprite
		this.sucSprite = new cc.Sprite(res.icon_position);
		this.sucSprite.attr({
			x : btnWidth/2,  
			y : btnWidth/2,
			anchorX : 0.5,
			anchorY : 0.5,
			scale : btnWidth*0.6/this.sucSprite.height
		});

		this.addNode(this.sucSprite);

		this.sucSprite.visible = false;
	},
	
	showMapPosition : function(){
		if(this.mapView.mapLayer!=null){
			
			var map =this.mapView.mapLayer;
			var p = PositionService.currentPosition;
			if(p !=null && p.mapId == map.mapId){

				if(p.floor!=0 && p.floor!=map.viewFloor){
					map.drawFloor(p.floor);
				}
				var scaleTo = map.maxScale / 4;
				if(map.viewScale > scaleTo){
					scaleTo = map.viewScale;
				}
				
				this.mapView.mapLayer.setMapView(p, scaleTo, null, null, true);
			}

		}

	},
	
	touchEvent: function (sender, type) {
		switch (type) {
		case ccui.Widget.TOUCH_BEGAN:
			break;
		case ccui.Widget.TOUCH_MOVED:
			break;
		case ccui.Widget.TOUCH_ENDED:

			this.showMapPosition();
			break;
		case ccui.Widget.TOUCH_CANCELED:
			break;

		default:
			break;
		}
	},
	
	updateView : function(){
		
		if(PositionService.currentPosition != null && PositionService.currentPosition.mapId!=""){
			this.normalSprite.visible = false;
			this.sucSprite.visible = true;
			if(!this.positionInited){
				this.showMapPosition();
				this.positionInited = true;
			}
		}else{
			this.normalSprite.visible = true;
			this.sucSprite.visible = false;
			this.positionInited = false;
		}
		
	}
	
});

