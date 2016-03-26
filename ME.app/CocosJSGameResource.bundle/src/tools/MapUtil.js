var MapUtil = {
	_scheduler : null,

	getScheduler : function(){
		if(this._scheduler==null){
			this._scheduler = cc.director.getScheduler();
		}
		return this._scheduler;
	},

	scheduleOnce : function(selector, target, delay){
		target = target || this;
		delay = (delay || 0) * 1000;
		setTimeout(selector.bind(target), delay);
	},

	schedule : function(selector, target, interval){
		target = target || this;
		interval = interval || 0;
		this.getScheduler().scheduleCallbackForTarget(target, selector, interval);
	},
	
	unschedule : function(selector, target){
		target = target || this;
		this.getScheduler().unscheduleCallbackForTarget(target, selector);
	},
	
	isNull : function(val1, val2){
		if(val1==null){
			return val2;
		}else{
			return val1;
		}
		 
	}
};

var MU = MapUtil;

MapUtil.nearest = function(point_random_select,points_orig){
	var dis = cc.pDistance(point_random_select,points_orig[0]);
	var closestPoint_start = points_orig[0];
	for(var k=1;k<points_orig.length;k++){
		var dis_tmp = cc.pDistance(point_random_select,points_orig[k]);
		if(dis>dis_tmp){
			dis = dis_tmp; 
			closestPoint_start = points_orig[k];
		}
	}
	return closestPoint_start;
}
	
/**
* 保留两位小数
*/
MapUtil.round2 = function(num){
	return Math.round(num * 100)/100.0;
}

MapUtil.round3 = function(num){
	return Math.round(num * 1000)/1000.0;
}

MapUtil.roundString = function(num, dots){
	dots = (dots==null?dot : 2);
//	cc.log("round2 old " + num);
	var num00 = Math.pow(10, dots);
	var num2 = "" + Math.round(num * num00)/num00;

	var dot = num2.indexOf(".");
	if(dot<0){
		num2 = num2 + (dots>0? (num00+"").slice(1) : "");
	}else{
		if(dot+dots+1>num2.length){
			num2 = num2.slice(0);
		}else{
			num2 = num2.slice(0, dot+dots + 1);
		}
	}

//	cc.log("round2 r=" + num2);
	return num2;
}
	
MapUtil.drawPolygon =  function(drawNode, points, fillColor, borderWidth, borderColor){
	
	if(points.length>4 ){

		if(fillColor!=null){
			// 拆分三角形画多边形
			try{
				var swctx = new poly2tri.SweepContext([].concat( points));
				swctx.triangulate();
				var triangles = swctx.getTriangles();
				triangles.forEach(function(t) {
					drawNode.drawPoly(t.getPoints(), fillColor);
				},this); 
			}catch(ex){
				
			}
		}

		
		// 画边线
		if(borderWidth>0){
			drawNode.drawPoly([].concat(points), null, borderWidth, borderColor);
		}
	}else{
		drawNode.drawPoly([].concat(points), fillColor, borderWidth, borderColor);
	}
}
	
MapUtil.isInsidePoly = function(p, points){
	
		var count = points.length;

		if(count < 3)
		{
			return false;
		}

		var result = false;

		for(var i = 0, j = count - 1; i < count; i++)
		{
			var p1 = points[i];
			var p2 = points[j];

			if(p1.x < p.x && p2.x >= p.x || p2.x < p.x && p1.x >= p.x)
			{
				if(p1.y + (p.x - p1.x) / (p2.x - p1.x) * (p2.y - p1.y) < p.y)
				{
					result = !result;
				}
			}
			j = i;
		}
		return result;
}

MapUtil.clonePojo = function(obj, keys){

	var newObj = {};

	if(keys){
		for (var i in keys) {
			var key = keys[i];
			var copy = obj[key];

			if(!cc.isFunction(copy)){
				newObj[key] = copy;
			}
		}
		
	}else{
		for (var key in obj) {
			var copy = obj[key];

			if(!cc.isFunction(copy)){
				newObj[key] = copy;
			}
		}
	}
	
	return newObj;
}

MapUtil.log = function(str){
	var now = new Date();
	cc.log("[" + now.toLocaleTimeString() + " " + now.getMilliseconds() + "] " + str);
}

MapUtil.logObj = function(obj, keys){
	MapUtil.log(JSON.stringify(MapUtil.clonePojo(obj, keys)));
}

MapUtil.getFloorName = function(floor){
	var fname = floor;
	if(fname>0){
		fname = fname + "F";
	}else if(fname<0){
		fname = "B" + fname;
	}else{
		fname = "室外";
	}

	return fname;
}

MapUtil.formatDate = function (date, fmt) { //author: meizz 
	var o = {
					"M+": date.getMonth() + 1, //月份 
					"d+": date.getDate(), //日 
					"h+": date.getHours(), //小时 
					"m+": date.getMinutes(), //分 
					"s+": date.getSeconds(), //秒 
					"q+": Math.floor((date.getMonth() + 3) / 3), //季度 
					"S": date.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}


MapUtil.calcDegree = function(p1, p2){
	
	return cc.radiansToDegrees(Math.atan2( -(p2.y-p1.y), (p2.x-p1.x)));
}


MapUtil._polyReduceLog = {};

MapUtil._logPolyReduce = function(key, oldSize, newSize){
	
	var plog = MapUtil._polyReduceLog[key];
	if(plog==null){
		MapUtil._polyReduceLog[key] = plog = {};
	}
	plog.oldSize = (plog.oldSize || 0) + oldSize;
	plog.newSize = (plog.newSize || 0) + newSize;
}

MapUtil.polyPointsReduce = function(polyPoints, degree){
	degree = degree || 20;
	
	var res = [];
	res.push(polyPoints[0]);
	var lastDegree = MapUtil.calcDegree(polyPoints[0], polyPoints[1]);
	var lastDis = cc.pDistance(polyPoints[0], polyPoints[1]);
	var diffDegree = 0;
	var diffDis = 0;
	for(var i=1; i<polyPoints.length-1; i++){
		
		var curP = polyPoints[i];
		var nextP = polyPoints[(i==polyPoints.length-1)?0 : (i+1)];
		
		var curDegree = MapUtil.calcDegree(curP, nextP);
		var curDis = cc.pDistance(curP, nextP);
		diffDegree += curDegree - lastDegree;
		
		if(Math.abs(diffDegree)>degree){
			res.push(curP);
			diffDegree = 0;
			diffDis = 0;
		}
		diffDis = curDis + lastDis;
		lastDegree = curDegree;
		lastDis = curDis;
		
	}
	
	res.push(polyPoints[polyPoints.length-1]);
	
	return res;
}


