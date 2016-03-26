
var MapElement = cc.Class.extend({
	
	// 相关属性
	gid : -1,
	name : "",
	refType : "",
	refId : "",
	floor : 0,
	centerX : 0,
	centerY : 0,
	// 几何对象
	geometry : {},
	points : null,
	bounds : null,
	
	ctor : function(props){
		
		cc.extend(this, props||{});
		
//		cc.log("MapElement : " + this.name + ", " + this.refType + ", "  + this.viewLevel);
		this.x = 0;
		this.y = 0;
		this.anchorX = 0;
		this.anchorY = 0;
		
		var points = [];
		var bounds = {};
		var startI = 0;

		if(this.geometry!=null){
			if(this.geometry.type=="MultiPolygon"){
				var cs = this.geometry.coordinates[0][0];
				for(var i=0; i<cs.length-1; i++){
					var mp = cc.p(cs[i][0], cs[i][1]);
					points.push(mp);

					bounds.left = Math.min(mp.x, bounds.left || mp.x);
					bounds.right = Math.max(mp.x, bounds.right || mp.x);
					bounds.top = Math.max(mp.y, bounds.top || mp.y);
					bounds.bottom = Math.min(mp.y, bounds.bottom || mp.y);

				}
			}else if(this.geometry.type=="Polygon"){
				var cs = this.geometry.coordinates[0];
				for(var i=0; i<cs.length-1; i++){
					var mp = cc.p(cs[i][0], cs[i][1]);
					points.push(mp);

					bounds.left = Math.min(mp.x, bounds.left || mp.x);
					bounds.right = Math.max(mp.x, bounds.right || mp.x);
					bounds.top = Math.max(mp.y, bounds.top || mp.y);
					bounds.bottom = Math.min(mp.y, bounds.bottom || mp.y);

				}
			}
			
			this.centerX = (MU.isNull(bounds.left, 0) + MU.isNull(bounds.right, 0))/2;
			this.centerY = (MU.isNull(bounds.top, 0) + MU.isNull(bounds.bottom, 0))/2;
		}
		
		if(false && points.length>6){
			
			var lastLength = points.length;
			points = MapUtil.polyPointsReduce(points);
			MapUtil._logPolyReduce(this.refType + "_" +this.name, lastLength, points.length);
//			cc.log("polyPointsReduce  "+ this.name +" : " + lastLength + " --> " + points.length);
		}
		
		
		delete this.geometry;
		this.points = points;
		this.bounds = bounds;
	}
	

});

