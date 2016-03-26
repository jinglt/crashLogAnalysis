var ScrollButton = ccui.Layout.extend({
	
	scrollView : null,
	_selectItem : null,
	_posDirty : false,
	
	ctor : function(width, height){
		this._super();
		this.setContentSize(width, height);
		this.setLayoutType(ccui.Layout.RELATIVE);
		
		this.scrollView = new ccui.ScrollView();
		this.scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
		this.scrollView.setContentSize(width, height);
		this.scrollView.setTouchEnabled(true);
		this.scrollView.setInnerContainerSize(cc.size(width, height));
		
		UIHelper.addToRelativeLayout(this.scrollView, this, ccui.RelativeLayoutParameter.CENTER_IN_PARENT);
		this.scrollView.addEventListener(this._scrollViewEventListner, this);
		this.scrollView.addTouchEventListener(this._scrollViewTouchEventListner, this);
	},
	
	_scrollViewTouchEventListner : function(sender, type){
		if(type==ccui.Widget.TOUCH_ENDED || type==ccui.Widget.TOUCH_CANCELED){
			if(!this._posDirty){
				this._posDirty = true;
			}
		}
		
	},
	
	_scrollViewEventListner : function(sender, type){
		if(type==ccui.ScrollView.EVENT_SCROLLING){
			if(this._posDirty){
				this.requestItemAlignment();
			}
		}
	},
	
	requestItemAlignment : function(){
		this.unschedule(this._updateItemAlignment);
		this.scheduleOnce(this._updateItemAlignment);
	},
	
	_updateItemAlignment : function(){
//		cc.log("_updateItemAlignment");
		this._posDirty = false;
		
		var alignY = this.height/2 - this.scrollView.getInnerContainer().y;
		var items = [].concat(this.scrollView.getChildren());
		
		if(items.length>0){
			items.sort(function(a, b){
				return Math.abs(a.y-alignY) - Math.abs(b.y-alignY);
			});
			
			this.setSelectedItem(items[0]);
		}
	},
	
	setSelectedItem : function(item){
		var iHeight = this.scrollView.getInnerContainerSize().height;
		var toY = iHeight - item.y - this.scrollView.height/2;
		var yPct = toY/(iHeight-this.scrollView.height)*100;
		
		if( isNaN(yPct) || !isFinite(yPct)){
//			cc.log("isFinite " + yPct);
			yPct = 0;
		}
//		cc.log("setSelectedItem : " + iHeight + ", " + toY + ", " + yPct);
		this.scrollView.scrollToPercentVertical(yPct, 0.5, true);
		this._selectItem = item;
		this.onSelectChange(item);
	},
	
	getSelectedItem : function(){
		return this._selectItem;
	},
	
	onSelectChange: function(item){
		
	},
	
	addItem : function(item){
		this.scrollView.addChild(item);
		this.requestLayoutItems();
	},
	
	requestLayoutItems : function(){
		this.unschedule(this._layoutItems);
		this.scheduleOnce(this._layoutItems);
	},
	
	_layoutItems : function(){
		
//		cc.log("_layoutItems");
		var mySize = this.getContentSize();
		
		var tHeight = mySize.height;
		var items = this.scrollView.getChildren();
		items = items.reverse();
		var posY = tHeight/2;
		var posX = mySize.width/2;
		
		for(var i=0; i<items.length; i++){
			
			var item = items[i];
			item.anchorX = 0.5;
			item.anchorY = 0.5;
			item.x = posX;
			item.y = posY;
			item._scrollIndex = items.length - 1 - i;
			posY += item.height;
			if(i>0){
				tHeight += item.height;
			}
			
		}
		
		var scSize = cc.size(mySize.width, tHeight);
		this.scrollView.setInnerContainerSize(cc.size(mySize.width, tHeight));
		
//		cc.log("setInnerContainerSize " + JSON.stringify(scSize));
		
		var idx = this.getSelectedItemIndex();
		if(idx<0){
			idx=0;
		}
		this.setSelectIedtemIndex(idx);
	},
	
	getSelectedItemIndex : function(){
		if(this._selectItem){
			return this._selectItem._scrollIndex;
		}
		return -1;
	},
	
	setSelectIedtemIndex : function(idx){
		var items = this.scrollView.getChildren();
		if(items[idx]){
			this.setSelectedItem(items[idx]);
		}
	}
	
});
