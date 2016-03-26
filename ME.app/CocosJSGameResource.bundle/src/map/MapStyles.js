

var MapStyles = cc.Class.extend({
	
	defaultStyle : null,
	styleByName : null,
	refTypeMap : null,
	
	ctor : function(styles){
		
		//styleByName
		var styleByName = {};
		for(var key in styles.styles){
			var prop = MapStyles.loadProps(key, styles.styles);
			styleByName[key] = new MapStyleDef(prop);
		}
		
		this.defaultStyle = styleByName[MapConsts.STYLE_DEFAULT];
		this.styleByName = styleByName;
		
		//styleByReftype
		this.refTypeMap ={};
		for(var i=0; i<styles.map.length; i++){
			var mp = styles.map[i];
			var style = styleByName[mp.style] || this.defaultStyle;
			var styleProp = cc.extend({}, style, mp);
			this.refTypeMap[mp.refType] = styleProp;
		}
		
		MapStyles.currentStyle = this;
	},
	
	getStyle : function(styleName, defaultName){
		
		var stName = styleName || defaultName || MapConsts.STYLE_DEFAULT;
		var style = this.styleByName[stName];
		
		if(style==null){
			style = this.defaultStyle;
		}
		
		return style;
	},
	
	getStyleByRefType : function(refType, defaultName){
		var props = this.refTypeMap[refType];
		
		if(props==null && defaultName){
			props = this.refTypeMap[defaultName];
		}
		
		return props || this.defaultStyle;
	},
	
	getRefTypeDesc : function(refType){
		var props = this.refTypeMap[refType];
		if(props){
			return props.desc;
		}
		
		return "";
	}
	
});

MapStyles.parseColor = function(colorParam){
	if(colorParam==null){
		return null;
	}else{
		if(cc.isString(colorParam)){
			return cc.hexToColor(colorParam);
		}else if(cc.isArray(colorParam)){
			return cc.color.apply(null, colorParam);
		}
	}
	
	return null;
}

MapStyles.loadProps = function(styleName, styles){
	
	var props = styles[styleName];
	
	if(styleName==MapConsts.STYLE_DEFAULT){
		return props;
	}
	
	var parent = props.extend || MapConsts.STYLE_DEFAULT;
	
	parent = MapStyles.loadProps(parent, styles);
	
	return cc.extend({}, parent, props );
};

MapStyles.currentStyle = null;

var MapStyleDef =  cc.Class.extend({
	iconPath : "",
	baseFontSize : 1,
	baseLineWidth : 1,
	
	ctor : function(props){
		cc.extend(this, props);

		this.iconPath = "data/themes/icon/";
		this.baseFontSize = (AppContext.dp2Px(4));
		this.baseLineWidth = 1;
		
		this.fillColor = MapStyles.parseColor(this.fillColor);
		this.borderWidth = ( MU.isNull(this.borderWidth, 0) * this.baseLineWidth);
		this.borderColor = MapStyles.parseColor(this.borderColor);
		this.showLabel = MU.isNull(this.showLabel, false);
		this.fontName = MU.isNull(this.fontName, AppStyles.font_normal);
		this.iconSize = (MU.isNull(this.iconSize, 4) * this.baseFontSize);
		this.iconName = MU.isNull(this.iconName , "");
		this.fontSize = (MU.isNull(this.fontSize, 4) * this.baseFontSize);
		this.fontColor = MapStyles.parseColor(this.fontColor);
		this.fontStrokeColor = MapStyles.parseColor(this.fontStrokeColor);
		this.fontStrokeWidth = (MU.isNull(this.fontStrokeWidth, 0) * this.baseFontSize);
		this.lineWidth = (MU.isNull(this.lineWidth, 1) * this.baseLineWidth);
		this.lineColor = MapStyles.parseColor(this.lineColor);
		this.lineColor2 = MapStyles.parseColor(this.lineColor2);
		this.lineIcon = MU.isNull(this.lineIcon, null);
		this.lineIconDIs = (MU.isNull(this.lineIconDIs, 2));
		this.lineIconSize = (MU.isNull(this.lineIconSize, 0) * this.baseLineWidth);
		this.shadowSize = (MU.isNull(this.shadowSize, 0) * MapConsts.PIXEL_PER_METER);
		this.shadowColor = MapStyles.parseColor(this.shadowColor);
		this.shadowColor2 = MapStyles.parseColor(this.shadowColor2);
		this.zIndex = MU.isNull(this.zIndex, 0);
		this.maxViewLevel = MU.isNull(this.maxViewLevel, 0);
		this.dotsColor = MapStyles.parseColor(this.dotsColor);
	}
});


