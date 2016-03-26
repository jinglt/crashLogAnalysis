var MapScene = cc.Scene.extend({
	map : null,
	
    onEnter:function () {
    	this._super();
    	
    	cc.eventManager.addListener({
    		event: cc.EventListener.KEYBOARD, 
    		onKeyReleased: function(keyCode, event) { 
    			if (keyCode == cc.KEY.back) { 
//    				MU.log("key event goback");
    				AppContext.triggerBackKeyEvent();
    			}
    		}}, this);
    	
        //更新资源
    	UpdateManager.checkMapUpdate(function(){
    		Popup.showMsg("地图数据更新完成！");
    	});
    	
    	var helloMsg = AppContext.appProps["helloMessage"];
    	
    	if(helloMsg && helloMsg.showTime){
    		Popup.alert(helloMsg.msg);
//    		Popup.showMsg(helloMsg.msg, helloMsg.showTime);
    	}
    	
    	var csize = this.getContentSize();
    	var bg = new ImgView(AppContext.viewSize.width *2, AppContext.viewSize.height *2, res.head_bg);
    	
    	bg.setTouchEnabled(false);
    	bg.x = AppContext.viewSize.width/2;
    	bg.y = AppContext.viewSize.height/2;
    	
    	this.addChild(bg);
    	
    	this.loadMapView();
        
    },
    
    loadMapView : function(){
    	
    	this.map = new MapView({name : "mapView", mapId : UserContext.values.mapId, mapTheme : UserContext.values.mapTheme});
    	this.map.show();
    }
    
});

