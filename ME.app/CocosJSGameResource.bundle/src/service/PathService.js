var PathService = cc.extend({
	naviStartEndCount : 0,
	naviStartPosition : null,
	closestPointStart : null,
	naviEndPosition: null,
	closestPointEnd : null,
	pathPids :[],
	
	floorMap : null,
	multi_zone_floor : null,
	ctor:function(){
	},

	init:function(mapLayer){
		this.multi_zone_floor= [].concat(mapLayer.mapInfo.multi_zone_floor);
		this.floorMap = {};
		for(var i=0;i<this.multi_zone_floor.length;i++){
			var floor = new MapPartRam(PathService.queryMapPaths(mapLayer.mapInfo.mapId,this.multi_zone_floor[i])[0]);
			this.floorMap["" + floor.floor] = floor;
		}
		var elevatorFloor = new MapPartRam(PathService.queryMapPaths(mapLayer.mapInfo.mapId,999)[0]);
		this.floorMap[999] = elevatorFloor;
	},
	createStartNode : function(){
		var sp = new cc.Sprite(res.icon_track_navi_start);
		sp.anchorX = 1/2;
		sp.anchorY = 0;
		sp.scale = AppContext.baseWidth / 15 / sp.width;;
		return sp;
	},
	createEndNode : function(){
		var sp = new cc.Sprite(res.icon_track_navi_end);
		sp.anchorX = 1/2;
		sp.anchorY = 0;
		sp.scale = AppContext.baseWidth / 15 / sp.width;
		return sp;
	},
	removePaths : function(mapLayer){
		for(var i = 0;i<this.pathPids.length;i++){
			mapLayer.removePath(this.pathPids[i]);
		}
	},

	// 清楚导航路径线路(包括起点和终点图标)
	clearNaviPath : function(mapLayer){
		mapLayer.removeMarker(PathService.MAP_NAVI_END_TAG);
		mapLayer.removeMarker(PathService.MAP_NAVI_START_TAG);
		this.removePaths(mapLayer);
	},

	queryMapPaths : function(mapId, floor){
		var sql = "select floor, compress_paths ,compress_path_points from map_path where 1=1";
		if(floor!=null){
			sql += " and floor="+floor;
		}
		var paths = AppContext.nativeQueryMapData(mapId, "path", sql);
		var rs = [];
		if(paths){
			for(var i=0; i<paths.length; i++){
				var path = paths[i];
				var data = {};
				data.floor = path[0];
				data.paths = JSON.parse(path[1]);
				if(path[2]){
					data.path_points = JSON.parse(path[2]);
				}else{
					data.path_points = [];
				}
				rs.push(data);
			}
		}
		return rs;
	},
	
	/**
	 * 设置导航的起点
	 * position 中包含了x, y, floor 字段
	 * @param mapLayer
	 * @param position
	 */
	setStartPosition : function(mapLayer, position){
		if(0==position.floor){
			position.floor = 1;
		}
		this.naviStartPosition = position;
		var floorPart = this.floorMap[position.floor];
		if(!floorPart){
			floorPart = new MapPartRam(PathService.queryMapPaths(mapLayer.mapInfo.mapId,position.floor)[0]);
			this.floorMap["" + position.floor] = floorPart;
		}
		var path_points = floorPart.path_points;
		if(position.floor == 0){
			path_points = path_points.concat(this.floorMap[1].path_points);
		}
		this.closestPointStart = MapUtil.nearest(position, path_points);
//		mapLayer.addMarker(PathService.MAP_NAVI_START_TAG,position.floor,position,this.createStartNode(),0);
	},

	/**
	 * 设置导航的终点
	 * position 中包含了x, y, floor 字段
	 * @param mapLayer
	 * @param position
	 */
	setEndPosition : function(mapLayer, position){
		if(0==position.floor){
			position.floor = 1;
		}
		this.naviEndPosition = position;
		var floorPart = this.floorMap[position.floor];
		if(!floorPart){
			floorPart = new MapPartRam(PathService.queryMapPaths(mapLayer.mapInfo.mapId,position.floor)[0]);
			this.floorMap["" + position.floor] = floorPart;
		}
		var path_points = floorPart.path_points;
		if(position.floor == 0){
			path_points = path_points.concat(this.floorMap[1].path_points);
		}
		this.closestPointEnd = MapUtil.nearest(position, path_points);		
//		mapLayer.addMarker(PathService.MAP_NAVI_START_TAG,position.floor,position,this.createEndNode(),0);
	},

	/**
	 * 计算路径 MapPathResult
	 * @param mapLayer
	 * @param startPoint
	 * @param endPoint
	 * @return MapPathResult
	 */
	calcMapPathResult : function(mapLayer, startPoint, endPoint){
		if(!this.floorMap){
			this.init(mapLayer);
		}
		this.setStartPosition(mapLayer, startPoint);
		this.setEndPosition(mapLayer, endPoint);
		//连接graph
		var multiGrapgh = null;
		for(var f in this.floorMap){
			if(f && this.floorMap[f]){
				if(null==multiGrapgh){
					multiGrapgh = this.floorMap[f].graph;
				}else{
					multiGrapgh = multiGrapgh.concatGraph(this.floorMap[f].graph);
				}
			}
		}
		//MU.logObj(this.closestPointEnd);
		var naviResultGid = multiGrapgh.shortestPath((this.closestPointStart.id), (this.closestPointEnd.id)).concat([(this.closestPointStart.id)]).reverse();
		if(!naviResultGid || (naviResultGid.length==1)){return null;}//如果没有计算出路径
		//MU.log(naviResultGid);
		var pathResult = new MapPathResult(mapLayer,naviResultGid);
		pathResult.startPoint = startPoint;
		pathResult.endPoint = endPoint;

		//如果起始楼层不属于跨楼层,则从内存释放掉
		if(this.multi_zone_floor.indexOf(startPoint.floor)==-1){
			this.floorMap["" + startPoint.floor] = null;
			delete this.floorMap["" + startPoint.floor];
		}
		if(this.multi_zone_floor.indexOf(endPoint.floor)==-1){
			this.floorMap["" + endPoint.floor] = null;
			delete this.floorMap["" + endPoint.floor];
		}
		//MU.logObj(pathResult);
		return pathResult;
	},

	// 随机始末点导航
	randomNavigate : function(mapLayer){

		this.removePaths(mapLayer);

		var pathPids = [];
		var startFloor = this.naviStartPosition.floor;
		var endFloor = this.naviEndPosition.floor;

		var drawRandomStartPoint = cc.p(this.naviStartPosition.x, this.naviStartPosition.y);
		var drawRandomEndPoint = cc.p(this.naviEndPosition.x,this.naviEndPosition.y);

		var naviResultGid = null;
		if(startFloor == endFloor){
			naviResultGid = mapLayer.mapInfo.floorMap[startFloor].graph.shortestPath((this.closestPointStart.id), (this.closestPointEnd.id)).concat([(this.closestPointStart.id)]).reverse();
			this.drawPath(mapLayer,naviResultGid,drawRandomStartPoint,drawRandomEndPoint,"path_"+startFloor);
			pathPids.push("path_"+startFloor);
		}else{
			var concatGraph = mapLayer.mapInfo.baseGround.graph.concatGraph(mapLayer.mapInfo.floorMap["1"].graph).concatGraph(mapLayer.mapInfo.floorMap["20"].graph).concatGraph(mapLayer.mapInfo.floorMap["23"].graph).concatGraph(mapLayer.mapInfo.crossRoad.graph);
//			var concatGraph =
//			mapLayer.mapInfo.floorMap["1"].graph.concatGraph(mapLayer.mapInfo.floorMap["20"].graph).concatGraph(mapLayer.mapInfo.floorMap["23"].graph).concatGraph(mapLayer.mapInfo.crossRoad.graph);
			naviResultGid = concatGraph.shortestPath((this.closestPointStart.id), (this.closestPointEnd.id)).concat([(this.closestPointStart.id)]).reverse();
			var mapPathResult = new MapPathResult(naviResultGid);
			for(var i=0;i<mapPathResult.floors.length;i++){
				var pointsInFloor = mapPathResult.pathPoints[mapPathResult.floors[i]];
				if(0==i){
					//console.log("start floor---->"+pointsInFloor);
					this.drawPath(mapLayer,pointsInFloor,drawRandomStartPoint,null,"path_"+mapPathResult.floors[i]);
					pathPids.push("path_"+mapPathResult.floors[i]);
				}else if((mapPathResult.floors.length-1) == i){
					//console.log("end floor---->"+pointsInFloor);
					this.drawPath(mapLayer,pointsInFloor,null,drawRandomEndPoint,"path_"+mapPathResult.floors[i]);
					pathPids.push("path_"+mapPathResult.floors[i]);
				}else if(pointsInFloor && pointsInFloor.length >1){
					//console.log("middle floor---->"+pointsInFloor);
					this.drawPath(mapLayer,pointsInFloor,null,null,"path_"+mapPathResult.floors[i]);
					pathPids.push("path_"+mapPathResult.floors[i]);
				}
			}
		}
		this.pathPids = pathPids;
		//console.log("naviResultGid---->"+naviResultGid);
	},


//	drawPath : function(mapLayer,naviResultGid,drawRandomStartPoint,drawRandomEndPoint,pid){
//		var path_points_all = [];
//		if(drawRandomStartPoint){
//			path_points_all.push(drawRandomStartPoint);
//		}
//		var floorNum = null;
//		for (var i = 0;i < naviResultGid.length; i++){  
//			var tmpResGid = naviResultGid[i];
//			var floorNum = tmpResGid.split("_")[0];
//			var mapPart_tmp = null;
//			if(floorNum == "0"){
//				mapPart_tmp = mapLayer.mapInfo.baseGround;
//			}else{
//				mapPart_tmp = mapLayer.mapInfo.floorMap[floorNum];
//			}
//			var drawPoint_Tmp = mapPart_tmp.coordsMap[tmpResGid];
//			if(i==0 && (naviResultGid.length >=2) &&
//					( 
//							(this.naviStartPosition.x>drawPoint_Tmp.x && this.naviStartPosition.x<mapPart_tmp.coordsMap[naviResultGid[1]].x)
//							||
//							(this.naviStartPosition.x<drawPoint_Tmp.x && this.naviStartPosition.x>mapPart_tmp.coordsMap[naviResultGid[1]].x)
//							||
//							(this.naviStartPosition.y>drawPoint_Tmp.y && this.naviStartPosition.y<mapPart_tmp.coordsMap[naviResultGid[1]].y)
//							||
//							(this.naviStartPosition.y<drawPoint_Tmp.y && this.naviStartPosition.y>mapPart_tmp.coordsMap[naviResultGid[1]].y) 
//					)
//			){continue;}
//			if(i==(naviResultGid.length-1) && (naviResultGid.length >=2) && 
//					( 
//							(this.naviEndPosition.x<drawPoint_Tmp.x && this.naviEndPosition.x>mapPart_tmp.coordsMap[naviResultGid[naviResultGid.length-2]].x)
//							||
//							(this.naviEndPosition.x>drawPoint_Tmp.x && this.naviEndPosition.x<mapPart_tmp.coordsMap[naviResultGid[naviResultGid.length-2]].x)
//							||
//							(this.naviEndPosition.y<drawPoint_Tmp.y && this.naviEndPosition.y>mapPart_tmp.coordsMap[naviResultGid[naviResultGid.length-2]].y)
//							||
//							(this.naviEndPosition.y>drawPoint_Tmp.y && this.naviEndPosition.y<mapPart_tmp.coordsMap[naviResultGid[naviResultGid.length-2]].y) 
//					)
//			){continue;}
//			path_points_all.push(drawPoint_Tmp); 
//		}   
//		if(drawRandomEndPoint){
//			path_points_all.push(drawRandomEndPoint);
//		}
//		mapLayer.addPath(pid,floorNum,path_points_all,null,0);
//	},

	// 根据当前位置导航
	liveNavigate : function(mapLayer,live_current_point,live_to_point) {
		this.setStartPosition(mapLayer,live_current_point);
		this.setEndPosition(mapLayer,live_to_point);
		this.randomNavigate(mapLayer);
	}
});

PathService.MAP_PATH_TAG = "MAP_PATH";
PathService.MAP_NAVI_START_TAG = "MAP_NAVI_START";
PathService.MAP_NAVI_END_TAG = "MAP_NAVI_END";

