
var MarkerNode = MapNode.extend({
	
	_rootNode : null,
	node : null,
	box : null,
	
	onCreate : function(){
		this.nodeType = MapNode.TYPE_MARKER;
		
		this._rootNode = new cc.Node();
		this._rootNode.x = this.centerX * MapConsts.PIXEL_PER_METER;
		this._rootNode.y = this.centerY * MapConsts.PIXEL_PER_METER;
		this.parentLayer.addChild(this._rootNode);
		
//		this.node = node || this.node;
		this._rootNode.addChild(this.node);

		this.box = this.node.getBoundingBox();
	},
	
	isTouchOnMarker : function(dx, dy){
		
		var box = this.box;
		var right = box.x + box.width;
		var top = box.y + box.height;
		
//		MU.logObj([dx, dy, box]);
		
		if(dx <= right && dx >= box.x && dy <= top && dy >= box.y){
			return true;
		}
		
		return false;
	},
	
	selectMarker : function(){
		
		if(this.onMarkerSelect(this)){
			if(this.map!=null){

				if(this.floor!=0 && this.map.viewFloor!=this.floor){
					this.map.drawFloor(this.floor);
				}
				this.map.panTo(cc.p(this.centerX, this.centerY), true);
			}
		}
	},
	
	onMarkerSelect : function(marker){
		MU.logObj(marker, ["floor", "x", "y"]);
	},
	
	paint : function(){
		
	},
	
	clear : function(){
		
	},
	
	removeSelf : function(){
		if(this._rootNode!=null){
			this._rootNode.removeFromParent(true);
			this._rootNode = null;
		}
	},
	
	moveTo : function(x, y, floor){
		this.centerX = x;
		this.centerY = y;
		this._rootNode.x = this.centerX * MapConsts.PIXEL_PER_METER;
		this._rootNode.y = this.centerY * MapConsts.PIXEL_PER_METER;
		
		if(floor!=this.floor){
//			cc.log("floor : " + floor + ", mapFloor : " + map.viewFloor);
			this.floor = floor;
			this.onMapViewChanged({map : this.map, floorChanged : true});
		}
	},
	
	setVisible : function(visible){
		this.visible = visible;
		this._rootNode.visible = visible;
	},
	
	onMapViewChanged : function(viewParam){

		if(viewParam.floorChanged || viewParam.addNew){
			var visible = (this.floor==0 || this.floor == viewParam.map.viewFloor);
			this.setVisible(visible);
		}
		
		if(viewParam.rotationChanged || viewParam.floorChanged || viewParam.addNew){
			this._rootNode.rotation = -viewParam.map.viewRotation;
		}

		if(viewParam.scaleChanged || viewParam.floorChanged || viewParam.addNew){
			this._rootNode.scale = 1/viewParam.map.viewScale;
		}

	}
	


});

