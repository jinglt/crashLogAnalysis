
var IconButton = ccui.Layout.extend({
	
	_button : null,
	_iconSprite : null,
	_textNode : null,
	contentScale : 0.5,
	
	ctor : function(iconFile, text, width, height){
		this._super();
		this.initView(iconFile, text, width, height);
	},
	
	getTextNode : function(){
		return this._textNode;
	},
	
	getIconNode : function(){
		return this._iconSprite;
	},
	
	getButton : function(){
		return this._button;
	},
	
	initView : function(iconFile, text, width, height){
		
		var btn = new ccui.Button();
		this._button = btn;
		btn.setTouchEnabled(true);
		btn.setScale9Enabled(true);
		btn.loadTexturePressed(res.btn_pressed_nb_sm_9);
		btn.attr({
			anchorX : 0.5,
			anchorY : 0.5
		});
		this.addNode(btn);
		
		var icon = new cc.Sprite(iconFile);
		this._iconSprite = icon;
		this.addNode(icon);
		
		if(text){
			var label = new ccui.Text();
			this._textNode = label;
			label.setString(text);
			label.setFontName(AppStyles.font_normal);
			label.setColor(cc.hexToColor(AppStyles.font_normal));
			this.addNode(label);
		}
		
		this.setContentSize(width, height);
		this.onSizeChanged();
	},
	
	onSizeChanged: function () {
		
//		cc.log("_onSizeChanged");
		
		var csize = this.getContentSize();
		
		this._button.setContentSize(csize);
		this._button.x = csize.width/2;
		this._button.y = csize.height/2;
		
		
		//图标和文字
		var baseSize = csize.height * this.contentScale;
		
		//图标
		this._iconSprite.scale =  baseSize / this._iconSprite.height;
		if(this._textNode==null){
			this._iconSprite.x = csize.width/2;
			this._iconSprite.y = csize.height/2;
		}else{
			this._textNode.setFontSize(baseSize * 0.8);
			var itWidth = baseSize * 1.5 + this._textNode.width;

			this._iconSprite.x = (csize.width - itWidth)/2 + baseSize/2;
			this._iconSprite.y = csize.height/2;

			this._textNode.x = this._iconSprite.x + baseSize * 0.7 + this._textNode.width/2;
			this._textNode.y = csize.height/2;
		}
		
		
		
		
		
	},
	
	addTouchEventListener : function(selector, target, param){
		this._button.addTouchEventListener(function (sender, type) {
			switch (type) {
			case ccui.Widget.TOUCH_BEGAN:
				break;
			case ccui.Widget.TOUCH_MOVED:
				break;
			case ccui.Widget.TOUCH_ENDED:
				selector.call(target, param);
				break;
			case ccui.Widget.TOUCH_CANCELED:
				break;

			default:
				break;
			}
		}, target);
	}
	
});

