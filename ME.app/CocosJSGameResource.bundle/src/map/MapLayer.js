var MapLayer = cc.Layer.extend({
	
	// 属性
	viewSize:null,
	initialized:false,
	mapEvents:null,
	polys : [],
	labels : [],
	markers : {},
	drawShapes : {},
	
	// 地图层
	_camera : null,
	mapContainer : null,
	baseLayer : null,
	airLayer : null,
	floorLayer : null,
	drawLayer : null,
	labelsLayer : null,
	markersLayer : null,
    
	// 地图数据
	mapId : "",
	direction : 0,
    mapInfo:null,
    mapFurnitures : null,
    mapStyles:null,
    mapSize:null,
    mapSizeInPixel:null,
    mapRect:null,
    mapRectInPixel:null,
    mapCenter:null,
// baseElements : [],
// floorElements : [],
    
    // 视图信息
    maxScale : 30,
    minScale : 0.1,
    minX : 0,
    maxX : 1,
    minY : 0,
    maxY :1,
    viewScale:1,
    viewX : 0,
    viewY : 0,
    viewRotation : 0,
    viewLevel : 0,
    viewCamaraY : 0,
    drawScale : 1,
    viewFloor : 1,
    lastViewScale:null,
    lastViewX:null,
    lastViewY:null,
    lastViewRotation:null,
    lastDrawScale : null,
    lastViewLevel : null,
    lastViewFloor : null,
	viewChanged:false,
	viewChangeFactor:null,
	scrollParam : null,
	scrollSpeed : 0.96,
	scrollEnabled : true,
	viewChangeEvent : null,
	drawFurnitureParam : {},
	
	
	ctor:function (param) {
        // ////////////////////////////
        // 1. super init first
        this._super();
        
        this.tag = MapConsts.MAP_LAYER_TAG;
        this.anchorX=0;
        this.anchorY=0;
        this.x = 0;
        this.y = 0;
        this.scale = 1;
        
        this.viewSize = AppContext.viewSize;
        
        cc.extend(this, param);
    },
    
    onEnter : function(){
    	this._super();
    	this.scheduleUpdate();
    },
    
    initMap: function(){
    	
    	var vsize = AppContext.viewSize;
    	this._camera = cc.Camera.createPerspective(30, vsize.width/vsize.height, 1, 2000);
    	this._camera.setCameraFlag(cc.CameraFlag.USER1);
    	this.addChild(this._camera, 0);

    	var pos3d = cc.math.vec3(vsize.width/2, vsize.height * 0.5, 0);
    	var lookAt = cc.math.vec3(vsize.width/2, vsize.height * 0.5 - this.viewCamaraY, -1);
    	this._camera.setPosition3D(pos3d);
    	this._camera.lookAt(lookAt);
    	//

    	this.mapContainer = new cc.Layer();
    	this.mapContainer.setPosition(-pos3d.x, -pos3d.y);
    	this._camera.addChild(this.mapContainer);
    	
    	this.baseLayer = new cc.Layer();
    	this.baseLayer.name = "baseLayer";
    	this.mapContainer.addChild(this.baseLayer, 1);
    	
    	this.airLayer = new cc.Layer();
    	this.airLayer.name = "airLayer";
    	this.mapContainer.addChild(this.airLayer, 2);

    	this.floorLayer = new cc.Layer();
    	this.floorLayer.name = "floorLayer";
    	this.mapContainer.addChild(this.floorLayer, 3);
    	
    	this.labelsLayer = new cc.Layer();
    	this.labelsLayer.name = "labelsLayer";
    	this.mapContainer.addChild(this.labelsLayer, 4);
    	
    	this.drawLayer = new cc.Layer();
    	this.drawLayer.name = "drawLayer";
    	this.mapContainer.addChild(this.drawLayer, 5);
    	
    	this.markersLayer = new cc.Layer();
    	this.markersLayer.name = "markersLayer";
    	this.mapContainer.addChild(this.markersLayer, 6);
    	
    	var map = this;
    	
    	// 加载地图
    	this.initMapInfo();
		
		// 绘制地图
    	this.drawMap();
		
		// 安装事件
    	this.initEvents();
    			
		this.initialized = true;
    },
    
    changeView : function(smoothly){
    	this.viewChanged = true;
    	
    	this.viewScale = this.effectScale(this.viewScale);
    	this.viewRotation = this.effectRotation(this.viewRotation);
    	
    	if(this.viewScale!=this.lastViewScale || this.viewRotation!=this.lastViewRotation){
    		this.updateEffectBounds();
    	}
    	
    	this.viewX = this.effectX(this.viewX);
    	this.viewY = this.effectY(this.viewY);
    	
    	
    	// 变化因子
    	if(smoothly){
    		var changeTime = 1 / cc.director.getAnimationInterval() / 2.0;
    		this.viewChangeFactor = {
    				scaleChange : (this.viewScale - this.scale)/changeTime,
    				xChange : (this.viewX - this.x)/changeTime,
    				yChange : (this.viewY - this.y)/changeTime,
    				rChange : this.effectRotation(this.viewRotation - this.rotation) /changeTime,
    				minChange : 0.1 / changeTime
    		};
    	}else{
    		this.viewChangeFactor = null;
    	}
    },
    
    stopChangeView : function(){
    	this.viewChanged = false;
    	this.viewChangeFactor = null;
    },
    
    update : function(){
    	
    	if(this.viewChanged){
    		
    		var changeFinish = this.updateView();
    		
    		this.viewLevel = this.getViewLevel();
    		this.drawScale = this.getDrawScale();
    		var scaleChanged = !(this.lastViewScale==this.viewScale);
    		var xyChanged = !( this.lastViewX==this.viewX && this.lastViewY==this.viewY);
    		var rotChanged = !(this.lastViewRotation==this.viewRotation);
    		var viewLevelChanged = !(this.viewLevel==this.lastViewLevel);
    		var drawScaleChanged = !(this.drawScale==this.lastDrawScale);
    		var changeParam = {map : this, 
    						scaleChanged : scaleChanged, 
    						xyChanged : xyChanged, 
    						rotationChanged : rotChanged, 
    						viewLevelChanged : viewLevelChanged, 
    						drawScaleChanged : drawScaleChanged};
    		
    		cc.eventManager.dispatchCustomEvent(MapEvents.MAP_VIEW_CHANGING, changeParam);
    		
    		if(changeFinish){
				// view change complete
    			this.stopChangeView();
    			this.scheduleViewChangeEvent(changeParam);
    			
    			this.lastViewX = this.viewX;
    			this.lastViewY = this.viewY;
    			this.lastViewScale = this.viewScale;
    			this.lastViewRotation = this.viewRotation;
    			this.lastViewLevel = this.viewLevel;
    			this.lastDrawScale = this.drawScale;
			}
    	}
    },
    
    scheduleViewChangeEvent : function(changeParam){
    	this.unschedule(this.onViewChanged);
    	
    	if(this.viewChangeEvent==null){
    		this.viewChangeEvent = cc.extend({}, changeParam);
    	}else{
    		var oldParam = this.viewChangeEvent;
    		oldParam.map = this;
    		oldParam.xyChanged = oldParam.xyChanged || changeParam.xyChanged;
    		oldParam.drawScaleChanged = oldParam.drawScaleChanged || changeParam.drawScaleChanged;
    		oldParam.viewLevelChanged = oldParam.viewLevelChanged || changeParam.viewLevelChanged;
    		oldParam.rotationChanged = oldParam.rotationChanged || changeParam.rotationChanged;
    		oldParam.scaleChanged = oldParam.scaleChanged || changeParam.scaleChanged;
    		oldParam.floorChanged = oldParam.floorChanged || changeParam.floorChanged;
    		oldParam.addNew = oldParam.addNew || changeParam.addNew;
    	}
    	this.scheduleOnce(this.onViewChanged, 0.1);
    },
    
    onViewChanged : function(){
    	var eventObj = this.viewChangeEvent;
//    	var logobj = cc.extend({},eventObj );
//    	logobj.map = null;
//    	MU.logObj(logobj);
    	
//    	if(eventObj.drawScaleChanged){
//    		MU.logObj({msg : "drawScaleChanged", drawScale : this.drawScale, viewScale : this.viewScale});
//    	}
    	
//    	MU.log("map view level : " + this.viewLevel);
    	this.viewChangeEvent = null;
    	this.updateMapNodes(eventObj);
    	cc.eventManager.dispatchCustomEvent(MapEvents.MAP_VIEW_CHANGED, eventObj);
    },
    
    checkLabelIntersects : function(){
    	
    	// labels
    	var lbs = this.labels;
    	var texts = [];
    	var hides = [];

    	// 先把所有label缩放和旋转
    	for(var i=0 ; i<lbs.length; i++){
    		var theLb = lbs[i];

    		if(theLb.style.showLabel){
    			texts.push(theLb);
    		}
    	}

// cc.log("判断交叉 on " + this.viewScale);
    	// 然后再判断交叉
    	for(var i=0 ; i<texts.length; i++){

    		var theLb = texts[i];
    		
    		var myRect = theLb.getViewRect();
// cc.log("label : " + theLb.text + ", rect : " + JSON.stringify(myRect));

    		if(hides[i] || i==texts.length-1 || theLb.visible==false){
    			continue;
    		}

    		for(var j=i+1; j<texts.length; j++){
    			var thaLb =  texts[j];

    			if( cc.rectIntersectsRect(myRect, thaLb.getViewRect())){
    				hides[j] = true;
    				// break;
    			}
    		}

    	}

    	for(var i in texts){
    		if(hides[i]){
    			texts[i].setTextVisible(false);
// cc.log("hide : " + texts[i].text);
    		}else{
    			texts[i].setTextVisible(true);
    		}
    	}
    	
    	
    		
    },
    
    
    // 每帧改变地图大小和位置
    updateView: function(){
    	
    	var updateFinish = true;
    	
    	if(this.viewChangeFactor !=null ){
    		
    		var cf = this.viewChangeFactor;
    		var minDiff = 0.001;
    		var sDiff = Math.abs( this.viewScale - this.scale ) - Math.abs(cf.scaleChange);
    		var xDiff = Math.abs( this.viewX - this.x ) - Math.abs(cf.xChange);
    		var yDiff = Math.abs( this.viewY - this.y ) - Math.abs(cf.yChange);
    		var rDiff = Math.abs( this.viewRotation - this.rotation) - Math.abs(cf.rChange);
    		
// cc.log("view : " + updateFinish);
    		// 缩放
    		if(sDiff > minDiff){
    			this.scale += cf.scaleChange;
    			updateFinish = false;
    		}else{
    			this.scale = this.viewScale;
    		}
// cc.log("view : " + JSON.stringify({updateFinish : updateFinish, scale :
// this.scale, viewScale : this.viewScale, sDiff: sDiff, scaleChange :
// cf.scaleChange, lastViewScale : this.lastViewScale}));
    		
    		// x偏移
    		if(xDiff > minDiff){
    			this.x += cf.xChange;
    			updateFinish = false;
    		}else{
    			this.x = this.viewX;
    		}
// cc.log("view : " + JSON.stringify({updateFinish : updateFinish, x : this.x,
// viewX : this.viewX, xDiff: xDiff, xChange : cf.xChange}));

    		// y偏移
    		if(yDiff > minDiff){
    			this.y += cf.yChange;
    			updateFinish = false;
    		}else{
    			this.y = this.viewY;
    		}
// cc.log("view : " + JSON.stringify({updateFinish : updateFinish, y : this.y,
// viewY : this.viewY, yDiff: yDiff, yChange : cf.yChange}));
    		
    		// 旋转
    		if(rDiff > minDiff){
    			this.rotation += cf.rChange;
    			updateFinish = false;
    		}else{
    			this.rotation = this.viewRotation;
    		}
// cc.log("view : " + JSON.stringify({updateFinish : updateFinish, rotation :
// this.rotation, viewRotation : this.viewRotation, rDiff: rDiff, rChange :
// cf.rChange}));
// cc.log("viewChangeFactor : " + JSON.stringify(this.viewChangeFactor));
// cc.log("viewChangeDiff(x, y, s ,r) : " + JSON.stringify([xDiff, yDiff, sDiff,
// rDiff]));
    		
    		
    		
    		
    	}else{
    		this.scale = this.viewScale;
    		this.x = this.viewX;
    		this.y = this.viewY;
    		this.rotation = this.viewRotation;
    	}
    	
// cc.log("updateFinish: " + JSON.stringify({updateFinish : updateFinish, x :
// this.x, y: this.y, scale : this.scale, rotation : this.rotation}));
// cc.log("view : " + JSON.stringify({x : this.viewX, y: this.viewY, scale :
// this.viewScale, rotation : this.viewRotation}));
// cc.log("view : " + JSON.stringify({x : this.x, y: this.y, scale : this.scale,
// rotation : this.rotation}));
    	return updateFinish;
    },
    
    initEvents : function(){
    	this.mapEvents = new MapEvents(this);
    	this.mapEvents.registerAll();
    },
    
    initMapInfo : function(){
    	var mapInfo = this.mapInfo;
    	this.mapId = mapInfo.mapId;
    	this.direction = mapInfo.direction;
    	this.mapSize = mapInfo.getMapSize();
    	this.mapSizeInPixel = mapInfo.getMapSizeInPixel();
    	this.mapCenter = mapInfo.getMapCenter();
    	this.mapRect = mapInfo.getMapRect();
    	this.mapRectInPixel = mapInfo.getMapRectInPixel();
    	this.minScale =MapUtil.round2( Math.min(this.viewSize.width / this.mapSizeInPixel.width, this.viewSize.height / this.mapSizeInPixel.height), 1) * 0.8;
    	this.maxScale =MapUtil.round2(  Math.max(AppContext.baseWidth/MapConsts.PIXEL_PER_METER/10, this.minScale * 8));
    	cc.log("mapScale: "+this.maxScale + ", " + this.minScale);
	},
	
	// 更新上下左右边界
	updateEffectBounds : function(){
		
		var mb = this.mapInfo.mapBounds;
		var lb = this.convertToWorldPositon(cc.p(mb.left, mb.bottom));
		var lt = this.convertToWorldPositon(cc.p(mb.left, mb.top));
		var rb = this.convertToWorldPositon(cc.p(mb.right, mb.bottom));
		var rt = this.convertToWorldPositon(cc.p(mb.right, mb.top));
		
		var l = Math.min(lb.x, lt.x, rb.x, rt.x);
		var b = Math.min(lb.y, lt.y, rb.y, rt.y);
		var r = Math.max(lb.x, lt.x, rb.x, rt.x);
		var t = Math.max(lb.y, lt.y, rb.y, rt.y);
		
		var padding = AppContext.baseWidth / 5;
		this.maxX =  this.viewX - l + this.viewSize.width - padding;
		this.minX = this.viewX - r + padding;
		this.maxY = this.viewY - b + this.viewSize.height - padding;
		this.minY = this.viewY -t + padding;
		
// cc.log("update EffectBounds : " + JSON.stringify(box));
	},

    // 绘制地图
    drawMap : function(){
    	
    	var map = this;
    	
    	var mapRectPoints = [
    	                     cc.p(this.mapRect.x, this.mapRect.y),
    	                     cc.p(this.mapRect.x + this.mapRect.width, this.mapRect.y),
    	                     cc.p(this.mapRect.x + this.mapRect.width, this.mapRect.y + this.mapRect.height),
    	                     cc.p(this.mapRect.x, this.mapRect.y + this.mapRect.height)
    	                     ];
    	
		// 背景颜色
    	var groundStyle = map.mapStyles.getStyle("groundLayer");
    	var groundParam = {points : mapRectPoints, style : groundStyle, parentLayer : this.baseLayer, viewLevel : 0, floor : 0};
    	this.addPolygon(groundParam);

    	// 画室外元素
    	/**/
    	
    	var floorPart = MapService.queryMapPolygons(this.mapId, 0);
    	if(floorPart != null) {
    		floorPart = new MapPart({floor : 0, elements : floorPart});

    		//画元素
    		var mes = floorPart.elements;
    		for(var i=0; i<mes.length; i++){
    			var ele = mes[i];
    			var style = this.mapStyles.getStyleByRefType(ele.refType);
    			var plParam = cc.extend({ parentLayer : this.baseLayer, style : style}, ele);
    			this.addPolygon(plParam);

    			if(style.showLabel){
    				var lbParam = cc.extend({ parentLayer : this.labelsLayer, style : style}, ele);
    				this.addLabel(lbParam);
    			}

    		}
    	}
		
		// 空气层
		mapRectPoints = [
		                 cc.p(this.mapRect.x - this.mapRect.width, this.mapRect.y - this.mapRect.height),
		                 cc.p(this.mapRect.x + this.mapRect.width * 2, this.mapRect.y - this.mapRect.height ),
		                 cc.p(this.mapRect.x + this.mapRect.width * 2, this.mapRect.y + this.mapRect.height * 2),
		                 cc.p(this.mapRect.x - this.mapRect.width, this.mapRect.y + this.mapRect.height * 2)
		                 ];
		var airStyle = map.mapStyles.getStyle("airLayer");
		var airParam = {points : mapRectPoints, style : airStyle, parentLayer : this.airLayer, floor : 0, name : "airLayer"};
		this.addPolygon(airParam);
		
		// 画1F元素
		this.drawFloor(1);
		
		// 定位中点
		this.setMapView(this.mapCenter, 1, null, 0, true);
    	
    },
    
    drawFloor: function(f){
    	Popup.showLoading();
    	
    	this.clearFloorElements();
    	
    	this.airLayer.visible = (f!=1);
//    	cc.log("draw floor " + f);
//    	MU.log("draw floor " + f);
//    	var floor = this.mapInfo.floorMap[f];
    	var floorPart = MapService.queryMapPolygons(this.mapId, f);
    	if(floorPart != null) {
//    		MU.log("load floorPart " + floorPart.length);
    		
    		this.viewFloor = f;
    		floorPart = new MapPart({floor : f, elements : floorPart});
//    		MU.logObj(floorPart.bounds);
    		
    		//画元素
    		var mes = floorPart.elements;
    		for(var i=0; i<mes.length; i++){
    			var ele = mes[i];
    			var style = this.mapStyles.getStyleByRefType(ele.refType);
    			var plParam = cc.extend({ parentLayer : this.floorLayer, style : style}, ele);
    			this.addPolygon(plParam);
    			
    			if(style.showLabel){
    				var lbParam = cc.extend({ parentLayer : this.labelsLayer, style : style}, ele);
    				this.addLabel(lbParam);
    			}
    			
    		}
    		
//    		MU.log("draw floorPart " + mes.length);
    		
    		//画家具
    		this.startDrawFurnitures();
    		
    		
    		this.scheduleViewChangeEvent({map : this, floorChanged : true});
    		this.floorLayer.runAction(cc.fadeIn(1));

    		this.lastViewFloor = this.viewFloor;
    	}
    	
    	/*
    	for(var key in MapUtil._polyReduceLog){
    		var dlog = MapUtil._polyReduceLog[key];
    		if(dlog.oldSize > 10000 || dlog.oldSize - dlog.newSize > 1000){
    			cc.log("," + key + "," + dlog.oldSize + "," +dlog.newSize);
    		}
    	}
    	*/
    	
    	Popup.hideLoading();
    },
    
    startDrawFurnitures : function(){
//    	return false;
    	
    	var f = this.viewFloor;
    	var fnQueryId = MapService.createMapFurnitureQuery(this.mapId, f);
    	
    	if(fnQueryId=="" ||fnQueryId==null){
    		MU.log("家具数据不存在");
    		return;
    	}
    	
    	var fnStyle = this.mapStyles.getStyle("furniture");
    	var ftPolys = new FurnitureNode({parentLayer : this.floorLayer, viewLevel : 1, floor : f, style : fnStyle});
    	var pageSize = 1;
    	var map = this;
    	this.polys.push(ftPolys);
    	
    	var loadFurnitures = function(){
    		var fns = MapService.queryMapFurnitureDataByPage(map.mapId, fnQueryId, pageSize);

    		if(fns!=null){
//    			MU.log("loadFurnitures " + fns.length);
    			
    			if(fns.length>0 && cc.sys.isObjectValid(ftPolys._fillNode)){
    				for(var i=0; i<fns.length; i++){
    					var ele = new MapElement(fns[i]);
//  					MU.log("家具 : " +  ele.name + ", " + ele.refType);
//    					var style = map.mapStyles.getStyleByRefType(ele.refType, "furniture");
    					ftPolys.drawShape(ele.points, fnStyle);
    				}
    			}

//    			MU.log("draw Furnitures " + fns.length);
    			MU.scheduleOnce(loadFurnitures, map);
    		}
    	}
    	
    	loadFurnitures();
    },
    
    clearFloorElements : function(){
    	
    	var f = this.viewFloor;
    	
    	//多边形
    	var newPolys = [];
    	for(var i=0; i<this.polys.length; i++){
    		
    		if(this.polys[i].floor == f){
    			this.polys[i].removeSelf();
    		}else{
    			newPolys.push(this.polys[i]);
    		}
    		
    	}
    	this.polys = newPolys;
    	
    	//标签
    	var newlabels = [];
    	for(var i=0; i<this.labels.length; i++){

    		if(this.labels[i].floor == f){
    			this.labels[i].removeSelf();
    		}else{
    			newlabels.push(this.labels[i]);
    		}

    	}
    	this.labels = newlabels;
    	
    },
    
    updateMapNodes : function(changeParam){
    	
    	if(changeParam.rotationChanged || changeParam.scaleChanged || changeParam.floorChanged){

//    		MU.log("updateMapNodes  start");

    		var logParam = cc.extend({}, changeParam);
    		logParam.map=null;

    		var mapNodes = [].concat(this.polys, this.labels);
    		
    		for(var key in this.drawShapes){
    			mapNodes.push(this.drawShapes[key]);
    		}
    		
    		for(var key in this.markers){
    			mapNodes.push(this.markers[key]);
    		}

//    		MU.log("doMapNodesUpdate  mapNodes baseLayer change start : " + mapNodes.length);
    		for(var i=0; i<mapNodes.length; i++){
    			var mn = mapNodes[i];
    			
    			if(mn.nodeType>0){
    				mn.onMapViewChanged(changeParam);
    				if(mn.isDirty){
    					mn.repaint();
    				}
    			}
    			
    		}

//  		MU.log("doMapNodesUpdate  mapNodes chenged");
    		this.checkLabelIntersects();
//  		MU.log("doMapNodesUpdate  label intersects");
    		
//    		MU.log("updateMapNodes  end");
    	}
    },
    
    addPolygon : function(param){
    	var poly = new PolyNode(param);
    	this.polys.push(poly);
    	return poly;
    },
    
    addLabel : function(param){
    	var lbl = new LabelNode(param);
    	this.labels.push(lbl);
    },
    
    findMarker : function(pid){
    	pid = pid+"";
    	return this.markers[pid];
    },
    
    addMarker : function(pid, floor, point, node, viewLevel, onMarkerSelect){
    	pid = pid+"";
    	viewLevel = viewLevel || 0;
    	
		this.removeMarker(pid);
		
		var param = {
				id : pid,
				centerX : point.x,
				centerY : point.y,
				floor : floor, 
				viewLevel : viewLevel,
				node : node,
				map : this,
				parentLayer : this.markersLayer
		};
		
		var marker = new MarkerNode(param);
		if(onMarkerSelect){
			marker.onMarkerSelect = onMarkerSelect;
		}
		
		marker.onMapViewChanged({map : this, addNew : true});
		this.markers[pid] = marker;
		
		return marker;
    },
    
    removeMarker : function(pid){
    	var old = this.findMarker(pid);
    	if(old!=null){
    		old.removeSelf();
    	}
    	delete this.markers[pid];
    },
    
    findShape : function(pid){
    	pid = pid+"";
    	return this.drawShapes[pid];
    },
    
    removeShape : function(pid){
    	var old = this.findShape(pid);
// cc.log(pid);
    	if(old != null){
    		old.removeSelf();
    	}
    	
    	delete this.drawShapes[pid];
    },
    
    bindShape : function(pid, shape){
    	this.drawShapes[pid] = shape;
    },
    
    /**
     * 
     * @param points
     * @param pid
     */
    addPath : function(pid, floor, points, style, viewLevel){
    	pid = "" + pid;
    	style = style || this.mapStyles.defaultStyle;
    	viewLevel = viewLevel || 0;
    	this.removeShape(pid);
    	
    	var param = {
    			id : pid,
    			points : points, 
    			style : style,
    			floor : floor, 
    			viewLevel : viewLevel,
    			drawScale : this.drawScale,
    			parentLayer : this.drawLayer
    	};
    	
    	var drawPath = new PathNode(param);
    	drawPath.onMapViewChanged({map : this, addNew : true});
    	this.bindShape(pid, drawPath);
    	
    	return drawPath;
    },
    
    removePath : function(pid){
    	pid = "" + pid;
    	this.removeShape(pid);
    },
    
    addPolyline : function(pid, floor, points, style, viewLevel){
    	pid = "" + pid;
    	style = style || this.mapStyles.defaultStyle;
    	this.removeShape(pid);
    	
    	var param = {
    			id : pid,
    			points : points, 
    			style : style,
    			floor : floor, 
    			viewLevel : viewLevel,
    			drawScale : this.drawScale,
    			parentLayer : this.drawLayer
    	};
    	
    	var geoNode = new PolyNode(param);
    	geoNode.onMapViewChanged({map : this, addNew : true});
    	this.bindShape(pid, geoNode);
    	
    	return geoNode;
    },
    
    removePolyline : function(pid){
    	this.removeShape("" + pid);
    },
    
    addCircle : function(pid, floor, center, radius, style, viewLevel){
    	pid = "" + pid;
    	style = style || this.mapStyles.getStyle("airLayer");
    	viewLevel = viewLevel || 0;
    	this.removeShape(pid);

    	var param = {
    					id : pid,
    					center : center, 
    					radius : radius,
    					style : style,
    					floor : floor, 
    					viewLevel : viewLevel,
    					drawScale : this.drawScale,
    					parentLayer : this.drawLayer
    	};

    	var circleNode = new CircleNode(param);
    	circleNode.onMapViewChanged({map : this, addNew : true});
    	this.bindShape(pid, circleNode);

    	return circleNode;

    },
    
    removeCircle : function(pid){
    	this.removeShape("" + pid);
    },
    
    moveByPixel : function(dx, dy, smoothly){
    	
    	this.viewX += dx;
    	this.viewY += dy;
    	
    	this.changeView(smoothly);
    	
    },
    
    /**
     * 将全局坐标转换为地图坐标
     * 
     * @param worldPosition *
     *                全局坐标
     * @param scale []
     *                按此缩放比例转换
     * @returns
     */
    convertToMapPosition : function(worldPosition, scale, rotation){
    	scale = this.effectScale( (scale || this.viewScale) );
    	rotation = this.effectRotation(rotation==null? this.viewRotation : rotation);
    	
    	var p = null;
    	
    	
    	if(rotation==0){
    		p = worldPosition;
    	}else{
    		p = cc.pRotateByAngle(worldPosition, cc.p(this.viewX, this.viewY), rotation/180 * Math.PI);
    	}
    		
    	return cc.p((p.x - this.viewX) / MapConsts.PIXEL_PER_METER / scale, (p.y - this.viewY) / MapConsts.PIXEL_PER_METER / scale);
    },
    
    /**
     * 将地图坐标转换为全局坐标
     * 
     * @param mapPosition *
     *                地图坐标点
     * @param scale []
     *                按此缩放比例转换
     * @returns
     */
    convertToWorldPositon : function(mapPosition, scale, rotation){
    	scale = this.effectScale( (scale || this.viewScale) );
    	rotation = this.effectRotation(rotation==null? this.viewRotation : rotation);
    	
    	var p = cc.p(mapPosition.x * MapConsts.PIXEL_PER_METER * scale + this.viewX, mapPosition.y * MapConsts.PIXEL_PER_METER * scale + this.viewY);
    	
    	if(rotation==0){
    		return p;
    	}else{
    		return cc.pRotateByAngle(p, cc.p(this.viewX, this.viewY),  -rotation/180 * Math.PI);
    	}
    	
    },
    
    /**
     * 将地图坐标转换为MapLayer坐标
     * 
     * @param mapPosition *
     *                地图坐标点
     * @param scale []
     *                按此缩放比例转换
     * @returns
     */
    convertToMapLayerPositon : function(mapPosition){
    	return cc.p(mapPosition.x * MapConsts.PIXEL_PER_METER, mapPosition.y * MapConsts.PIXEL_PER_METER);
    },
    
    /**
     * 将全局坐标转换为地图layer坐标
     * 
     * @param worldPosition
     * @param scale
     * @param rotation
     * @returns
     */
    convertToMapLayerXy : function(worldPosition, scale, rotation){
    	scale = this.effectScale( (scale || this.viewScale) );
    	rotation = this.effectRotation(rotation==null? this.viewRotation : rotation);

    	var p = null;
    	if(rotation==0){
    		p = worldPosition;
    	}else{
    		p = cc.pRotateByAngle(worldPosition, cc.p(this.viewX, this.viewY), rotation/180 * Math.PI);
    	}

    	return cc.p((p.x - this.viewX) / scale, (p.y - this.viewY) / scale);
    },
    
    /**
     * 设置地图的视图范围
     * 
     * @param mapPoint []
     *                地图坐标
     * @param scale []
     *                缩放比例
     * @param framePoint []
     *                地图点缩放后对应的全局点
     * @param runAction
     *                是否以动画方式过度
     */
    setMapView : function(mapPoint, scaleTo, viewPoint, rotation, smoothly){
    	this.stopScroll();
    	
    	scaleTo = this.effectScale( (scaleTo || this.viewScale) );
    	rotation = this.effectRotation(rotation==null? this.viewRotation : rotation);
    	viewPoint = viewPoint || cc.p(this.viewSize.width/2, this.viewSize.height/2);
    	mapPoint = mapPoint || this.convertToMapPosition(viewPoint);
    	
    	var beforeP = this.convertToWorldPositon(mapPoint, scaleTo, rotation);
    	var afterP = viewPoint;

    	this.viewX = this.viewX +  (afterP.x - beforeP.x);
    	this.viewY = this.viewY + (afterP.y - beforeP.y);
    	this.viewScale = scaleTo;
    	this.viewRotation = rotation;
    	this.changeView(smoothly);
    	
    },
    
    /***************************************************************************
     * 显示全图
     * 
     * @param runAction []
     *                是否显示动画效果
     */
    showFullMap : function(smoothly){
    	var msize = this.mapSizeInPixel;
    	var scale = Math.min( this.viewSize.width/msize.width, this.viewSize.height/msize.height); 
    	this.setMapView(this.mapCenter, scale, null, null, smoothly);
    },
    
    zoomIn : function(smoothly){
    	
    	this.setMapView(null, this.viewScale * 2, null, null, smoothly);
    },
    
    zoomOut : function(smoothly){
    	this.setMapView(null, this.viewScale * 0.5, null, null, smoothly);
    },
    
    panTo : function(position, smoothly){
    	this.setMapView(position, null, null, null, smoothly);
    },
    
    startScroll : function(dx, dy){
    	if(!this.scrollEnabled){
    		return;
    	}
    	
    	this.scrollParam = {
    			dx : dx, dy : dy
    	};
// this.updateScroll();
    	this.schedule(this.updateScroll);
    },

    stopScroll : function(){
    	this.unschedule(this.updateScroll);
    	this.scrollParam = null;
    },

    updateScroll : function(){

    	if(this.scrollParam==null){
    		return;
    	}

    	var dx = this.scrollParam.dx ;
    	var dy = this.scrollParam.dy ;

    	if( Math.abs(dx)>0.5 || Math.abs(dy)>0.5){
    		this.scrollParam.dx = dx* this.scrollSpeed;
    		this.scrollParam.dy = dy* this.scrollSpeed;
    		this.moveByPixel(dx, dy);
    	}else{
    		this.stopScroll();
    	}


    },
    
    /**
     * 获取有效的缩放比例
     * 
     * @param scale
     * @returns {Number}
     */
    effectScale : function(scale){
    	if(scale > this.maxScale){
    		scale = this.maxScale;
    	}else if(scale < this.minScale){
    		scale = this.minScale;
    	}
    	
    	return MapUtil.round3(scale);
    },
    
    effectX : function(newX){

	  	if(newX < this.minX){
	  		newX = this.minX;
	  	}else if(newX > this.maxX){
	  		newX = this.maxX;
	  	}
	  	return MapUtil.round2(newX);
    	
    }, 
    
    effectY : function(newY){
    	if(newY < this.minY){
    		newY = this.minY;
    	}else if(newY > this.maxY){
    		newY = this.maxY;
    	}
    	return MapUtil.round2(newY);
    },
    
    effectRotation : function(rotation){
    	return (rotation+180) % 360 - 180;
    },
    
    getViewLevel : function(){
    	var vlevel = 0;
    	var miter = AppContext.baseWidth / this.viewScale / MapConsts.PIXEL_PER_METER;

    	return miter;
    	
    	/*
    	if(miter > 120){
    		vlevel = 3;
    	}else if(miter > 80){
    		vlevel = 2;
    	}else {
    		vlevel = 1;
    	}

    	return vlevel;
    	*/
    },
    
    getDrawScale : function(){
    	
    	var drawScale = this.minScale;
    	
    	while(drawScale < this.viewScale  ){
    		drawScale *= 1.5;
    	}
    	
    	return 1.0/drawScale;
    }
    
});

