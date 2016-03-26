var MapPathResult = cc.Class.extend({
	
	startPoint : null,
	endPoint : null,
	pathParts : [],
	pathPartMap : {},
	
	ctor:function(mapLayer,naviRes){
		this.splitNaviRes(mapLayer,naviRes);
	},
	splitNaviRes:function(mapLayer,naviRes){
		var pathParts = [];
		var pathPartMap = {};
		var floorNums = [];//包含了结果楼层的电梯点的
		var stepCountNoElevator = [];//去掉了经过楼层的电梯点(即:只经过,没停留)
		var floor_pathPoints_map = {};//每一层的路径点的map: MAP(stepCount:point(x,y,floor))
		var preFloorNum = null;
		var stepCount = 0;//步骤号
		for(var i=0;i<naviRes.length;i++){
			var f = naviRes[i].split("_")[0];
			var p;
			if(PathService.floorMap[f]){
				p = PathService.floorMap[f].coordsMap[naviRes[i]];
			}else{
				p = PathService.floorMap[999].coordsMap[naviRes[i]];
			}
			if(preFloorNum!=f){
				++stepCount;
			}
			if(floor_pathPoints_map[stepCount]){
				floor_pathPoints_map[stepCount].push({x : p.x, y : p.y, floor : f});
			}else{
				var atmp = [];
				atmp.push({x : p.x, y : p.y, floor : f});
				floor_pathPoints_map[stepCount] = atmp;
			}
			preFloorNum = f;
		}
		for(var i=1;i<=stepCount;i++){
			if( (i==1) || i==(stepCount) ){//如果是起点/终点层
				stepCountNoElevator.push(i);	
			}else if (floor_pathPoints_map[i].length > 1) {
				stepCountNoElevator.push(i);	
			}
		}
		for(var i=0;i<stepCountNoElevator.length;i++){
			var stepCount = stepCountNoElevator[i];
			{
				if(i>0){
					var pre_stepCount = stepCountNoElevator[i-1];
					var mapPathPart = new MapPathPart();
					mapPathPart.pathPoints = [];
//					if((f == 0 && pre_f == 1) || (f == 1 && pre_f == 0))
//					{
//						mapPathPart.type = MapPathPart.TYPE_SAME_FLOOR;
//					}
//					else
					{
						mapPathPart.type = MapPathPart.TYPE_CROSS_BY_ELEVATOR;
						mapPathPart.startPoint = floor_pathPoints_map[pre_stepCount][floor_pathPoints_map[pre_stepCount].length-1];
						mapPathPart.endPoint = floor_pathPoints_map[stepCount][0];
						mapPathPart.pathPoints.push(mapPathPart.startPoint);
						mapPathPart.pathPoints.push(mapPathPart.endPoint);
						pathParts.push(mapPathPart);
					}
				}
				//起点或终点楼层路径
				mapPathPart = new MapPathPart();
				mapPathPart.pathPoints = [];
				mapPathPart.type = MapPathPart.TYPE_SAME_FLOOR;
				mapPathPart.pathPoints = floor_pathPoints_map[stepCount];
				mapPathPart.startPoint = floor_pathPoints_map[stepCount][0];
				mapPathPart.endPoint = floor_pathPoints_map[stepCount][floor_pathPoints_map[stepCount].length-1]
				pathParts.push(mapPathPart);
			}
		}
		this.pathParts = pathParts;
	},
	splitNaviRes_1:function(naviRes){
		var floors = [];
		var names = [];
		var pathPoints = {};
		for(var i=0;i<naviRes.length;i++){
			var f = naviRes[i].split("_")[0];
			if(pathPoints[f]){
				pathPoints[f].push(naviRes[i]);
			}else{
				var atmp = [];
				atmp.push(naviRes[i]);
				pathPoints[f] = atmp;
			}
		}
		var preFloor = null;
		for(var i=0;i<naviRes.length;i++){
			var f = naviRes[i].split("_")[0];
			if(preFloor==f){continue;};
			floors.push(f);
			names.push(f+"楼");
			preFloor = f;
		}
		this.floors = floors;
		this.names = names;
		this.pathPoints = pathPoints;
	},
	explainNaviRes:function(){
		console.log("explainNaviRes func begin...");
		for(var i=0;i<this.floors.length;i++){
			var pointsInFloor = this.pathPoints[this.floors[i]];
			if(pointsInFloor.length>1){
				console.log("您现在在"+this.floors[i]+"层,请按照以下节点行走到电梯口，然下到"+this.floors[i+1]+"层");
			}else{
				console.log("您现在在电梯口，请下电梯到"+this.floors[i+1]+"层");
			}
			for(var j=0;j<pointsInFloor.length;j++){
				console.log(pointsInFloor[j]);
			}
		}
	},
	initGraph_2 : function(){}
});