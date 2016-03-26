
var MapService = {
	DEFAULT_THEME : "default",
	DEFAULT_MAPID : "test",
	
	mapDataPath : "data/map/",
	
	createMapStyles : function(theme){
		theme = theme || this.DEFAULT_THEME;
		
		var themeUrl = "data/themes/" + theme+ ".json" ;
		var str = AppContext.nativeReadFileOnSdcard(themeUrl);
		
		if(str==null || str==""){
			str = jsb.fileUtils.getStringFromFile("res/themes/" + theme+ ".json");
		}
		
		return new MapStyles(JSON.parse(str)  );
	},
	
	loadMapFurnitures : function(mapId){
		//zpg
		var mapUrl = this.mapDataPath + mapId + "/" + mapId + ".zft";
		var str = AppContext.nativeReadCompressedFile(mapUrl);
		
		var mapInfo = null;
		if(str){
			mapInfo = JSON.parse(str);
			mapInfo = new MapInfo(mapInfo);
		}
		
		return  mapInfo;
		
	},
	
	loadMapFileJson : function(mapId, type, floor){
		
		var fileUrl = this.mapDataPath + mapId + "/" + mapId + "." + type;
		var str = AppContext.nativeReadCompressedFile(fileUrl);
		
		if(str){
			return JSON.parse(str);
		}
		
		return null;
	},
	
	createMapLayer2 : function(mapId, theme){
		theme = theme || MapStyles.defaultStyle;
		
		MU.log("create map start " + mapId);
		
		//mapStyles
		var mapStyles = this.createMapStyles(theme);
		MU.log("create map createMapStyles finish " + mapId);
		
		//mapInfo
		var mapInfo = this.loadMapFileJson(mapId, "zpg");
		if(mapInfo){
			mapInfo = new MapInfo(mapInfo);
		}
		MU.log("create map mapinfo finish " + mapId);
		
		//mapFurnitures
		var mapFurnitures = this.loadMapFileJson(mapId, "zft");
		if(mapFurnitures){
			mapFurnitures = new MapInfo(mapFurnitures);
		}
		MU.log("create map loadMapFurnitures finish " + mapId);
		
		//mapPOI
		var mapPoi = this.loadMapFileJson(mapId, "zpoi");
		if(mapPoi){
			MU.logObj(mapPoi);
		}
		
		//mapBeacons
		var mapBeacons = this.loadMapFileJson(mapId, "zbc");
		if(mapBeacons){
			MU.logObj(mapBeacons);
		}
		
		MU.log("create map load poi and beacons finish " + mapId);
		//mapLayer
		var mapParam = {
			mapStyles : mapStyles,
			mapInfo : mapInfo,
			mapFurnitures : mapFurnitures
		};
		var map = new MapLayer(mapParam);
		MU.log("create map create map finish " + mapId);
		
		//initMap
		map.initMap();
		MU.log("create map initMap finish " + mapId);
		
		return map;
	},
	
	createMapLayer :function(mapId, theme){
		theme = theme || MapStyles.defaultStyle;

		MU.log("create map start " + mapId);
		//mapStyles
		var mapStyles = this.createMapStyles(theme);
		MU.log("create map createMapStyles finish " + mapId);
		//mapInfo
		var mapInfo = this.queryMapInfo(mapId);
		if(mapInfo==null){
			Popup.showMsg("加载地图出错！");
		}
		MU.log("create map mapinfo finish " + mapId);
		
		//mapLayer
		var mapParam = {
						mapStyles : mapStyles,
						mapInfo : mapInfo
		};
		var map = new MapLayer(mapParam);
		MU.log("create map create map finish " + mapId);

		//initMap
		map.initMap();
		MU.log("create map initMap finish " + mapId);

		return map;
	},
	
	queryMapInfo : function(mapId){
		var sql = "select mapid, mapname, direction, boundsLeft, boundsRIght, boundsTop, boundsBottom, floorScope,multi_zone_floor from map_info";
		var rs = AppContext.nativeQueryMapData(mapId, "main",sql);
		
		var mapInfo;
		if(rs){
			rs = rs[0];
			mapInfo = {mapId : rs[0], mapName : rs[1], direction : parseInt(rs[2]), 
							mapBounds : {left : parseInt(rs[3]), right : parseInt(rs[4]), top : parseInt(rs[5]), bottom : parseInt(rs[6])}, 
							floorScope : JSON.parse(rs[7]),multi_zone_floor:JSON.parse(rs[8])};
			
			mapInfo = new MapInfo(mapInfo);
		}
		
		return mapInfo;
	},
	
	queryMapPolygons : function(mapId, floor){
		//reftype not in (1202, 2125)
		var sql = "select name, floor, reftype, refid, geom from map_polygon where geom is not null";
		if(floor!=null){
			sql += " and floor="+floor;
		}
		var polys = AppContext.nativeQueryMapData(mapId, "main", sql);
		
		var rs = [];
		if(polys){
			for(var i=0; i<polys.length; i++){
				var poly = polys[i];
				var data = {};
				data.name = poly[0];
				data.floor = parseInt( poly[1]);
				data.refType = poly[2];
				data.refId = poly[3];
				data.geometry = JSON.parse(poly[4]);
				
				rs.push(data);
			}
		}
		
		return rs;
	},
	
	createMapFurnitureQuery : function(mapId, floor){
		//reftype not in (3117, 3111, 3110, 3116, 3118)
		var sql = "select name, floor, reftype, refid, geom from map_furniture  where refType>0 ";
		if(floor!=null){
			sql += " and floor="+floor;
		}
		return AppContext.nattiveCreateMapQuery(mapId, "fn",sql);
	},
	
	queryMapFurnitureDataByPage : function(mapId, queryId, pageSize){
		var fns = AppContext.nativeQueryMapDataByPage(mapId, "fn", queryId, pageSize);
		var rs = [];
		if(fns){
			for(var i=0; i<fns.length; i++){
				var poly = fns[i];
				var data = {};
				data.name = poly[0];
				data.floor = parseInt( poly[1]);
				data.refType = poly[2];
				data.refId = poly[3];
				data.geometry = JSON.parse(poly[4]);
				
				rs.push(data);
			}
		}

		return rs;
	},
	
	queryMapBeacons : function(mapId){
		//reftype not in (1202, 2125)
		var sql = "select floor, refid, x, y from map_beacon where refType =9001";
		var bcs = AppContext.nativeQueryMapData(mapId, "poi", sql);

		var rs = [];
		if(bcs){
			for(var i=0; i<bcs.length; i++){
				var bc = bcs[i];
				var data = {};
				data.floor = parseInt( bc[0]);
				data.minor = parseInt( bc[1]);
				data.x = parseFloat( bc[2]);
				data.y = parseFloat( bc[3]);

				rs.push(data);
			}
		}

		return rs;
	}
	
};


