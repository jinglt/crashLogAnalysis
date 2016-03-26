var ImgView = ccui.Widget.extend({
	_width : 0,
	_height : 0,
	url : null,
	sprite : null,
	failImg : null,
	
	ctor : function(width, height, url, failImg){
		this._super();
		
		this._width = MU.isNull(width, 0);
		this._height = MU.isNull(height, 0);
		this.url = url;
		this.failImg = failImg;
		
		var img = url || failImg;
		if(img){
			// 判断URL地址的正则表达式为:http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?
			// 下面的代码中应用了转义字符"\"输出一个字符"/"
			var expHttp = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
			if(expHttp.test(img)){
				this.loadRemote(img);
			}else{
				this.loadLocal(img);
			}
			
		}
	},
	
	loadLocal : function(url){
		this.url = url;
		cc.log("imgview  loadLocal : " + url);
		var sprite = new cc.Sprite(url);
		this.addSprite(sprite);
	},
	
	loadRemote : function(url){
		cc.log("imgview  loadRemote : " + url);
		this.url = url;
		var img = this;
		try{
			
			var fileName = cc.path.basename(url);
			var imgPath = AppContext.DATA_PATH + "/imgview/";
			var callId = AppContext.nativeStartDownload(url, imgPath, fileName, function(evt){
				
				if(evt.downloadState==AppConsts.DownloadTaskState.FINISH){
					AppContext.removeCallback(callId);
					
					var sprite = new cc.Sprite(evt.savedFile);
					img.addSprite(sprite);
				}else if(evt.downloadState==AppConsts.DownloadTaskState.ERROR){
					AppContext.removeCallback(callId);
					
					var localCache = evt.savedFile;
					if( jsb.fileUtils.isFileExist(localCache)){
						cc.log("local Cache " + localCache);
						var sprite = new cc.Sprite(localCache);
						img.addSprite(sprite);
					}else if(img.failImg){
						cc.log("fail img " + img.failImg);
						var sprite = new cc.Sprite(img.failImg);
						img.addSprite(sprite);
					}
				}
				
			});
		}catch(ex){
			
		}

	},
	
	addSprite : function(sprite){
		if(this.sprite){
			this.sprite.removeFromParent(true);
			this.sprite = null;
		}
		
		if(sprite){
			
			this.addChild(sprite);
			this.sprite = sprite;
			
			if(this._width==0 && this._height==0){
// cc.log("w0h0");
				sprite.x = sprite.width/2;
				sprite.y = sprite.height/2;
				this.setContentSize(sprite.width, sprite.height);
			}else if(this._width>0 && this._height>0){
// cc.log("w1h1");
				sprite.x = this._width/2;
				sprite.y = this._height/2;
				sprite.scaleX = this._width / sprite.width;
				sprite.scaleY = this._height / sprite.height;
				this.setContentSize(this._width, this._height);
			}else if(this._width>0){
// cc.log("w1h0");
				sprite.scale = this._width / sprite.width;
				sprite.x = this._width/2;
				sprite.y = sprite.height * sprite.scale / 2;
				this.setContentSize(this._width, sprite.height * sprite.scale);
			}else{
// cc.log("w0h1");
				sprite.scale = this._height / sprite.height;
				sprite.y = this._height/2;
				sprite.x = sprite.width * sprite.scale / 2;
				this.setContentSize(sprite.width * sprite.scale, this._height);
			}
			
// MU.logObj({msg : "sprite size", value : sprite.getContentSize()});
// MU.logObj({msg : "imgView size", value : this.getContentSize()});
		}
	}
	
});