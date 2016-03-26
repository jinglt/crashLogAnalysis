var TextInput = ccui.Widget.extend({
	
	_textField : null,
	_textHolder : null,
	_deleteBtn : null,
	_cursor : null,
	
	ctor : function(placeHolder, width, height, backImg){
		this._super();
		this.initView(placeHolder, width, height, backImg);
	},
	
	initView : function(placeHolder, width, height, backImg){
		
		this.setContentSize(width, height);
		// textfield
		var textHolder = new ccui.Layout();
		this._textHolder = textHolder;
		this.addNode(textHolder);
		textHolder.setContentSize(width, height);
		if(backImg){
			textHolder.setBackGroundImage(backImg);
			textHolder.setBackGroundImageScale9Enabled(true);
		}
		textHolder.setTouchEnabled(true);
		textHolder.addTouchEventListener(this.onTextHolderTouch, this);
		

		var margin = AppContext.baseWidth/640 * 10;
		var textField = new ccui.TextField(placeHolder, AppStyles.font_normal, height*0.5);
		this._textField = textField;
//		textField.setMaxLengthEnabled(true);
//		textField.setMaxLength(width/(height*0.6));
		textField.setPlaceHolderColor(cc.hexToColor(AppStyles.font_tip_color));
		textField.setTextColor(cc.hexToColor(AppStyles.font_normal_color));
		textField.setTouchEnabled(true);
//		textField.setContentSize(width, height);
//		textField.setTouchAreaEnabled(true);
//		textField.setTextAreaSize(cc.size(width, height));
		textField.anchorX = 0;
		textField.anchorY = 0.5;
		textField.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
		textField.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
		textField.x = margin;
		textField.y = height/2;
		textField.addEventListener(this.textFieldEvent, this);
		textField.boundingWidth = width - margin * 2;
		textHolder.addChild(textField);
		
		var deleteBtn = new ccui.Button();
		deleteBtn.loadTextureNormal(res.icon_delete);
		deleteBtn.scale = height*0.6 / deleteBtn.height;
		deleteBtn.x = width - height*0.5;
		deleteBtn.y = height/2;
		deleteBtn.visible = false;
		deleteBtn.addTouchEventListener(this.onDeleteBtnTouch, this);
		this.addNode(deleteBtn);
		this._deleteBtn = deleteBtn;
		
		//_cursor
		var cursor = new cc.DrawNode();
		cursor.drawSegment(cc.p(0,0), cc.p(0, height - margin * 2), 1, cc.hexToColor(AppStyles.font_normal_color));
		cursor.x = margin;
		cursor.y = margin;
		cursor.visible = false;
		this.addChild(cursor);
		this._cursor = cursor;
	},
	
	onDeleteBtnTouch : function(sender, type){
		switch (type) {
		case ccui.Widget.TOUCH_BEGAN:
			break;
		case ccui.Widget.TOUCH_MOVED:
			break;
		case ccui.Widget.TOUCH_ENDED:

			this._textField.setString("");
			this._textField.attachWithIME();
			this._deleteBtn.visible =  false;
			this.onTextChanged(this._textField.getString());

			break;
		case ccui.Widget.TOUCH_CANCELED:
			break;

		default:
			break;
		}
	},
	
	onTextHolderTouch : function(sender, type){
		switch (type) {
		case ccui.Widget.TOUCH_BEGAN:
			break;
		case ccui.Widget.TOUCH_MOVED:
			break;
		case ccui.Widget.TOUCH_ENDED:
			this._textField.attachWithIME();
			break;
		case ccui.Widget.TOUCH_CANCELED:
			break;

		default:
			break;
		}
	},
	
	onSizeChanged: function () {
		
		var csize = this.getContentSize();
		
		this._textHolder.setContentSize(csize);
		this._textField.y = csize.height/2;
		this._textField.setMaxLength(csize.width/(csize.height*0.6));
		this._textField.setFontSize(csize.height*0.6);
		
		this._deleteBtn.scale = csize.height*0.8 / deleteBtn.height;
		this._deleteBtn.x = csize.width - csize.height*0.5;
		this._deleteBtn.y = csize.height/2;
	},
	
	getString : function(){
		return this._textField.getString();
	},
	
	setString : function(text){
		this._textField.setString(text);
		if(text!=""){
			this._deleteBtn.visible =  true;
		}
		this._onTextChanged(text);
	},
	
	setPlaceHolder : function(text){
		this._textField.setPlaceHolder(text);
	},
	
	attachWithIME : function(){
		return this._textField.attachWithIME();
	},
	
	didNotSelectSelf : function(){
		return this._textField.didNotSelectSelf();
	},
	
	textFieldEvent : function (sender, type) {
		var textField = sender;
		
		switch (type) {
		case ccui.TextField.EVENT_ATTACH_WITH_IME:
			
			this._onTextFocus();
			break;
		case ccui.TextField.EVENT_DETACH_WITH_IME:
			
			this._onTextLoseFocus();
			break;
		case ccui.TextField.EVENT_INSERT_TEXT:
			this._deleteBtn.visible =  true;
			
			if(textField.width> this.width - textField.x * 2){
				var text = textField.getString();
				textField.setString(text.substr(0, text.length-1));
			}
			
			this._onTextChanged(textField.getString());
			break;
		case ccui.TextField.EVENT_DELETE_BACKWARD:
			if(textField.getString()==""){
				this._deleteBtn.visible =  false;
			}
			this._onTextChanged(this._textField.getString());
			break;
		default:
			break;
		}
	},
	
	_onTextFocus : function(){
		this.showCursor();
		this.onTextFocus();
	},
	
	onTextFocus : function(){
	},
	
	_onTextLoseFocus : function(){
		this.hideCursor();
		this.onTextLoseFocus();
	},
	
	onTextLoseFocus : function(){
	},
	
	_onTextChanged : function(text){
		this.showCursor();
		this.onTextChanged(text);
	},
	
	onTextChanged : function(text){
		
	},
	
	showCursor : function(){
		var x = this._textField.x;
		if(this._textField.getString()!=""){
			x = this._textField.x + this._textField.width;
		}
		this._cursor.x = x;
		this._cursor.visible = true;
		this._cursor.runAction(cc.blink(1, 1).repeatForever());
	},
	
	hideCursor : function(){
		this._cursor.visible = false;
		this._cursor.stopAllActions();
	}
	
});

