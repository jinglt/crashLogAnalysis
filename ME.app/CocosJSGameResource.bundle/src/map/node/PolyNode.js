var PolyNode = MapNode.extend({

	// 相关属性
	points : [],
	drawPoints : [],
	shadowPoints : [],
	drawShadow : false,

	_fillNode : null,
	_borderNode : null,
	
	onCreate : function(){
		this.nodeType = MapNode.TYPE_POLYGON;
		
		var parent = this.parentLayer;
		
		var fillNode = new cc.DrawNode();
		parent.addChild(fillNode);
		this._fillNode = fillNode;
		
		var borderNode = new cc.DrawNode();
		parent.addChild(borderNode);
		this._borderNode = borderNode;
		
		this._fillNode.setVertexZ(0);
		this._borderNode.setVertexZ(0);
		
		this._fillNode.setLocalZOrder(this.style.zIndex);
		this._borderNode.setLocalZOrder(this.style.zIndex);
		
		
		var ps = [];
		var lastX = null;
		var lastY = null;
		for(var i=0; i<this.points.length; i++){
			var p = this.points[i];
			var px = Math.floor( p.x * MapConsts.PIXEL_PER_METER);
			var py = Math.floor( p.y * MapConsts.PIXEL_PER_METER);
			
			if(Math.abs(px-lastX)<0.5 && Math.abs(py-lastY)<0.5){
				continue;
			}
			
			lastX = px;
			lastY = py;
			
			ps.push(cc.p(px,  py));
		}
		
		if(lastX==ps[0].x && lastY==ps[0].y){
			ps.pop();
		}

		this.drawPoints = ps;
		
		if(this.drawShadow && this.style.shadowSize>0){

// var sdx = Math.floor(-this.style.shadowSize);
// var sdy = Math.floor(-this.style.shadowSize);
			
			var sdx = 0;
			var sdy = 0;
			
			this._fillNode.x = -sdx;
			this._fillNode.y = -sdy;

			var sdps = [];
			for(var i=0; i<ps.length; i++){
				var p1, p2, p3, p4;
				p1 = ps[i];
				p2 = cc.p(p1.x - sdx, p1.y - sdy);
				if(i==ps.length-1){
					p3 = ps[0];
				}else{
					p3 = ps[i+1];
				}
				p4 = cc.p(p3.x - sdx, p3.y - sdy);

				sdps.push([p1,p2,p4,p3]);

			}

			sdps.sort(function(b, a){

				var ca = cc.pMidpoint(a[0], a[3]);
				var cb = cc.pMidpoint(b[0], b[3]);

				return ca.x + ca.y - cb.x - cb.y;
			});

			this.shadowPoints = sdps;

		}
		
		// 画填充
		if(this.style.fillColor){
			if(false && this.floor==0 && ( this.refType==1301  && this.refId==1185 )){
				MU.log("skip drawPolygon : " + this.refType + "_" + this.refId);
			}else{
				MapUtil.drawPolygon(this._fillNode, this.drawPoints, this.style.fillColor);
			}
			
		}
		
	},

	paint : function(){
		// 画边线
		MapUtil.drawPolygon(this._borderNode, this.drawPoints, null, (this.style.borderWidth * this.drawScale), this.style.borderColor);
		
		//画block dots
		if(this.style.dotsColor!=null){
			
			var bLeft = this.bounds.left * MapConsts.PIXEL_PER_METER;
			var bRIght = this.bounds.right * MapConsts.PIXEL_PER_METER;
			var bBottom = this.bounds.bottom * MapConsts.PIXEL_PER_METER;
			var bTop = this.bounds.top * MapConsts.PIXEL_PER_METER;
			
			var dis = Math.max(this.drawScale, 2) * 20;
			var radius = Math.max(this.drawScale, 2) * 3;
			
//			MU.logObj([this.name, this.bounds, dis * MapConsts.PIXEL_PER_METER, radius]);
			
			for(var px = bLeft + dis/2; px <bRIght; px+=dis ){
				for(var py = bBottom + dis/2; py < bTop; py+=dis ){

					var dot = cc.p(px, py);
					if(MU.isInsidePoly(dot, this.drawPoints)){
//						MU.logObj({dot : dot, dis :dis, radius : radius});
						this._borderNode.drawDot(dot, radius, this.style.dotsColor);
//						this._borderNode.drawSegment(cc.p(px-radius, py-radius), cc.p(px+radius, py+radius), 2, this.style.dotsColor);
//						this._borderNode.drawSegment(cc.p(px-radius, py+radius), cc.p(px+radius, py-radius), 2, this.style.dotsColor)
					}
				}
			}
		}

		// 画阴影
		if(this.drawShadow && this.style.shadowSize>0){
			var c = this.style.fillColor || cc.color.GRAY;
			var crate = 0.9;
			var shadowColor = cc.color(c.r * crate, c.g * crate, c.b * crate, c.a * crate);
			MapUtil.drawPolygon(this._borderNode, this.drawPoints, shadowColor);
		}
		

		
		/*
		 * if(this.drawShadow && this.style.shadowSize>0){ var sdps =
		 * this.shadowPoints;
		 * 
		 * for(var i in sdps){ var sdp = sdps[i];
		 * 
		 * if(Math.abs(sdp[0].x-sdp[3].x) > Math.abs(sdp[0].y-sdp[3].y)){
		 * MapUtil.drawPolygon(this._borderNode, sdp, this.style.borderColor,
		 * this.style.borderWidth * this.drawScale, this.style.borderColor);
		 * }else{ MapUtil.drawPolygon(this._borderNode, sdp,
		 * this.style.borderColor, this.style.borderWidth * this.drawScale,
		 * this.style.borderColor); } } }else{
		 * MapUtil.drawPolygon(this._borderNode, this.drawPoints, null,
		 * this.style.borderWidth * this.drawScale, this.style.borderColor); }
		 */
	},

	clear : function(){
		if(this._borderNode!=null){
			this._borderNode.clear();
		}

		if(this._fillNode!=null){
//			this._fillNode.clear();
		}
		
	},
	
	setVisible : function(visible){
		this.visible = visible;
		if(this._borderNode!=null){
			this._borderNode.visible = visible;
		}

		if(this._fillNode!=null){
			this._fillNode.visible = visible;
		}
		
	},
	
	removeSelf : function(){
		if(this._borderNode!=null){
			this._borderNode.removeFromParent(true);
			this._borderNode = null;
		}
		
		if(this._fillNode!=null){
			this._fillNode.removeFromParent(true);
			this._fillNode = null;
		}
	},

	onMapViewChanged : function(viewParam){
		this._super(viewParam);
		
		if(viewParam.drawScaleChanged || viewParam.floorChanged || viewParam.addNew){
			this.drawScale = Math.ceil(viewParam.map.drawScale);
			this.isDirty = true;
		}
	}


});

