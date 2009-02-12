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

var Initializer = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this._isDomReady = false;
		this._initializing = false;
		this._listeners = $H({});
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	init: function(confFile, confOptions, applicationOptions) {
		if (this._initializing == false) {
			//console.profile('WZFramework');
			console.time('WZFramework');
			if (arguments.length > 3) {
				alert("Initializer::init : you specify more than 3 params");
			}	
			this._initializing = true;
			this._initListeners();
			this._initConf(confFile, confOptions, applicationOptions);
			
		} 
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	/**
	 *
	 * */
	_initListeners: function() {
		// save the listener
		this._listeners.set('dom', 			this._domReady.bindContext(this));
		this._listeners.set('conf', 		this._confReadyHandler.bindContext(this));
		this._listeners.set('lang', 		this._langReadyHandler.bindContext(this));
		this._listeners.set('controller', 	this._controllerReadyHandler.bindContext(this));
		this._listeners.set('model', 		this._modelReadyHandler.bindContext(this));
		//== IF (NO_FWK_TRACE) ==//
		this._listeners.set('fwkTrace', 	this._fwkTraceReadyHandler.bindContext(this));
		//== ENDIF (NO_FWK_TRACE) ==//
		
		// observe
		document.observe('dom:loaded', 						this._listeners.get('dom'));
		document.observe(ConfManager.CONF_READY_EVENT, 		this._listeners.get('conf'));
		document.observe(LangManager.LANG_READY_EVENT, 		this._listeners.get('lang'));
		document.observe(Controller.CONTROLLER_READY_EVENT, this._listeners.get('controller'));
		document.observe(Model.MODEL_READY_EVENT, 			this._listeners.get('model'));
		//== IF (NO_FWK_TRACE) ==//
		document.observe(FwkTrace.FWK_TRACE_READY_EVENT, 	this._listeners.get('fwkTrace'));
		//== ENDIF (NO_FWK_TRACE) ==//
	},
	
	/**
	 *
	 * */
	_unregisterListeners: function() {
		// unregister
		document.stopObserving('dom:loaded', 						this._listeners.get('dom'));
		document.stopObserving(ConfManager.CONF_READY_EVENT, 		this._listeners.get('conf'));
		document.stopObserving(LangManager.LANG_READY_EVENT, 		this._listeners.get('lang'));
		document.stopObserving(Controller.CONTROLLER_READY_EVENT, 	this._listeners.get('controller'));
		document.stopObserving(Model.MODEL_READY_EVENT, 			this._listeners.get('model'));
		//== IF (NO_FWK_TRACE) ==//
		document.stopObserving(FwkTrace.FWK_TRACE_READY_EVENT, 		this._listeners.get('fwkTrace'));
		//== ENDIF (NO_FWK_TRACE) ==//
		
		// free memory
		this._listeners = $H({});
		delete this._listeners;
	},
	
	/**
	 *
	 * */
	_domReady: function() {
		Trace.time('WZFramework_DOMReady');
		this._isDomReady = true;
		document.fire('intializer:domReady');
	},
	
	/**
	 *
	 * */
	_initConf: function(confFile, confOptions, applicationOptions) {
		ConfManager.getInstance().init(confFile, confOptions, applicationOptions);
	},
	
	/**
	 *
	 * */
	_confReadyHandler: function() {
		var confManager = ConfManager.getInstance();
		//== IF (NO_FWK_TRACE) ==//
		if (confManager.get('debugFwk')) {
			FwkTrace.init();	
		} else 
		//== ENDIF (NO_FWK_TRACE) ==//
		if (confManager.get('useLang')) {
			this._initLang();
		} else {
			this._initController();
		}
		if (confManager.get('useUrl')) {
			UrlManager.getInstance().preinit();
		}
	},
	
	/**
	 * Cannot use FwkTrace before this method
	 * */
	 //== IF (NO_FWK_TRACE) ==//
	_fwkTraceReadyHandler: function() {
		FwkTrace.writeMessage('M1_001'); // Initializer::_fwkTraceReadyHandler : initializing configuration and fwkTrace complete
		if (ConfManager.getInstance().get('useLang')) {
			this._initLang();
		} else {
			this._initPluginManager();	
		}
	},
	//== ENDIF (NO_FWK_TRACE) ==//	
	
	/**
	 *
	 * */
	_initLang: function() {
		FwkTrace.writeMessage('M1_002'); // Initializer::_initLang : initializing langage
		LangManager.getInstance().init();
	},
	
	/**
	 *
	 * */
	_langReadyHandler: function() {
		FwkTrace.writeMessage('M1_003'); // Initializer::_langReadyHandler : initializing langage complete
		this._initPluginManager();	
	},

	_initPluginManager: function() {
		PluginManager.getInstance().init();
		this._initController();
	},

	
	/**
	 *
	 * */
	_initController: function() {
		if (this._isDomReady) {
			FwkTrace.writeMessage('M1_004'); // Initializer::_initController : initializing controller
			Controller.getInstance().init();
		} else {
			document.observe('intializer:domReady', this._initController.bindAsEventListener(this));
		}
	},
	
	/**
	 *
	 * */
	_controllerReadyHandler: function() {
		FwkTrace.writeMessage('M1_005'); // Initializer::_controllerReadyHandler : initializing controller complete		
		this._initModel();
	},
	
	/**
	 *
	 * */
	_initModel: function() {
		FwkTrace.writeMessage('M1_006'); // Initializer::_initModel : initializing model
		Model.getInstance().init();
	},
	
	/**
	 *
	 * */
	_modelReadyHandler: function() {
		FwkTrace.writeMessage('M1_007'); // Initializer::_modelReadyHandler : initializing model complete
		this._initUrl();		
	},
	
	/**
	 *
	 * */
	_initUrl: function() {
		if (ConfManager.getInstance().get('useUrl')) {
			UrlManager.getInstance().init();
		}
		this._ready();
			
	},
	
	_ready: function() {
		this._unregisterListeners();
		FwkTrace.writeMessage('M1_008'); // Initializer::_ready : FRAMEWORK READY
		console.timeEnd('WZFramework');
		Trace.timeEnd('WZFramework_DOMReady');
		//console.profileEnd('WZFramework');
	}
});

Object.extend(Initializer, {
	REQUIRED_PROTOTYPE : '1.6.0'
});

