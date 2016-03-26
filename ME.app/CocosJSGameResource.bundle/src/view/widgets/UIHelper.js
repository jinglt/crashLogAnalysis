

var UIHelper = {
				
		createHSplit : function(width, height, color, size, margin){
			color = color || cc.hexToColor(AppStyles.split_color);
			size = size || AppContext.baseWidth/1000;
			margin = (margin==null ? AppContext.baseWidth/50 : margin);

			var widget = this.createMarginWidget(width, height);
			
			var drawNode = new cc.DrawNode();
			drawNode.drawSegment(cc.p(0,0), cc.p(width - margin * 2, 0 ), size, color);
			drawNode.x = margin;
			drawNode.y = height/2;
			widget.addChild(drawNode);
			return widget;
		},
		
		createVSplit : function(width, height, color, size, margin){
			color = color || cc.hexToColor(AppStyles.split_color);
			size = size || AppContext.baseWidth/1000;
			margin = (margin==null ? AppContext.baseWidth/50 : margin);

			var widget = this.createMarginWidget(width, height);

			var drawNode = new cc.DrawNode();
			drawNode.drawSegment(cc.p(0,0), cc.p( 0, height- margin * 2 ), size, color);
			drawNode.x = width/2;
			drawNode.y = margin;
			widget.addChild(drawNode);
			return widget;
		},
		
		createImage : function(width, height, imgUrl, margin){
			
			margin = (margin==null ? AppContext.baseWidth/60 : margin);
			
			var img = new cc.Sprite(imgUrl);
			img.scale = (width - margin * 2)/ img.width;
			img.x = width / 2;
			img.y = height / 2;
			
			var widget = this.createMarginWidget(width, height);
			widget.addChild(img);
			
			return widget;
		},
	
		addToRelativeLayout : function(widget, layout, relativeParam, margin, mgTop, mgRight, mgBottom){
			
			margin = margin || 0;
			mgTop = mgTop || margin;
			mgRight = mgRight || margin;
			mgBottom = mgBottom || mgTop;
			
			var lp = new ccui.RelativeLayoutParameter();
			lp.setAlign(relativeParam);
			lp.setMargin(new ccui.Margin(margin, mgTop, mgRight, mgBottom));
			widget.setLayoutParameter(lp);
			layout.addChild(widget);
		},
		
		addToLinearLayout : function(widget, layout, linearParam, margin, mgTop, mgRight, mgBottom){
			margin = margin || 0;
			mgTop = mgTop || margin;
			mgRight = mgRight || margin;
			mgBottom = mgBottom || mgTop;
			
			var lp = new ccui.LinearLayoutParameter();
			lp.setGravity(linearParam);
			lp.setMargin(new ccui.Margin(margin, mgTop, mgRight, mgBottom));
			widget.setLayoutParameter(lp);
			layout.addChild(widget);
		},
		
		createPanel : function(width, height, backImg){
			
			var layout = new ccui.Layout();
			if(backImg){
				layout.setBackGroundImage(backImg);
				layout.setBackGroundImageScale9Enabled(true);
			}
			layout.setContentSize(width, height);
			layout.setTouchEnabled(true);
			layout.setClippingEnabled(true);
			return layout;
		},
		
		createButtonEmpty : function(width, height, img1, img2){
			
			img1 = img1 || "";
			img2 = img2 || res.btn_pressed_nb_sm_9;
			
			var button = new ccui.Button();
			button.setTouchEnabled(true);
			button.setScale9Enabled(true);
			button.loadTextures(img1, img2);
			button.setContentSize(width, height);
			button.onTouched =  function(){
				
			};
			
			button.addTouchEventListener(function (sender, type) {
				switch (type) {
					case ccui.Widget.TOUCH_ENDED:
						if(this.onTouched){
							this.onTouched();
						}
						break;
				}
			}, button);
			
			return button;
		},
		
		createLabelWidget : function(text, fontSize, color, fontName, stokeWidth){
			
			color = color || cc.hexToColor(AppStyles.font_normal_color);
			fontName = fontName || AppStyles.font_normal;
			fontSize = fontSize || AppContext.baseWidth / 25;
			var label = new ccui.Text(text, fontName, fontSize);
			label.setColor(color);
			if(stokeWidth){
				label.enableOutline(color, cc.size(stokeWidth,stokeWidth));
			}
			
			return label;
		},
		
		createMarginWidget : function(width, height){
			var widget = new ccui.Widget();
			widget.setContentSize(width, height);
			return widget;
		},
		
		createMarkerNode : function(char, outline){
			var showWidth = AppContext.baseWidth / 12;
			var mnode = new cc.Sprite(res.icon_marker_blue);
			mnode.anchorX = 1 / 2;
			mnode.anchorY = 0;
			mnode.scale = showWidth / mnode.height;

			var text = new ccui.Text();
			text.setString(char);
			text.setFontName(AppStyles.font_normal);
			text.setFontSize(19);
			text.setColor(cc.hexToColor(AppStyles.font_marker_color));
			if(outline){
				text.enableOutline(cc.hexToColor(AppStyles.font_marker_color), outline);
			}
			text.anchorX = 1 / 2;
			text.anchorY = 1 / 2;
			text.x=mnode.width/2;
			text.y=mnode.height*0.6;
			mnode.addChild(text);

			return mnode;
		},
		
		createMarkerNodeRed : function(char){
			var showWidth = AppContext.baseWidth / 12;
			var mnode = new cc.Sprite(res.icon_marker_red);
			mnode.anchorX = 1 / 2;
			mnode.anchorY = 0;
			mnode.scale = showWidth / mnode.height;

			var text = new ccui.Text();
			text.setString(char);
			text.setFontName(AppStyles.font_normal);
			text.setFontSize(19);
			text.setColor(cc.hexToColor(AppStyles.font_marker_color));
//			text.enableOutline(cc.hexToColor(AppStyles.font_title_color));
			text.anchorX = 1 / 2;
			text.anchorY = 1 / 2;
			text.x=mnode.width/2;
			text.y=mnode.height*0.6;
			mnode.addChild(text);

			return mnode;
		},
		
		createIconNode : function(img, size){
			size = size || AppContext.baseWidth * 0.08;
			var icon = new cc.Sprite(img);
			icon.scale = size / icon.width;
			
			var wgt = new ccui.Widget();
			wgt.addChild(icon);
			
			return wgt;
		},
		
		createImgMarker : function(img, size, anchor){
			size = size || AppContext.baseWidth * 0.08;
			var mnode = new cc.Sprite(img);
			mnode.setAnchorPoint(anchor);
			mnode.scale = size / mnode.width;
			return mnode;
		},
		
		createListView : function(bgImg){
			var listView = new ccui.ListView();
			// set list view ex direction
			listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
			listView.setTouchEnabled(true);
			listView.setBounceEnabled(false);
			if(bgImg){
				listView.setBackGroundImage(bgImg);
				listView.setBackGroundImageScale9Enabled(true);
			}
			return listView;
		},
		
		createColoredPanel : function(color){
			color = color || cc.hexToColor(AppStyles.background_color);
			var layout = new ccui.Layout();
			layout.setBackGroundColor(color);
			layout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
			layout.setClippingEnabled(true);
			return layout;
		}
		
};