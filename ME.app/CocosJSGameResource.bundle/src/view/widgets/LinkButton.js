
var LinkButton = ccui.Widget.extend({
	
	_text : null,
	
	ctor : function(text, fontSize, onclick, target){
		
		this._super();
		
		this._text = new ccui.Text(text, AppStyles.font_normal, fontSize);
		this._text.setColor(cc.hexToColor(AppStyles.font_link_color));
		
		this.addChild(this._text);
		this.setTouchEnabled(true);
		this.addTouchEventListener(function (sender, type) {
			switch (type) {
				case ccui.Widget.TOUCH_BEGAN:
					break;
				case ccui.Widget.TOUCH_MOVED:
					break;
				case ccui.Widget.TOUCH_ENDED:
					onclick.call(target);
					break;
				case ccui.Widget.TOUCH_CANCELED:
					break;

				default:
					break;
			}
		}, target);
		
		this.setContentSize(this._text.getCustomSize());
		this._text.x = this._text.width/2;
		this._text.y = this._text.height/2;
	}
	
	
});