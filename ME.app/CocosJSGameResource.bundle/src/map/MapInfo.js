

var MapInfo = cc.Class.extend({
	
	//原始属性
	mapId : "",
	mapName : "",
	mapBounds : {},
	floorScope : [],
	direction : 0,
//	baseGround : null,
//	crossRoad : null,
//	floors : [],
//	floorMap : {},
	multi_zone_floor:[],
	
	//计算属性
	mapSize:null,
	mapSizeInPixel:null,
	mapCenter:null,
	mapRect:null,
	mapRectInPixel:null,
	
	ctor : function(props){
		cc.extend(this, props||{});
		
//		this.floorMap = {};
//		var floors = PathService.queryMapPaths(this.mapId);
//		for(var i=0; i<floors.length; i++){
//			var floor = new MapPart(floors[i]);
//			this.floorMap["" + floor.floor] = floor;
//		}
//		this.baseGround = this.floorMap[1];
		
		/*
		this.baseGround = new MapPart(this.baseGround);
		this.crossRoad = new MapPart(this.crossRoad);
		
		this.floorMap = {};
		this.floorMap["0"] = this.baseGround;
		var floors = [];
		floors.push(this.baseGround);
		
		for(var i=0; i<this.floors.length; i++){
			var floor = new MapPart(this.floors[i]);
			floors.push(floor);
			this.floorMap["" + floor.floor] = floor;
		}
		
		this.floors = floors;
		
		
		this.mapBounds = this.baseGround.bounds;
		
		*/
		
		
//		cc.log("mapBounds: " + JSON.stringify(this.mapBounds));
		this.mapSize = this.getMapSize();
		this.mapSizeInPixel = this.getMapSizeInPixel();
		this.mapCenter = this.getMapCenter();
//		cc.log("mapCenter: " + JSON.stringify(this.mapCenter));
	},
	
	/**
	 * 获取地图大小
	 * 
	 * @returns
	 */
	getMapSize : function(){
		if(this.mapSize==null){
			var mb = this.mapBounds;
			this.mapSize = cc.size(mb.right-mb.left, mb.top-mb.bottom);
		}
		return this.mapSize;
	},
	
	/**
	 * 获取地图scale为1时的大小
	 * 
	 * @returns
	 */
	getMapSizeInPixel : function(){
		if(this.mapSizeInPixel==null){
			var mb = this.mapBounds;
			this.mapSizeInPixel = cc.size(MapConsts.PIXEL_PER_METER * (mb.right-mb.left), MapConsts.PIXEL_PER_METER * (mb.top-mb.bottom));
		}
		return this.mapSizeInPixel;
	},
	
	getMapCenter : function(){
		if(this.mapCenter == null){
			var mb = this.mapBounds;
			this.mapCenter = cc.p( (mb.right+mb.left)/2,  (mb.top+mb.bottom) / 2);
		}
		return this.mapCenter;
	},
	
	getMapRect : function(){
		if(this.mapRect == null){
			var mb = this.mapBounds;
			this.mapRect = cc.rect(mb.left, mb.bottom, mb.right-mb.left, mb.top - mb.bottom);
		}
		return this.mapRect;
	},
	
	getMapRectInPixel : function(){
		if(this.mapRectInPixel==null){
			var mb = this.mapBounds;
			this.mapRectInPixel = cc.rect(mb.left * MapConsts.PIXEL_PER_METER, mb.bottom * MapConsts.PIXEL_PER_METER, 
					(mb.right-mb.left) * MapConsts.PIXEL_PER_METER, (mb.top - mb.bottom) * MapConsts.PIXEL_PER_METER);
		}
	
		return this.mapRectInPixel;
	}
	
});




