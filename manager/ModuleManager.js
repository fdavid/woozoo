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

var ModuleManager = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this._stackAdd = [];
		this._stackUpdate = [];
		this._busy = false;
		this._langBinding = [];
		this._pluginManagerReadyPropertie = null;
		this._currentModuleProperties = null;
		
		var debugBinding = ConfManager.getInstance().get('debugBinding');
		this._debugBinding = (debugBinding == undefined) ? false : debugBinding;
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	bindFile: function(properties) {
		FwkTrace.writeMessage('M3_015', properties.get('file'));
		this._stackAdd.push(properties);

		if (this._busy == false) {
			this._busy = true;
			this._run();
		} 
	},
	
	/**
	 *
	 * */
	executeLangBindings: function() {
		this._langBinding.each(function(item) {
			BindingUtil.bindLang(item.id, item.attribute, item.propertie);
		});//.bind(this));
	},
	
	/**
	 *
	 * */
	updateModule: function(properties) {
		this._stackUpdate.push(properties);
		if (!this._busy) {
			this._busy = true;
			this._update();
		}	
	}, 
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/

	/**
	 *
	 * */
	_update: function() {
		this._currentModuleProperties = this._stackUpdate.shift();
		this._currentModuleProperties.set('stopMultitonNum', this._countModule(this._currentModuleProperties.get('startMultitonNum')));
		
		this._initInstances();
		
		this._initControllerBinding();
		this._initModelBinding();
		
		this._ready();
	},

	/**
	 *
	 * */
	_run: function() {
		this._currentModuleProperties = this._stackAdd.shift();
		this._initMvc();
	},
	
	/**
	 *
	 * */
	_init: function() {
		document.observe(HelperLoaderManager.HELPER_READY_EVENT, this._helpersReadyHandler.bindAsEventListener(this));
		document.observe(ModuleManager.LOAD_READY_EVENT, this._loadReadyHandler.bindAsEventListener(this));
	},
	
	/**
	 *
	 * */
	_loadReadyHandler: function(event) {
		this._initBindings();
	},
	
	/**
	 *
	 * */
	_initBindings: function() {
		var res = this._initPlugins();
		if (!res) {
			this._initRest();
		} else {
			this._pluginManagerReadyPropertie = this._pluginManagerReadyHandler.bindAsEventListener(this);
			document.observe(PluginManager.READY_EVENT, this._pluginManagerReadyPropertie);
		}
	},
	
	_pluginManagerReadyHandler: function(event) {
		this._initRest();
		document.stopObserving(PluginManager.READY_EVENT, this._pluginManagerReadyPropertie);
		this._pluginManagerReadyPropertie = null;
	},
	
	_initRest: function() {
		var mp = 				this._currentModuleProperties;
		
		// 1
		Trace.time('getClass : '+mp.get('id'));
		var classController =  	window[mp.get('controllerHelper')];
		var classModel = 		window[mp.get('modelHelper')];
		
		if (classController == undefined || classModel == undefined) {
			FwkTrace.writeError('M3_001', mp.get('controllerHelper'), mp.get('modelHelper'));//'ModuleManager::_initRest : unable to eval controller '+mp.get('controllerHelper')+' and/or model '+mp.get('modelHelper'));
			return false;
		}
		
		this._currentModuleProperties.set('modelHelperClass', classModel);
		this._currentModuleProperties.set('controllerHelperClass', classController);
		Trace.timeEnd('getClass : '+mp.get('id'));
		
		// 2
		Trace.time('initTon : '+mp.get('id'));
		var type = mp.get('type');
		switch(type) {
			case ModuleManager.MODULE_SIMPLE:
				SingletonUtil.execute(classModel);
				SingletonUtil.execute(classController);
			break;
			case ModuleManager.MODULE_MULTIPLE:
				MultitonUtil.execute(classModel);
				MultitonUtil.execute(classController);
			break;
			default:
				FwkTrace.writeError('M3_002', ModuleManager.MODULE_SIMPLE, ModuleManager.MODULE_MULTIPLE);//"ModuleManager::_initRest : unknow value for type (should be either %s or %s)");
				return false;
				break;
		}
		Trace.timeEnd('initTon : '+mp.get('id'));
		
		// 3
		Trace.time('initInstances : '+mp.get('id'));
		this._initInstances();
		Trace.timeEnd('initInstances : '+mp.get('id'));
		
		if (mp.get('executeBindings') == true) {
			// 4
			Trace.time('bindListener : '+mp.get('id'));
			this._initControllerBinding();
			Trace.timeEnd('bindListener : '+mp.get('id'));
			
			// 5
			Trace.time('bind : '+mp.get('id'));
			this._initModelBinding();
			Trace.timeEnd('bind : '+mp.get('id'));
		} else {
			FwkTrace.writeMessage('M3_003', mp.get('executeBindings'));//'ModuleManager::_initRest : do not execute bindings [value = '+mp.get('executeBindings')+']');
		}
		this._ready();
		
		return true;
	},
	
	_initInstances: function() {
		var mp = 					this._currentModuleProperties;
		var modelClass = 			mp.get('modelHelperClass');
		var controllerClass = 		mp.get('controllerHelperClass');
		var stopMultitonNum = 		mp.get('stopMultitonNum'); 
		var startMultitonNum = 		mp.get('startMultitonNum');
		
		var instancesController = 	mp.get('controllerHelperInstances');
		var instancesModel = 		mp.get('modelHelperInstances');
		
		for (var i = startMultitonNum; i <= stopMultitonNum; ++i) {
			instancesController[i] = 	controllerClass.getInstance(i);
			instancesModel[i] = 		modelClass.getInstance(i);
		}
		
		this._currentModuleProperties.set('modelHelperInstances', instancesModel);
		this._currentModuleProperties.set('controllerHelperInstances', instancesController);
		return true;
	},
	
	/**
	 *
	 * */
	_initMvc: function () {
		var booleanUtil_toBoolean_function = BooleanUtil.toBoolean;
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
		
		var conf = window[this._currentModuleProperties.get('id')+'Properties'];
		if (!conf) {
			conf = 	this._currentModuleProperties.get('confXml').getElementsByTagName('conf')[0];		
		}
		
		var model = 				itemUtil_getAttribute_function(conf, 'model');
		var controller = 			itemUtil_getAttribute_function(conf, 'controller');
		
		if (model == null || controller == null) {
			Trace.writeError('M3_011');//'ModuleManager._initMvc()');
			return false;
		}
		
		var view = 					itemUtil_getAttribute_function(conf, 'view');
		var addViewInId = 			itemUtil_getAttribute_function(conf, 'addViewInId');
		var dynamicLoad = 			booleanUtil_toBoolean_function(itemUtil_getAttribute_function(conf, 'dynamicLoad'));
		var folder = 				itemUtil_getAttribute_function(conf, 'folder');
		var compressed =			booleanUtil_toBoolean_function(itemUtil_getAttribute_function(conf, 'compressed'));
		var version = 				itemUtil_getAttribute_function(conf, 'version') ? itemUtil_getAttribute_function(conf, 'version') : ModuleManager.MODULE_DEFAULT_VERSION;
		var type = 					itemUtil_getAttribute_function(conf, 'type') ? itemUtil_getAttribute_function(conf, 'type') : ModuleManager.MODULE_SIMPLE;
		var startMultitonNum =		1;	
		// we also could imagine to find an id in the DOM with the total count that could in this case be dynamic :P
		if (type == ModuleManager.MODULE_MULTIPLE) {
			var stopMultitonNum = itemUtil_getAttribute_function(conf, 'count') ? itemUtil_getAttribute_function(conf, 'count') : this._countModule(startMultitonNum);
		} else {
			var stopMultitonNum = startMultitonNum;
		}	


		if (ConfManager.getInstance().get('addBaseUrl')) {
			folder = UrlUtil.makeAbsolute(folder, ConfManager.getInstance().get('baseUrl'));
		}
		this._currentModuleProperties.update($H({
											modelHelper: 				model, 
											controllerHelper: 			controller, 
											view: 						view, 
											addViewInId: 				addViewInId, 
											dynamicLoad: 				dynamicLoad, 
											folder: 					folder, 
											compressed: 				compressed, 
											version: 					version, 
											type: 						type, 
											controllerHelperInstances:	[],
											modelHelperInstances:		[],
											startMultitonNum: 			startMultitonNum,
											stopMultitonNum: 			stopMultitonNum
											}));	

		if (!dynamicLoad) {
			document.fire(ModuleManager.LOAD_READY_EVENT);
		} else {
			HelperLoaderManager.getInstance().loadHelpers(this._currentModuleProperties);	
		}
		return true;
	},
	
	/**
	 *
	 * */
	_helpersReadyHandler: function(event) {
		document.fire(ModuleManager.LOAD_READY_EVENT);
	},
	
	/**
	 *
	_initModelBinding: function() {
		var mp = 					this._currentModuleProperties;
		var start = 				mp.get('startMultitonNum');
		var stop = 					mp.get('stopMultitonNum');
		var modelHelperInstances = 	mp.get('modelHelperInstances');
		var type = 					mp.get('type');
		
		var binds = mp.get('confXml').getElementsByTagName('bind');
		
		// START optimization on calling
		var bindingUtil_bind_function = BindingUtil.bind;
		var bindingUtil_bindLang_function = BindingUtil.bindLang;
		var booleanUtil_toBoolean_function = BooleanUtil.toBoolean;
		var debug = this._debugBinding;
		// END optimization on calling
		
		
			

		
		for (var j = binds.length-1; j >= 0 ; --j) {
			var bind = binds[j];
			
			var tempId =		bind.getAttribute('id');	
			var attribute =	 	bind.getAttribute('attribute');
			var style = 		bind.getAttribute('style');
			var propertie = 	bind.getAttribute('propertie');
			var langPropertie = bind.getAttribute('langPropertie');
			var hasGetter = 	(bind.getAttribute('writeOnly') == undefined) ? true : false;
			var hasSetter = 	(bind.getAttribute('readOnly') == undefined) ? true : false;
			var initPropertie = bind.getAttribute('initPropertie');
			var optional = 		(bind.getAttribute('optional') == undefined) ? false : true;
			
			if (initPropertie == undefined) {
				initPropertie = true;	
			} else {
				initPropertie = booleanUtil_toBoolean_function('initPropertie');
			}
			
			for (var i = start; i <= stop; ++i) {
				var id = 			this.getBindId(tempId, i, type);
				var propertieList = [];
				var data = [];
			
				// this is a binding for lang
				if (langPropertie != null) {
					
					// keep this line for debug (slow down the execution) 
					if (debug) {
						FwkTrace.writeMessage('M3_012', id, attribute, langPropertie);//'ModuleManager._initModelBinding (lang) : ' + id+' '+attribute+' '+langPropertie);
					}
					bindingUtil_bindLang_function(id, attribute, langPropertie);
					this._langBinding.push({id: id, attribute: attribute, propertie: langPropertie});
				
				// this is a binding on one of the model propertie
				} else {
					propertie = this._getPropertieName(propertie, tempId, attribute, type);
					
					// we do that in case of bindings are applyed to the same propertie
					if (data[propertie] == undefined) {
						data[propertie] = [];
						data[propertie]['ids'] = [];
						data[propertie]['attributes'] = [];
						// TODO : Should be an array
						data[propertie]['hasGetter'] = true;
						// TODO : Should be an array
						data[propertie]['hasSetter'] = true;
						// TODO : Should be an array
						data[propertie]['initPropertie'] = true;
						// TODO : Should be an array
						data[propertie]['optional'] = [];
						
						propertieList.push(propertie);
					}
					data[propertie]['ids'].push(id);
					
					if (attribute != null) {
						data[propertie]['attributes'].push(attribute);

						if (debug) {
							FwkTrace.writeMessage('M3_013', id, attribute, propertie);// 'ModuleManager._initModelBinding : ' + id+' '+attribute+' '+propertie);
						}
					} else {
						data[propertie]['attributes'].push("style:"+style);
						
						if (debug) {
							FwkTrace.writeMessage('M3_013', id, "style:"+style, propertie);// 'ModuleManager._initModelBinding : ' + id+' '+attribute+' '+propertie);
						}
					}
					// TODO : Should be an array
					data[propertie]['hasGetter'] = hasGetter;
					// TODO : Should be an array
					data[propertie]['hasSetter'] = hasSetter;
					// TODO : Should be an array
					data[propertie]['initPropertie'] = initPropertie;
				
					data[propertie]['optional'].push(optional);
				}
				for (var k = 0, propertieListLen = propertieList.length; k < propertieListLen; ++k) {
					var key = propertieList[k];
					var value = data[key];
					bindingUtil_bind_function(value['ids'], value['attributes'], key, modelHelperInstances[i], value['hasGetter'], value['hasSetter'], value['initPropertie'], value['optional']);
				}
			}
			
		}
	},
	 * */

	/**
	 *
	 * */
	_initModelBinding: function() {
		var mp = 					this._currentModuleProperties;
		var start = 				mp.get('startMultitonNum');
		var stop = 					mp.get('stopMultitonNum');
		var modelHelperInstances = 	mp.get('modelHelperInstances');
		var type = 					mp.get('type');
		
		var prop = window[this._currentModuleProperties.get('id')+'Properties'];
		if (!prop) {
			var binds = mp.get('confXml').getElementsByTagName('bind');
		} else {
			var binds = prop.bind;
		}
		var bindsLen = binds.length;
		
		// START optimization on calling
		var bindingUtil_bind_function = BindingUtil.bind;
		var bindingUtil_bindLang_function = BindingUtil.bindLang;
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
		// END optimization on calling
		
		for (var i = start; i <= stop; i++) {
			
			var modelHelperInstance = modelHelperInstances[i];
			var propertieList = [];
			var data = [];
			
			for (var j = 0; j < bindsLen; j++) {
				var bind = binds[j];
				
				var id = 			this.getBindId(itemUtil_getAttribute_function(bind, 'id'), i, type);
				var attribute =	 	itemUtil_getAttribute_function(bind, 'attribute');
				var style = 		itemUtil_getAttribute_function(bind, 'style');
				var propertie = 	itemUtil_getAttribute_function(bind, 'propertie');
				var langPropertie = itemUtil_getAttribute_function(bind, 'langPropertie');
				var hasGetter = 	(itemUtil_getAttribute_function(bind, 'writeOnly') == undefined) ? true : false;
				var hasSetter = 	(itemUtil_getAttribute_function(bind, 'readOnly') == undefined) ? true : false;
				var initPropertie = itemUtil_getAttribute_function(bind, 'initPropertie');
				var optional = 		(itemUtil_getAttribute_function(bind, 'optional') == undefined) ? false : true;				
				
				if (initPropertie == undefined) {
					initPropertie = true;	
				} else {
					initPropertie = BooleanUtil.toBoolean('initPropertie');
				}
				
				// this is a binding for lang
				if (langPropertie != null) {
					
					// keep this line for debug (slow down the execution) 
					//== IF (NO_FWK_TRACE) ==//
					if (this._debugBinding) {
						FwkTrace.writeMessage('M3_012', id, attribute, langPropertie);//'ModuleManager._initModelBinding (lang) : ' + id+' '+attribute+' '+langPropertie);
					}
					//== ENDIF (NO_FWK_TRACE) ==//
					
					bindingUtil_bindLang_function(id, attribute, langPropertie);
					this._langBinding.push({id: id, attribute: attribute, propertie: langPropertie});
				
				// this is a binding on one of the model propertie
				} else {
					// auto set name
					if (propertie == '' || propertie == null) {
						propertie = id+'-'+attribute; // myId-value
						propertie = propertie.camelize(); // myIdValue
					}
					
					// we do that in case of bindings are applyed to the same propertie
					if (data[propertie] == undefined) {
						data[propertie] = [];
						data[propertie]['ids'] = [];
						data[propertie]['attributes'] = [];
						// TODO : Should be an array
						data[propertie]['hasGetter'] = true;
						// TODO : Should be an array
						data[propertie]['hasSetter'] = true;
						// TODO : Should be an array
						data[propertie]['initPropertie'] = true;
						// TODO : Should be an array
						data[propertie]['optional'] = [];
						
						propertieList.push(propertie);
					}
					data[propertie]['ids'].push(id);
					
					if (attribute != null) {
						data[propertie]['attributes'].push(attribute);
						//== IF (NO_FWK_TRACE) ==//
						if (this._debugBinding) {
							FwkTrace.writeMessage('M3_013', id, attribute, propertie);// 'ModuleManager._initModelBinding : ' + id+' '+attribute+' '+propertie);
						}
						//== ENDIF (NO_FWK_TRACE) ==//
					} else {
						data[propertie]['attributes'].push("style:"+style);
						//== IF (NO_FWK_TRACE) ==//		
						if (this._debugBinding) {
							FwkTrace.writeMessage('M3_013', id, "style:"+style, propertie);// 'ModuleManager._initModelBinding : ' + id+' '+attribute+' '+propertie);
						}
						//== ENDIF (NO_FWK_TRACE) ==//		
					}
					// TODO : Should be an array
					data[propertie]['hasGetter'] = hasGetter;
					// TODO : Should be an array
					data[propertie]['hasSetter'] = hasSetter;
					// TODO : Should be an array
					data[propertie]['initPropertie'] = initPropertie;
				
					data[propertie]['optional'].push(optional);
				}
			}
			/*for (key in data) {
				var value = data[key];
				if (value['ids']) {
					bindingUtil_bind_function(value['ids'], value['attributes'], key, modelHelperInstances[i], value['hasGetter'], value['hasSetter'], value['initPropertie'], value['optional']);
				}	
			}*/
			
			for (var k = 0, propertieListLen = propertieList.length; k < propertieListLen; k++) {
				var key = propertieList[k];
				var value = data[key];
				bindingUtil_bind_function(value['ids'], value['attributes'], key, modelHelperInstance, value['hasGetter'], value['hasSetter'], value['initPropertie'], value['optional']);
			}

		}
	},
	
	_initPlugins: function() {
		var wait = false;
		var prop = window[this._currentModuleProperties.get('id')+'Properties'];
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
		
		if (!prop) {
			var plugins = this._currentModuleProperties.get('confXml').getElementsByTagName('plugin');
		} else {
			var plugins = prop.plugin;
		}
		for (var i = 0, len = plugins.length; i < len; i++) {
			var res = itemUtil_getAttribute_function(plugins[i], 'id');
			if (PluginManager.getInstance().apply(res)) {
				wait = true;
			}
		}
		return wait;
	},
	
	/**
	 *
	 * */
	_initControllerBinding: function() {
		var mp = this._currentModuleProperties;
		
		var start = 						mp.get('startMultitonNum');
		var stop = 							mp.get('stopMultitonNum');
		var controllerHelperInstances = 	mp.get('controllerHelperInstances');
		var type = 							mp.get('type');
		
		var prop = window[this._currentModuleProperties.get('id')+'Properties'];
		if (!prop) {
			var listeners = mp.get('confXml').getElementsByTagName('bindAsListener');
		}else {
			var listeners = prop.bindListener;
		}
		
		// START optimization on calling
		var bindingUtil_bindListener_function = BindingUtil.bindListener;
		//== IF (NO_FWK_TRACE) ==//
		var fwkTrace_writeMessage_function = FwkTrace.writeMessage;
		//== ENDIF (NO_FWK_TRACE) ==//
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
		var debug = this._debugBinding;
		// END optimization on calling
			
		for (var j = listeners.length-1; j >= 0 ; --j) {
			var bind = listeners[j];
			
			var tempId = 	itemUtil_getAttribute_function(bind, 'id');
			var event = 	itemUtil_getAttribute_function(bind, 'event');
			var handler = 	this._getHandlerName(itemUtil_getAttribute_function(bind, 'handler'), event, tempId, type);		
			var optional = 	(itemUtil_getAttribute_function(bind, 'optional') == undefined) ? false : true;

			for (var i = start; i <= stop; ++i) {
				var id = 		this.getBindId(tempId, i, type);
				//== IF (NO_FWK_TRACE) ==//
				if (debug) {
					fwkTrace_writeMessage_function('M3_014', id, event, handler); //'ModuleManager._initControllerBinding : ' + id+' '+event+' '+handler);
				}
				//== ENDIF (NO_FWK_TRACE) ==//
				bindingUtil_bindListener_function(id, event, handler, controllerHelperInstances[i], optional);
			}
		}		
	},
	
	/**
	 *
	 * */
	_countModule: function(start) {
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
	
		var prop = window[this._currentModuleProperties.get('id')+'Properties'];
		
		if (!prop) {
			var confXml = this._currentModuleProperties.get('confXml');
			// we look for bind
			var list = confXml.getElementsByTagName('bind');
			// if not found, look for bindAsListener
			if (list.length == 0) {
				list = confXml.getElementsByTagName('bindAsListener');
			}
		} else {
			var list = prop.bind;
			if (list.length == 0) {
				list = prop.bindAsListener;
			}
		}
		
		if (list.length > 0) {
			var name = itemUtil_getAttribute_function(list[0], 'id');
			
			if (!name.include('[]')) {
				FwkTrace.writeWarning('M3_005', name);//'ModuleManager::_countModule : '+name+' do not contains the string [], stop execution');				
				return 0;
			}
			while(elementExists(name.replace('[]', start))) {
				start++;
			}
			return (start-1);
		} else {
			return start;
		}
	},
	
	getBindId: function(id, counter, type) {
		switch (type) {
			case ModuleManager.MODULE_SIMPLE:
				return id;
			case ModuleManager.MODULE_MULTIPLE:
				return id.replace('[]', counter);
			default:
				FwkTrace.writeError('M3_004', ModuleManager.MODULE_SIMPLE, ModuleManager.MODULE_MULTIPLE);//'ModuleManager::_getBindId : unknow type (should be either %s or %s)');
				break;
		}
		return null;
	},
	
	_getHandlerName: function(handler, event, id, type) {
		// auto set name
		if (handler == '' || handler == null) {
			if (type == ModuleManager.MODULE_MULTIPLE) {
				handler = (id.replace('[]', ''))+'-'+event+'-handler'; // myId-click-handler
			} else {
				handler = id+'-'+event+'-handler'; // myId-click-handler
			}
			handler = handler.camelize(); // myIdClickHandler
		}
		return handler;
	},
	
	_getPropertieName: function(propertie, id, attribute, type) {
		if (propertie == '' || propertie == null) {
			if (type == ModuleManager.MODULE_MULTIPLE) {
			 	propertie = (id.replace('[]', ''))+'-'+attribute; // myId-value
			} else {
			 	propertie = id+'-'+attribute; // myId-value
			}
			propertie = propertie.camelize(); // myIdValue
		}
		return propertie;
	},
	
	/**
	 *
	 * */
	_ready: function() {
		
		document.fire(ModuleManager.BIND_READY_EVENT, this._currentModuleProperties);	
		
		if (this._stackAdd.length > 0) {
			this._run();
		} else if (this._stackUpdate.length > 0) {
			this._update();		
		} else {
			this._busy = false;
		}
	}
});
	
/**
 * Static property
 * */
Object.extend(ModuleManager, {	

	BIND_READY_EVENT: "bind:ready",
	LOAD_READY_EVENT: "bind:loadReady",
	
	MODULE_SIMPLE: "simple",
	MODULE_MULTIPLE: "multiple",
	
	MODULE_DEFAULT_VERSION: new Date().getTime()
});

/**
 * Singleton
 * */
SingletonUtil.execute(ModuleManager, "_init");