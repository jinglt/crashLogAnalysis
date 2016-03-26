var UpdateManager = {

	mapManifestPath : "res/update/project_map.manifest",
	mapStoragePath : "map/",
	localVersionInfo : null,
	_updateTaskInfo : {taskCount : 0, taskMap : {}, onUpdateFinish : null},

	_updateMap : function(){

		var am = new jsb.AssetsManager(this.mapManifestPath, this.mapStoragePath);
		am.retain();

		if (!am.getLocalManifest().isLoaded()){
			MU.log("Fail to update assets, step skipped.");
		}
		else{
			var that = this;
			var listener = new jsb.EventListenerAssetsManager(am, function(event) {
				
				var msg = event.getMessage();
				if (msg) {
					MU.log("event msg :" + msg);
					Popup.showMsg(msg);
				}
				
				switch (event.getEventCode())
				{
					
					case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
						MU.log("No local manifest file found, skip assets update.");
						break;
					case jsb.EventAssetsManager.UPDATE_PROGRESSION:
						that._percent = event.getPercent();
						that._percentByFile = event.getPercentByFile();

						MU.log(that._percent + "%");
						break;
					case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
					case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
						MU.log("Fail to download manifest file, update skipped.");
						break;
					case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
					case jsb.EventAssetsManager.UPDATE_FINISHED:
						MU.log("Update finished. " + event.getMessage());
						cc.game.restart();
						break;
					case jsb.EventAssetsManager.UPDATE_FAILED:
						MU.log("Update failed. " + event.getMessage());

						__failCount ++;
						if (__failCount < 5)
						{
							am.downloadFailedAssets();
						}
						else
						{
							MU.log("Reach maximum fail count, exit update process");
							__failCount = 0;
						}
						break;
					case jsb.EventAssetsManager.ERROR_UPDATING:
						MU.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
						break;
					case jsb.EventAssetsManager.ERROR_DECOMPRESS:
						MU.log(event.getMessage());
						break;
					default:
						break;
				}
			});

			cc.eventManager.addListener(listener, 1);

			am.update();
			
			MU.log("开始更新");
		}

	},
	
	checkMapUpdate : function(onUpdateFinish){
		var url = SC.mapService+"/update/update.json";
		this._updateTaskInfo.onUpdateFinish = onUpdateFinish;

		var nowVersion = MapUtil.formatDate(new Date(), "yyyyMMddhh");
		
//		MU.log("nowVersion:" + nowVersion);
		var localVersion = this.getLocalMapVersion();
		MU.log("开始更新地图文件：" + url);
		AppContext.ajaxGet(url, function(err, resText){
			if(err){
//				Popup.showMsg("更新地图数据失败，请检查网络情况！");
			}else{
				
				var remoteVersion = JSON.parse(resText);
				if(remoteVersion){
					//有更新
					var newFiles = remoteVersion.filesMap;
					var oldFiles = localVersion.filesMap;
					
					for(var filePath in newFiles){
						var newFile = newFiles[filePath];
						var oldFile = oldFiles[filePath];
						
//						MU.log("oldVersion :" + oldFile.version + " nowVersion :" +nowVersion );
						if(oldFile && oldFile.version>nowVersion){
							oldFile.version=0;
						}
						
						if(oldFile==null || newFile.version>oldFile.version){
							MU.log("开始下载新版本地图数据：" + filePath);
							UpdateManager._updateTaskInfo.taskCount++;
							UpdateManager._downloadMapFile(filePath, newFile, localVersion);
						}else{
							MU.log("地图数据已经是最新版本：" + filePath);
						}
					}
				}
			}
		});

	},
	
	_downloadMapFile : function(filePath, newFile, localVersion){
		AppContext.downloadSimple(newFile.webUrl, cc.path.dirname(filePath), cc.path.basename(filePath), 
		function(downEvt){
			
			var oldFile = localVersion.filesMap[filePath];
			
			//更新成功
			if(oldFile==null){
				localVersion.filesMap[filePath] = newFile;
			}else{
				cc.extend(oldFile, newFile);
			}
			UpdateManager.saveLocalMapVersion(localVersion);
			UpdateManager._updateTaskInfo.taskCount--;
			if(UpdateManager._updateTaskInfo.taskCount==0 && UpdateManager._updateTaskInfo.onUpdateFinish!=null){
				var callback = UpdateManager._updateTaskInfo.onUpdateFinish;
				UpdateManager._updateTaskInfo.onUpdateFinish = null;
				callback();
			}
			MU.log("更新地图数据成功: " + filePath);
		}, function(downEvt){
			UpdateManager._updateTaskInfo.taskCount--;
			MU.log("更新地图数据出错: " + JSON.stringify(downEvt.error));
		});
	},
	
	getLocalMapVersion : function(){
		if(this.localVersionInfo==null){
			var jsonFile = "data/update_local.json";
			var str = AppContext.nativeReadFileOnSdcard(jsonFile);
//			MU.log("本地版本：" + str);
			this.localVersionInfo = JSON.parse(str);
		}
		
		return this.localVersionInfo;
	},

	saveLocalMapVersion : function(mapVersionJson){
		mapVersionJson = mapVersionJson || this.localVersionInfo;
		
		var jsonFile = "data/update_local.json";
		var str = JSON.stringify(mapVersionJson);
//		MU.log("更新版本：" + str);
		return AppContext.nativeWriteFileOnSdcard(jsonFile, str);
	}

}