

var MapPartRam = cc.Class.extend({
	floor : 0,
	paths : [],
	path_points : [],
	//计算属性
	coordsMap:{},// 点->坐标映射
	graph: {},
	
	ctor : function(props){
		cc.extend(this, props||{});
		// 初始化路径上的点集
		var path_point = this.path_points;
		var coordsMap = {};
		for(var i = 0;i < path_point.length; i++) {
			coordsMap[path_point[i].id]=cc.p(path_point[i].x,path_point[i].y);
		};   
		this.coordsMap = coordsMap;
		// 初始化路径信息
		var graph = new Graph();
		var paths = this.paths;
		for(var i = 0;i < paths.length; i++) {
			graph.addVertex(paths[i].vertix,paths[i].toVertixes);
			//if(this.floor==0){
			//	console.log("g_0.addVertex("+JSON.stringify(paths[i].vertix)+","+JSON.stringify(paths[i].toVertixes)+");");
			//}
		};
		this.graph = graph;
	}
	
	
});


