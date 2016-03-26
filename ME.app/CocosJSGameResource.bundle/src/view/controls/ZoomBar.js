
var ZoomBar = ccui.Layout.extend({
	mapView : null,
	layout : null,
	zoomInBtn:null,
	zoomOutBtn:null,
	
	ctor : function(mapView){
		this._super();
		this.mapView = mapView;
		
		this.initView();
	},
	
	initView : function(){
		var margin = AppContext.baseWidth / 640 * 5;
		var btnWidth = AppContext.dp2Px(40);// AppContext.baseWidth / 640 * 69;
		
		this.setLayoutType(ccui.Layout.RELATIVE);
		this.setContentSize(btnWidth + margin * 2, btnWidth * 2 + margin * 2);
		this.setBackGroundImage(res.window_small_bg_9);
		this.setBackGroundImageScale9Enabled(true);
		this.setTouchEnabled(true);
		
		//
		var btnBox = new ccui.VBox();
		btnBox.setContentSize(btnWidth, btnWidth * 2);
		UIHelper.addToRelativeLayout(btnBox, this, ccui.RelativeLayoutParameter.CENTER_IN_PARENT);
		
		//btns
		this.zoomInBtn = this.createBtn(btnWidth, res.icon_plus);
		btnBox.addChild(this.zoomInBtn);
		this.zoomInBtn.addTouchEventListener(this.touchEvent ,this);
		//
		this.addChild(UIHelper.createHSplit(btnWidth, 0, null, null, btnWidth * 0.3));
		//
		this.zoomOutBtn = this.createBtn(btnWidth, res.icon_minus);
		btnBox.addChild(this.zoomOutBtn);
		this.zoomOutBtn.addTouchEventListener(this.touchEvent ,this);
		
	},
	
	touchEvent: function (sender, type) {
		switch (type) {
			case ccui.Widget.TOUCH_BEGAN:
				break;
			case ccui.Widget.TOUCH_MOVED:
				break;
			case ccui.Widget.TOUCH_ENDED:
				
				if(sender==this.zoomInBtn){
					this.mapView.mapLayer.zoomIn(true);
				}else if (sender==this.zoomOutBtn){
					this.mapView.mapLayer.zoomOut(true);
				}
				
				break;
			case ccui.Widget.TOUCH_CANCELED:
				break;
	
			default:
				break;
		}
	},
	
	createBtn : function(btnWidth, icon){
		
		var button = new ccui.Button();
		button.setTouchEnabled(true);
		button.setScale9Enabled(true);
		button.loadTextures("", res.btn_pressed_nb_sm_9);
		button.setContentSize(btnWidth, btnWidth);
		button.setTitleFontSize(btnWidth * 0.8);
		button.setTitleColor(cc.color(0, 0, 0));
		button.setTitleText("");
		button.setTitleFontName(AppStyles.font_normal);
		
		var dn = new cc.Sprite(icon);
		dn.scale = btnWidth * 0.4 /dn.width;
		
		dn.attr({
			x : btnWidth/2,
			y : btnWidth/2
		});
		
		button.addNode(dn);
		
		return button;
	}
	
	
});

