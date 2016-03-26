var BeaconService = {

	MAX_RSSI : -10,
	MIN_RSSI : -100,
	
	RSSI_MIN_NUM : 3,
	
	beaconsMap : {},
	sortedBeacons : [],
	beaconNodes : null,
	beaconArgs : null,
	
	txPower_default : -59,//default txPower
	restrict_default : 22,
	txPower : null,
	restrict : null,
	beaconLiveTime : 5000,
	calcBeaconCount : 5,
	
    init : function(){
    	if(this.beaconArgs==null){
    		var str = AppContext.nativeReadFileOnSdcard("data/data/beaconArgs.json");
    		if(str){
    			try{
    				this.beaconArgs = JSON.parse(str);
    			}catch(ex){
    				
    			}
    		}
    		
    		var modelArgs = this.beaconArgs["DEFAULT"] || { "txPower" : -59, "restrict" : 22, "aliveTime" : 5000, "calcBeacons" : 4 };
    		
    		if(this.beaconArgs[AppContext.deviceInfo.brand]){
    			MU.log(AppContext.deviceInfo.brand);
    			modelArgs = this.beaconArgs[AppContext.deviceInfo.brand]["DEFAULT"] || modelArgs;
    			if(this.beaconArgs[AppContext.deviceInfo.brand][AppContext.deviceInfo.model]){
    				MU.log(AppContext.deviceInfo.model);
    				modelArgs = this.beaconArgs[AppContext.deviceInfo.brand][AppContext.deviceInfo.model] || modelArgs;
    			}
    		}
    		
    		this.beaconArgs = modelArgs;
    		
    		this.txPower = modelArgs["txPower"];
    		this.restrict = modelArgs["restrict"];
    		this.beaconLiveTime = modelArgs["aliveTime"];
    		this.calcBeaconCount = modelArgs["calcBeacons"];
    		
    		MU.logObj(modelArgs);
    		
    		if(PositionService.DEBUG){
    			cc.log(JSON.stringify({txPower:this.txPower,restrict:this.restrict,aliveTime:this.beaconLiveTime,calcBeacons:this.calcBeaconCount}));
    		}
    		
    	}

    },
    
    
	updateBeaconNodes : function(mapId, beacons){
		this.init();
		//["zhaolin","23","23-1",189.38,64.55],
		//[floor, minor, x, y]
		if(beacons){
			var bcnodes = {};
			for(var i in beacons){
				var data = beacons[i];
				data.mapId = mapId;
				bcnodes["10001-"  + data.minor] = data;
			}
			this.beaconNodes = bcnodes;
		}
		
//		MU.logObj(this.beaconNodes);
	},

	addBeaconRssi : function(bcRssi){
		var key = bcRssi.major + "-" + bcRssi.minor;
		var beacon = this.beaconsMap[key] || cc.extend({rssis : [], avgRssi : -100}, bcRssi);
		beacon.updateTime = bcRssi.received;
        beacon.newest_rssi = bcRssi.rssi;
		beacon.rssis.push({rssi : bcRssi.rssi, received : bcRssi.received});
		this.beaconsMap[key] = beacon;
	},

	updateBeaconRssi : function(key){

		var now = Date.now();

		var beacon = this.beaconsMap[key];
		if(beacon){
			var rssis = [];

			for(var i=0; i<beacon.rssis.length; i++){
				var rssi = beacon.rssis[i];
				if(now - rssi.received < this.beaconLiveTime
								&& rssi.rssi < this.MAX_RSSI 
								&& rssi.rssi > this.MIN_RSSI){
					rssis.push(rssi);
				}
			}

			rssis.sort(function(a, b){
				return b.rssi - a.rssi;
			});

//			MU.logObj({msg : "排序后", rssis : rssis});
	        beacon.rssis = rssis;
			//删除最大最小值
	        if(AppContext.isAndroid){
	        	while( (rssis.length - this.RSSI_MIN_NUM) >= 2){
	        	rssis.pop();
	        	rssis.shift();
	        	}	
	        }
//            if(rssis.length> this.RSSI_MIN_NUM + 2){
//                rssis.pop();
//                rssis.shift();
//            }

//			MU.logObj({msg : "去除最大小后", rssis : rssis});

			//求平均值
			var total = 0;
			for(var i=0; i<rssis.length; i++){
				total += rssis[i].rssi;
			}

			if(rssis.length){
				beacon.avgRssi = Math.round(total/rssis.length);
				this.beaconsMap[key] = beacon;
				return beacon;
			}else{
				delete this.beaconsMap[key];
				return null;
			}
		}

	},

	updateAndSortBeacons : function(){

		var sortBeacons = [];
		for(var key in this.beaconsMap){
			var beacon = this.updateBeaconRssi(key);
			if(beacon){
				sortBeacons.push({key : key, avgRssi : beacon.avgRssi,newest_rssi:beacon.newest_rssi});
			}

		}

		sortBeacons.sort(function(a, b){
			return b.avgRssi - a.avgRssi;
		});

		this.sortedBeacons = sortBeacons;
		
		return sortBeacons;
	},
	
	findTopBeacons : function(count){
		//必须更新一次，否则rssis会不断增大
		var sortedBeacons = BeaconService.updateAndSortBeacons();
		
		//没有配置beacon信息
		if(this.beaconNodes==null){
//			cc.log("beaconNodes is null");
			return [];
		}

		var findNum = 0;
		var firstBeaconNode = null;
		var findBeacons = [];
		for(var i=0; i<sortedBeacons.length; i++){
			var beacon = sortedBeacons[i];
			var key = beacon.key;
			var bcnode = this.beaconNodes[key];

			if(findNum==0 && bcnode!=null){
				findNum++;
				firstBeaconNode = bcnode;
				var radius = this.calculateAccuracy(beacon.avgRssi);
				findBeacons.push({x : bcnode.x, y: bcnode.y, dis : radius, key: key, floor : bcnode.floor, mapId : bcnode.mapId,newest_rssi:beacon.newest_rssi,avgRssi:beacon.avgRssi});
			}else{
				if(bcnode!=null && bcnode.mapId == firstBeaconNode.mapId && bcnode.floor == firstBeaconNode.floor ){
					//其他beacon跟第一个属于用区域的，才添加
					findNum++;
					var radius = this.calculateAccuracy(beacon.avgRssi);
					findBeacons.push({x : bcnode.x, y: bcnode.y, dis : radius, key: key, floor : bcnode.floor, mapId : bcnode.mapId,newest_rssi:beacon.newest_rssi,avgRssi:beacon.avgRssi});
				}
			}

			if(findNum>=count){
				break;
			}
		}

		return findBeacons;
	},
	calculateAccuracy : function(rssi, txPower, restrict){
	      txPower = txPower || this.txPower || this.txPower_default;
	      restrict = restrict || this.restrict;
	      var absoluteDis = Math.pow(10,(txPower-rssi)/restrict);
	//      cc.log("rssi-->"+rssi+"absoluteDis-->"+absoluteDis);
		  return absoluteDis;
	//        var relativeDis = Math.sqrt(Math.pow(absoluteDis,2) - Math.pow(relativeHeight,2));
	//        cc.log("rssi-->"+rssi+",absoluteDis-->"+absoluteDis+",relativeHeight-->"+relativeHeight+",relativeDis-->"+relativeDis);
	//        if(!relativeDis){
	//           return absoluteDis;
	//        }else{
	//          return relativeDis;
	//        }
	},
	_calculateAccuracy : function(rssi, txPower){
		txPower = txPower || this.txPower || this.txPower_default;
		var result = -1.0;
		if (rssi == 0) {
			return result;
		}
		var ratio = rssi * 1.0 / txPower;
		if (ratio < 1.0) {
			return Math.pow(ratio, 10.0);
		}
		return 0.111 + 0.89976 * Math.pow(ratio, 7.7095);
	}

};;