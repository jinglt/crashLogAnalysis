

var MapConsts = MapConsts || {};


MapConsts.PIXEL_PER_METER = 64;
MapConsts.MAP_LAYER_TAG = 1024;
MapConsts.STYLE_DEFAULT = "default";

MapConsts.getRefTypeName = function(refType){
	var name = RefTypes.RefTypeMap[refType];
	
	if(name!=null){
		return name;
	}else{
		return "";
	}
}

var RefTypes = {
		USER_POSITION : "USER_POSITION",
		SELECT_POSITION : "SELECT_POSITION",
		RefTypeMap : {
						"10" : "地面"
		}
}


