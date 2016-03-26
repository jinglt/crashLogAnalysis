var MapPathPart = cc.Class.extend({
	
	type : 1,
	startPoint : null,
	endPoint : null,
	pathPoints : null,
	
	ctor : function(){
		this.type = MapPathPart.TYPE_SAME_FLOOR;
	}
	
});

MapPathPart.TYPE_SAME_FLOOR = 1;
MapPathPart.TYPE_CROSS_BY_ELEVATOR  = 2;
MapPathPart.TYPE_CROSS_BY_STAIR  = 3;
MapPathPart.TYPE_CROSS_IN_OUT  = 4;