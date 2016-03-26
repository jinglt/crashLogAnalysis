

var MapPart = cc.Class.extend({
	
	//原始属性
	partId : "",
	partName : "",
	floor : 0,
	elements : [],
	paths : [],
	path_points : [],
	
	//计算属性
	coordsMap:{},// 点->坐标映射
	graph: {},
	bounds : {},
	
	ctor : function(props){
		cc.extend(this, props||{});
		
		var eles = [];
		var bounds = {};
		for(var i=0; i<this.elements.length; i++){
			var prop = this.elements[i];
			prop.floor = this.floor;
			var me = new MapElement(prop);
			eles.push(me);
			
			bounds.left = Math.min(me.bounds.left, bounds.left || me.bounds.left);
			bounds.right = Math.max(me.bounds.right, bounds.right || me.bounds.right);
			bounds.top = Math.max(me.bounds.top, bounds.top || me.bounds.top);
			bounds.bottom = Math.min(me.bounds.bottom, bounds.bottom || me.bounds.bottom);
			
		}
		
		eles.sort(function(b, a){
			var r=0;
			
//			if(a.floor!=b.floor){
//				return a.floor-b.floor;
//			}
			
			if(a.viewLevel!=b.viewLevel){
				return a.viewLevel-b.viewLevel;
			}
			
			return (a.centerX * a.centerX + a.centerY * a.centerY) -  (b.centerX * b.centerX + b.centerY * b.centerY);
//			return (a.bounds.left - b.bounds.left) + (a.bounds.bottom - b.bounds.bottom);
		});
		
		this.elements = eles;
		
		this.bounds = bounds;
		
		
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


