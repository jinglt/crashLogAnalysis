
var PathNode = MapNode.extend({
	
	// 相关属性
	points : [],
	mainStyle : null,
	hideStyle : null,
	_drawNode : null,
	
	onCreate : function(){
		this.nodeType = MapNode.TYPE_PATH;

		this.mainStyle = this.style;
		this.hideStyle = cc.extend({}, this.style);
		this.hideStyle.lineColor = cc.color(200, 200, 220, 200);
		
		var drawNode = new cc.DrawNode();
		this.parentLayer.addChild(drawNode);
		this._drawNode = drawNode;
		
	},
	
	paint : function(){
		var drawNode = this._drawNode;
		
		var ps = [];
		for(var i=0; i<this.points.length; i++){
			var p = this.points[i];
			ps.push(cc.p(Math.round( p.x * MapConsts.PIXEL_PER_METER),  Math.round(p.y * MapConsts.PIXEL_PER_METER)));
		}
		
		//边框色
		var lWidth = Math.round(this.style.lineWidth * this.drawScale);
		for(var i=1; i<ps.length; i++){
			drawNode.drawSegment(ps[i-1], ps[i],  lWidth, this.style.lineColor2);
		}
		//中间色
		lWidth = Math.round(this.style.lineWidth * this.drawScale - this.style.baseLineWidth);
		for(var i=1; i<ps.length; i++){
			drawNode.drawSegment(ps[i-1], ps[i],  lWidth, this.style.lineColor);
		}
		
		//画路径上的图标
		if(this.style.lineIcon!=null && this.style.lineIconSize>0){
			
			//根据图片大小计算点距
			var iconPath = this.style.iconPath + this.style.lineIcon;
			var imgSize = new cc.Sprite(iconPath).getContentSize();
			var imgScale = this.style.lineIconSize / imgSize.height * this.drawScale;
			var dotDis =  imgSize.height * imgScale * (this.style.lineIconDis || 1);

			//分段画图
			var leftDis = 0;
			for(var i=1; i<ps.length; i++){
				var lastP = ps[i-1];
				var curP = ps[i];
				var segDis = cc.pDistance(lastP, curP);
				var parts = (1.0 * segDis / dotDis);

				var xPart = (curP.x - lastP.x) / parts;
				var yPart = (curP.y - lastP.y) / parts;

				var angle = Math.atan2( -(curP.y-lastP.y), (curP.x-lastP.x));
				var r = cc.radiansToDegrees(angle);

				if((i==ps.length-1) && (parts - Math.floor(parts) < 1)){
//					parts+=1;
				}

				var px = lastP.x;
				var py = lastP.y;
				if(leftDis != 0){
					px += xPart * leftDis / dotDis;
					py += yPart * leftDis / dotDis;
					segDis -= leftDis;
					leftDis = 0;
				}

				while(segDis>0){

					var img = new cc.Sprite(iconPath);
					img.x = px;
					img.y = py;
//					img.anchorY=0;
					img.scale = imgScale;
					img.rotation = r;
					drawNode.addChild(img);
					segDis -= dotDis;
					px += xPart;
					py += yPart;
				}

				leftDis += -segDis;
			}
			
		}
		
		
	},
	
	clear : function(){
		if(this._drawNode){
			this._drawNode.clear();
			this._drawNode.removeAllChildren();
//			this._drawNode.removeFromParent(true);
//			this._drawNode = null;
		}
		
	},
	
	setVisible : function(visible){
		
		this.visible = visible;
		if(this._drawNode){
			this._drawNode.visible = visible;
		}
	},
	
	removeSelf : function(){
		if(this._drawNode!=null){
			this._drawNode.removeFromParent(true);
			this._drawNode = null;
		}
	},
	
	onMapViewChanged : function(viewParam){
//		this._super(viewParam);
		
		if(viewParam.floorChanged || viewParam.addNew){
			var visible = (this.floor==0 || this.floor == viewParam.map.viewFloor);
			this.setVisible(visible);
		}
		
		if(viewParam.drawScaleChanged || viewParam.floorChanged || viewParam.addNew){
			this.drawScale = viewParam.map.drawScale;
			this.isDirty = true;
		}
	}
	

});

