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
 * This file could be a lot compressed 
 * The 3 groups (model, controller and compressed) loading are quite the same
 * */
var HelperLoaderManager = Class.create(EventDispatcher, {

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this._moduleProperties = $H({});
		//this._handlers = {};
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	loadHelpers: function(moduleProperties) {
		this._moduleProperties = moduleProperties;
		this._loadView();
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	///////////////////////// LOAD VIEW ///////////////////////////////
	
	/**
	 *
	 * */  
	_loadView: function() {
		var viewContent = this._moduleProperties.get('viewContent');
		if (viewContent == undefined) {
	
			var file = this._moduleProperties.get('view');
			// if we have a view to load
			if (file != null && file != '' && file != undefined) {
				// we test if the element that will contain the view exists,
				// if not we have just to die, but we try to load the rest
				var view = this._moduleProperties.get('addViewInId');
				if (!elementExists(view)) {
					FwkTrace.writeError('M4_003', view);//'HelperLoaderManager::_loadViewReadyHandler : unknow id '+this.addViewToId);
					this._loadRest();
					return false;
				}
				
				// adding extension
				var ext = ConfManager.getInstance().get('viewFileExt');
				if (ext != undefined && ext != "") {
					file += '.'+ConfManager.getInstance().get('viewFileExt');
				}
				
				// search some data to add in the url
				var reg = new RegExp(/ApplicationData\.([-a-z0-9_]+)/gi);
				var result = reg.exec(file);
				if (result) {
					for (var i = result.length - 1; i >= 0; --i) {
						var item = result[i];
						if (item[15] == '.') {
							var split = item.split('.');
							var appData = ConfManager.getInstance().getApplicationData(split[1]);
							if (!appData) {
								appData = "";
							}
							var localRef = new RegExp("\\\["+item+"\\\]", "g");
							file = file.replace(localRef, appData);
						}
					}
				}
				
				// adding the version number (cache killer)
				file += '?v='+this._moduleProperties.get('version');
				FwkTrace.writeMessage('M4_001', file); //'HelperLoaderManager::_loadView : loading view '+file);
				
				// lauching request
				new Ajax.Request(file, {
					method: 'get',
					onSuccess: this._loadViewReadyHandler.bindAsEventListener(this),
					onFailure: this._loadViewFailHandler.bindAsEventListener(this),
					evalJS: false,
					evalJSON: false,
					sanitizeJSON: false
				});
			// we are loading the rest	
			} else {
				this._loadRest();
			}
		} else {
			this._addLoadedViewToDOM(viewContent);
		}	
		return true;
	},
	
	/**
	 *
	 * */
	_loadViewFailHandler: function(transport) {
		FwkTrace.writeError('M4_002', this._moduleProperties.get('view'));//'HelperLoaderManager::_loadViewFailHandler : loading view '+this.folder+this.view+"."+ConfManager.getInstance().get('viewFileExt')+' failed')
		this._loadRest();
	},
	
	/**
	 *
	 * */
	_loadViewReadyHandler: function(transport) {
		FwkTrace.writeMessage('M4_004');//'HelperLoaderManager::_loadViewReadyHandler : OK loading view ');
		
		var response = transport.responseText;
		this._moduleProperties.set('viewContent', response);
		this._addLoadedViewToDOM(response);
	},
	
	_addLoadedViewToDOM: function(viewContent) {
		var view = this._moduleProperties.get('addViewInId');
		if (elementExists(view)) {
			$(view).update(viewContent);
		} else {
			FwkTrace.writeError('M4_010',  view); //
		}
		this._loadRest();
	},
	
	///////////////////////// LOAD CONTROLLER ///////////////////////////////
	
	/**
	 *
	 * */
	_loadController : function() {
		if (!elementExists('js_'+this._moduleProperties.get('controllerHelper'))) {
			var file = this._getFileName('controllerHelper');
			FwkTrace.writeMessage('M4_007', file);
			
			var scriptLoader = new ScriptLoader(file, this._moduleProperties.get('controllerHelper'));
			scriptLoader.addEventListener(Event.COMPLETE, this._controllerLoadHandler.bind(this));
			scriptLoader.addEventListener(IOErrorEvent.IO_ERROR, this._controllerLoadErrorHandler.bind(this));
			scriptLoader.load();
		} else {
			this._loadModel();
		}
	},
	
	/**
	 *http://localhost/navx_projects/Dynamite/js/Test/index.php
	 * */
	_controllerLoadHandler: function(event) {
		this._loadModel();
	},
	
	/**
	 *
	 * */
	_controllerLoadErrorHandler: function(event) {
		FwkTrace.writeError('M4_005');//'HelperLoaderManager::_controllerLoadErrorHandler : Unable to load controllerHelper')
	},
	
	///////////////////////// LOAD MODEL ///////////////////////////////
	
	/**
	 *
	 * */
	_loadModel : function() {
		if (!elementExists('js_'+this._moduleProperties.get('modelHelper'))) {
			var file = this._getFileName('modelHelper');
		
			var scriptLoader = new ScriptLoader(file, this._moduleProperties.get('modelHelper'));
			scriptLoader.addEventListener(Event.COMPLETE, this._modelLoadHandler.bind(this));
			scriptLoader.addEventListener(IOErrorEvent.IO_ERROR, this._modelLoadErrorHandler.bind(this));
			scriptLoader.load();
		} else {
			this._ready();
		}	
	},
	
	/**
	 *
	 * */
	_modelLoadHandler: function(event) {
		this._ready();
	},
	
	/**
	 *
	 * */
	_modelLoadErrorHandler: function(event) {
		FwkTrace.writeError('M4_008');//'HelperLoaderManager::_modelLoadErrorHandler : Unable to load modelHelper')
	},
	
	///////////////////////// LOAD COMPRESSED ///////////////////////////////
	
	/**
	 *
	 * */
	_loadCompressed: function() {
		if (!elementExists('js_'+this._moduleProperties.get('modelHelper'))) {
			var scriptLoader = new ScriptLoader(this._getFileName(), this._moduleProperties.get('modelHelper'));
			scriptLoader.addEventListener(Event.COMPLETE, this._compressedLoadHandler.bind(this));
			scriptLoader.addEventListener(IOErrorEvent.IO_ERROR, this._compressedLoadErrorHandler.bind(this));
			scriptLoader.load()
		} else {
			this._ready();
		}	
	},
	
	/**
	 *
	 * */
	_compressedLoadHandler: function(event) {
		this._ready();
	}, 
	
	/**
	 *
	 * */
	_compressedLoadErrorHandler: function(event) {
		FwkTrace.writeError('M4_009'); // HelperLoaderManager::_compressedLoadErrorHandler : load compressed file failed
	},
	
	
	///////////////////////// OTHERS ///////////////////////////////
	
	/**
	 *
	 * */
	_getFileName: function(name) {
		var file = "";
		if (name == undefined) 
			file = ConfManager.getInstance().get('compressedName');
		else 
			file = this._moduleProperties.get(name);
			
		return this._moduleProperties.get('folder')+file+".js?v="+this._moduleProperties.get('version');
	},
	
	/**
	 *
	 * */
	_loadRest: function() {
		if (ConfManager.getInstance().get('useDynCompression') == false || this._moduleProperties.get('autoExtract') == false) {
			if (!this._moduleProperties.get('compressed')) {
				this._loadController();
			} else {
				this._loadCompressed();
			}
		} else {
			this._ready();
		}
	},
		
	/**
	 *
	 * */
	_ready: function() {
		this.dispatchEvent(WZEvent.READY);
	}
});
	
/**
 * Singleton
 * */
SingletonUtil.execute(HelperLoaderManager);