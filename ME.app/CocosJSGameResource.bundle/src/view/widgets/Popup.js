var Popup = {
	
	Z_IDX_BACK_LAYER : 1000,
	Z_IDX_FRONT_LAYER : 1001,
	Z_IDX_PANEL : 1002,
	isPopShowing : false,
	loadIds : {},
	loadingNode : null,
	
	createBackLayer : function(){
		var layer = new ccui.Layout();
		layer.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
		layer.setBackGroundColor(cc.color(0, 0, 0));
		layer.setBackGroundColorOpacity(82);
		layer.setContentSize(AppContext.viewSize);
		layer.setTouchEnabled(true);
		layer.setSwallowTouches(true);
		layer.setLocalZOrder(this.Z_IDX_BACK_LAYER);
		return layer;
	},
	
	createLabel : function(text, fontSize){
		fontSize = fontSize || AppContext.baseWidth/20;
		var label = new cc.LabelTTF(text, AppStyles.font_title, fontSize);
		label.setFontFillColor(cc.hexToColor(AppStyles.font_normal_color));
		if(label.width>=AppContext.baseWidth * 0.8){
			label.boundingWidth = AppContext.baseWidth * 0.8;
		}
		
		return label;
	},
	
	createLabelMsg : function(text, fontSize){
		fontSize = fontSize || AppContext.baseWidth/20;
		var label = new cc.LabelTTF(text, AppStyles.font_title, fontSize);
		label.setFontFillColor(cc.hexToColor(AppStyles.font_title_color));
		if(label.width>=AppContext.baseWidth * 0.8){
			label.boundingWidth = AppContext.baseWidth * 0.8;
		}

		return label;
	},
	
	createPanelMsg : function(width, height){
		var panel = new ccui.Layout();
		panel.setBackGroundImageScale9Enabled(true);
		panel.setBackGroundImage(res.panel_msg_9);
		panel.setContentSize(width, height);

		panel.x = AppContext.viewSize.width/2;
		panel.y = AppContext.viewSize.height * 0.6;
		panel.anchorX = 0.5;
		panel.anchorY = 0.5;

		return panel;
	},
	
	createPanel : function(width, height){
		
		var panel = new ccui.Layout();
		panel.setBackGroundImageScale9Enabled(true);
		panel.setBackGroundImage(res.window_back_9);
		panel.setContentSize(width, height);
		
		panel.x = AppContext.viewSize.width/2;
		panel.y = AppContext.viewSize.height * 0.6;
		panel.anchorX = 0.5;
		panel.anchorY = 0.5;
		
		return panel;
	},
	
	createButton : function(title, callback){
		
		var fontSize = AppContext.baseWidth/25;
		var btn = new ccui.Button();
		btn.setTouchEnabled(true);
		btn.setScale9Enabled(true);
		btn.loadTextures(res.window_small_bg_9, res.window_small_bg_pressed_9, "");
		btn.setTitleText(title);
		btn.setTitleColor(cc.hexToColor(AppStyles.font_normal_color));
		btn.setTitleFontSize(fontSize);
		btn.setTitleFontName(AppStyles.font_title);
		btn.setContentSize(fontSize * 5, fontSize * 2);
		btn.attr({
			anchorX : 0.5,
			anchorY : 0.5
		});
		
		btn.addTouchEventListener(function (sender, type) {
			switch (type) {
			case ccui.Widget.TOUCH_BEGAN:
				break;
			case ccui.Widget.TOUCH_MOVED:
				break;
			case ccui.Widget.TOUCH_ENDED:

				if(callback){
					callback();
				}

				break;
			case ccui.Widget.TOUCH_CANCELED:
				break;

			default:
				break;
			}
		})
		
		return btn;
	},
	
	showMsg : function(msg, showSeconds){
		
		showSeconds = showSeconds || 4;
		var mainScene = cc.director.getRunningScene();
		var margin = AppContext.baseWidth/640 * 40;
		
		var label = this.createLabelMsg(msg);
		var panel = this.createPanelMsg(label.width + margin * 2, label.height + margin);
		mainScene.addChild(panel, this.Z_IDX_PANEL);
		
		panel.addChild(label);
		label.x = panel.width/2;
		label.y = panel.height/2;
		
		panel.setOpacity(0);
		
		var seq = cc.sequence(
				cc.fadeIn(0.5),
				cc.fadeTo(showSeconds-1, 255),
				cc.fadeOut(0.5),
				cc.callFunc(function(){
					panel.removeFromParent(true);
				})
		);
		
		panel.runAction(seq);
		
	},
	
	confirm : function(msg, callback, onCancel){
		if(this.isPopShowing){
			return null;
		}
		this.isPopShowing = true;
		var backLayer = this.createBackLayer();
		backLayer.onRemove = function(){
			this.removeFromParent(true);
			Popup.isPopShowing = false;
		};
		var margin = AppContext.baseWidth / 640 * 40;
		var label = this.createLabel(msg);
		
		var btnHeight = AppContext.baseWidth / 640 * 70;
		var pWidth = label.width + margin * 2;
		var pHeight = label.height + btnHeight + margin * 2;
		var pMargin = AppContext.baseWidth / 640 * 10;
		
		var okBtn = new IconButton(res.icon_correct, "", pWidth-pMargin*2, btnHeight);
		okBtn.addTouchEventListener(function(){
			if(callback){
				callback();
			}
			backLayer.onRemove();
		}, this);
		
		var panel = this.createPanel(pWidth, pHeight);
		
		label.x = panel.width/2;
		label.y = margin + okBtn.height + label.height/2;
		panel.addChild(label);
		
		okBtn.anchorX = 0.5;
		okBtn.anchorY = 0.5;
		okBtn.x = panel.width/2;
		okBtn.y = okBtn.height/2 + pMargin;
		panel.addChild(okBtn);
		
		backLayer.addChild(panel);
		
		cc.director.getRunningScene().addChild(backLayer, this.Z_IDX_BACK_LAYER);
		AppContext.pushBackKeyCallback(function(){
			
			if(cc.sys.isObjectValid(backLayer)){
				if(onCancel){
					onCancel();
				}
				backLayer.onRemove();
			}else{
				return true;
			}
		}, backLayer);
		return panel;
	},
	
	alert : function(msg, callback){
		this.confirm(msg, callback);
	},
	
	confirm2 : function(msg, onOkSelect, onCancelSelect){
		if(this.isPopShowing){
			return null;
		}
		this.isPopShowing = true;
		var backLayer = this.createBackLayer();
		var margin = AppContext.baseWidth / 15;
		var label = this.createLabel(msg);
		var okBtn = this.createButton("确定", function(){
			if(onOkSelect){
				onOkSelect();
			}
			backLayer.removeFromParent(true);
			Popup.isPopShowing = false;
		});
		var clBtn = this.createButton("取消", function(){
			if(onCancelSelect){
				onCancelSelect();
			}
			backLayer.removeFromParent(true);
			Popup.isPopShowing = false;
		});
		var panel = this.createPanel(Math.max( label.width, okBtn.width+clBtn.width+margin) + margin * 2, label.height + okBtn.height + margin * 3);

		label.x = panel.width/2;
		label.y = margin * 2 + okBtn.height + label.height/2;
		panel.addChild(label);

		okBtn.x = (panel.width - clBtn.width - margin)/2;
		okBtn.y = margin + okBtn.height/2;
		panel.addChild(okBtn);
		
		clBtn.x = okBtn.x + margin + okBtn.width;
		clBtn.y = margin + okBtn.height/2;
		panel.addChild(clBtn);

		backLayer.addChild(panel);

		cc.director.getRunningScene().addChild(backLayer);
		
		return panel;
	},
	
	showLoading : function(id, isModal){
		AppContext.nativeShowLoading();
		return;
		
		
		id = id || "root";
		this.hideLoading(id);
		
		this.loadIds[id] = true;
		//native调用
		AppContext.nativeShowLoading();
		
		var parent = new cc.Node();
		parent.x = AppContext.viewSize.width/2;
		parent.y = AppContext.viewSize.height/2;
		if(isModal){
			this.loadingNode = this.createBackLayer();
			this.loadingNode.addChild(parent);
		}else{
			this.loadingNode = parent;
		}
		
//		var img = new cc.Sprite(res.icon_loading);
//		parent.addChild(img);
//		img.runAction(cc.rotateBy(1, 360).repeatForever());
		
		var txt = UIHelper.createLabelWidget("加载中", AppContext.baseWidth * 0.05);
		parent.addChild(txt);
		cc.director.getRunningScene().addChild(this.loadingNode, this.Z_IDX_BACK_LAYER + 1);
		
	},
	
	hideLoading : function(id){
		MU.scheduleOnce(function(){
			AppContext.nativeHideLoading();
		}, this);
		
		return;
		
		
		id = id || "root";
		
		if(this.loadIds[id]){
			delete this.loadIds[id];
		}
		
		var find = false;
		for(var key in this.loadIds){
			if(this.loadIds[key]==true){
				find = true;
				break;
			}
		}
		
		if(!find){
			
			AppContext.nativeHideLoading();
			
			if(this.loadingNode!=null){
				this.loadingNode.removeFromParent(true);
				this.loadingNode = null;
			}
			
		}
	},
	
	popupInput : function(title, text, onInput){
		
		title = title || "请输入：";
		var titleTxt = this.createLabel(title);
		
		//
		var margin = AppContext.baseWidth/640 * 10;
		var pWidth = AppContext.baseWidth/640 * 560;
		var pHeight = AppContext.baseWidth/640 * 210;
		var eHeight = AppContext.baseWidth/640 * 70;
		
		//
		var backLayer = this.createBackLayer();
		//
		var panel = this.createPanel(pWidth + margin*2, pHeight + margin * 2);
		panel.y = AppContext.viewSize.height * 0.7;
		panel.setLayoutType(ccui.Layout.RELATIVE);
		backLayer.addChild(panel);
		//
		var titleBox = UIHelper.createLabelWidget(title, AppContext.baseWidth/640 * 30);
		UIHelper.addToRelativeLayout(titleBox, panel, ccui.RelativeLayoutParameter.PARENT_TOP_CENTER_HORIZONTAL, margin * 3);
		
		//
		var editBox = UIHelper.createPanel(pWidth - margin * 4, eHeight - margin, res.input_normal_9);
		editBox.setLayoutType(ccui.Layout.RELATIVE);
		UIHelper.addToRelativeLayout(editBox, panel, ccui.RelativeLayoutParameter.CENTER_IN_PARENT);
		//文本框
		var input = new TextInput("请输入..", editBox.width, editBox.height);
		UIHelper.addToRelativeLayout(input, editBox, ccui.RelativeLayoutParameter.CENTER_IN_PARENT);
		input.setString(text);
		
		//
		var okBtn = new IconButton(res.icon_correct, "", pWidth, eHeight);
		okBtn.addTouchEventListener(function(){
			var text = input.getString()
			backLayer.removeFromParent(true);
			if(onInput){
				onInput(text);
			}
		}, this);
		UIHelper.addToRelativeLayout(okBtn, panel, ccui.RelativeLayoutParameter.PARENT_BOTTOM_CENTER_HORIZONTAL, margin);

		cc.director.getRunningScene().addChild(backLayer);
		
		AppContext.pushBackKeyCallback(function(){
			if(cc.sys.isObjectValid(backLayer)){
				backLayer.removeFromParent(true);
			}else{
				return true;
			}
		}, this);
	}
	
};