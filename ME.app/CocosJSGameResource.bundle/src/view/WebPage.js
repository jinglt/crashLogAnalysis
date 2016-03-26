var WebPage = PageView.extend({
	
	url : null,
	
	onShow : function(){
		if(this.url){
			var page  = this;
			AppContext.checkNetwork(function(){
				AppContext.nativeOpenWebPage(page.url, page.headerUI.height);
			}, function(err){
//				MU.log("超时");
				Popup.alert("请在北京总部内网进行访问！", function(){
					page.hide();
				});
			});
			
		}
		return true;
	},
	
	onHide : function(){
		AppContext.nativeCloseWebPage();
		return true;
	},
	
	createContentUI : function(){
		return UIHelper.createPanel(1, 1, res.panel_bg_9);
	}
	
	
});