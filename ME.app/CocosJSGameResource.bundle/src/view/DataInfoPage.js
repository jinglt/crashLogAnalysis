var DataInfoPage = PageView.extend({
	
	mapView: null,
	data : null,
	selectMarkerId : "selectMarkerId",
	
	onCreate : function(){
	},
	
	onShow : function(){
		return true;
	},
	
	onHide : function(){
		
		return true;
	},
	
	onResume : function(){
		if(this.data){
			this.showResultMarker(this.data);
		}
	},
	
	onPause : function(){
		this.mapView.mapLayer.removeMarker(this.selectMarkerId);
	},
	
	
	showResultMarker : function(data){
		var map = this.mapView.mapLayer;
		
		var marker = map.addMarker(this.selectMarkerId, data.floor, cc.p(data.centerX, data.centerY), UIHelper.createMarkerNode("", 3), data.viewLevel);
		marker.data = data;

		marker.onMarkerSelect =  (function(mk){
			this.mapView.showInfoData(mk.data);

			return true;
		}).bind(this);

		marker.selectMarker();

		
	}
	
})