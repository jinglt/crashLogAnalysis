
var LabelNode = MapNode.extend({
	
	// 相关属性
	_rootNode : null,
	_textNode : null,
	_iconNode : null, 
	viewRect : null,
	
	
	onCreate : function(){
		this.nodeType = MapNode.TYPE_LABEL;
		this._rootNode = new cc.Node();
		
		this._rootNode.x = this.centerX * MapConsts.PIXEL_PER_METER;
		this._rootNode.y = this.centerY * MapConsts.PIXEL_PER_METER;
		this.text = this.text || this.name;
		this.viewRect = cc.rect(this._rootNode.x, this._rootNode.y, 0, 0);
		
//		this._rootNode.setLocalZOrder(this.style.floor||0);
		this._rootNode.setVertexZ(0);
		this.parentLayer.addChild(this._rootNode);
	},
	
	paint : function(){
		
		if(this.style.showLabel==false){
			return;
		}
		
		var textNode;
		if(this.style.fontSize>0){
			// 文字 
			textNode = new cc.LabelTTF(this.text, this.style.fontName, this.style.fontSize);
			textNode.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
			textNode.setFontFillColor(this.style.fontColor);
			if(textNode.width>(5 * this.style.fontSize)){
				textNode.boundingWidth = (textNode.width) * 0.6;
			}
			if(this.style.fontStrokeWidth>0){
				textNode.enableStroke(this.style.fontStrokeColor, this.style.fontStrokeWidth);
			}

			this._rootNode.addChild(textNode, 1);
			this._textNode = textNode;
		}

		//图标
		if(this.style.iconSize>0 && this.style.iconName!=""){

			var iconSize = this.style.iconSize;
			var icon = new cc.Sprite(this.style.iconPath + this.style.iconName);
			icon.scale = iconSize / icon.width;

			this._rootNode.addChild(icon);
			this._iconNode = icon;

			//调整text位置
			if(textNode){
				//下方
				textNode.y = - (iconSize / 2 + textNode.height * 0.5);
			}
			
		}
		
	},
	
	clear : function() {
		if(this._textNode){
			this._textNode.removeFromParent(true);
			this._textNode = null;
		}
		if(this._iconNode){
			this._iconNode.removeFromParent(true);
			this._iconNode = null;
		}
		
	},
	
	onMapViewChanged : function(viewParam){
		this._super(viewParam);
		
		if(viewParam.rotationChanged || viewParam.floorChanged || viewParam.addNew){
//			this.rotation = -viewParam.map.viewRotation;
			this._rootNode.runAction(cc.rotateTo(0.2, -viewParam.map.viewRotation, -viewParam.map.viewRotation));
		}
		
		if(viewParam.scaleChanged || viewParam.floorChanged || viewParam.addNew){
//			this.scale = 1/viewParam.map.viewScale;
			this._rootNode.runAction(cc.scaleTo(0.2, 1/viewParam.map.viewScale, 1/viewParam.map.viewScale));
		}
		
		this.updateViewRect(viewParam.map);
		
	},
	
	setVisible : function(visible){
		this.visible = visible;
		if(this._rootNode){
			this._rootNode.visible = visible;
		}
	},
	
	setTextVisible : function(visible){
		if(this._textNode){
			this._textNode.visible = visible;
		}
	},
	
	removeSelf : function(){
		if(this._rootNode!=null){
			this._rootNode.removeFromParent(true);
			this._rootNode = null;
		}
	},
	
	updateViewRect : function(map){

		var p = cc.p(this.centerX, this.centerY);
		p = map.convertToWorldPositon(p);
//		p.x = p.x - map.x;
//		p.y = p.y - map.y;
		
		if(this._textNode==null){
			this.viewRect = cc.rect(p.x, p.y, 0, 0);
			return;
		}
		
		
		var textWidth = this._textNode.width;
		var textHeight = this._textNode.height;
		
//		cc.log(this.text + " : " + textWidth + ", " + textHeight);

		if(this._iconNode==null){
			this.viewRect = cc.rect(p.x - textWidth/2, p.y - textHeight/2, textWidth, textHeight);
		}else{
			var iconWidth = this._iconNode.width * this._iconNode.scale;
			var iconHeight = this._iconNode.height * this._iconNode.scale;
			//右侧
//			this.viewRect = cc.rect(p.x - iconWidth/2, p.y - iconHeight/2, textWidth + iconWidth , textHeight);
			//下方
			this.viewRect = cc.rect(p.x - textWidth/2, p.y + this._textNode.y - textHeight/2, textWidth, textHeight);
		}
	},
	
	getViewRect : function(){
		return this.viewRect;
	}

});

