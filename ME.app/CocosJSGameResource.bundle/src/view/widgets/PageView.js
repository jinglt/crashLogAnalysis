var PageView = ccui.Layout.extend({
	
	isMainPage : false,
	headerLayout : null,
	headerUI : null,
	contentLayout : null,
	contentUI : null,
	footerLayout : null,
	footerUI : null,
	removeOnHide : true,
	
	ctor : function(props){
		this._super();
		
		cc.extend(this, props);

//		cc.log("page " + this.name + ", onCreate..");
		this.onCreate();
//		cc.log("page " + this.name + ", initUI..");
		this.initUI();
		this.visible = false;
		
		cc.director.getRunningScene().addChild(this, PageView.Z_INDEX);
		
	},
	
	onEnter : function(){
		this._super();
		

	},
	
	onCreate : function(){
		
	},
	
	initUI : function(){
		
		this.setContentSize(AppContext.viewSize);
		this.setLayoutType(ccui.Layout.LINEAR_VERTICAL);
		this.setClippingEnabled(true);
		
		//header
		this.headerLayout = new ccui.Layout();
		this.headerLayout.setLocalZOrder(2);
		this.addChild(this.headerLayout);
//		cc.log("page " + this.name + ", createHeaderUI..");
		this.headerUI = this.createHeaderUI();
		if(this.headerUI!=null){
			this.headerLayout.addChild(this.headerUI);
		}
		
		//content
		this.contentLayout = new ccui.Layout();
		this.contentLayout.setLocalZOrder(2);
		this.addChild(this.contentLayout);
//		cc.log("page " + this.name + ", createContentUI..");
		this.contentUI = this.createContentUI();
		if(this.contentUI!=null){
			this.contentLayout.addChild(this.contentUI);
		}
		
		//footer
		this.footerLayout = new ccui.Layout();
		this.footerLayout.setLocalZOrder(2);
		this.addChild(this.footerLayout);
//		cc.log("page " + this.name + ", createFooterUI..");
		this.footerUI = this.createFooterUI();
		if(this.footerUI!=null){
			this.footerLayout.addChild(this.footerUI);
		}
		
		this.updateLayout();
	},
	
	updateLayout : function(){
//		cc.log("page " + this.name + ", updateLayout..");
		var hheight = (this.headerUI==null?0 : this.headerUI.height);
		var fheight = (this.footerUI==null?0 : this.footerUI.height);
		
//		MU.logObj({msg : "updateLayout", hheight : hheight, fheight : fheight});
		this.headerLayout.setContentSize(AppContext.viewSize.width, hheight);
		this.footerLayout.setContentSize(AppContext.viewSize.width, fheight);
		this.contentLayout.setContentSize(AppContext.viewSize.width, AppContext.viewSize.height - hheight - fheight);
		this.requestDoLayout();
		
		this.onLayoutResize(this.contentLayout.getContentSize());
	},
	
	onLayoutResize : function(){
//		cc.log("page " + this.name + ", onLayoutResize..");
		if(this.contentUI!=null){
			this.contentUI.setContentSize(this.contentLayout.getContentSize());
		}
	},
	
	createHeaderUI : function(){
		
		var page = this;
		var ht =   AppContext.dp2Px(46); //AppContext.baseWidth/640*86;
		var layout = UIHelper.createPanel(AppContext.viewSize.width, ht, res.head_bg);
		layout.setLayoutType(ccui.Layout.RELATIVE);
		
		//label
		if(this.title){
			//AppContext.baseWidth/640*34
			var label = UIHelper.createLabelWidget(this.title, AppContext.dp2Px(17), cc.hexToColor(AppStyles.font_title_color), AppStyles.font_title);
			this.title.name = "title";
			UIHelper.addToRelativeLayout(label, layout, ccui.RelativeLayoutParameter.CENTER_IN_PARENT, 0);
		}
		
		//backPage
		var backBtn;
		var bMargin = AppContext.baseWidth/60;
		if(this.isMainPage){
			backBtn = new IconListItem(res.head_backword, AppStyles.exitTitle, ht * 2.5, ht, bMargin);
			backBtn.getTextNode().setFontName(AppStyles.font_title);
//			backBtn.getTextNode().setFontSize(ht/2);
			backBtn.getTextNode().setColor(cc.hexToColor(AppStyles.font_title_color));
			backBtn.contentScale = 0.45;
			backBtn.onSizeChanged();
			UIHelper.addToRelativeLayout(backBtn, layout, ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL);
		}else{
			backBtn = new IconListItem(res.head_backword, "", ht, ht, bMargin);
			backBtn.contentScale = 0.45;
			backBtn.onSizeChanged();
			UIHelper.addToRelativeLayout(backBtn, layout, ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL);
		}
		
		backBtn.name = "backBtn";
		backBtn.getButton().loadTexturePressed(res.btn_red_pressed_9);
		backBtn.addTouchEventListener(function(){
			this.hide();
		}, page);
		
		return layout;
	},
	
	createContentUI : function(){
		
	},
	
	createFooterUI : function(){
		
	},
	
	show : function(){
		PageView.showPage(this);
	},
	
	onShow : function(){
//		cc.log("page " + this.name + ", onShow..");
		return true;
	},
	
	hide : function(){
		PageView.hidePage(this);
	},
	
	onHide : function(close){
//		cc.log("page " + this.name + ", onHide..");
		return true;
	},
	
	onResume : function(){
//		cc.log("page " + this.name + ", onResume..");
	},
	
	onPause : function(){
//		cc.log("page " + this.name + ", onPause..");
	}
	
});

PageView.Z_INDEX = 10;
PageView.pages = [];

PageView.findPage = function(page){
	if(page==null){
		return -1;
	}
	for(var i=0; i<this.pages.length; i++){
		if(this.pages[i] == page){
			return i;
		}
	}
	
	return -1;
}

PageView.removeFromPages = function(page){
	var i = this.findPage(page);
	
	while(i>=0){
		this.pages.splice(i, 1);
		i = this.findPage(page);
	}
}

PageView.showPage = function(page){
	
	if(page==null){
		return;
	}
	
	var lastPage;
	if(page.onShow()){
		this.removeFromPages(page);

		if(this.pages.length>0){
			lastPage = this.pages[this.pages.length-1];
			if(lastPage!=null){
				if(!lastPage.isMainPage){
					lastPage.visible = false;
				}
				lastPage.onPause();
			}
		}
		this.pages.push(page);
		PageView.resumePage(page);
	}
}

PageView.resumePage = function(page){
//	MU.log("resumePage " + page.name);
	page.visible = true;
	page.setLocalZOrder(PageView.Z_INDEX + this.pages.length);
	page.onResume();
	AppContext.pushBackKeyCallback(page.hide, page);
}

PageView.hidePage = function(page){
	
	if(page==null){
		return;
	}

	if(page.onHide()){
		page.onPause();
		this.removeFromPages(page);
		page.visible = false;
		if(page.removeOnHide){
			page.removeFromParent(true);
		}
		
		if(this.pages.length>0){
			var lastPage = this.pages[this.pages.length-1];
			if(lastPage!=null){
				PageView.resumePage(lastPage);
			}
		}
	}else{
		PageView.resumePage(page);
	}
	
}

PageView.hideToRoot = function(){
	while(this.pages.length>1){
		this.hideTopPage();
	}
}

PageView.hideTopPage = function(){
	if(this.pages.length>0){
		var page = this.pages[this.pages.length-1];
		page.hide();
	}
	if(this.pages.length==0){
		AppContext.nativeExitApp();
	}
}


