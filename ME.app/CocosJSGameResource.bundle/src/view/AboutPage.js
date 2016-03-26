var AboutPage = PageView.extend({
	
	
	onCreate : function(){
		this.title = "关于";
	},
	
	onShow : function(){
		return true;
	},
	
	onHide : function(){
		return true;
	},
	
	onResume : function(){
		
	},
	
	onPause : function(){
		
	},
	
	createContentUI : function(){
		
		var layout = UIHelper.createColoredPanel(cc.color.WHITE);
		layout.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
		
		//top pad
		UIHelper.addToLinearLayout(UIHelper.createPanel(AppContext.baseWidth, AppContext.baseWidth/640*30), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		//logo
		var logoImg = new ImgView(AppContext.baseWidth/640*140, null, res.icon_app);
		UIHelper.addToLinearLayout(logoImg, layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		//pad
		UIHelper.addToLinearLayout(UIHelper.createPanel(AppContext.baseWidth, AppContext.baseWidth/640*10), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		//version
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("Follow me v" + AppContext.VERSION, AppContext.baseWidth/640*24, cc.hexToColor(AppStyles.font_tip_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);

		//pad
		UIHelper.addToLinearLayout(UIHelper.createPanel(AppContext.baseWidth, AppContext.baseWidth/640*30), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);

		//技术支持
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("技术支持", AppContext.baseWidth/640*30, cc.hexToColor(AppStyles.font_marker_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		//pad
		UIHelper.addToLinearLayout(UIHelper.createPanel(AppContext.baseWidth, AppContext.baseWidth/640*30), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("职能研发部", AppContext.baseWidth/640*30, cc.hexToColor(AppStyles.font_marker_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);

		//pad
		UIHelper.addToLinearLayout(UIHelper.createPanel(AppContext.baseWidth, AppContext.baseWidth/640*20), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("研发团队", AppContext.baseWidth/640*24, cc.hexToColor(AppStyles.font_tip_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("@张宁 @宋世涛 @韩锋", AppContext.baseWidth/640*24, cc.hexToColor(AppStyles.font_tip_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		
		UIHelper.addToLinearLayout(UIHelper.createPanel(AppContext.baseWidth, AppContext.baseWidth/640*10), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("产品团队", AppContext.baseWidth/640*24, cc.hexToColor(AppStyles.font_tip_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("@盛龙 @金新尧 @潘益", AppContext.baseWidth/640*24, cc.hexToColor(AppStyles.font_tip_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);

		UIHelper.addToLinearLayout(UIHelper.createPanel(AppContext.baseWidth, AppContext.baseWidth/640*10), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("项目管理", AppContext.baseWidth/640*24, cc.hexToColor(AppStyles.font_tip_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("@纪鸿焘 @王威", AppContext.baseWidth/640*24, cc.hexToColor(AppStyles.font_tip_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);

		//pad
		UIHelper.addToLinearLayout(UIHelper.createPanel(AppContext.baseWidth, AppContext.baseWidth/640*30), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("意见反馈", AppContext.baseWidth/640*30, cc.hexToColor(AppStyles.font_marker_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);

		//pad
		UIHelper.addToLinearLayout(UIHelper.createPanel(AppContext.baseWidth, AppContext.baseWidth/640*20), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);
		UIHelper.addToLinearLayout(UIHelper.createLabelWidget("ihome@jd.com", AppContext.baseWidth/640*24, cc.hexToColor(AppStyles.font_tip_color)), layout, ccui.LinearLayoutParameter.CENTER_HORIZONTAL);

		
		
		
		return layout;
	},
	
	createLabel : function(text, width, height){
		var lblWidget = UIHelper.createMarginWidget(width, height);
		var txt = new cc.LabelTTF(text, AppStyles.font_normal, height * 0.5);
		txt.setColor(cc.hexToColor(AppStyles.font_normal_color));
		txt.anchorX = 1;
		txt.anchorY = 0.5;
		txt.x = width;
		txt.y = height/2;
		txt.boundingWidth = width;
		txt.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
		txt.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
		lblWidget.addChild(txt);
		return lblWidget;
	},
	
	createValue : function(text, width, height){
		var valWidget = UIHelper.createMarginWidget(width, height);
		var txt = new cc.LabelTTF(text, AppStyles.font_normal, height * 0.5);
		txt.setColor(cc.hexToColor(AppStyles.font_normal_color));
		txt.anchorX = 0;
		txt.anchorY = 0.5;
		txt.x = 0;
		txt.y = height/2;
		txt.boundingWidth = width;
		txt.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
		txt.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
		valWidget.addChild(txt);
		return valWidget;
	},
	
	onLayoutResize : function(){
		this._super();
	}
	
})