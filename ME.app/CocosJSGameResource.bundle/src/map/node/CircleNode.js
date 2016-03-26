
var CircleNode = MapNode.extend({

	// 相关属性
	center : null,
	radius : 0,

	_fillNode : null,

	onCreate : function(){
		
		this.nodeType = MapNode.TYPE_CIRCLE;
		
		var fillNode = new cc.DrawNode();
		this.parentLayer.addChild(fillNode, 1);
		this._fillNode = fillNode;
	},

	paint : function(){

//		this.setLocalZOrder(this.style.shadowSize);
		
		var _p = cc.p(this.center.x * MapConsts.PIXEL_PER_METER, this.center.y * MapConsts.PIXEL_PER_METER);
		var _r = this.radius * MapConsts.PIXEL_PER_METER;
		
//		MU.logObj({c : _p, r: _r, style : this.style});
		
		if(this.style.fillColor){
			this._fillNode.drawDot(_p, _r, this.style.fillColor);
		}
		if(this.style.borderWidth){
			this._fillNode.drawCircle(_p, _r, 0, 256, false, this.style.borderWidth * this.drawScale, this.style.borderColor);
		}
	},

	clear : function(){
		if(this._fillNode!=null){
			this._fillNode.clear();
		}
	},
	
	removeSelf : function(){
		if(this._fillNode!=null){
			this._fillNode.removeFromParent(true);
			this._fillNode = null;
		}
	},

	setVisible : function(visible){
		this._super(visible);
	},
	
	onMapViewChanged : function(viewParam){
//		this._super(viewParam);

		if(viewParam.drawScaleChanged || viewParam.floorChanged || viewParam.addNew){
			this.drawScale = viewParam.map.drawScale;
			this.isDirty = true;
		}
	}


});

