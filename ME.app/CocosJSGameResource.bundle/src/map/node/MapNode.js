

var MapNode =cc.Class.extend({

	nodeType : 0,
	floor : 0,
	style : {},
	isDirty : false,
	drawScale : 1,
	parentLayer : null,
	visible : true,
	
	ctor : function(props){
//		this._super();
		cc.extend(this, props);
		this.onCreate();
		this.paint();
	},
	
	onCreate : function(){
	},
	
	repaint : function(){
		this.clear();
		this.paint();
		this.isDirty = false;
	},
	
	//need to overwirte
	paint : function(){
		
	},
	
	//need to overwirte
	clear : function(){
		
	},
	
	setVisible : function(visible){
		this.visible = visible;
	},
	
	removeSelf : function(){
		
	},
	
	//need to overwirte
	onMapViewChanged : function(viewParam){
		if(viewParam.viewLevelChanged || viewParam.floorChanged || viewParam.addNew){
			var visible = (this.style.maxViewLevel == 0 || viewParam.map.viewLevel <= this.style.maxViewLevel) && (this.floor==0 || this.floor == viewParam.map.viewFloor);
			this.setVisible(visible);
		}
		
//		MU.logObj(this, ["name", "floor", "viewLevel", "visible"]);
	}

});

MapNode.TYPE_UNKNOWN = 0;
MapNode.TYPE_POLYGON =1;
MapNode.TYPE_PATH =2;
MapNode.TYPE_LABEL =3;
MapNode.TYPE_MARKER =4;
MapNode.TYPE_CIRCLE =5;
