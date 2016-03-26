var QueryService = cc.extend({
	
	QUERY_HIS_KEY : "jdmap_query_his",
	QUERY_HIS_FILE : "/queryHis.dat",
	
	queryKeys : null,
	
	queryPolygon : function(mapId, sql){
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
				data.desc = poly[5];

				var ele = new MapElement(data);
				rs.push(ele);
			}
		}
		
		return rs;
	},
	
	queryPOI : function(mapId, sql){
		var pois = AppContext.nativeQueryMapData(mapId, "poi", sql);
		var rs = [];
		if(pois){
			for(var i=0; i<pois.length; i++){
				var poi = pois[i];
				var data = {};
				data.name = poi[0];
				data.floor = parseInt( poi[1]);
				data.refType = parseInt( poi[2]);
				data.refId = poi[3];
				data.desc = poi[4];
				data.centerX = parseFloat( poi[5]);
				data.centerY = parseFloat( poi[6]);

				rs.push(data);
			}
		}
		return rs;
	},
	
	queryElements : function(mapId, queryWord){
		queryWord = queryWord.replace(/(^\s*)|(\s*$)/g,"").toUpperCase(); // 前后空格
		queryWord = queryWord.replace(/(')|(\s*)/g, ""); // 单引号转换
		
		
// MU.log("queryWord : " + queryWord);
		
		// 查询多边形
		// reftype not in (1202, 2125)
		
		var sql;
		//匹配名称
		var rs = [];
		sql = "select name, floor, reftype, refid, geom, remark from map_polygon where name like '%"+queryWord+"%'";
		rs = rs.concat(this.queryPolygon(mapId, sql));
		sql = "select name, floor, reftype, refid,  remark, x, y from map_poi where name like '%"+queryWord+"%'";
		rs = rs.concat(this.queryPOI(mapId, sql));
		
		rs.sort(function(a, b){
			return a.floor-b.floor;
		});
		
		//匹配备注
		var rs2 = [];
		sql = "select name, floor, reftype, refid, geom, remark from map_polygon where  name not like '%"+queryWord+"%' and remark like '%"+queryWord+"%'";
		rs2 = rs2.concat(this.queryPolygon(mapId, sql));
		sql = "select name, floor, reftype, refid,  remark, x, y from map_poi where name not like '%"+queryWord+"%' and remark like '%"+queryWord+"%'";
		rs2 = rs2.concat(this.queryPOI(mapId, sql));
		
		rs2.sort(function(a, b){
			return a.floor-b.floor;
		});
		
		rs = rs.concat(rs2);
		
		// 保存查询历史
		this.addQueryKey(queryWord, rs.length);

		return rs;
		
	},
	
	addQueryKey : function(key, count){
		
		var keys = this.getQueryHisKeys();
		
		var data = {key : key, value : new Date().getTime(), desc : "最近查询"};
		
		var kidx = -1;
		for(var i in keys){
			var d = keys[i];
			
			if(d.key==key){
				d.value = new Date().getTime();
				d.desc = "最近查询";
				kidx = i;
			}
			
		}
		
		if(kidx<0){
			keys.push(data);
		}
		
		this.queryKeys.sort(function(a, b){
			return b.value - a.value;
		});
		
		if(this.queryKeys.length>10){
			this.queryKeys = this.queryKeys.slice(0,10);
		}
		
		AppContext.nativeWriteFileOnSdcard(AppContext.DATA_PATH + this.QUERY_HIS_FILE, JSON.stringify(keys));
	},
	
	getQueryHisKeys : function(){
		
		if(this.queryKeys==null){
			
			var keys = AppContext.nativeReadFileOnSdcard(AppContext.DATA_PATH + this.QUERY_HIS_FILE);
			
// cc.log("keys : " + keys);
			if(keys==null || keys == ""){
				keys = [];
			}else{
				keys = JSON.parse(keys);
			}
				
			this.queryKeys = keys;
			
			this.queryKeys.sort(function(a, b){
				return b.value - a.value;
			});
		}
		
		return this.queryKeys;
	}
	
});