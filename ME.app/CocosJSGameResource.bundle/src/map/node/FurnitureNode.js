var FurnitureNode = MapNode.extend({

	// 相关属性
	_fillNode : null,
	
	onCreate : function(){
		
		this.nodeType = MapNode.TYPE_POLYGON;
		
		var parent = this.parentLayer;

		var fillNode = new cc.DrawNode();
		parent.addChild(fillNode);
		this._fillNode = fillNode;

		this._fillNode.setVertexZ(0);
		this._fillNode.setLocalZOrder(this.style.zIndex);
		
		this.drawScale= 0.2;
		
	},
	
	drawShape : function(points, style){
		
		var ps = [];
		var lastX = null;
		var lastY = null;
		for(var i=0; i<points.length; i++){
			var p = points[i];
			var px = Math.floor( p.x * MapConsts.PIXEL_PER_METER);
			var py = Math.floor( p.y * MapConsts.PIXEL_PER_METER);

			if(Math.abs(px-lastX)<0.5 && Math.abs(py-lastY)<0.5){
				continue;
			}

			lastX = px;
			lastY = py;

			ps.push(cc.p(px,  py));
		}
		
		// 画填充
		if(style.fillColor){
			MapUtil.drawPolygon(this._fillNode, ps, style.fillColor);
		}

		// 画边线
		MapUtil.drawPolygon(this._fillNode, ps, null, style.borderWidth * this.drawScale, style.borderColor);
	},

	paint : function(){
		
	},

	clear : function(){
		if(this._fillNode!=null){
			this._fillNode.clear();
		}
	},
	
	setVisible : function(visible){
		this.visible = visible;

		if(this._fillNode!=null){
			this._fillNode.visible = visible;
		}
		
	},
	
	removeSelf : function(){
		
		if(this._fillNode!=null){
			this._fillNode.removeFromParent(true);
			this._fillNode = null;
		}
	},

	onMapViewChanged : function(viewParam){
		this._super(viewParam);
	}


});

