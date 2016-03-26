var CustomEventManager = {
	
	_eventListeners : {},
				
	/** 
	 * @eventName  字符串
	 * @listener 复合对象 {callback : function,  target : object , priority : number}
	 */
	addEventListener : function(eventName,  listener){
		if(!eventName){
			return false;
		}
		
		var listeners = this._eventListeners[eventName];
		
		if(!listeners){
			listeners = [];
			this._eventListeners[eventName] = listeners;
		}
		
		listener.priority = listener.priority || 0;
		listeners.push(listener);
		listeners.sort(function(a, b){
			return a.priority - b.priority;
		});
	},
	
	dispatchEvent : function(eventName, eventData, target){
		if(!eventName){
			return false;
		}
		
		var listeners = this._eventListeners[eventName];
		if(!listeners){
			return false;
		}
		
		var event = {target : target, eventName : eventName, eventData : eventData };
		
		for(var i=0; i<listeners.length; i++){
			var lsn = listeners[i];
			if(target ){
				if(lsn.target==target && lsn.callback){
					lsn.callback.call(target, event);
				}
			}else{
				if( lsn.callback){
					lsn.callback.call(this, event);
				}
			}
		}
	},
	
	removeListenerByTarget : function(eventName, target){
		if(!eventName){
			return false;
		}

		var listeners = this._eventListeners[eventName];
		if(!listeners){
			return false;
		}
		
		var newLsns = [];
		for(var i=0; i<listeners.length; i++){
			var lsn = listeners[i];
			if(lsn.target == target){
				//remove
			}else{
				newLsns.push(lsn);
			}
		}
		
		this._eventListeners[eventName] = newLsns;
		listeners = null;
	},
	
	removeAllListenerByEventName : function(eventName){
		if(!eventName){
			return false;
		}
		
		if(this._eventListeners[eventName]){
			delete this._eventListeners[eventName];
		}
	}
				
};