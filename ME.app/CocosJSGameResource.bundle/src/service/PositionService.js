
var PositionService = cc.extend({
	POSITION_TAG : "PositionService_NODE",
	UPDATE_TIME : 1.3,
	DEBUG : false,
	INSPECTS_REPEAT_TIMES : 10,

	map : null,
	positionMarker : null,
	isTracing : false,
	currentPosition : null,
	
	getCurrentPosition : function(){
		return this.currentPosition;
	},
	
	getCoordinate : function(){
		
//		MU.log("getCoordinate start");
		var bcCount = BeaconService.calcBeaconCount;
		
		if(this.DEBUG && !this._drawBeacons){
			var bcNodes = BeaconService.beaconNodes;

			for(var key in bcNodes){
				var beacon = bcNodes[key];
				this.map.addMarker("Beacon-node-" + key, beacon.floor, beacon, this.createBeaconNode(key.split("-")[1]));
			}
			
			this._drawBeacons = true;
		}
		
		
		if(this.DEBUG){
			for(var i=0; i<bcCount; i++){
				this.map.removeCircle("Beacon-circle-" + i);
			}
		}
		
		
		var beacons = BeaconService.findTopBeacons(bcCount);
		
//		MU.log("getCoordinate findTopBeacons "  + beacons.length);
		if(beacons.length==0){
			this.currentPosition = null;
			return null;
		}
		
		for(var i=0; i<beacons.length && i<2; i++){
			var beacon = beacons[i];
			if(this.DEBUG){
//				this.map.addMarker("Beacon-node-" + beacon.key, beacon.floor, beacon, this.createBeaconNode(beacon.key.split("-")[1]+"-"+beacon.newest_rssi+"-"+beacon.avgRssi));
				this.map.addCircle("Beacon-circle-" + i, beacon.floor, beacon,  beacon.dis);
			}
		}
		
        //MU.log("getCoordinate calculatePositionByBeacons ");
		var pos = this.calculatePosition_pro(beacons);
        if(pos){
        	var mapBound = this.map.mapInfo.mapBounds;
        	if(mapBound){
        		if(pos.x){
        			pos.x<mapBound.left?mapBound.left:pos.x;
        			pos.x>mapBound.right?mapBound.right:pos.x;
        		}
        		if(pos.y){
        			pos.y<mapBound.bottom?mapBound.bottom:pos.y;
        			pos.y>mapBound.top?mapBound.top:pos.y;
        		}
        	}
        	pos.floor = beacons[0].floor;
        	pos.mapId = beacons[0].mapId;
        	pos.centerX = pos.x;
        	pos.centerY = pos.y;
        	pos.refType = RefTypes.USER_POSITION;
        	this.currentPosition = pos;
         }else{
            return this.currentPosition;
         }
		return pos;
	},
	calculatePosition : function(beacons){
		var inspect_points = [];
		for(var j=0; j<beacons.length; j++){
			var beacon1 = beacons[j];
			for(var i=j+1; i<beacons.length; i++){
				var beacon2 = beacons[i];
				if(beacon1 && beacon2){
					var inspect_res = CalcCircle.calcCircleInsect(beacon1.x,beacon1.y,beacon1.dis,beacon2.x,beacon2.y,beacon2.dis);
					var r2_1 = beacon2.dis;
					var repeatTimes_1 = 0;
					var restrict_1 = BeaconService.restrict;
					while(inspect_res && (inspect_res.count == -1)){//圆2包含圆1
					r2_1 = BeaconService.calculateAccuracy(beacon2.avgRssi,BeaconService.txPower,++restrict_1);
					repeatTimes_1++;
					if(r2_1<=0 || repeatTimes_1>this.INSPECTS_REPEAT_TIMES){break;}
					inspect_res = CalcCircle.calcCircleInsect(beacon1.x,beacon1.y,beacon1.dis,beacon2.x,beacon2.y,r2_1);
					}
					var r2_2 = beacon2.dis;
					var repeatTimes_2 = 0;
					var restrict_2 = BeaconService.restrict;
					while(inspect_res && (inspect_res.count == -2)){//圆1和圆2无交点且不包含
						r2_2 = BeaconService.calculateAccuracy(beacon2.avgRssi,BeaconService.txPower,--restrict_2);
						repeatTimes_2++;
						if(repeatTimes_2>this.INSPECTS_REPEAT_TIMES){break;}
						inspect_res = CalcCircle.calcCircleInsect(beacon1.x,beacon1.y,beacon1.dis,beacon2.x,beacon2.y,r2_2);
					}
					if(inspect_res){
						if(inspect_res.count == 1){
							inspect_points.push(inspect_res.p0);
						}
						if(inspect_res.count == 2){
							var compare_point;
							if((i-j)==1 && j>0){compare_point = beacons[0];}else if
							((i-j)==1 && j==0 && beacons[i+1]){compare_point = beacons[i+1];}else if
							((i-j)>1 && j==0){compare_point = beacons[j+1];}else if
							((i-j)>1 && j>0){compare_point = beacons[0];}
							if(compare_point){
								if(cc.pDistance(inspect_res.p0,compare_point) < cc.pDistance(inspect_res.p1,compare_point)){
									inspect_points.push(inspect_res.p0);
								}else{
									inspect_points.push(inspect_res.p1);
								}
							}else{
								inspect_points.push(inspect_res.p0);
								inspect_points.push(inspect_res.p1);
							}
							
						}
					}
				}
			}
		}

		if(this.DEBUG){
			for(var i=0;i<10;i++){
				this.map.removeMarker("Beacon-inspect"+i);
			}
		}
		
		var preLoc = this.currentPosition;
		var pos;
		var t0 = 0;
		var t1 = 0;
		if(inspect_points && inspect_points.length>0){
			var cacu_inspects = 0;
			var sum_x = 0;
			var sum_y = 0;
			for(var i=0; i<inspect_points.length; i++){
				if(this.DEBUG){
					this.map.addMarker("Beacon-inspect"+i, beacons[0].floor, inspect_points[i], this.createInspectNode(i+1));
				}
				sum_x+=inspect_points[i].x;
				sum_y+=inspect_points[i].y;
				cacu_inspects++;
				//cc.log(JSON.stringify({x:inspect_points[i].x,y:inspect_points[i].y}));
			}
			if(beacons[0].dis>0 && beacons[0].dis<3){
				t0 = sum_x/cacu_inspects;
				t1 = sum_y/cacu_inspects;
				temp = Math.sqrt((beacons[0].x - t0)*(beacons[0].x - t0) + (beacons[0].y - t1)*(beacons[0].y - t1));
				if(preLoc && preLoc.x>0 && preLoc.y > 0){
					t0 = ((t0 - beacons[0].x)*beacons[0].dis/temp + beacons[0].x + preLoc.x) / 2;
					t1 = ((t1 - beacons[0].y)*beacons[0].dis/temp + beacons[0].y + preLoc.y) / 2;
				}else
				{
					t0 = (t0 - beacons[0].x)*beacons[0].dis/temp + beacons[0].x;
					t1 = (t1 - beacons[0].y)*beacons[0].dis/temp + beacons[0].y;
				}
			}else if(beacons[0].dis>0 && beacons[0].dis<4){
				t0 = sum_x/cacu_inspects;
				t1 = sum_y/cacu_inspects;
				temp = Math.sqrt((beacons[0].x - t0)*(beacons[0].x - t0) + (beacons[0].y - t1)*(beacons[0].y - t1));
				if(preLoc && preLoc.x>0 && preLoc.y > 0){
					t0 = ((t0 - beacons[0].x)*beacons[0].dis/temp + beacons[0].x + t0 + preLoc.x) / 3;
					t1 = ((t1 - beacons[0].y)*beacons[0].dis/temp + beacons[0].y + t1 + preLoc.y) / 3;
				}else
				{
					t0 = ((t0 - beacons[0].x)*beacons[0].dis/temp + beacons[0].x + t0) / 2;
					t1 = ((t1 - beacons[0].y)*beacons[0].dis/temp + beacons[0].y + t1) / 2;
				}
			}else{
					if(preLoc && preLoc.x>0 && preLoc.y > 0){
						t0 = (sum_x+preLoc.x)/(cacu_inspects+1);
						t1 = (sum_y+preLoc.y)/(cacu_inspects+1);
					}else{
						t0 = sum_x/cacu_inspects;
						t1 = sum_y/cacu_inspects;
					}
			}
		}else if(preLoc && preLoc.x>0 && preLoc.y > 0){
			t0 = (preLoc.x+beacons[0].x)/2;
			t1 = (preLoc.y+beacons[0].y)/2;
		}else{
			t0 = beacons[0].x;
			t1 = beacons[0].y;
		}
		var pos = cc.p(t0,t1)
		return pos;
	},
	calculatePosition_pro : function(beacons){
        if(this.DEBUG){
        for(var i=0;i<10;i++){
        this.map.removeMarker("Beacon-inspect"+i);
        }
        }
        var inspect_points = [];
		var mPreLocX = -100; var mPreLocY = -100;
		var preLocX = mPreLocX; var preLocY = mPreLocY
		var mPreLocTempX = -100; var mPreLocTempY = -100;
		var mGotLocation = false;
		var mPreLocTime = 0
		if(this.currentPosition && this.currentPosition.x){
			preLocX = this.currentPosition.x;
		}
		if(this.currentPosition && this.currentPosition.y){
			preLocY = this.currentPosition.y;
		}
		if (0 > preLocX) {
			preLocX = 0;
		}
		if (0 > preLocY) {
			preLocY = 0;
		}
		var ZERO = 0.00001;
		var restriction_round = -1;
		var temp = 0; //信号半径
		var t0 = 0; var t1 = 0; var t2 = 0; var t3 = 0;
		var jbPos;
		var rx0 = 0; var ry0 = 0; var rr0 = -1.0;
		var rx1 = 0; var ry1 = 0; var rr1 = 0;
		var rx2 = 0; var ry2 = 0; var rr2 = 0;
		var rx3 = 0; var ry3 = 0; var rr3 = 0;

		var tx0 = 0; var tx1 = 0; var tx2 = 0;
		var ty0 = 0; var ty1 = 0; var ty2 = 0;
		
		var got0 = false; var got1 = false; var got2 = false;
		var gotLoc = false; var restrict_fail = false;

		var RESTRICTION_TRY = this.INSPECTS_REPEAT_TIMES;
		while (RESTRICTION_TRY > restriction_round && !gotLoc) {
			var got0 = false; var got1 = false; var got2 = false;
			restriction_round++;
			for(var i=0; i<beacons.length; i++){
					temp = BeaconService.calculateAccuracy(beacons[i].avgRssi,BeaconService.txPower,BeaconService.restrict + restriction_round);
					if (i == 0) {
						rx0 = beacons[i].x;
						ry0 = beacons[i].y;
						rr0 = temp;
					}
					if (i == 1) {
						rx1 = beacons[i].x;
						ry1 = beacons[i].y;
						rr1 = temp;
					}
					if (i == 2) {
						rx2 = beacons[i].x;
						ry2 = beacons[i].y;
						rr2 = temp;
					}
					if (i == 3) {
						rx3 = beacons[i].x;
						ry3 = beacons[i].y;
						rr3 = temp;
					}
			}
			if (ZERO > rr0 || ZERO > rr1 || ZERO > rr2) {
				break;
			}

			if ((15 < rr1 || 20 < rr2) && !restrict_fail) {   //控制第2个和第3个园的半径
				restrict_fail = true;
				restriction_round = -1;
				return null;//返回上层调用函数
			}

			var intersec = CalcCircle.calcCircleInsect(rx0, ry0, rr0, rx1, ry1,rr1);
			if (intersec) {
				got0 = true;
				if (1 == intersec.count) {
					tx0 = intersec.p0.x;
					ty0 = intersec.p0.y;
				} else if (2 == intersec.count) {
					if (((intersec.p1.x - rx2) * (intersec.p1.x - rx2) + (intersec.p1.y - ry2)
							* (intersec.p1.y - ry2)) > ((intersec.p0.x - rx2)
									* (intersec.p0.x - rx2) + (intersec.p0.y - ry2)
									* (intersec.p0.y - ry2))) {
						tx0 = intersec.p0.x;
						ty0 = intersec.p0.y;
					} else {
						tx0 = intersec.p1.x;
						ty0 = intersec.p1.y;
					}
				}
			}
			var intersec = CalcCircle.calcCircleInsect(rx0, ry0, rr0, rx2, ry2, rr2);
			if (intersec) {
				got1 = true;
				if (1 == intersec.count) {
					tx1 = intersec.p0.x;
					ty1 = intersec.p0.y;
				} else if (2 == intersec.count) {
					if (((intersec.p1.x - rx1) * (intersec.p1.x - rx1) + (intersec.p1.y - ry1)
							* (intersec.p1.y - ry1)) > ((intersec.p0.x - rx1)
									* (intersec.p0.x - rx1) + (intersec.p0.y - ry1)
									* (intersec.p0.y - ry1))) {
						tx1 = intersec.p0.x;
						ty1 = intersec.p0.y;
					} else {
						tx1 =  intersec.p1.x;
						ty1 =  intersec.p1.y;
					}
				}
			}
			var intersec = CalcCircle.calcCircleInsect(rx1, ry1, rr1, rx2, ry2, rr2);
			if (intersec) {
				got2 = true;
				if (1 == intersec.count) {
					tx2 = intersec.p0.x;
					ty2 =  intersec.p0.y;
				} else if (2 == intersec.count) {
					if (((intersec.p1.x - rx0) * (intersec.p1.x - rx0) + (intersec.p1.y - ry0)
							* (intersec.p1.y - ry0)) > ((intersec.p0.x - rx0)
									* (intersec.p0.x - rx0) + (intersec.p0.y - ry0)
									* (intersec.p0.y - ry0))) {
						tx2 = intersec.p0.x;
						ty2 =  intersec.p0.y;
					} else {
						tx2 =  intersec.p1.x;
						ty2 =  intersec.p1.y;
					}
				}
			}

			if (got0 && got1 && got2) {
                inspect_points.push(cc.p(tx0,ty0));inspect_points.push(cc.p(tx1,ty1));inspect_points.push(cc.p(tx2,ty2));
				if (((tx0 - rx2) * (tx0 - rx2) + (ty0 - ry2) * (ty0 - ry2) <= rr2 * rr2)
						&& ((tx1 - rx1) * (tx1 - rx1) + (ty1 - ry1) * (ty1 - ry1) <= rr1 * rr1)
						&& ((tx2 - rx0) * (tx2 - rx0) + (ty2 - ry0) * (ty2 - ry0) <= rr0 * rr0)) {
					gotLoc = true;
					if (ZERO < rr0 && 3 > rr0) {
						t0 = (tx0 + tx1 + tx2) / 3;
						t1 = (ty0 + ty1 + ty2) / 3;
						temp = Math.sqrt((rx0 - t0) * (rx0 - t0)
								+ (ry0 - t1) * (ry0 - t1));
						if (preLocX > 0 && preLocY > 0) {
							t0 = ((t0 - rx0) * rr0 / temp + rx0 + preLocX) / 2;
							t1 = ((t1 - ry0) * rr0 / temp + ry0 + preLocY) / 2;
						} else {
							t0 = (t0 - rx0) * rr0 / temp + rx0;
							t1 = (t1 - ry0) * rr0 / temp + ry0;
						}
					} else if (ZERO < rr0 && 4 > rr0) {
						t0 = (tx0 + tx1 + tx2) / 3;
						t1 = (ty0 + ty1 + ty2) / 3;
						temp = Math.sqrt((rx0 - t0) * (rx0 - t0)
								+ (ry0 - t1) * (ry0 - t1));
						if (preLocX > 0 && preLocY > 0) {
							t0 = ((t0 - rx0) * rr0 / temp + rx0 + (tx0 + tx1 + tx2) / 3 + preLocX) / 3;
							t1 = ((t1 - ry0) * rr0 / temp + ry0 + (ty0 + ty1 + ty2) / 3 + preLocY) / 3;
						} else {
							t0 = ((t0 - rx0) * rr0 / temp + rx0 + (tx0 + tx1 + tx2) / 3) / 2;
							t1 = ((t1 - ry0) * rr0 / temp + ry0 + (ty0 + ty1 + ty2) / 3) / 2;
						}
					} else {
						if (preLocX > 0 && preLocY > 0) {
							t0 = (tx0 + tx1 + tx2 + preLocX) / 4;
							t1 = (ty0 + ty1 + ty2 + preLocY) / 4;
						} else {
							t0 = (tx0 + tx1 + tx2) / 3;
							t1 = (ty0 + ty1 + ty2) / 3;
						}
					}
				} else if (restrict_fail) {
					if (((tx0 - rx2) * (tx0 - rx2) + (ty0 - ry2) * (ty0 - ry2) <= rr2 * rr2)
							&& ((tx1 - rx1) * (tx1 - rx1) + (ty1 - ry1) * (ty1 - ry1) <= rr1
									* rr1)) {
						gotLoc = true;
						if (preLocX > 0 && preLocY > 0) {
							t0 = (tx0 + tx1 + preLocX) / 3;
							t1 = (ty0 + ty1 + preLocY) / 3;
						} else {
							t0 = (tx0 + tx1) / 2;
							t1 = (ty0 + ty1) / 2;
						}
					} else if (((tx0 - rx2) * (tx0 - rx2) + (ty0 - ry2) * (ty0 - ry2) <= rr2
							* rr2)
							&& ((tx2 - rx0) * (tx2 - rx0) + (ty2 - ry0) * (ty2 - ry0) <= rr0
									* rr0)) {
						gotLoc = true;
						if (preLocX > 0 && preLocY > 0) {
							t0 = (tx0 + tx2 + preLocX) / 3;
							t1 = (ty0 + ty2 + preLocY) / 3;
						} else {
							t0 = (tx0 + tx2) / 2;
							t1 = (ty0 + ty2) / 2;
						}
					} else if (((tx1 - rx1) * (tx1 - rx1) + (ty1 - ry1) * (ty1 - ry1) <= rr1
							* rr1)
							&& ((tx2 - rx0) * (tx2 - rx0) + (ty2 - ry0) * (ty2 - ry0) <= rr0
									* rr0)) {
						gotLoc = true;
						if (preLocX > 0 && preLocY > 0) {
							t0 = (tx2 + tx1 + preLocX) / 3;
							t1 = (ty2 + ty1 + preLocY) / 3;
						} else {
							t0 = (tx2 + tx1) / 2;
							t1 = (ty2 + ty1) / 2;
						}
					} else if ((tx0 - rx2) * (tx0 - rx2) + (ty0 - ry2) * (ty0 - ry2) <= rr2
							* rr2) {
						gotLoc = true;
						if (preLocX > 0 && preLocY > 0) {
							t0 = (tx0 + preLocX) / 2;
							t1 = (ty0 + preLocY) / 2;
						} else {
							t0 = tx0;
							t1 = ty0;
						}
					} else if ((tx1 - rx1) * (tx1 - rx1) + (ty1 - ry1) * (ty1 - ry1) <= rr1
							* rr1) {
						gotLoc = true;
						if (preLocX > 0 && preLocY > 0) {
							t0 = (tx1 + preLocX) / 2;
							t1 = (ty1 + preLocY) / 2;
						} else {
							t0 = tx1;
							t1 = ty1;
						}
					} else if ((tx2 - rx0) * (tx2 - rx0) + (ty2 - ry0) * (ty2 - ry0) <= rr0
							* rr0) {
						gotLoc = true;
						if (preLocX > 0 && preLocY > 0) {
							t0 = (tx2 + preLocX) / 2;
							t1 = (ty2 + preLocY) / 2;
						} else {
							t0 = tx2;
							t1 = ty2;
						}
					}
				}
			} else if (ZERO < rr0 && 3 > rr0) {
				gotLoc = true;
				temp =   Math.sqrt((rx0 - preLocX) * (rx0 - preLocX)
						+ (ry0 - preLocY) * (ry0 - preLocY));
				if (preLocX > 0 && preLocY > 0) {
					t0 = ((preLocX - rx0) * rr0 / temp + rx0 + preLocX) / 2;
					t1 = ((preLocY - ry0) * rr0 / temp + ry0 + preLocY) / 2;
				} else {
					t0 = (preLocX - rx0) * rr0 / temp + rx0;
					t1 = (preLocY - ry0) * rr0 / temp + ry0;
				}
			} else if (restrict_fail) {
				if (got0 && got1) {
					gotLoc = true;
					if (preLocX > 0 && preLocY > 0) {
						t0 = (tx0 + tx1 + preLocX) / 3;
						t1 = (ty0 + ty1 + preLocY) / 3;
					} else {
						t0 = (tx0 + tx1) / 2;
						t1 = (ty0 + ty1) / 2;
					}
				} else if (got0 && got2) {
					gotLoc = true;
					if (preLocX > 0 && preLocY > 0) {
						t0 = (tx0 + tx2 + preLocX) / 3;
						t1 = (ty0 + ty2 + preLocY) / 3;
					} else {
						t0 = (tx0 + tx2) / 2;
						t1 = (ty0 + ty2) / 2;
					}
				} else if (got1 && got2) {
					gotLoc = true;
					if (preLocX > 0 && preLocY > 0) {
						t0 = (tx1 + tx2 + preLocX) / 3;
						t1 = (ty1 + ty2 + preLocY) / 3;
					} else {
						t0 = (tx1 + tx2) / 2;
						t1 = (ty1 + ty2) / 2;
					}
				} else if (got0) {
					gotLoc = true;
					if (preLocX > 0 && preLocY > 0) {
						t0 = (tx0 + preLocX) / 2;
						t1 = (ty0 + preLocY) / 2;
					} else {
						t0 = tx0;
						t1 = ty0;
					}
				} else if (got1) {
					gotLoc = true;
					if (preLocX > 0 && preLocY > 0) {
						t0 = (tx1 + preLocX) / 2;
						t1 = (ty1 + preLocY) / 2;
					} else {
						t0 = tx1;
						t1 = ty1;
					}
				} else if (got2) {
					gotLoc = true;
					if (preLocX > 0 && preLocY > 0) {
						t0 = (tx2 + preLocX) / 2;
						t1 = (ty2 + preLocY) / 2;
					} else {
						t0 = tx2;
						t1 = ty2;
					}
				}
			}
		}

		if (!gotLoc) {
			if (ZERO < rr0 && 3 > rr0) {
				gotLoc = true;
				temp =   Math.sqrt((rx0 - preLocX) * (rx0 - preLocX)
						+ (ry0 - preLocY) * (ry0 - preLocY));
				if (preLocX > 0 && preLocY > 0) {
					t0 = ((preLocX - rx0) * rr0 / temp + rx0 + preLocX) / 2;
					t1 = ((preLocY - ry0) * rr0 / temp + ry0 + preLocY) / 2;
				} else {
					t0 = (preLocX - rx0) * rr0 / temp + rx0;
					t1 = (preLocY - ry0) * rr0 / temp + ry0;
				}
			}
		}

		if (mGotLocation && (0 > t0 || 0 > t1)) {
			gotLoc = false;
		}

		var now = Date.now();
		var timeDelta = now - mPreLocTime;
		if (gotLoc) {
			mGotLocation = true;
			t2 = t0;
			t3 = t1;
			var distTemp =  Math.sqrt((t2 - mPreLocTempX) * (t2 - mPreLocTempX)
					+ (t3 - mPreLocTempY) * (t3 - mPreLocTempY));
			if ((distTemp < 0.5 && timeDelta > 500)
					|| (distTemp < 1 && timeDelta > 1 * 1000)
					|| (distTemp < 2 && timeDelta > 2 * 1000)
					|| (distTemp < 3 && timeDelta > 3 * 1000)
					|| (distTemp < 4 && timeDelta > 4 * 1000)
					|| (distTemp < 5 && timeDelta > 5 * 1000)
					|| (distTemp < 6 && timeDelta > 6 * 1000)
					|| (distTemp < 7 && timeDelta > 7 * 1000)
					|| (distTemp < 8 && timeDelta > 8 * 1000)
					|| (distTemp < 9 && timeDelta > 9 * 1000)
					|| timeDelta > 10 * 1000) {
				mPreLocTime = now;
				preLocX = t0;
				preLocY = t1;
				mPreLocX = t2;
				mPreLocY = t3;
			}
			mPreLocTempX = t2;
			mPreLocTempY = t3;
		}
        if(this.DEBUG && inspect_points){
            for(var i=0; i<inspect_points.length; i++){
            this.map.addMarker("Beacon-inspect"+i, beacons[0].floor, inspect_points[i], this.createInspectNode(i+1));
            }
        }
		if (mGotLocation) {
			return cc.p(preLocX,preLocY);
		}else{
			return this.currentPosition;
		}
		
	},
	createBeaconNode : function(id){
		var pnode = new cc.Node();
		
		var node = new cc.DrawNode();
		node.drawDot(cc.p(0,0), AppContext.baseWidth/30, cc.color(0, 0, 255, 150));
		pnode.addChild(node);
		
		var label = new cc.LabelTTF(id, "Arial BOLD", AppContext.baseWidth/40);
		label.setFontFillColor(cc.color(255,255,255));
		pnode.addChild(label);
		
		return pnode;
	},
    createInspectNode : function(id){
    var pnode = new cc.Node();
    
    var node = new cc.DrawNode();
    node.drawDot(cc.p(0,0), AppContext.baseWidth/90, cc.color(255, 0, 0, 150));
    pnode.addChild(node);
    
    var label = new cc.LabelTTF(id, "Arial BOLD", AppContext.baseWidth/40);
    label.setFontFillColor(cc.color(255,255,255));
    pnode.addChild(label);
    
    return pnode;
    },
	getDirection : function(){
		return AppContext.nativeGetDirection();
	},
	
	createPositionNode : function(){
		var sp = new cc.Sprite(res.icon_position);
		sp.anchorX = 0.5;
		sp.anchorY = 0.25;
		sp.scale = AppContext.baseWidth * 0.10 / sp.height;
		return sp;
	},
	
	startTracePosition : function(map){
		//先停止跟踪
		this.stopTracePosition();
		
		this.map = map;
		MU.schedule(this.updateCurrentPosition, this, this.UPDATE_TIME);
		MU.schedule(this.showPositionAndDirection, this, 0.05);
		this.isTracing = true;
		
		this.startReceiveBeacons();
	},
	
	stopTracePosition : function(){
		if(this.isTracing){
			MU.unschedule(this.showPosition, this);
			MU.unschedule(this.showPositionAndDirection, this);
			if(this.map != null){
				this.map.removeMarker(this.POSITION_TAG);
			}
			this.positionMarker = null;
			this.isTracing = false;
		}
	},
	
	updateCurrentPosition : function(){
		var p = this.getCoordinate();
		
		if(this.isTracing && p){
			if(this.positionMarker==null){
				this.positionMarker = this.map.addMarker(this.POSITION_TAG, p.floor, p, this.createPositionNode(), 0);
			}
		}else if(this.map){
			this.map.removeMarker(this.POSITION_TAG);
			this.positionMarker = null;
		}
	},
	
	showPositionAndDirection : function(){
		
		if(this.map!=null && this.positionMarker!=null){
			//修改方向
			var dr = this.getDirection();
			this.positionMarker.node.rotation = (dr - this.map.direction + this.map.viewRotation + 180)%360 - 180;
			
			var p = this.currentPosition;
			var lastP = cc.p(this.positionMarker.centerX, this.positionMarker.centerY);
			
			if(p!=null){
				var dis = cc.pDistance(p, lastP);
				var newP = null;
				var cRate = 0.1;
				
				if(dis>6 || dis<0.1){
					newP = p;
				}else{
					var dx = (p.x - this.positionMarker.centerX);
					var dy = (p.y - this.positionMarker.centerY);
					newP = cc.p(lastP.x + dx * cRate, lastP.y + dy * cRate);
				}
				
				this.positionMarker.moveTo(newP.x, newP.y,  p.floor);
			}
			
		}
		
	},
	
	startReceiveBeacons : function(){
//		cc.log("startReceiveBeacons");
//		MU.log("receive beacon start ");
		var beacon = AppContext.nativeGetBeaconInfo();
		if(beacon!=null && beacon.rssi){
//			MU.logObj(beacon);
//			MU.log("receive beacon : " + beacon.queueSize);
//			beacon = AppContext.nativeGetBeaconInfo();
			BeaconService.addBeaconRssi(beacon);
		}
		
		if(this.isTracing){
			MU.scheduleOnce(this.startReceiveBeacons, this);
		}
		
	},
	
	calculatePositionByBeacons : function(beacons){

		if(beacons.length==0){
			return null;
		}

		if(beacons.length==1){
			return beacons[0];
		}

		if(beacons.length==2){
			return cc.pMidpoint(beacons[0], beacons[1]);
		}

		var totalDIs = 10;
		var ps = beacons;
		while (totalDIs>1){
//			cc.log("totalDIs : " + totalDIs);
			for(var i=0, totalDIs = 0; i<ps.length; i++){
				totalDIs += ps[i].dis;
			}
			
			ps = this.populatePointsByDis(ps, totalDIs, true);
			
		}

		var x = 0;
		var y = 0;
		
		for(var i=0; i<ps.length; i++){
			x += ps[i].x;
			y += ps[i].y;
		}
		
		x = x / ps.length;
		y = y / ps.length;

		return cc.p(x,y);
	},
	
	populatePointsByDis : function(points, totalDis, repeat){
		var nps = [];
		
		for(var i=0; i<points.length; i++){
			var j = i + 1;
			if(j>=points.length){
				j = 0;
			}
			nps.push(this.midPointByDis(points[i], points[j], totalDis));
		}
		
		if(repeat){
			return this.populatePointsByDis(nps, totalDis / 2, false);
		}else{
			return nps;
		}
	},

	midPointByDis : function(p1, p2, totalDis){
		var x, y, disRate;

		disRate = p1.dis / (p1.dis + p2.dis);
		x = p1.x + (p2.x - p1.x) * disRate;
		y = p1.y + (p2.y - p1.y) * disRate;

		var p = cc.p(x,y);
//		p.dis = (p1.dis + p2.dis);
		p.dis = (p1.dis + p2.dis) * (p1.dis + p2.dis) / (totalDis * totalDis);
//		p.dis = (p1.dis * p1.dis + p2.dis * p2.dis) / (totalDis * totalDis);
//		p.dis = Math.sqrt(p1.dis) + Math.sqrt(p2.dis);
//		p.dis = Math.sqrt(Math.pow(p1.dis, 2) + Math.pow(p2.dis, 2));
//		if(p.dis>1){
//			p.dis = Math.sqrt(p.dis);
//		}else{
//			p.dis = p.dis * p.dis;
//		}
		
		
//		MU.logObj({msg : "midPoint", x :x, y: y});
//		cc.log("midPointByDis.." + p1.dis + ", " + p2.dis + ", " + p.dis);
		return p;
	}
	
}, new cc.Class());





