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
var Controller = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this._isInit = true; // is it the init
		this._fileReady = 0; // number of little mvc loaded

		this._mvcProperties = []; // array containing Hash correspoding to the file mvc.xml + once loaded the information contains in conf.xml
		this._mvcConfXml = null;
		/**
		## Hash defined ##
		id: The id of the module (mvc.xml)
		file: The path to conf.xml (mvc.xml)
		autoExtract: do we execute the module at launching (mvc.xml)
		loaded: is the module loaded ?
		loading: is the module loading ?
		version : the version of the modeul
		
		modelHelper: The name of the model
		modelHelperInstances : The instances of the model
		modelHelperClass : The class of the model
		
		controllerHelper: the name of the controller
		controllerHelperInstances : The instances of the controller
		controllerHelperClass : The class of the controller
		
		view: The path to the view
		addViewInId: When we load the view, where to put it
		dynamicLoad: Do we automatically load the JS
		folder: Folder to the JS files
		compressed: Do we have have a file that contains a compressed version of the controller and model
		type: is it a simple or multiple 
		startMultitonNum :  in case of multiple, the start num of instance (most case 1)
		stopMultitonNum : in case of multiple, the num of instance in the multiton (depends of the view)
		confXml : the native XML loaded, It is useful for refresh multiple module
		initModelObj : the obj or array of obj passed at the init method of the model
		**/
		this._mvcPropertiesToExecuteAtInitLen = 0; // counter of file to load at init
		
		this._debugLaunchMethod = ConfManager.getInstance().get('debugLaunchMethod');
		//this._debugLaunchMethod = (debugLaunchMethod == undefined) ? false : debugLaunchMethod;
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	init:function() {
		
		document.observe(ModuleManager.BIND_READY_EVENT, this._bindManagerReadyHandler.bindAsEventListener(this));
		document.observe(Model.LAUNCH_CONTROLLER_METHOD_EVENT, this._launchControllerMethod.bindAsEventListener(this));
		
		if (!ConfManager.getInstance().get('useDynCompression')) {
			this._loadMvcFile();
		} else {
			this._loadDynFile();
		}
	},
	
	/**
	 * This method permit you to load a module 
	 *
	 * @param id (string) : the id of the module (definied in mvc.xml)
	 * @return Boolean : did we succeed to load the module
	 * */
	loadModule: function(id, initObj, executeBindings) {
		var executeBindings = (executeBindings != undefined) ? executeBindings : true;
		var mvcProp = this._getModule(id);
		if (!mvcProp) {
			FwkTrace.writeError('M5_001', id); //'Controller::loadModule : fail to find module '+id);
			return false;
		}
		// if module is loaded
		if (mvcProp.get('loaded')) {
			FwkTrace.writeWarning('M5_003', id);//'Controller::loadModule : Module already loaded : '+id);
			return false;
		}
		// id module is loading
		if (mvcProp.get('loading')) {
			FwkTrace.writeMessage('M5_028', id);//'Controller::loadModule : '+id+' is loading... please wait');
			return false;
		}
		
		// start timer 	
		Trace.time(id);
		
		// i am loading... :p
		mvcProp.set('loading', true);
		mvcProp.set('initModelObj', initObj);
		mvcProp.set('executeBindings', executeBindings);
		FwkTrace.writeMessage('M5_002', id);//'Controller::loadModule : LoadingModule : '+id);
		// load conf
		this._loadModuleConfFile(mvcProp);
		
		return true;
	},
	
	_unLoadAllModule: function() {
		var list = this._mvcProperties;
		var len = list.length;
		
		var item = null;
		for (var i = 0; i < len; ++i) {
			item = this._mvcProperties[i];
			if (item.get('loaded') == true) {
				this.unLoadModule(item.get('id'));
			}
		}
	},
		
	/**
	 * This method permit you to unload a module 
	 * Note that bindings (listener, lang, and bind) are not removed (seems not to give us problem) 
	 * seems to work correctly but it is possible that method could be better
	 *
	 * @param id (string) : the id of the module (definied in mvc.xml)
	 * @return Boolean : did we succeed to load the module
	 * */
	unLoadModule: function(id, willReload) {
		willReload = (willReload != undefined) ? willReload : true; 
		var mvcProp = this._getModule(id);
		
		if (mvcProp == null) {
			FwkTrace.writeError('M5_029', id);//"Controller::unLoadModule : module "+id+" not found");
			return false;
		}
		
		if (mvcProp.get('loaded') == false && mvcProp.get('loading') == false) {
			FwkTrace.writeWarning('M5_017', id); //"Controller::unLoadModule : module "+id+" is not loaded");
			return false;
		}
		// wait until the module is loaded before unloading it
		// will probably not work if there is more than one module loading that want to be unloaded at the same time (or close to the same time)
		if (mvcProp.get('loading') == true) {
			
			FwkTrace.writeWarning('M5_030', id);//'Controller::unLoadModule : The module '+id+' is loading : will try again in a few moment');
			
			var internalThis = this;
			var counter = 0;
			var interval = setInterval(function() {
				counter++;
				if (mvcProp.get('loading') == false && mvcProp.get('loaded') == true) {
					clearInterval(interval);
					internalThis._doUnloadModule(id, willReload);
				} else if (mvcProp.get('loaded') == false) {
					clearInterval(interval);
					FwkTrace.writeWarning('M5_031', id, counter); //'Controller::unLoadModule : The module '+id+' is not loaded anymore after '+counter+' try'); 
				} else {
					FwkTrace.writeWarning('M5_032', id, counter);//'Controller::unLoadModule : The module '+id+' is loading : '+counter+' try'); 
				}
				// let the module 4s and then it is too late
				if (counter >= 20) {
					FwkTrace.writeError('M5_033', id);  // Controller::unLoadModule : The module %s is still loading after so much time, stop trying
					clearInterval(interval);
				}
			}, 200);
			
		} else {
			return this._doUnloadModule(id, willReload);
		}
		return false;
	},
	
	_doUnloadModule: function (id, willReload) {
		var mvcProp = this._getModule(id);
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
		
		mvcProp.set('loading', false);
		
		FwkTrace.writeMessage('M5_016', id);//"Controller::unLoadModule : unloading module "+id);
		
		// delete the contents of the view
		var addViewInId = mvcProp.get('addViewInId');
		if (elementExists(addViewInId)) {
			$(addViewInId).update();
		}
		
		
		var confXml = window[mvcProp.get('id')+'Properties'];
		if (!confXml) {
			var listeners = $A(mvcProp.get('confXml').getElementsByTagName('bindAsListener'));
		} else {
			var listeners = confXml.bindAsListener;
		}
		
		//var confXml = mvcProp.get('confXml');
		var type =  mvcProp.get('type');
		
		var listenersLen = listeners.length;
		
		try {
			var stop = mvcProp.get('stopMultitonNum');
			
			var modelHelperInstances =  mvcProp.get('modelHelperInstances');
			var controllerHelperInstances =  mvcProp.get('controllerHelperInstances');
			
			var modelHelperInstance = null;
			var controllerHelperInstance = null;
			
			for (var i = 1; i <= stop; i++) {
				// remove listener
				modelHelperInstance = modelHelperInstances[i];
				controllerHelperInstance = controllerHelperInstances[i];
				
				modelHelperInstance.destroy();
				
				// remove dynamically added handler
				for (var j = 0; j < listenersLen; j++) {
					var bind = listeners[j];
					var id = ModuleManager.getInstance().getBindId(itemUtil_getAttribute_function(bind, 'id'), i, type);
					if (elementExists(id)) {
						var event = 	itemUtil_getAttribute_function(bind, 'event');
						Event.stopObserving(id, event);
					}
				}
				
				// remove methods of the instances + dynamically added methods
				for (var key in modelHelperInstance) {
					//key = null;
					delete modelHelperInstance[key];
				}
				for (var key in controllerHelperInstance) {
					//key = null;
					delete controllerHelperInstance[key];
					
				}
				
				//modelHelperInstance = null;
				delete modelHelperInstances[i];
				//controllerHelperInstance = null;
				delete controllerHelperInstance[i];
			}
			
			if (willReload == false) {
			
				// delete the methos of the class
				mvcProp.get('modelHelperClass').removeMethods(); // see extends.js in libs/prototype/
				mvcProp.get('controllerHelperClass').removeMethods(); // see extends.js in libs/prototype/
			
			}
		} catch (error) {
			FwkTrace.writeError('M5_020', ErrorUtil.get(error));// Controller::unLoadModule : catching error while destroying objects %s
		}
		
		if (willReload == false) {
			// if the loaded file was the compressed one
			if (mvcProp.get('compressed')) {
				// remove the script
				var modelHelperJSName = 'js_'+mvcProp.get('modelHelper');
				if (elementExists(modelHelperJSName)) {
					$(modelHelperJSName).remove();
				}
			} else {
				// remove js files
				var modelHelperJSName = 'js_'+mvcProp.get('modelHelper');
				if (elementExists(modelHelperJSName)) {
					$(modelHelperJSName).remove();
				}	
				var controllerHelperJSName = 'js_'+mvcProp.get('controllerHelper');
				if (elementExists(controllerHelperJSName)) {
					$(controllerHelperJSName).remove();
				}	
			}
		}
		
		// reinitializing data
		mvcProp.set('loaded', false);
		
		mvcProp.unset('view');
		mvcProp.unset('addViewInId');
		mvcProp.unset('compressed');
		
		mvcProp.unset('modelHelper');
		mvcProp.unset('modelHelperInstances');
		mvcProp.unset('modelHelperClass');
		
		mvcProp.unset('controllerHelper');	
		mvcProp.unset('controllerHelperInstances');	
		mvcProp.unset('controllerHelperClass');	
		mvcProp.unset('dynamicLoad');
		mvcProp.unset('type');			
		mvcProp.unset('folder');			
		mvcProp.unset('version');
		
		if (willReload == false) {
			mvcProp.unset('confXml');
		}
					
		mvcProp.unset('startMultitonNum');			
		mvcProp.unset('stopMultitonNum');			
		mvcProp.unset('initModelObj');			
		return true;
	
	},
	
	/**
	 * This method permit you to lauch a modelHelper method from the controllerHelper 
	 *
	 * @param arguments[0] (string) : The name of the controller
	 * @param arguments[1] (string) : The name of the method to call
	 * @param rest (list of string, boolean...) : Some arguments separated by coma (has if you called a function) used by the modelHelper method
	 * @return Something or false : false if that failed, something : the return of the function we just call
	 * */
	launchModelMethod: function() {
		var controllerName = arguments[0];
		var multitonId = arguments[1];
		var args = $A(arguments[2]);
		if (args.length < 1) {
			FwkTrace.writeError('M5_004', args.length);// Controller::lauchModelMethod : this method has at least 2 args, not %s
			return false;	
		}
		var modelMethod = args.shift();
		var instance = this._findLinkedModel(controllerName, multitonId);
		
		if (!instance) {
			FwkTrace.writeError('M5_005', controllerName);//'Controller::lauchModelMethod : no model found corresponding to controller '+controllerName);		
			return false;
		}
		
		if (this._debugLaunchMethod) {
			FwkTrace.writeMessage('M5_034', modelMethod, controllerName, multitonId); //'Controller::launchModelMethod : call method '+modelMethod+' on model from '+controllerName+' with multitonId '+multitonId);
		}
		
		try {
			// saving this line : "instance[modelMethod].apply(instance, args);"
			var value = Function.prototype.apply.call(instance[modelMethod], instance, args);
			
		} catch (error) {
			FwkTrace.writeError('M5_007', ErrorUtil.get(error));//'Controller::lauchModelMethod : failed call '+call+' (method doesnt exist OR bad code in the method)');
			return false;
		}
		
		if (this._debugLaunchMethod) {
			FwkTrace.writeMessage('M5_006', modelMethod, args.length);//'Controller::lauchModelMethod : ready to proceed : '+call);
		}
		
		return value;
	},
	
	/**
	 * This method permit you to lauch a method on an element of the view (useful to do a for example a focus() on an element)
	 * You can lauch this method from the ControllerHelper
	 *
	 * @param arguments[0] (string) : The id of the element where to apply the method on
	 * @param arguments[1] (string) : The name of the method to call
	 * @param rest (list of string, boolean...) : Some arguments separated by coma (has if you called a function) used by the element method
	 * @return Boolean : did we succeed to execute the method
	 * */
	applyMethodToElement: function() {
		var args = $A(arguments);
		var returnValue = true;
		if (args.length < 2) {
			FwkTrace.writeError('M5_014'); //Controller::applyMethodToElement : this method has at least 2 parameters
			return false;
		}
	
		var elementId = args.shift();
		var element = $(elementId);
		if (!element) {
			FwkTrace.writeError('M5_015', elementId); //Controller::applyMethodToElement : unknow element arguments[0]
			return false;
		}
		var methodName = args.shift();
		var method = element[methodName];
		try {
			// IE 7 doesn't agree with this call : "returnValue = method.apply(element, args);"
			// so I found that on the web : http://prototype.lighthouseapp.com/projects/8886/tickets/278-invoke-to-support-host-objects-methods
			// IE7 makes my evening long :(
			returnValue = Function.prototype.apply.call(method, element, args);
		} catch (error) {
			FwkTrace.writeError('M5_013', elementId, methodName, args.length, ErrorUtil.get(error));//'Controller::applyMethodToElement : '+error)
		}
		return returnValue;
	},
	
	refreshModule: function(moduleId) {
		var mvcProp = this._getModule(moduleId);
		FwkTrace.writeMessage('M5_035', moduleId);
		
		if (!mvcProp) {
			FwkTrace.writeError('M5_036', moduleId); //'Controller::refreshModule : fail to find module '+moduleId);
			return false;
		}
		// if module is not loaded
		if (!mvcProp.get('loaded')) {
			FwkTrace.writeError('M5_037', moduleId);//'Controller::refreshModule : the module '+moduleId+' is not loaded : launch loadModule');
			this.loadModule(moduleId);
		} else {
			ModuleManager.getInstance().updateModule(mvcProp);
		}
		return true;
	},
	
	getCurrentMultitonNumber: function(moduleId) {
		var mvcProp = this._getModule(moduleId);
		if (!mvcProp) {
			FwkTrace.writeError('M5_038', moduleId); //'Controller::getNextMultitonId : fail to find module '+moduleId);
			return false;
		}
		if (!mvcProp.get('loaded')) {
			FwkTrace.writeError('M5_039', moduleId); //'Controller::getNextMultitonId : the module '+moduleId+' is not loaded');
			return false;
		}	
		if (mvcProp.get('type') != ModuleManager.MODULE_MULTIPLE) {
			FwkTrace.writeError('M5_040', moduleId, ModuleManager.MODULE_MULTIPLE);//'Controller::getNextMultitonId : the module '+moduleId+' has not the type '+ModuleManager.MODULE_MULTIPLE);
			return false;
		}
		return mvcProp.get('stopMultitonNum');
	},
	
	getNextMultitonId: function(moduleId) {
		var result = this.getCurrentMultitonNumber(moduleId);
		// it is really === because the method can return 0 and (0 == false) is true
		if (result === false) return false;
		return result + 1;
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	/**
	 *
	 * */
	_launchControllerMethod: function(event) {
		var memo = event.memo;
		var args = $A(memo.args);
		var multitonId = memo.multitonId;
		var modelName = memo.name;
		
		if (args.length < 1) {
			FwkTrace.writeError('M5_012', args.length);//Controller::_launchControllerMethod : this method has at least 2 args, not %s
			return false;	
		}

		var controllerMethod = args.shift();
		var instance = this._findLinkedController(modelName, multitonId);

		if (!instance) {
			FwkTrace.writeError('M5_009', modelName, multitonId);//Controller::_launchControllerMethod : no controller found corresponding to model %s	
			return false;
		}
		if (this._debugLaunchMethod) {
			FwkTrace.writeMessage('M5_041', controllerMethod, modelName, multitonId);//'Controller::_launchControllerMethod : try to proceed : '+controllerMethod+' on '+modelName+' with multiton id '+multitonId);//Controller::_launchControllerMethod : ready to proceed : %s
		}
		try {
			// saving this line : "instance[controllerMethod].apply(instance, args);"
			Function.prototype.apply.call(instance[controllerMethod], instance, args);
		} catch (error) {
			FwkTrace.writeError('M5_011', ErrorUtil.get(error));//Controller::_launchControllerMethod : failed call
			return false;
		}
		if (this._debugLaunchMethod) {
			FwkTrace.writeMessage('M5_010', controllerMethod);//Controller::_launchControllerMethod : ready to proceed : %s
		}
		return true;
	},
	
	///////////////////////// LOADING OF HELPERS CONF ///////////////////////////////
	
	/**
	 *
	 * */
	_loadModuleConfFile: function(obj) {
		if (!obj.get('confXml') && !window[obj.get('id')+'Properties']) {
			var file = obj.get('file')+"?v="+ConfManager.getInstance().get('version');
			FwkTrace.writeMessage('M5_021', file);//"Controller::_loadModuleConfFile : load file "+file);
			
			new Ajax.Request(file, {
			  	method: 'get',
			  	onSuccess: this._loadModuleConfFileSuccessHandler.bindAsEventListener(this, obj),
				onFailure: this._loadModuleConfFileFailHandler.bindAsEventListener(this, obj),
				evalJS: false,
				evalJSON: false,
				sanitizeJSON: false
			});
		} else {
			ModuleManager.getInstance().bindFile(obj);
		}
	},
	
	/**
	 *
	 * */
	_loadModuleConfFileSuccessHandler: function(transport, obj) {
		var response = transport.responseXML;
		if (Prototype.Browser.IE) {
			this._launchBindFile.bind(this).defer(response, obj)	
		} else {
			this._launchBindFile(response, obj);
		}
	},
	
	_launchBindFile: function(response, obj) {
		FwkTrace.writeMessage('M5_026');
		obj.set('confXml', response);
		ModuleManager.getInstance().bindFile(obj);
	},
	
	/**
	 *
	 * */
	_loadModuleConfFileFailHandler: function(transport, obj) {
		FwkTrace.writeError('M5_027', obj.get('file'), transport.status)//'ModuleManager::_loadFileFailHandler : file ['+this.file+'] was not loaded : '+transport.status);
	},
	
	///////////////////////// MODULE RELATED FILE ///////////////////////////////
	
	/**
	 *
	 * */
	_getModule: function(id) {
		var selectedObj = null;
		var prop = this._mvcProperties;
		for (var i = prop.length - 1; i >= 0; --i) {
			var obj = prop[i];
			if (obj.get('id') == id) {
				selectedObj = obj;
				break;
			}
		}
		return selectedObj;
	},
	
	///////////////////////// WORK ON MVCNAME ///////////////////////////////
	
	/**
	 *
	 * */
	_findLinkedModel: function(controllerName, index) {
		return this._findLinked(controllerName, 'controllerHelper',  'modelHelper', index);
	},
	
	/**
	 *
	 * */
	_findLinkedController: function(modelName, index) {
		return this._findLinked(modelName, 'modelHelper', 'controllerHelper', index);
	},
	
	/**
	 *
	 * */
	_findLinked: function(name, helperCompare, helperSearch, index) {
		var returnValue = null;
		var prop = this._mvcProperties;
		for (var i = prop.length - 1; i >= 0; --i) {
			var value = prop[i];
			if (name == value.get(helperCompare)) {
				returnValue = value.get(helperSearch+'Instances')[index];
				break;
			}
		}
		return returnValue;
	},
	
	///////////////////////// LOAD MVC FILE ///////////////////////////////
	
	/** 
	 *
	 * */
	_loadMvcFile: function() {	
		var confManager = ConfManager.getInstance();
		var file = confManager.get('mvcFile')+'?v='+confManager.get('version');
		FwkTrace.writeMessage('M5_022', file);//'Controller::_loadMvcFile : loading file '+file);
		new Ajax.Request(file, {
		  	method: 'get',
		  	onSuccess: this._loadMvcFileSuccessHandler.bindAsEventListener(this),
			onFailure: this._loadMvcFileFailHandler.bindAsEventListener(this),
			evalJS: false,
			evalJSON: false,
			sanitizeJSON: false
		});
	},
	
	/**
	 *
	 * */
	_loadMvcFileSuccessHandler : function(transport) {
	
		this._mvcConfXml = transport.responseXML;
		FwkTrace.writeMessage('M5_023');//'Controller::_loadMvcFileSuccessHandler');
		this._parseMvcFile();
		this._useMvcFile();

	},
	
	_loadDynFile: function() {
		FwkTrace.writeMessage('M5_042');//'Initializer::_loadDynFileSucceedHandler : loading dyn
		var conf = ConfManager.getInstance();
		
		var url = [];
		url.push(conf.get('dynCompressionUrl'));
		url.push("?mvc="+conf.get('mvcFile'));
		url.push("&baseUrl="+conf.get('baseUrl'));
		url.push("&compressedName="+conf.get('compressedName'));
		url.push("&jsExt=js");
		url.push("&usePacker="+conf.get('usePacker'));
		url.push("&useCache="+conf.get('useCache'));
		
		var scriptLoader = new ScriptLoader(url.join(""));
		
		document.observe(ScriptLoader.SUCCEED, 	this._loadDynFileSucceedHandler.bindAsEventListener(this));
		document.observe(ScriptLoader.FAILED, 	this._loadDynFileFailedHandler.bindAsEventListener(this));
		
		scriptLoader.load();
	},
	
	_loadDynFileSucceedHandler: function() {
		document.stopObserving(ScriptLoader.SUCCEED);
		document.stopObserving(ScriptLoader.FAILED);
		FwkTrace.writeMessage('M5_043');//Controller::_loadDynFileSucceedHandler : loading dyn succeed
		this._parseMvcFile();
		this._useMvcFile();
	}, 
	
	_loadDynFileFailedHandler: function() {
		trace('Initializer::_loadDynFileFailedHandler : fail loading dyn');
		this._loadDynFileSucceedHandler();
	},
	
	/**
	 *
	 * */
	_loadMvcFileFailHandler : function(transport) {
		var confManager = ConfManager.getInstance();
		FwkTrace.writeError('M5_008', confManager.get('mvcFile')+'?v='+confManager.get('version'), transport.status);//'Controller::_loadMvcFileFailHandler : mvc file ['+this.mvcDefinerFile+'] was not loaded : '+transport.status);
	},
	
	///////////////////////// WORK ON MVC FILE ///////////////////////////////
	
	/**
	 *
	 * */
	_parseMvcFile : function() {
		FwkTrace.writeMessage('M5_024');//'Controller::_parseMvcFile');
		var isInit =  this._isInit;
		var prop = window['MvcProperties'];
		
		if (!prop) {
			var xml = this._mvcConfXml;
			var list = xml.getElementsByTagName('item');
		} else {
			var list = prop;
		}

		// optim
		var confManager = ConfManager.getInstance();
		var addBaseUrl = confManager.get('addBaseUrl');
		var baseUrl = confManager.get('baseUrl');
		
		// function
		var booleanUtil_toBoolean_function = BooleanUtil.toBoolean;
		var urlUtil_makeAbsolute_function = UrlUtil.makeAbsolute;
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;

		for (var i = list.length - 1; i >= 0; --i) {
		
			var item = list[i];
			var requireId =			itemUtil_getAttribute_function(item, 'requireId');

			if (requireId == undefined || requireId == "" || requireId == null || elementExists(requireId)) {
			
				var id = 				itemUtil_getAttribute_function(item, 'id');
				var file = 				itemUtil_getAttribute_function(item, 'file');
				var executeAtInit = 	booleanUtil_toBoolean_function(itemUtil_getAttribute_function(item, 'executeAtInit'));

				if (addBaseUrl) {
					file = urlUtil_makeAbsolute_function(file, baseUrl);
				}
				
				this._mvcProperties.push($H({	id: id, 
												file: file, 
												autoExtract: executeAtInit, 
												loaded: false, 
												loading: false
											}));
				if (executeAtInit && isInit) {
					this._mvcPropertiesToExecuteAtInitLen++;
				}
			} else {
				FwkTrace.writeWarning('M5_044', requireId, id); //"Controller::_parseMvcFile : we didn't find the requireId "+requireId+", so we do not load the module "+id);
			}	
		}

			
	},
	
	/**
	 *
	 * */
	_useMvcFile: function() {
		FwkTrace.writeMessage('M5_025');//'Controller::_useMvcFile');
		var props = this._mvcProperties;
		
		for (var i = props.length - 1; i >= 0; --i) {
			var obj = props[i];
			if (obj.get('autoExtract')) {
				obj.set('loading', true);
				obj.set('executeBindings', true);	
				obj.set('initModelObj', {});			
				this._loadModuleConfFile(obj);
			}
		};
	},
	
	/**
	 *
	 * */
	_bindManagerReadyHandler: function(event) {
		this._initHelpers(event.memo);
	
		this._fileReady++;
		
		if (this._fileReady == this._mvcPropertiesToExecuteAtInitLen) {
			this._ready();	
		}
	},
	
	/**
	 *
	 * */
	_initHelpers: function(moduleProperties) {
		// update the hash with new properties
		var moduleProp = this._getModule(moduleProperties.get('id'));
		
		Trace.time('initHelpers : '+moduleProp.get('id'));
		
		// idk if this line is useful or not
		moduleProp.update(moduleProperties);

		var nameController = 		moduleProp.get('controllerHelper');
		var nameModel =	 			moduleProp.get('modelHelper');
				
		var instancesController = 	moduleProp.get('controllerHelperInstances'); 
		var instancesModel = 		moduleProp.get('modelHelperInstances'); 
		var stopMultitonNum = 		moduleProp.get('stopMultitonNum');
		var startMultitonNum = 		moduleProp.get('startMultitonNum');
		var initModelObj = 			moduleProp.get('initModelObj');

		try {
			// we have to register the instance before initializing the model and controller
			for (var i = startMultitonNum; i <= stopMultitonNum; ++i) {
				instancesController[i].setWZProperties(i, nameController, Helper.TYPE_CONTROLLER);
				instancesModel[i].setWZProperties(i, nameModel, Helper.TYPE_MODEL);
			}
		
		} catch (error) {
			FwkTrace.writeError('M5_045', ErrorUtil.get(error)); // Controller::_initHelpers : Unable to set properties on model or controller helper instances : %s
		}
		
		try {	
			for (var i = startMultitonNum; i <= stopMultitonNum; ++i) {
				instancesController[i].init();
				instancesModel[i].init(initModelObj);
			}
		} catch (error) {	
			FwkTrace.writeError('M5_046', ErrorUtil.get(error));//Controller::_initHelpers : Unable to init model or controller helper : %s
		}
		
		try {	
			// check the required application data
			// this should not be done more than once
			if (instancesModel[1]) {
				var requiredApplicationData = instancesModel[1].getRequiredApplicationDataKeys();
				var requiredApplicationDataLen = requiredApplicationData.length;
				var requiredApplicationDataItem = null;
				var confManager = ConfManager.getInstance();
				for (var j = 0; j < requiredApplicationDataLen; j++) {
					requiredApplicationDataItem = requiredApplicationData[j];
					if (confManager.getApplicationData(requiredApplicationDataItem) == undefined) {
						FwkTrace.writeError('M5_047', moduleProp.get('id'), requiredApplicationDataItem);//'Controller::_initHelpers : '+moduleProp.get('id')+' require the application data ['+requiredApplicationDataItem+'] (please complete your main conf file or the second parameter of the initializer)');				
					}
				}
			}
		} catch (error) {
			FwkTrace.writeError('M5_048', ErrorUtil.get(error));//'Controller::_initHelpers : problem while checking required key : '+ErrorUtil.get(error));
		}
		// the start become the stop for later loading
		moduleProp.set('startMultitonNum', stopMultitonNum+1);

		moduleProp.set('loading', false);
		// the module is now loaded 
		moduleProp.set('loaded', true);
		
		Trace.timeEnd('initHelpers : '+moduleProp.get('id'));
		Trace.timeEnd(moduleProp.get('id'));
	}, 
	 
	/**
	 *
	 * */
	_ready: function() {
		if (this._isInit) {
			this._isInit = false;
			document.fire(Controller.CONTROLLER_READY_EVENT);	
		}
	}
	
});

Object.extend(Controller, {
	CONTROLLER_READY_EVENT : 'controller:ready'
});

SingletonUtil.execute(Controller);