/**
 * @author 		Matthew Foster
 * @date		June 6th 2007
 * @purpose		To have a base class to extend subclasses from to inherit event dispatching functionality.
 * @procedure	Use a hash of event "types" that will contain an array of functions to execute.  The logic is if any function explicitally returns false the chain will halt execution.
 */
 var EventDispatcher = Class.create({
    initialize: function() {
    	this._listenerChain = [];
    },   
	_buildListenerChain : function(){
		if(!this._listenerChain)
			this._listenerChain = [];                                   
	},
	addEventListener : function(type, listener){
		if(!listener instanceof Function)
			throw { message : "Listener isn't a function" };
               
		this._buildListenerChain();
		
		if(!this._listenerChain[type])                      
			this._listenerChain[type] = [listener];
		else
			this._listenerChain[type].push(listener);
	},
	hasEventListener : function(type){
		return (typeof this._listenerChain[type] != undefined);
	},
	removeEventListener : function(type, listener){
		if(!this.hasEventListener(type))
			return false;
		for(var i = 0; i < this._listenerChain[type].length; i++)
			if(this._listenerChain[type][i] == listener) {
				this._listenerChain[type].splice(i, 1);
			}   
	},
	dispatchEvent : function(type, args){
		this._buildListenerChain();
              
		if(!this.hasEventListener(type))
			return false;
                   
		this._listenerChain[type].any(function(f){ return (f(args) == false ? true : false); });    
	}    
});
