
var ScaleBar = ccui.Widget.extend({
	
	initWidth : 50,
	drawNode : null,
	label : null,
	mapView : null,
	
	ctor : function(mapView){
		this._super();
		this.mapView = mapView;
		this.initView();
		
		cc.eventManager.addCustomListener(MapEvents.MAP_VIEW_CHANGING, this.updateView.bind(this));
	},
	
	initView : function(){

		this.initWidth = AppContext.dp2Px(70);
		var viewWidth = this.initWidth;
		var viewHeight = AppContext.dp2Px(40);
		this.setContentSize(this.initWidth * 1.5, viewHeight);
		
		this.drawNode = new cc.DrawNode();
		this.addChild(this.drawNode);

		
		var lineHeight = this.initWidth/10;
		var color = cc.color(0, 0, 0, 255);

		this.drawNode.drawSegment(cc.p(0, lineHeight), cc.p(0, 0), 1.5, color);
		this.drawNode.drawSegment(cc.p(0, 1), cc.p(viewWidth, 1), 2, color);
		this.drawNode.drawSegment( cc.p(viewWidth, 0), cc.p(viewWidth, lineHeight), 1.5, color);

		this.label = new cc.LabelTTF("米", null, (AppContext.dp2Px(15)));
		this.label.setFontFillColor(color);
		this.addChild(this.label);

		this.label.attr({
			x : viewWidth/2,
			y : lineHeight,
			anchorX : 0.5,
			anchorY : 0
		});

		
	},
	
	updateView : function(evtObj){
		var udata = evtObj.getUserData();
		var map = udata.map;
		if(udata.scaleChanged){
			
			var width = MapConsts.PIXEL_PER_METER*map.scale;
			var meter = 1;

			while(width < this.initWidth/2){
				var factor = 0;

				if(meter==2 || meter==20 || meter==200){
					factor = 2.5;
				}else{
					factor = 2;
				}
				width = width*factor;
				meter = meter*factor;
			}

			this.label.setString(meter + "米");
			this.label.x = width/2;
			this.drawNode.scaleX = width / this.initWidth ;
			
		}
			
	}
	
	
});

