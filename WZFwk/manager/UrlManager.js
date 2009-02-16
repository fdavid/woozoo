/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com | http://woozoo-project.org
   
Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 *
 * */
var UrlManager = Class.create(EventDispatcher, {

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 * Constructor
	 * */
	initialize: function() {
		this._isFirst = true; 
		this._isUsable = false;

	},
	
	/*************************************************/
	/**					PUBLIC						**/
	/*************************************************/

	getIsUsable: function() {
		return this._isUsable;
	},

	preinit: function() {
		this._isUsable = true;
	},

	/**
	 *
	 * */
	init: function() {
	
			
		FwkTrace.writeMessage('MC_007'); //'UrlManager::init');
		var confManager = ConfManager.getInstance();
		
		// FROM http://code.google.com/p/reallysimplehistory/wiki/UsageInstructions
		window.dhtmlHistory.create({
			toJSON: function(o) {
		    	return Object.toJSON(o);
		    },
		        
		    fromJSON: function(s) {
		    	return s.evalJSON();
			},
			
			url: confManager.get('baseUrl')+'WZFwk_multiton/libs/rsh/',
			debugMode: confManager.get('debugUrl')
		});
	
    	dhtmlHistory.initialize();
      	dhtmlHistory.addListener(this._urlChangeHandler.bind(this));
      	
      	// if there is no anchor, then the first handler execution doesn't come from init
      	if (this.getCurrentLocation() == "") {
      		this._isFirst = false;
      	} else {
      		//alert('URlManager : '+this.getCurrentLocation());
	      	// should not be here but i probably break something when changing the rsh code	
	      	// ie : RSH should take care of that
	      	// I use defer so i don't get a stack error on IE7
      		this._urlChangeHandler.bindAsEventListener(this).defer(this.getCurrentLocation(), this.getCurrentStorage(), UrlManager.FROM_INIT);
      	}
	},

	/**
	 *
	 * */
	setUrl: function(newLocation, historyData) {
		if (!this._isUsable) {
			FwkTrace.writeWarning('MC_001');//"UrlManager::setUrl :: UrlManager is not usable");
			return false;
		}
		if (this.getCurrentLocation() == newLocation) {
			FwkTrace.writeWarning('MC_002', newLocation);//"UrlManager::setUrl :: the new location "+newLocation+" is the same as the last one, doesn't set it");
			return false;
		}
		FwkTrace.writeMessage('MC_003', newLocation);//'UrlManager::setUrl :: set the new URL '+newLocation);
		dhtmlHistory.add(newLocation, historyData);
		this._urlChangeHandler(newLocation, historyData, UrlManager.FROM_FRAMEWORK);
		return true;
	},

	/**
	 *
	 * */
	getCurrentLocation: function() {
		if (!this._isUsable) {
			FwkTrace.writeWarning('MC_004');//"UrlManager::getCurrentLocation :: UrlManager is not usable");
			return false;
		}
		return dhtmlHistory.getCurrentLocation();
	},
	/**
	 *
	 * */
	getCurrentStorage: function() {
		if (!this._isUsable) {
			FwkTrace.writeWarning('MC_006');//"UrlManager::getCurrentStorage :: UrlManager is not usable");
			return false;
		}	
		return historyStorage.get(this.getCurrentLocation());
	},

	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/

	/**
	 *
	 * */
	_urlChangeHandler: function(newLocation, historyData, from) {
		if (from == undefined) { 
			if (this._isFirst) {
				this._isFirst = false;
				from = UrlManager.FROM_INIT;
			} else {
				from = UrlManager.FROM_USER;
			}
		}
		FwkTrace.writeMessage('MC_005', newLocation, from);//'UrlManager::_urlChangeHandler :: Location:'+newLocation+', From:'+from);
		
		this.dispatchEvent(Event.CHANGE, {location: newLocation, data: historyData, from: from});
	}
});

/**
 * Static property
 * */
Object.extend(UrlManager, {
	FROM_USER : 		'fromUser',
	FROM_FRAMEWORK : 	'fromFramework',
	FROM_INIT : 		'fromInit'
});

/**
 * Singleton
 * */
SingletonUtil.execute(UrlManager);